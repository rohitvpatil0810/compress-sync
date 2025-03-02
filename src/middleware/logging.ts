import { NextFunction, Request, Response } from "express";
import Logger from "../core/Logger";

export const logging = (req: Request, res: Response, next: NextFunction) => {
  try {
    Logger.info(
      `${new Date().toISOString()} - ${req.method} - ${req.originalUrl} - ${
        req.ip
      }`
    );
    next();
  } catch (error) {
    Logger.error("Error in logging middleware : ", error);
    next(error);
  }
};
