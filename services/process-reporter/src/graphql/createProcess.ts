import gql from "graphql-tag";

export const createProcess = gql(`
mutation createProcess($id: ID! $name: String! $timestamp: AWSTimestamp!) {
    createProcess(
      id: $id
      name: $name
      timestamp: $timestamp
    ) {
      id
      name
      timestamp
    }
  }
`);
