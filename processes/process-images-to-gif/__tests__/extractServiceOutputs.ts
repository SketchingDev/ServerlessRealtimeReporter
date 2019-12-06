import { CloudFormation } from "aws-sdk";

export interface StackOutputs {
  stackName: string,
  outputsToExtract: string[];
}

// TODO Look to deduplicate this
export const extractServiceOutputs = async (cloudFormation: CloudFormation, {stackName, outputsToExtract}: StackOutputs): Promise<Map<string, string>> => {
  const describeStacksResponse = await cloudFormation.describeStacks({
    StackName: stackName,
  }).promise();

  if (!describeStacksResponse.Stacks) {
    throw new Error(`CloudFormation Stack '${stackName}' not found`);
  }

  const stacksWithOutputs = describeStacksResponse.Stacks.filter(({ Outputs }) => Outputs !== undefined);

  const keyValues = new Map<string, string>();

  for (const stack of stacksWithOutputs) {
    for (const { OutputKey, OutputValue } of stack.Outputs!) {
      if ((OutputKey && OutputValue) && outputsToExtract.includes(OutputKey)) {
        keyValues.set(OutputKey, OutputValue);
      }
    }
  }

  return keyValues;
};
