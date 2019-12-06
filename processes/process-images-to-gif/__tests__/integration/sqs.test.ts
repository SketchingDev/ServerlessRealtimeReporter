import { CloudFormation, Lambda, SQS } from "aws-sdk";
import "isomorphic-fetch";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { waitForMessagesInSqs } from "../waitForSourceInSqs";

jest.setTimeout(20000);

describe("SQS deployment", () => {
  const queueNameCloudFormationOutputKey = "QueueName";
  const lambdaArnCloudFormationOutputKey = "ImageDownloaderLambdaFunctionQualifiedArn";

  const region = "us-east-1";
  const stackName = "process-images-to-gif-test";

  const lambda = new Lambda({ region });
  const sqs = new SQS({ region });

  let queueUrl: string | undefined;
  let lambdaArn: string | undefined;

  beforeAll(async () => {
    const outputs = await extractServiceOutputs(
      new CloudFormation({ region, apiVersion: "2010-05-15" }),
      {
        stackName,
        outputsToExtract: [queueNameCloudFormationOutputKey, lambdaArnCloudFormationOutputKey],
      },
    );

    const queueName = outputs.get(queueNameCloudFormationOutputKey);
    queueUrl = (await sqs.getQueueUrl({ QueueName: queueName! }).promise()).QueueUrl!;
    lambdaArn = outputs.get(lambdaArnCloudFormationOutputKey);
  });

  // beforeEach(async () => {
    // await sqs.purgeQueue({ QueueUrl: queueUrl! }).promise();
  // });

  test("source created is returned in getAllSources", async () => {
    await lambda
      .invoke({
        FunctionName: lambdaArn!,
        Payload: "",
      })
      .promise();

    const messages = await waitForMessagesInSqs(sqs, queueUrl!);
    expect(messages).toBeDefined();

    const parsedBodies = messages.map(({Body}) => JSON.parse(Body!));
    expect(parsedBodies).toMatchObject(expect.arrayContaining([{
        id: "Download 0 images",
        name: "Download 0 images",
        timestamp: expect.any(Number),
      }])
      );
  });
});

