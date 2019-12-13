// @ts-ignore
import laconia = require("@laconia/core");
import AWSAppSyncClient from "aws-appsync/lib";
import { SQSEvent } from "aws-lambda";
import { app } from "../../handler";
import { CreateProcessCommand } from "../../src/commands/createProcessCommand";
import { createProcessMutation } from "../../src/graphql/createProcessMutation";

test("Handler passes process to GraphQl mutation", async () => {
  const mockAppSync = {
    mutate: jest.fn(),
  };

  const createProcessCommand: CreateProcessCommand = { id: "test-id", name: "test-name", timestamp: 123 };
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
        body: JSON.stringify(createProcessCommand),
      },
    ],
  };

  const handler = createHandler(mockAppSync as any);
  await handler(sqsEvent, {} as any, jest.fn());

  expect(mockAppSync.mutate).toHaveBeenCalledWith({
    variables: {
      id: createProcessCommand.id,
      name: createProcessCommand.name,
      timestamp: createProcessCommand.timestamp,
    },
    mutation: createProcessMutation,
    fetchPolicy: "no-cache",
  });
});

const createHandler = (appSync: AWSAppSyncClient<any>) => laconia(app).register(() => ({ appSync }));
