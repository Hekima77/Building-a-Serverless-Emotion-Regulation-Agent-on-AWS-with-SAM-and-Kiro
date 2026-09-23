# System Architecture

Detailed technical architecture of the Emotion Regulation Agent.

## High-Level Overview

The system follows a serverless, event-driven architecture built on AWS services:

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Client Application                           │
│                                                                      │
│   Web Browser / Mobile App / Chat Interface                         │
└──────────────────────────┬───────────────────────────────────────────┘
                           │ HTTPS REST API
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                      API Gateway (REST)                              │
│                                                                      │
│  - Authentication                                                    │
│  - Rate Limiting                                                     │
│  - Request/Response Validation                                       │
│  - Logging & Monitoring                                              │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│              Main Lambda Function (emotion-agent)                    │
│                                                                      │
│  1. Receives user input                                              │
│  2. Validates and sanitizes                                          │
│  3. Orchestrates downstream services                                 │
└──────────────────────────┬───────────────────────────────────────────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
   ┌─────────────┐  ┌──────────┐  ┌─────────────┐
   │   Bedrock   │  │ Breathing│  │   Lambda    │
   │   Client    │  │ Routine  │  │ Invocations │
   │             │  │ Generator│  │             │
   └─────────────┘  └──────────┘  └─────────────┘
        │                │              │    │    │
        ▼                ▼              ▼    ▼    ▼
   ┌─────────────────────────────────────────────────┐
   │  Stress Detection & Emotion Analysis            │
   │  - Keyword Pattern Matching                     │
   │  - Bedrock NLP Analysis                         │
   │  - Confidence Scoring                           │
   └─────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
   ┌─────────┐  ┌──────────┐  ┌─────────────┐
   │  Polly  │  │    S3    │  │  DynamoDB   │
   │  Audio  │  │Animation │  │   Logging   │
   └─────────┘  └──────────┘  └─────────────┘
        │               │               │
        ▼               ▼               ▼
   ┌─────────────────────────────────────────────────┐
   │         Response Aggregation & Formatting       │
   │                                                 │
   │  - Combine all outputs                          │
   │  - Generate URLs                                │
   │  - Format response JSON                         │
   └─────────────────────────────────────────────────┘
                        │
                        ▼
                 ┌─────────────┐
                 │   Client    │
                 │  Receives:  │
                 │  - Text     │
                 │  - Audio    │
                 │  - Animation│
                 │  - Insights │
                 └─────────────┘
```

## Component Architecture

### 1. API Gateway

**Purpose**: HTTP endpoint for client requests

**Features**:
- REST API with POST /emotion endpoint
- Authentication & authorization
- Request/response logging
- Automatic CORS handling
- Rate limiting and throttling

**Configuration**:
- Stage: dev/staging/prod
- CloudWatch logging enabled
- X-Ray tracing enabled
- Timeout: 60 seconds

### 2. Main Lambda Function (emotion-agent)

**Purpose**: Orchestrate all services

**Responsibilities**:
1. Receive and validate user input
2. Call Bedrock for emotion analysis
3. Generate breathing routine
4. Invoke audio and animation generators
5. Log interaction to DynamoDB
6. Aggregate responses

**Environment**:
- Memory: 768 MB
- Timeout: 60 seconds
- Reserved concurrency: 10

**Code Flow**:
```typescript
1. Parse input
2. Detect stress (Bedrock)
3. If stressed:
   - Generate routine
   - Call Polly (async)
   - Call S3 animation (async)
   - Log to DynamoDB
4. Return aggregated response
```

### 3. AWS Bedrock Integration

**Model**: Claude 3 Haiku

**Usage**:
- Emotion analysis from natural language
- Fallback to keyword matching if fails

**Request Format**:
```json
{
  "anthropic_version": "bedrock-2023-06-01",
  "max_tokens": 200,
  "messages": [
    {
      "role": "user",
      "content": "Analyze this text for stress..."
    }
  ]
}
```

**Response Parsing**:
```json
{
  "isStressed": true,
  "confidence": 0.85,
  "detectedEmotions": ["anxiety"],
  "stressKeywords": ["anxious"]
}
```

### 4. Breathing Routine Generation

**Lambda Function**: emotion-breathing-routine

**Algorithm**:
```
Function generateRoutine(intensity, duration):
  if duration == "quick":
    cycles = 3
  elif duration == "extended":
    cycles = 8
  else:  // standard
    cycles = 5
  
  routine = {
    inhaleSeconds: 4,
    holdSeconds: 4,
    exhaleSeconds: 6,
    cycles: cycles,
    duration: (4 + 4 + 6) * cycles
  }
  return routine
