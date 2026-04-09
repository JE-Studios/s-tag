"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../../components/TopBar";
import PhotoPicker from "../../components/PhotoPicker";
import { items as itemsApi, API_BASE } from "../../lib/api";
import { useToast } from "../../components/Toast";
import { useGeolocation, hasGeoConsent } from "../../lib/use-geolocation";

const CATEGORIES = [
  { id: "electronics", label: "Elektronikk", icon: "devices" },
  { id: "bike", label: "Sykkel", icon: "pedal_bike" },
  { id: "vehicle", label: "Kjøretøy", icon: "directions_car" },
  { id: "bag", label: "Veske/sekk", icon: "backpack" },
  { id: "tools", label: "Verktøy", icon: "construction" },
  { id: "jewellery", label: "Smykker", icon: "diamond" },
  { id: "document", label: "Dokumenter", icon: "description" },
  { id: "other", label: "Annet", icon: "category" },
];

export default function NyGjenstandPage() {
  const router = useRouter();
  const toast = useToast();
  const geo = useGeolocation(true);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const [stagCode, setStagCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "invalid"
  >("idle");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("electronics");
  const [description, setDescription] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [valueNok, setValueNok] = useState("");
  const [purchasedAt, setPurchasedAt] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  // Live sjekk av S-TAG-kode mot backend (debounced)
  useEffect(() => {
    const trimmed = stagCode.trim().toUpperCase();
    if (!trimmed) {
      setCodeStatus("idle");
      return;
    }
    if (trimmed.length < 6) {
      setCodeStatus("invalid");
      return;
    }
    setCodeStatus("checking");
    const t = setTimeout(async () => {
      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("stag_token")
            : null;
        const r = await fetch(
          `${API_BASE}/api/items/code-available?code=${encodeURIComponent(trimmed)}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        const j = await r.json();
        setCodeStatus(j.available ? "available" : "taken");
      } catch {
        setCodeStatus("idle");
      }
    }, 400);
    return () => clearTimeout(t);
  }, [stagCode]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Navn er påkrevd");
      return;
    }
    const code = stagCode.trim().toUpperCase();
    if (!code) {
      toast.error("S-TAG-kode er påkrevd");
      return;
    }
    if (code.length < 6) {
      toast.error("S-TAG-koden virker ugyldig");
      return;
    }
    if (codeStatus === "taken") {
      toast.error("Denne S-TAG-koden er allerede registrert");
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        category,
        chipUid: code,
        description: description.trim() || undefined,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        color: color.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        valueNok: valueNok ? Number(valueNok) : undefined,
        purchasedAt: purchasedAt || undefined,
        photoUrl: photoUrl || undefined,
      };
      if (hasGeoConsent() && geo.lat != null && geo.lng != null) {
        payload.lat = geo.lat;
        payload.lng = geo.lng;
      }
      const created = await itemsApi.create(payload as Parameters<typeof itemsApi.create>[0]);
      toast.success(`${created.name} er registrert`);
      router.replace(`/kartotek/detalj?id=${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Kunne ikke registrere";
      toast.error(msg);
      setLoading(false);
    }
  };

  const canSubmit =
    name.trim() &&
    stagCode.trim().length >= 6 &&
    codeStatus !== "taken" &&
    codeStatus !== "invalid";

  return (
    <>
      <TopBar showBack title="Ny gjenstand" />
      <main className="pt-24 pb-40 px-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="font-extrabold text-3xl text-slate-900 tracking-tight mb-1">
            Registrer eiendel
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Skriv inn S-TAG-koden fra emballasjen og gi gjenstanden et navn
            — ferdig.
          </p>
        </motion.div>

        <form onSubmit={submit} className="space-y-5">
          {/* S-TAG Code — premium dark card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="bg-gradient-to-br from-[#0a1e3d] to-[#0f2a5c] rounded-3xl p-5 shadow-lg shadow-[#0a1e3d]/20"
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="material-symbols-outlined text-white/70 text-lg"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                nfc
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                S-TAG-kode
              </span>
            </div>
            <input
              type="text"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              autoFocus
              value={stagCode}
              onChange={(e) => setStagCode(e.target.value.toUpperCase())}
              placeholder="ST-XXXX-XXXX"
              className={`w-full font-mono text-lg tracking-wider bg-white/10 border rounded-xl px-4 py-3.5 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition ${
                codeStatus === "available"
                  ? "border-emerald-400/60 focus:ring-emerald-400/20"
                  : codeStatus === "taken" || codeStatus === "invalid"
                  ? "border-red-400/60 focus:ring-red-400/20"
                  : "border-white/20 focus:ring-white/10"
              }`}
            />
            <div className="mt-2 text-xs h-5">
              {codeStatus === "checking" && (
                <span className="text-white/50">Sjekker kode …</span>
              )}
              {codeStatus === "available" && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    check_circle
                  </span>
                  Klar til registrering
                </span>
              )}
              {codeStatus === "taken" && (
                <span className="text-red-400 font-semibold">
                  Allerede registrert
                </span>
              )}
              {codeStatus === "invalid" && (
                <span className="text-red-400 font-semibold">
                  Koden virker for kort
                </span>
              )}
            </div>
          </motion.div>

          {/* Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <label className="block">
              <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
                Hva er det? <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='F.eks. MacBook Pro 14"'
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
              />
            </label>
          </motion.div>

          {/* Category */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              Kategori
            </p>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border transition ${
                    category === c.id
                      ? "bg-[#0f2a5c] text-white border-[#0f2a5c]"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {c.icon}
                  </span>
                  <span className="text-[9px] font-bold text-center leading-tight px-1">
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PhotoPicker value={photoUrl} onChange={setPhotoUrl} />
          </motion.div>

          {/* Toggle for extra details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-bold text-[#0f2a5c] hover:text-[#1e40af] transition"
            >
              <span
                className="material-symbols-outlined text-lg transition-transform duration-300"
                style={{
                  transform: showMore ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                expand_more
              </span>
              {showMore ? "Skjul detaljer" : "Legg til flere detaljer"}
            </button>
          </motion.div>

          {/* Collapsible extras */}
          <AnimatePresence>
            {showMore && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <Textarea
                    label="Beskrivelse"
                    value={description}
                    onChange={setDescription}
                    placeholder="Kjennetegn, tilbehør, særtrekk …"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Merke"
                      value={brand}
                      onChange={setBrand}
                      placeholder="Apple"
                    />
                    <Input
                      label="Modell"
                      value={model}
                      onChange={setModel}
                      placeholder="MBP14 M3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Farge"
                      value={color}
                      onChange={setColor}
                      placeholder="Space Grey"
                    />
                    <Input
                      label="Serienummer"
                      value={serialNumber}
                      onChange={setSerialNumber}
                      placeholder="SN123…"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Verdi (NOK)"
                      type="number"
                      value={valueNok}
                      onChange={setValueNok}
                      placeholder="25000"
                    />
                    <Input
                      label="Kjøpsdato"
                      type="date"
                      value={purchasedAt}
                      onChange={setPurchasedAt}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit */}
          <div className="sticky bottom-24 pt-4">
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="w-full py-4 rounded-2xl bg-[#0f2a5c] text-white font-bold text-lg hover:bg-[#1e40af] transition disabled:opacity-50 shadow-xl shadow-[#0f2a5c]/20"
            >
              {loading ? "Registrerer …" : "Registrer gjenstand"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
      />
    </label>
  );
}

function Textarea({
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
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition resize-none"
      />
    </label>
  );
}
