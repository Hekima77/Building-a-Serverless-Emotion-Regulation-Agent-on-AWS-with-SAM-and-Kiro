"""
Lightweight DynamoDB Logging Service
Stores interaction logs with timestamp and detected emotions
"""

import os
import boto3
from datetime import datetime, timedelta


class DynamoDBLogger:
    """Handles DynamoDB operations for storing and retrieving interactions"""

    def __init__(self, table_name=None):
        """
        Initialize DynamoDB logger
        
        Args:
            table_name (str, optional): DynamoDB table name
        """
        self.table_name = table_name or os.environ.get("DYNAMODB_TABLE_NAME", "emotion-logs-dev")

        # Support both AWS environment and local DynamoDB
        dynamodb_config = {}
        if os.environ.get("DYNAMODB_ENDPOINT"):
            dynamodb_config["endpoint_url"] = os.environ.get("DYNAMODB_ENDPOINT")

        dynamodb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "us-east-1"), **dynamodb_config)
        self.table = dynamodb.Table(self.table_name)

    def log_interaction(self, interaction_log):
        """
        Log an interaction to DynamoDB
        
        Args:
            interaction_log (dict): Interaction data to log
            
        Returns:
            dict: Response from DynamoDB
        """
        try:
            item = {
                "interactionId": interaction_log["interactionId"],
                "timestamp": interaction_log["timestamp"],
                "userId": interaction_log["userId"],
                "userInput": interaction_log["userInput"],
                "detectedEmotions": interaction_log["detectedEmotions"],
                "isStressed": interaction_log["isStressed"],
                "confidence": interaction_log["confidence"],
            }

            # Add TTL if specified (30 days default)
            if interaction_log.get("ttl"):
                item["ttl"] = int((datetime.utcnow() + timedelta(seconds=interaction_log["ttl"])).timestamp())

            response = self.table.put_item(Item=item)
            print(f"[DynamoDB] Logged interaction: {interaction_log['interactionId']}")
            return response

        except Exception as error:
            print(f"[DynamoDB] Error logging interaction: {str(error)}")
            raise

    def get_user_logs(self, user_id):
        """
        Retrieve all logs for a specific user
        
        Args:
            user_id (str): User ID to query
            
        Returns:
            list: List of interaction logs
        """
        try:
            response = self.table.query(
                KeyConditionExpression="userId = :userId", ExpressionAttributeValues={":userId": user_id}, ScanIndexForward=False
            )

            return response.get("Items", [])

        except Exception as error:
            print(f"[DynamoDB] Error retrieving user logs: {str(error)}")
            raise

    def get_recent_logs(self, user_id, limit=10):
        """
        Get recent logs (last N interactions)
        
        Args:
            user_id (str): User ID to query
            limit (int): Maximum number of logs to retrieve
            
        Returns:
            list: List of recent interaction logs
        """
        try:
            response = self.table.query(
                KeyConditionExpression="userId = :userId",
                ExpressionAttributeValues={":userId": user_id},
                ScanIndexForward=False,
                Limit=limit,
            )

            return response.get("Items", [])

        except Exception as error:
            print(f"[DynamoDB] Error retrieving recent logs: {str(error)}")
            raise
