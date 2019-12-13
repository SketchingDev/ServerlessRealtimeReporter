import { SQS } from "aws-sdk";
import { GetQueueUrlResult } from "aws-sdk/clients/sqs";
import { CreateProcessCommand } from "./createProcessCommand";

export interface ProgressReporter {
  invokedProcess(processInvocationId: string, processInvocationName: string): Promise<void>;
}

export class SqsProgressReporter implements ProgressReporter {

  public static async createFromQueueName(sqs: SQS, queueName: string) {
    let getQueueUrlResponse: GetQueueUrlResult;
    try {
      getQueueUrlResponse = await sqs.getQueueUrl({ QueueName: queueName }).promise();
    } catch (error) {
      throw new Error(`Failed to get URL for queue ${queueName} due to '${error}'`);
    }
    return new SqsProgressReporter(sqs, getQueueUrlResponse.QueueUrl!);
  }

  constructor(private sqs: SQS, private queueUrl: string) {
    if (!queueUrl) {
      throw new Error("Queue URL must be defined");
    }
  }

  public async invokedProcess(processInvocationId: string, processInvocationName: string) {
    if (!processInvocationId || !processInvocationName) {
      throw new Error("Process name must be defined");
    }

    const createProcessCommand: CreateProcessCommand = {
      id: processInvocationId, name: processInvocationName, timestamp: Date.now(),
    };

    await this.sqs.sendMessage({
      MessageBody: JSON.stringify(createProcessCommand),
      QueueUrl: this.queueUrl,
    }).promise();
  }
}
