# Serverless Realtime Reporter


## Create user for deploying

```bash
aws cloudformation create-stack \
  --stack-name realtime-deployment-user \
  --capabilities CAPABILITY_NAMED_IAM \
  --template-body file://./.github/deployment-user.yml

# aws cloudformation update-stack
```
