import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";
import Logger from "../core/Logger";

export const csvProcessorQueue = new Queue("csv-processing-queue", {
  connection: redisConfig,
});
