/**
 * Demo: Emotion Regulation Agent
 * Runs without external dependencies (pure JavaScript)
 */

// ============================================================================
// STRESS DETECTOR
// ============================================================================

class StressDetector {
  constructor() {
    this.keywords = {
      anxiety: ['anxious', 'anxiety', 'nervous', 'worried', 'uneasy', 'jittery', 'panicked'],
      stress: ['stressed', 'stress', 'overwhelming', 'overwhelmed', 'pressured', 'burdened'],
      sadness: ['sad', 'depressed', 'blue', 'gloomy', 'miserable', 'unhappy'],
      anger: ['angry', 'furious', 'rage', 'irritated', 'frustrated', 'mad'],
      overwhelm: ['overwhelmed', 'drowning', 'swamped', 'buried', 'suffocated', 'trapped'],
    };
  }

  detectStress(text) {
    if (!text || text.trim().length === 0) {
      return { isStressed: false, confidence: 0, detectedEmotions: [], rawText: text };
    }

    const normalizedText = text.toLowerCase();
    const detectedEmotions = [];
    let matchCount = 0;

    for (const [emotion, keywords] of Object.entries(this.keywords)) {
      for (const keyword of keywords) {
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

    const confidence = Math.min(matchCount / 3, 1.0);
    const isStressed = confidence > 0.2;

    return { isStressed, confidence, detectedEmotions, rawText: text };
  }

  getEmotionMessage(detectedEmotions) {
    if (detectedEmotions.length === 0) {
      return 'You seem calm right now.';
    }

    const descriptions = {
      anxiety: 'I sense some anxiety',
      stress: 'I detect stress',
      sadness: 'I sense sadness',
      anger: 'I notice some anger',
      overwhelm: 'You seem overwhelmed',
    };

    const msgs = detectedEmotions.map((e) => descriptions[e] || e).join(', ');
    return `${msgs}. Let's take a moment to breathe and calm down.`;
  }
}

// ============================================================================
// BREATHING ROUTINE GENERATOR
// ============================================================================

class BreathingRoutineGenerator {
  generateRoutine() {
    const cycles = 5;
    const pattern = { inhale: 4, hold: 4, exhale: 6 };
    const totalDuration = cycles * (pattern.inhale + pattern.hold + pattern.exhale);

    const instructions = this.buildInstructions(cycles, pattern);

    return { instructions, duration: totalDuration, cycles, pattern };
  }

  buildInstructions(cycles, pattern) {
    let txt = `GUIDED BREATHING EXERCISE (${cycles} cycles, ${cycles * (pattern.inhale + pattern.hold + pattern.exhale)}s total)\n`;
    txt += `Pattern: Inhale for ${pattern.inhale}s → Hold for ${pattern.hold}s → Exhale for ${pattern.exhale}s\n`;
    txt += '---\n\n';

    for (let i = 1; i <= cycles; i++) {
      txt += `CYCLE ${i}:\n`;
      txt += `1. INHALE - Breathe in slowly through your nose for ${pattern.inhale} seconds\n`;
      txt += `2. HOLD - Keep the air in your lungs for ${pattern.hold} seconds\n`;
      txt += `3. EXHALE - Release the air slowly through your mouth for ${pattern.exhale} seconds\n`;
      if (i < cycles) txt += '\n';
    }

    txt += '\n---\n';
    txt += 'Tips:\n';
    txt += '• Breathe naturally, no forcing\n';
    txt += '• Focus on your breath\n';
    txt += '• Close your eyes if it helps you relax\n';

    return txt;
  }
}

// ============================================================================
// EMOTION AGENT
// ============================================================================

class EmotionAgent {
  constructor() {
    this.detector = new StressDetector();
    this.generator = new BreathingRoutineGenerator();
    this.interactions = [];
  }

  processUserInput(userInput, userId) {
    const interactionId = this.generateUUID();
    const timestamp = Date.now();

    // Detect stress
    const stressDetection = this.detector.detectStress(userInput);
    const emotionMessage = this.detector.getEmotionMessage(stressDetection.detectedEmotions);

    // Generate routine if stressed
    let routine = null;
    let responseMessage = emotionMessage;

    if (stressDetection.isStressed) {
      routine = this.generator.generateRoutine();
      responseMessage += '\n\n' + routine.instructions;
    } else {
      responseMessage += '\n\nNo breathing exercise needed right now.';
    }

    // Log interaction
    const log = {
      interactionId,
      timestamp,
      userId,
      userInput,
      detectedEmotions: stressDetection.detectedEmotions,
      isStressed: stressDetection.isStressed,
      confidence: stressDetection.confidence,
    };

    this.interactions.push(log);

    return {
      interactionId,
      message: responseMessage,
      stressDetection,
      routine,
      timestamp,
    };
  }

  getUserHistory(userId) {
    return this.interactions.filter((i) => i.userId === userId);
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// ============================================================================
// DEMO
// ============================================================================

console.log('\n🧠 Emotion Regulation Agent - Launching...\n');
console.log('='.repeat(80));

const agent = new EmotionAgent();

const testInputs = [
  { text: "I'm feeling really anxious about my presentation", userId: 'user-1' },
  { text: 'Everything is going great today', userId: 'user-2' },
  { text: 'I feel overwhelmed and stressed out', userId: 'user-3' },
  { text: "I'm angry and frustrated with this situation", userId: 'user-1' },
];

for (const input of testInputs) {
  console.log(`\n📝 Input from ${input.userId}:`);
  console.log(`   "${input.text}"\n`);

  const response = agent.processUserInput(input.text, input.userId);

  console.log(`✅ Interaction ID: ${response.interactionId}`);
  console.log(`📊 Stress Detected: ${response.stressDetection.isStressed}`);
  console.log(`💯 Confidence: ${(response.stressDetection.confidence * 100).toFixed(1)}%`);
  console.log(`😟 Emotions: ${response.stressDetection.detectedEmotions.join(', ') || 'None'}`);

  if (response.routine) {
    console.log(`\n🫁 Breathing Routine:`);
    console.log(`   - Duration: ${response.routine.duration}s`);
    console.log(`   - Cycles: ${response.routine.cycles}`);
    console.log(
      `   - Pattern: Inhale ${response.routine.pattern.inhale}s → Hold ${response.routine.pattern.hold}s → Exhale ${response.routine.pattern.exhale}s`
    );
  }

  console.log('\n' + '='.repeat(80));
}

// Show user history
console.log('\n📊 USER HISTORY\n');
console.log('='.repeat(80));

for (const userId of ['user-1', 'user-2', 'user-3']) {
  const history = agent.getUserHistory(userId);
  console.log(`\n${userId}: ${history.length} interaction(s)`);
  for (const log of history) {
    console.log(
      `  - [${new Date(log.timestamp).toLocaleTimeString()}] "${log.userInput.substring(0, 40)}..." (Stress: ${log.isStressed})`
    );
  }
}

console.log('\n' + '='.repeat(80));
console.log('\n✨ Demo complete! The system is working.\n');
