/**
 * Logging service that integrates interaction logging with DynamoDB
 */

import { dynamoDBClient, InteractionRecord } from './dynamodb-client';
import { logger } from './logger';
import { AgentResponse, EmotionAnalysis } from './types';

export class LoggingService {
  /**
   * Log a complete agent interaction
   */
  async logAgentInteraction(
    userId: string,
    userInput: string,
    emotionAnalysis: EmotionAnalysis,
    agentResponse: AgentResponse,
    audioUrl?: string,
    animationUrl?: string
  ): Promise<boolean> {
    try {
      logger.info('Logging agent interaction', {
        userId,
        interactionId: agentResponse.interactionId,
        isStressed: emotionAnalysis.isStressed,
      });

      const record: InteractionRecord = {
        id: agentResponse.interactionId,
        userId,
        timestamp: new Date().toISOString(),
        userInput,
        emotionAnalysis,
        responseProvided: agentResponse.message.substring(0, 500), // Store first 500 chars
        resourcesGenerated: {
          audioUrl,
          animationUrl,
        },
      };

      const success = await dynamoDBClient.logInteraction(record);

      if (success) {
        logger.info('Agent interaction logged successfully', { userId });
      }

      return success;
    } catch (error) {
      logger.error('Error logging agent interaction', error);
      return false;
    }
  }

  /**
   * Log batch interactions
   */
  async logBatchInteractions(interactions: InteractionRecord[]): Promise<number> {
    logger.info('Logging batch of interactions', { count: interactions.length });
    return await dynamoDBClient.logBulkInteractions(interactions);
  }

  /**
   * Update logged interaction with generated resources
   */
  async updateResourceLinks(
    interactionId: string,
    userId: string,
    audioUrl?: string,
    animationUrl?: string
  ): Promise<boolean> {
    logger.info('Updating resource links for interaction', { interactionId, userId });

    return await dynamoDBClient.updateInteractionResources(
      interactionId,
      userId,
      audioUrl,
      animationUrl
    );
  }

  /**
   * Retrieve user interaction history
   */
  async getUserHistory(userId: string, limit: number = 20): Promise<InteractionRecord[]> {
    logger.info('Retrieving user interaction history', { userId, limit });

    return await dynamoDBClient.getUserInteractions(userId, limit);
  }

  /**
   * Get interaction by ID
   */
  async getInteractionDetail(id: string, userId: string): Promise<InteractionRecord | null> {
    logger.info('Retrieving interaction detail', { id, userId });

    return await dynamoDBClient.getInteraction(id, userId);
  }

  /**
   * Generate detailed interaction report
   */
  async generateInteractionReport(userId: string, days: number = 7): Promise<string> {
    try {
      logger.info('Generating interaction report', { userId, days });

      const interactions = await dynamoDBClient.getUserInteractions(userId, 100);
      const stats = await dynamoDBClient.getInteractionStats(userId);
      const emotionSummary = await dynamoDBClient.getEmotionSummary(userId, days);
      const stressFrequency = await dynamoDBClient.getStressFrequency(userId, days);

      const report = `
EMOTION REGULATION INTERACTION REPORT
======================================

Generated: ${new Date().toISOString()}
User ID: ${userId}
Report Period: Last ${days} days

SUMMARY STATISTICS
──────────────────
Total Interactions: ${stats.totalInteractions}
Stressed Interactions: ${stats.stressedInteractions}
Stress Percentage: ${stats.stressPercentage}%
Average Confidence: ${stats.averageConfidence}
Unique Emotions Detected: ${stats.uniqueEmotionsDetected}

EMOTION BREAKDOWN
─────────────────
${Object.entries(emotionSummary)
  .sort((a, b) => b[1] - a[1])
  .map(([emotion, count]) => `  ${emotion}: ${count} times`)
  .join('\n')}

KEY INSIGHTS
────────────
- Overall stress frequency: ${stressFrequency.toFixed(1)}%
- Most common stress trigger: ${Object.entries(emotionSummary)[0]?.[0] || 'Not enough data'}
- Time range: ${stats.timeRange.earliest} to ${stats.timeRange.latest}

RECOMMENDATIONS
────────────────
1. Continue using breathing exercises when stress is detected
2. Track patterns in your stress triggers
3. Practice preventative breathing during your peak stress times
4. Maintain consistent use of emotion tracking for better insights

Report Generated Successfully
    `.trim();

      logger.info('Interaction report generated', { userId });

      return report;
    } catch (error) {
      logger.error('Error generating interaction report', error);
      return 'Error generating report';
    }
  }

  /**
   * Check logging system health
   */
  async checkLoggingHealth(): Promise<boolean> {
    try {
      logger.debug('Checking logging service health');

      const tableHealth = await dynamoDBClient.checkTableHealth();

      logger.info('Logging service health check', { tableHealth });

      return tableHealth;
    } catch (error) {
      logger.error('Logging health check failed', error);
      return false;
    }
  }
}

export const loggingService = new LoggingService();
