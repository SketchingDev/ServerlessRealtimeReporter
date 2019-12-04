import { SQS } from "aws-sdk";
import { GetQueueUrlResult } from "aws-sdk/clients/sqs";
import { Source } from "process-reporter/src/source";

export class ProgressReporter {

  public static async createFromQueueName(sqs: SQS, queueName: string) {
    let getQueueUrlResponse: GetQueueUrlResult;
    try {
      getQueueUrlResponse = await sqs.getQueueUrl({ QueueName: queueName }).promise();
    } catch (error) {
      throw new Error(`Failed to get URL for queue ${queueName} due to '${error}'`);
      // if (error.errorType === ProgressReporter.NON_EXISTENT_QUEUE_TYPE) {
      //   throw new Error(`Failed to get URL for queue ${queueName} due to '${error.errorMessage}'`);
      // }
      // throw error;
    }
    return new ProgressReporter(sqs, getQueueUrlResponse.QueueUrl!);
  }
  // private static readonly NON_EXISTENT_QUEUE_TYPE = "AWS.SimpleQueueService.NonExistentQueue";

  constructor(private sqs: SQS, private queueUrl: string) {
    if (!queueUrl) {
      throw new Error("Queue URL must be defined");
    }
  }

  public async invokedProcess(invocationId: string, invocationName: string) {
    if (!invocationId || !invocationName) {
      throw new Error("Process name must be defined");
    }

    const source: Source = {
      id: invocationName, name: invocationName, timestamp: Date.now(),
    };

    await this.sqs.sendMessage({
      MessageBody: JSON.stringify(source),
      QueueUrl: this.queueUrl,
    }).promise();
  }
}
