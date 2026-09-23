# Emotion Regulation Agent

An AI-powered emotional regulation system that guides users through personalized breathing exercises when stress is detected. Built with AWS Bedrock, Lambda, Polly, S3, and DynamoDB.

## 🎯 Features

- **Stress Detection**: Uses AWS Bedrock to analyze user input for stress indicators
- **Guided Breathing**: Generates personalized 4-4-6 breathing routines (inhale 4s, hold 4s, exhale 6s)
- **Audio Support**: AWS Polly text-to-speech for guided audio instructions
- **Visual Animation**: Interactive HTML/CSS animations with expanding/contracting circles
- **Emotion Tracking**: DynamoDB logging for historical pattern analysis
- **Analytics**: Personalized insights and recommendations based on emotion trends
- **Multi-format Output**: Text, audio, and visual guidance in one integrated system

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Input (Text)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  AWS Bedrock Emotion       │
        │  Analysis Engine           │
        └────────┬───────────────────┘
                 │
        ┌────────▼───────────────────┐
        │  Stress Detection          │
        │  & Classification          │
        └────────┬───────────────────┘
                 │
        ┌────────▼───────────────────────────────────────┐
        │  Response Generation (Parallelized)           │
        │                                                │
        │  ┌──────────────────────────────────────────┐ │
        │  │ Breathing Routine (Lambda)               │ │
        │  └──────────────────────────────────────────┘ │
        │                                                │
        │  ┌──────────────────────────────────────────┐ │
        │  │ Audio Generation (Polly)                 │ │
        │  └──────────────────────────────────────────┘ │
        │                                                │
        │  ┌──────────────────────────────────────────┐ │
        │  │ Animation Generation (S3)                │ │
        │  └──────────────────────────────────────────┘ │
        │                                                │
        └────────┬──────────────────────────────────────┘
                 │
        ┌────────▼───────────────────┐
        │  DynamoDB Interaction Log  │
        │  & Analytics               │
        └────────┬───────────────────┘
                 │
                 ▼
        ┌────────────────────────────┐
        │  User Response with:       │
        │  - Text Guidance           │
        │  - Audio File URL          │
        │  - Animation URL           │
        │  - Insights & Trends       │
        └────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- AWS Account with Bedrock, Lambda, Polly access
- AWS CLI configured
- Docker (optional, for local development)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd emotion-regulation-agent

# Install dependencies
npm install

# Build TypeScript
npm run build
```

### Environment Setup

```bash
# Copy example environment
cp .env.example .env

# Update .env with your AWS credentials and configuration
# AWS_REGION=us-east-1
# AWS_BEDROCK_MODEL=anthropic.claude-3-haiku-20240307-v1:0
# etc.
```

### Local Development

```bash
# Start local services (DynamoDB, S3)
docker-compose up

# Run development server
npm run dev

# Run tests
npm run test

# Format and lint
npm run lint
npm run format
```

## 📊 Project Structure

```
emotion-regulation-agent/
├── src/
│   ├── __tests__/                 # Test files
│   ├── lambda/                    # AWS Lambda handlers
│   │   ├── breathing-routine-handler.ts
│   │   ├── polly-audio-handler.ts
│   │   ├── animation-handler.ts
│   │   └── logging-handler.ts
│   ├── animation-generator.ts     # Visual animation creation
│   ├── animation-service.ts       # Animation orchestration
│   ├── audio-service.ts           # Audio generation service
│   ├── bedrock-client.ts          # AWS Bedrock integration
│   ├── breathing-routine.ts       # Breathing exercise generator
│   ├── config.ts                  # Configuration management
│   ├── dynamodb-client.ts         # Database operations
│   ├── emotion-agent.ts           # Main orchestrator
│   ├── logger.ts                  # Logging utility
│   ├── polly-client.ts            # AWS Polly integration
│   ├── response-builder.ts        # Response formatting
│   ├── s3-client.ts               # AWS S3 operations
│   ├── stress-detector.ts         # Stress detection service
│   └── index.ts                   # Application entry point
├── template.yaml                  # SAM CloudFormation template
├── samconfig.toml                 # SAM deployment config
├── Dockerfile                     # Docker image for deployment
├── docker-compose.yml             # Local development environment
├── Makefile                       # Build and deployment commands
├── jest.config.js                 # Test configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

## 🔧 API Endpoints

### POST /emotion
Analyze user input and generate response with breathing guidance.

**Request:**
```json
{
  "text": "I'm feeling really anxious about my presentation",
  "userId": "user123"
}
```

**Response:**
```json
{
  "message": "I sense you're feeling anxious...\n\nGUIDED BREATHING EXERCISE...",
  "routine": {
    "instructions": "Inhale for 4 seconds, hold for 4, exhale for 6...",
    "duration": 70,
    "cycles": 5,
    "inhaleCount": 4,
    "holdCount": 4,
    "exhaleCount": 6
  },
  "audio": {
    "url": "https://s3.amazonaws.com/audio/breathing-xxx.mp3",
    "format": "audio/mpeg",
    "duration": 95
  },
  "animation": {
    "url": "https://s3.amazonaws.com/animations/breathing-xxx.html",
    "type": "text/html"
  },
  "interactionId": "emotion-1234567890-abc123"
}
```

