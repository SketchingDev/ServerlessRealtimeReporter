import gql from "graphql-tag";

export const getAllProcessesQuery = gql(`
{
  getAllProcesses {
    id,
    name,
    created,
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
