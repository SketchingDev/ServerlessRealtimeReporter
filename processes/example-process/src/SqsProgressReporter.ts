import { SQS } from "aws-sdk";
import { GetQueueUrlResult } from "aws-sdk/clients/sqs";

export interface ProgressReporter {
  invokedProcess(process: NamedProcess): Promise<void>;
}

export interface NamedProcess extends Process {
  name: string;
}

export interface Process {
  id: string;
}

export interface Task {
  parentProcess: Process;
  name: string;
}

interface CreateProcessCommand {
  commandType: "create-process",
  id: string;
  name: string;
  createdTimestamp: number;
}

interface CreateTaskCommand {
  commandType: "create-task";
  id: string;
  name: string;
  processId: string;
  createdTimestamp: number;
}

interface UpdateTaskCommand {
  commandType: "update-task";
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILURE';
  updatedTimestamp: number;
  failureReason?: string;
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

  public async invokedProcess(process: NamedProcess) {
    if (!process.id || !process.name) {
      throw new Error("Process name must be defined");
    }

    const createProcessCommand: CreateProcessCommand = {
      commandType: "create-process",
      id: process.id,
      name: process.name,
      createdTimestamp: Date.now(),
    };

    await this.sqs
      .sendMessage({
        MessageBody: JSON.stringify(createProcessCommand),
        QueueUrl: this.queueUrl,
      })
      .promise();
  }

  public async invokedProcessTask(task: Task) {
    if (!task.parentProcess || !task.parentProcess.id || !task.name) {
      throw new Error("Task's parent process must be defined with an ID and the task must have a name");
    }

    const createTaskCommand: CreateTaskCommand = {
      commandType: "create-task",
      processId: task.parentProcess.id,
      id: task.parentProcess.id,
      name: task.name,
      createdTimestamp: Date.now(),
    };

    await this.sqs
      .sendMessage({
        MessageBody: JSON.stringify(createTaskCommand),
        QueueUrl: this.queueUrl,
      })
      .promise();
  }

  public async taskCompleteSuccessfully(task: {id: string}) {
    const updateTaskCommand: UpdateTaskCommand = {
      commandType: "update-task",
      id: task.id,
      status: "SUCCESS",
      updatedTimestamp: Date.now(),
    };

    await this.sqs
      .sendMessage({
        MessageBody: JSON.stringify(updateTaskCommand),
        QueueUrl: this.queueUrl,
      })
      .promise();
  }

  public async taskCompleteUnsuccessfully(task: {id: string}, failureReason: string) {
    const updateTaskCommand: UpdateTaskCommand = {
      commandType: "update-task",
      failureReason,
      id: task.id,
      status: "FAILURE",
      updatedTimestamp: Date.now(),
    };

    await this.sqs
      .sendMessage({
        MessageBody: JSON.stringify(updateTaskCommand),
        QueueUrl: this.queueUrl,
      })
      .promise();
  }
}
