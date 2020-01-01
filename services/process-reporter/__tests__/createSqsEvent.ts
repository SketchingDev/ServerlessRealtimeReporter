import { SQSEvent, SQSRecord } from "aws-lambda";

export const createSqsEvent = (bodies: any[] | any): SQSEvent => ({
  Records: [].concat(bodies).map(
    (body): SQSRecord => ({
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
      body: JSON.stringify(body),
    }),
  ),
});
