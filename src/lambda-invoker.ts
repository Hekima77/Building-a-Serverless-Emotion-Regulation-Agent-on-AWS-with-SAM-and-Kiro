/**
 * Lambda function invoker
 * Handles invocation of AWS Lambda functions for breathing routine generation
 */

import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';
import { config } from './config';
import { logger } from './logger';
import { BreathingRoutine } from './types';

export interface LambdaInvokeParams {
  detectedEmotions: string[];
  intensity?: 'mild' | 'moderate' | 'severe';
  preferences?: {
    duration?: 'quick' | 'standard' | 'extended';
    language?: string;
  };
}

export class LambdaInvoker {
  private client: LambdaClient;
  private functionName: string;

  constructor() {
    this.client = new LambdaClient({ region: config.aws.region });
    this.functionName = config.lambda.functionName;
  }

  /**
   * Invoke Lambda function to generate breathing routine
   */
  async invokeBreathingRoutineFunction(
    params: LambdaInvokeParams
  ): Promise<BreathingRoutine | null> {
    try {
      logger.info('Invoking Lambda function', {
        functionName: this.functionName,
        emotions: params.detectedEmotions,
      });

      const command = new InvokeCommand({
        FunctionName: this.functionName,
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(params),
      });

      const response = await this.client.send(command);

      // Parse Lambda response
      if (response.Payload) {
        const payload = new TextDecoder().decode(response.Payload);
        const parsedPayload = JSON.parse(payload);

        logger.info('Lambda invocation successful', {
          statusCode: response.StatusCode,
        });

        // Extract routine from response body
        if (parsedPayload.body && parsedPayload.body.routine) {
          return parsedPayload.body.routine;
        }

        return parsedPayload.routine || null;
      }

      logger.warn('Empty Lambda response payload');
      return null;
    } catch (error) {
      logger.error('Error invoking Lambda function', error);
      return null;
    }
  }

  /**
   * Invoke Lambda asynchronously (fire-and-forget)
   */
  async invokeAsynchronous(params: LambdaInvokeParams): Promise<string | null> {
    try {
      logger.info('Invoking Lambda function asynchronously', {
        functionName: this.functionName,
      });

      const command = new InvokeCommand({
        FunctionName: this.functionName,
        InvocationType: 'Event', // Async invocation
        Payload: JSON.stringify(params),
      });

      const response = await this.client.send(command);

      logger.info('Async Lambda invocation submitted', {
        statusCode: response.StatusCode,
      });

      return response.StatusCode === 202 ? 'submitted' : null;
    } catch (error) {
      logger.error('Error invoking Lambda asynchronously', error);
      return null;
    }
  }

  /**
   * Check Lambda function availability
   */
  async checkFunctionHealth(): Promise<boolean> {
    try {
      logger.debug('Checking Lambda function health');

      // Try a minimal invocation to check if function is accessible
      const command = new InvokeCommand({
        FunctionName: this.functionName,
        InvocationType: 'DryRun',
        Payload: JSON.stringify({
          detectedEmotions: [],
        }),
      });

      const response = await this.client.send(command);

      const isHealthy = response.StatusCode === 204; // DryRun returns 204 if successful

      logger.info('Lambda health check', { isHealthy });
      return isHealthy;
    } catch (error) {
      logger.error('Lambda health check failed', error);
      return false;
    }
  }
}

export const lambdaInvoker = new LambdaInvoker();
