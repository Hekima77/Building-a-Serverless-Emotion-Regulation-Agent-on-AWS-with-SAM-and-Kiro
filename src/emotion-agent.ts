/**
 * Lightweight Emotion Regulation Agent
 * Main orchestrator that coordinates stress detection, breathing routines, and logging
 */

import { v4 as uuidv4 } from 'uuid';
import { StressDetector, StressDetectionResult } from './services/stress-detector';
import { BreathingRoutineGenerator, BreathingRoutine } from './services/breathing-routine';
import { DynamoDBLogger, InteractionLog } from './services/dynamodb-logger';

export interface EmotionAgentResponse {
  interactionId: string;
  message: string;
  stressDetection: StressDetectionResult;
  routine: BreathingRoutine | null;
  timestamp: number;
}

export class EmotionAgent {
  private stressDetector: StressDetector;
  private routineGenerator: BreathingRoutineGenerator;
  private logger: DynamoDBLogger;

  constructor(dynamodbTableName?: string) {
    this.stressDetector = new StressDetector();
    this.routineGenerator = new BreathingRoutineGenerator();
    this.logger = new DynamoDBLogger(dynamodbTableName);
  }

  /**
   * Process user input and generate appropriate response
   */
  async processUserInput(userInput: string, userId: string): Promise<EmotionAgentResponse> {
    const interactionId = uuidv4();
    const timestamp = Date.now();

    console.log(`[EmotionAgent] Processing input for user: ${userId}`);

    // Step 1: Detect stress from user input
    const stressDetection = this.stressDetector.detectStress(userInput);
    console.log(`[EmotionAgent] Stress detected: ${stressDetection.isStressed}, confidence: ${stressDetection.confidence}`);

    // Step 2: Generate response message based on detected emotions
    const emotionMessage = this.stressDetector.getEmotionMessage(stressDetection.detectedEmotions);

    // Step 3: Generate breathing routine if stress is detected
    let routine: BreathingRoutine | null = null;
    let responseMessage = emotionMessage;

    if (stressDetection.isStressed) {
      routine = this.routineGenerator.generateRoutine();
      responseMessage += '\n\n' + routine.instructions;
    } else {
      responseMessage += '\n\nNo breathing exercise needed right now.';
    }

    // Step 4: Log interaction to DynamoDB
    const log: InteractionLog = {
      interactionId,
      timestamp,
      userId,
      userInput,
      detectedEmotions: stressDetection.detectedEmotions,
      isStressed: stressDetection.isStressed,
      confidence: stressDetection.confidence,
      ttl: 30 * 24 * 60 * 60, // 30 days TTL
    };

    try {
      await this.logger.logInteraction(log);
      console.log(`[EmotionAgent] Interaction logged: ${interactionId}`);
    } catch (error) {
      console.error('[EmotionAgent] Failed to log interaction:', error);
      // Don't fail the response if logging fails
    }

    return {
      interactionId,
      message: responseMessage,
      stressDetection,
      routine,
      timestamp,
    };
  }

  /**
   * Get interaction history for a user
   */
  async getUserHistory(userId: string, limit: number = 10): Promise<InteractionLog[]> {
    try {
      return await this.logger.getRecentLogs(userId, limit);
    } catch (error) {
      console.error('[EmotionAgent] Failed to retrieve user history:', error);
      return [];
    }
  }
}
