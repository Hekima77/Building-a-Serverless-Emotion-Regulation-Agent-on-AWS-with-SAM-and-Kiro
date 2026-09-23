/**
 * Lightweight Stress Detection Service
 * Uses simple keyword matching to detect stress indicators
 */

export interface StressDetectionResult {
  isStressed: boolean;
  confidence: number; // 0-1 scale
  detectedEmotions: string[];
  rawText: string;
}

/**
 * List of stress-related keywords
 * Organized by emotion category
 */
const STRESS_KEYWORDS = {
  anxiety: ['anxious', 'anxiety', 'nervous', 'worried', 'worried', 'uneasy', 'jittery', 'panicked'],
  stress: ['stressed', 'stressed out', 'stressful', 'stress', 'overwhelming', 'overwhelmed', 'pressured', 'burdened'],
  sadness: ['sad', 'down', 'depressed', 'blue', 'gloomy', 'miserable', 'unhappy', 'heartbroken'],
  anger: ['angry', 'furious', 'rage', 'irritated', 'frustrated', 'mad', 'livid', 'outraged'],
  overwhelm: ['overwhelmed', 'drowning', 'swamped', 'buried', 'suffocated', 'trapped', 'helpless'],
};

export class StressDetector {
  /**
   * Detects stress from user input text
   * @param text User input text to analyze
   * @returns StressDetectionResult with detected emotions and confidence score
   */
  detectStress(text: string): StressDetectionResult {
    if (!text || text.trim().length === 0) {
      return {
        isStressed: false,
        confidence: 0,
        detectedEmotions: [],
        rawText: text,
      };
    }

    const normalizedText = text.toLowerCase();
    const detectedEmotions: string[] = [];
    let matchCount = 0;

    // Check each emotion category for keyword matches
    for (const [emotion, keywords] of Object.entries(STRESS_KEYWORDS)) {
      for (const keyword of keywords) {
        // Use word boundary to avoid partial matches (e.g., "stressed" in "unstressed")
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = normalizedText.match(regex);

        if (matches) {
          matchCount += matches.length;
          if (!detectedEmotions.includes(emotion)) {
            detectedEmotions.push(emotion);
          }
        }
      }
    }

    // Calculate confidence score
    // More keywords = higher confidence, capped at 1.0
    const confidence = Math.min(matchCount / 3, 1.0);
    const isStressed = confidence > 0.2; // Threshold: detect stress if confidence > 20%

    return {
      isStressed,
      confidence,
      detectedEmotions,
      rawText: text,
    };
  }

  /**
   * Get a human-readable emotion message based on detected emotions
   */
  getEmotionMessage(detectedEmotions: string[]): string {
    if (detectedEmotions.length === 0) {
      return 'You seem calm right now.';
    }

    const emotionDescriptions: Record<string, string> = {
      anxiety: 'I sense some anxiety',
      stress: 'I detect stress',
      sadness: 'I sense sadness',
      anger: 'I notice some anger',
      overwhelm: 'You seem overwhelmed',
    };

    const descriptions = detectedEmotions
      .map((emotion) => emotionDescriptions[emotion] || emotion)
      .join(', ');

    return `${descriptions}. Let's take a moment to breathe and calm down.`;
  }
}
