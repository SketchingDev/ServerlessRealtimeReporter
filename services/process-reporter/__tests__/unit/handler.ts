// @ts-ignore
import laconia = require("@laconia/core");
import AWSAppSyncClient from "aws-appsync/lib";
import { SQSEvent } from "aws-lambda";
import { app } from "../../handler";
import { createProcess } from "../../src/graphql/createProcess";
import { Process } from "../../src/process";

test("Handler passes process to GraphQl mutation", async () => {
  const mockAppSync = {
    mutate: jest.fn(),
  };

  const process: Process = { id: "test-id", name: "test-name", timestamp: 123 };
  const sqsEvent: SQSEvent = {
    Records: [
      {
        attributes: {
          ApproximateFirstReceiveTimestamp: "",
          ApproximateReceiveCount: "",
          SenderId: "",
          SentTimestamp: "",
        },
        awsRegion: "",
        eventSource: "",
        eventSourceARN: "",
        md5OfBody: "",
        messageAttributes: {},
        messageId: "",
        receiptHandle: "",
        body: JSON.stringify(process),
      },
    ],
  };

  const handler = createHandler(mockAppSync as any);
  await handler(sqsEvent, {} as any, jest.fn());

  expect(mockAppSync.mutate).toHaveBeenCalledWith({
    variables: {
      id: process.id,
      name: process.name,
      timestamp: process.timestamp,
    },
    mutation: createProcess,
    fetchPolicy: "no-cache",
  });
});

const createHandler = (appSync: AWSAppSyncClient<any>) => laconia(app).register(() => ({ appSync }));
