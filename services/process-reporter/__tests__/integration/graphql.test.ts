import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { CloudFormation } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { addTaskMutation } from "../../src/graphql/addTaskMutation";
import { AddTaskVariables } from "../../src/graphql/addTaskVariables";
import { createProcessMutation } from "../../src/graphql/createProcessMutation";
import { CreateProcessVariables } from "../../src/graphql/createProcessVariables";
import { Task } from "../../src/task";
import { extractServiceOutputs } from "../extractServiceOutputs";
import {
  and,
  hasProcessId,
  hasTaskId,
  waitForProcessInAppSync,
} from "../waitForProcessInAppSync";

describe("GraphQL deployment", () => {
  const region = "us-east-1";
  const stackName = "process-reporter-test";

  let client: AWSAppSyncClient<any>;
  let createProcessVariables: Readonly<CreateProcessVariables>;

  beforeAll(async () => {
    const outputs = await extractServiceOutputs(
      new CloudFormation({ region, apiVersion: "2010-05-15" }),
      stackName,
    );

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
    createProcessVariables = {
      id: uuidv4(),
      name: uuidv4(),
      timestamp: new Date().getTime(),
    };
  });

  test("process returned from being created", async () => {
    const { data } = await client.mutate<{ createProcess: CreateProcessVariables }, CreateProcessVariables>({
      variables: { ...createProcessVariables },
      mutation: createProcessMutation,
      fetchPolicy: "no-cache",
    });

    expect(data).toStrictEqual({
      createProcess: {
        __typename: "Process",
        id: createProcessVariables.id,
        name: createProcessVariables.name,
        timestamp: createProcessVariables.timestamp,
      },
    });
  });

  test("process created is returned in getAllProcesses", async () => {
    await client.mutate<{ createProcess: CreateProcessVariables }, CreateProcessVariables>({
      variables: { ...createProcessVariables },
      mutation: createProcessMutation,
      fetchPolicy: "no-cache",
    });

    const process = await waitForProcessInAppSync(client, hasProcessId(createProcessVariables.id));
    expect(process).toStrictEqual(
      {
        __typename: "Process",
        id: createProcessVariables.id,
        name: createProcessVariables.name,
        timestamp: createProcessVariables.timestamp,
        tasks: [],
      });
  });

  test("process created with tasks is returned in getAllProcesses", async () => {
    await client.mutate<{ createProcess: CreateProcessVariables }, CreateProcessVariables>({
      variables: { ...createProcessVariables },
      mutation: createProcessMutation,
      fetchPolicy: "no-cache",
    });

    const addTaskVariables: AddTaskVariables = {
      created: Date.now(), id: uuidv4(), name: uuidv4(), processId: createProcessVariables.id,
    };

    await client.mutate<{ addTask: Task }, AddTaskVariables>({
      variables: { ...addTaskVariables },
      mutation: addTaskMutation,
      fetchPolicy: "no-cache",
    });

    const process = await waitForProcessInAppSync(client, and(hasProcessId(createProcessVariables.id), hasTaskId(addTaskVariables.id)));
    expect(process).toStrictEqual(
      {
        __typename: "Process",
        id: createProcessVariables.id,
        name: createProcessVariables.name,
        timestamp: createProcessVariables.timestamp,
        tasks: [{
          __typename: "Task",
          created: addTaskVariables.created,
          failureReason: null,
          id: addTaskVariables.id,
          name: addTaskVariables.name,
          processId: createProcessVariables.id,
          status: "PENDING",
          updated: addTaskVariables.created,
        }],
      });
  });
});

