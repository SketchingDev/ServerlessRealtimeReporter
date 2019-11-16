import gql from "graphql-tag";

export const getAllSources = gql(`
{
  getAllSources {
    name,
    id,
    timestamp
  }
}
`);
