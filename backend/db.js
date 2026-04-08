/**
 * S-TAG datastore
 *
 * Bruker Postgres (via DATABASE_URL) i produksjon, JSON-fil lokalt.
 * Eksponerer ett async API så server.js slipper å bry seg om backend.
 *
 * Alle async funksjoner returnerer samme struktur som det gamle JSON-laget.
 * Snake_case i DB → camelCase i API (mapItem / mapUser / mapTransfer).
 */
const fs = require("fs");
const path = require("path");

const DATABASE_URL = process.env.DATABASE_URL;
const USE_PG = !!DATABASE_URL;

// ============================================================================
// Postgres implementation
// ============================================================================
let pool;
if (USE_PG) {
  const { Pool } = require("pg");
  pool = new Pool({
    connectionString: DATABASE_URL,
    // Railway/Supabase krever SSL i prod. Lokal Postgres har det ikke.
    ssl: DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
  });
  pool.on("error", (err) => console.error("pg pool error:", err));
}

async function initSchema() {
  if (!USE_PG) return;
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
  await pool.query(schema);
  console.log("✓ Postgres schema ready");
}

// --- Row mappers (snake_case → camelCase) ---
function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    plan: row.plan,
    createdAt: row.created_at,
  };
}

function mapItem(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    tagId: row.tag_id,
    status: row.status,
    category: row.category,
    chipUid: row.chip_uid,
    chipPairedAt: row.chip_paired_at,
    chipLastPing: row.chip_last_ping,
    chipStatus: row.chip_status,
    lat: row.lat,
    lng: row.lng,
    lastSeen: row.last_seen,
    battery: row.battery,
    createdAt: row.created_at,
  };
}

function mapTransfer(row) {
  if (!row) return null;
  return {
    id: row.id,
    itemId: row.item_id,
    itemName: row.item_name,
    fromUserId: row.from_user_id,
    toEmail: row.to_email,
    note: row.note,
    status: row.status,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
  };
}

// ============================================================================
// JSON-fallback (kun lokal dev hvis DATABASE_URL ikke er satt)
// ============================================================================
const DATA_FILE = path.join(__dirname, "data.json");
function jsonLoad() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ users: [], items: [], transfers: [], chipPings: [] }, null, 2)
    );
  }
  const d = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  d.users ||= [];
  d.items ||= [];
  d.transfers ||= [];
  d.chipPings ||= [];
  return d;
}
function jsonSave(d) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}

// ============================================================================
// Public API
// ============================================================================

// ----- USERS -----
async function createUser(user) {
  if (USE_PG) {
    const r = await pool.query(
      `INSERT INTO users (id, email, name, password_hash, plan)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user.id, user.email, user.name, user.passwordHash, user.plan || "free"]
    );
    return mapUser(r.rows[0]);
  }
  const d = jsonLoad();
  d.users.push(user);
  jsonSave(d);
  return user;
}

async function findUserByEmail(email) {
  if (USE_PG) {
    const r = await pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
    return mapUser(r.rows[0]);
  }
  const d = jsonLoad();
  return d.users.find((u) => u.email === email) || null;
}

async function findUserById(id) {
  if (USE_PG) {
    const r = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
    return mapUser(r.rows[0]);
  }
  const d = jsonLoad();
  return d.users.find((u) => u.id === id) || null;
}

// ----- ITEMS -----
async function listItemsByOwner(ownerId) {
  if (USE_PG) {
    const r = await pool.query(
      `SELECT * FROM items WHERE owner_id = $1 ORDER BY created_at DESC`,
      [ownerId]
    );
    return r.rows.map(mapItem);
  }
  const d = jsonLoad();
  return d.items.filter((i) => i.ownerId === ownerId);
}

async function getItem(id, ownerId) {
  if (USE_PG) {
    const r = await pool.query(
      `SELECT * FROM items WHERE id = $1 AND owner_id = $2`,
      [id, ownerId]
    );
    return mapItem(r.rows[0]);
  }
  const d = jsonLoad();
  return d.items.find((i) => i.id === id && i.ownerId === ownerId) || null;
}

async function createItem(item) {
  if (USE_PG) {
    const r = await pool.query(
      `INSERT INTO items
       (id, owner_id, name, tag_id, status, category, chip_uid, chip_paired_at,
        chip_last_ping, chip_status, lat, lng, last_seen, battery)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        item.id, item.ownerId, item.name, item.tagId, item.status || "secured",
        item.category || "other", item.chipUid, item.chipPairedAt,
        item.chipLastPing, item.chipStatus || "unpaired",
        item.lat ?? 59.9139, item.lng ?? 10.7522,
        item.lastSeen || "Registrert nettopp", item.battery ?? null,
      ]
    );
    return mapItem(r.rows[0]);
  }
  const d = jsonLoad();
  d.items.push(item);
  jsonSave(d);
  return item;
}

