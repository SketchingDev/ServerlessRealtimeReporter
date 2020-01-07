import { ApolloError } from "apollo-client";
import AWSAppSyncClient from "aws-appsync/lib";
import pRetry from "p-retry";
import { Process } from "../src/process";
import { getProcessQuery } from "./getProcessQuery";

const throughputExceededException = "DynamoDB:ProvisionedThroughputExceededException";

export const waitForProcessInAppSync = async (
  client: AWSAppSyncClient<any>,
  processId: string,
  expectation: (process: Process | null) => void,
  timeoutInMs: number,
): Promise<void> =>
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
      expectation(data.getProcess);
    },
    {
      maxRetryTime: timeoutInMs,
      retries: 100,
      onFailedAttempt: () => console.error("Process not found in AppSync. Retrying..."),
    },
  );
