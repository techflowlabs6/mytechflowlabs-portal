# ==============================================================================
# Stage 1: Build environment
# ==============================================================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies (cached if package files haven't changed)
COPY package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy source files and build production static bundle
COPY . .
RUN npm run build

# ==============================================================================
# Stage 2: Production Web Server (High-Performance Nginx Alpine)
# ==============================================================================
FROM nginx:alpine-slim AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
