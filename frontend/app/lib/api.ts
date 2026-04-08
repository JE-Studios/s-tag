// S-TAG API client with token injection
const API_BASE =
  typeof window !== "undefined" && (window as any).__STAG_API__
    ? (window as any).__STAG_API__
    : process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const TOKEN_KEY = "stag_token";

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
};

// ---- Auth ----
export const auth = {
  register: (email: string, password: string, name: string) =>
    request<{ token: string; user: User }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    }),
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => request<{ user: User }>("/api/auth/me"),
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
export const transfers = {
  list: () => request<Transfer[]>("/api/transfers"),
  create: (itemId: string, toEmail: string, note?: string) =>
    request<Transfer>("/api/transfers", {
      method: "POST",
      body: JSON.stringify({ itemId, toEmail, note }),
    }),
  accept: (id: string) =>
    request<Transfer>(`/api/transfers/${id}/accept`, { method: "POST" }),
};
