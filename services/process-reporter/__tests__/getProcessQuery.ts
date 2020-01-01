import gql from "graphql-tag";

export const getProcessQuery = gql(`
query getProcess($id: ID!){
  getProcess(id: $id) {
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
