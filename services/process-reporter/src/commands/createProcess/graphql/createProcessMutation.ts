import gql from "graphql-tag";

export const createProcessMutation = gql(`
mutation createProcess($id: ID! $name: String! $created: AWSTimestamp!) {
  createProcess(
    id: $id
    name: $name
    created: $created
  ) {
    id
    name
    created
  }
}
`);
