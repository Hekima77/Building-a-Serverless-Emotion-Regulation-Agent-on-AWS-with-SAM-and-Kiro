/**
 * AWS Lambda Handler for Emotion Regulation Agent
 * Receives user input via API Gateway and returns breathing guidance
 */

import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import { EmotionAgent } from '../emotion-agent';

const emotionAgent = new EmotionAgent();

interface RequestBody {
  text: string;
  userId: string;
}

/**
 * Lambda handler for emotion analysis and breathing guidance
 */
export const handler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  try {
    // Parse request body
    const body: RequestBody = JSON.parse(event.body || '{}');

    if (!body.text || !body.userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: text and userId',
        }),
      };
    }

    // Process user input through emotion agent
    const response = await emotionAgent.processUserInput(body.text, body.userId);

    // Return successful response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        interactionId: response.interactionId,
        message: response.message,
        stressDetection: {
          isStressed: response.stressDetection.isStressed,
          confidence: response.stressDetection.confidence,
          detectedEmotions: response.stressDetection.detectedEmotions,
        },
        routine: response.routine
          ? {
              duration: response.routine.duration,
              cycles: response.routine.cycles,
              pattern: response.routine.pattern,
            }
          : null,
        timestamp: response.timestamp,
      }),
    };
  } catch (error) {
    console.error('Error processing request:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

/**
 * Lambda handler for retrieving user history
 */
export const historyHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.pathParameters?.userId || event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required parameter: userId',
        }),
      };
    }

    const history = await emotionAgent.getUserHistory(userId, 10);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        userId,
        logs: history,
      }),
    };
  } catch (error) {
    console.error('Error retrieving history:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
