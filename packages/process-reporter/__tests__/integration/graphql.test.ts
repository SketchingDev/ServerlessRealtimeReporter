import pRetry from "p-retry";
import {getDeploymentConfig} from "../deploymentConfig";
import AWSAppSyncClient, {AUTH_TYPE} from "aws-appsync/lib";
import "isomorphic-fetch";
import uuidv4 from "uuid/v4";
import {createSource, getAllSources, CreateSourceVariables, Source} from "../graphql";

describe("GraphQL deployment", () => {

    let client: AWSAppSyncClient<any>;
    let sourceVariables: Readonly<CreateSourceVariables>;

    beforeAll(() => {
        const {graphql, region} = getDeploymentConfig();

        client = new AWSAppSyncClient({
            auth: {
                type: AUTH_TYPE.API_KEY,
                apiKey: graphql.key,
            },
            region,
            url: graphql.url,
            disableOffline: true,
        });
    });

    beforeEach(() => {
        sourceVariables = {
            id: uuidv4(),
            name: uuidv4(),
            timestamp: new Date().getTime(),
        };
    });

    test("source returned from being created", async () => {
        const {data} = await client.mutate<{ createSource: Source }, CreateSourceVariables>({
            variables: {...sourceVariables},
            mutation: createSource,
            fetchPolicy: "no-cache",
        });

        expect(data).toMatchObject({
            createSource: {
                __typename: "Source",
                id: sourceVariables.id,
                name: sourceVariables.name,
                timestamp: sourceVariables.timestamp,
            }
        })
    });

    test("source created is returned in getAllSources", async () => {
        await client.mutate<Source, CreateSourceVariables>({
            variables: {...sourceVariables},
            mutation: createSource,
            fetchPolicy: "no-cache",
        });

        let actualSource: Source | undefined;
        await pRetry(async () => {
            const {data} = await client.query<{ getAllSources: Array<Source> }>({
                query: getAllSources,
                fetchPolicy: "no-cache",
            });

            actualSource = data.getAllSources.find(({id}) => id === sourceVariables.id);
            expect(actualSource).not.toBeUndefined();
        }, {retries: 5});

        expect(actualSource).toMatchObject(
            {
                __typename: "Source",
                id: sourceVariables.id,
                name: sourceVariables.name,
                timestamp: sourceVariables.timestamp,
            });
    });
});

