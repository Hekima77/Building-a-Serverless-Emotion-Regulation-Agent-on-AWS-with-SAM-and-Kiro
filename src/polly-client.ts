/**
 * AWS Polly client for text-to-speech audio generation
 * Converts breathing routine instructions to audio for accessibility and guided experience
 */

import { PollyClient, SynthesizeSpeechCommand, OutputFormat, VoiceId } from '@aws-sdk/client-polly';
import { config } from './config';
import { logger } from './logger';
import { AudioResource } from './types';
import * as fs from 'fs';
import * as path from 'path';

export interface PollyOptions {
  voiceId?: VoiceId;
  engine?: 'standard' | 'neural';
  rate?: string; // e.g., "0.85" for slower speech
  pitch?: string; // e.g., "low" for calming effect
}

export class PollyClient {
  private client: PollyClient;
  private voiceId: VoiceId;
  private outputDir: string;

  constructor() {
    this.client = new PollyClient({ region: config.aws.region });
    this.voiceId = (config.polly.voiceId as VoiceId) || 'Joanna';
    this.outputDir = path.join(process.cwd(), 'audio-output');

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate audio from breathing routine instructions
   */
  async generateBreathingAudio(
    instructions: string,
    options?: PollyOptions
  ): Promise<AudioResource | null> {
    try {
      logger.info('Generating audio with Polly', {
        voiceId: options?.voiceId || this.voiceId,
        textLength: instructions.length,
      });

      const voiceId = (options?.voiceId || this.voiceId) as VoiceId;

      // Build SSML with appropriate speech rate and emotion
      const ssml = this.buildSSML(instructions, options);

      const command = new SynthesizeSpeechCommand({
        Text: ssml,
        TextType: 'ssml',
        OutputFormat: OutputFormat.MP3,
        VoiceId: voiceId,
        Engine: options?.engine === 'neural' ? 'neural' : 'standard',
      });

      const response = await this.client.send(command);

      if (!response.AudioStream) {
        logger.warn('Empty audio stream from Polly');
        return null;
      }

      // Save audio to file
      const audioBuffer = await this.streamToBuffer(response.AudioStream);
      const audioId = `breathing-audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const filePath = path.join(this.outputDir, `${audioId}.mp3`);

      fs.writeFileSync(filePath, audioBuffer);

      logger.info('Audio file generated successfully', {
        audioId,
        filePath,
        size: audioBuffer.length,
      });

      return {
        url: filePath,
        format: 'audio/mpeg',
        duration: this.estimateAudioDuration(instructions),
      };
    } catch (error) {
      logger.error('Error generating audio with Polly', error);
      return null;
    }
  }

  /**
   * Generate audio for detailed breathing instructions with timing cues
   */
  async generateDetailedBreathingAudio(
    instructions: string,
    cycles: number,
    timings: number[]
  ): Promise<AudioResource | null> {
    try {
      logger.info('Generating detailed breathing audio with timing cues', {
        cycles,
        timingCount: timings.length,
      });

      // Enhance instructions with spoken timing guidance
      const enhancedInstructions = this.enhanceWithTimingCues(instructions, timings);

      return await this.generateBreathingAudio(enhancedInstructions, {
        rate: '0.85', // Slower speech for better clarity
        engine: 'neural', // Neural for more natural sound
      });
    } catch (error) {
      logger.error('Error generating detailed breathing audio', error);
      return null;
    }
  }

  /**
   * Generate calming introduction audio
   */
  async generateCalmingIntroductionAudio(emotionalContext: string): Promise<AudioResource | null> {
    try {
      logger.info('Generating calming introduction audio', { emotionalContext });

      const introScript = `${emotionalContext}

Let's begin. Find a comfortable position where you can breathe freely.

I'll guide you through a breathing exercise. We'll work together at a calm pace.

Are you ready? Let's start.`;

      return await this.generateBreathingAudio(introScript, {
        rate: '0.9',
        pitch: 'low',
        engine: 'neural',
      });
    } catch (error) {
      logger.error('Error generating calming introduction', error);
      return null;
    }
  }

  /**
   * Build SSML markup for better control over speech
   */
  private buildSSML(text: string, options?: PollyOptions): string {
    const rate = options?.rate ? `rate="${options.rate}"` : 'rate="0.95"';
    const pitch = options?.pitch ? `pitch="${options.pitch}"` : '';

    // Wrap in SSML with prosody for calm, measured delivery
    return `<speak>
<prosody ${rate} ${pitch}>
${this.escapeSSML(text)}
</prosody>
</speak>`;
  }

  /**
   * Escape text for SSML
   */
  private escapeSSML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Enhance instructions with spoken timing cues
   */
  private enhanceWithTimingCues(instructions: string, timings: number[]): string {
    let enhanced = instructions;

    // Add pause marks for inhale/hold/exhale transitions
    const pauseInstructions = timings
      .map((timing, index) => {
        const phase = index % 3;
        let phaseLabel = '';

        if (phase === 0) phaseLabel = 'Inhale';
        else if (phase === 1) phaseLabel = 'Hold';
        else phaseLabel = 'Exhale';

        return `${phaseLabel} for ${timing} seconds. <break time="${timing}s"/>`;
      })
      .join(' ');

    enhanced = enhanced.replace(
      /Repeat this cycle/,
      `${pauseInstructions}. Now repeat`
    );

    return enhanced;
  }

  /**
   * Estimate audio duration based on text length
   */
  private estimateAudioDuration(text: string): number {
    // Average speaking rate: ~150 words per minute = 2.5 words per second
    const wordCount = text.split(/\s+/).length;
    const estimatedSeconds = Math.ceil(wordCount / 2.5);
    return estimatedSeconds;
  }

  /**
   * Convert Node.js stream to buffer
   */
  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Uint8Array[] = [];

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Uint8Array) => {
        chunks.push(chunk);
      });

      stream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * List available voices
   */
  getAvailableVoices(): Record<string, string> {
    return {
      joanna: 'Female - Calm and soothing (recommended)',
      matthew: 'Male - Clear and reassuring',
      kimberly: 'Female - Warm and supportive',
      justin: 'Male - Young and approachable',
      ivy: 'Female - Cheerful and energetic',
      danny: 'Male - Uplifting and friendly',
    };
  }

  /**
   * Set default voice
   */
  setDefaultVoice(voice: VoiceId): void {
    this.voiceId = voice;
    logger.info('Default voice updated', { voice });
  }

  /**
   * Get audio output directory
   */
  getOutputDirectory(): string {
    return this.outputDir;
  }

  /**
   * Clean up old audio files (keep only recent ones)
   */
  cleanupOldAudioFiles(maxAgeHours: number = 24): void {
    try {
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;

      fs.readdirSync(this.outputDir).forEach((file) => {
        const filePath = path.join(this.outputDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtime.getTime();

        if (fileAge > maxAge) {
          fs.unlinkSync(filePath);
          logger.debug('Cleaned up old audio file', { file, ageHours: fileAge / (60 * 60 * 1000) });
        }
      });
    } catch (error) {
      logger.warn('Error during audio cleanup', error);
    }
  }
}

export const pollyClient = new PollyClient();
