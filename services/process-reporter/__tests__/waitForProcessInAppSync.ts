import { ApolloError } from 'apollo-client';
import AWSAppSyncClient from "aws-appsync/lib";
import pRetry from "p-retry";
import { Process } from "../src/process";
import { getAllProcessesQuery } from "./getAllProcessesQuery";

const throughputExceededException = 'DynamoDB:ProvisionedThroughputExceededException';

type ProcessPredicate = (process: Process) => boolean;

export const waitForProcessInAppSync = async (
  client: AWSAppSyncClient<any>,
  predicate: ProcessPredicate,
): Promise<Process | undefined> => {
  let actualProcess: Process | undefined;
  await pRetry(
    async () => {
      let data: { getAllProcesses: Process[] } = {getAllProcesses: []};

      try {
        const queryResult = await client.query<{ getAllProcesses: Process[] }>({
          query: getAllProcessesQuery,
          fetchPolicy: "no-cache",
        });
        data = queryResult.data;
      } catch (err) {
        let abortRetry = true;

        if (err instanceof ApolloError && err.graphQLErrors) {
          abortRetry = err.graphQLErrors.some(({errorType}) => errorType !== throughputExceededException);
        }

        if (abortRetry) {
          throw new pRetry.AbortError(err.message);
        }
      }

      actualProcess = data.getAllProcesses.find(predicate);
      expect(actualProcess).not.toBeUndefined();
    },
    { forever: true, factor: 1, onFailedAttempt: () => console.error("AppSync failed. Retrying...") },
  );

  return actualProcess;
};

export const hasProcessId = (expectedProcessId: string): ProcessPredicate => ({ id }) => id === expectedProcessId;

export const hasTaskId = (expectedTaskId: string): ProcessPredicate => ({ tasks }) =>
  tasks.some(t => t.id === expectedTaskId);

export const hasTaskStatus = (expectedTaskStatus: string): ProcessPredicate => ({ tasks }) =>
  tasks.some(t => t.status === expectedTaskStatus);

export const and = (...predicates: ProcessPredicate[]): ProcessPredicate => process =>
  predicates.every(predicate => predicate(process));
