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
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_terms     BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_accepted_at TIMESTAMPTZ;
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

-- Geofence / "hjemme-sone". Hvis chipen pingen fra mer enn geofence_radius_m
-- unna (home_lat, home_lng) genereres et varsel til eier automatisk.
-- Dette gjør at sykler/ski som beveger seg uten eier trigger alarm.
ALTER TABLE items ADD COLUMN IF NOT EXISTS home_lat          DOUBLE PRECISION;
ALTER TABLE items ADD COLUMN IF NOT EXISTS home_lng          DOUBLE PRECISION;
ALTER TABLE items ADD COLUMN IF NOT EXISTS geofence_radius_m INTEGER;
ALTER TABLE items ADD COLUMN IF NOT EXISTS geofence_alerted  BOOLEAN NOT NULL DEFAULT FALSE;

-- Rik telemetri fra siste ping (hurtig-oppslag uten å joine chip_pings)
ALTER TABLE items ADD COLUMN IF NOT EXISTS accuracy_m     DOUBLE PRECISION;
ALTER TABLE items ADD COLUMN IF NOT EXISTS speed_mps      DOUBLE PRECISION;
ALTER TABLE items ADD COLUMN IF NOT EXISTS temperature_c  DOUBLE PRECISION;

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

-- Utvidelser for lovlig salgskontrakt (kjøpsloven for C2C)
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS sale_price_nok      INTEGER;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS condition_note      TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS seller_name         TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS buyer_name          TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS payment_method      TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS as_is               BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS seller_confirmed_at TIMESTAMPTZ;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS buyer_confirmed_at  TIMESTAMPTZ;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS contract_version    TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS contract_text       TEXT;

