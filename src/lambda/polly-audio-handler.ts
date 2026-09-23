/**
 * AWS Lambda handler for Polly audio generation
 * Generates audio versions of breathing routines
 */

import { audioService } from '../audio-service';
import { logger } from '../logger';
import { AudioResource, BreathingRoutine } from '../types';

export interface AudioGenerationEvent {
  routine: BreathingRoutine;
  detectedEmotions: string[];
  audioFormats?: ('routine' | 'intro' | 'guidance')[];
}

export interface AudioLambdaResponse {
  statusCode: number;
  body: {
    audio?: AudioResource | Record<string, AudioResource>;
    message: string;
    success: boolean;
  };
}

/**
 * Main Lambda handler for audio generation
 */
export async function handler(event: AudioGenerationEvent): Promise<AudioLambdaResponse> {
  logger.info('Polly audio generation Lambda invoked', {
    routine: event.routine,
    emotions: event.detectedEmotions,
  });

  try {
    const requestedFormats = event.audioFormats || ['routine'];

    let audioResult: AudioResource | Record<string, AudioResource> | null = null;

    if (requestedFormats.includes('routine') && requestedFormats.length === 1) {
      // Single routine audio
      audioResult = await audioService.generateRoutineAudio(event.routine);
    } else {
      // Full package with intro, routine, and guidance
      audioResult = await audioService.generateBreathingAudioPackage(
        event.routine,
        event.detectedEmotions
      );
    }

    if (!audioResult) {
      return {
        statusCode: 500,
        body: {
          message: 'Failed to generate audio files',
          success: false,
        },
      };
    }

    return {
      statusCode: 200,
      body: {
        audio: audioResult,
        message: 'Audio generated successfully',
        success: true,
      },
    };
  } catch (error) {
    logger.error('Error generating audio in Lambda', error);

    return {
      statusCode: 500,
      body: {
        message: 'Internal error during audio generation',
        success: false,
      },
    };
  }
}

/**
 * Async handler for batch audio generation
 */
export async function batchGenerateAudio(
  routines: BreathingRoutine[],
  emotions: string[][]
): Promise<(AudioResource | null)[]> {
  logger.info('Batch audio generation started', { routineCount: routines.length });

  const results = await Promise.all(
    routines.map((routine, index) =>
      audioService
        .generateRoutineAudio(routine)
        .catch((error) => {
          logger.error(`Error generating audio for routine ${index}`, error);
          return null;
        })
    )
  );

  logger.info('Batch audio generation completed', {
    successful: results.filter((r) => r !== null).length,
    total: results.length,
  });

  return results;
}
