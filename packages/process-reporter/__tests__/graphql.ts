import gql from "graphql-tag";

export interface Source {
    id: string;
    name: string;
    timestamp: number;
}

export interface CreateSourceVariables {
    id: string;
    name: string;
    timestamp: number;
}

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

export const getAllSources = gql(`
{
  getAllSources {
    name,
    id,
    timestamp
  }
}
`);
