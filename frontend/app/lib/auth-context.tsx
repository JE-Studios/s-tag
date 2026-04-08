"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth, setToken, getToken, User } from "./api";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const PUBLIC_ROUTES = ["/", "/logg-inn", "/registrer", "/om", "/personvern", "/vilkar"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    auth
      .me()
      .then((res) => setUser(res.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  // Client-side route guard
  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_ROUTES.includes(pathname);
    if (!user && !isPublic) {
      router.replace("/logg-inn");
    }
  }, [user, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    const { token, user } = await auth.login(email, password);
    setToken(token);
    setUser(user);
    router.replace("/hjem");
  };

  const register = async (email: string, password: string, name: string) => {
    const { token, user } = await auth.register(email, password, name);
    setToken(token);
    setUser(user);
    router.replace("/hjem");
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    router.replace("/");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
