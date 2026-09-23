/**
 * Animation service that integrates animation generation and S3 storage
 */

import { animationGenerator, AnimationOptions } from './animation-generator';
import { s3Manager } from './s3-client';
import { logger } from './logger';
import { AnimationResource, BreathingRoutine } from './types';

export class AnimationService {
  /**
   * Generate and upload breathing animation
   */
  async generateAndUploadAnimation(
    routine: BreathingRoutine,
    theme: 'calm' | 'energetic' | 'minimal' = 'calm'
  ): Promise<AnimationResource | null> {
    try {
      logger.info('Generating and uploading animation', {
        cycles: routine.cycles,
        theme,
      });

      // Generate animation HTML
      const options: AnimationOptions = {
        cycles: routine.cycles,
        inhaleSeconds: routine.inhaleCount,
        holdSeconds: routine.holdCount,
        exhaleSeconds: routine.exhaleCount,
        theme,
      };

      const animationHtml = animationGenerator.generateBreathingAnimation(options);

      // Generate filename
      const fileName = `animations/breathing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.html`;

      // Upload to S3
      const result = await s3Manager.uploadAnimation(animationHtml, fileName);

      if (result) {
        logger.info('Animation generated and uploaded', { fileName, url: result.url });
      }

      return result;
    } catch (error) {
      logger.error('Error generating and uploading animation', error);
      return null;
    }
  }

  /**
   * Generate mobile-optimized animation
   */
  async generateMobileAnimation(
    routine: BreathingRoutine,
    theme: 'calm' | 'energetic' | 'minimal' = 'calm'
  ): Promise<AnimationResource | null> {
    try {
      logger.info('Generating mobile animation', { cycles: routine.cycles });

      const options: AnimationOptions = {
        cycles: routine.cycles,
        inhaleSeconds: routine.inhaleCount,
        holdSeconds: routine.holdCount,
        exhaleSeconds: routine.exhaleCount,
        theme,
      };

      const animationHtml = animationGenerator.generateMobileAnimation(options);

      const fileName = `animations/mobile-breathing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.html`;

      const result = await s3Manager.uploadAnimation(animationHtml, fileName);

      if (result) {
        logger.info('Mobile animation generated and uploaded', { fileName });
      }

      return result;
    } catch (error) {
      logger.error('Error generating mobile animation', error);
      return null;
    }
  }

  /**
   * Get animation inline (for embedding)
   */
  getInlineAnimation(routine: BreathingRoutine, theme: 'calm' | 'energetic' | 'minimal' = 'calm'): string {
    logger.debug('Getting inline animation');

    const options: AnimationOptions = {
      cycles: routine.cycles,
      inhaleSeconds: routine.inhaleCount,
      holdSeconds: routine.holdCount,
      exhaleSeconds: routine.exhaleCount,
      theme,
    };

    return animationGenerator.generateInlineAnimation(options);
  }

  /**
   * Generate multiple theme variations
   */
  async generateThemeVariations(routine: BreathingRoutine): Promise<Record<string, AnimationResource | null>> {
    try {
      logger.info('Generating theme variations');

      const themes: Array<'calm' | 'energetic' | 'minimal'> = ['calm', 'energetic', 'minimal'];

      const results: Record<string, AnimationResource | null> = {};

      for (const theme of themes) {
        const result = await this.generateAndUploadAnimation(routine, theme);
        results[theme] = result;
      }

      return results;
    } catch (error) {
      logger.error('Error generating theme variations', error);
      return {};
    }
  }

  /**
   * Generate animations for different durations
   */
  async generateDurationVariations(
    cycles: number,
    inhaleSeconds: number,
    holdSeconds: number,
    exhaleSeconds: number
  ): Promise<Record<string, AnimationResource | null>> {
    try {
      logger.info('Generating duration variations');

      const routine: BreathingRoutine = {
        instructions: '',
        duration: (inhaleSeconds + holdSeconds + exhaleSeconds) * cycles,
        cycles,
        inhaleCount: inhaleSeconds,
        holdCount: holdSeconds,
        exhaleCount: exhaleSeconds,
      };

      const results: Record<string, AnimationResource | null> = {};

      // Generate for different theme/duration combinations
      for (const theme of ['calm', 'energetic', 'minimal'] as const) {
        const key = `${theme}-${cycles}cycles`;
        results[key] = await this.generateAndUploadAnimation(routine, theme);
      }

      return results;
    } catch (error) {
      logger.error('Error generating duration variations', error);
      return {};
    }
  }

  /**
   * List available animations
   */
  async listAvailableAnimations(): Promise<string[]> {
    logger.info('Listing available animations');
    return await s3Manager.listAnimations();
  }

  /**
   * Get animation health status
   */
  async checkAnimationService(): Promise<boolean> {
    logger.debug('Checking animation service health');
    return await s3Manager.checkBucketHealth();
  }
}

export const animationService = new AnimationService();
