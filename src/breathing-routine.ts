/**
 * Breathing routine generator
 */

import { BreathingRoutine } from './types';

export class BreathingRoutineGenerator {
  /**
   * Generate a 4-4-6 breathing routine (Inhale 4, Hold 4, Exhale 6)
   * This is a well-known calming technique that activates the parasympathetic nervous system
   */
  generateStandardRoutine(): BreathingRoutine {
    return {
      instructions:
        'Inhale for 4 seconds, hold for 4 seconds, exhale for 6 seconds. Repeat this cycle 5 times.',
      duration: 5 * (4 + 4 + 6), // Total seconds: 70 seconds
      cycles: 5,
      inhaleCount: 4,
      holdCount: 4,
      exhaleCount: 6,
    };
  }

  /**
   * Generate a detailed step-by-step breathing routine with visual cues
   */
  generateDetailedRoutine(): string {
    return `
GUIDED BREATHING EXERCISE - 4-4-6 Pattern
==========================================

This exercise helps calm your nervous system and reduce stress.

INSTRUCTIONS:
1. Find a comfortable position (sitting or lying down)
2. Close your eyes if comfortable
3. Follow the timing below for 5 complete cycles

BREATHING CYCLE (Repeat 5 times):
─────────────────────────────────

Step 1: INHALE
  Count: 1... 2... 3... 4
  Action: Breathe in slowly through your nose
  Focus: Feel your belly expand as you breathe in

Step 2: HOLD
  Count: 1... 2... 3... 4
  Action: Keep the air in your lungs
  Focus: Stay calm and present

Step 3: EXHALE
  Count: 1... 2... 3... 4... 5... 6
  Action: Slowly release air through your mouth
  Focus: Feel tension leaving your body

───────────────────────────────────
TOTAL TIME: ~70 seconds (5 cycles × 14 seconds per cycle)

TIPS:
✓ Keep a steady, even pace
✓ Focus on the counting to anchor your attention
✓ If you feel lightheaded, slow down or stop
✓ Repeat as needed throughout the day
✓ Do this whenever you feel stressed or anxious

Remember: You are safe. Your body is responding to help you calm down.
    `.trim();
  }

  /**
   * Generate a quick breathing routine (3 cycles, shorter duration)
   */
  generateQuickRoutine(): BreathingRoutine {
    return {
      instructions: 'Quick breathing: Inhale for 4 seconds, hold for 4, exhale for 6. Repeat 3 times. (42 seconds total)',
      duration: 3 * (4 + 4 + 6), // 42 seconds
      cycles: 3,
      inhaleCount: 4,
      holdCount: 4,
      exhaleCount: 6,
    };
  }

  /**
   * Generate an extended breathing routine (8 cycles, longer duration)
   */
  generateExtendedRoutine(): BreathingRoutine {
    return {
      instructions:
        'Extended breathing: Inhale for 4 seconds, hold for 4, exhale for 6. Repeat 8 times for deeper relaxation. (112 seconds total)',
      duration: 8 * (4 + 4 + 6), // 112 seconds
      cycles: 8,
      inhaleCount: 4,
      holdCount: 4,
      exhaleCount: 6,
    };
  }

  /**
   * Get routine with emotional context
   */
  getContextualMessage(emotions: string[]): string {
    const emotionLower = emotions.map((e) => e.toLowerCase()).join(', ');

    const messages: Record<string, string> = {
      anxiety:
        'I sense you\'re feeling anxious. Let\'s slow your breathing and calm your mind. This breathing exercise activates your body\'s relaxation response.',
      overwhelm:
        'You sound overwhelmed. Taking a moment to breathe can help you regain clarity and control. Let\'s start with some deep breathing.',
      stress:
        'I hear the stress in your words. Controlled breathing is one of the fastest ways to calm your nervous system. Ready to try?',
      panic:
        'I\'m here to help. Let\'s ground you with some gentle breathing. Focus on the rhythm—it will help you feel safer.',
      worry:
        'Worry can make your breathing shallow. Let\'s deepen it together. This will help quiet your anxious thoughts.',
      fear:
        'Fear can tighten your chest and breath. Let\'s ease that tension with slow, intentional breathing.',
      exhaustion:
        'You sound drained. A guided breathing exercise can help you reset and find some calm in the moment.',
      insomnia:
        'Sleep troubles often stem from an overactive mind. This breathing technique is proven to prepare your body for rest.',
    };

    // Find the best matching message
    for (const emotion of emotions) {
      const key = emotion.toLowerCase();
      if (messages[key]) {
        return messages[key];
      }
    }

    // Default message if no specific emotion matches
    return 'I\'m here to help you find calm. Let\'s work through this together with some guided breathing.';
  }
}

export const breathingRoutineGenerator = new BreathingRoutineGenerator();
