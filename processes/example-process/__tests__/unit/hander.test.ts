// @ts-ignore
import laconia = require("@laconia/core");
import { SQS } from "aws-sdk";
import { app, AppDependencies } from "../../handler";
import { SqsProgressReporter } from "../../src/SqsProgressReporter";

test("Handler reports that the process has started", async () => {
  const sqs: jest.Mocked<SQS> = {
    sendMessage: jest.fn().mockImplementation(() => ({ promise: () => Promise.resolve() })),
  } as any;

  const handler = createHandler(new SqsProgressReporter(sqs, "queueUrl"));
  await handler({} as any, {} as any, jest.fn());

  expect(sqs.sendMessage).toHaveBeenCalledTimes(3);

  const createProcessCall: SQS.Types.SendMessageRequest = sqs.sendMessage.mock.calls[0][0] as any;
  expect(JSON.parse(createProcessCall.MessageBody)).toStrictEqual({
    commandType: "create-process",
    id: expect.any(String),
    name: "Download 1 images",
    createdTimestamp: expect.any(Number),
  });

  const createTaskCall: SQS.Types.SendMessageRequest = sqs.sendMessage.mock.calls[1][0] as any;
  expect(JSON.parse(createTaskCall.MessageBody)).toStrictEqual({
    commandType: "create-task",
    id: expect.any(String),
    name: "Downloading image 1",
    processId: expect.any(String),
    createdTimestamp: expect.any(Number),
  });
});

const createHandler = (progressReporter: SqsProgressReporter) =>
  laconia(app).register(
    (): AppDependencies => ({
      progressReporter,
      randomIntGenerator: () => 1,
      runAfterInterval: (_: number, func: () => Promise<void>) => func(),
    }),
  );