async function updateItem(id, ownerId, patch) {
  if (USE_PG) {
    // Whitelist felter som kan endres
    const fields = {
      name: "name", tag_id: "tagId", status: "status", category: "category",
      chip_uid: "chipUid", chip_paired_at: "chipPairedAt",
      chip_last_ping: "chipLastPing", chip_status: "chipStatus",
      lat: "lat", lng: "lng", last_seen: "lastSeen", battery: "battery",
    };
    const sets = [];
    const vals = [];
    let i = 1;
    for (const [col, jsKey] of Object.entries(fields)) {
      if (patch[jsKey] !== undefined) {
        sets.push(`${col} = $${i++}`);
        vals.push(patch[jsKey]);
      }
    }
    if (sets.length === 0) return getItem(id, ownerId);
    vals.push(id, ownerId);
    const r = await pool.query(
      `UPDATE items SET ${sets.join(", ")} WHERE id = $${i++} AND owner_id = $${i} RETURNING *`,
      vals
    );
    return mapItem(r.rows[0]);
  }
  const d = jsonLoad();
  const idx = d.items.findIndex((i) => i.id === id && i.ownerId === ownerId);
  if (idx === -1) return null;
  d.items[idx] = { ...d.items[idx], ...patch, id, ownerId };
  jsonSave(d);
  return d.items[idx];
}

async function deleteItem(id, ownerId) {
  if (USE_PG) {
    const r = await pool.query(
      `DELETE FROM items WHERE id = $1 AND owner_id = $2 RETURNING id`,
      [id, ownerId]
    );
    return r.rowCount > 0;
  }
  const d = jsonLoad();
  const before = d.items.length;
  d.items = d.items.filter((i) => !(i.id === id && i.ownerId === ownerId));
  jsonSave(d);
  return d.items.length < before;
}

// ----- CHIP -----
async function findItemByChipUid(chipUid) {
  if (USE_PG) {
    const r = await pool.query(`SELECT * FROM items WHERE chip_uid = $1`, [chipUid]);
    return mapItem(r.rows[0]);
  }
  const d = jsonLoad();
  return d.items.find((i) => i.chipUid === chipUid) || null;
}

async function pairChip(itemId, ownerId, chipUid) {
  return updateItem(itemId, ownerId, {
    chipUid,
    chipPairedAt: new Date().toISOString(),
    chipStatus: "paired",
  });
}

async function unpairChip(itemId, ownerId) {
  return updateItem(itemId, ownerId, {
    chipUid: null,
    chipPairedAt: null,
    chipLastPing: null,
    chipStatus: "unpaired",
  });
}

async function recordChipPing({ chipUid, lat, lng, battery, matched }) {
  if (USE_PG) {
    await pool.query(
      `INSERT INTO chip_pings (chip_uid, lat, lng, battery, matched)
       VALUES ($1,$2,$3,$4,$5)`,
      [chipUid, lat ?? null, lng ?? null, battery ?? null, !!matched]
    );
    return;
  }
  const d = jsonLoad();
  d.chipPings.push({ chipUid, lat, lng, battery, at: new Date().toISOString(), matched: !!matched });
  jsonSave(d);
}

