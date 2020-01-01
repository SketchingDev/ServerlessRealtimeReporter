import laconia from "@laconia/core";
import { S3CreateEvent, SQSHandler } from "aws-lambda";
import { SQS } from "aws-sdk";
import interval from "interval-promise";
import { SqsProgressReporter } from "./src/SqsProgressReporter";

export interface EnvDependencies {
  REGION: string;
  PROCESS_SQS_QUEUE_NAME: string;
}

export interface AppDependencies {
  progressReporter: SqsProgressReporter;
  randomIntGenerator: (min: number, max: number) => number;
  runAfterInterval: (msInterval: number, func: () => Promise<void>) => Promise<void>;
}

const awsDependencies = ({ env }: { env: EnvDependencies }) => ({
  sqs: new SQS({ region: env.REGION }),
});

export const appDependencies = async ({ sqs, env }: { sqs: SQS; env: EnvDependencies }): Promise<AppDependencies> => ({
  progressReporter: await SqsProgressReporter.createFromQueueName(sqs, env.PROCESS_SQS_QUEUE_NAME),
  randomIntGenerator: (min: number, max: number) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  runAfterInterval: async (msInterval: number, func: () => Promise<any>) =>
    interval(async () => func(), msInterval, { iterations: 1 }),
});

export const app = async (
  _: S3CreateEvent,
  { progressReporter, randomIntGenerator, runAfterInterval }: AppDependencies,
) => {
  const totalImages = randomIntGenerator(3, 20);

  console.log(`Creating random process to simulate downloading ${totalImages} images`);
  const newProcess = { id: `${Date.now()}`, name: `Download ${totalImages} images` };
  await progressReporter.invokedProcess(newProcess);

  const promises: Array<Promise<any>> = [];
  for (let i = 1; i <= totalImages; i++) {
    console.log(`Creating task for downloading image ${i}`);
    const newTask = { id: `${newProcess.id}-${i}`, name: `Downloading image ${i}`, parentProcess: newProcess };
    promises.push(
      runAfterInterval(randomIntGenerator(1000, 10000), async () => progressReporter.invokedProcessTask(newTask)),
    );

    // if (getRandomInt(0,1)) {
    promises.push(
      runAfterInterval(randomIntGenerator(10000, 20000), async () => progressReporter.taskCompleteSuccessfully(newTask)),
    );
    // } else {
    // promises.push(runAfterRandomInterval({min: 10, max: 20}, async () => progressReporter.taskCompleteUnsuccessfully(newTask, `Failed to download image ${i}`)));
    // }
  }

  await Promise.all(promises);
};

export const doSomething: SQSHandler = laconia(app)
  .register(awsDependencies)
  .register(appDependencies);
