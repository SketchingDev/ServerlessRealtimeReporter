import AWSAppSyncClient from "aws-appsync/lib";
import { Logger } from "../../../handler";
import { Task } from "../../task";
import { Command } from "../Command";
import { updateTaskMutation } from "./graphql/updateTaskMutation";
import { UpdateTaskVariables } from "./graphql/updateTaskVariables";
import { UpdateTaskCommand } from "./updateTaskCommand";

export const isUpdateTaskCommand = ({commandType}: Command) => commandType === "update-task";

export const updateTask = (appSync: AWSAppSyncClient<any>, logger: Logger) => async (command: UpdateTaskCommand): Promise<void> => {
  logger.info("Received Update Task Command", command);
  // TODO Refactor schema
  // validateCommand(command, createTaskCommandSchema, logger);

  return appSync.mutate<Task, UpdateTaskVariables>({
    variables: {
      id: command.id,
      status: command.status,
      updated: command.updatedTimestamp,
      failureReason: command.failureReason
    },
    mutation: updateTaskMutation,
    fetchPolicy: "no-cache",
  });
};