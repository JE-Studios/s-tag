"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAuth } from "../lib/auth-context";

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(email, password, name);
    } catch (err: any) {
      setError(err.message || "Kunne ikke opprette konto");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center mb-8">
          <Image src="/logo.png" alt="S-TAG" width={120} height={86} className="object-contain" priority />
        </Link>
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
          <h1 className="text-3xl font-black tracking-tight mb-2 text-center">Opprett konto</h1>
          <p className="text-slate-500 text-center mb-8">Kom i gang med S-TAG på sekunder</p>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-600 mb-2">Navn</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 outline-none transition"
                placeholder="Ola Nordmann"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-600 mb-2">E-post</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 outline-none transition"
                placeholder="din@epost.no"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-xs font-bold tracking-wider uppercase text-slate-600 mb-2">Passord</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 outline-none transition"
                placeholder="Minst 8 tegn"
                autoComplete="new-password"
              />
            </div>
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#0f2a5c] text-white font-bold hover:bg-[#1a3d7c] transition disabled:opacity-60"
            >
              {loading ? "Oppretter..." : "Opprett konto"}
            </button>
            <p className="text-xs text-slate-400 text-center">
              Ved å opprette konto godtar du våre{" "}
              <a href="#" className="underline">vilkår</a> og{" "}
              <a href="#" className="underline">personvern</a>.
            </p>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Har du allerede konto?{" "}
            <Link href="/logg-inn" className="text-[#0f2a5c] font-bold hover:underline">
              Logg inn
            </Link>
          </p>
        </div>
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">
            ← Tilbake til forsiden
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
