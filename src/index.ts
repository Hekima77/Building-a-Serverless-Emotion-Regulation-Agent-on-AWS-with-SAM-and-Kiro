/**
 * Local Development Entry Point
 * Run with: npx ts-node src/index.ts
 */

import { EmotionAgent } from './emotion-agent';

async function main() {
  console.log('🧠 Emotion Regulation Agent - Starting...\n');

  // Create agent (DynamoDB logging disabled locally)
  const agent = new EmotionAgent();

  // Test cases
  const testInputs = [
    { text: "I'm feeling really anxious about my presentation", userId: 'user-1' },
    { text: 'Everything is going great today', userId: 'user-2' },
    { text: 'I feel overwhelmed and stressed out', userId: 'user-3' },
  ];

  console.log('Running test cases...\n');
  console.log('='.repeat(80));

  for (const input of testInputs) {
    console.log(`\n📝 Input from ${input.userId}: "${input.text}"\n`);

    try {
      const response = await agent.processUserInput(input.text, input.userId);

      console.log(`✅ Interaction ID: ${response.interactionId}`);
      console.log(`📊 Stress Detected: ${response.stressDetection.isStressed}`);
      console.log(`💯 Confidence: ${(response.stressDetection.confidence * 100).toFixed(1)}%`);
      console.log(`😟 Emotions: ${response.stressDetection.detectedEmotions.join(', ') || 'None'}`);

      if (response.routine) {
        console.log(`\n🫁 Breathing Routine:`);
        console.log(`   - Duration: ${response.routine.duration}s`);
        console.log(`   - Cycles: ${response.routine.cycles}`);
        console.log(`   - Pattern: Inhale ${response.routine.pattern.inhale}s → Hold ${response.routine.pattern.hold}s → Exhale ${response.routine.pattern.exhale}s`);
      }

      console.log('\n' + '='.repeat(80));
    } catch (error) {
      console.error(`❌ Error processing input:`, error);
    }
  }

  console.log('\n✨ Test complete!\n');
}

main().catch(console.error);