## 📈 Breathing Exercise Details

The system uses a proven 4-4-6 breathing technique:

1. **Inhale (4 seconds)**: Slowly breathe in through your nose
2. **Hold (4 seconds)**: Keep the air in your lungs
3. **Exhale (6 seconds)**: Slowly release air through your mouth

This pattern activates the parasympathetic nervous system, promoting calm and relaxation.

**Routine Options:**
- **Quick** (3 cycles, ~42 seconds): For rapid stress relief
- **Standard** (5 cycles, ~70 seconds): Recommended default routine
- **Extended** (8 cycles, ~112 seconds): For deeper relaxation

## 🎨 Animation Themes

Three customizable visual themes:

- **Calm** (default): Teal/green palette for relaxation
- **Energetic**: Purple palette for motivation
- **Minimal**: Grayscale for understated guidance

## 📊 Analytics & Insights

The system tracks:

- Stress frequency patterns
- Emotion trends over time
- Peak stress times (by hour)
- Most common emotions
- Interaction history
- Personalized recommendations

Access insights via:
```bash
# Get user insights
aws lambda invoke \
  --function-name emotion-analytics-dev \
  --payload '{"userId":"user123","action":"insights"}' \
  response.json
```

## 🚢 Deployment

### AWS SAM Deployment

```bash
# Deploy to development
make deploy-dev

# Deploy to production
make deploy-prod

# Manual deployment
sam deploy --config-env dev --region us-east-1
```

### Docker Deployment

```bash
# Build Docker image
docker build -t emotion-agent:latest .

# Run container
docker run -p 3000:3000 \
  -e AWS_REGION=us-east-1 \
  -e DYNAMODB_TABLE_NAME=emotion-interaction-logs \
  emotion-agent:latest
```

### GitHub Actions CI/CD

The project includes automated CI/CD:

1. **Test Pipeline** (test.yml): Runs on every push/PR
   - Installs dependencies
   - Lints code
   - Builds project
   - Runs tests
   - Uploads coverage

2. **Deploy Pipeline** (deploy.yml): Runs on main/develop
   - Builds and tests
   - Validates CloudFormation
   - Deploys to dev/prod
   - Runs smoke tests

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- stress-detector.test.ts

# Watch mode
npm run test -- --watch
```

### Test Coverage

- Stress detection (keyword matching, Bedrock fallback)
- Breathing routine generation (all durations)
- Animation generation (themes, responsiveness)
- DynamoDB operations (CRUD, queries)
- Lambda handlers (invocation, error handling)

## 📝 Logging & Monitoring

### CloudWatch Logs

Logs are automatically sent to CloudWatch:
- `/aws/lambda/emotion-agent-dev`
- `/aws/lambda/emotion-audio-dev`
- `/aws/lambda/emotion-animation-dev`

View logs:
```bash
make logs-emotion
make logs-audio
make logs-animation
```

### CloudWatch Alarms

The system monitors:
- Lambda function errors
- DynamoDB throttling
- API response times
- Failed health checks

## 🔐 Security

- **IAM Roles**: Least-privilege access for each Lambda function
- **Encryption**: S3 bucket versioning and encryption
- **HTTPS**: API Gateway enforces HTTPS
- **Environment Variables**: Sensitive data via AWS Secrets Manager (recommended)
- **VPC**: Lambda functions can be deployed in VPC for additional isolation

## 🐛 Troubleshooting

### Bedrock Model Not Found
```
Error: Model not found
```
Solution: Verify model ID in config and ensure Bedrock is enabled in your AWS region.

### DynamoDB Throttling
```
Error: Provisioned throughput exceeded
```
Solution: The table uses PAY_PER_REQUEST billing. Verify AWS account limits.

### S3 Access Denied
```
Error: Access Denied to S3 bucket
```
Solution: Check IAM role permissions in template.yaml. Ensure Lambda execution role has S3 permissions.

### Audio Generation Timeout
```
Error: Polly synthesis timeout
```
Solution: Increase Lambda timeout in template.yaml (default: 60s). For longer texts, use batch processing.

## 📚 Documentation

- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS Polly Documentation](https://docs.aws.amazon.com/polly/)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [SAM Documentation](https://docs.aws.amazon.com/serverless-application-model/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- AWS for Bedrock, Lambda, Polly services
- The breathing exercise technique based on clinical research in parasympathetic nervous system activation
- Contributors and testers

## 📞 Support

For issues, questions, or suggestions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review GitHub Issues
3. Contact the development team

---

**Built with ❤️ for emotional wellness**
