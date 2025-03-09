import prisma from "../../utils/prismaClient";
import { webhookQueue } from "../../queues/webhookQueue";
import { Status } from ".prisma/client";

export const sendWebhookEvent = async (
  requestId: string,
  event: Status,
  error: any
) => {
  const webhookUrl = await prisma.webhook.findFirst({
    where: { requestId: requestId },
    select: { url: true },
  });
  webhookUrl?.url &&
    webhookQueue.add(requestId, {
      requestId,
      event,
      url: webhookUrl.url,
      attempt: 1,
      ...(error && {
        error: error.toString() + " : " + JSON.stringify(error.cause),
      }),
    });
};
