import { NextFunction, Request, Response, Router } from "express";
import { SuccessResponse } from "../core/ApiResponse";

const router = Router();

router.get("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = {
      description:
        "CompressSync is an asynchronous image processing system that extracts image data from CSV files, compresses images by 50%, and stores the processed results. It supports API-based status tracking and webhook integration for seamless automation.",
    };
    return new SuccessResponse("Welcome to Compress Sync API", data).send(res);
  } catch (error) {
    next(error);
  }
});

export default router;
