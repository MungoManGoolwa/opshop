-- Initialize the Opshop Online database
-- This script runs when the PostgreSQL container starts for the first time

-- Ensure the database exists
SELECT 'CREATE DATABASE opshop'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'opshop');

-- Connect to the opshop database
\c opshop;

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE opshop TO opshop_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO opshop_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO opshop_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO opshop_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO opshop_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO opshop_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO opshop_user;

-- Create a simple health check function
CREATE OR REPLACE FUNCTION health_check()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Database is healthy at ' || NOW();
END;
$$ LANGUAGE plpgsql;