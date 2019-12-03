import laconia from "@laconia/core";
import { S3CreateEvent, SQSHandler } from "aws-lambda";
import { SQS } from "aws-sdk";
import { ProgressReporter } from "./src/ProgressReporter";

// export const sourceIdGenerator = (namespace: string) => (s3Event: IS3Record): RequestSourceId =>
//   uuidv5(s3Event.s3.object.key + s3Event.eventTime, namespace);

export interface EnvDependencies {
  REGION: string;
  PROCESS_SQS_QUEUE_NAME: string;
}

export interface AppDependencies {
  progressReporter: ProgressReporter
}

const awsDependencies = ({ env }: { env: EnvDependencies }) => ({
  sqs: new SQS({ region: env.REGION }),
});


export const appDependencies = async ({sqs, env}: {
  sqs: SQS;
  env: EnvDependencies;
}): Promise<AppDependencies> => ({
  progressReporter: await ProgressReporter.createFromQueueName(sqs, env.PROCESS_SQS_QUEUE_NAME),
});

// @ts-ignore
export const app = async (event: S3CreateEvent, { progressReporter }: AppDependencies) => {
  // const progresses = event.Records.map((record) => {
  //   console.log(record);
  //   const invocationId = `${record.eventTime}-${record.s3.object.key}`;
  //   const invocationName = 'Download 0 images';
  //   return progressReporter.invokedProcess(invocationId, invocationName);
  // });
  //
  // await Promise.all(progresses);
  await progressReporter.invokedProcess(`${Date.now()}`, 'Download 0 images');
};

export const imageDownloader: SQSHandler = laconia(app)
  .register(awsDependencies)
  .register(appDependencies);
