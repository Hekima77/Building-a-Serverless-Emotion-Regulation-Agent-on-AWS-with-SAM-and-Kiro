# Contributing Guide

Thank you for your interest in contributing to the Emotion Regulation Agent! This guide will help you get started.

## Code of Conduct

Please be respectful and inclusive in all interactions. We're committed to providing a welcoming environment for everyone.

## Getting Started

### Prerequisites

- Node.js 18+
- Git
- AWS Account (for deployment)
- Docker (optional, for local development)

### Setup Development Environment

```bash
# Clone the repository
git clone <repo-url>
cd emotion-regulation-agent

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Install pre-commit hooks (optional)
git init
```

## Development Workflow

### 1. Create a Branch

```bash
# Always create a feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Branch naming conventions:
# - feature/description
# - bugfix/description
# - docs/description
# - test/description
```

### 2. Make Changes

```bash
# Follow the project structure:
# src/
#   ├── services/     (business logic)
#   ├── lambda/       (Lambda handlers)
#   ├── __tests__/    (tests)
#   └── types.ts      (TypeScript interfaces)

# Code style:
# - Use TypeScript
# - Follow existing patterns
# - Add JSDoc comments
# - Keep functions small and focused
```

### 3. Testing

```bash
# Run tests locally
npm run test

# Run tests in watch mode
npm run test -- --watch

# Check coverage
npm run test -- --coverage

# Run specific test file
npm run test -- stress-detector.test.ts
```

### 4. Linting & Formatting

```bash
# Check for issues
npm run lint

# Auto-fix formatting
npm run format

# Before committing, ensure:
npm run lint
npm run format
npm run build
npm run test
```

### 5. Commit & Push

```bash
# Commit with clear message
git add .
git commit -m "feat: add anxiety detection improvements"

# Commit message format:
# feat:  new feature
# fix:   bug fix
# docs:  documentation
# test:  tests
# perf:  performance improvement
# refactor: code refactoring

# Push to your fork
git push origin feature/your-feature-name
```

### 6. Create Pull Request

1. Go to GitHub repository
2. Click "Compare & pull request"
3. Fill out PR template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Testing Done
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No new warnings generated
```

## Testing Guidelines

### Unit Tests

```typescript
// Example test structure
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  afterEach(() => {
    // Cleanup
  });

  it('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Test Coverage Requirements

- Minimum 70% code coverage
- All public methods tested
- Happy path and error cases
- Edge cases considered

### Running Tests

```bash
# All tests
npm run test

# Specific test file
npm run test -- filename.test.ts

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage
```

## Documentation

### Code Documentation

```typescript
/**
 * Brief description of what this function does
 * 
 * @param {string} userInput - The text to analyze for stress
 * @param {string} userId - Optional user identifier
 * @returns {Promise<EmotionAnalysis>} Analysis result with stress indicators
 * @throws {Error} If Bedrock API fails
 * 
 * @example
 * const analysis = await detectStress(userInput, userId);
 * if (analysis.isStressed) {
 *   // Generate breathing guidance
 * }
 */
export async function detectStress(
  userInput: string,
  userId?: string
): Promise<EmotionAnalysis> {
  // Implementation
}
```

### README Updates

- Document new features in README.md
- Update architecture diagrams if applicable
- Add examples of usage
- Update API endpoint documentation

### Changelog

- Add entry in CHANGELOG.md
- Format: `[type] description`
- Types: Added, Changed, Fixed, Removed

## Project Structure

```
emotion-regulation-agent/
├── src/
│   ├── __tests__/              # Unit tests
│   ├── lambda/                 # Lambda handlers
│   ├── animation-generator.ts  # Animation creation
│   ├── audio-service.ts        # Audio generation
│   ├── bedrock-client.ts       # Bedrock integration
│   ├── breathing-routine.ts    # Breathing exercises
│   ├── config.ts               # Configuration
│   ├── dynamodb-client.ts      # Database operations
│   ├── emotion-agent.ts        # Main orchestrator
│   ├── logger.ts               # Logging utility
│   ├── polly-client.ts         # Polly integration
│   ├── s3-client.ts            # S3 operations
│   ├── stress-detector.ts      # Stress detection
│   ├── types.ts                # TypeScript types
│   └── index.ts                # Entry point
├── template.yaml               # SAM CloudFormation
├── Makefile                    # Build commands
└── package.json                # Dependencies
```

## Adding New Features

### 1. Plan the Feature

- Create an issue describing the feature
- Discuss approach in the issue
- Get feedback before implementing

### 2. Create Test-First

```typescript
// Write test first
describe('NewFeature', () => {
  it('should work as expected', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### 3. Implement Feature

- Follow existing patterns
- Keep functions small
- Write self-documenting code
- Add error handling

### 4. Update Documentation

- Update README.md
- Add JSDoc comments
- Update type definitions
- Add examples

### 5. Test Integration

```bash
# Test locally with docker-compose
docker-compose up
npm run dev

# Test with SAM local
sam local start-api

# Test with actual AWS (dev environment)
npm run build
make deploy-dev
```

## Bug Reporting

### Before Reporting

- Check existing issues
- Verify with latest code
- Gather error logs
- Test with minimal reproduction

### Report Format

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Node.js version: 18.x
- AWS Region: us-east-1
- Environment: dev/prod

## Error Logs
```
Error message here
Stack trace
```

## Potential Solution
(Optional) Your thoughts on fixing it
```

## Performance Optimization

### Guidelines

- Profile before optimizing
- Document performance characteristics
- Add benchmarks for critical paths
- Consider tradeoffs (speed vs memory)

### Tools

```bash
# Profile Lambda
aws lambda get-account-settings

# Check execution time
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Duration

# Memory usage
npm run test -- --detectOpenHandles
```

## Security

### Guidelines

- Never commit secrets or credentials
- Use AWS Secrets Manager for sensitive data
- Follow principle of least privilege
- Keep dependencies updated

### Scanning

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Security scanning
npm run lint
```

## Deployment

### Dev Deployment

```bash
npm run build
make deploy-dev
```

### Production Deployment

```bash
# Only maintainers can merge to main
git checkout main
git pull origin main

npm run build
npm run test
make deploy-prod
```

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests added and passing
- [ ] Documentation updated
- [ ] No console logs left
- [ ] Error handling implemented
- [ ] Performance considered
- [ ] Security review passed
- [ ] No breaking changes (or documented)

## Getting Help

- Check existing documentation
- Look at similar code in the project
- Ask questions in GitHub Issues
- Review AWS documentation
- Check TypeScript documentation

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes for major contributions
- Project README (for significant work)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Additional Resources

- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/lambda-best-practices.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)
- [Git Workflow](https://git-scm.com/book/en/v2)

---

Thank you for contributing! 🙏
