/**
 * Audio service that integrates Polly audio generation with the emotion agent
 */

import { pollyClient } from './polly-client';
import { logger } from './logger';
import { AudioResource, BreathingRoutine } from './types';

export class AudioService {
  /**
   * Generate complete audio package for breathing routine
   */
  async generateBreathingAudioPackage(
    routine: BreathingRoutine,
    emotions: string[]
  ): Promise<{ intro?: AudioResource; routine?: AudioResource; guidance?: AudioResource } | null> {
    try {
      logger.info('Generating breathing audio package', {
        cycles: routine.cycles,
        emotionCount: emotions.length,
      });

      const audioPackage: {
        intro?: AudioResource;
        routine?: AudioResource;
        guidance?: AudioResource;
      } = {};

      // Generate calming introduction
      if (emotions.length > 0) {
        const introContext = this.getEmotionalContext(emotions);
        audioPackage.intro = (await pollyClient.generateCalmingIntroductionAudio(introContext)) || undefined;
      }

      // Generate routine audio
      const routineInstructions = this.buildRoutineAudioScript(routine);
      audioPackage.routine = (await pollyClient.generateBreathingAudio(routineInstructions)) || undefined;

      // Generate guidance audio (optional extended guidance)
      const guidanceScript = this.buildGuidanceScript(routine);
      audioPackage.guidance = (await pollyClient.generateBreathingAudio(guidanceScript)) || undefined;

      logger.info('Audio package generated', {
        hasIntro: !!audioPackage.intro,
        hasRoutine: !!audioPackage.routine,
        hasGuidance: !!audioPackage.guidance,
      });

      return audioPackage;
    } catch (error) {
      logger.error('Error generating audio package', error);
      return null;
    }
  }

  /**
   * Generate audio just for the breathing routine
   */
  async generateRoutineAudio(routine: BreathingRoutine): Promise<AudioResource | null> {
    try {
      logger.info('Generating routine audio', { cycles: routine.cycles });

      const script = this.buildRoutineAudioScript(routine);
      return await pollyClient.generateBreathingAudio(script, {
        rate: '0.85',
        engine: 'neural',
      });
    } catch (error) {
      logger.error('Error generating routine audio', error);
      return null;
    }
  }

  /**
   * Build audio script for breathing routine with timing
   */
  private buildRoutineAudioScript(routine: BreathingRoutine): string {
    return `Let's begin the breathing exercise.

You will complete ${routine.cycles} cycles of breathing.

Each cycle consists of:
- Inhale for ${routine.inhaleCount} seconds
- Hold for ${routine.holdCount} seconds
- Exhale for ${routine.exhaleCount} seconds

Start when ready. Remember to keep your pace steady and comfortable.

<break time="2s"/>

Cycle 1. Inhale for ${routine.inhaleCount} seconds. <break time="${routine.inhaleCount}s"/> 
Hold for ${routine.holdCount} seconds. <break time="${routine.holdCount}s"/> 
Exhale for ${routine.exhaleCount} seconds. <break time="${routine.exhaleCount}s"/> 

<break time="1s"/>

Cycle 2. Inhale for ${routine.inhaleCount} seconds. <break time="${routine.inhaleCount}s"/> 
Hold for ${routine.holdCount} seconds. <break time="${routine.holdCount}s"/> 
Exhale for ${routine.exhaleCount} seconds. <break time="${routine.exhaleCount}s"/> 

<break time="1s"/>

Cycle 3. Inhale for ${routine.inhaleCount} seconds. <break time="${routine.inhaleCount}s"/> 
Hold for ${routine.holdCount} seconds. <break time="${routine.holdCount}s"/> 
Exhale for ${routine.exhaleCount} seconds. <break time="${routine.exhaleCount}s"/> 

<break time="1s"/>

Cycle 4. Inhale for ${routine.inhaleCount} seconds. <break time="${routine.inhaleCount}s"/> 
Hold for ${routine.holdCount} seconds. <break time="${routine.holdCount}s"/> 
Exhale for ${routine.exhaleCount} seconds. <break time="${routine.exhaleCount}s"/> 

<break time="1s"/>

Cycle 5. Inhale for ${routine.inhaleCount} seconds. <break time="${routine.inhaleCount}s"/> 
Hold for ${routine.holdCount} seconds. <break time="${routine.holdCount}s"/> 
Exhale for ${routine.exhaleCount} seconds. <break time="${routine.exhaleCount}s"/> 

<break time="2s"/>

Excellent work. You've completed the exercise. 

Notice how you feel now. Your breathing is deeper. Your body is more relaxed.

You can repeat this exercise anytime you need to calm down.`;
  }

  /**
   * Build guidance script for post-exercise support
   */
  private buildGuidanceScript(routine: BreathingRoutine): string {
    return `After completing your breathing exercise, take a moment to notice the changes in your body.

Your heart rate has slowed. Your shoulders are less tense. Your mind is clearer.

This is your body's natural relaxation response activated by controlled breathing.

Remember, you can use this technique anytime you feel stressed or anxious.

Some helpful tips:

Practice this breathing exercise twice daily for the best results.

If you feel stressed during the day, take 2 to 3 quick cycles to reset your nervous system.

For better sleep, practice this routine 10 minutes before bedtime.

You are capable of managing stress. Your breath is a powerful tool. Use it whenever you need to find calm.`;
  }

  /**
   * Get emotional context for personalized audio
   */
  private getEmotionalContext(emotions: string[]): string {
    const emotionLower = emotions.map((e) => e.toLowerCase());

    let context = '';

    if (emotionLower.includes('anxiety') || emotionLower.includes('anxious')) {
      context =
        'I can sense your anxiety. Your nervous system is in overdrive. This exercise will gently bring you back to calm.';
    } else if (emotionLower.includes('overwhelm') || emotionLower.includes('overwhelmed')) {
      context =
        'You sound overwhelmed. Let\'s simplify things for a moment. We\'ll focus only on your breath and nothing else.';
    } else if (emotionLower.includes('panic') || emotionLower.includes('panicked')) {
      context =
        'You\'re experiencing panic. I\'m right here with you. Controlled breathing will bring your system back into balance.';
    } else if (emotionLower.includes('stress') || emotionLower.includes('stressed')) {
      context =
        'Stress can make everything feel heavier. Let\'s lighten the load with slow, deliberate breathing.';
    } else {
      context = 'Let\'s take a moment together to calm your mind and ease any tension you\'re carrying.';
    }

    return context;
  }

  /**
   * Clean up old audio files
   */
  cleanupAudioCache(maxAgeHours: number = 24): void {
    logger.info('Cleaning up audio cache', { maxAgeHours });
    pollyClient.cleanupOldAudioFiles(maxAgeHours);
  }

  /**
   * Get available voices info
   */
  getAvailableVoices(): Record<string, string> {
    return pollyClient.getAvailableVoices();
  }
}

export const audioService = new AudioService();
