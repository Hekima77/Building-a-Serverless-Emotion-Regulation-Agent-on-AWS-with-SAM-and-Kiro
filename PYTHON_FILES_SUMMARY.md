# Python Files Summary

## 🐍 All Python Files Created

### Core Services

#### 1. `src/services/stress_detector.py`
**Purpose**: Detects stress from user input using keyword matching

**Key Functions**:
- `StressDetector.detect_stress(text)` - Analyzes text for stress keywords
- `StressDetector.get_emotion_message(emotions)` - Creates human-readable message

**Emotions Detected**:
- anxiety, stress, sadness, anger, overwhelm

**Example**:
```python
detector = StressDetector()
result = detector.detect_stress("I'm feeling anxious")
# Returns: {"isStressed": True, "confidence": 0.67, "detectedEmotions": ["anxiety"]}
```

---

#### 2. `src/services/breathing_routine.py`
**Purpose**: Generates breathing exercise routines

**Key Functions**:
- `BreathingRoutineGenerator.generate_routine()` - Creates 4-4-6 breathing routine
- Returns: instructions, duration (70s), cycles (5), pattern

**Breathing Pattern**:
- Inhale: 4 seconds
- Hold: 4 seconds
- Exhale: 6 seconds
- Cycles: 5 (total 70 seconds)

**Example**:
```python
generator = BreathingRoutineGenerator()
routine = generator.generate_routine()
print(routine["instructions"])  # Full step-by-step guide
```

---

#### 3. `src/services/dynamodb_logger.py`
**Purpose**: Stores and retrieves interaction logs from DynamoDB

**Key Functions**:
- `DynamoDBLogger.log_interaction(log_data)` - Stores interaction
- `DynamoDBLogger.get_user_logs(user_id)` - Retrieves all user logs
- `DynamoDBLogger.get_recent_logs(user_id, limit)` - Gets N recent logs

**Storage**:
- Table: `emotion-logs-dev`
- Partition Key: `userId`
- Sort Key: `timestamp`
- TTL: 30 days (auto-delete)

**Example**:
```python
logger = DynamoDBLogger("emotion-logs-dev")
logger.log_interaction({
    "interactionId": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": 1693562400000,
    "userId": "user-123",
    "userInput": "I am anxious",
    "detectedEmotions": ["anxiety"],
    "isStressed": True,
    "confidence": 0.67,
    "ttl": 2592000  # 30 days
})
```

---

### Orchestrator

#### 4. `src/emotion_agent.py`
**Purpose**: Main orchestrator that coordinates all services

**Key Class**: `EmotionAgent`

**Key Functions**:
- `__init__(dynamodb_table_name)` - Initialize with optional table name
- `process_user_input(user_input, user_id)` - Main entry point
- `get_user_history(user_id, limit)` - Retrieve user history

**Workflow**:
1. Detect stress from input
2. Generate emotion message
3. Generate breathing routine if stressed
4. Log to DynamoDB
5. Return complete response

**Example**:
```python
agent = EmotionAgent()
response = agent.process_user_input("I'm feeling anxious", "user-123")
# Returns: interactionId, message, stressDetection, routine, timestamp
```

---

### Lambda Handlers

#### 5. `src/lambda/emotion_handler.py`
**Purpose**: AWS Lambda handlers for API endpoints

**Key Functions**:
- `emotion_handler(event, context)` - POST /emotion endpoint
- `history_handler(event, context)` - GET /history/{userId} endpoint

**Endpoint 1: emotion_handler**
- HTTP Method: POST
- Path: /emotion
- Request: `{"text": "user input", "userId": "user-id"}`
- Response: Emotion analysis + breathing routine

**Endpoint 2: history_handler**
- HTTP Method: GET
- Path: /history/{userId}
- Response: User's interaction history

**Example Event**:
```python
event = {
    "body": '{"text":"I am anxious","userId":"user-123"}',
    "httpMethod": "POST",
    "path": "/emotion"
}
```

---

### Configuration

#### 6. `requirements.txt`
**Purpose**: Python package dependencies

**Contents**:
```
boto3==1.28.85       # AWS SDK for Python
botocore==1.31.85    # Core AWS library
```

**Installation**:
```bash
pip install -r requirements.txt
```

---

### Infrastructure

#### 7. `template-python.yaml`
**Purpose**: AWS SAM template for infrastructure as code

**AWS Resources Created**:
1. **DynamoDB Table** (`EmotionLogsTable`)
   - Table Name: `emotion-logs-dev`
   - Billing: PAY_PER_REQUEST (auto-scale)
   - TTL: Enabled for 30-day auto-delete

2. **API Gateway** (`EmotionAgentAPI`)
   - Stage Name: dev/staging/prod
   - 2 Resources: /emotion, /history/{userId}

3. **Lambda Functions**
   - `EmotionAgentFunction` - emotion analysis
   - `HistoryFunction` - history retrieval
   - Runtime: python3.11
   - Memory: 256 MB
   - Timeout: 60 seconds

4. **CloudWatch Logs**
   - `/aws/lambda/emotion-agent-dev`
   - `/aws/lambda/emotion-history-dev`
   - Retention: 7 days

