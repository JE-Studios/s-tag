-- S-TAG Postgres schema
-- Kjøres automatisk ved oppstart av server.js hvis DATABASE_URL er satt.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS items (
  id             TEXT PRIMARY KEY,
  owner_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  tag_id         TEXT,
  status         TEXT NOT NULL DEFAULT 'secured',
  category       TEXT NOT NULL DEFAULT 'other',
  chip_uid       TEXT UNIQUE,
  chip_paired_at TIMESTAMPTZ,
  chip_last_ping TIMESTAMPTZ,
  chip_status    TEXT NOT NULL DEFAULT 'unpaired',
  lat            DOUBLE PRECISION NOT NULL DEFAULT 59.9139,
  lng            DOUBLE PRECISION NOT NULL DEFAULT 10.7522,
  last_seen      TEXT,
  battery        INTEGER,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS items_owner_idx ON items(owner_id);
CREATE INDEX IF NOT EXISTS items_chip_uid_idx ON items(chip_uid);

CREATE TABLE IF NOT EXISTS transfers (
  id           TEXT PRIMARY KEY,
  item_id      TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  item_name    TEXT,
  from_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  to_email     TEXT NOT NULL,
  note         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  accepted_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS transfers_from_idx ON transfers(from_user_id);
CREATE INDEX IF NOT EXISTS transfers_to_idx ON transfers(to_email);

CREATE TABLE IF NOT EXISTS chip_pings (
  id        BIGSERIAL PRIMARY KEY,
  chip_uid  TEXT,
  lat       DOUBLE PRECISION,
  lng       DOUBLE PRECISION,
  battery   INTEGER,
  matched   BOOLEAN NOT NULL DEFAULT FALSE,
  at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chip_pings_uid_idx ON chip_pings(chip_uid);
