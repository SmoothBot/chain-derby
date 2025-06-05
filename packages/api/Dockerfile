FROM node:18.19.0-alpine3.19

WORKDIR /app

# Install curl and postgresql-client for healthcheck and database operations
RUN apk add --no-cache curl postgresql-client

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev deps for build and migrations)
RUN npm ci

# Copy source code
COPY . .

# Copy startup script and make it executable
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Build the application
RUN npm run build

# Expose port
EXPOSE 3001

# Add health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Use startup script
CMD ["/app/start.sh"]