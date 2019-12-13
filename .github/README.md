# Deploying using a restricted user

## Creating/Update User

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


## Configuring Environment

Follow these steps to configure your environment to use the deployment user.

```bash
# 1. Retrieve user's Access Key and Secret
aws cloudformation describe-stacks --stack-name realtime-deployment-user

# 2. Create profile for user
aws configure --profile process-reporter-deployer

# 3. Example of performing an action using this new profile
AWS_PROFILE=process-reporter-deployer yarn test:integration
```
