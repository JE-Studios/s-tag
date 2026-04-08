const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "s-tag-dev-secret-change-in-production";
const TOKEN_TTL_DAYS = 30;

// CORS: default-liste dekker Vercel + lokal dev + Capacitor. Override via CORS_ORIGINS.
const DEFAULT_ORIGINS = [
  "https://s-tag-ten.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
  "capacitor://localhost",
  "http://localhost",
];
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((s) => s.trim())
  : DEFAULT_ORIGINS;
app.use(
  cors({
    origin: (origin, cb) => {
      // Ingen origin (mobil-app, curl, health checks) → tillat
      if (!origin) return cb(null, true);
      if (corsOrigins.includes("*") || corsOrigins.includes(origin)) return cb(null, true);
      // Tillat alle *.vercel.app preview-deploys
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));

// --- Auth helpers (pure Node crypto, ingen eksterne avhengigheter) ---
function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, s, 64).toString("hex");
  return `${s}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(test, "hex"));
}

function b64url(input) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signToken(payload) {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64url(
    JSON.stringify({ ...payload, iat: Date.now(), exp: Date.now() + TOKEN_TTL_DAYS * 86400000 })
  );
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return `${header}.${body}.${sig}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString());
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = verifyToken(token);
  if (!payload || !payload.userId) {
    return res.status(401).json({ error: "Ikke innlogget" });
  }
  req.userId = payload.userId;
  next();
}

function publicUser(u) {
  if (!u) return null;
  const { passwordHash, ...rest } = u;
  return rest;
}

// Async error-wrapper så vi slipper try/catch i hver route
const h = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// --- Health ---
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "S-TAG backend",
    store: db.USE_PG ? "postgres" : "json",
    time: new Date().toISOString(),
  });
});

// ============================================================================
// AUTH
// ============================================================================

app.post("/api/auth/register", h(async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ error: "E-post, navn og passord er påkrevd" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Passord må være minst 8 tegn" });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = await db.findUserByEmail(normalizedEmail);
  if (existing) return res.status(409).json({ error: "E-post er allerede registrert" });

  const user = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    name: String(name).trim(),
    passwordHash: hashPassword(password),
    plan: "free",
    createdAt: new Date().toISOString(),
  };
  const saved = await db.createUser(user);
  await db.createNotification({
    userId: saved.id,
    kind: "welcome",
    title: `Velkommen til S-TAG, ${saved.name.split(" ")[0]}!`,
    body: "Registrer din første gjenstand og aktiver chip-sporing fra Kartoteket.",
  }).catch(() => {});
  const token = signToken({ userId: saved.id });
  res.status(201).json({ token, user: publicUser(saved) });
}));

app.post("/api/auth/login", h(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: "E-post og passord er påkrevd" });
  const user = await db.findUserByEmail(String(email).trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: "Feil e-post eller passord" });
  }
  const token = signToken({ userId: user.id });
  res.json({ token, user: publicUser(user) });
}));

app.get("/api/auth/me", requireAuth, h(async (req, res) => {
  const user = await db.findUserById(req.userId);
  if (!user) return res.status(404).json({ error: "Bruker ikke funnet" });
  db.touchUserLastSeen(req.userId).catch(() => {});
  res.json({ user: publicUser(user) });
}));

// Oppdater profil (navn, adresse, forsikring, varsler, samtykker)
app.patch("/api/auth/me", requireAuth, h(async (req, res) => {
  const allowed = [
    "name", "phone", "address", "postalCode", "city", "avatarUrl",
    "insuranceCompany", "insurancePolicy",
    "notifyEmail", "notifyPush", "notifyMarketing",
    "consentPrivacy", "consentLocation", "consentVersion", "language",
  ];
  const patch = {};
  for (const k of allowed) if (req.body?.[k] !== undefined) patch[k] = req.body[k];
  if (patch.name !== undefined) patch.name = String(patch.name).trim();
  const updated = await db.updateUserProfile(req.userId, patch);
  if (!updated) return res.status(404).json({ error: "Bruker ikke funnet" });
  res.json({ user: publicUser(updated) });
}));

