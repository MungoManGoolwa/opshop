# Multi-stage build for Opshop Online marketplace
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Build the application
FROM base AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 opshop

# Copy built application
COPY --from=builder --chown=opshop:nodejs /app/dist ./dist
COPY --from=deps --chown=opshop:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=opshop:nodejs /app/package.json ./package.json

# Copy public assets
COPY --from=builder --chown=opshop:nodejs /app/public ./public

USER opshop

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "dist/index.js"]