export const getAllProcessesQuery = `
  query {
    getAllProcesses {
      id
      name
      timestamp
    }
  }
`;

export const getProcessQuery = `
  query getProcess($id: ID!){
    getProcess(id: $id){
      id
      name
      timestamp
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
`;
