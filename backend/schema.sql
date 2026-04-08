-- S-TAG Postgres schema
-- Kjøres automatisk ved oppstart av server.js hvis DATABASE_URL er satt.
-- Idempotent: alle CREATE/ALTER bruker IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'free',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profil-utvidelser (kjøres idempotent — ADD COLUMN IF NOT EXISTS krever Postgres 9.6+)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone             TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address           TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS postal_code       TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city              TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url        TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_company TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_policy  TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_email      BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_push       BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notify_marketing  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_privacy   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_location  BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_version   TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS language          TEXT NOT NULL DEFAULT 'nb';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at      TIMESTAMPTZ;

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

-- Item-utvidelser (bedre registrering)
ALTER TABLE items ADD COLUMN IF NOT EXISTS description    TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS serial_number  TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS brand          TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS model          TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS color          TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS value_nok      INTEGER;
ALTER TABLE items ADD COLUMN IF NOT EXISTS purchased_at   DATE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS photo_url      TEXT;
ALTER TABLE items ADD COLUMN IF NOT EXISTS public_code    TEXT UNIQUE;
ALTER TABLE items ADD COLUMN IF NOT EXISTS lost_message   TEXT;

CREATE INDEX IF NOT EXISTS items_owner_idx ON items(owner_id);
CREATE INDEX IF NOT EXISTS items_chip_uid_idx ON items(chip_uid);
CREATE INDEX IF NOT EXISTS items_public_code_idx ON items(public_code);

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

-- Notifikasjoner (in-app)
CREATE TABLE IF NOT EXISTS notifications (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       TEXT NOT NULL,           -- 'item_lost' | 'transfer_received' | 'chip_offline' | 'welcome' | 'found_report'
  title      TEXT NOT NULL,
  body       TEXT,
  item_id    TEXT REFERENCES items(id) ON DELETE SET NULL,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, created_at DESC);

-- Aktivitetslogg pr. item
CREATE TABLE IF NOT EXISTS item_events (
  id         BIGSERIAL PRIMARY KEY,
  item_id    TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  user_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  kind       TEXT NOT NULL,           -- 'created' | 'updated' | 'chip_paired' | 'chip_unpaired' | 'marked_lost' | 'marked_found' | 'transferred'
  detail     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS item_events_item_idx ON item_events(item_id, created_at DESC);

-- Funnet-rapporter fra publikum (ikke-auth)
CREATE TABLE IF NOT EXISTS found_reports (
  id            BIGSERIAL PRIMARY KEY,
  item_id       TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  finder_name   TEXT,
  finder_contact TEXT,
  message       TEXT,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS found_reports_item_idx ON found_reports(item_id, created_at DESC);
