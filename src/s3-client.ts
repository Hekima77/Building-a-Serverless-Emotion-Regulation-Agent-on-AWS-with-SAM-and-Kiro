/**
 * AWS S3 client for storing and serving animation files
 */

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { config } from './config';
import { logger } from './logger';
import { AnimationResource } from './types';

export class S3Manager {
  private client: S3Client;
  private bucketName: string;

  constructor() {
    this.client = new S3Client({ region: config.aws.region });
    this.bucketName = config.s3.bucketName;
  }

  /**
   * Upload animation HTML to S3
   */
  async uploadAnimation(
    animationHtml: string,
    fileName: string
  ): Promise<AnimationResource | null> {
    try {
      logger.info('Uploading animation to S3', { fileName, bucketName: this.bucketName });

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: animationHtml,
        ContentType: 'text/html',
        CacheControl: 'max-age=3600', // Cache for 1 hour
        Metadata: {
          'created-date': new Date().toISOString(),
          'content-type': 'breathing-animation',
        },
      });

      await this.client.send(command);

      const url = this.generatePublicUrl(fileName);

      logger.info('Animation uploaded successfully', { url });

      return {
        url,
        type: 'text/html',
      };
    } catch (error) {
      logger.error('Error uploading animation to S3', error);
      return null;
    }
  }

  /**
   * Upload multiple animations in batch
   */
  async uploadAnimationBatch(
    animations: Array<{ html: string; fileName: string }>
  ): Promise<(AnimationResource | null)[]> {
    try {
      logger.info('Uploading animation batch', { count: animations.length });

      const results = await Promise.all(
        animations.map((anim) => this.uploadAnimation(anim.html, anim.fileName))
      );

      logger.info('Animation batch upload completed', {
        successful: results.filter((r) => r !== null).length,
        total: results.length,
      });

      return results;
    } catch (error) {
      logger.error('Error uploading animation batch', error);
      return animations.map(() => null);
    }
  }

  /**
   * Retrieve animation from S3
   */
  async downloadAnimation(fileName: string): Promise<string | null> {
    try {
      logger.info('Downloading animation from S3', { fileName });

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      const response = await this.client.send(command);

      if (!response.Body) {
        logger.warn('Empty response body from S3');
        return null;
      }

      const html = await this.streamToString(response.Body);

      logger.info('Animation downloaded successfully');
      return html;
    } catch (error) {
      logger.error('Error downloading animation from S3', error);
      return null;
    }
  }

  /**
   * Generate public URL for animation
   */
  generatePublicUrl(fileName: string): string {
    return `https://${this.bucketName}.s3.${config.aws.region}.amazonaws.com/${fileName}`;
  }

  /**
   * Generate presigned URL (temporary access)
   */
  async generatePresignedUrl(fileName: string, expirationSeconds: number = 3600): Promise<string> {
    logger.info('Generating presigned URL', { fileName, expirationSeconds });

    // In production, use AWS SDK's presigned URL functionality
    // This is a placeholder showing the format
    return `${this.generatePublicUrl(fileName)}?expires=${Date.now() + expirationSeconds * 1000}`;
  }

  /**
   * List animations in bucket
   */
  async listAnimations(prefix: string = 'animations/'): Promise<string[]> {
    try {
      logger.info('Listing animations in S3', { prefix });

      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: prefix,
      });

      const response = await this.client.send(command);
      const files = (response.Contents || []).map((obj) => obj.Key || '');

      logger.info('Animations listed', { count: files.length });
      return files;
    } catch (error) {
      logger.error('Error listing animations', error);
      return [];
    }
  }

  /**
   * Delete animation from S3
   */
  async deleteAnimation(fileName: string): Promise<boolean> {
    try {
      logger.info('Deleting animation from S3', { fileName });

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
      });

      await this.client.send(command);

      logger.info('Animation deleted successfully');
      return true;
    } catch (error) {
      logger.error('Error deleting animation', error);
      return false;
    }
  }

  /**
   * Convert stream to string
   */
  private async streamToString(stream: NodeJS.ReadableStream): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: string[] = [];

      stream.on('data', (chunk: Buffer) => {
        chunks.push(chunk.toString('utf8'));
      });

      stream.on('end', () => {
        resolve(chunks.join(''));
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Check S3 bucket health
   */
  async checkBucketHealth(): Promise<boolean> {
    try {
      logger.debug('Checking S3 bucket health');

      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
        MaxKeys: 1,
      });

      await this.client.send(command);

      logger.info('S3 bucket is healthy');
      return true;
    } catch (error) {
      logger.error('S3 bucket health check failed', error);
      return false;
    }
  }

  /**
   * Get bucket statistics
   */
  async getBucketStats(): Promise<{ fileCount: number; lastModified?: Date }> {
    try {
      logger.info('Getting bucket statistics');

      const command = new ListObjectsV2Command({
        Bucket: this.bucketName,
      });

      const response = await this.client.send(command);
      const fileCount = response.Contents?.length || 0;
      const lastModified = response.Contents?.[0]?.LastModified;

      return { fileCount, lastModified };
    } catch (error) {
      logger.error('Error getting bucket statistics', error);
      return { fileCount: 0 };
    }
  }
}

export const s3Manager = new S3Manager();
