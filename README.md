# Serverless Realtime Reporter


## What makes up a process

* Process invocation
  * Sub-tasks
    * The success of the invocation is dependent on these sub-tasks succeeding

## Create user for deploying

```bash
# Create user
aws cloudformation create-stack \
  --stack-name realtime-deployment-user \
  --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://./.github/deployment-user.yml

# Update user
aws cloudformation update-stack \
  --stack-name realtime-deployment-user \
  --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://./.github/deployment-user.yml
```
