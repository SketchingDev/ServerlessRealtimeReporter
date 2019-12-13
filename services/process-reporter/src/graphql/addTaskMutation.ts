import gql from "graphql-tag";

export const addTaskMutation = gql(`
mutation addTask(
  $id: String!
  $processId: ID!
  $name: String!
  $created: AWSTimestamp!
) {
  addTask(
    id: $id
    processId: $processId
    name: $name
    created: $created
  ) {
    id
    processId
    name
    created
    updated
    status
    failureReason
  }
}
`);
