import { NextFunction, Request, Response, Router } from "express";
import { InternalErrorResponse, SuccessResponse } from "../core/ApiResponse";
import imageRouter from "./imageRouter";
import csvProcesserRouter from "./csvProcesserRouter";
import Logger from "../core/Logger";

const router = Router();

router.use("/images", imageRouter);
router.use(csvProcesserRouter);

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

router.post("/webhook", (req: Request, res: Response, next: NextFunction) => {
  try {
    Logger.info("Webhook Body", req.body);

    // Simulate a failure in 50% of requests
    if (Math.random() > 0.5) {
      Logger.info("❌ Simulating failure...");
      return new InternalErrorResponse("Simulated failure").send(res);
    }

    return new SuccessResponse("Webhook processed successfully", {
      data: req.body,
    }).send(res);
  } catch (error) {
    next(error);
  }
});

export default router;
