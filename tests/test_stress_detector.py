"""
Test cases for stress detector
"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from src.services.stress_detector import StressDetector


def test_detect_stress_from_anxious_keywords():
    """Test stress detection from anxious keywords"""
    detector = StressDetector()
    result = detector.detect_stress("I'm feeling really anxious about my presentation")
    assert result["isStressed"] is True
    assert result["confidence"] > 0
    assert "anxiety" in result["detectedEmotions"]


def test_detect_stress_from_overwhelm():
    """Test stress detection from overwhelm keywords"""
    detector = StressDetector()
    result = detector.detect_stress("I feel overwhelmed with work")
    assert result["isStressed"] is True
    assert "overwhelm" in result["detectedEmotions"]


def test_detect_multiple_emotions():
    """Test detection of multiple emotions"""
    detector = StressDetector()
    result = detector.detect_stress("I am anxious and stressed about everything")
    assert result["isStressed"] is True
    assert "anxiety" in result["detectedEmotions"]
    assert "stress" in result["detectedEmotions"]


def test_no_stress_in_calm_text():
    """Test that calm text doesn't trigger stress detection"""
    detector = StressDetector()
    result = detector.detect_stress("Everything is going great today")
    assert result["isStressed"] is False
    assert result["confidence"] == 0


def test_handle_empty_input():
    """Test handling of empty input"""
    detector = StressDetector()
    result = detector.detect_stress("")
    assert result["isStressed"] is False
    assert result["confidence"] == 0


def test_emotion_message_generation():
    """Test emotion message generation"""
    detector = StressDetector()
    message = detector.get_emotion_message(["anxiety", "stress"])
    assert "anxiety" in message
    assert "stress" in message


def test_emotion_message_calm():
    """Test emotion message for calm state"""
    detector = StressDetector()
    message = detector.get_emotion_message([])
    assert "calm" in message.lower()


if __name__ == "__main__":
    # Run tests
    test_detect_stress_from_anxious_keywords()
    print("✓ test_detect_stress_from_anxious_keywords passed")

    test_detect_stress_from_overwhelm()
    print("✓ test_detect_stress_from_overwhelm passed")

    test_detect_multiple_emotions()
    print("✓ test_detect_multiple_emotions passed")

    test_no_stress_in_calm_text()
    print("✓ test_no_stress_in_calm_text passed")

    test_handle_empty_input()
    print("✓ test_handle_empty_input passed")

    test_emotion_message_generation()
    print("✓ test_emotion_message_generation passed")

    test_emotion_message_calm()
    print("✓ test_emotion_message_calm passed")

    print("\n✅ All stress detector tests passed!")
