# Dockerfile for building Lambda function
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /var/task

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built Lambda handler
COPY --from=builder /app/dist/lambda/breathing-routine-handler.js ./
COPY --from=builder /app/dist/lambda/index.js ./

# Set Lambda handler
CMD ["index.breathingRoutineHandler"]
