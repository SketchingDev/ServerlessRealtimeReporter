import AWSAppSyncClient from "aws-appsync/lib";
// import { Logger } from "../../../../handler";
import { updateTaskMutation } from "../../../../src/commands/updateTask/graphql/updateTaskMutation";
import { updateTask } from "../../../../src/commands/updateTask/updateTask";
import { UpdateTaskCommand } from "../../../../src/commands/updateTask/updateTaskCommand";

describe("Update Task", () => {
  let mockAppSync: Pick<AWSAppSyncClient<any>, "mutate">;

  beforeEach(() => {
    mockAppSync = {
      mutate: jest.fn(),
    };
  });

  test("Valid update task command is passed to AppSync", async () => {
    const updateTaskCommand: UpdateTaskCommand = {
      commandType: "update-task",
      failureReason: "",
      status: "SUCCESS",
      id: "test-id",
      updatedTimestamp: 123,
    };
    await updateTask(mockAppSync as any, console)(updateTaskCommand);

    expect(mockAppSync.mutate).toHaveBeenCalledWith({
      variables: {
        failureReason: updateTaskCommand.failureReason,
        status: updateTaskCommand.status,
        id: updateTaskCommand.id,
        updated: updateTaskCommand.updatedTimestamp,
      },
      mutation: updateTaskMutation,
      fetchPolicy: "no-cache",
    });
  });
});
