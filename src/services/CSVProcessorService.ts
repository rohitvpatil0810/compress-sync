import { BadRequestError } from "../core/ApiError";
import { csvProcessorQueue } from "../queues/csvProcessorQueue";
import prisma from "../utils/prismaClient";
import CloudflareR2ObjectService from "./CloudflareR2ObjectService";

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
}

export default new CSVProcessorService();
