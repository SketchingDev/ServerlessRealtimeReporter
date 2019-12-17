# Process Reporter

The Process Reporter consumes commands from its SQS for managing Processes and their tasks.

* CreateProcessCommand

## Testing

```bash
$ yarn deploy:test
$ serverless graphql-playground
```

## GraphQL queries

*Create a Process*
```graphql
mutation {
  createProcess(id: "test-id", name:"This my first process", , timestamp: 1556307929337){
    name,
  }
}
```

*Get an individual Process*
```graphql
{
  getProcess(id: "test-id") {
    name,
    id,
    timestamp
  }
}
```

*Get all Processes*
```graphql

{
  getAllProcesses {
    name,
    id,
    timestamp
  }
}
```

*Subscribe on created Processes*
```graphql
subscription {
  onCreateProcess{
    id,
    name,
    timestamp
  }
}
```
