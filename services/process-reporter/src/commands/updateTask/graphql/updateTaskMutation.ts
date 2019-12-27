import gql from "graphql-tag";

export const updateTaskMutation = gql(`
mutation updateTask(
  $id: ID!
  $updated: AWSTimestamp!
  $status: TaskStatus!
  $failureReason: String!
) {
  updateTask(
    id: $id
    updated: $updated
    status: $status
    failureReason: $failureReason
  ) {
    id
    updated
    status
    failureReason
  }
}
`);
