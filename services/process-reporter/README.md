# Process Reporter

```bash
$ yarn deploy
$ serverless graphql-playground
```

## GraphQL queries

*Create a Source*
```graphql
mutation {
  createSource(id: "test-id", name:"This my first source", , timestamp: 1556307929337){
    name,
  }
}
```

*Get an individual Source*
```graphql
{
  getSource(id: "test-id") {
    name,
    id,
    timestamp
  }
}
```

*Get all Sources*
```graphql

{
  getAllSources {
    name,
    id,
    timestamp
  }
}
```

*Subscribe on created Sources*
```graphql
subscription {
  onCreateSource{
    id,
    name,
    timestamp
  }
}
```
