#!/bin/sh
set -e

echo "🔄 Initializing database..."

# Check if database exists
if [ ! -f "/app/backend/data/local.db" ]; then
  echo "📦 Database not found. Creating new database..."
  cd /app/backend
  pnpm db:setup
  echo "✅ Database initialized successfully!"
else
  echo "✓ Database already exists."
fi

# Start the development server
echo "🚀 Starting development server..."
exec pnpm --filter backend dev:local
