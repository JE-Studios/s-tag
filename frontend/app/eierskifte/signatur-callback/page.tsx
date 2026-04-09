"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../../components/TopBar";
import { signing } from "../../lib/api";

type Phase = "working" | "done" | "error";

const APPLE_EASE: [number, number, number, number] = [0.32, 0.72, 0, 1];

export default function SignaturCallbackPage() {
  return (
    <Suspense fallback={<CallbackShell />}>
      <SignaturCallbackInner />
    </Suspense>
  );
}

function CallbackShell() {
  return (
    <>
      <TopBar showBack title="BankID-signering" />
      <main className="pt-28 px-6 max-w-md mx-auto pb-40">
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="mx-auto w-16 h-16 rounded-full border-4 border-slate-100 border-t-[#0f2a5c] animate-spin mb-6" />
          <p className="text-slate-500">Laster…</p>
        </div>
      </main>
    </>
  );
}

function SignaturCallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [phase, setPhase] = useState<Phase>("working");
  const [message, setMessage] = useState("Verifiserer BankID-signaturen…");
  const [role, setRole] = useState<"seller" | "buyer" | null>(null);
  const [signerName, setSignerName] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const err = params.get("error");
    const errDesc = params.get("error_description");

    if (err) {
      setPhase("error");
      setMessage(errDesc || `BankID avbrutt (${err})`);
      return;
    }
    if (!code || !state) {
      setPhase("error");
      setMessage("Mangler code/state fra BankID");
      return;
    }

    let cancelled = false;
    signing
      .callback(code, state)
      .then((res) => {
        if (cancelled) return;
        setRole(res.role);
        setSignerName(res.signerName || null);
        setPhase("done");
        setMessage(
          res.role === "seller"
            ? "Selgers BankID-signatur er registrert"
            : "Kjøpers BankID-signatur er registrert"
        );
        setTimeout(() => router.replace("/eierskifte"), 2400);
      })
      .catch((e: any) => {
        if (cancelled) return;
        setPhase("error");
        setMessage(e.message || "Kunne ikke fullføre signering");
      });
    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <>
      <TopBar showBack title="BankID-signering" />
      <main className="pt-28 px-6 max-w-md mx-auto pb-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: APPLE_EASE }}
          className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center"
        >
          <AnimatePresence mode="wait">
            {phase === "working" && (
              <motion.div
                key="working"
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.4, ease: APPLE_EASE }}
              >
                <div className="relative mx-auto w-16 h-16 mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-slate-100"
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-[#0f2a5c] border-t-transparent"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
                  />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
                  Verifiserer…
                </h1>
                <p className="text-slate-500">{message}</p>
              </motion.div>
            )}

            {phase === "done" && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.55, ease: APPLE_EASE }}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.7, ease: APPLE_EASE, delay: 0.05 }}
                  className="mx-auto w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30"
                >
                  <span
                    className="material-symbols-outlined text-white text-5xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                </motion.div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
                  Signert!
                </h1>
                <p className="text-slate-500 mb-1">{message}</p>
                {signerName && (
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
                    {signerName}
                  </p>
                )}
                <p className="mt-6 text-xs text-slate-400">
                  Du sendes tilbake til eierskiftet…
                </p>
              </motion.div>
            )}

            {phase === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: APPLE_EASE }}
              >
                <div className="mx-auto w-20 h-20 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-red-600 text-5xl">
                    error
                  </span>
                </div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
                  Signering feilet
                </h1>
                <p className="text-slate-500 mb-6">{message}</p>
                <button
                  onClick={() => router.replace("/eierskifte")}
                  className="px-6 py-3 rounded-full bg-[#0f2a5c] text-white font-bold hover:bg-[#1a3d7c] transition"
                >
                  Tilbake til eierskifte
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </>
  );
}
