/**
 * Application configuration
 */

interface Config {
  aws: {
    region: string;
    bedrockModel: string;
  };
  dynamodb: {
    tableName: string;
  };
  s3: {
    bucketName: string;
    animationKey: string;
  };
  lambda: {
    functionName: string;
  };
  polly: {
    voiceId: string;
  };
  app: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    enableAudio: boolean;
    enableAnimation: boolean;
  };
}

export const config: Config = {
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    bedrockModel: process.env.AWS_BEDROCK_MODEL || 'anthropic.claude-3-haiku-20240307-v1:0',
  },
  dynamodb: {
    tableName: process.env.DYNAMODB_TABLE_NAME || 'emotion-interaction-logs',
  },
  s3: {
    bucketName: process.env.S3_BUCKET_NAME || 'emotion-regulation-animations',
    animationKey: process.env.S3_ANIMATION_KEY || 'breathing-animation.html',
  },
  lambda: {
    functionName: process.env.LAMBDA_FUNCTION_NAME || 'emotion-breathing-routine',
  },
  polly: {
    voiceId: process.env.POLLY_VOICE_ID || 'Joanna',
  },
  app: {
    logLevel: (process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'info',
    enableAudio: process.env.ENABLE_AUDIO !== 'false',
    enableAnimation: process.env.ENABLE_ANIMATION !== 'false',
  },
};

export default config;
