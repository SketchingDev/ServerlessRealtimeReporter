// const AWS = require("aws-sdk");
//
// const region = "us-east-1";
// const stackName = "process-reporter-test"; // TODO Change to dev
//
// const cloudFormation = new AWS.CloudFormation({ region, apiVersion: "2010-05-15" });
//
// cloudFormation.describeStacks({
//   StackName: stackName
// }, (err, data) => {
//   console.log(data);
// });



// export const extractServiceOutputs = async (cloudFormation: CloudFormation, stackName: string): Promise<ServiceDeployment> => {
//   const stacks = await cloudFormation.describeStacks({
//     StackName: stackName
//   }).promise();
//
//   const graphQl: GraphQlOutput = {};
//   const lambda: LambdaOutput = {};
//   let queueName: string| undefined = "";
//
//   if (stacks.Stacks) {
//     stacks.Stacks.forEach(s => {
//       if (s.Outputs) {
//         s.Outputs.forEach(o => {
//           switch (o.OutputKey) {
//             case "GraphQlApiUrl":
//               graphQl.url = o.OutputValue;
//               break;
//             case "QueueName":
//               queueName = o.OutputValue;
//               break;
//             case "GraphQlApiKeyDefault":
//               graphQl.key = o.OutputValue;
//               break;
//             case "ProcessCreatorLambdaFunctionQualifiedArn":
//               lambda.arn = o.OutputValue;
//               break;
//           }
//         });
//       }
//     })
//   }
//
//   return { graphQl, lambda, queueName };
// };
//
