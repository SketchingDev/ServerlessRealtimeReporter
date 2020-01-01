# Serverless Realtime Reporter

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

## What makes up a process

* Process invocation
  * Sub-tasks
    * The success of the invocation is dependent on these sub-tasks succeeding

## Using a restricted deployment user

This solution can be deployed with a user that only has the necessary permissions - although they're not as restricted
as they could be.

**Creating User**

```bash
aws cloudformation create-stack \
  --stack-name realtime-deployment-user \
  --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://./.github/deployment-user.yml
```

**Updating User**

```bash
aws cloudformation update-stack \
  --stack-name realtime-deployment-user \
  --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://./.github/deployment-user.yml
```

### Configuring development environment

Follow these steps to configure your environment to use the deployment user.

```bash
# 1. Retrieve user's Access Key and Secret
aws cloudformation describe-stacks --stack-name realtime-deployment-user

# 2. Create profile for user
aws configure --profile process-reporter-deployer

# 3. Example of performing an action using this new profile
AWS_PROFILE=process-reporter-deployer yarn test:integration
```



## Improvements

* Using queries in place of scans for DynamoDB
* Use [event sourcing with projections](https://stackoverflow.com/a/47313279) for commands
* Implement pagination
