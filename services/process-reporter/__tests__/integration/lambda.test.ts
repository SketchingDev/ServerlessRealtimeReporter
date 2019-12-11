import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { SQSEvent } from "aws-lambda";
import { CloudFormation, Lambda } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { Process } from "../../src/process";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { waitForProcessInAppSync } from "../waitForProcessInAppSync";

const twentySeconds = 20 * 1000;
jest.setTimeout(twentySeconds);

describe("Lambda deployment", () => {
    const region = "us-east-1";
    const stackName = "process-reporter-test";
    let lambdaArn: string| undefined;

    let client: AWSAppSyncClient<any>;
    const lambda = new Lambda({region});
    let process: Readonly<Process>;

    beforeAll(async () => {
        const outputs = await extractServiceOutputs(
            new CloudFormation({region, apiVersion: "2010-05-15"}),
            stackName
        );

        lambdaArn = outputs.lambda.arn;

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
        const sqsEvent: SQSEvent = {
            Records: [
                {
                    attributes: {
                        ApproximateFirstReceiveTimestamp: "",
                        ApproximateReceiveCount: "",
                        SenderId: "",
                        SentTimestamp: ""
                    },
                    awsRegion: "",
                    eventSource: "",
                    eventSourceARN: "",
                    md5OfBody: "",
                    messageAttributes: {},
                    messageId: "",
                    receiptHandle: "",
                    body: JSON.stringify(process) }
            ]
        };

        await lambda
            .invoke({
                FunctionName: lambdaArn!,
                Payload: JSON.stringify(sqsEvent)
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

