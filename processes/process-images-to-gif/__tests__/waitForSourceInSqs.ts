import {SQS} from "aws-sdk";
import pRetry from "p-retry";

export const waitForMessagesInSqs = async (sqs: SQS, queueUrl: string): Promise<SQS.MessageList> => {
  let messages: SQS.MessageList = [];
  await pRetry(async () => {
    const { Messages } = await sqs.receiveMessage({ QueueUrl: queueUrl }).promise();

    expect(Messages).toBeDefined();
    expect(Messages!.length).toBeGreaterThanOrEqual(1);
    messages = Messages!;
  }, { retries: 5 });

  return messages;
};
