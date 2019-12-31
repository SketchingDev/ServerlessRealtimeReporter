import laconia, { LaconiaFactory } from "@laconia/core";
import { sqs } from "@laconia/event";
import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { SQSEvent, SQSHandler } from "aws-lambda";
import "isomorphic-fetch";
import { createProcess, isCreateProcessCommand } from "./src/commands/createProcess/createProcess";
import { CreateProcessCommand } from "./src/commands/createProcess/createProcessCommand";
import { createTask, isCreateTaskCommand } from "./src/commands/createTask/createTask";
import { CreateTaskCommand } from "./src/commands/createTask/createTaskCommand";
import { isUpdateTaskCommand, updateTask } from "./src/commands/updateTask/updateTask";
import { UpdateTaskCommand } from "./src/commands/updateTask/updateTaskCommand";

export interface Logger {
  info: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
}

export interface EnvDependencies {
  REGION: string;
  GRAPHQL_API_KEY: string;
  GRAPHQL_API_URL: string;
}

export interface AppDependencies {
  appSync: AWSAppSyncClient<any>;
  logger: Logger;
}

const dependencies: LaconiaFactory = ({ env }: { env: EnvDependencies }): AppDependencies => ({
  logger: console,
  appSync: new AWSAppSyncClient({
    auth: {
      type: AUTH_TYPE.API_KEY,
      apiKey: env.GRAPHQL_API_KEY!,
    },
    region: env.REGION!,
    url: env.GRAPHQL_API_URL!,
    disableOffline: true,
  }),
});

export const app = async (event: SQSEvent, { appSync, logger }: AppDependencies) => {
  console.log("Received event", event);
  for (const {body} of sqs(event).records) {
    const command = body as CreateProcessCommand | CreateTaskCommand | UpdateTaskCommand;
    console.log(`Processing command ${command.commandType}`);

    try {
      if (isCreateProcessCommand(command)) {
        await createProcess(appSync, logger)(command as CreateProcessCommand);
      }
      if (isCreateTaskCommand(command)) {
        await createTask(appSync, logger)(command as CreateTaskCommand);
      }
      if (isUpdateTaskCommand(command)) {
        await updateTask(appSync, logger)(command as UpdateTaskCommand);
      }
    } catch (error) {
      logger.error(`Error processing command ${error.message}`);
    }
  }
};

export const processCreator: SQSHandler = laconia(app).register(dependencies);
