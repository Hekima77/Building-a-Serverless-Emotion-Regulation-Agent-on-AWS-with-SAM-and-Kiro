/**
 * Stress detection service
 */

import { bedrockClient } from './bedrock-client';
import { logger } from './logger';
import { UserInput, EmotionAnalysis } from './types';

export class StressDetector {
  /**
   * Detect stress in user input
   */
  async detectStress(input: UserInput): Promise<EmotionAnalysis> {
    logger.info('Processing user input for stress detection', {
      userId: input.userId,
      textLength: input.text.length,
    });

    if (!input.text || input.text.trim().length === 0) {
      logger.warn('Empty user input received');
      return {
        isStressed: false,
        confidence: 1.0,
        detectedEmotions: [],
        stressKeywords: [],
      };
    }

    // Use Bedrock for comprehensive analysis
    const analysis = await bedrockClient.analyzeEmotion(input.text);

    logger.info('Stress detection complete', {
      isStressed: analysis.isStressed,
      confidence: analysis.confidence,
      emotionCount: analysis.detectedEmotions.length,
    });

    return analysis;
  }
}

export const stressDetector = new StressDetector();
