import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import Logger from "./core/Logger";
import { logging } from "./middleware/logging";
import {
  ApiError,
  ErrorType,
  InternalError,
  NotFoundError,
} from "./core/ApiError";
import { environment } from "./config/config";
import router from "./routes";

process.on("unhandledRejection", (e) => {
  Logger.error(e);
});

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(
  express.urlencoded({ extended: true, limit: "10mb", parameterLimit: 50000 })
);

app.use(logging);

app.use(router);

// catch 404 and forward to error handler
app.use((req, res, next) => next(new NotFoundError()));

// Middleware to handle errors
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    if (err.type === ErrorType.INTERNAL)
      Logger.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
    return;
  }
  Logger.error(
    `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  Logger.error(err);
  if (environment === "development") {
    return res.status(500).send(err);
  }
  ApiError.handle(new InternalError(), res);
});

export default app;
