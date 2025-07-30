#!/bin/bash
set -e

# Docker entrypoint script for Opshop Online
echo "🚀 Starting Opshop Online..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
until node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
pool.query('SELECT 1')
  .then(() => {
    console.log('✅ Database connected');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ Database not ready:', err.message);
    process.exit(1);
  });
" 2>/dev/null; do
  echo "Database not ready, waiting 2 seconds..."
  sleep 2
done

# Run database migrations if needed
echo "🔧 Running database setup..."
if [ "$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  npm run db:push || echo "Migrations completed or already up to date"
fi

# Create uploads directory with proper permissions
mkdir -p uploads/products uploads/verification uploads/avatars
chmod 755 uploads uploads/products uploads/verification uploads/avatars

echo "✅ Setup complete, starting application..."

# Start the application
exec "$@"