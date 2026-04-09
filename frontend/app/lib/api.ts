// S-TAG API client with token injection
export const API_BASE: string =
  typeof window !== "undefined" && (window as unknown as { __STAG_API__?: string }).__STAG_API__
    ? ((window as unknown as { __STAG_API__: string }).__STAG_API__)
    : process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === "production" ? "https://s-tag-production.up.railway.app" : "http://localhost:4000");

const TOKEN_KEY = "stag_token";
const CONSENT_VERSION = "2026-04";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((opts.headers as Record<string, string>) || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error(body?.error || `HTTP ${res.status}`);
  }
  return body as T;
}

// ---- Types ----
export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  plan: string;
  phone?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
  insuranceCompany?: string | null;
  insurancePolicy?: string | null;
  notifyEmail?: boolean;
  notifyPush?: boolean;
  notifyMarketing?: boolean;
  consentPrivacy?: boolean;
  consentLocation?: boolean;
  consentVersion?: string | null;
  consentTerms?: boolean;
  consentAcceptedAt?: string | null;
  language?: string;
  lastSeenAt?: string | null;
};

export type Item = {
  id: string;
  ownerId: string;
  name: string;
  tagId: string;
  status: "secured" | "missing" | "inactive";
  category?: string;
  chipUid: string | null;
  chipPairedAt: string | null;
  chipLastPing: string | null;
  chipStatus: "unpaired" | "paired" | "active" | "lost";
  lat: number;
  lng: number;
  lastSeen: string;
  battery?: number;
  createdAt?: string;
  description?: string | null;
  serialNumber?: string | null;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  valueNok?: number | null;
  purchasedAt?: string | null;
  photoUrl?: string | null;
  publicCode?: string | null;
  lostMessage?: string | null;
};

export type Transfer = {
  id: string;
  itemId: string;
  itemName: string;
  fromUserId: string;
  toEmail: string;
  note: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
  acceptedAt?: string;
  salePriceNok?: number | null;
  conditionNote?: string | null;
  sellerName?: string | null;
  buyerName?: string | null;
  paymentMethod?: string | null;
  asIs?: boolean;
  sellerConfirmedAt?: string | null;
  buyerConfirmedAt?: string | null;
  contractVersion?: string | null;
  sellerSignatureJwt?: string | null;
  sellerSignatureSub?: string | null;
  sellerSignatureName?: string | null;
  sellerSignedAt?: string | null;
  buyerSignatureJwt?: string | null;
  buyerSignatureSub?: string | null;
  buyerSignatureName?: string | null;
  buyerSignedAt?: string | null;
};

export type Notification = {
  id: number;
  userId: string;
  kind: string;
  title: string;
  body: string | null;
  itemId: string | null;
  readAt: string | null;
  createdAt: string;
};

export type ItemEvent = {
  id: number;
  itemId: string;
  userId: string | null;
  kind: string;
  detail: string | null;
  createdAt: string;
};

export type Stats = {
  total: number;
  secured: number;
  missing: number;
  chipActive: number;
  chipUnpaired: number;
  totalValueNok: number;
};

