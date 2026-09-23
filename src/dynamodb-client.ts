/**
 * AWS DynamoDB client for logging and tracking emotional interactions
 * Stores emotion analysis results and user interactions for pattern tracking
 */

import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  QueryCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { config } from './config';
import { logger } from './logger';
import { InteractionLog, EmotionAnalysis } from './types';

export interface InteractionRecord {
  id: string;
  userId: string;
  timestamp: string;
  userInput: string;
  emotionAnalysis: EmotionAnalysis;
  responseProvided: string;
  resourcesGenerated: {
    audioUrl?: string;
    animationUrl?: string;
  };
}

export class DynamoDBClient {
  private client: DynamoDBClient;
  private tableName: string;

  constructor() {
    this.client = new DynamoDBClient({ region: config.aws.region });
    this.tableName = config.dynamodb.tableName;
  }

  /**
   * Log an interaction to DynamoDB
   */
  async logInteraction(record: InteractionRecord): Promise<boolean> {
    try {
      logger.info('Logging interaction to DynamoDB', {
        userId: record.userId,
        interactionId: record.id,
      });

      const command = new PutItemCommand({
        TableName: this.tableName,
        Item: marshall(record),
      });

      await this.client.send(command);

      logger.info('Interaction logged successfully', { id: record.id });
      return true;
    } catch (error) {
      logger.error('Error logging interaction to DynamoDB', error);
      return false;
    }
  }

  /**
   * Get interaction by ID
   */
  async getInteraction(id: string, userId: string): Promise<InteractionRecord | null> {
    try {
      logger.debug('Retrieving interaction from DynamoDB', { id, userId });

      const command = new GetItemCommand({
        TableName: this.tableName,
        Key: marshall({
          id,
          userId,
        }),
      });

      const response = await this.client.send(command);

      if (!response.Item) {
        logger.warn('Interaction not found', { id });
        return null;
      }

      const record = unmarshall(response.Item) as InteractionRecord;

      logger.debug('Interaction retrieved', { id });
      return record;
    } catch (error) {
      logger.error('Error retrieving interaction', error);
      return null;
    }
  }

  /**
   * Query interactions by user ID
   */
  async getUserInteractions(
    userId: string,
    limit: number = 10
  ): Promise<InteractionRecord[]> {
    try {
      logger.info('Querying user interactions', { userId, limit });

      const command = new QueryCommand({
        TableName: this.tableName,
        IndexName: 'userId-timestamp-index',
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: marshall({
          ':userId': userId,
        }),
        Limit: limit,
        ScanIndexForward: false, // Most recent first
      });

      const response = await this.client.send(command);

      const records = (response.Items || []).map((item) => unmarshall(item) as InteractionRecord);

      logger.info('User interactions retrieved', { userId, count: records.length });
      return records;
    } catch (error) {
      logger.error('Error querying user interactions', error);
      return [];
    }
  }

  /**
   * Get emotion summary for user (pattern tracking)
   */
  async getEmotionSummary(userId: string, days: number = 7): Promise<Record<string, number>> {
    try {
      logger.info('Generating emotion summary', { userId, days });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const interactions = await this.getUserInteractions(userId, 100);

      const emotionCounts: Record<string, number> = {};

      interactions.forEach((interaction) => {
        const recordDate = new Date(interaction.timestamp);

        if (recordDate >= startDate) {
          interaction.emotionAnalysis.detectedEmotions.forEach((emotion) => {
            emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
          });
        }
      });

      logger.info('Emotion summary generated', {
        userId,
        uniqueEmotions: Object.keys(emotionCounts).length,
      });

      return emotionCounts;
    } catch (error) {
      logger.error('Error generating emotion summary', error);
      return {};
    }
  }

  /**
   * Get stress frequency for user
   */
  async getStressFrequency(userId: string, days: number = 7): Promise<number> {
    try {
      logger.info('Calculating stress frequency', { userId, days });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const interactions = await this.getUserInteractions(userId, 100);

      const stressedInteractions = interactions.filter((interaction) => {
        const recordDate = new Date(interaction.timestamp);
        return recordDate >= startDate && interaction.emotionAnalysis.isStressed;
      });

      const frequency = (stressedInteractions.length / Math.max(interactions.length, 1)) * 100;

      logger.info('Stress frequency calculated', {
        userId,
        stressedCount: stressedInteractions.length,
        totalCount: interactions.length,
        frequencyPercent: frequency.toFixed(2),
      });

      return frequency;
    } catch (error) {
      logger.error('Error calculating stress frequency', error);
      return 0;
    }
  }

