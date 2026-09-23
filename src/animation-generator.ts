/**
 * Visual animation generator for breathing exercises
 * Creates HTML/CSS animations of expanding/contracting circles
 */

import { logger } from './logger';
import { AnimationResource } from './types';

export interface AnimationOptions {
  cycles: number;
  inhaleSeconds: number;
  holdSeconds: number;
  exhaleSeconds: number;
  theme?: 'calm' | 'energetic' | 'minimal';
}

export class AnimationGenerator {
  /**
   * Generate breathing animation HTML
   */
  generateBreathingAnimation(options: AnimationOptions): string {
    logger.info('Generating breathing animation', {
      cycles: options.cycles,
      theme: options.theme || 'calm',
    });

    const totalDuration =
      (options.inhaleSeconds + options.holdSeconds + options.exhaleSeconds) *
      options.cycles;

    const theme = options.theme || 'calm';
    const colors = this.getThemeColors(theme);

    // Create keyframe animations
    const keyframes = this.generateKeyframes(options);

    // Create HTML structure
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Guided Breathing Exercise</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            width: 100%;
            height: 100vh;
            background: linear-gradient(135deg, ${colors.bgGradient1} 0%, ${colors.bgGradient2} 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
        }

        .container {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 40px;
        }

        .animation-wrapper {
            position: relative;
            width: 300px;
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .breathing-circle {
            position: absolute;
            border-radius: 50%;
            background: radial-gradient(circle at 30% 30%, ${colors.circleLight}, ${colors.circleDark});
            box-shadow: 0 0 40px ${colors.glow};
            animation: breathe ${totalDuration}s ease-in-out infinite;
        }

        .breathing-circle-1 {
            width: 200px;
            height: 200px;
            animation-delay: 0s;
        }

        .breathing-circle-2 {
            width: 150px;
            height: 150px;
            animation-delay: 0.5s;
            opacity: 0.7;
        }

        .breathing-circle-3 {
            width: 100px;
            height: 100px;
            animation-delay: 1s;
            opacity: 0.4;
        }

        ${keyframes}

        .instruction {
            font-size: 24px;
            font-weight: 300;
            color: ${colors.textPrimary};
            text-align: center;
            min-height: 40px;
            letter-spacing: 1px;
        }

        .phase-label {
            font-size: 18px;
            color: ${colors.textSecondary};
            margin-top: 10px;
            animation: fadePhase ${totalDuration}s ease-in-out infinite;
        }

        @keyframes fadePhase {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }

        .stats {
            display: flex;
            gap: 30px;
            margin-top: 20px;
            font-size: 16px;
            color: ${colors.textSecondary};
        }

        .stat {
            text-align: center;
        }

        .stat-label {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
            opacity: 0.8;
        }

        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: ${colors.textPrimary};
        }

        .timer {
            font-size: 14px;
            color: ${colors.textSecondary};
            margin-top: 20px;
        }

        .message {
            position: fixed;
            top: 30px;
            left: 30px;
            right: 30px;
            font-size: 14px;
            color: ${colors.textSecondary};
            text-align: center;
        }

        .completion-message {
            position: fixed;
            bottom: 30px;
            left: 30px;
            right: 30px;
            font-size: 16px;
            color: ${colors.textPrimary};
            text-align: center;
            opacity: 0;
            animation: showCompletion 2s ease-in-out ${totalDuration - 2}s forwards;
        }

        @keyframes showCompletion {
            0% { opacity: 0; }
            50% { opacity: 1; }
            100% { opacity: 0; }
        }
    </style>
</head>
<body>
    <div class="message">
        <p>Follow the expanding and contracting circle</p>
    </div>

    <div class="container">
        <div class="animation-wrapper">
            <div class="breathing-circle breathing-circle-1"></div>
            <div class="breathing-circle breathing-circle-2"></div>
            <div class="breathing-circle breathing-circle-3"></div>
        </div>

        <div>
            <div class="instruction" id="instruction">Ready to begin</div>
            <div class="phase-label" id="phase">Breathing exercise</div>
        </div>

        <div class="stats">
            <div class="stat">
                <div class="stat-label">Cycles</div>
                <div class="stat-value">${options.cycles}</div>
            </div>
            <div class="stat">
                <div class="stat-label">Duration</div>
                <div class="stat-value">${Math.round(totalDuration / 60)}m</div>
            </div>
        </div>

        <div class="timer" id="timer">0:00</div>
    </div>

    <div class="completion-message">
        ✓ Excellent work! You've completed the exercise.
    </div>

    <script>
        const totalDuration = ${totalDuration};
        const inhaleSeconds = ${options.inhaleSeconds};
        const holdSeconds = ${options.holdSeconds};
        const exhaleSeconds = ${options.exhaleSeconds};
        const cycles = ${options.cycles};
        const cycleDuration = inhaleSeconds + holdSeconds + exhaleSeconds;

        const instructionEl = document.getElementById('instruction');
        const phaseEl = document.getElementById('phase');
        const timerEl = document.getElementById('timer');

        const instructions = {
            inhale: 'Inhale slowly through your nose',
            hold: 'Hold your breath gently',
            exhale: 'Exhale slowly through your mouth'
        };

        function updatePhase(elapsed) {
            const cyclePosition = elapsed % cycleDuration;
            let phase = '';
            let phaseTime = '';

            if (cyclePosition < inhaleSeconds) {
                phase = 'Inhale';
                phaseTime = Math.ceil(inhaleSeconds - cyclePosition);
            } else if (cyclePosition < inhaleSeconds + holdSeconds) {
                phase = 'Hold';
                phaseTime = Math.ceil(inhaleSeconds + holdSeconds - cyclePosition);
            } else {
                phase = 'Exhale';
                phaseTime = Math.ceil(cycleDuration - cyclePosition);
            }

            instructionEl.textContent = instructions[phase.toLowerCase()] || 'Breathing';
            phaseEl.textContent = \`\${phase} - \${phaseTime}s\`;
        }

        function updateTimer(elapsed) {
            const minutes = Math.floor(elapsed / 60);
            const seconds = Math.floor(elapsed % 60);
            timerEl.textContent = \`\${minutes}:\${seconds.toString().padStart(2, '0')}\`;
        }

        let startTime = Date.now();
        function animate() {
            const elapsed = (Date.now() - startTime) / 1000;

            if (elapsed < totalDuration) {
                updatePhase(elapsed);
                updateTimer(elapsed);
                requestAnimationFrame(animate);
            } else {
                instructionEl.textContent = 'Exercise complete';
                phaseEl.textContent = 'Well done!';
                updateTimer(totalDuration);
            }
        }

        window.addEventListener('load', () => {
            animate();
        });
    </script>
</body>
</html>`;

    return html;
  }

  /**
   * Generate CSS keyframes for animation
   */
  private generateKeyframes(options: AnimationOptions): string {
    const totalDuration =
      (options.inhaleSeconds + options.holdSeconds + options.exhaleSeconds) *
      options.cycles;

    const inhalePct = (options.inhaleSeconds / totalDuration) * 100;
    const holdPct = ((options.inhaleSeconds + options.holdSeconds) / totalDuration) * 100;

    return `
        @keyframes breathe {
            0% {
                transform: scale(1);
                opacity: 0.8;
            }
            ${inhalePct}% {
                transform: scale(1.3);
                opacity: 1;
            }
            ${holdPct}% {
                transform: scale(1.3);
                opacity: 1;
            }
            100% {
                transform: scale(1);
                opacity: 0.8;
            }
        }
    `;
  }

  /**
   * Get color theme
   */
  private getThemeColors(
    theme: 'calm' | 'energetic' | 'minimal'
  ): Record<string, string> {
    const themes: Record<string, Record<string, string>> = {
      calm: {
        bgGradient1: '#e0f2f1',
        bgGradient2: '#b2dfdb',
        circleDark: '#00897b',
        circleLight: '#4db6ac',
        glow: 'rgba(0, 137, 123, 0.5)',
        textPrimary: '#00695c',
        textSecondary: '#004d40',
      },
      energetic: {
        bgGradient1: '#f3e5f5',
        bgGradient2: '#e1bee7',
        circleDark: '#7b1fa2',
        circleLight: '#ba68c8',
        glow: 'rgba(123, 31, 162, 0.5)',
        textPrimary: '#4a148c',
        textSecondary: '#6a0572',
      },
      minimal: {
        bgGradient1: '#fafafa',
        bgGradient2: '#eeeeee',
        circleDark: '#424242',
        circleLight: '#757575',
        glow: 'rgba(66, 66, 66, 0.3)',
        textPrimary: '#212121',
        textSecondary: '#616161',
      },
    };

    return themes[theme] || themes.calm;
  }

  /**
   * Create animation resource
   */
  createAnimationResource(html: string, filename: string): AnimationResource {
    logger.info('Creating animation resource', { filename });

    return {
      url: filename,
      type: 'text/html',
    };
  }

  /**
   * Generate inline animation for embedding
   */
  generateInlineAnimation(options: AnimationOptions): string {
    return this.generateBreathingAnimation(options);
  }

  /**
   * Generate responsive animation for mobile
   */
  generateMobileAnimation(options: AnimationOptions): string {
    const html = this.generateBreathingAnimation(options);

    // Enhance for mobile touch interactions
    const mobileEnhanced = html.replace(
      '</head>',
      `
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <style>
        @media (max-width: 768px) {
            .animation-wrapper {
                width: 200px;
                height: 200px;
            }

            .breathing-circle-1 {
                width: 140px;
                height: 140px;
            }

            .breathing-circle-2 {
                width: 100px;
                height: 100px;
            }

            .breathing-circle-3 {
                width: 60px;
                height: 60px;
            }

            .instruction {
                font-size: 18px;
            }

            .stats {
                gap: 20px;
            }

            body {
                padding: 20px;
            }
        }
    </style>
    </head>`
    );

    return mobileEnhanced;
  }
}

export const animationGenerator = new AnimationGenerator();
