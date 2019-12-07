import gql from "graphql-tag";

export const createSource = gql(`
mutation createSource($id: ID! $name: String! $timestamp: AWSTimestamp!) {
    createSource(
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
