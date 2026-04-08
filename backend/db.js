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
    phone: row.phone ?? null,
    address: row.address ?? null,
    postalCode: row.postal_code ?? null,
    city: row.city ?? null,
    avatarUrl: row.avatar_url ?? null,
    insuranceCompany: row.insurance_company ?? null,
    insurancePolicy: row.insurance_policy ?? null,
    notifyEmail: row.notify_email ?? true,
    notifyPush: row.notify_push ?? true,
    notifyMarketing: row.notify_marketing ?? false,
    consentPrivacy: row.consent_privacy ?? false,
    consentLocation: row.consent_location ?? false,
    consentVersion: row.consent_version ?? null,
    language: row.language ?? "nb",
    lastSeenAt: row.last_seen_at ?? null,
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
    description: row.description ?? null,
    serialNumber: row.serial_number ?? null,
    brand: row.brand ?? null,
    model: row.model ?? null,
    color: row.color ?? null,
    valueNok: row.value_nok ?? null,
    purchasedAt: row.purchased_at ?? null,
    photoUrl: row.photo_url ?? null,
    publicCode: row.public_code ?? null,
    lostMessage: row.lost_message ?? null,
  };
}

function mapNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    title: row.title,
    body: row.body,
    itemId: row.item_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

function mapEvent(row) {
  if (!row) return null;
  return {
    id: row.id,
    itemId: row.item_id,
    userId: row.user_id,
    kind: row.kind,
    detail: row.detail,
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
        chip_last_ping, chip_status, lat, lng, last_seen, battery,
        description, serial_number, brand, model, color, value_nok, purchased_at,
        photo_url, public_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,
               $15,$16,$17,$18,$19,$20,$21,$22,$23)
       RETURNING *`,
      [
        item.id, item.ownerId, item.name, item.tagId, item.status || "secured",
        item.category || "other", item.chipUid, item.chipPairedAt,
        item.chipLastPing, item.chipStatus || "unpaired",
        item.lat ?? 59.9139, item.lng ?? 10.7522,
        item.lastSeen || "Registrert nettopp", item.battery ?? null,
        item.description ?? null, item.serialNumber ?? null,
        item.brand ?? null, item.model ?? null, item.color ?? null,
        item.valueNok ?? null, item.purchasedAt ?? null,
        item.photoUrl ?? null, item.publicCode ?? null,
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
      description: "description", serial_number: "serialNumber",
      brand: "brand", model: "model", color: "color",
      value_nok: "valueNok", purchased_at: "purchasedAt",
      photo_url: "photoUrl", public_code: "publicCode", lost_message: "lostMessage",
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

// ----- USER PROFILE EXTENSIONS -----
async function updateUserProfile(userId, patch) {
  if (USE_PG) {
    const fields = {
      name: "name",
      phone: "phone",
      address: "address",
      postal_code: "postalCode",
      city: "city",
      avatar_url: "avatarUrl",
      insurance_company: "insuranceCompany",
      insurance_policy: "insurancePolicy",
      notify_email: "notifyEmail",
      notify_push: "notifyPush",
      notify_marketing: "notifyMarketing",
      consent_privacy: "consentPrivacy",
      consent_location: "consentLocation",
      consent_version: "consentVersion",
      language: "language",
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
    if (sets.length === 0) return findUserById(userId);
    vals.push(userId);
    const r = await pool.query(
      `UPDATE users SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
      vals
    );
    return mapUser(r.rows[0]);
  }
  const d = jsonLoad();
  const idx = d.users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;
  d.users[idx] = { ...d.users[idx], ...patch, id: userId };
  jsonSave(d);
  return d.users[idx];
}

async function updateUserPassword(userId, passwordHash) {
  if (USE_PG) {
    await pool.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [passwordHash, userId]);
    return true;
  }
  const d = jsonLoad();
  const idx = d.users.findIndex((u) => u.id === userId);
  if (idx === -1) return false;
  d.users[idx].passwordHash = passwordHash;
  jsonSave(d);
  return true;
}

async function touchUserLastSeen(userId) {
  if (USE_PG) {
    await pool.query(`UPDATE users SET last_seen_at = NOW() WHERE id = $1`, [userId]).catch(() => {});
    return;
  }
}

async function deleteUser(userId) {
  if (USE_PG) {
    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    return true;
  }
  const d = jsonLoad();
  d.users = d.users.filter((u) => u.id !== userId);
  d.items = d.items.filter((i) => i.ownerId !== userId);
  d.transfers = d.transfers.filter((t) => t.fromUserId !== userId);
  jsonSave(d);
  return true;
}

