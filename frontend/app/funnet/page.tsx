"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "../components/Logo";
import { found } from "../lib/api";

export default function FunnetSearchPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setSearching(true);
    setError(null);

    try {
      await found.lookup(trimmed);
      router.push(`/funnet/${encodeURIComponent(trimmed)}`);
    } catch {
      setError("Fant ingen gjenstand med denne koden. Sjekk at du har skrevet riktig.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md text-center"
      >
        <Link href="/" className="inline-block mb-8">
          <Logo className="mx-auto" />
        </Link>

        <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-6">
          <span
            className="material-symbols-outlined text-white text-4xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person_pin_circle
          </span>
        </div>

        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
          Funnet noe?
        </h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Skriv inn S-TAG-koden fra gjenstanden du har funnet. Koden er en
          8-tegns kode (f.eks. <span className="font-mono font-bold">A1B2C3D4</span>) som
          du finner p&aring; en lapp, etikett eller QR-kode.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="F.eks. A1B2C3D4"
            maxLength={20}
            className="w-full px-5 py-4 rounded-2xl border border-slate-200 text-center text-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            autoFocus
          />
          {error && (
            <p className="text-red-600 text-sm font-medium">{error}</p>
          )}
          <button
            type="submit"
            disabled={!code.trim() || searching}
            className="w-full py-4 rounded-2xl bg-emerald-600 text-white font-bold text-base hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {searching && (
              <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
            )}
            {searching ? "S\u00f8ker..." : "S\u00f8k opp gjenstand"}
          </button>
        </form>

        <p className="mt-6 text-xs text-slate-400">
          Du trenger ikke konto for &aring; rapportere et funn.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Tilbake til forsiden
        </Link>
      </motion.div>
    </div>
  );
}
