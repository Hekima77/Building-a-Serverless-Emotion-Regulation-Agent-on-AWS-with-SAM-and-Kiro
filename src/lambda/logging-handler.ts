/**
 * AWS Lambda handler for interaction logging and analytics
 */

import { loggingService } from '../logging-service';
import { analyticsService } from '../analytics-service';
import { logger } from '../logger';
import { AgentResponse, EmotionAnalysis } from '../types';

export interface LoggingEvent {
  userId: string;
  userInput: string;
  emotionAnalysis: EmotionAnalysis;
  agentResponse: AgentResponse;
  audioUrl?: string;
  animationUrl?: string;
}

export interface AnalyticsEvent {
  userId: string;
  action: 'insights' | 'progression' | 'patterns' | 'summary';
  days?: number;
}

export interface LoggingLambdaResponse {
  statusCode: number;
  body: {
    result?: Record<string, unknown> | string;
    message: string;
    success: boolean;
  };
}

/**
 * Main logging handler
 */
export async function handleLogging(event: LoggingEvent): Promise<LoggingLambdaResponse> {
  logger.info('Logging Lambda invoked', {
    userId: event.userId,
    interactionId: event.agentResponse.interactionId,
  });

  try {
    const success = await loggingService.logAgentInteraction(
      event.userId,
      event.userInput,
      event.emotionAnalysis,
      event.agentResponse,
      event.audioUrl,
      event.animationUrl
    );

    if (!success) {
      return {
        statusCode: 500,
        body: {
          message: 'Failed to log interaction',
          success: false,
        },
      };
    }

    return {
      statusCode: 200,
      body: {
        message: 'Interaction logged successfully',
        success: true,
      },
    };
  } catch (error) {
    logger.error('Error in logging Lambda', error);

    return {
      statusCode: 500,
      body: {
        message: 'Internal error during logging',
        success: false,
      },
    };
  }
}

/**
 * Analytics handler
 */
export async function handleAnalytics(event: AnalyticsEvent): Promise<LoggingLambdaResponse> {
  logger.info('Analytics Lambda invoked', {
    userId: event.userId,
    action: event.action,
  });

  try {
    let result: Record<string, unknown> | string;

    switch (event.action) {
      case 'insights':
        result = await analyticsService.generateUserInsights(event.userId);
        break;

      case 'progression':
        result = await analyticsService.getEmotionProgression(event.userId, event.days || 30);
        break;

      case 'patterns':
        result = await analyticsService.compareStressPatterns(event.userId);
        break;

      case 'summary':
        result = await analyticsService.exportUserSummary(event.userId);
        break;

      default:
        return {
          statusCode: 400,
          body: {
            message: `Unknown analytics action: ${event.action}`,
            success: false,
          },
        };
    }

    return {
      statusCode: 200,
      body: {
        result,
        message: `Analytics action '${event.action}' completed successfully`,
        success: true,
      },
    };
  } catch (error) {
    logger.error('Error in analytics Lambda', error);

    return {
      statusCode: 500,
      body: {
        message: 'Internal error during analytics',
        success: false,
      },
    };
  }
}

/**
 * Report generation handler
 */
export async function handleReportGeneration(event: { userId: string; days?: number }): Promise<LoggingLambdaResponse> {
  logger.info('Report generation Lambda invoked', { userId: event.userId });

  try {
    const report = await loggingService.generateInteractionReport(event.userId, event.days || 7);

    return {
      statusCode: 200,
      body: {
        result: report,
        message: 'Report generated successfully',
        success: true,
      },
    };
  } catch (error) {
    logger.error('Error generating report', error);

    return {
      statusCode: 500,
      body: {
        message: 'Failed to generate report',
        success: false,
      },
    };
  }
}

/**
 * Batch logging handler
 */
export async function handleBatchLogging(event: {
  interactions: Array<{
    userId: string;
    userInput: string;
    emotionAnalysis: EmotionAnalysis;
    responseProvided: string;
  }>;
}): Promise<LoggingLambdaResponse> {
  logger.info('Batch logging Lambda invoked', { count: event.interactions.length });

  try {
    const records = event.interactions.map((interaction) => ({
      id: `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: interaction.userId,
      timestamp: new Date().toISOString(),
      userInput: interaction.userInput,
      emotionAnalysis: interaction.emotionAnalysis,
      responseProvided: interaction.responseProvided,
      resourcesGenerated: {},
    }));

    const successCount = await loggingService.logBatchInteractions(records);

    return {
      statusCode: 200,
      body: {
        result: { logged: successCount, total: records.length },
        message: `Batch logging completed: ${successCount}/${records.length} interactions logged`,
        success: true,
      },
    };
  } catch (error) {
    logger.error('Error in batch logging', error);

    return {
      statusCode: 500,
      body: {
        message: 'Batch logging failed',
        success: false,
      },
    };
  }
}
