"""
Lightweight Emotion Regulation Agent
Main orchestrator that coordinates stress detection, breathing routines, and logging
"""

import uuid
import time
from src.services.stress_detector import StressDetector
from src.services.breathing_routine import BreathingRoutineGenerator
from src.services.dynamodb_logger import DynamoDBLogger


class EmotionAgent:
    """Main orchestrator for emotion regulation system"""

    def __init__(self, dynamodb_table_name=None):
        """
        Initialize emotion agent with all services
        
        Args:
            dynamodb_table_name (str, optional): DynamoDB table name
        """
        self.stress_detector = StressDetector()
        self.routine_generator = BreathingRoutineGenerator()
        self.logger = DynamoDBLogger(dynamodb_table_name)

    def process_user_input(self, user_input, user_id):
        """
        Process user input and generate appropriate response
        
        Args:
            user_input (str): Text input from user
            user_id (str): Unique user identifier
            
        Returns:
            dict: Response with analysis, routine, and metadata
        """
        interaction_id = str(uuid.uuid4())
        timestamp = int(time.time() * 1000)  # milliseconds

        print(f"[EmotionAgent] Processing input for user: {user_id}")

        # Step 1: Detect stress from user input
        stress_detection = self.stress_detector.detect_stress(user_input)
        print(
            f"[EmotionAgent] Stress detected: {stress_detection['isStressed']}, confidence: {stress_detection['confidence']}"
        )

        # Step 2: Generate response message based on detected emotions
        emotion_message = self.stress_detector.get_emotion_message(stress_detection["detectedEmotions"])

        # Step 3: Generate breathing routine if stress is detected
        routine = None
        response_message = emotion_message

        if stress_detection["isStressed"]:
            routine = self.routine_generator.generate_routine()
            response_message += "\n\n" + routine["instructions"]
        else:
            response_message += "\n\nNo breathing exercise needed right now."

        # Step 4: Log interaction to DynamoDB
        log_data = {
            "interactionId": interaction_id,
            "timestamp": timestamp,
            "userId": user_id,
            "userInput": user_input,
            "detectedEmotions": stress_detection["detectedEmotions"],
            "isStressed": stress_detection["isStressed"],
            "confidence": stress_detection["confidence"],
            "ttl": 30 * 24 * 60 * 60,  # 30 days TTL
        }

        try:
            self.logger.log_interaction(log_data)
            print(f"[EmotionAgent] Interaction logged: {interaction_id}")
        except Exception as error:
            print(f"[EmotionAgent] Failed to log interaction: {str(error)}")
            # Don't fail the response if logging fails

        return {
            "interactionId": interaction_id,
            "message": response_message,
            "stressDetection": stress_detection,
            "routine": routine,
            "timestamp": timestamp,
        }

    def get_user_history(self, user_id, limit=10):
        """
        Get interaction history for a user
        
        Args:
            user_id (str): User ID to query
            limit (int): Maximum number of logs to retrieve
            
        Returns:
            list: User interaction history
        """
        try:
            return self.logger.get_recent_logs(user_id, limit)
        except Exception as error:
            print(f"[EmotionAgent] Failed to retrieve user history: {str(error)}")
            return []
