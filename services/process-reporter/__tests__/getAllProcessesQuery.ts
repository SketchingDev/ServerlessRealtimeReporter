import gql from "graphql-tag";

export const getAllProcessesQuery = gql(`
{
  getAllProcesses {
    id,
    name,
    timestamp,
    tasks {
      id
      processId
      name
      status
      created
      updated
      failureReason
    }
  }
}
`);
