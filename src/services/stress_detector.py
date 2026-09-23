"""
Lightweight Stress Detection Service
Uses simple keyword matching to detect stress indicators
"""

STRESS_KEYWORDS = {
    "anxiety": ["anxious", "anxiety", "nervous", "worried", "uneasy", "jittery", "panicked"],
    "stress": ["stressed", "stress", "overwhelming", "overwhelmed", "pressured", "burdened"],
    "sadness": ["sad", "depressed", "blue", "gloomy", "miserable", "unhappy"],
    "anger": ["angry", "furious", "rage", "irritated", "frustrated", "mad"],
    "overwhelm": ["overwhelmed", "drowning", "swamped", "buried", "suffocated", "trapped"],
}


class StressDetector:
    """Detects stress from user input using keyword matching"""

    def detect_stress(self, text):
        """
        Detects stress from user input text
        
        Args:
            text (str): User input text to analyze
            
        Returns:
            dict: Result with stress detection and confidence
        """
        if not text or not text.strip():
            return {
                "isStressed": False,
                "confidence": 0,
                "detectedEmotions": [],
                "rawText": text,
            }

        normalized_text = text.lower()
        detected_emotions = []
        match_count = 0

        # Check each emotion category for keyword matches
        for emotion, keywords in STRESS_KEYWORDS.items():
            for keyword in keywords:
                # Count occurrences of keyword (case-insensitive)
                count = normalized_text.count(keyword)
                if count > 0:
                    match_count += count
                    if emotion not in detected_emotions:
                        detected_emotions.append(emotion)

        # Calculate confidence score
        confidence = min(match_count / 3, 1.0)
        is_stressed = confidence > 0.2  # Threshold: detect stress if confidence > 20%

        return {
            "isStressed": is_stressed,
            "confidence": confidence,
            "detectedEmotions": detected_emotions,
            "rawText": text,
        }

    def get_emotion_message(self, detected_emotions):
        """
        Get a human-readable emotion message based on detected emotions
        
        Args:
            detected_emotions (list): List of detected emotion strings
            
        Returns:
            str: Human-readable message
        """
        if not detected_emotions:
            return "You seem calm right now."

        emotion_descriptions = {
            "anxiety": "I sense some anxiety",
            "stress": "I detect stress",
            "sadness": "I sense sadness",
            "anger": "I notice some anger",
            "overwhelm": "You seem overwhelmed",
        }

        descriptions = [
            emotion_descriptions.get(emotion, emotion) for emotion in detected_emotions
        ]
        combined = ", ".join(descriptions)
        return f"{combined}. Let's take a moment to breathe and calm down."
