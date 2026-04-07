CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS shops (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(100) NOT NULL,
  slug             VARCHAR(50) UNIQUE NOT NULL,
  is_open          BOOLEAN DEFAULT false,
  avg_wait_minutes INT DEFAULT 5,
  created_at       TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id       UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  email         VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) DEFAULT 'staff' CHECK (role IN ('staff', 'admin')),
  created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS queue_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id       UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  customer_name VARCHAR(100) NOT NULL,
  party_size    INT DEFAULT 1 CHECK (party_size > 0),
  status        VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'served', 'cancelled')),
  position      INT NOT NULL,
  joined_at     TIMESTAMP DEFAULT NOW(),
  called_at     TIMESTAMP,
  served_at     TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_queue_entries_shop_id 
  ON queue_entries(shop_id);

CREATE INDEX IF NOT EXISTS idx_queue_entries_status 
  ON queue_entries(shop_id, status);

CREATE INDEX IF NOT EXISTS idx_users_shop_id 
  ON users(shop_id);