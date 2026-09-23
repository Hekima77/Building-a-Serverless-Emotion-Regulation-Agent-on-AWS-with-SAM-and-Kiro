# Deployment Guide

Complete guide for deploying the Emotion Regulation Agent to AWS.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured
- AWS SAM CLI installed
- Docker installed (for local testing)
- Node.js 18+

## Initial AWS Setup

### 1. Create S3 Bucket for SAM Artifacts

```bash
# Create the bucket (adjust bucket name for uniqueness)
aws s3api create-bucket \
  --bucket emotion-regulation-agent-sam-artifacts \
  --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket emotion-regulation-agent-sam-artifacts \
  --versioning-configuration Status=Enabled
```

### 2. Enable AWS Bedrock Access

```bash
# Visit AWS Bedrock console and request access to the Claude model
# Or use AWS CLI:
aws bedrock list-foundation-models --by-provider "anthropic" --region us-east-1
```

### 3. Set Up AWS CLI Profile

```bash
aws configure --profile emotion-dev
# Enter your AWS credentials and region: us-east-1
```

## Building the Project

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Verify build
ls dist/
```

## Local Testing with Docker

```bash
# Start local services
docker-compose up -d

# Run the application
npm run dev

# Test the API
curl -X POST http://localhost:3000/emotion \
  -H "Content-Type: application/json" \
  -d '{"text":"I am feeling anxious","userId":"test-user"}'

# Stop services
docker-compose down
```

## Local Lambda Testing

```bash
# Build for local testing
npm run build

# Invoke Lambda locally
sam local invoke EmotionAgentFunction \
  --event events/emotion-event.json \
  --region us-east-1

# Start local API Gateway
sam local start-api --region us-east-1
```

## AWS Deployment

### Development Environment

```bash
# Deploy with SAM
sam deploy --config-env dev --region us-east-1

# Or using Make
make deploy-dev

# Get API endpoint
aws cloudformation describe-stacks \
  --stack-name emotion-regulation-agent-dev \
  --region us-east-1 \
  --query 'Stacks[0].Outputs' \
  --output table
```

### Staging Environment

```bash
# Deploy to staging
sam deploy --config-env staging --region us-east-1

# Make
make deploy-staging
```

### Production Environment

```bash
# Deploy to production (requires confirmation)
sam deploy --config-env prod --region us-east-1 --confirm-changeset

# Or
make deploy-prod
```

## Post-Deployment Verification

### 1. Check Stack Status

```bash
# Verify stack creation
aws cloudformation describe-stacks \
  --stack-name emotion-regulation-agent-dev \
  --region us-east-1 \
  --query 'Stacks[0].StackStatus'
```

### 2. Test Emotion Agent Endpoint

```bash
# Get API endpoint
ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name emotion-regulation-agent-dev \
  --region us-east-1 \
  --query 'Stacks[0].Outputs[?OutputKey==`EmotionAPIEndpoint`].OutputValue' \
  --output text)

# Test the endpoint
curl -X POST $ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I am feeling really stressed about the project deadline",
    "userId": "test-user-123"
  }' | jq .
```

### 3. Verify DynamoDB Table

```bash
# List items in DynamoDB
aws dynamodb scan \
  --table-name emotion-interaction-logs-dev \
  --region us-east-1 \
  --limit 5
```

### 4. Check S3 Buckets

```bash
# List animation bucket contents
aws s3 ls s3://emotion-regulation-animations-<account-id>-dev/

# List audio bucket contents
aws s3 ls s3://emotion-regulation-audio-<account-id>-dev/
```

### 5. Invoke Lambda Functions

```bash
# Test emotion agent
aws lambda invoke \
  --function-name emotion-agent-dev \
  --payload '{"text":"I am anxious"}' \
  response.json \
  --region us-east-1
cat response.json

# Test breathing routine
aws lambda invoke \
  --function-name emotion-breathing-routine-dev \
  --payload '{"detectedEmotions":["anxiety"],"intensity":"moderate"}' \
  response.json \
  --region us-east-1
cat response.json
```

## Troubleshooting Deployment

### Stack Creation Failures

```bash
# Get detailed error information
aws cloudformation describe-stack-events \
  --stack-name emotion-regulation-agent-dev \
  --region us-east-1 \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'
```

### Lambda Function Issues

```bash
# Check Lambda logs
aws logs tail /aws/lambda/emotion-agent-dev --follow

# Check Lambda errors
aws logs filter-log-events \
  --log-group-name /aws/lambda/emotion-agent-dev \
  --filter-pattern "ERROR"
```

### DynamoDB Issues

```bash
# Check table status
aws dynamodb describe-table \
  --table-name emotion-interaction-logs-dev \
  --region us-east-1

