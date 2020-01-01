const AWS = require("aws-sdk");

const region = "us-east-1";
const stackName = "process-reporter-dev";

const cloudFormation = new AWS.CloudFormation({ region, apiVersion: "2010-05-15" });

cloudFormation.describeStacks(
  {
    StackName: stackName,
  },
  (err, data) => {
    data.Stacks.forEach(stack => {
      stack.Outputs.forEach(output => {
        switch (output.OutputKey) {
          case "GraphQlApiUrl":
            console.log(`REACT_APP_APPSYNC_GRAPHQL_ENDPOINT=${output.OutputValue}`);
            break;
          case "GraphQlApiKeyDefault":
            console.log(`REACT_APP_APPSYNC_API_KEY=${output.OutputValue}`);
            break;
        }
      });
    });
  },
);
