import laconia, { LaconiaFactory } from "@laconia/core";
import { sqs } from "@laconia/event";
import AJV from "ajv";
import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { SQSEvent, SQSHandler } from "aws-lambda";
import "isomorphic-fetch";
import { createSource } from "./src/graphql/createSource";
import { CreateSourceVariables } from "./src/graphql/createSourceVariables";
import { Source } from "./src/source";
import { sourceSchema } from "./src/source.schema";

export interface AppDependencies {
  appSync: AWSAppSyncClient<any>;
}

const dependencies: LaconiaFactory = ({ env }) => ({
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
    const source = body as Source;

    const ajv = new AJV({ allErrors: true });
    const valid = ajv.validate(sourceSchema, source);
    if (!valid) {
      console.error("Source object is invalid", ajv.errors);
      return;
    }

    appSync.mutate<Source, CreateSourceVariables>({
      variables: {
        id: source.id,
        name: source.name,
        timestamp: source.timestamp
      },
      mutation: createSource,
      fetchPolicy: "no-cache",
    });
  });

  await Promise.all(mutations);
};

export const sourceCreator: SQSHandler = laconia(app)
  .register(dependencies);
