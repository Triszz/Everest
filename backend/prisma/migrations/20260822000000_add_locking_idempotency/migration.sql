-- Migration: Add optimistic locking and idempotency support
-- Run this SQL directly on your database (Supabase dashboard SQL editor)

-- 1. Add version column to orders table for optimistic locking
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1;

-- 2. Create idempotency_keys table
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key_id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL UNIQUE,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_key ON idempotency_keys(key);
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires_at ON idempotency_keys(expires_at);

-- 4. Grant permissions (if needed for Supabase)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON idempotency_keys TO postgres;
-- GRANT USAGE, SELECT ON SEQUENCE idempotency_keys_key_id_seq TO postgres;

COMMENT ON TABLE idempotency_keys IS 'Stores idempotency keys to prevent duplicate operations';
COMMENT ON COLUMN orders.version IS 'Optimistic locking version counter';
