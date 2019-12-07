// @ts-ignore
import laconia = require("@laconia/core");
import { SQS } from "aws-sdk";
import { app } from "../../handler";
import { ProgressReporter, SqsProgressReporter } from "../../src/SqsProgressReporter";

test("Handler reports that the process has started", async () => {
  const sqs: jest.Mocked<SQS> = {
    sendMessage: jest.fn().mockImplementation(() => ({ promise: () => Promise.resolve() }))
  } as any;

  const handler = createHandler(new SqsProgressReporter(sqs, "queueUrl"));
  await handler({} as any, {} as any, jest.fn());

  expect(sqs.sendMessage).toHaveBeenCalledTimes(1);

  const { MessageBody }: SQS.Types.SendMessageRequest = sqs.sendMessage.mock.calls[0][0] as any;
  expect(JSON.parse(MessageBody)).toMatchObject({
    id: expect.any(String),
    name: "Download 0 images",
    timestamp: expect.any(Number),
  });
});

const createHandler = (progressReporter: ProgressReporter) => laconia(app).register(() => ({ progressReporter }));