```

**Timing Pattern** (4-4-6):
- Inhale: 4 seconds
- Hold: 4 seconds
- Exhale: 6 seconds (longer exhale activates parasympathetic)

### 5. Audio Generation (Polly)

**Lambda Function**: emotion-audio-generation

**Process**:
1. Build SSML markup with prosody
2. Call Polly SynthesizeSpeech
3. Stream audio to S3
4. Generate presigned URL
5. Return audio resource

**SSML Template**:
```xml
<speak>
  <prosody rate="0.85" pitch="low">
    Personalized breathing instruction...
  </prosody>
</speak>
```

**Voice Selection**:
- Joanna (recommended): Natural, calm
- Matthew: Clear, authoritative
- Others available in config

**Output**:
- Format: MP3
- Bitrate: 128 kbps
- Storage: S3 with 30-day expiration

### 6. Animation Generation

**Lambda Function**: emotion-animation-generation

**Output**: Interactive HTML/CSS

**Key Components**:

1. **CSS Animations**:
```css
@keyframes breathe {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
```

2. **Expanding Circles** (concentric):
   - Circle 1: 200px diameter
   - Circle 2: 150px diameter
   - Circle 3: 100px diameter

3. **Real-time Phase Tracking**:
   - JavaScript timer
   - Updates every 100ms
   - Displays current phase (Inhale/Hold/Exhale)
   - Shows remaining seconds

4. **Responsive Design**:
   - Desktop: Full size (300px)
   - Mobile: Scaled down (200px)
   - Touch-friendly

5. **Theme Customization**:
   - Calm: Teal/green palette
   - Energetic: Purple palette
   - Minimal: Grayscale

### 7. DynamoDB Data Model

**Table**: emotion-interaction-logs

**Primary Key**:
- Partition Key: `id` (interaction ID)
- Sort Key: `userId` (user identifier)

**Global Secondary Index**:
- Partition Key: `userId`
- Sort Key: `timestamp`
- Use: Query interactions by user

**Item Structure**:
```json
{
  "id": "emotion-1234567890-abc123",
  "userId": "user-123",
  "timestamp": "2024-09-11T14:30:00Z",
  "userInput": "I'm feeling anxious...",
  "emotionAnalysis": {
    "isStressed": true,
    "confidence": 0.85,
    "detectedEmotions": ["anxiety"],
    "stressKeywords": ["anxious"]
  },
  "responseProvided": "I sense you're feeling anxious...",
  "resourcesGenerated": {
    "audioUrl": "s3://bucket/audio.mp3",
    "animationUrl": "s3://bucket/animation.html"
  }
}
```

**TTL**: 90 days (optional, for cost management)

### 8. S3 Storage

**Buckets**:

1. **Animation Bucket**:
   - Objects: HTML animation files
   - Naming: `animations/breathing-{timestamp}-{random}.html`
   - Retention: 30 days
   - CORS: Enabled for web access

2. **Audio Bucket**:
   - Objects: MP3 audio files
   - Naming: `audio/breathing-{timestamp}-{random}.mp3`
   - Retention: 30 days
   - Versioning: Enabled

**Lifecycle Rules**:
```yaml
- After 30 days: Delete old files
- After 7 days: Delete old versions
```

## Data Flow Diagrams

### Request-Response Flow

```
Client          API Gateway       Lambda           Bedrock
  │                  │               │                 │
  ├─POST /emotion──►│               │                 │
  │                  │               │                 │
  │                  ├──Invoke───►│               │
  │                  │               │                 │
  │                  │               ├─Analyze───────►│
  │                  │               │                 │
  │                  │               │◄─Analysis────│
  │                  │               │                 │
  │                  │               ├─Generate Routine
  │                  │               │
  │                  │               ├─Invoke Polly (async)
  │                  │               │
  │                  │               ├─Invoke S3 Upload (async)
  │                  │               │
  │                  │               ├─Log to DynamoDB
  │                  │               │
  │                  │◄─Response────│
  │◄─200 OK────────│               │
```

### Analytics Flow

```
DynamoDB           Analytics Lambda      CloudWatch
  │                      │                    │
  ├─Scan Interactions──►│                    │
  │                      │                    │
  │                      ├─Calculate Trends─►│
  │                      │                    │
  │                      ├─Analyze Patterns  │
  │                      │                    │
  │                      ├─Generate Report   │
  │                      │                    │
  │                      ├─Publish Metrics──►│
```

## Concurrency & Parallelization

### Async Operations

Key operations run in parallel:

```typescript
// Main Lambda
await Promise.all([
  pollyService.generateAudio(routine),      // ~3-5 seconds
  animationService.generateAnimation(routine), // ~2-3 seconds
  emotionAgent.logInteraction(...)           // ~1-2 seconds
]);
```

**Impact**:
- Sequential: ~15-20 seconds
- Parallel: ~5 seconds
- Improvement: 3-4x faster

### Lambda Concurrency

```yaml
ReservedConcurrentExecutions: 10
# Handles up to 10 simultaneous requests
# Excess requests queued by Lambda
```

## Error Handling & Resilience

### Fallback Mechanisms

```
Bedrock Analysis
  │
  ├─ Success: Use LLM results ✓
  │
  └─ Failure: Fallback to keyword matching
     └─ Success: Use keyword results ✓
     └─ Failure: Assume non-stressed
```

### Retry Logic

```typescript
// Exponential backoff for AWS API calls
const retryConfig = {
  maxAttempts: 3,
  backoffMultiplier: 2,
  initialDelayMs: 100
};
```

### Timeout Handling

| Component | Timeout |
|-----------|---------|
| Lambda | 60s |
| API Gateway | 29s (fixed) |
| Bedrock | 30s |
| Polly | 30s |
| DynamoDB | 10s |

## Security Architecture

### IAM Roles & Policies

```
lambda-execution-role
├── DynamoDB permissions (CRUD)
├── S3 permissions (read/write)
├── Polly permissions (SynthesizeSpeech)
├── Bedrock permissions (InvokeModel)
└── CloudWatch Logs (write)
```

### Data Protection

- **Encryption at Rest**: S3 and DynamoDB (optional, enabled by default)
- **Encryption in Transit**: HTTPS/TLS 1.2+
- **PII Handling**: Minimal user data stored (userId, anonymized interactions)

### Network Security

- **API Gateway**: Public endpoint with authentication
- **Lambda**: Can run in VPC for isolated environments
- **DynamoDB**: VPC endpoint available
- **S3**: Bucket policies restrict access

## Performance Optimization

### Caching Strategy

```yaml
API Gateway:
  CacheEnabled: true
  CacheTTL: 300  # 5 minutes for identical requests

S3 Objects:
  CacheControl: max-age=3600  # 1 hour

DynamoDB:
  DAX: Optional for high-traffic scenarios
```

### Memory Optimization

```yaml
Lambda Memory Profile:
  Main Lambda: 768 MB (faster CPU)
  Breathing Routine: 256 MB (simple logic)
  Audio Generation: 512 MB (Polly needs resources)
  Animation: 512 MB (HTML generation)
  Logging: 256 MB (lightweight)
```

### Database Optimization

```
DynamoDB:
- Pay-per-request (auto-scales)
- GSI for user queries
- TTL for automatic cleanup
- Point-in-time recovery enabled
```

## Monitoring & Observability

### Metrics

```
CloudWatch Metrics:
- Lambda invocations
- Lambda duration
- Lambda errors
- DynamoDB consumed capacity
- S3 requests
- API Gateway requests
```

### Logging

```
Log Groups:
/aws/lambda/emotion-agent-dev
/aws/lambda/emotion-breathing-routine-dev
/aws/lambda/emotion-audio-generation-dev
/aws/lambda/emotion-animation-generation-dev
/aws/lambda/emotion-logging-dev

Log Retention: 30 days
```

### Alarms

```
CloudWatch Alarms:
- Lambda error rate > 5%
- Lambda duration > 55s
- DynamoDB throttling
- API Gateway 5xx errors
- S3 access denied
```

## Scalability

### Horizontal Scaling

- **Lambda**: Auto-scales with concurrent requests
- **DynamoDB**: On-demand mode auto-scales
- **S3**: Unlimited storage
- **API Gateway**: Built-in auto-scaling

### Vertical Scaling

- **Lambda Memory**: Increase from 256MB to 3008MB
- **DynamoDB**: Switch to provisioned if needed
- **Cache**: Enable API Gateway caching

## Cost Breakdown (Estimated)

```
Monthly estimate (10K interactions):

AWS Bedrock:    $2-5 (based on token usage)
Lambda:         $0.50 (free tier covers most)
DynamoDB:       $1-3 (on-demand)
Polly:          $10-20 (4 per 1M chars)
S3:             <$1 (storage + transfer)
API Gateway:    <$1 (free tier covers most)
CloudWatch:     <$1 (logs retention)

Total: ~$15-30/month
```

---

For more information, see [AWS Architecture Best Practices](https://docs.aws.amazon.com/architecture/).
