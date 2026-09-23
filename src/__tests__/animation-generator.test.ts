/**
 * Tests for animation generation
 */

import { animationGenerator } from '../animation-generator';

describe('AnimationGenerator', () => {
  describe('generateBreathingAnimation', () => {
    it('should generate valid HTML animation', () => {
      const html = animationGenerator.generateBreathingAnimation({
        cycles: 5,
        inhaleSeconds: 4,
        holdSeconds: 4,
        exhaleSeconds: 6,
        theme: 'calm',
      });

      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('breathing-circle');
      expect(html).toContain('@keyframes breathe');
      expect(html).toContain('</html>');
    });

    it('should include animation duration calculation', () => {
      const html = animationGenerator.generateBreathingAnimation({
        cycles: 5,
        inhaleSeconds: 4,
        holdSeconds: 4,
        exhaleSeconds: 6,
      });

      const totalDuration = 5 * (4 + 4 + 6); // 70 seconds
      expect(html).toContain(`${totalDuration}s`);
    });

    it('should support different themes', () => {
      const calmHtml = animationGenerator.generateBreathingAnimation({
        cycles: 5,
        inhaleSeconds: 4,
        holdSeconds: 4,
        exhaleSeconds: 6,
        theme: 'calm',
      });

      const energeticHtml = animationGenerator.generateBreathingAnimation({
        cycles: 5,
        inhaleSeconds: 4,
        holdSeconds: 4,
        exhaleSeconds: 6,
        theme: 'energetic',
      });

      expect(calmHtml).not.toBe(energeticHtml);
      expect(calmHtml).toContain('e0f2f1'); // Calm theme color
      expect(energeticHtml).toContain('f3e5f5'); // Energetic theme color
    });

    it('should include JavaScript timer and phase tracking', () => {
      const html = animationGenerator.generateBreathingAnimation({
        cycles: 5,
        inhaleSeconds: 4,
        holdSeconds: 4,
        exhaleSeconds: 6,
      });

      expect(html).toContain('requestAnimationFrame');
      expect(html).toContain('updatePhase');
      expect(html).toContain('Inhale');
      expect(html).toContain('Hold');
      expect(html).toContain('Exhale');
    });
  });

  describe('generateMobileAnimation', () => {
    it('should generate mobile-responsive animation', () => {
      const html = animationGenerator.generateMobileAnimation({
        cycles: 5,
        inhaleSeconds: 4,
        holdSeconds: 4,
        exhaleSeconds: 6,
      });

      expect(html).toContain('apple-mobile-web-app-capable');
      expect(html).toContain('max-width: 768px');
    });
  });

  describe('createAnimationResource', () => {
    it('should create animation resource with correct properties', () => {
      const html = '<html></html>';
      const resource = animationGenerator.createAnimationResource(html, 'test.html');

      expect(resource.url).toBe('test.html');
      expect(resource.type).toBe('text/html');
    });
  });
});