  /**
   * Get peak stress times
   */
  async getPeakStressTimes(userId: string, days: number = 7): Promise<Record<string, number>> {
    try {
      logger.info('Analyzing peak stress times', { userId, days });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const interactions = await this.getUserInteractions(userId, 200);

      const hourCounts: Record<string, number> = {};

      interactions.forEach((interaction) => {
        const recordDate = new Date(interaction.timestamp);

        if (recordDate >= startDate && interaction.emotionAnalysis.isStressed) {
          const hour = `${recordDate.getHours()}:00-${recordDate.getHours() + 1}:00`;
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });

      logger.info('Peak stress times analyzed', {
        userId,
        peakHours: Object.keys(hourCounts).length,
      });

      return hourCounts;
    } catch (error) {
      logger.error('Error analyzing peak stress times', error);
      return {};
    }
  }

  /**
   * Get most detected emotions
   */
  async getMostDetectedEmotions(userId: string, limit: number = 5): Promise<Array<[string, number]>> {
    try {
      const summary = await this.getEmotionSummary(userId);

      const sorted = Object.entries(summary)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);

      logger.info('Most detected emotions retrieved', { userId, emotions: sorted.map((e) => e[0]) });

      return sorted;
    } catch (error) {
      logger.error('Error getting most detected emotions', error);
      return [];
    }
  }

  /**
   * Log bulk interactions
   */
  async logBulkInteractions(records: InteractionRecord[]): Promise<number> {
    try {
      logger.info('Logging bulk interactions', { count: records.length });

      let successCount = 0;

      for (const record of records) {
        const success = await this.logInteraction(record);
        if (success) successCount++;
      }

      logger.info('Bulk logging completed', { successCount, totalCount: records.length });

      return successCount;
    } catch (error) {
      logger.error('Error logging bulk interactions', error);
      return 0;
    }
  }

  /**
   * Update interaction with resources
   */
  async updateInteractionResources(
    id: string,
    userId: string,
    audioUrl?: string,
    animationUrl?: string
  ): Promise<boolean> {
    try {
      logger.info('Updating interaction resources', { id, userId });

      const updateExpression = [];
      const expressionAttributeValues: Record<string, unknown> = {};

      if (audioUrl) {
        updateExpression.push('resourcesGenerated.audioUrl = :audioUrl');
        expressionAttributeValues[':audioUrl'] = audioUrl;
      }

      if (animationUrl) {
        updateExpression.push('resourcesGenerated.animationUrl = :animationUrl');
        expressionAttributeValues[':animationUrl'] = animationUrl;
      }

      if (updateExpression.length === 0) {
        logger.warn('No resources to update');
        return true;
      }

      const command = new UpdateItemCommand({
        TableName: this.tableName,
        Key: marshall({
          id,
          userId,
        }),
        UpdateExpression: `SET ${updateExpression.join(', ')}`,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
      });

      await this.client.send(command);

      logger.info('Interaction resources updated', { id });
      return true;
    } catch (error) {
      logger.error('Error updating interaction resources', error);
      return false;
    }
  }

  /**
   * Get interaction statistics
   */
  async getInteractionStats(userId: string): Promise<Record<string, unknown>> {
    try {
      logger.info('Calculating interaction statistics', { userId });

      const interactions = await this.getUserInteractions(userId, 100);

      const totalInteractions = interactions.length;
      const stressedInteractions = interactions.filter((i) => i.emotionAnalysis.isStressed).length;
      const avgConfidence =
        interactions.reduce((sum, i) => sum + i.emotionAnalysis.confidence, 0) /
        Math.max(totalInteractions, 1);

      const allEmotions = interactions.flatMap((i) => i.emotionAnalysis.detectedEmotions);
      const uniqueEmotions = new Set(allEmotions).size;

      const stats = {
        totalInteractions,
        stressedInteractions,
        stressPercentage: ((stressedInteractions / Math.max(totalInteractions, 1)) * 100).toFixed(2),
        averageConfidence: avgConfidence.toFixed(3),
        uniqueEmotionsDetected: uniqueEmotions,
        timeRange: {
          earliest: interactions[interactions.length - 1]?.timestamp,
          latest: interactions[0]?.timestamp,
        },
      };

      logger.info('Statistics calculated', stats);

      return stats;
    } catch (error) {
      logger.error('Error calculating statistics', error);
      return {};
    }
  }

  /**
   * Check DynamoDB table health
   */
  async checkTableHealth(): Promise<boolean> {
    try {
      logger.debug('Checking DynamoDB table health');

      const command = new ScanCommand({
        TableName: this.tableName,
        Limit: 1,
      });

      await this.client.send(command);

      logger.info('DynamoDB table is healthy');
      return true;
    } catch (error) {
      logger.error('DynamoDB table health check failed', error);
      return false;
    }
  }
}

export const dynamoDBClient = new DynamoDBClient();
