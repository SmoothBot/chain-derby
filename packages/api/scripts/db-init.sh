#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=postgres psql -h localhost -U postgres -d postgres -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - executing database setup"

# Create database if it doesn't exist
PGPASSWORD=postgres psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'chain_derby'" | grep -q 1 || \
  PGPASSWORD=postgres psql -h localhost -U postgres -c "CREATE DATABASE chain_derby"

echo "Database 'chain_derby' is ready"

# Generate migrations if they don't exist
echo "Generating migrations..."
cd "$(dirname "$0")/.."
npm run migration:generate

# Apply migrations
echo "Applying migrations..."
npm run migration:push

echo "Database initialization completed"