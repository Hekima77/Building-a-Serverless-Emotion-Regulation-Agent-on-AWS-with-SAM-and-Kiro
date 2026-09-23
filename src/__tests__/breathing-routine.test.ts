import { BreathingRoutineGenerator } from '../services/breathing-routine';

describe('BreathingRoutineGenerator', () => {
  let generator: BreathingRoutineGenerator;

  beforeEach(() => {
    generator = new BreathingRoutineGenerator();
  });

  test('should generate a breathing routine', () => {
    const routine = generator.generateRoutine();
    expect(routine).toBeDefined();
    expect(routine.cycles).toBe(5);
    expect(routine.pattern.inhale).toBe(4);
    expect(routine.pattern.hold).toBe(4);
    expect(routine.pattern.exhale).toBe(6);
  });

  test('should calculate correct total duration', () => {
    const routine = generator.generateRoutine();
    const cycleTime = 4 + 4 + 6; // 14 seconds
    const expectedDuration = 5 * cycleTime; // 70 seconds
    expect(routine.duration).toBe(expectedDuration);
  });

  test('should generate instructions with step-by-step guidance', () => {
    const routine = generator.generateRoutine();
    expect(routine.instructions).toContain('GUIDED BREATHING EXERCISE');
    expect(routine.instructions).toContain('Inhale');
    expect(routine.instructions).toContain('Hold');
    expect(routine.instructions).toContain('Exhale');
    expect(routine.instructions).toContain('CYCLE 1');
    expect(routine.instructions).toContain('CYCLE 5');
  });

  test('should include tips in instructions', () => {
    const routine = generator.generateRoutine();
    expect(routine.instructions).toContain('Tips:');
    expect(routine.instructions).toContain('Breathe naturally');
  });
});