# Check capacity
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedWriteCapacityUnits \
  --dimensions Name=TableName,Value=emotion-interaction-logs-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum
```

### S3 Access Issues

```bash
# Verify bucket policies
aws s3api get-bucket-policy \
  --bucket emotion-regulation-animations-<account-id>-dev

# Check bucket CORS
aws s3api get-bucket-cors \
  --bucket emotion-regulation-animations-<account-id>-dev
```

## Performance Optimization

### Lambda Optimization

```yaml
# In template.yaml, adjust:
MemorySize: 512    # Increase for faster CPU
Timeout: 60        # Adjust for expected duration
EphemeralStorage: 512
```

### DynamoDB Optimization

```bash
# For high traffic, consider:
# - Global Tables for multi-region
# - DynamoDB Accelerator (DAX) for caching
# - On-demand billing vs provisioned
```

### API Gateway Caching

```yaml
# Enable caching in samconfig.toml:
CacheClusterEnabled: true
CacheClusterSize: 0.5
```

## Cost Management

### Estimate Monthly Costs

```bash
# Lambda: ~1M requests @ $0.20/M = $0.20
# DynamoDB: On-demand, varies by usage
# Polly: ~$4 per 1M characters synthesized
# S3: ~$0.023 per GB stored
# Bedrock: $0.00375 per 1K input tokens, $0.015 per 1K output tokens
```

### Cost Optimization

1. **Lambda**: Use reserved concurrency for consistent load
2. **DynamoDB**: Set up lifecycle policies to archive old data
3. **S3**: Enable intelligent tiering and lifecycle policies
4. **Bedrock**: Consider batch processing for non-real-time use cases

## Monitoring and Alerts

### CloudWatch Dashboard

```bash
# Create custom dashboard
aws cloudwatch put-dashboard \
  --dashboard-name emotion-regulation-dashboard \
  --dashboard-body file://dashboard.json
```

### Set Up Alarms

```bash
# High error rate
aws cloudwatch put-metric-alarm \
  --alarm-name emotion-agent-high-errors \
  --alarm-description "Alert when error rate exceeds 5%" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=emotion-agent-dev
```

### CloudWatch Logs Insights Queries

```bash
# Find all stressed interactions
fields @timestamp, userId, detectedEmotions, isStressed
| filter emotionAnalysis.isStressed = true
| stats count() by userId

# Error analysis
fields @timestamp, @message, @duration
| filter @message like /ERROR/
| stats count() by @duration

# Performance metrics
fields @duration
| stats avg(@duration), max(@duration), pct(@duration, 99)
```

## Maintenance

### Regular Tasks

```bash
# Monitor CloudWatch alarms daily
# Review Lambda logs weekly
# Audit IAM permissions monthly
# Update dependencies quarterly

# Clean up old data
aws s3 rm s3://emotion-regulation-audio-<account-id>-dev --recursive --exclude "recent/*"
```

### Update Deployment

```bash
# Update code and redeploy
git pull
npm install
npm run build
sam deploy --config-env dev

# Blue-green deployment (manual)
# 1. Deploy to new stack
# 2. Test thoroughly
# 3. Switch traffic via Route53/API Gateway
# 4. Delete old stack
```

### Disaster Recovery

```bash
# Enable DynamoDB backups
aws dynamodb update-continuous-backups \
  --table-name emotion-interaction-logs-dev \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true

# Enable S3 versioning (already enabled in template)
# Regular exports
aws dynamodb export-table-to-point-in-time \
  --table-arn arn:aws:dynamodb:us-east-1:ACCOUNT:table/emotion-interaction-logs-dev \
  --s3-bucket emotion-regulation-backups
```

## Rollback Procedures

```bash
# If deployment fails, CloudFormation automatically rolls back
# Manual rollback:
aws cloudformation cancel-update-stack \
  --stack-name emotion-regulation-agent-dev

# Or update to previous working template:
aws cloudformation update-stack \
  --stack-name emotion-regulation-agent-dev \
  --template-body file://previous-template.yaml
```

## Cleanup (Destroy Stack)

```bash
# WARNING: This deletes all resources

# Empty S3 buckets first
aws s3 rm s3://emotion-regulation-animations-<account-id>-dev --recursive
aws s3 rm s3://emotion-regulation-audio-<account-id>-dev --recursive

# Delete stack
aws cloudformation delete-stack \
  --stack-name emotion-regulation-agent-dev

# Verify deletion
aws cloudformation wait stack-delete-complete \
  --stack-name emotion-regulation-agent-dev
```

---

For additional help, refer to the [AWS documentation](https://docs.aws.amazon.com/) or check the troubleshooting section in README.md.
