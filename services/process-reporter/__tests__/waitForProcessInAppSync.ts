import { ApolloError } from "apollo-client";
import AWSAppSyncClient from "aws-appsync/lib";
import pRetry from "p-retry";
import { Process } from "../src/process";
import { getProcessQuery } from "./getProcessQuery";

const throughputExceededException = "DynamoDB:ProvisionedThroughputExceededException";

type ProcessPredicate = (process: Process) => boolean;

export const waitForProcessInAppSync = async (
  client: AWSAppSyncClient<any>,
  processId: string,
  timeoutInMs: number,
  predicate: ProcessPredicate = () => true,
): Promise<Process | null> => {
  let actualProcess: Process | null = null;

  await pRetry(
    async () => {
      let data: { getProcess: Process | null } = { getProcess: null };

      try {
        const queryResult = await client.query<{ getProcess: Process | null }>({
          variables: {
            id: processId,
          },
          query: getProcessQuery,
          fetchPolicy: "no-cache",
        });
        data = queryResult.data;

        console.log(`Queried AppSync...`);
      } catch (err) {
        let abortRetry = true;

        if (err instanceof ApolloError && err.graphQLErrors) {
          abortRetry = err.graphQLErrors.some(({ errorType }) => errorType !== throughputExceededException);
        }

        if (abortRetry) {
          throw new pRetry.AbortError(err.message);
        }
      }

      if (data.getProcess && predicate(data.getProcess)) {
        actualProcess = data.getProcess;
      }

      expect(actualProcess).not.toBeNull();
    },
    {
      maxRetryTime: timeoutInMs,
      retries: 100,
      onFailedAttempt: () => console.error("Process not found in AppSync. Retrying..."),
    },
  );

  return actualProcess;
};

export const hasTaskId = (expectedTaskId: string): ProcessPredicate => ({ tasks }) =>
  tasks.some(t => t.id === expectedTaskId);

export const hasTaskStatus = (expectedTaskStatus: string): ProcessPredicate => ({ tasks }) =>
  tasks.some(t => t.status === expectedTaskStatus);

export const and = (...predicates: ProcessPredicate[]): ProcessPredicate => process =>
  predicates.every(predicate => predicate(process));
