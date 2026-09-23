/**
 * Lambda function entry point
 * This is deployed to AWS Lambda for serverless breathing routine generation
 */

import { handler as breathingRoutineHandler } from './breathing-routine-handler';

export { handler as breathingRoutineHandler, generateAdvancedRoutine, generateRoutineInMultipleFormats } from './breathing-routine-handler';

// Export for AWS Lambda
export { breathingRoutineHandler };
