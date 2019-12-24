# Process Reporter

The Process Reporter consumes commands from its SQS for managing Processes and their tasks.

## Commands
* CreateProcessCommand
* CreateTaskCommand


## Features

* Order of commands doesn't matter

## Testing

```bash
$ yarn deploy:test
$ serverless graphql-playground
```

## GraphQL queries

*Create a Process*
```graphql
mutation {
  createProcess(id: "test-id", name:"This my first process", , created: 1556307929337){
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
    created
  }
}
```

*Get all Processes*
```graphql

{
  getAllProcesses {
    name,
    id,
    created
  }
}
```

*Subscribe on created Processes*
```graphql
subscription {
  onCreateProcess{
    id,
    name,
    created
  }
}
```
