import { Worker } from "bullmq";
import { redisConfig } from "../../config/redis";
import prisma from "../../utils/prismaClient";
import axios, { AxiosError } from "axios";
import Logger from "../../core/Logger";
import { Status, WebhookStatus } from ".prisma/client";
import { webhookQueue } from "../../queues/webhookQueue";

const webhookProcessorWorker = new Worker(
  "webhook-queue",
  async (job) => {
    const { requestId, event, url, attempt, error } = job.data;

    try {
      const response = await axios.post(url, {
        requestId,
        event,
        ...(error && { error }),
      });
      if (response.status === 200) {
        await prisma.webhook.update({
          where: { requestId },
          data: {
            status: Status.COMPLETED,
            event,
            responseStatus: response.status,
            response: JSON.stringify(response.data),
            attempts: attempt,
          },
        });
        Logger.info(
          `Webhook event completed (requestId: ${requestId}) : (attempt: ${attempt})`
        );
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        error = error.response?.data;
      }
      Logger.error(
        `Webhook event rejected (requestId: ${requestId}) : (attempt: ${attempt})`,
        JSON.stringify(error)
      );
      if (attempt <= 5) {
        Logger.info(
          `Retrying webhook event (requestId: ${requestId}) : (attempt: ${
            attempt + 1
          })`
        );
        await prisma.webhook.update({
          where: { requestId },
          data: {
            status: WebhookStatus.RETRYING,
            event,
            response: JSON.stringify(error),
            ...(error instanceof AxiosError && {
              responseStatus: error.response?.status,
            }),
            attempts: attempt + 1,
          },
        });
        webhookQueue.add(requestId, {
          requestId,
          event,
          url,
          attempt: attempt + 1,
          error,
        });
        return;
      }
      Logger.info(
        `Webhook event failed (requestId: ${requestId}) with maxRetries`
      );
      try {
        await prisma.webhook.update({
          where: { requestId },
          data: {
            status: Status.FAILED,
            event,
            attempts: attempt,
          },
        });
      } catch (error) {
        Logger.error(
          `Error updating webhook status (requestId: ${requestId}): ${error}`
        );
      }
    }
  },
  {
    connection: redisConfig,
    concurrency: 5,
  }
);

Logger.info("Webhook Worker started");
