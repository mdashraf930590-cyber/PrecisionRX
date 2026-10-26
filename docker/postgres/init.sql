-- PrecisionRx AI PostgreSQL Initialization Script
-- Initializes main database and creates MLflow metadata database

-- Ensure required extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create MLflow tracking database if it doesn't already exist
SELECT 'CREATE DATABASE mlflow_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'mlflow_db')\gexec

-- Grant privileges to default application user
GRANT ALL PRIVILEGES ON DATABASE precisionrx TO precisionrx;
GRANT ALL PRIVILEGES ON DATABASE mlflow_db TO precisionrx;
