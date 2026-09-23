"""
Test cases for breathing routine generator
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.services.breathing_routine import BreathingRoutineGenerator


def test_generate_breathing_routine():
    """Test that breathing routine is generated"""
    generator = BreathingRoutineGenerator()
    routine = generator.generate_routine()
    assert routine is not None
    assert routine["cycles"] == 5
    assert routine["pattern"]["inhale"] == 4
    assert routine["pattern"]["hold"] == 4
    assert routine["pattern"]["exhale"] == 6


def test_calculate_correct_duration():
    """Test that total duration is calculated correctly"""
    generator = BreathingRoutineGenerator()
    routine = generator.generate_routine()
    cycle_time = 4 + 4 + 6  # 14 seconds
    expected_duration = 5 * cycle_time  # 70 seconds
    assert routine["duration"] == expected_duration


def test_generate_instructions_with_steps():
    """Test that instructions include step-by-step guidance"""
    generator = BreathingRoutineGenerator()
    routine = generator.generate_routine()
    instructions = routine["instructions"]
    assert "GUIDED BREATHING EXERCISE" in instructions
    assert "Inhale" in instructions
    assert "Hold" in instructions
    assert "Exhale" in instructions
    assert "CYCLE 1" in instructions
    assert "CYCLE 5" in instructions


def test_include_tips():
    """Test that instructions include tips"""
    generator = BreathingRoutineGenerator()
    routine = generator.generate_routine()
    instructions = routine["instructions"]
    assert "Tips:" in instructions
    assert "Breathe naturally" in instructions


if __name__ == "__main__":
    # Run tests
    test_generate_breathing_routine()
    print("✓ test_generate_breathing_routine passed")

    test_calculate_correct_duration()
    print("✓ test_calculate_correct_duration passed")

    test_generate_instructions_with_steps()
    print("✓ test_generate_instructions_with_steps passed")

    test_include_tips()
    print("✓ test_include_tips passed")

    print("\n✅ All breathing routine tests passed!")
