"use client";
import { useState, FormEvent, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../lib/auth-context";
import { auth as authApi, setToken } from "../lib/api";
import { useGeolocation, setGeoConsent, getGeoConsent } from "../lib/use-geolocation";
import OAuthButtons from "../components/OAuthButtons";

type Step = "form" | "permission";
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function RegisterPage() {
  const { setUser } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedFirstName, setSavedFirstName] = useState("");

  const geo = useGeolocation(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!acceptTerms) {
      setError("Du må godta vilkårene og personvernerklæringen for å opprette konto.");
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await authApi.register(email, password, name, true);
      setToken(token);
      setUser(user);
      setSavedFirstName(user.name.split(" ")[0] || "");
      setLoading(false);
      setStep("permission");
    } catch (err: any) {
      setError(err.message || "Kunne ikke opprette konto");
      setLoading(false);
    }
  }

  async function handleAllow() {
    await geo.request();
    // Dokumenter faktisk samtykke hos backend (GDPR art. 7 — må kunne bevises).
    const granted = getGeoConsent() === "granted";
    try {
      await authApi.updateProfile({ consentLocation: granted });
    } catch {
      /* stille — ikke blokker onboarding på API-feil */
    }
    router.replace("/hjem");
  }

  async function handleSkip() {
    setGeoConsent(false);
    try {
      await authApi.updateProfile({ consentLocation: false });
    } catch {
      /* stille */
    }
    router.replace("/hjem");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 to-white">
      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
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
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Navn</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                    placeholder="Ola Nordmann"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">E-post</label>
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
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">Passord</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
                    placeholder="Minst 8 tegn"
                    autoComplete="new-password"
                  />
                </div>
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0f2a5c] focus:ring-[#0f2a5c]/30"
                  />
                  <span className="text-xs text-slate-600 leading-relaxed">
                    Jeg har lest og godtar{" "}
                    <Link href="/vilkar" target="_blank" className="text-[#0f2a5c] font-bold underline">
                      brukervilkårene
                    </Link>{" "}
                    og{" "}
                    <Link href="/personvern" target="_blank" className="text-[#0f2a5c] font-bold underline">
                      personvernerklæringen
                    </Link>
                    .
                  </span>
                </label>
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
                )}
                <button
                  type="submit"
                  disabled={loading || !acceptTerms}
                  className="w-full py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1a3d7c] transition disabled:opacity-50 shadow-lg shadow-[#0f2a5c]/20 disabled:cursor-not-allowed"
                >
                  {loading ? "Oppretter..." : "Opprett konto"}
                </button>
              </form>
              <div className="mt-6">
                <OAuthButtons
                  mode="register"
                  requireAccept
                  accepted={acceptTerms}
                  onRegistered={(u) => {
                    setSavedFirstName(u.name.split(" ")[0] || "");
                    setStep("permission");
                  }}
                />
              </div>
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
        ) : (
          <motion.div
            key="permission"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
                className="w-20 h-20 mx-auto rounded-2xl bg-[#0f2a5c]/5 border border-[#0f2a5c]/10 flex items-center justify-center mb-5"
              >
                <span
                  className="material-symbols-outlined text-[#0f2a5c] text-4xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  my_location
                </span>
              </motion.div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Velkommen, {savedFirstName}!
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                For å kunne vise hjem-området ditt, spore eiendeler og hjelpe deg
                å finne savnede ting, trenger S-TAG tilgang til posisjon.
              </p>
              <ul className="text-left text-sm text-slate-600 space-y-2.5 mb-7 bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <Benefit icon="home">Automatisk hjem-område uten å oppgi adresse</Benefit>
                <Benefit icon="explore">Finn igjen savnede gjenstander raskere</Benefit>
                <Benefit icon="lock">Din posisjon deles aldri med andre brukere</Benefit>
              </ul>
              {geo.error && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs mb-4 text-left">
                  Kunne ikke hente posisjon: {geo.error}. Du kan fortsatt bruke S-TAG.
                </div>
              )}
              <button
                onClick={handleAllow}
                disabled={geo.loading}
                className="w-full py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1a3d7c] transition disabled:opacity-50 shadow-lg shadow-[#0f2a5c]/20 mb-2 flex items-center justify-center gap-2"
              >
                <span
                  className="material-symbols-outlined text-base"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  my_location
                </span>
                {geo.loading ? "Henter posisjon..." : "Tillat posisjon"}
              </button>
              <button
                onClick={handleSkip}
                disabled={geo.loading}
                className="w-full py-3 rounded-xl text-slate-500 text-sm hover:text-slate-700 transition disabled:opacity-40"
              >
                Ikke nå
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Benefit({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="material-symbols-outlined text-[#0f2a5c] text-base mt-0.5 shrink-0"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {icon}
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
