import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { CloudFormation } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { createSource } from "../../src/graphql/createSource";
import { CreateSourceVariables } from "../../src/graphql/createSourceVariables";
import { Source } from "../../src/model/source";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { waitForSourceInAppSync } from "../waitForSourceInAppSync";


describe("GraphQL deployment", () => {
  const region = "us-east-1";
  const stackName = "process-reporter-dev";

  let client: AWSAppSyncClient<any>;
  let sourceVariables: Readonly<CreateSourceVariables>;

  beforeAll(async () => {
    const outputs = await extractServiceOutputs(
      new CloudFormation({ region, apiVersion: "2010-05-15" }),
      stackName,
    );

    client = new AWSAppSyncClient({
      auth: {
        type: AUTH_TYPE.API_KEY,
        apiKey: outputs.graphQl.key!,
      },
      region,
      url: outputs.graphQl.url!,
      disableOffline: true,
    });
  });

  beforeEach(() => {
    sourceVariables = {
      id: uuidv4(),
      name: uuidv4(),
      timestamp: new Date().getTime(),
    };
  });

  test("source returned from being created", async () => {
    const { data } = await client.mutate<{ createSource: Source }, CreateSourceVariables>({
      variables: { ...sourceVariables },
      mutation: createSource,
      fetchPolicy: "no-cache",
    });

    expect(data).toMatchObject({
      createSource: {
        __typename: "Source",
        id: sourceVariables.id,
        name: sourceVariables.name,
        timestamp: sourceVariables.timestamp,
      },
    });
  });

  test("source created is returned in getAllSources", async () => {
    await client.mutate<Source, CreateSourceVariables>({
      variables: { ...sourceVariables },
      mutation: createSource,
      fetchPolicy: "no-cache",
    });

    expect(await waitForSourceInAppSync(client, sourceVariables.id)).toMatchObject(
      {
        __typename: "Source",
        id: sourceVariables.id,
        name: sourceVariables.name,
        timestamp: sourceVariables.timestamp,
      });
  });
});

