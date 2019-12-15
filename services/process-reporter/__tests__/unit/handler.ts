// @ts-ignore
import laconia = require("@laconia/core");
import AWSAppSyncClient from "aws-appsync/lib";
import { Handler } from "aws-lambda";
import { app, Logger } from "../../handler";
import { CreateProcessCommand } from "../../src/commands/createProcess/createProcessCommand";
import { createProcessMutation } from "../../src/commands/createProcess/graphql/createProcessMutation";
import { CreateTaskCommand } from "../../src/commands/createTask/createTaskCommand";
import { addTaskMutation } from "../../src/commands/createTask/graphql/addTaskMutation";
import { createSqsEvent } from "../createSqsEvent";

describe("CreateProcessCommand", () => {
  let handler: Handler;
  let mockAppSync: Pick<AWSAppSyncClient<any>, "mutate">;
  let mockLogger: Logger;

  beforeEach(() => {
    mockAppSync = {
      mutate: jest.fn(),
    };
    mockLogger = {
      error: jest.fn(),
      info: jest.fn(),
    };

    handler = laconia(app).register(() => ({ appSync: mockAppSync, logger: mockLogger }));
  });

  test("Handler calls GraphQL mutation for creating process", async () => {
    const createProcessCommand: CreateProcessCommand = {
      commandType: "create-process",
      id: "test-id",
      name: "test-name",
      timestamp: 123,
    };
    await handler(createSqsEvent({...createProcessCommand}), {} as any, jest.fn());

    expect(mockAppSync.mutate).toHaveBeenCalledWith({
      variables: {
        id: createProcessCommand.id,
        name: createProcessCommand.name,
        timestamp: createProcessCommand.timestamp,
      },
      mutation: createProcessMutation,
      fetchPolicy: "no-cache",
    });
  });

  test("Handler calls GraphQL mutation for creating task", async () => {
    const createTaskCommand: CreateTaskCommand = {
      commandType: "create-task",
      processId: "123",
      id: "test-id",
      name: "test-name",
      createdTimestamp: 345
    };
    await handler(createSqsEvent({...createTaskCommand}), {} as any, jest.fn());

    expect(mockAppSync.mutate).toHaveBeenCalledWith({
      variables: {
        id: createTaskCommand.id,
        name: createTaskCommand.name,
        processId: createTaskCommand.processId,
        created: createTaskCommand.createdTimestamp,
      },
      mutation: addTaskMutation,
      fetchPolicy: "no-cache",
    });
  });

  test("Handler logs out invalid command", async () => {
    const invalidCommand: CreateProcessCommand = {
      commandType: "create-process",
      id: "",
      name: undefined as any,
      timestamp: 0,
    };

    await handler(createSqsEvent({...invalidCommand}), {} as any, jest.fn());
    expect(mockLogger.error).toHaveBeenCalledWith("Create Process Command is invalid", [
      {
        dataPath: "",
        keyword: "required",
        message: "should have required property 'name'",
        params: { missingProperty: "name" },
        schemaPath: "#/required",
      },
    ]);
  });


});
