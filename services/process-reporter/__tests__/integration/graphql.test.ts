import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { CloudFormation } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { createProcess } from "../../src/graphql/createProcess";
import { CreateProcessVariables } from "../../src/graphql/createProcessVariables";
import { Process } from "../../src/process";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { waitForProcessInAppSync } from "../waitForProcessInAppSync";


describe("GraphQL deployment", () => {
  const region = "us-east-1";
  const stackName = "process-reporter-dev";

  let client: AWSAppSyncClient<any>;
  let createProcessVariables: Readonly<CreateProcessVariables>;

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
    createProcessVariables = {
      id: uuidv4(),
      name: uuidv4(),
      timestamp: new Date().getTime(),
    };
  });

  test("process returned from being created", async () => {
    const { data } = await client.mutate<{ createProcess: CreateProcessVariables }, CreateProcessVariables>({
      variables: { ...createProcessVariables },
      mutation: createProcess,
      fetchPolicy: "no-cache",
    });

    expect(data).toMatchObject({
      createProcess: {
        __typename: "Source",
        id: createProcessVariables.id,
        name: createProcessVariables.name,
        timestamp: createProcessVariables.timestamp,
      },
    });
  });

  test("source created is returned in getAllProcesses", async () => {
    await client.mutate<Process, CreateProcessVariables>({
      variables: { ...createProcessVariables },
      mutation: createProcess,
      fetchPolicy: "no-cache",
    });

    expect(await waitForProcessInAppSync(client, createProcessVariables.id)).toMatchObject(
      {
        __typename: "Source",
        id: createProcessVariables.id,
        name: createProcessVariables.name,
        timestamp: createProcessVariables.timestamp,
      });
  });
});

