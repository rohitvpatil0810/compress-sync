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

    return { requestId: request.id, status: request.status };
  }
}

export default new CSVProcessorService();
