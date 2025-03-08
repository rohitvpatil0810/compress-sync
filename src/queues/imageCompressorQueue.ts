import { Queue } from "bullmq";
import { redisConfig } from "../config/redis";

export const imageCompressorQueue = new Queue("image-compressor-queue", {
  connection: redisConfig,
});
