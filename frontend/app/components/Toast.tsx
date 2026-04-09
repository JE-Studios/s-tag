"use client";
import { createContext, useCallback, useContext, useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ToastKind = "info" | "success" | "error";
type Toast = { id: number; kind: ToastKind; message: string };

type ToastCtx = {
  push: (message: string, kind?: ToastKind) => void;
  success: (m: string) => void;
  error: (m: string) => void;
  info: (m: string) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

const ICON: Record<ToastKind, string> = {
  success: "check_circle",
  error: "error",
  info: "info",
};

const COLORS: Record<ToastKind, string> = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-slate-50 border-slate-200 text-slate-800",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, kind: ToastKind = "info") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, kind, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4000);
  }, []);

  const api: ToastCtx = {
    push,
    success: (m) => push(m, "success"),
    error: (m) => push(m, "error"),
    info: (m) => push(m, "info"),
  };

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="fixed top-20 right-6 z-[60] space-y-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className={`pointer-events-auto flex items-start gap-3 border rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm ${COLORS[t.kind]}`}
            >
              <span className="material-symbols-outlined text-xl mt-0.5">{ICON[t.kind]}</span>
              <p className="text-sm font-medium leading-snug">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Fallback når provider ikke er mountet — ikke krasj, bare console
    return {
      push: (m: string) => console.log("[toast]", m),
      success: (m: string) => console.log("[toast:success]", m),
      error: (m: string) => console.log("[toast:error]", m),
      info: (m: string) => console.log("[toast:info]", m),
    } satisfies ToastCtx;
  }
  return ctx;
}

