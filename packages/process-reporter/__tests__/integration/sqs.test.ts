import AWSAppSyncClient, { AUTH_TYPE } from "aws-appsync/lib";
import { CloudFormation, SQS } from "aws-sdk";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import { Source } from "../../src/model/source";
import { extractServiceOutputs } from "../extractServiceOutputs";
import { waitForSourceInAppSync } from "../waitForSourceInAppSync";

jest.setTimeout(20000);

describe("SQS deployment", () => {
    const region = "us-east-1";
    const stackName = "process-reporter-dev";

    let client: AWSAppSyncClient<any>;
    const sqs = new SQS({ region: "us-east-1" });
    let queueUrl: string;

    let source: Readonly<Source>;

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
        source = {
            id: uuidv4(),
            name: uuidv4(),
            timestamp: new Date().getTime(),
        };
    });

    test("source created is returned in getAllSources", async () => {
        await sqs
          .sendMessage({
              MessageBody: JSON.stringify({ ...source }),
              QueueUrl: queueUrl,
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

