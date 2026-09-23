import { StressDetector } from '../services/stress-detector';

describe('StressDetector', () => {
  let detector: StressDetector;

  beforeEach(() => {
    detector = new StressDetector();
  });

  test('should detect stress from anxious keywords', () => {
    const result = detector.detectStress("I'm feeling really anxious about my presentation");
    expect(result.isStressed).toBe(true);
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.detectedEmotions).toContain('anxiety');
  });

  test('should detect stress from overwhelm keywords', () => {
    const result = detector.detectStress('I feel overwhelmed with work');
    expect(result.isStressed).toBe(true);
    expect(result.detectedEmotions).toContain('overwhelm');
  });

  test('should detect multiple emotions', () => {
    const result = detector.detectStress('I am anxious and stressed about everything');
    expect(result.isStressed).toBe(true);
    expect(result.detectedEmotions).toContain('anxiety');
    expect(result.detectedEmotions).toContain('stress');
  });

  test('should not detect stress in calm text', () => {
    const result = detector.detectStress('Everything is going great today');
    expect(result.isStressed).toBe(false);
    expect(result.confidence).toBe(0);
  });

  test('should handle empty input', () => {
    const result = detector.detectStress('');
    expect(result.isStressed).toBe(false);
    expect(result.confidence).toBe(0);
  });

  test('should generate appropriate emotion message', () => {
    const message = detector.getEmotionMessage(['anxiety', 'stress']);
    expect(message).toContain('anxiety');
    expect(message).toContain('stress');
  });
});
