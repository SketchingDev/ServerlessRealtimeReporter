import laconia, { LaconiaFactory } from "@laconia/core";
import { sqs } from "@laconia/event";
import AJV from "ajv";
import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { SQSEvent, SQSHandler } from "aws-lambda";
import "isomorphic-fetch";
import { createProcess } from "./src/graphql/createProcess";
import { CreateProcessVariables } from "./src/graphql/createProcessVariables";
import { Process } from "./src/process";
import { processSchema } from "./src/process.schema";

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

export const app = async (event: SQSEvent, { appSync }: AppDependencies) => {
  const mutations = sqs(event).records.map(({body}) => {
    const process = body as Process;

    const ajv = new AJV({ allErrors: true });
    const valid = ajv.validate(processSchema, process);
    if (!valid) {
      console.error("Process object is invalid", ajv.errors);
      return;
    }

    appSync.mutate<Process, CreateProcessVariables>({
      variables: {
        id: process.id,
        name: process.name,
        timestamp: process.timestamp
      },
      mutation: createProcess,
      fetchPolicy: "no-cache",
    });
  });

  await Promise.all(mutations);
};

export const processCreator: SQSHandler = laconia(app)
  .register(dependencies);
