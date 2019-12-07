import AWSAppSyncClient from "aws-appsync/lib";
import pRetry from "p-retry";
import { Source } from "../src/source";
import { getAllSources } from "./graphql";

export const waitForSourceInAppSync = async (client: AWSAppSyncClient<any>, sourceId: string) => {
  let actualSource: Source | undefined;
  await pRetry(async () => {
    const { data } = await client.query<{ getAllSources: Source[] }>({
      query: getAllSources,
      fetchPolicy: "no-cache",
    });

    actualSource = data.getAllSources.find(({ id }) => id === sourceId);
    expect(actualSource).not.toBeUndefined();
  }, { retries: 5 });

  return actualSource;
};
