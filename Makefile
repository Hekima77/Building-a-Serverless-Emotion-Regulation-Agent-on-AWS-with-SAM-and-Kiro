.PHONY: help install build test deploy deploy-dev deploy-prod clean lint format

help:
	@echo "Emotion Regulation Agent - Build Commands"
	@echo "=========================================="
	@echo ""
	@echo "Development:"
	@echo "  make install      - Install dependencies"
	@echo "  make build        - Build TypeScript"
	@echo "  make test         - Run tests"
	@echo "  make dev          - Run development"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy       - Deploy to dev environment"
	@echo "  make deploy-dev   - Deploy to dev environment"
	@echo "  make deploy-prod  - Deploy to production environment"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean        - Clean build artifacts"
	@echo "  make lint         - Run linter"
	@echo "  make format       - Format code"
	@echo "  make validate     - Validate CloudFormation template"

install:
	npm install

build: install
	npm run build

test: build
	npm run test

dev: install
	npm run dev

lint:
	npx eslint src --ext .ts

format:
	npx prettier --write src

validate:
	aws cloudformation validate-template --template-body file://template.yaml

# Development deployment
deploy-dev: build validate
	sam deploy \
		--template template.yaml \
		--config-env dev \
		--region us-east-1 \
		--parameter-overrides Environment=dev

# Production deployment (requires confirmation)
deploy-prod: build validate
	sam deploy \
		--template template.yaml \
		--config-env prod \
		--region us-east-1 \
		--parameter-overrides Environment=prod \
		--confirm-changeset

# Deploy (defaults to dev)
deploy: deploy-dev

# Local testing
local-start: build
	sam local start-api --region us-east-1

# Cleanup
clean:
	rm -rf dist
	rm -rf node_modules
	rm -rf .aws-sam
	rm -rf coverage

# View logs
logs-emotion:
	aws logs tail /aws/lambda/emotion-agent-dev --follow

logs-audio:
	aws logs tail /aws/lambda/emotion-audio-dev --follow

logs-animation:
	aws logs tail /aws/lambda/emotion-animation-dev --follow

# Get deployment info
info:
	aws cloudformation describe-stacks \
		--stack-name emotion-regulation-agent-dev \
		--region us-east-1 \
		--query 'Stacks[0].Outputs'

# Invoke functions locally
invoke-emotion-dev:
	sam local invoke EmotionAgentFunction --event events/emotion-event.json

invoke-breathing-dev:
	sam local invoke BreathingRoutineFunction --event events/breathing-event.json

invoke-audio-dev:
	sam local invoke AudioGenerationFunction --event events/audio-event.json

invoke-animation-dev:
	sam local invoke AnimationGenerationFunction --event events/animation-event.json
