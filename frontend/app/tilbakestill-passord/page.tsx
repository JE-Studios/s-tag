"use client";
import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "../lib/i18n";
import { auth } from "../lib/api";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function ResetForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError(t("reset.mismatch"));
      return;
    }
    if (password.length < 8) {
      setError(t("reset.tooShort"));
      return;
    }
    setLoading(true);
    try {
      await auth.resetPassword(token, password);
      setDone(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("common.error");
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
            <span
              className="material-symbols-outlined text-red-500 text-4xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              error
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            {t("reset.invalidLink")}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            {t("reset.invalidBody")}
          </p>
          <Link
            href="/glemt-passord"
            className="inline-block px-8 py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1a3d7c] transition shadow-lg shadow-[#0f2a5c]/20"
          >
            {t("reset.requestNew")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!done ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="w-full max-w-md"
        >
          <Link href="/" className="flex items-center justify-center mb-8">
            <Image src="/logo.png" alt="S-TAG" width={120} height={86} className="object-contain" priority />
          </Link>
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
            <h1 className="text-3xl font-black tracking-tight mb-2 text-center">
              {t("reset.title")}
            </h1>
            <p className="text-slate-500 text-center mb-8">
              {t("reset.subtitle")}
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  {t("reset.newPassword")}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                  placeholder={t("reset.minLength")}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  {t("reset.confirmPassword")}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                  placeholder={t("reset.confirmPlaceholder")}
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1a3d7c] transition disabled:opacity-50 shadow-lg shadow-[#0f2a5c]/20"
              >
                {loading ? t("reset.saving") : t("reset.save")}
              </button>
            </form>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center">
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
              className="w-20 h-20 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-5"
            >
              <span
                className="material-symbols-outlined text-emerald-600 text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </motion.div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              {t("reset.doneTitle")}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {t("reset.doneBody")}
            </p>
            <Link
              href="/logg-inn"
              className="inline-block px-8 py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1a3d7c] transition shadow-lg shadow-[#0f2a5c]/20"
            >
              {t("login.login")}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-50 to-white">
      <Suspense
        fallback={
          <div className="w-full max-w-md text-center">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="text-slate-400 text-sm"
            >
              {t("common.loading")}
            </motion.span>
          </div>
        }
      >
        <ResetForm />
      </Suspense>
    </div>
  );
}
