/**
 * Type definitions for the emotion regulation agent
 */

export interface UserInput {
  text: string;
  userId?: string;
  timestamp?: Date;
}

export interface EmotionAnalysis {
  isStressed: boolean;
  confidence: number;
  detectedEmotions: string[];
  stressKeywords: string[];
}

export interface BreathingRoutine {
  instructions: string;
  duration: number; // in seconds
  cycles: number;
  inhaleCount: number;
  holdCount: number;
  exhaleCount: number;
}

export interface AudioResource {
  url: string;
  format: string;
  duration: number;
}

export interface AnimationResource {
  url: string;
  type: string;
}

export interface InteractionLog {
  id: string;
  userId: string;
  timestamp: string;
  userInput: string;
  emotionAnalysis: EmotionAnalysis;
  responseProvided: string;
  resourcesGenerated: {
    audioUrl?: string;
    animationUrl?: string;
  };
}

export interface AgentResponse {
  message: string;
  routine?: BreathingRoutine;
  audio?: AudioResource;
  animation?: AnimationResource;
  interactionId: string;
}
