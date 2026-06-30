# Multi-stage Dockerfile for Tech Ecommerce API
# Optimized for production with security best practices

# ============================================
# Stage 1: Build stage
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for testing)
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY src/ ./src/

# ============================================
# Stage 2: Production stage
# ============================================
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built artifacts from builder stage
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY package*.json ./

# Change to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "src/server.js"]

# ============================================
# Stage 3: Development stage (optional)
# ============================================
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies)
RUN npm ci && npm cache clean --force

# Copy all source code
COPY . .

# Expose port and start in development mode
EXPOSE 3000
CMD ["npm", "run", "dev"]
