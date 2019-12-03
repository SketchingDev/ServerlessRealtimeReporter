// // @ts-ignore
// import laconia = require("@laconia/core");
// import AWSAppSyncClient from "aws-appsync/lib";
// import { S3CreateEvent, SQSEvent } from "aws-lambda";
// import { app } from "../../handler";
//
// test("Handler reports that the process has started", async () => {
//   // const mockAppSync = {
//   //   mutate: jest.fn(),
//   // };
//
//   // const source: Source = { id: "test-id", name: "test-name", timestamp: 123 };
//   // const sqsEvent: SQSEvent = {
//   //   Records: [
//   //     {
//   //       attributes: {
//   //         ApproximateFirstReceiveTimestamp: "",
//   //         ApproximateReceiveCount: "",
//   //         SenderId: "",
//   //         SentTimestamp: "",
//   //       },
//   //       awsRegion: "",
//   //       eventSource: "",
//   //       eventSourceARN: "",
//   //       md5OfBody: "",
//   //       messageAttributes: {},
//   //       messageId: "",
//   //       receiptHandle: "",
//   //       body: JSON.stringify(source),
//   //     },
//   //   ],
//   // };
//
//   // const event: S3CreateEvent = { Records: [{
//   //     eventName: "",
//   //     eventTime: "",
//   //     s3: {
//   //       bucket: { arn: "", name: "", ownerIdentity: { principalId: "" } },
//   //       configurationId: "",
//   //       object: { eTag: "", key: "", sequencer: "", size: 0 },
//   //       s3SchemaVersion: ""
//   //     }
//   //   }] };
//
//   // const abc = createHandler(mockAppSync as any);
//   // await abc(sqsEvent, {} as any, jest.fn());
//
//   // expect(mockAppSync.mutate).toHaveBeenCalledWith({
//   //   variables: {
//   //     id: source.id,
//   //     name: source.name,
//   //     timestamp: source.timestamp,
//   //   },
//   //   mutation: createSource,
//   //   fetchPolicy: "no-cache",
//   // });
// });
//
// // const createHandler = (appSync: AWSAppSyncClient<any>) => laconia(app).register(() => ({ appSync }));
