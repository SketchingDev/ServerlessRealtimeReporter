// @ts-ignore
import laconia = require("@laconia/core");
import AWSAppSyncClient from "aws-appsync/lib";
import { SQSEvent } from "aws-lambda";
import { app } from "../../handler";
import { createSource } from "../../src/graphql/createSource";
import { Source } from "../../src/source";

test("Handler passes source to GraphQl mutation", async () => {
  const mockAppSync = {
    mutate: jest.fn(),
  };

  const source: Source = { id: "test-id", name: "test-name", timestamp: 123 };
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
        body: JSON.stringify(source),
      },
    ],
  };

  const abc = createHandler(mockAppSync as any);
  await abc(sqsEvent, {} as any, jest.fn());

  expect(mockAppSync.mutate).toHaveBeenCalledWith({
    variables: {
      id: source.id,
      name: source.name,
      timestamp: source.timestamp,
    },
    mutation: createSource,
    fetchPolicy: "no-cache",
  });
});

const createHandler = (appSync: AWSAppSyncClient<any>) => laconia(app).register(() => ({ appSync }));
