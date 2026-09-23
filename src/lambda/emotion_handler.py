"""
AWS Lambda Handler for Emotion Regulation Agent
Receives user input via API Gateway and returns breathing guidance
"""

import json
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from emotion_agent import EmotionAgent

# Initialize agent (reused across Lambda invocations)
emotion_agent = EmotionAgent()


def emotion_handler(event, context):
    """
    Lambda handler for emotion analysis and breathing guidance
    
    Args:
        event (dict): API Gateway event
        context (object): Lambda context
        
    Returns:
        dict: API Gateway response with status and body
    """
    print("Event received:", json.dumps(event))

    try:
        # Parse request body
        body = json.loads(event.get("body", "{}"))

        if not body.get("text") or not body.get("userId"):
            return {
                "statusCode": 400,
                "headers": {"Content-Type": "application/json"},
                "body": json.dumps({"error": "Missing required fields: text and userId"}),
            }

        # Process user input through emotion agent
        response = emotion_agent.process_user_input(body["text"], body["userId"])

        # Return successful response
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(
                {
                    "success": True,
                    "interactionId": response["interactionId"],
                    "message": response["message"],
                    "stressDetection": {
                        "isStressed": response["stressDetection"]["isStressed"],
                        "confidence": response["stressDetection"]["confidence"],
                        "detectedEmotions": response["stressDetection"]["detectedEmotions"],
                    },
                    "routine": (
                        {
                            "duration": response["routine"]["duration"],
                            "cycles": response["routine"]["cycles"],
                            "pattern": response["routine"]["pattern"],
                        }
                        if response["routine"]
                        else None
                    ),
                    "timestamp": response["timestamp"],
                }
            ),
        }

    except Exception as error:
        print("Error processing request:", str(error))

        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(
                {
                    "error": "Internal server error",
                    "message": str(error),
                }
            ),
        }


def history_handler(event, context):
    """
    Lambda handler for retrieving user history
    
    Args:
        event (dict): API Gateway event
        context (object): Lambda context
        
    Returns:
        dict: API Gateway response with user history
    """
    try:
        # Get userId from path or query parameters
        user_id = event.get("pathParameters", {}).get("userId") or event.get("queryStringParameters", {}).get("userId")

        if not user_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing required parameter: userId"}),
            }

        history = emotion_agent.get_user_history(user_id, 10)

        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(
                {
                    "success": True,
                    "userId": user_id,
                    "logs": history,
                }
            ),
        }

    except Exception as error:
        print("Error retrieving history:", str(error))

        return {
            "statusCode": 500,
            "headers": {"Content-Type": "application/json"},
            "body": json.dumps(
                {
                    "error": "Internal server error",
                    "message": str(error),
                }
            ),
        }
