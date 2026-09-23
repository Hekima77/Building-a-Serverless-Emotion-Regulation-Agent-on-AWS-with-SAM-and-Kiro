/**
 * Analytics service for emotion tracking and pattern analysis
 */

import { dynamoDBClient, InteractionRecord } from './dynamodb-client';
import { logger } from './logger';

export interface EmotionTrend {
  date: string;
  stressLevel: number; // 0-100
  dominantEmotions: string[];
  interactionCount: number;
}

export interface UserInsights {
  userId: string;
  totalInteractions: number;
  stressFrequency: number;
  mostCommonEmotions: Array<[string, number]>;
  peakStressTimes: Record<string, number>;
  trends: EmotionTrend[];
  recommendations: string[];
}

export class AnalyticsService {
  /**
   * Generate comprehensive user insights
   */
  async generateUserInsights(userId: string): Promise<UserInsights> {
    try {
      logger.info('Generating user insights', { userId });

      const stats = await dynamoDBClient.getInteractionStats(userId);
      const stressFrequency = await dynamoDBClient.getStressFrequency(userId);
      const mostCommonEmotions = await dynamoDBClient.getMostDetectedEmotions(userId, 5);
      const peakStressTimes = await dynamoDBClient.getPeakStressTimes(userId);

      const recommendations = this.generateRecommendations(stressFrequency, mostCommonEmotions);

      const insights: UserInsights = {
        userId,
        totalInteractions: (stats.totalInteractions as number) || 0,
        stressFrequency,
        mostCommonEmotions,
        peakStressTimes,
        trends: [], // Could be populated with historical trends
        recommendations,
      };

      logger.info('User insights generated', { userId });

      return insights;
    } catch (error) {
      logger.error('Error generating user insights', error);

      return {
        userId,
        totalInteractions: 0,
        stressFrequency: 0,
        mostCommonEmotions: [],
        peakStressTimes: {},
        trends: [],
        recommendations: [],
      };
    }
  }

  /**
   * Generate personalized recommendations based on patterns
   */
  private generateRecommendations(
    stressFrequency: number,
    emotions: Array<[string, number]>
  ): string[] {
    const recommendations: string[] = [];

    // Stress frequency recommendations
    if (stressFrequency > 70) {
      recommendations.push(
        'You\'re experiencing frequent stress. Consider practicing breathing exercises 2-3 times daily.'
      );
      recommendations.push(
        'High stress levels detected. Consider scheduling regular wellness check-ins.'
      );
    } else if (stressFrequency > 40) {
      recommendations.push(
        'Moderate stress detected. Try using breathing exercises when you feel overwhelmed.'
      );
    } else if (stressFrequency > 0) {
      recommendations.push(
        'You\'re managing stress well. Keep using breathing exercises as a preventative tool.'
      );
    }

    // Emotion-specific recommendations
    const emotionNames = emotions.map((e) => e[0].toLowerCase());

    if (emotionNames.includes('anxiety')) {
      recommendations.push(
        'Anxiety is a frequent emotion. Extended breathing exercises (8 cycles) may help.'
      );
    }

    if (emotionNames.includes('overwhelm')) {
      recommendations.push(
        'Feeling overwhelmed frequently? Break tasks into smaller steps and use quick breathing breaks.'
      );
    }

    if (emotionNames.includes('panic')) {
      recommendations.push(
        'Panic episodes detected. Having quick breathing exercises on standby can help ground you.'
      );
    }

    if (emotionNames.includes('exhaustion')) {
      recommendations.push(
        'Exhaustion is common in your data. Ensure you\'re getting adequate rest and using breathing exercises for rejuvenation.'
      );
    }

    // Time-based recommendations
    recommendations.push(
      'Use your peak stress times as reminders to take proactive breathing breaks.'
    );

    // Ensure we have at least some recommendations
    if (recommendations.length === 0) {
      recommendations.push('Keep practicing regular breathing exercises for emotional wellness.');
    }

    return recommendations.slice(0, 5); // Return top 5 recommendations
  }

  /**
   * Get emotion progression over time
   */
  async getEmotionProgression(userId: string, days: number = 30): Promise<EmotionTrend[]> {
    try {
      logger.info('Calculating emotion progression', { userId, days });

      const interactions = await dynamoDBClient.getUserInteractions(userId, 300);

      const trends: Record<string, EmotionTrend> = {};

      interactions.forEach((interaction) => {
        const date = new Date(interaction.timestamp);
        const dateKey = date.toISOString().split('T')[0];

        if (!trends[dateKey]) {
          trends[dateKey] = {
            date: dateKey,
            stressLevel: 0,
            dominantEmotions: [],
            interactionCount: 0,
          };
        }

        trends[dateKey].interactionCount++;

        if (interaction.emotionAnalysis.isStressed) {
          trends[dateKey].stressLevel += interaction.emotionAnalysis.confidence * 100;
        }

        trends[dateKey].dominantEmotions.push(...interaction.emotionAnalysis.detectedEmotions);
      });

      // Convert to array and sort by date
      const progression = Object.values(trends)
        .map((trend) => ({
          ...trend,
          stressLevel: Math.min(100, trend.stressLevel / Math.max(trend.interactionCount, 1)),
          dominantEmotions: [...new Set(trend.dominantEmotions)],
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      logger.info('Emotion progression calculated', { userId, trendCount: progression.length });

      return progression;
    } catch (error) {
      logger.error('Error calculating emotion progression', error);
      return [];
    }
  }

  /**
   * Compare stress patterns across time periods
   */
  async compareStressPatterns(userId: string): Promise<Record<string, number>> {
    try {
      logger.info('Comparing stress patterns', { userId });

      const now = new Date();
      const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const thisWeekStress = await dynamoDBClient.getStressFrequency(userId, 7);
      const lastWeekStress = await dynamoDBClient.getStressFrequency(userId, 14);

      const comparison = {
        thisWeek: thisWeekStress,
        lastWeek: lastWeekStress,
        trend: thisWeekStress - lastWeekStress, // Positive = increasing stress
      };

      logger.info('Stress patterns compared', comparison);

      return comparison;
    } catch (error) {
      logger.error('Error comparing stress patterns', error);

      return { thisWeek: 0, lastWeek: 0, trend: 0 };
    }
  }

  /**
   * Export user data in summary format
   */
  async exportUserSummary(userId: string): Promise<string> {
    try {
      logger.info('Exporting user summary', { userId });

      const insights = await this.generateUserInsights(userId);
      const progression = await this.getEmotionProgression(userId, 7);

      const summary = {
        exportDate: new Date().toISOString(),
        userId,
        insights,
        recentTrends: progression.slice(-7),
      };

      return JSON.stringify(summary, null, 2);
    } catch (error) {
      logger.error('Error exporting user summary', error);
      return '';
    }
  }
}

export const analyticsService = new AnalyticsService();