-- BankID-signaturer (Criipto Verify). Lagret som signert id_token (JWT).
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS seller_signature_jwt  TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS seller_signature_sub  TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS seller_signature_name TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS seller_signed_at      TIMESTAMPTZ;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS buyer_signature_jwt   TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS buyer_signature_sub   TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS buyer_signature_name  TEXT;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS buyer_signed_at       TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS chip_pings (
  id               BIGSERIAL PRIMARY KEY,
  chip_uid         TEXT,
  lat              DOUBLE PRECISION,
  lng              DOUBLE PRECISION,
  accuracy_m       DOUBLE PRECISION,   -- GPS-nøyaktighet i meter
  altitude_m       DOUBLE PRECISION,   -- Høyde over havet
  speed_mps        DOUBLE PRECISION,   -- Hastighet i m/s (fra GPS-modul)
  heading_deg      DOUBLE PRECISION,   -- Kompasskurs 0-360
  battery          INTEGER,            -- Batterinivå 0-100
  temperature_c    DOUBLE PRECISION,   -- Temperatur i celsius (miljøsensor)
  motion           BOOLEAN,            -- Var i bevegelse ved måling
  rssi             INTEGER,            -- Signalstyrke på radioforbindelse (dBm)
  firmware_version TEXT,               -- Rapportert firmware ved denne pingen
  source           TEXT,               -- 'gps' | 'cell' | 'wifi' | 'ble_relay' | 'manual'
  matched          BOOLEAN NOT NULL DEFAULT FALSE,  -- Om chip-UID finnes i registeret
  at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chip_pings_uid_idx ON chip_pings(chip_uid, at DESC);

-- Idempotente kolonne-tillegg for installasjoner som allerede har chip_pings-tabellen
ALTER TABLE chip_pings ADD COLUMN IF NOT EXISTS accuracy_m       DOUBLE PRECISION;
ALTER TABLE chip_pings ADD COLUMN IF NOT EXISTS altitude_m       DOUBLE PRECISION;
ALTER TABLE chip_pings ADD COLUMN IF NOT EXISTS speed_mps        DOUBLE PRECISION;
ALTER TABLE chip_pings ADD COLUMN IF NOT EXISTS heading_deg      DOUBLE PRECISION;
ALTER TABLE chip_pings ADD COLUMN IF NOT EXISTS temperature_c    DOUBLE PRECISION;
ALTER TABLE chip_pings ADD COLUMN IF NOT EXISTS motion           BOOLEAN;
ALTER TABLE chip_pings ADD COLUMN IF NOT EXISTS rssi             INTEGER;
ALTER TABLE chip_pings ADD COLUMN IF NOT EXISTS firmware_version TEXT;
ALTER TABLE chip_pings ADD COLUMN IF NOT EXISTS source           TEXT;

-- Register over alle fysisk produserte S-TAG-chiper (whitelist).
-- Fylles av admin via /api/admin/chips eller bulk-import (scripts/import-chips.js).
-- En chip må eksistere her FØR en bruker kan registrere en gjenstand med den.
-- Dette hindrer at noen gjetter eller finner på tilfeldige S-TAG-koder.
CREATE TABLE IF NOT EXISTS chips (
  uid              TEXT PRIMARY KEY,                         -- S-TAG-koden som er støpt inn i produktet
  manufacturer     TEXT,                                     -- Produsentens navn (f.eks. "Bergans", "Helly Hansen")
  batch            TEXT,                                     -- Produksjonsbatch/serie (f.eks. "2026-Q2-001")
  product_type     TEXT,                                     -- Type produkt chipen tilhører (f.eks. "jakke", "sykkel")
  hardware_rev     TEXT,                                     -- Hardware-revisjon (f.eks. "v1.0", "v1.1-B")
  firmware_version TEXT,                                     -- Siste kjente firmware-versjon (rapportert av chipen)
  hmac_secret      TEXT,                                     -- Per-chip HMAC-secret, brent inn ved produksjon. Brukes for signering av /api/chip/ping. NULL = bruk global CHIP_HMAC_SECRET fallback.
  status           TEXT NOT NULL DEFAULT 'available',        -- 'available' | 'claimed' | 'disabled'
  claimed_by       TEXT REFERENCES users(id) ON DELETE SET NULL,
  claimed_at       TIMESTAMPTZ,
  item_id          TEXT REFERENCES items(id) ON DELETE SET NULL,
  first_seen_at    TIMESTAMPTZ,                              -- Første gang chipen pingen hjem fra ekte hardware
  last_seen_at     TIMESTAMPTZ,                              -- Siste ping
  ping_count       BIGINT NOT NULL DEFAULT 0,                -- Teller for å oppdage døde chiper
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chips_status_idx       ON chips(status);
CREATE INDEX IF NOT EXISTS chips_manufacturer_idx ON chips(manufacturer);
CREATE INDEX IF NOT EXISTS chips_batch_idx        ON chips(batch);
CREATE INDEX IF NOT EXISTS chips_last_seen_idx    ON chips(last_seen_at DESC);

-- Idempotente kolonne-tillegg for installasjoner som allerede har chips-tabellen
ALTER TABLE chips ADD COLUMN IF NOT EXISTS hardware_rev     TEXT;
ALTER TABLE chips ADD COLUMN IF NOT EXISTS firmware_version TEXT;
ALTER TABLE chips ADD COLUMN IF NOT EXISTS hmac_secret      TEXT;
ALTER TABLE chips ADD COLUMN IF NOT EXISTS first_seen_at    TIMESTAMPTZ;
ALTER TABLE chips ADD COLUMN IF NOT EXISTS last_seen_at     TIMESTAMPTZ;
ALTER TABLE chips ADD COLUMN IF NOT EXISTS ping_count       BIGINT NOT NULL DEFAULT 0;

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

-- Tilbakemeldinger fra brukere (bugs, ønsker, spørsmål)
CREATE TABLE IF NOT EXISTS feedback (
  id         BIGSERIAL PRIMARY KEY,
  user_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
  name       TEXT,
  email      TEXT,
  kind       TEXT NOT NULL DEFAULT 'other', -- 'bug' | 'feature' | 'question' | 'other'
  subject    TEXT,
  message    TEXT NOT NULL,
  user_agent TEXT,
  path       TEXT,
  status     TEXT NOT NULL DEFAULT 'new', -- 'new' | 'read' | 'resolved'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS feedback_created_idx ON feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS found_reports_item_idx ON found_reports(item_id, created_at DESC);
