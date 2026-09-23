/**
 * Bedrock client for emotion analysis
 */

import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { config } from './config';
import { logger } from './logger';
import { EmotionAnalysis } from './types';

class BedrockClient {
  private client: BedrockRuntimeClient;
  private modelId: string;

  // Stress keywords for pattern matching
  private stressKeywords = [
    'anxious',
    'anxiousness',
    'worried',
    'overwhelmed',
    'stressed',
    'stress',
    'panic',
    'panicked',
    'afraid',
    'frightened',
    'nervous',
    'tension',
    'tense',
    'pressure',
    'pressured',
    'frantic',
    'hectic',
    'crazy',
    'burning out',
    'burnt out',
    'exhausted',
    'drained',
    'scattered',
    'unable to focus',
    'cant focus',
    'can\'t focus',
    'racing thoughts',
    'heart pounding',
    'breathing difficulty',
    'can\'t breathe',
    'cant breathe',
    'shaking',
    'trembling',
    'nauseous',
    'sick',
    'unwell',
    'headache',
    'migraine',
    'trouble sleeping',
    'can\'t sleep',
    'cant sleep',
    'insomnia',
    'restless',
    'irritable',
    'angry',
    'furious',
    'helpless',
    'hopeless',
    'desperate',
    'overwhelm',
  ];

  constructor() {
    this.client = new BedrockRuntimeClient({ region: config.aws.region });
    this.modelId = config.aws.bedrockModel;
  }

  /**
   * Analyze user input for stress indicators
   */
  async analyzeEmotion(userText: string): Promise<EmotionAnalysis> {
    try {
      logger.debug('Analyzing emotion with Bedrock', { modelId: this.modelId });

      const prompt = `You are an emotion analysis expert. Analyze the following user input for signs of stress, anxiety, or emotional distress.

User Input: "${userText}"

Respond with a JSON object containing:
1. isStressed: boolean (true if stress/anxiety indicators are present)
2. confidence: number between 0-1 (confidence in the assessment)
3. detectedEmotions: array of strings (emotions detected)
4. brief_reasoning: string (brief explanation)

Example response format:
{
  "isStressed": true,
  "confidence": 0.85,
  "detectedEmotions": ["anxiety", "overwhelm"],
  "brief_reasoning": "User mentions feeling overwhelmed and having trouble focusing"
}

Respond ONLY with valid JSON, no additional text.`;

      const input = {
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-06-01',
          max_tokens: 200,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      };

      const command = new InvokeModelCommand(input);
      const response = await this.client.send(command);

      // Parse response body
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const responseText = responseBody.content[0].text;

      logger.debug('Bedrock response received', { responseText });

      const analysisResult = JSON.parse(responseText);

      // Perform local keyword matching as fallback/supplement
      const detectedKeywords = this.detectStressKeywords(userText);

      return {
        isStressed: analysisResult.isStressed || detectedKeywords.length > 0,
        confidence: analysisResult.confidence,
        detectedEmotions: analysisResult.detectedEmotions || [],
        stressKeywords: detectedKeywords,
      };
    } catch (error) {
      logger.error('Error analyzing emotion with Bedrock', error);
      // Fallback to keyword-based analysis if Bedrock fails
      return this.fallbackKeywordAnalysis(userText);
    }
  }

  /**
   * Detect stress keywords in user input
   */
  private detectStressKeywords(text: string): string[] {
    const lowerText = text.toLowerCase();
    return this.stressKeywords.filter((keyword) => lowerText.includes(keyword));
  }

  /**
   * Fallback analysis using keyword matching
   */
  private fallbackKeywordAnalysis(userText: string): EmotionAnalysis {
    const detectedKeywords = this.detectStressKeywords(userText);
    const isStressed = detectedKeywords.length > 0;

    logger.warn('Using fallback keyword analysis', { detectedKeywords, isStressed });

    return {
      isStressed,
      confidence: isStressed ? 0.7 : 0.5,
      detectedEmotions: detectedKeywords,
      stressKeywords: detectedKeywords,
    };
  }
}

export const bedrockClient = new BedrockClient();