async function updateItemFromPing(chipUid, { lat, lng, battery }) {
  if (USE_PG) {
    const r = await pool.query(
      `UPDATE items SET
         lat = COALESCE($1, lat),
         lng = COALESCE($2, lng),
         battery = COALESCE($3, battery),
         chip_last_ping = NOW(),
         chip_status = 'active',
         last_seen = 'Live · akkurat nå'
       WHERE chip_uid = $4
       RETURNING *`,
      [typeof lat === "number" ? lat : null, typeof lng === "number" ? lng : null,
       typeof battery === "number" ? battery : null, chipUid]
    );
    return mapItem(r.rows[0]);
  }
  const d = jsonLoad();
  const idx = d.items.findIndex((i) => i.chipUid === chipUid);
  if (idx === -1) return null;
  if (typeof lat === "number") d.items[idx].lat = lat;
  if (typeof lng === "number") d.items[idx].lng = lng;
  if (typeof battery === "number") d.items[idx].battery = battery;
  d.items[idx].chipLastPing = new Date().toISOString();
  d.items[idx].chipStatus = "active";
  d.items[idx].lastSeen = "Live · akkurat nå";
  jsonSave(d);
  return d.items[idx];
}

// ----- TRANSFERS -----
async function listTransfersForUser(userId, email) {
  if (USE_PG) {
    const r = await pool.query(
      `SELECT * FROM transfers WHERE from_user_id = $1 OR to_email = $2 ORDER BY created_at DESC`,
      [userId, email || ""]
    );
    return r.rows.map(mapTransfer);
  }
  const d = jsonLoad();
  return d.transfers.filter((t) => t.fromUserId === userId || t.toEmail === email);
}

async function createTransfer(t) {
  if (USE_PG) {
    const r = await pool.query(
      `INSERT INTO transfers (id, item_id, item_name, from_user_id, to_email, note, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [t.id, t.itemId, t.itemName, t.fromUserId, t.toEmail, t.note || "", "pending"]
    );
    return mapTransfer(r.rows[0]);
  }
  const d = jsonLoad();
  d.transfers.push(t);
  jsonSave(d);
  return t;
}

async function getTransfer(id) {
  if (USE_PG) {
    const r = await pool.query(`SELECT * FROM transfers WHERE id = $1`, [id]);
    return mapTransfer(r.rows[0]);
  }
  const d = jsonLoad();
  return d.transfers.find((t) => t.id === id) || null;
}

async function acceptTransfer(transferId, newOwnerId) {
  if (USE_PG) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const t = await client.query(
        `UPDATE transfers SET status='accepted', accepted_at=NOW() WHERE id=$1 RETURNING *`,
        [transferId]
      );
      if (t.rows[0]) {
        await client.query(`UPDATE items SET owner_id=$1 WHERE id=$2`, [newOwnerId, t.rows[0].item_id]);
      }
      await client.query("COMMIT");
      return mapTransfer(t.rows[0]);
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  }
  const d = jsonLoad();
  const t = d.transfers.find((x) => x.id === transferId);
  if (!t) return null;
  t.status = "accepted";
  t.acceptedAt = new Date().toISOString();
  const itemIdx = d.items.findIndex((i) => i.id === t.itemId);
  if (itemIdx !== -1) d.items[itemIdx].ownerId = newOwnerId;
  jsonSave(d);
  return t;
}

module.exports = {
  USE_PG,
  initSchema,
  createUser, findUserByEmail, findUserById,
  listItemsByOwner, getItem, createItem, updateItem, deleteItem,
  findItemByChipUid, pairChip, unpairChip, recordChipPing, updateItemFromPing,
  listTransfersForUser, createTransfer, getTransfer, acceptTransfer,
};
