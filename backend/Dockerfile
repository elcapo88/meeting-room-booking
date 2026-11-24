# Multi-stage Dockerfile for MeetSol Backend Service
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig.json ./

# Install all dependencies (including dev for tsc)
RUN npm install

# Copy source code
COPY src ./src

# Compile TypeScript
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Install production dependencies only
COPY package*.json ./
RUN npm install --only=production

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Run as non-root user for security
USER node

EXPOSE 4000

CMD ["node", "dist/index.js"]