5. **IAM Roles**
   - DynamoDB CRUD for emotion function
   - DynamoDB Read for history function
   - Least-privilege access

**Deployment**:
```bash
sam deploy --template-file template-python.yaml --guided
```

---

### Tests

#### 8. `tests/test_stress_detector.py`
**Purpose**: Unit tests for stress detection

**Test Cases** (7 total):
1. `test_detect_stress_from_anxious_keywords()` - Detects anxiety
2. `test_detect_stress_from_overwhelm()` - Detects overwhelm
3. `test_detect_multiple_emotions()` - Detects multiple emotions
4. `test_no_stress_in_calm_text()` - Doesn't detect stress in calm text
5. `test_handle_empty_input()` - Handles empty input
6. `test_emotion_message_generation()` - Generates emotion messages
7. `test_emotion_message_calm()` - Generates calm message

**Run**:
```bash
python tests/test_stress_detector.py
```

---

#### 9. `tests/test_breathing_routine.py`
**Purpose**: Unit tests for breathing routine generation

**Test Cases** (4 total):
1. `test_generate_breathing_routine()` - Routine is generated
2. `test_calculate_correct_duration()` - Duration is 70 seconds
3. `test_generate_instructions_with_steps()` - Instructions include steps
4. `test_include_tips()` - Instructions include tips

**Run**:
```bash
python tests/test_breathing_routine.py
```

---

### Module Initialization

#### 10. `src/__init__.py`
**Purpose**: Makes `src/` a Python package

**Contents**:
```python
from .emotion_agent import EmotionAgent
__all__ = ["EmotionAgent"]
```

---

#### 11. `src/services/__init__.py`
**Purpose**: Makes `src/services/` a Python package

**Exports**:
- `StressDetector`
- `BreathingRoutineGenerator`
- `DynamoDBLogger`

---

#### 12. `src/lambda/__init__.py`
**Purpose**: Makes `src/lambda/` a Python package

---

## 📊 File Dependencies

```
emotion_handler.py (Lambda entry point)
    ↓
emotion_agent.py (Orchestrator)
    ↓
├─ stress_detector.py (Emotion analysis)
├─ breathing_routine.py (Routine generation)
└─ dynamodb_logger.py (DynamoDB operations)
    ↓
    boto3 (AWS SDK)
```

---

## 🔄 Data Flow

### Request → Response

```
1. User Input
   ↓
2. emotion_handler() receives POST /emotion
   ↓
3. EmotionAgent.process_user_input()
   ├─ StressDetector.detect_stress()
   ├─ BreathingRoutineGenerator.generate_routine()
   ├─ DynamoDBLogger.log_interaction()
   ↓
4. Return JSON response
   {
     "interactionId": "uuid",
     "stressDetection": {...},
     "routine": {...},
     "message": "..."
   }
```

---

## 📝 Environment Variables

Set by Lambda:
- `AWS_REGION` - AWS region (us-east-1)
- `DYNAMODB_TABLE_NAME` - Table name (emotion-logs-dev)
- `DYNAMODB_ENDPOINT` - Endpoint URL (for local testing)

---

## 🧪 Testing Locally

### 1. Test Services Without DynamoDB:
```python
from src.services.stress_detector import StressDetector
from src.services.breathing_routine import BreathingRoutineGenerator

detector = StressDetector()
result = detector.detect_stress("I am anxious")
print(result)

generator = BreathingRoutineGenerator()
routine = generator.generate_routine()
print(routine["instructions"])
```

### 2. Run Test Suites:
```bash
python tests/test_stress_detector.py
python tests/test_breathing_routine.py
```

### 3. Test Full Orchestrator (requires DynamoDB):
```python
from src.emotion_agent import EmotionAgent

agent = EmotionAgent()  # Will try to connect to DynamoDB
response = agent.process_user_input("I am anxious", "user-123")
print(response)
```

---

## 🚀 Deployment Structure

After `sam deploy`, the structure becomes:

```
AWS Cloud
├─ Lambda
│  ├─ emotion-agent-dev (emotion_handler function)
│  └─ emotion-history-dev (history_handler function)
├─ API Gateway
│  ├─ POST /emotion
│  └─ GET /history/{userId}
├─ DynamoDB
│  └─ emotion-logs-dev (table)
└─ CloudWatch
   ├─ /aws/lambda/emotion-agent-dev
   └─ /aws/lambda/emotion-history-dev
```

---

## 📊 Code Statistics

- **Total Lines**: ~600 (Python)
- **Files**: 12 (services, handlers, tests, config)
- **Test Cases**: 11
- **Functions**: 15+
- **AWS Services**: 5 (Lambda, API Gateway, DynamoDB, CloudWatch, IAM)

---

## ✅ Ready to Deploy!

**All Python files are complete and tested.**

Next step:
```bash
sam deploy --template-file template-python.yaml --guided
```

---

**Conversion Date**: September 11, 2026  
**Status**: ✅ Production Ready  
**Runtime**: Python 3.11  
**Framework**: AWS SAM
