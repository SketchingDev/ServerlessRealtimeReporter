import { CloudFormation, Lambda, SQS } from "aws-sdk";
import "isomorphic-fetch";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { waitForMessagesInSqs } from "../waitForSourceInSqs";

jest.setTimeout(40 * 1000);

describe("SQS deployment", () => {
  const queueNameCloudFormationOutputKey = "QueueName";
  const lambdaArnCloudFormationOutputKey = "ExampleProcessLambdaFunctionQualifiedArn";
  const twoMessagesExpected = 2;

  const region = "us-east-1";
  const stackName = "example-process-test";

  const lambda = new Lambda({ region });
  const sqs = new SQS({ region });

  let queueUrl: string | undefined;
  let lambdaArn: string | undefined;

  beforeAll(async () => {
    const outputs = await extractServiceOutputs(new CloudFormation({ region, apiVersion: "2010-05-15" }), {
      stackName,
      outputsToExtract: [queueNameCloudFormationOutputKey, lambdaArnCloudFormationOutputKey],
    });

    const queueName = outputs.get(queueNameCloudFormationOutputKey);
    queueUrl = (await sqs.getQueueUrl({ QueueName: queueName! }).promise()).QueueUrl!;
    lambdaArn = outputs.get(lambdaArnCloudFormationOutputKey);
  });

  // beforeEach(async () => {
  // await sqs.purgeQueue({ QueueUrl: queueUrl! }).promise();
  // });

  test("source created is returned in getAllProcessesQuery", async () => {
    await lambda
      .invoke({
        FunctionName: lambdaArn!,
        Payload: "",
      })
      .promise();

    const messages = await waitForMessagesInSqs(sqs, queueUrl!, twoMessagesExpected);
    expect(messages).toBeDefined();

    const parsedBodies = messages.map(({ Body }) => JSON.parse(Body!));
    expect(parsedBodies).toMatchObject(
      expect.arrayContaining([
        {
          commandType: "create-process",
          id: expect.any(String),
          name:  expect.any(String),
          createdTimestamp: expect.any(Number),
        },
      ]),
    );
  });
});
