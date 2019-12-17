import AWSAppSyncClient from "aws-appsync/lib";
import { Logger } from "../../../handler";
import { Task } from "../../task";
import { Command } from "../Command";
import { validateCommand } from "../validateCommand";
import { CreateTaskCommand } from "./createTaskCommand";
import { createTaskCommandSchema } from "./createTaskCommand.schema";
import { addTaskMutation } from "./graphql/addTaskMutation";
import { AddTaskVariables } from "./graphql/addTaskVariables";

export const isCreateTaskCommand = ({commandType}: Command) => commandType === "create-task";

export const createTask = (appSync: AWSAppSyncClient<any>, logger: Logger) => async (command: CreateTaskCommand): Promise<void> => {
  logger.info("Received Create Task Command", command);
  validateCommand(command, createTaskCommandSchema, logger);

  return appSync.mutate<Task, AddTaskVariables>({
    variables: {
      id: command.id,
      name: command.name,
      processId: command.processId,
      created: command.createdTimestamp,
    },
    mutation: addTaskMutation,
    fetchPolicy: "no-cache",
  });
};
