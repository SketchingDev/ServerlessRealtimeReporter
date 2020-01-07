import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { CloudFormation, Lambda } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { CreateProcessCommand } from "../../src/commands/createProcess/createProcessCommand";
import { CreateTaskCommand } from "../../src/commands/createTask/createTaskCommand";
import { createSqsEvent } from "../createSqsEvent";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { waitForProcessInAppSync } from "../waitForProcessInAppSync";

const jestTimeout = 60 * 1000;
const appSyncRetryTimeout = jestTimeout - 4 * 1000;
jest.setTimeout(jestTimeout);

describe("Lambda deployment", () => {
  const region = "us-east-1";
  const stackName = "process-reporter-test";
  let lambdaArn: string | undefined;

  let client: AWSAppSyncClient<any>;
  const lambda = new Lambda({ region });
  let createProcessCommand: Readonly<CreateProcessCommand>;

  beforeAll(async () => {
    const outputs = await extractServiceOutputs(new CloudFormation({ region, apiVersion: "2010-05-15" }), stackName);

    lambdaArn = outputs.lambda.arn;

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
      commandType: "create-process",
      id: uuidv4(),
      name: uuidv4(),
      createdTimestamp: Date.now(),
    };
  });

  test("process created is returned in getAllProcessesQuery", async () => {
    await lambda
      .invoke({
        FunctionName: lambdaArn!,
        Payload: JSON.stringify(createSqsEvent([{ ...createProcessCommand }])),
      })
      .promise();

    await waitForProcessInAppSync(
      client,
      createProcessCommand.id,
      process =>
        expect(process).toMatchObject({
          __typename: "Process",
          id: createProcessCommand.id,
          name: createProcessCommand.name,
          created: createProcessCommand.createdTimestamp,
        }),
      appSyncRetryTimeout,
    );
  });

  test("process with task created is returned in getAllProcesses", async () => {
    const createTaskCommand: CreateTaskCommand = {
      commandType: "create-task",
      createdTimestamp: Date.now(),
      id: uuidv4(),
      name: uuidv4(),
      processId: createProcessCommand.id,
    };

    await lambda
      .invoke({
        FunctionName: lambdaArn!,
        Payload: JSON.stringify(createSqsEvent([createProcessCommand, createTaskCommand])),
      })
      .promise();

    await waitForProcessInAppSync(
      client,
      createProcessCommand.id,
      process =>
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
        }),
      appSyncRetryTimeout,
    );
  });
});
