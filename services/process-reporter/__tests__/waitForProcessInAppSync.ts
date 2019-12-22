import AWSAppSyncClient from "aws-appsync/lib";
import pRetry from "p-retry";
import { Process } from "../src/process";
import { getAllProcessesQuery } from "./getAllProcessesQuery";

type ProcessPredicate = (process: Process) => boolean;

export const waitForProcessInAppSync = async (
  client: AWSAppSyncClient<any>,
  predicate: ProcessPredicate,
): Promise<Process | undefined> => {
  let actualProcess: Process | undefined;
  await pRetry(
    async () => {
      let data: { getAllProcesses: Process[] };

      try {
        const queryResult = await client.query<{ getAllProcesses: Process[] }>({
          query: getAllProcessesQuery,
          fetchPolicy: "no-cache",
        });
        data = queryResult.data;
      } catch ({ message }) {
        throw new pRetry.AbortError(message);
      }

      actualProcess = data.getAllProcesses.find(predicate);
      expect(actualProcess).not.toBeUndefined();
    },
    { retries: 5 },
  );

  return actualProcess;
};

export const hasProcessId = (expectedProcessId: string): ProcessPredicate => ({ id }) => id === expectedProcessId;

export const hasTaskId = (expectedTaskId: string): ProcessPredicate => ({ tasks }) =>
  tasks.some(t => t.id === expectedTaskId);

export const and = (...predicates: ProcessPredicate[]): ProcessPredicate => process =>
  predicates.every(predicate => predicate(process));
