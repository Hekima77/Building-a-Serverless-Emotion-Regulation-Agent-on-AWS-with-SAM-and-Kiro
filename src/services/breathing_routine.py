"""
Lightweight Breathing Routine Generator
Creates a simple 4-4-6 breathing exercise routine
"""


class BreathingRoutineGenerator:
    """Generates breathing routines with step-by-step instructions"""

    def generate_routine(self):
        """
        Generates a preset breathing routine
        Uses clinically proven 4-4-6 pattern (inhale 4s, hold 4s, exhale 6s)
        
        Returns:
            dict: Breathing routine with instructions and metadata
        """
        cycles = 5  # Standard 5 cycles
        pattern = {"inhale": 4, "hold": 4, "exhale": 6}
        cycle_time = pattern["inhale"] + pattern["hold"] + pattern["exhale"]  # 14 seconds
        total_duration = cycles * cycle_time

        instructions = self._build_instructions(cycles, pattern)

        return {
            "instructions": instructions,
            "duration": total_duration,
            "cycles": cycles,
            "pattern": pattern,
        }

    def _build_instructions(self, cycles, pattern):
        """
        Build step-by-step text instructions for the breathing routine
        
        Args:
            cycles (int): Number of breathing cycles
            pattern (dict): Breathing pattern with inhale, hold, exhale times
            
        Returns:
            str: Formatted instructions
        """
        cycle_time = pattern["inhale"] + pattern["hold"] + pattern["exhale"]
        total_time = cycles * cycle_time

        instructions = f"GUIDED BREATHING EXERCISE ({cycles} cycles, {total_time}s total)\n"
        instructions += f"Pattern: Inhale for {pattern['inhale']}s → Hold for {pattern['hold']}s → Exhale for {pattern['exhale']}s\n"
        instructions += "---\n\n"

        for i in range(1, cycles + 1):
            instructions += f"CYCLE {i}:\n"
            instructions += f"1. INHALE - Breathe in slowly through your nose for {pattern['inhale']} seconds\n"
            instructions += f"2. HOLD - Keep the air in your lungs for {pattern['hold']} seconds\n"
            instructions += f"3. EXHALE - Release the air slowly through your mouth for {pattern['exhale']} seconds\n"
            if i < cycles:
                instructions += "\n"

        instructions += "\n---\n"
        instructions += "Tips:\n"
        instructions += "• Breathe naturally, no forcing\n"
        instructions += "• Focus on your breath\n"
        instructions += "• Close your eyes if it helps you relax\n"
        instructions += "• Repeat this routine 2-3 times daily or as needed\n"

        return instructions
