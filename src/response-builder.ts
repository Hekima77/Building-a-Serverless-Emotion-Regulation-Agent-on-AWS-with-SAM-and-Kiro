/**
 * Response builder for the emotion regulation agent
 */

import { v4 as uuidv4 } from 'crypto';
import { AgentResponse, EmotionAnalysis, BreathingRoutine } from './types';
import { breathingRoutineGenerator } from './breathing-routine';
import { logger } from './logger';

export class ResponseBuilder {
  /**
   * Build response for stressed user
   */
  buildStressResponse(emotionAnalysis: EmotionAnalysis): AgentResponse {
    const interactionId = this.generateId();

    logger.info('Building stress response', { interactionId, emotions: emotionAnalysis.detectedEmotions });

    // Get contextual message based on detected emotions
    const contextualMessage = breathingRoutineGenerator.getContextualMessage(emotionAnalysis.detectedEmotions);

    // Generate breathing routine
    const routine = breathingRoutineGenerator.generateStandardRoutine();
    const detailedInstructions = breathingRoutineGenerator.generateDetailedRoutine();

    const message = `${contextualMessage}

${detailedInstructions}

═══════════════════════════════════════════════════════════

WHAT TO EXPECT:
• Your heart rate will begin to slow down
• Tension in your shoulders and jaw will ease
• Your mind will become clearer
• A sense of calm will gradually take over

Remember: This feeling of stress is temporary. Your body has the ability to self-regulate.
You're doing great by taking this moment for yourself.`;

    return {
      message,
      routine,
      interactionId,
    };
  }

  /**
   * Build response for non-stressed user
   */
  buildNeutralResponse(): AgentResponse {
    const interactionId = this.generateId();

    logger.info('Building neutral response', { interactionId });

    const message = `I'm here whenever you need a break. 

If you're feeling stressed, anxious, or overwhelmed, just let me know and I'll guide you through a calming breathing exercise. Remember, taking care of your emotional well-being is just as important as physical health.

Feel free to share what's on your mind anytime. 💙`;

    return {
      message,
      interactionId,
    };
  }

  /**
   * Generate unique interaction ID
   */
  private generateId(): string {
    return `emotion-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const responseBuilder = new ResponseBuilder();
