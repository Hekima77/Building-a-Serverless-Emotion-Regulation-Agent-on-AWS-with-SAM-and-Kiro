# Emotion Regulation Agent - Python Version

## ✅ Conversion Complete!

Your TypeScript system has been **fully converted to Python**. You no longer need Node.js!

---

## 📋 Prerequisites

You already have:
- ✅ Python installed
- ✅ AWS CLI installed  
- ✅ AWS Account with credentials

You still need:
- [ ] SAM CLI (AWS Serverless Application Model)

---

## 🚀 Step 1: Install SAM CLI

### Download SAM CLI for Windows:
Go to: https://aws.amazon.com/serverless/sam/
- Click "Download SAM CLI for Windows"
- Run the installer
- Accept all defaults

### Verify installation:
```powershell
sam --version
```

---

## 🚀 Step 2: Configure AWS Credentials

If you haven't already:
```powershell
aws configure
```

Enter your AWS credentials when prompted:
- Access Key ID: (from your AWS account)
- Secret Access Key: (from your AWS account)
- Default region: us-east-1
- Output format: json

---

## 🚀 Step 3: Deploy to AWS

### Navigate to project:
```powershell
cd "c:\Users\hekima\OneDrive\Desktop\Emotion.Kiro"
```

### Deploy:
```powershell
sam deploy --template-file template-python.yaml --guided
```

### During deployment, answer prompts:
```
Stack Name: emotion-agent-lite
Region: us-east-1
Parameter Environment [dev]: dev
Confirm changes before deploy [y/N]: y
Allow SAM CLI IAM role creation [Y/n]: y
Authorizer may not have authorization defined [y/N]: y
Save parameters to samconfig.toml [Y/n]: y
```

---

## 🎉 Deployment Complete!

Once deployed, you'll see:
```
Successfully created/updated stack - emotion-agent-lite in us-east-1
```

You'll get output like:
```
Key                 Value
---                 -----
EmotionAgentAPI     https://xxxxx.execute-api.us-east-1.amazonaws.com/dev
EmotionAgentFunction emotion-agent-dev
HistoryFunction     emotion-history-dev
DynamoDBTable       emotion-logs-dev
```

---

## 🧪 Test Your Deployment

### Get your API endpoint:
```powershell
sam list stack-outputs --stack-name emotion-agent-lite --region us-east-1
```

### Test emotion analysis:
```powershell
$apiUrl = "https://YOUR_API_URL/emotion"

$body = @{
    text = "I'm feeling really anxious"
    userId = "user-123"
} | ConvertTo-Json

Invoke-WebRequest -Uri $apiUrl `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body | ConvertFrom-Json | ConvertTo-Json
```

### Test history retrieval:
```powershell
$historyUrl = "https://YOUR_API_URL/history/user-123"

Invoke-WebRequest -Uri $historyUrl `
  -Method GET `
  -Headers @{"Content-Type"="application/json"} | ConvertFrom-Json | ConvertTo-Json
```

---

## 📁 Python Project Structure

```
Emotion.Kiro/
├── src/
│   ├── services/
│   │   ├── stress_detector.py         ✅
│   │   ├── breathing_routine.py       ✅
│   │   └── dynamodb_logger.py         ✅
│   ├── lambda/
│   │   └── emotion_handler.py         ✅
│   └── emotion_agent.py               ✅
├── tests/
│   ├── test_stress_detector.py        ✅
│   └── test_breathing_routine.py      ✅
├── template-python.yaml               ✅
├── requirements.txt                   ✅
└── PYTHON_DEPLOYMENT_GUIDE.md        📄
```

---

## 🧪 Run Tests Locally (Optional)

### Test stress detector:
```powershell
python tests/test_stress_detector.py
```

### Test breathing routine:
```powershell
python tests/test_breathing_routine.py
```

---

## 📊 What Gets Deployed

### AWS Services Used:
- **AWS Lambda** (2 functions)
  - `emotion-agent-dev` - Analyzes input
  - `emotion-history-dev` - Retrieves history
- **API Gateway** - REST endpoints
- **DynamoDB** - Stores interactions
- **CloudWatch** - Logs everything

### Cost:
- ~$15-30/month for typical usage
- First 1M requests free tier

---

## 🔍 Monitor Your Deployment

### View logs:
```powershell
sam logs -n emotion-agent-dev --stack-name emotion-agent-lite
```

### Check DynamoDB:
Go to AWS Console → DynamoDB → Tables → `emotion-logs-dev`

### Check Lambda:
Go to AWS Console → Lambda → Look for `emotion-agent-dev`

---

## ⚠️ Troubleshooting

### "SAM CLI not found"
- Download from: https://aws.amazon.com/serverless/sam/
- Restart PowerShell after installation

### "Access Denied" error
- Check AWS credentials: `aws sts get-caller-identity`
- Verify IAM permissions in AWS Console

### Lambda timeout
- Increase timeout in `template-python.yaml` (search for `Timeout: 60`)

### DynamoDB not found
- Check table name matches in code and template
- Should be: `emotion-logs-dev`

---

## 📝 Key Files Explained

### `template-python.yaml`
- AWS infrastructure definition
- Creates Lambda, API Gateway, DynamoDB
- Uses Python 3.11 runtime

### `requirements.txt`
- Python dependencies (only boto3)
- SAM automatically installs these

### `src/lambda/emotion_handler.py`
- Entry point for Lambda
- Handles API requests
- Calls emotion_agent

### `src/emotion_agent.py`
- Main orchestrator
- Coordinates all services

### `src/services/`
- Stress detector (keyword matching)
- Breathing routine generator (4-4-6 pattern)
- DynamoDB logger (store interactions)

---

## 🎯 Next Steps

1. ✅ Install SAM CLI
2. ✅ Run: `sam deploy --template-file template-python.yaml --guided`
3. ✅ Wait for deployment (5-10 minutes)
4. ✅ Test the endpoints
5. ✅ Check CloudWatch logs

---

## 📞 Need Help?

### Common Issues:
- Missing SAM CLI → Download from AWS website
- AWS credentials not configured → Run `aws configure`
- Python not in PATH → Restart PowerShell after Python install

### AWS Documentation:
- SAM: https://aws.amazon.com/serverless/sam/
- Lambda: https://docs.aws.amazon.com/lambda/
- DynamoDB: https://docs.aws.amazon.com/dynamodb/

---

## 🎉 Summary

You now have a **production-ready Python system** that:
- ✅ Detects stress (keyword matching)
- ✅ Generates breathing routines (4-4-6 pattern)
- ✅ Logs interactions (DynamoDB)
- ✅ Provides REST API (API Gateway + Lambda)
- ✅ Runs on Python (no Node.js needed!)
- ✅ Deploys to AWS (fully serverless)

**Ready to deploy!** 🚀

---

**Last Updated**: September 11, 2026  
**Runtime**: Python 3.11  
**Status**: ✅ Production Ready
