import { Worker } from "bullmq";
import { redisConfig } from "../../config/redis";
import prisma from "../../utils/prismaClient";
import axios from "axios";
import Logger from "../../core/Logger";
import csv from "csv-parser";
import { csvSchema } from "./csvValidations";
import { Status } from ".prisma/client";
import { imageCompressorQueue } from "../../queues/imageCompressorQueue";
import CloudflareR2ObjectService from "../../services/CloudflareR2ObjectService";
import { sendWebhookEvent } from "../webhook-worker/sendWebhookEvent";

interface CSVRow {
  serialNumber: number;
  productName: string;
  inputImageUrls: string[];
}

const csvProcessorWorker = new Worker(
  "csv-processing-queue",
  async (job) => {
    const requestId = job.data.requestId;
    await parseCSVFileAndSaveDataToDB(requestId);
  },
  {
    connection: redisConfig,
    concurrency: 5,
  }
);

const parseCSVFileAndSaveDataToDB = async (requestId: string) => {
  try {
    let request = await prisma.request.update({
      where: { id: requestId },
      data: {
        status: Status.IN_PROGRESS,
      },
      select: {
        fileUrl: true,
      },
    });

    if (!request.fileUrl) {
      throw new Error("File not found");
    }
    const file = await axios.get(request.fileUrl, { responseType: "stream" });

    const records: CSVRow[] = [];
    const errors: any[] = [];

    await new Promise((resolve, reject) => {
      file.data
        .pipe(csv())
        .on("data", async (row: any) => {
          const result = csvSchema.safeParse({
            serialNumber: Number(row["S. No."]),
            productName: row["Product Name"],
            inputImageUrls: row["Input Image Urls"],
          });

          if (result.success) {
            records.push({
              ...result.data,
              inputImageUrls: result.data.inputImageUrls.split(","),
            });
          } else {
            errors.push({ row, error: result.error.format() });
          }
        })
        .on("end", resolve)
        .on("error", (error: Error) => {
          reject(error);
        });
    });

    // Log validation errors (if any)
    if (errors.length > 0) {
      Logger.error(`Validation Errors (requestId : ${requestId}) :`, errors);
      throw Error("Validation Errors", { cause: errors });
    }

    Logger.info(
      `CSV parsing completed (requestId : ${requestId}) : ${records.length} records parsed. Saving valid records to MongoDB...`
    );

    // Save valid records to MongoDB
    records.map(async (record) => {
      await prisma.product.create({
        data: {
          srNo: record.serialNumber,
          name: record.productName,
          requestId,
          images: {
            createMany: {
              data: record.inputImageUrls.map((url) => ({ inputURL: url })),
            },
          },
        },
      });
    });

    Logger.info(`${records.length} records saved to MongoDB`);

    Logger.info(
      `Deleting CSV file froom cloudflare (requestId : ${requestId})...`
    );
    await CloudflareR2ObjectService.deleteFile(
      request.fileUrl.split("/").pop() || ""
    );

    Logger.info(
      `Sending request to image compressor queue (requestId : ${requestId})...`
    );
    imageCompressorQueue.add(requestId, { requestId: requestId });
  } catch (error: Error | any) {
    Logger.error(
      `Error in saveCSVFileDataToDB (reqeustId : ${requestId}): `,
      error
    );
    try {
      const request = await prisma.request.update({
        where: { id: requestId },
        data: {
          status: Status.FAILED,
          error: error.toString() + " : " + JSON.stringify(error.cause),
        },
        select: {
          fileUrl: true,
        },
      });
      await CloudflareR2ObjectService.deleteFile(
        request.fileUrl!.split("/").pop() || ""
      );
      await sendWebhookEvent(requestId, Status.FAILED, error);
    } catch (error) {
      Logger.error(
        `Error in updating request status to failed (requestId : ${requestId}): `,
        error
      );
    }
  }
};

Logger.info("CSV Processor Worker started");
