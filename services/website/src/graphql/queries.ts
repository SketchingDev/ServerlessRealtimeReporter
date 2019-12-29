export const getAllProcessesQuery = `
  query {
    getAllProcesses {
      id
      name
      created
    }
  }
`;

export const getProcessQuery = `
  query getProcess($id: ID!){
    getProcess(id: $id){
      id
      name
      created
    }
  }
`;

export const getProcessTasksQuery = `
  query getProcess($id: ID!){
    getProcess(id: $id){
      tasks {
        id
	      processId
	      name
	      created
	      updated
	      status
	      failureReason
      }
    }
  }




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
`;
