import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { SQSEvent } from "aws-lambda";
import { CloudFormation, Lambda } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { Source } from "../../src/model/source";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { waitForSourceInAppSync } from "../waitForSourceInAppSync";

const twentySeconds = 20 * 1000;
jest.setTimeout(twentySeconds);

describe("Lambda deployment", () => {
    const region = "us-east-1";
    const stackName = "process-reporter-dev";
    let lambdaArn: string| undefined;

    let client: AWSAppSyncClient<any>;
    const lambda = new Lambda({region});
    let source: Readonly<Source>;

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
        source = {
            id: uuidv4(),
            name: uuidv4(),
            timestamp: new Date().getTime(),
        };
    });

    test("source created is returned in getAllSources", async () => {
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
                    body: JSON.stringify(source) }
            ]
        };

        await lambda
            .invoke({
                FunctionName: lambdaArn!,
                Payload: JSON.stringify(sqsEvent)
            })
            .promise();

        expect(await waitForSourceInAppSync(client, source.id)).toMatchObject(
            {
                __typename: "Source",
                id: source.id,
                name: source.name,
                timestamp: source.timestamp,
            });
    });
});

