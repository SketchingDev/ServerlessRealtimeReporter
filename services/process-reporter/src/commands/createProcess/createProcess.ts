import AWSAppSyncClient from "aws-appsync/lib";
import { Logger } from "../../../handler";
import { Process } from "../../process";
import { Command } from "../Command";
import { validateCommand } from "../validateCommand";
import { CreateProcessCommand } from "./createProcessCommand";
import { createProcessCommandSchema } from "./createProcessCommand.schema";
import { createProcessMutation } from "./graphql/createProcessMutation";
import { CreateProcessVariables } from "./graphql/createProcessVariables";

export const isCreateProcessCommand = ({commandType}: Command) => commandType === "create-process";

export const createProcess = (appSync: AWSAppSyncClient<any>, logger: Logger) => async (command: CreateProcessCommand): Promise<void> => {
  logger.info("Received Create Process Command", command);
  validateCommand(command, createProcessCommandSchema, logger);

  return appSync.mutate<Process, CreateProcessVariables>({
    variables: {
      id: command.id,
      name: command.name,
      timestamp: command.timestamp,
    },
    mutation: createProcessMutation,
    fetchPolicy: "no-cache",
  });
};
