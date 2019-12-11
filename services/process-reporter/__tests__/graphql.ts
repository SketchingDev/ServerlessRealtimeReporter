import gql from "graphql-tag";

export const getAllProcesses = gql(`
{
  getAllProcesses {
    name,
    id,
    timestamp
  }
}
`);
