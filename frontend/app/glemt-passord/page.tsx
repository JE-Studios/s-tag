"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../lib/api";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await auth.forgotPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Noe gikk galt";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-50 to-white">
      <AnimatePresence mode="wait">
        {!sent ? (
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
                Glemt passord?
              </h1>
              <p className="text-slate-500 text-center mb-8">
                Skriv inn e-posten din, så sender vi en lenke for å tilbakestille passordet.
              </p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                    E-post
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                    placeholder="din@epost.no"
                    autoComplete="email"
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
                  {loading ? "Sender..." : "Send tilbakestillingslenke"}
                </button>
              </form>
              <p className="mt-6 text-center text-sm text-slate-500">
                Husker du passordet?{" "}
                <Link href="/logg-inn" className="text-[#0f2a5c] font-bold hover:underline">
                  Logg inn
                </Link>
              </p>
            </div>
            <p className="mt-6 text-center">
              <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">
                &larr; Tilbake til forsiden
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="sent"
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
                  mark_email_read
                </span>
              </motion.div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Sjekk e-posten din
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                Hvis det finnes en konto for <strong>{email}</strong>, har vi sendt
                en lenke for å tilbakestille passordet. Sjekk innboksen (og spam-mappen).
              </p>
              <p className="text-slate-400 text-xs">
                Lenken er gyldig i 1 time.
              </p>
              <div className="mt-6">
                <Link
                  href="/logg-inn"
                  className="inline-block px-8 py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1a3d7c] transition shadow-lg shadow-[#0f2a5c]/20"
                >
                  Tilbake til innlogging
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
