/**
 * Lightweight Breathing Routine Generator
 * Creates a simple 4-4-6 breathing exercise routine
 */

export interface BreathingRoutine {
  instructions: string;
  duration: number; // Total duration in seconds
  cycles: number;
  pattern: {
    inhale: number;
    hold: number;
    exhale: number;
  };
}

export class BreathingRoutineGenerator {
  /**
   * Generates a preset breathing routine
   * Uses clinically proven 4-4-6 pattern (inhale 4s, hold 4s, exhale 6s)
   * @returns Breathing routine with instructions
   */
  generateRoutine(): BreathingRoutine {
    const cycles = 5; // Standard 5 cycles
    const pattern = { inhale: 4, hold: 4, exhale: 6 };
    const cycleTime = pattern.inhale + pattern.hold + pattern.exhale; // 14 seconds per cycle
    const totalDuration = cycles * cycleTime;

    const instructions = this.buildInstructions(cycles, pattern);

    return {
      instructions,
      duration: totalDuration,
      cycles,
      pattern,
    };
  }

  /**
   * Build step-by-step text instructions for the breathing routine
   */
  private buildInstructions(cycles: number, pattern: { inhale: number; hold: number; exhale: number }): string {
    let instructions = `GUIDED BREATHING EXERCISE (${cycles} cycles, ${cycles * (pattern.inhale + pattern.hold + pattern.exhale)} seconds total)\n`;
    instructions += `Pattern: Inhale for ${pattern.inhale}s → Hold for ${pattern.hold}s → Exhale for ${pattern.exhale}s\n`;
    instructions += '---\n\n';

    for (let i = 1; i <= cycles; i++) {
      instructions += `CYCLE ${i}:\n`;
      instructions += `1. INHALE - Breathe in slowly through your nose for ${pattern.inhale} seconds\n`;
      instructions += `2. HOLD - Keep the air in your lungs for ${pattern.hold} seconds\n`;
      instructions += `3. EXHALE - Release the air slowly through your mouth for ${pattern.exhale} seconds\n`;
      if (i < cycles) {
        instructions += '\n';
      }
    }

    instructions += '\n---\n';
    instructions += 'Tips:\n';
    instructions += '• Breathe naturally, no forcing\n';
    instructions += '• Focus on your breath\n';
    instructions += '• Close your eyes if it helps you relax\n';
    instructions += '• Repeat this routine 2-3 times daily or as needed\n';

    return instructions;
  }
}