// Endre passord
app.post("/api/auth/password", requireAuth, h(async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if (!oldPassword || !newPassword) return res.status(400).json({ error: "Oppgi gammelt og nytt passord" });
  if (newPassword.length < 8) return res.status(400).json({ error: "Nytt passord må være minst 8 tegn" });
  const user = await db.findUserById(req.userId);
  if (!user) return res.status(404).json({ error: "Bruker ikke funnet" });
  if (!verifyPassword(oldPassword, user.passwordHash)) {
    return res.status(401).json({ error: "Feil gammelt passord" });
  }
  await db.updateUserPassword(req.userId, hashPassword(newPassword));
  res.json({ ok: true });
}));

// Slett konto (GDPR rett til sletting)
app.delete("/api/auth/me", requireAuth, h(async (req, res) => {
  await db.deleteUser(req.userId);
  res.json({ ok: true });
}));

// Eksporter alle data (GDPR dataportabilitet)
app.get("/api/auth/export", requireAuth, h(async (req, res) => {
  const user = await db.findUserById(req.userId);
  if (!user) return res.status(404).json({ error: "Bruker ikke funnet" });
  const items = await db.listItemsByOwner(req.userId);
  const transfers = await db.listTransfersForUser(req.userId, user.email);
  const notifications = await db.listNotifications(req.userId, 500);
  res.setHeader("Content-Disposition", `attachment; filename="s-tag-export-${user.id}.json"`);
  res.json({
    exportedAt: new Date().toISOString(),
    user: publicUser(user),
    items,
    transfers,
    notifications,
  });
}));

// ============================================================================
// GEOCODING (cached Nominatim proxy)
// ============================================================================

