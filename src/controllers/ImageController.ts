import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../core/ApiError";
import { SuccessResponse } from "../core/ApiResponse";
import CloudflareR2ObjectService from "../services/CloudflareR2ObjectService";

class ImageController {
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        throw new BadRequestError("Please upload a file");
      }
      const url = await CloudflareR2ObjectService.uploadFile(file);
      new SuccessResponse("Image uploaded successfully", { url }).send(res);
    } catch (error) {
      next(error);
    }
  }

  async getImage(req: Request, res: Response, next: NextFunction) {
    try {
      const key = req.params.key;
      const url = await CloudflareR2ObjectService.getFile(key);
      res.redirect(url);
    } catch (error) {
      next(error);
    }
  }
}

export default new ImageController();