// ----- NOTIFICATIONS -----
async function createNotification({ userId, kind, title, body, itemId }) {
  if (USE_PG) {
    const r = await pool.query(
      `INSERT INTO notifications (user_id, kind, title, body, item_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, kind, title, body || null, itemId || null]
    );
    return mapNotification(r.rows[0]);
  }
  const d = jsonLoad();
  d.notifications ||= [];
  const n = { id: Date.now(), userId, kind, title, body, itemId, readAt: null, createdAt: new Date().toISOString() };
  d.notifications.push(n);
  jsonSave(d);
  return n;
}

async function listNotifications(userId, limit = 50) {
  if (USE_PG) {
    const r = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [userId, limit]
    );
    return r.rows.map(mapNotification);
  }
  const d = jsonLoad();
  d.notifications ||= [];
  return d.notifications.filter((n) => n.userId === userId).slice(-limit).reverse();
}

async function markNotificationRead(notifId, userId) {
  if (USE_PG) {
    await pool.query(
      `UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2`,
      [notifId, userId]
    );
    return true;
  }
  return true;
}

async function markAllNotificationsRead(userId) {
  if (USE_PG) {
    await pool.query(
      `UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );
    return true;
  }
  return true;
}

async function countUnreadNotifications(userId) {
  if (USE_PG) {
    const r = await pool.query(
      `SELECT COUNT(*)::int AS c FROM notifications WHERE user_id = $1 AND read_at IS NULL`,
      [userId]
    );
    return r.rows[0].c;
  }
  return 0;
}

// ----- ITEM EVENTS -----
async function createItemEvent({ itemId, userId, kind, detail }) {
  if (USE_PG) {
    await pool.query(
      `INSERT INTO item_events (item_id, user_id, kind, detail) VALUES ($1,$2,$3,$4)`,
      [itemId, userId || null, kind, detail || null]
    );
    return true;
  }
  return true;
}

async function listItemEvents(itemId, limit = 50) {
  if (USE_PG) {
    const r = await pool.query(
      `SELECT * FROM item_events WHERE item_id = $1 ORDER BY created_at DESC LIMIT $2`,
      [itemId, limit]
    );
    return r.rows.map(mapEvent);
  }
  return [];
}

// ----- STATS -----
async function getUserStats(userId) {
  if (USE_PG) {
    const r = await pool.query(
      `SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE status = 'secured')::int AS secured,
        COUNT(*) FILTER (WHERE status = 'missing')::int AS missing,
        COUNT(*) FILTER (WHERE chip_status = 'active')::int AS chip_active,
        COUNT(*) FILTER (WHERE chip_status = 'unpaired')::int AS chip_unpaired,
        COALESCE(SUM(value_nok), 0)::bigint AS total_value
      FROM items WHERE owner_id = $1`,
      [userId]
    );
    const row = r.rows[0];
    return {
      total: row.total,
      secured: row.secured,
      missing: row.missing,
      chipActive: row.chip_active,
      chipUnpaired: row.chip_unpaired,
      totalValueNok: Number(row.total_value),
    };
  }
  const d = jsonLoad();
  const mine = d.items.filter((i) => i.ownerId === userId);
  return {
    total: mine.length,
    secured: mine.filter((i) => i.status === "secured").length,
    missing: mine.filter((i) => i.status === "missing").length,
    chipActive: mine.filter((i) => i.chipStatus === "active").length,
    chipUnpaired: mine.filter((i) => i.chipStatus === "unpaired").length,
    totalValueNok: mine.reduce((s, i) => s + (i.valueNok || 0), 0),
  };
}

// ----- PUBLIC FOUND FLOW -----
async function findItemByPublicCode(code) {
  if (USE_PG) {
    const r = await pool.query(`SELECT * FROM items WHERE public_code = $1`, [code]);
    return mapItem(r.rows[0]);
  }
  const d = jsonLoad();
  return d.items.find((i) => i.publicCode === code) || null;
}

async function createFoundReport({ itemId, finderName, finderContact, message, lat, lng }) {
  if (USE_PG) {
    await pool.query(
      `INSERT INTO found_reports (item_id, finder_name, finder_contact, message, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [itemId, finderName || null, finderContact || null, message || null, lat ?? null, lng ?? null]
    );
    return true;
  }
  return true;
}

module.exports = {
  USE_PG,
  initSchema,
  createUser, findUserByEmail, findUserById, updateUserProfile, updateUserPassword, deleteUser, touchUserLastSeen,
  listItemsByOwner, getItem, createItem, updateItem, deleteItem,
  findItemByChipUid, pairChip, unpairChip, recordChipPing, updateItemFromPing,
  listTransfersForUser, createTransfer, getTransfer, acceptTransfer,
  createNotification, listNotifications, markNotificationRead, markAllNotificationsRead, countUnreadNotifications,
  createItemEvent, listItemEvents,
  getUserStats,
  findItemByPublicCode, createFoundReport,
};
