/**
 * AWS Lambda handler for breathing routine generation
 * This function is invoked when stress is detected and returns a guided breathing routine
 */

import { breathingRoutineGenerator } from '../breathing-routine';
import { logger } from '../logger';
import { BreathingRoutine } from '../types';

export interface LambdaEvent {
  detectedEmotions: string[];
  intensity?: 'mild' | 'moderate' | 'severe';
  preferences?: {
    duration?: 'quick' | 'standard' | 'extended';
    language?: string;
  };
}

export interface LambdaResponse {
  statusCode: number;
  body: {
    routine: BreathingRoutine;
    message: string;
    timestamp: string;
    success: boolean;
  };
}

/**
 * Main Lambda handler
 */
export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  logger.info('Breathing routine Lambda invoked', { event });

  try {
    // Determine routine based on intensity or preference
    let routine: BreathingRoutine;
    const duration = event.preferences?.duration || 'standard';

    switch (duration) {
      case 'quick':
        routine = breathingRoutineGenerator.generateQuickRoutine();
        break;
      case 'extended':
        routine = breathingRoutineGenerator.generateExtendedRoutine();
        break;
      case 'standard':
      default:
        routine = breathingRoutineGenerator.generateStandardRoutine();
        break;
    }

    // Get contextual message based on emotions
    const contextualMessage = breathingRoutineGenerator.getContextualMessage(
      event.detectedEmotions || []
    );

    const response: LambdaResponse = {
      statusCode: 200,
      body: {
        routine,
        message: contextualMessage,
        timestamp: new Date().toISOString(),
        success: true,
      },
    };

    logger.info('Breathing routine generated successfully', {
      duration,
      cycles: routine.cycles,
      totalDuration: routine.duration,
    });

    return response;
  } catch (error) {
    logger.error('Error generating breathing routine', error);

    return {
      statusCode: 500,
      body: {
        routine: breathingRoutineGenerator.generateStandardRoutine(),
        message: 'An error occurred, but here is a standard breathing routine to help you feel calmer.',
        timestamp: new Date().toISOString(),
        success: false,
      },
    };
  }
}

/**
 * Advanced routine generator for specific scenarios
 */
export async function generateAdvancedRoutine(
  emotionIntensity: 'mild' | 'moderate' | 'severe'
): Promise<BreathingRoutine> {
  switch (emotionIntensity) {
    case 'mild':
      // Quick routine for mild stress
      return breathingRoutineGenerator.generateQuickRoutine();

    case 'moderate':
      // Standard routine for moderate stress
      return breathingRoutineGenerator.generateStandardRoutine();

    case 'severe':
      // Extended routine for severe stress - longer to help deeper relaxation
      return breathingRoutineGenerator.generateExtendedRoutine();

    default:
      return breathingRoutineGenerator.generateStandardRoutine();
  }
}

/**
 * Generate routine details in multiple formats
 */
export interface RoutineFormats {
  textual: string;
  structured: BreathingRoutine;
  timing: number[];
}

export async function generateRoutineInMultipleFormats(
  emotions: string[]
): Promise<RoutineFormats> {
  const routine = breathingRoutineGenerator.generateStandardRoutine();
  const textual = breathingRoutineGenerator.generateDetailedRoutine();

  // Generate timing array for visual/audio cues
  const timing: number[] = [];
  for (let i = 0; i < routine.cycles; i++) {
    timing.push(routine.inhaleCount); // Inhale
    timing.push(routine.holdCount); // Hold
    timing.push(routine.exhaleCount); // Exhale
  }

  return {
    textual,
    structured: routine,
    timing,
  };
}
