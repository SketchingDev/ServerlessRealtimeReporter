import laconia, { LaconiaFactory } from "@laconia/core";
import { sqs } from "@laconia/event";
import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { SQSEvent, SQSHandler } from "aws-lambda";
import "isomorphic-fetch";
import { createProcess, isCreateProcessCommand } from "./src/commands/createProcess/createProcess";
import { CreateProcessCommand } from "./src/commands/createProcess/createProcessCommand";
import { createTask, isCreateTaskCommand } from "./src/commands/createTask/createTask";
import { CreateTaskCommand } from "./src/commands/createTask/createTaskCommand";

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
  const promises = sqs(event).records.map(({ body }) => {
    const command = body as CreateProcessCommand | CreateTaskCommand;

    try {
      if (isCreateProcessCommand(command)) {
        return createProcess(appSync, logger)(command as CreateProcessCommand);
      }
      if (isCreateTaskCommand(command)) {
        return createTask(appSync, logger)(command as CreateTaskCommand);
      }
      // TODO Add command for updating task
    } catch (error) {
      logger.error(`Error processing command ${error.message}`);
      return;
    }

    logger.error(`Unknown command ${JSON.stringify(command)}`);
    return;
  });

  await Promise.all(promises);
};

export const processCreator: SQSHandler = laconia(app).register(dependencies);
