import { SQS } from "aws-sdk";
import pRetry from "p-retry";

export const waitForMessagesInSqs = async (
  sqs: SQS,
  queueUrl: string,
  expectedAmount: number,
): Promise<SQS.MessageList> => {
  const messages: SQS.MessageList = [];
  await pRetry(
    async () => {
      const { Messages } = await sqs.receiveMessage({ QueueUrl: queueUrl }).promise();
      expect(Messages).toBeDefined();

      Messages!.forEach(m => messages.push(m));
      expect(messages.length).toBeGreaterThanOrEqual(expectedAmount);
    },
    { retries: 5 },
  );

  return messages;
};
