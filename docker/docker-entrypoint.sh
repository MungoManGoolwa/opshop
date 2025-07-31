#!/bin/sh
set -e

echo "Starting Opshop Online marketplace..."

# Wait for database to be ready
if [ -n "$DATABASE_URL" ]; then
  echo "Waiting for database to be ready..."
  
  # Extract host and port from DATABASE_URL
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]\+\)\/.*/\1/p')
  
  if [ -n "$DB_HOST" ] && [ -n "$DB_PORT" ]; then
    until nc -z "$DB_HOST" "$DB_PORT"; do
      echo "Database is unavailable - sleeping"
      sleep 2
    done
    echo "Database is ready!"
  fi
fi

# Run database migrations if needed
if [ "$NODE_ENV" = "production" ]; then
  echo "Running database migrations..."
  npm run db:push || echo "Migrations completed or not needed"
fi

# Start the application
echo "Starting application on port ${PORT:-5000}..."
exec "$@"