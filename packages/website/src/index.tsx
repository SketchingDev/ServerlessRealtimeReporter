import Amplify from "@aws-amplify/core";
import * as React from "react";
import * as ReactDOM from "react-dom";
import "semantic-ui-css/semantic.min.css";
import { App } from "./App";
import registerServiceWorker from "./registerServiceWorker";

Amplify.configure({
  aws_appsync_graphqlEndpoint: process.env.REACT_APP_APPSYNC_GRAPHQL_ENDPOINT,
  aws_appsync_region: "us-east-1",
  aws_appsync_authenticationType: "API_KEY",
  aws_appsync_apiKey: process.env.REACT_APP_APPSYNC_API_KEY,
});

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);

registerServiceWorker();
