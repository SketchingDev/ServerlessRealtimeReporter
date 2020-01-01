import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { CloudFormation, SQS } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { CreateProcessCommand } from "../../src/commands/createProcess/createProcessCommand";
import { CreateTaskCommand } from "../../src/commands/createTask/createTaskCommand";
import { UpdateTaskCommand } from "../../src/commands/updateTask/updateTaskCommand";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { and, hasTaskId, hasTaskStatus, waitForProcessInAppSync } from "../waitForProcessInAppSync";

const jestTimeout = 30 * 1000;
const appSyncRetryTimeout = jestTimeout - 4 * 1000;
jest.setTimeout(jestTimeout);

describe("Create/Update Tasks", () => {
  const region = "us-east-1";
  const stackName = "process-reporter-test";

  // let lambdaArn: string | undefined;
  // const lambda = new Lambda({ region });
  const sqs = new SQS({ region });
  let queueUrl: string;

  let client: AWSAppSyncClient<any>;

  let createProcessCommand: Readonly<CreateProcessCommand>;
  let createTaskCommand: Readonly<CreateTaskCommand>;

  beforeAll(async () => {
    const outputs = await extractServiceOutputs(new CloudFormation({ region, apiVersion: "2010-05-15" }), stackName);
    // lambdaArn = outputs.lambda.arn;

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

  beforeEach(async () => {
    createProcessCommand = {
      commandType: "create-process",
      id: uuidv4(),
      name: uuidv4(),
      createdTimestamp: Date.now(),
    };

    createTaskCommand = {
      commandType: "create-task",
      createdTimestamp: Date.now(),
      id: uuidv4(),
      name: uuidv4(),
      processId: createProcessCommand.id,
    };
  });

  test("Tasks can be created for a process", async () => {
    await sqs
      .sendMessageBatch({
        Entries: [
          { Id: uuidv4(), MessageBody: JSON.stringify(createProcessCommand) },
          { Id: uuidv4(), MessageBody: JSON.stringify(createTaskCommand) },
        ],
        QueueUrl: queueUrl,
      })
      .promise();
    const process = await waitForProcessInAppSync(
      client,
      createProcessCommand.id,
      appSyncRetryTimeout,
      hasTaskId(createTaskCommand.id),
    );
    expect(process).toStrictEqual({
      __typename: "Process",
      id: createProcessCommand.id,
      name: createProcessCommand.name,
      created: createProcessCommand.createdTimestamp,
      tasks: [
        {
          __typename: "Task",
          created: createTaskCommand.createdTimestamp,
          failureReason: null,
          id: createTaskCommand.id,
          name: createTaskCommand.name,
          processId: createProcessCommand.id,
          status: "PENDING",
          updated: createTaskCommand.createdTimestamp,
        },
      ],
    });
  });

  test("Tasks can be updated", async () => {
    const updateTaskCommand: UpdateTaskCommand = {
      commandType: "update-task",
      failureReason: uuidv4(),
      id: createTaskCommand.id,
      status: "FAILURE",
      updatedTimestamp: Date.now(),
    };

    await sqs
      .sendMessageBatch({
        Entries: [
          { Id: uuidv4(), MessageBody: JSON.stringify(createProcessCommand) },
          { Id: uuidv4(), MessageBody: JSON.stringify(createTaskCommand) },
          { Id: uuidv4(), MessageBody: JSON.stringify(updateTaskCommand) },
        ],
        QueueUrl: queueUrl,
      })
      .promise();

    const process = await waitForProcessInAppSync(
      client,
      createProcessCommand.id,
      appSyncRetryTimeout,
      and(hasTaskId(createTaskCommand.id), hasTaskStatus("FAILURE")),
    );
    expect(process).toStrictEqual({
      __typename: "Process",
      id: createProcessCommand.id,
      name: createProcessCommand.name,
      created: createProcessCommand.createdTimestamp,
      tasks: [
        {
          __typename: "Task",
          created: createTaskCommand.createdTimestamp,
          failureReason: updateTaskCommand.failureReason,
          id: createTaskCommand.id,
          name: createTaskCommand.name,
          processId: createProcessCommand.id,
          status: "FAILURE",
          updated: updateTaskCommand.updatedTimestamp,
        },
      ],
    });
  });
});
