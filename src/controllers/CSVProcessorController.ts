import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../core/ApiError";
import CSVProcessorService from "../services/CSVProcessorService";
import { SuccessResponse } from "../core/ApiResponse";

class CSVProcessorController {
  async uploadCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const csvFile = req.file;
      if (!csvFile) throw new BadRequestError("Please upload a file");
      if (csvFile.mimetype !== "text/csv")
        throw new BadRequestError("Invalid file type. Expected CSV File");

      const response = await CSVProcessorService.uploadCSV(csvFile);
      return new SuccessResponse(
        "CSV file is in queue for processing",
        response
      ).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.params.requestId;
      if (!requestId) throw new BadRequestError("Request Id is required");
      const response = await CSVProcessorService.getStatus(requestId);
      return new SuccessResponse("Status fetched successfully", response).send(
        res
      );
    } catch (error) {
      next(error);
    }
  }

  async downloadOutputCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const requestId = req.params.requestId;
      if (!requestId) throw new BadRequestError("Request Id is required");
      const response = await CSVProcessorService.downloadOutputCSV(requestId);
      if (typeof response === "string") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=output_${requestId}.csv`
        );
        return res.status(200).send(response);
      } else {
        return new SuccessResponse(
          "CSV file is in queue for processing",
          response
        ).send(res);
      }
    } catch (error) {
      next(error);
    }
  }
}

export default new CSVProcessorController();
