import { CloudFormation, S3, SQS } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { waitForMessagesInSqs } from "../waitForSourceInSqs";

const jestTimeout = 40 * 1000;
const sqsRetryTimeout = jestTimeout - 4 * 1000;
jest.setTimeout(jestTimeout);

describe("S3 deployment", () => {
  const queueNameCloudFormationOutputKey = "QueueName";
  const bucketNameCloudFormationOutputKey = "BucketName";

  const region = "us-east-1";
  const stackName = "example-process-test";

  const sqs = new SQS({ region });
  const s3 = new S3({ region });

  let queueUrl: string | undefined;
  let bucketName: string | undefined;

  const objectsCreated: string[] = [];

  beforeAll(async () => {
    const outputs = await extractServiceOutputs(new CloudFormation({ region, apiVersion: "2010-05-15" }), {
      stackName,
      outputsToExtract: [queueNameCloudFormationOutputKey, bucketNameCloudFormationOutputKey],
    });

    const queueName = outputs.get(queueNameCloudFormationOutputKey);
    queueUrl = (await sqs.getQueueUrl({ QueueName: queueName! }).promise()).QueueUrl!;
    bucketName = outputs.get(bucketNameCloudFormationOutputKey);
  });

  afterAll(async () => {
    // await sqs.purgeQueue({ QueueUrl: queueUrl! }).promise();
    const objects = { Objects: objectsCreated.map(o => ({ Key: o })) };
    await s3.deleteObjects({ Bucket: bucketName!, Delete: objects }).promise();
  });

  test("source created is returned in getAllProcessesQuery", async () => {
    const objectKey = uuidv4();
    objectsCreated.push(objectKey);

    await s3.putObject({ Bucket: bucketName!, Key: objectKey, Body: "TestBody" }).promise();

    await waitForMessagesInSqs(
      sqs,
      queueUrl!,
      (messages: SQS.MessageList) => {
        const parsedBodies = messages.map(({ Body }) => JSON.parse(Body!));
        expect(parsedBodies).toMatchObject(
          expect.arrayContaining([
            {
              commandType: "create-process",
              id: expect.any(String),
              name: expect.any(String),
              createdTimestamp: expect.any(Number),
            },
          ]),
        );
      },
      sqsRetryTimeout,
    );
  });
});
