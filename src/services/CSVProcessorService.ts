import { Status } from ".prisma/client";
import { BadRequestError } from "../core/ApiError";
import { csvProcessorQueue } from "../queues/csvProcessorQueue";
import prisma from "../utils/prismaClient";
import CloudflareR2ObjectService from "./CloudflareR2ObjectService";
import json2csv from "json2csv";
class CSVProcessorService {
  async uploadCSV(file: Express.Multer.File) {
    const csvFileUrl = await CloudflareR2ObjectService.uploadFile(file);

    const request = await prisma.request.create({
      data: {
        fileUrl: csvFileUrl,
      },
    });

    csvProcessorQueue.add(request.id, { requestId: request.id });

    return { requestId: request.id, status: request.status };
  }

  async getStatus(requestId: string) {
    try {
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        select: {
          status: true,
          error: true,
        },
      });

      if (!request) {
        throw new BadRequestError("Request not found");
      }

      return {
        status: request.status,
        ...(request.error && { error: request.error }),
      };
    } catch (error) {
      throw error;
    }
  }

  async downloadOutputCSV(requestId: string) {
    try {
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        select: {
          status: true,
          products: {
            include: {
              images: true,
            },
          },
        },
      });

      if (!request) {
        throw new BadRequestError("Request not found");
      }

      if (request?.status !== Status.COMPLETED) {
        return {
          message: "Request is not completed yet. Please try again later.",
          status: request?.status,
        };
      }

      const csvData = request.products
        .map((product) => {
          return {
            "S. No.": product.srNo,
            "Product Name": product.name,
            "Input Image Urls": product.images
              .map((image) => image.inputURL)
              .join(","),
            "Output Image Urls": product.images
              .map((image) => image.outputURL)
              .join(","),
          };
        })
        .sort((a, b) => Number(a["S. No."]) - Number(b["S. No."]));

      const csv = json2csv.parse(csvData);

      return csv;
    } catch (error) {
      throw error;
    }
  }
}

export default new CSVProcessorService();
