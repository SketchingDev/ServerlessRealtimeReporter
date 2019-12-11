import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { CloudFormation, SQS } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { Process } from "../../src/process";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { waitForProcessInAppSync } from "../waitForProcessInAppSync";

jest.setTimeout(20000);

describe("SQS deployment", () => {
    const region = "us-east-1";
    const stackName = "process-reporter-test";

    let client: AWSAppSyncClient<any>;
    const sqs = new SQS({ region: "us-east-1" });
    let queueUrl: string;

    let process: Readonly<Process>;

    beforeAll(async () => {
        const outputs = await extractServiceOutputs(
            new CloudFormation({region, apiVersion: "2010-05-15"}),
            stackName
        );

        const queueName = outputs.queueName!;
        queueUrl = (await sqs.getQueueUrl({ QueueName: queueName }).promise()).QueueUrl!;

        client = new AWSAppSyncClient({
            auth: {
                type: AUTH_TYPE.API_KEY,
                apiKey: outputs.graphQl.key!,
            },
            region,
            url: outputs.graphQl.url!,
            disableOffline: true,
        });
    });

    beforeEach(() => {
        process = {
            id: uuidv4(),
            name: uuidv4(),
            timestamp: new Date().getTime(),
        };
    });

    test("process created is returned in getAllProcesses", async () => {
        await sqs
          .sendMessage({
              MessageBody: JSON.stringify({ ...process }),
              QueueUrl: queueUrl,
          })
          .promise();

        expect(await waitForProcessInAppSync(client, process.id)).toMatchObject(
            {
                __typename: "Process",
                id: process.id,
                name: process.name,
                timestamp: process.timestamp,
            });
    });
});

