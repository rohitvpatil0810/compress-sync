import { Worker } from "bullmq";
import { redisConfig } from "../../config/redis";
import prisma from "../../utils/prismaClient";
import axios from "axios";
import Logger from "../../core/Logger";
import { Status } from ".prisma/client";
import sharp from "sharp/lib";
import CloudflareR2ObjectService from "../../services/CloudflareR2ObjectService";
import * as mime from "mime-types";

const imageCompressorWorker = new Worker(
  "image-compressor-queue",
  async (job) => {
    try {
      const requestId = job.data.requestId;
      Logger.info(`Processing request ${job.data.reqeustId}...`);

      const request = await prisma.request.update({
        where: { id: requestId },
        data: {
          status: Status.IN_PROGRESS,
        },
        select: {
          products: {
            include: {
              images: true,
            },
          },
        },
      });

      await Promise.all(
        request.products.map(async (product) => {
          await Promise.all(
            product.images.map(async (image) => {
              await compressImage(image.id, image.inputURL);
            })
          );
        })
      );

      await prisma.request.update({
        where: { id: requestId },
        data: {
          status: Status.COMPLETED,
        },
      });

      Logger.info(`Request ${requestId} completed.`);
    } catch (error) {
      Logger.error(`Error processing request ${job.data.reqeustId}: ${error}`);
    }
  },
  {
    connection: redisConfig,
    concurrency: 10,
  }
);

const compressImage = async (id: string, imageUrl: string) => {
  try {
    Logger.info(`Compressing image ${id}...`);
    const image = await axios.get(imageUrl, { responseType: "arraybuffer" });
    const imageBuffer = Buffer.from(image.data);

    const metadata = await sharp(imageBuffer).metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("Unable to read image dimensions.");
    }

    const compressedImageBuffer = await sharp(imageBuffer)
      .resize(Math.floor(metadata.width / 2), Math.floor(metadata.height / 2))
      .toBuffer();

    const filename = imageUrl.split("/").pop() || "sample.jpg";

    Logger.info(`Uploading compressed image ${id}...`);
    const outputFileURL = await CloudflareR2ObjectService.uploadFileFromBuffer(
      compressedImageBuffer,
      filename,
      mime.lookup(filename) || "application/octet-stream"
    );
    Logger.info(`Compressed image ${id} uploaded successfully.`);

    Logger.info(`Updating image ${id}...`);

    await prisma.image.update({
      where: { id },
      data: {
        outputURL: outputFileURL,
        status: Status.COMPLETED,
      },
    });

    Logger.info(`Image ${id} compressed successfully.`);
  } catch (error) {
    Logger.error(`Error in image compressor worker $: ${id}`, error);
  }
};

Logger.info("Image Compressor Worker started");
