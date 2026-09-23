/**
 * AWS Lambda handler for animation generation and S3 upload
 */

import { animationService } from '../animation-service';
import { logger } from '../logger';
import { AnimationResource, BreathingRoutine } from '../types';

export interface AnimationEvent {
  routine: BreathingRoutine;
  themes?: Array<'calm' | 'energetic' | 'minimal'>;
  includeMobile?: boolean;
}

export interface AnimationLambdaResponse {
  statusCode: number;
  body: {
    animations?: Record<string, AnimationResource | null>;
    animation?: AnimationResource;
    message: string;
    success: boolean;
  };
}

/**
 * Main Lambda handler for animation generation
 */
export async function handler(event: AnimationEvent): Promise<AnimationLambdaResponse> {
  logger.info('Animation generation Lambda invoked', {
    cycles: event.routine.cycles,
    themes: event.themes,
    includeMobile: event.includeMobile,
  });

  try {
    const themes = event.themes || ['calm'];
    const results: Record<string, AnimationResource | null> = {};

    // Generate for each requested theme
    for (const theme of themes) {
      const animation = await animationService.generateAndUploadAnimation(event.routine, theme);
      results[`${theme}`] = animation;
    }

    // Generate mobile version if requested
    if (event.includeMobile) {
      const mobileAnimation = await animationService.generateMobileAnimation(
        event.routine,
        themes[0] || 'calm'
      );
      results['mobile'] = mobileAnimation;
    }

    // Check if at least one animation was generated successfully
    const hasSuccess = Object.values(results).some((r) => r !== null);

    if (!hasSuccess) {
      return {
        statusCode: 500,
        body: {
          message: 'Failed to generate animations',
          success: false,
        },
      };
    }

    return {
      statusCode: 200,
      body: {
        animations: results,
        message: 'Animations generated and uploaded successfully',
        success: true,
      },
    };
  } catch (error) {
    logger.error('Error generating animations in Lambda', error);

    return {
      statusCode: 500,
      body: {
        message: 'Internal error during animation generation',
        success: false,
      },
    };
  }
}

/**
 * Batch animation generation
 */
export async function batchGenerateAnimations(
  routines: BreathingRoutine[],
  theme: 'calm' | 'energetic' | 'minimal' = 'calm'
): Promise<(AnimationResource | null)[]> {
  logger.info('Batch animation generation started', { routineCount: routines.length });

  const results = await Promise.all(
    routines.map((routine) =>
      animationService
        .generateAndUploadAnimation(routine, theme)
        .catch((error) => {
          logger.error('Error generating animation', error);
          return null;
        })
    )
  );

  logger.info('Batch animation generation completed', {
    successful: results.filter((r) => r !== null).length,
    total: results.length,
  });

  return results;
}

/**
 * Generate animation theme gallery
 */
export async function generateThemeGallery(routine: BreathingRoutine): Promise<Record<string, AnimationResource | null>> {
  logger.info('Generating theme gallery');

  return await animationService.generateThemeVariations(routine);
}
