import { SQS } from "aws-sdk";
import pRetry from "p-retry";

export const waitForMessagesInSqs = async (
  sqs: SQS,
  queueUrl: string,
  expectation: (messages: SQS.MessageList) => void,
  timeoutInMs: number,
): Promise<SQS.MessageList> => {
  const messages: SQS.MessageList = [];
  await pRetry(
    async () => {
      const { Messages } = await sqs.receiveMessage({ QueueUrl: queueUrl }).promise();
      expect(Messages).toBeDefined();

      Messages!.forEach(m => messages.push(m));
      expectation(messages);
    },
    {
      maxRetryTime: timeoutInMs,
      retries: 100,
      factor: 1,
      onFailedAttempt: () => console.error("Messages not found in queue. Retrying..."),
    },
  );

  return messages;
};
