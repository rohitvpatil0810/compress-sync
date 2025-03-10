import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";

export const csvProcessorQueue = new Queue("csv-processing-queue", {
  connection: redisConfig,
});