const geocodeCache = new Map();
app.get("/api/geocode", h(async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });
  const key = `${Number(lat).toFixed(4)},${Number(lng).toFixed(4)}`;
  if (geocodeCache.has(key)) return res.json(geocodeCache.get(key));
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=nb&zoom=18`;
    const r = await fetch(url, { headers: { "User-Agent": "S-TAG/1.0" } });
    const j = await r.json();
    const a = j.address || {};
    const street = [a.road, a.house_number].filter(Boolean).join(" ");
    const area = a.suburb || a.neighbourhood || a.city_district || a.city || a.town || a.village || "";
    const postcode = a.postcode || "";
    const display = [street, area].filter(Boolean).join(", ") || j.display_name || "Ukjent adresse";
    const result = { display, street, area, postcode, full: j.display_name };
    geocodeCache.set(key, result);
    res.json(result);
  } catch (err) {
    res.json({ display: "Adresse ikke tilgjengelig", error: err.message });
  }
}));

// ============================================================================
// ITEMS (user-scoped)
// ============================================================================

app.get("/api/items", requireAuth, h(async (req, res) => {
  const items = await db.listItemsByOwner(req.userId);
  res.json(items);
}));

app.get("/api/items/:id", requireAuth, h(async (req, res) => {
  const item = await db.getItem(req.params.id, req.userId);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json(item);
}));

app.post("/api/items", requireAuth, h(async (req, res) => {
  const body = req.body || {};
  if (!body.name || !String(body.name).trim()) {
    return res.status(400).json({ error: "Navn er påkrevd" });
  }
  const publicCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  const newItem = {
    id: crypto.randomUUID(),
    ownerId: req.userId,
    name: String(body.name).trim(),
    tagId: body.tagId || `ST-${Math.floor(Math.random() * 9000 + 1000)}-${Math.random().toString(36).slice(2, 4).toUpperCase()}`,
    status: "secured",
    category: body.category || "other",
    chipUid: null,
    chipPairedAt: null,
    chipLastPing: null,
    chipStatus: "unpaired",
    lat: body.lat ?? 59.9139,
    lng: body.lng ?? 10.7522,
    lastSeen: "Registrert nettopp",
    battery: null,
    createdAt: new Date().toISOString(),
    description: body.description || null,
    serialNumber: body.serialNumber || null,
    brand: body.brand || null,
    model: body.model || null,
    color: body.color || null,
    valueNok: body.valueNok ?? null,
    purchasedAt: body.purchasedAt || null,
    photoUrl: body.photoUrl || null,
    publicCode,
  };
  const saved = await db.createItem(newItem);
  await db.createItemEvent({ itemId: saved.id, userId: req.userId, kind: "created", detail: saved.name });
  res.status(201).json(saved);
}));

app.patch("/api/items/:id", requireAuth, h(async (req, res) => {
  const updated = await db.updateItem(req.params.id, req.userId, req.body || {});
  if (!updated) return res.status(404).json({ error: "Not found" });
  await db.createItemEvent({ itemId: updated.id, userId: req.userId, kind: "updated", detail: Object.keys(req.body || {}).join(", ") });
  res.json(updated);
}));

app.delete("/api/items/:id", requireAuth, h(async (req, res) => {
  const ok = await db.deleteItem(req.params.id, req.userId);
  if (!ok) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
}));

// Marker som mistet / funnet
app.post("/api/items/:id/lost", requireAuth, h(async (req, res) => {
  const { message } = req.body || {};
  const updated = await db.updateItem(req.params.id, req.userId, {
    status: "missing",
    lostMessage: message || null,
  });
  if (!updated) return res.status(404).json({ error: "Not found" });
  await db.createItemEvent({ itemId: updated.id, userId: req.userId, kind: "marked_lost", detail: message || null });
  await db.createNotification({
    userId: req.userId,
    kind: "item_lost",
    title: `${updated.name} er markert som mistet`,
    body: "Vi varsler deg hvis noen rapporterer funn via offentlig kode.",
    itemId: updated.id,
  });
  res.json(updated);
}));

app.post("/api/items/:id/found", requireAuth, h(async (req, res) => {
  const updated = await db.updateItem(req.params.id, req.userId, {
    status: "secured",
    lostMessage: null,
  });
  if (!updated) return res.status(404).json({ error: "Not found" });
  await db.createItemEvent({ itemId: updated.id, userId: req.userId, kind: "marked_found", detail: null });
  res.json(updated);
}));

app.get("/api/items/:id/events", requireAuth, h(async (req, res) => {
  const item = await db.getItem(req.params.id, req.userId);
  if (!item) return res.status(404).json({ error: "Not found" });
  const events = await db.listItemEvents(req.params.id, 100);
  res.json(events);
}));

// ============================================================================
// NOTIFICATIONS
// ============================================================================

app.get("/api/notifications", requireAuth, h(async (req, res) => {
  const list = await db.listNotifications(req.userId, 100);
  res.json(list);
}));

app.get("/api/notifications/unread-count", requireAuth, h(async (req, res) => {
  const count = await db.countUnreadNotifications(req.userId);
  res.json({ count });
}));

app.post("/api/notifications/read-all", requireAuth, h(async (req, res) => {
  await db.markAllNotificationsRead(req.userId);
  res.json({ ok: true });
}));

// ============================================================================
// STATS
// ============================================================================

app.get("/api/stats", requireAuth, h(async (req, res) => {
  const stats = await db.getUserStats(req.userId);
  res.json(stats);
}));

// ============================================================================
// PUBLIC FOUND FLOW (no auth — accessed via QR/offentlig kode)
// ============================================================================

app.get("/api/found/:code", h(async (req, res) => {
  const item = await db.findItemByPublicCode(req.params.code);
  if (!item) return res.status(404).json({ error: "Ukjent kode" });
  // Begrenset visning — ikke lekke eierens data
  res.json({
    id: item.id,
    name: item.name,
    category: item.category,
    brand: item.brand,
    color: item.color,
    status: item.status,
    lostMessage: item.lostMessage,
    photoUrl: item.photoUrl,
  });
}));

app.post("/api/found/:code/report", h(async (req, res) => {
  const item = await db.findItemByPublicCode(req.params.code);
  if (!item) return res.status(404).json({ error: "Ukjent kode" });
  const { finderName, finderContact, message, lat, lng } = req.body || {};
  await db.createFoundReport({
    itemId: item.id,
    finderName,
    finderContact,
    message,
    lat: typeof lat === "number" ? lat : null,
    lng: typeof lng === "number" ? lng : null,
  });
  await db.createNotification({
    userId: item.ownerId,
    kind: "found_report",
    title: `Noen har rapportert funn av ${item.name}`,
    body: message || "En finder har lagt igjen en melding.",
    itemId: item.id,
  });
  res.json({ ok: true });
}));

// ============================================================================
// CHIP (NFC/BLE) — klar for hardware-integrasjon
// ============================================================================

app.post("/api/chip/pair", requireAuth, h(async (req, res) => {
  const { itemId, chipUid } = req.body || {};
  if (!itemId || !chipUid) return res.status(400).json({ error: "itemId og chipUid er påkrevd" });
  const conflict = await db.findItemByChipUid(chipUid);
  if (conflict && conflict.id !== itemId) {
    return res.status(409).json({ error: "Denne chippen er allerede paret med en annen gjenstand" });
  }
  const updated = await db.pairChip(itemId, req.userId, chipUid);
  if (!updated) return res.status(404).json({ error: "Gjenstand ikke funnet" });
  res.json(updated);
}));

app.post("/api/chip/unpair", requireAuth, h(async (req, res) => {
  const { itemId } = req.body || {};
  const updated = await db.unpairChip(itemId, req.userId);
  if (!updated) return res.status(404).json({ error: "Gjenstand ikke funnet" });
  res.json(updated);
}));

// Chip ping — kalles av fysisk chip / gateway når hardware er klar.
// Sikres med HMAC(chipUid + timestamp + nonce) når firmware er ferdig.
app.post("/api/chip/ping", h(async (req, res) => {
  const { chipUid, lat, lng, battery } = req.body || {};
  if (!chipUid) return res.status(400).json({ error: "chipUid required" });
  const item = await db.findItemByChipUid(chipUid);
  if (!item) {
    await db.recordChipPing({ chipUid, lat, lng, battery, matched: false });
    return res.status(404).json({ error: "Ukjent chip" });
  }
  await db.updateItemFromPing(chipUid, { lat, lng, battery });
  await db.recordChipPing({ chipUid, lat, lng, battery, matched: true });
  res.json({ ok: true });
}));

// ============================================================================
// TRANSFERS (Eierskifte)
// ============================================================================

app.get("/api/transfers", requireAuth, h(async (req, res) => {
  const me = await db.findUserById(req.userId);
  const list = await db.listTransfersForUser(req.userId, me?.email);
  res.json(list);
}));

app.post("/api/transfers", requireAuth, h(async (req, res) => {
  const { itemId, toEmail, note } = req.body || {};
  const item = await db.getItem(itemId, req.userId);
  if (!item) return res.status(404).json({ error: "Gjenstand ikke funnet" });
  const transfer = {
    id: crypto.randomUUID(),
    itemId,
    itemName: item.name,
    fromUserId: req.userId,
    toEmail: String(toEmail || "").trim().toLowerCase(),
    note: note || "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const saved = await db.createTransfer(transfer);
  res.status(201).json(saved);
}));

app.post("/api/transfers/:id/accept", requireAuth, h(async (req, res) => {
  const transfer = await db.getTransfer(req.params.id);
  if (!transfer) return res.status(404).json({ error: "Ikke funnet" });
  const user = await db.findUserById(req.userId);
  if (!user || user.email !== transfer.toEmail) {
    return res.status(403).json({ error: "Ikke mottaker" });
  }
  const accepted = await db.acceptTransfer(req.params.id, req.userId);
  res.json(accepted);
}));

// ============================================================================
// Error handler
// ============================================================================

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

// --- Startup ---
(async () => {
  try {
    await db.initSchema();
  } catch (err) {
    console.error("Schema init failed:", err.message);
    if (db.USE_PG) process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`S-TAG backend running on http://localhost:${PORT} (store: ${db.USE_PG ? "postgres" : "json"})`);
  });
})();
