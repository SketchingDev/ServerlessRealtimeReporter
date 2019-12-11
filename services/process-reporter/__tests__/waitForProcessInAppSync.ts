import AWSAppSyncClient from "aws-appsync/lib";
import pRetry from "p-retry";
import { Process } from "../src/process";
import { getAllProcesses } from "./graphql";

export const waitForProcessInAppSync = async (client: AWSAppSyncClient<any>, processId: string): Promise<Process | undefined> => {
  let actualProcess: Process | undefined;
  await pRetry(async () => {
    const { data } = await client.query<{ getAllProcesses: Process[] }>({
      query: getAllProcesses,
      fetchPolicy: "no-cache",
    });

    actualProcess = data.getAllProcesses.find(({ id }) => id === processId);
    expect(actualProcess).not.toBeUndefined();
  }, { retries: 5 });

  return actualProcess;
};
