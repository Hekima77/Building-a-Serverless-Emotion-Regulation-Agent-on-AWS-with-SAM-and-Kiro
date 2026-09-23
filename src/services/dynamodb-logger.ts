/**
 * Lightweight DynamoDB Logging Service
 * Stores interaction logs with timestamp and detected emotions
 */

import { DynamoDB } from 'aws-sdk';

export interface InteractionLog {
  interactionId: string;
  timestamp: number; // Unix timestamp
  userId: string;
  userInput: string;
  detectedEmotions: string[];
  isStressed: boolean;
  confidence: number;
  ttl?: number; // Optional TTL for auto-deletion (seconds from now)
}

export class DynamoDBLogger {
  private dynamodb: DynamoDB.DocumentClient;
  private tableName: string;

  constructor(tableName?: string) {
    this.tableName = tableName || process.env.DYNAMODB_TABLE_NAME || 'emotion-logs-dev';

    // Support both AWS environment and local DynamoDB
    const dynamodbConfig: DynamoDB.DocumentClient.DocumentClientOptions & DynamoDB.ClientConfiguration =
      process.env.DYNAMODB_ENDPOINT
        ? {
            endpoint: process.env.DYNAMODB_ENDPOINT,
            region: process.env.AWS_REGION || 'us-east-1',
          }
        : {
            region: process.env.AWS_REGION || 'us-east-1',
          };

    this.dynamodb = new DynamoDB.DocumentClient(dynamodbConfig);
  }

  /**
   * Log an interaction to DynamoDB
   */
  async logInteraction(log: InteractionLog): Promise<void> {
    try {
      const item = {
        interactionId: log.interactionId,
        timestamp: log.timestamp,
        userId: log.userId,
        userInput: log.userInput,
        detectedEmotions: log.detectedEmotions,
        isStressed: log.isStressed,
        confidence: log.confidence,
        ...(log.ttl && { ttl: Math.floor(Date.now() / 1000) + log.ttl }), // TTL in seconds
      };

      await this.dynamodb
        .put({
          TableName: this.tableName,
          Item: item,
        })
        .promise();

      console.log(`[DynamoDB] Logged interaction: ${log.interactionId}`);
    } catch (error) {
      console.error('[DynamoDB] Error logging interaction:', error);
      throw error;
    }
  }

  /**
   * Retrieve all logs for a specific user
   */
  async getUserLogs(userId: string): Promise<InteractionLog[]> {
    try {
      const result = await this.dynamodb
        .query({
          TableName: this.tableName,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          },
          ScanIndexForward: false, // Sort by timestamp descending (newest first)
        })
        .promise();

      return (result.Items as InteractionLog[]) || [];
    } catch (error) {
      console.error('[DynamoDB] Error retrieving user logs:', error);
      throw error;
    }
  }

  /**
   * Get recent logs (last N interactions)
   */
  async getRecentLogs(userId: string, limit: number = 10): Promise<InteractionLog[]> {
    try {
      const result = await this.dynamodb
        .query({
          TableName: this.tableName,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId,
          },
          ScanIndexForward: false,
          Limit: limit,
        })
        .promise();

      return (result.Items as InteractionLog[]) || [];
    } catch (error) {
      console.error('[DynamoDB] Error retrieving recent logs:', error);
      throw error;
    }
  }
}
