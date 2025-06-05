#!/bin/sh
set -e

echo "Starting Chain Derby API..."

# Function to run migrations
run_migrations() {
  echo "Running database migrations..."
  # Keep dev dependencies for migration tools
  npm ci --include=dev > /dev/null 2>&1
  npm run migration:push
  # Clean up dev dependencies after migrations
  npm prune --production > /dev/null 2>&1
  echo "Migrations completed!"
}

# Only run migrations if DATABASE_URL is set (indicating we want DB operations)
if [ -n "$DATABASE_URL" ]; then
  run_migrations
else
  echo "No database configuration found, skipping migrations"
fi

echo "Starting server..."
exec npm start