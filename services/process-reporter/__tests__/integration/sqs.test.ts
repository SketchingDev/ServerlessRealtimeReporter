import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { CloudFormation, SQS } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { CreateProcessCommand } from "../../src/commands/createProcessCommand";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { and, hasProcessId, waitForProcessInAppSync } from "../waitForProcessInAppSync";

jest.setTimeout(20 * 1000);

describe("SQS deployment", () => {
  const region = "us-east-1";
  const stackName = "process-reporter-test";

  let client: AWSAppSyncClient<any>;
  const sqs = new SQS({ region });
  let queueUrl: string;

  let createProcessCommand: Readonly<CreateProcessCommand>;

  beforeAll(async () => {
    const outputs = await extractServiceOutputs(new CloudFormation({ region, apiVersion: "2010-05-15" }), stackName);

    const queueName = outputs.queueName!;
    queueUrl = (await sqs.getQueueUrl({ QueueName: queueName }).promise()).QueueUrl!;

    client = new AWSAppSyncClient({
      auth: {
        type: AUTH_TYPE.API_KEY,
        apiKey: outputs.graphQl.key!,
      },
      region,
      url: outputs.graphQl.url!,
      disableOffline: true,
    });
  });

  beforeEach(() => {
    createProcessCommand = {
      id: uuidv4(),
      name: uuidv4(),
      timestamp: new Date().getTime(),
    };
  });

  test("process created is returned in getAllProcessesQuery", async () => {
    await sqs
      .sendMessage({
        MessageBody: JSON.stringify({ ...createProcessCommand }),
        QueueUrl: queueUrl,
      })
      .promise();

    const process = await waitForProcessInAppSync(client, and(hasProcessId(createProcessCommand.id)));
    expect(process).toMatchObject({
      __typename: "Process",
      id: createProcessCommand.id,
      name: createProcessCommand.name,
      timestamp: createProcessCommand.timestamp,
    });
  });
});