// ---- Auth ----
export const auth = {
  register: (email: string, password: string, name: string, acceptTerms = true) =>
    request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name,
        acceptTerms,
        consentVersion: CONSENT_VERSION,
      }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: User }>("/api/auth/me"),
  updateProfile: (patch: Partial<User>) =>
    request<{ user: User }>("/api/auth/me", {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
  changePassword: (oldPassword: string, newPassword: string) =>
    request<{ ok: true }>("/api/auth/password", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
  oauth: (
    provider: "google" | "apple",
    idToken: string,
    name?: string,
    acceptTerms = false
  ) =>
    request<{ token: string; user: User }>("/api/auth/oauth", {
      method: "POST",
      body: JSON.stringify({
        provider,
        idToken,
        name,
        acceptTerms,
        consentVersion: CONSENT_VERSION,
      }),
    }),
  forgotPassword: (email: string) =>
    request<{ ok: true }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    request<{ ok: true }>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
  deleteAccount: () => request<{ ok: true }>("/api/auth/me", { method: "DELETE" }),
  exportData: async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/api/auth/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Eksport feilet");
    return res.blob();
  },
};

// ---- Items ----
export const items = {
  list: () => request<Item[]>("/api/items"),
  get: (id: string) => request<Item>(`/api/items/${id}`),
  create: (data: Partial<Item>) =>
    request<Item>("/api/items", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Item>) =>
    request<Item>(`/api/items/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  remove: (id: string) => request<{ ok: true }>(`/api/items/${id}`, { method: "DELETE" }),
  markLost: (id: string, message?: string) =>
    request<Item>(`/api/items/${id}/lost`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),
  markFound: (id: string) =>
    request<Item>(`/api/items/${id}/found`, { method: "POST" }),
  events: (id: string) => request<ItemEvent[]>(`/api/items/${id}/events`),
};

// ---- Chip ----
export const chip = {
  pair: (itemId: string, chipUid: string) =>
    request<Item>("/api/chip/pair", {
      method: "POST",
      body: JSON.stringify({ itemId, chipUid }),
    }),
  unpair: (itemId: string) =>
    request<Item>("/api/chip/unpair", { method: "POST", body: JSON.stringify({ itemId }) }),
};

// ---- Transfers ----
export type TransferContract = {
  itemId: string;
  toEmail: string;
  salePriceNok: number;
  conditionNote?: string;
  paymentMethod?: string;
  asIs?: boolean;
  note?: string;
  confirmContract: true;
};

export const transfers = {
  list: () => request<Transfer[]>("/api/transfers"),
  create: (contract: TransferContract) =>
    request<Transfer>("/api/transfers", {
      method: "POST",
      body: JSON.stringify(contract),
    }),
  accept: (id: string, buyerName?: string) =>
    request<Transfer>(`/api/transfers/${id}/accept`, {
      method: "POST",
      body: JSON.stringify({ confirmContract: true, buyerName }),
    }),
};

// ---- BankID signering (Criipto) ----
export const signing = {
  status: () => request<{ configured: boolean }>("/api/signing/bankid/status"),
  start: (transferId: string, role: "seller" | "buyer") =>
    request<{ authUrl: string }>("/api/signing/bankid/start", {
      method: "POST",
      body: JSON.stringify({ transferId, role }),
    }),
  callback: (code: string, state: string) =>
    request<{ ok: true; transferId: string; role: "seller" | "buyer"; signerName?: string; transfer: Transfer }>(
      "/api/signing/bankid/callback",
      {
        method: "POST",
        body: JSON.stringify({ code, state }),
      }
    ),
};

// ---- Notifications ----
export const notifications = {
  list: () => request<Notification[]>("/api/notifications"),
  unreadCount: () => request<{ count: number }>("/api/notifications/unread-count"),
  markAllRead: () =>
    request<{ ok: true }>("/api/notifications/read-all", { method: "POST" }),
};

// ---- Stats ----
export const stats = {
  me: () => request<Stats>("/api/stats"),
};

// ---- Public Found Flow ----
export const found = {
  lookup: (code: string) =>
    request<Partial<Item>>(`/api/found/${encodeURIComponent(code)}`),
  report: (
    code: string,
    data: { finderName?: string; finderContact?: string; message?: string; lat?: number; lng?: number }
  ) =>
    request<{ ok: true }>(`/api/found/${encodeURIComponent(code)}/report`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ---- Feedback / kontakt ----
export const feedback = {
  send: (data: {
    kind: "bug" | "feature" | "question" | "other";
    subject?: string | null;
    message: string;
    name?: string | null;
    email?: string | null;
    path?: string | null;
  }) =>
    request<{ ok: true; id: number }>("/api/feedback", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
