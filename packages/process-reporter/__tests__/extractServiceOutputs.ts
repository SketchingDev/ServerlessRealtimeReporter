import {CloudFormation} from "aws-sdk";

interface ServiceDeployment {
    graphQl: GraphQlOutput;
    lambda: LambdaOutput;
    queueName?: string;
}

interface GraphQlOutput {
    url?: string,
    key?: string,
}

interface LambdaOutput {
    arn?: string;
}

export const extractServiceOutputs = async (cloudFormation: CloudFormation, stackName: string): Promise<ServiceDeployment> => {
    const stacks = await cloudFormation.describeStacks({
        StackName: stackName
    }).promise();

    const graphQl: GraphQlOutput = {};
    const lambda: LambdaOutput = {};
    let queueName: string| undefined = "";

    if (stacks.Stacks) {
        stacks.Stacks.forEach(s => {
            if (s.Outputs) {
                s.Outputs.forEach(o => {
                    switch (o.OutputKey) {
                        case "GraphQlApiUrl":
                            graphQl.url = o.OutputValue;
                            break;
                        case "QueueName":
                            queueName = o.OutputValue;
                            break;
                        case "GraphQlApiKeyDefault":
                            graphQl.key = o.OutputValue;
                            break;
                        case "SourceCreatorLambdaFunctionQualifiedArn":
                            lambda.arn = o.OutputValue;
                            break;
                    }
                });
            }
        })
    }

    return { graphQl, lambda, queueName };
};
