import laconia, { LaconiaFactory } from "@laconia/core";
import { sqs } from "@laconia/event";
import AJV from "ajv";
import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { SQSEvent, SQSHandler } from "aws-lambda";
import "isomorphic-fetch";
import { CreateProcessCommand } from "./src/commands/createProcessCommand";
import { createProcessCommandSchema } from "./src/commands/createProcessCommand.schema";
import { createProcessMutation } from "./src/graphql/createProcessMutation";
import { CreateProcessVariables } from "./src/graphql/createProcessVariables";
import { Process } from "./src/process";

export interface EnvDependencies {
  REGION:string;
  GRAPHQL_API_KEY: string;
  GRAPHQL_API_URL: string;
}

export interface AppDependencies {
  appSync: AWSAppSyncClient<any>;
}

const dependencies: LaconiaFactory = ({ env } : {env: EnvDependencies}) => ({
    appSync: new AWSAppSyncClient({
    auth: {
      type: AUTH_TYPE.API_KEY,
      apiKey: env.GRAPHQL_API_KEY!,
    },
    region: env.REGION!,
    url: env.GRAPHQL_API_URL!,
    disableOffline: true,
  })
});

const createProcess = (appSync: AWSAppSyncClient<any>, command: CreateProcessCommand) => {
  const ajv = new AJV({ allErrors: true });
  const valid = ajv.validate(createProcessCommandSchema, command);
  if (!valid) {
    console.error("Create Process Command is invalid", ajv.errors);
    return;
  }

  return appSync.mutate<Process, CreateProcessVariables>({
    variables: {
      id: command.id,
      name: command.name,
      timestamp: command.timestamp
    },
    mutation: createProcessMutation,
    fetchPolicy: "no-cache",
  });
};

export const app = async (event: SQSEvent, { appSync }: AppDependencies) => {
  const mutations = sqs(event).records.map(({body}) => createProcess(appSync, body as CreateProcessCommand));
  await Promise.all(mutations);
};

export const processCreator: SQSHandler = laconia(app)
  .register(dependencies);
