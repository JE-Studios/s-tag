"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Logo from "../../components/Logo";
import { found, Item } from "../../lib/api";
import { useToast } from "../../components/Toast";

export default function FunnetPage() {
  const params = useParams();
  const code = String(params?.code || "");
  const toast = useToast();
  const [item, setItem] = useState<Partial<Item> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [finderName, setFinderName] = useState("");
  const [finderContact, setFinderContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!code) return;
    found
      .lookup(code)
      .then((data) => {
        setItem(data);
      })
      .catch((err) => {
        setError(err.message || "Ugyldig kode");
      })
      .finally(() => setLoading(false));
  }, [code]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Skriv en melding til eieren");
      return;
    }
    setSubmitting(true);
    try {
      let lat: number | undefined;
      let lng: number | undefined;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          /* posisjon er valgfritt */
        }
      }
      await found.report(code, {
        finderName: finderName.trim() || undefined,
        finderContact: finderContact.trim() || undefined,
        message: message.trim(),
        lat,
        lng,
      });
      setDone(true);
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke sende");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <header className="pt-8 pb-6 px-6 flex justify-center">
        <Link href="/">
          <Logo size={48} />
        </Link>
      </header>

      <div className="px-6 max-w-xl mx-auto pb-20">
        {loading && <p className="text-center text-slate-400 py-20">Laster …</p>}

        {error && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-slate-300">error</span>
            <h1 className="mt-4 text-2xl font-bold text-slate-900">Ugyldig kode</h1>
            <p className="text-slate-500 mt-2">{error}</p>
          </div>
        )}

        {item && !done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-6 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Registrert i S-TAG
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1">
                {item.name}
              </h1>
              {item.brand && (
                <p className="text-slate-500 text-sm">
                  {item.brand} {item.model || ""} {item.color && `· ${item.color}`}
                </p>
              )}

              {item.status === "missing" && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1">
                    Etterlyst av eier
                  </p>
                  {item.lostMessage ? (
                    <p className="text-sm text-red-900">{item.lostMessage}</p>
                  ) : (
                    <p className="text-sm text-red-900">
                      Eieren savner denne gjenstanden. Hjelp dem ved å rapportere funnet nedenfor.
                    </p>
                  )}
                </div>
              )}

              {item.photoUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.photoUrl} alt={item.name} className="w-full h-48 object-cover" />
                </div>
              )}
            </div>

            <form onSubmit={submit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Rapporter funn</h2>
              <p className="text-sm text-slate-500 -mt-2">
                Eieren varsles umiddelbart. Ditt navn og kontaktinfo er valgfritt, men hjelper med
                å få gjenstanden tilbake.
              </p>

              <Input label="Ditt navn (valgfritt)" value={finderName} onChange={setFinderName} placeholder="Fornavn Etternavn" />
              <Input
                label="Kontakt (e-post/telefon, valgfritt)"
                value={finderContact}
                onChange={setFinderContact}
                placeholder="eksempel@epost.no"
              />
              <label className="block">
                <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                  Melding *
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  placeholder="Hvor og når fant du den? Hvor kan eieren hente den?"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition resize-none"
                />
              </label>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                Ved å sende samtykker du til at posisjonen din kan legges ved (hvis tilgjengelig) og
                videresendes til eieren. Les vår{" "}
                <Link href="/personvern" className="underline">
                  personvernerklæring
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1e40af] transition disabled:opacity-50"
              >
                {submitting ? "Sender …" : "Send rapport til eier"}
              </button>
            </form>
          </motion.div>
        )}

        {done && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-emerald-600 text-5xl">check</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Takk!</h1>
            <p className="text-slate-500">
              Eieren er varslet og kan ta kontakt med deg. Du er helten i dag.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block py-3 px-6 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
            >
              Tilbake til forsiden
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
      />
    </label>
  );
}
