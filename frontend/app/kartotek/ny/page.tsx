"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import TopBar from "../../components/TopBar";
import { items as itemsApi } from "../../lib/api";
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
  const geo = useGeolocation(false);
  const [loading, setLoading] = useState(false);

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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Navn er påkrevd");
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        brand: brand.trim() || undefined,
        model: model.trim() || undefined,
        color: color.trim() || undefined,
        serialNumber: serialNumber.trim() || undefined,
        valueNok: valueNok ? Number(valueNok) : undefined,
        purchasedAt: purchasedAt || undefined,
        photoUrl: photoUrl.trim() || undefined,
      };
      if (hasGeoConsent() && geo.lat != null && geo.lng != null) {
        payload.lat = geo.lat;
        payload.lng = geo.lng;
      }
      const created = await itemsApi.create(payload);
      toast.success(`${created.name} er registrert`);
      router.replace(`/kartotek/detalj?id=${created.id}`);
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke registrere");
      setLoading(false);
    }
  };

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
          <h1 className="font-extrabold text-4xl text-slate-900 tracking-tight mb-2">
            Registrer eiendel
          </h1>
          <p className="text-slate-500 text-sm">
            Jo mer info du fyller ut, jo enklere blir det å gjenfinne hvis noe forsvinner.
          </p>
        </motion.div>

        <form onSubmit={submit} className="space-y-6">
          <Section title="Grunnleggende" required>
            <Input label="Navn" value={name} onChange={setName} placeholder="F.eks. MacBook Pro 14&quot;" required />
            <div>
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
                    <span className="material-symbols-outlined text-xl">{c.icon}</span>
                    <span className="text-[9px] font-bold text-center leading-tight px-1">
                      {c.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label="Beskrivelse"
              value={description}
              onChange={setDescription}
              placeholder="Kjennetegn, tilbehør, særtrekk …"
            />
          </Section>

          <Section title="Identifikasjon">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Merke" value={brand} onChange={setBrand} placeholder="Apple" />
              <Input label="Modell" value={model} onChange={setModel} placeholder="MBP14 M3" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Farge" value={color} onChange={setColor} placeholder="Space Grey" />
              <Input label="Serienummer" value={serialNumber} onChange={setSerialNumber} placeholder="SN123…" />
            </div>
          </Section>

          <Section title="Verdi og kjøp">
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
            <Input
              label="Bilde-URL"
              value={photoUrl}
              onChange={setPhotoUrl}
              placeholder="https://…/bilde.jpg"
            />
          </Section>

          <Section title="Startposisjon">
            <p className="text-xs text-slate-500 mb-3">
              Bruk din nåværende posisjon som startpunkt for sporing. Krever samtykke til posisjon.
            </p>
            {geo.lat != null && geo.lng != null ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-800">
                <span className="font-bold">Posisjon klar:</span> {geo.lat.toFixed(4)}, {geo.lng.toFixed(4)}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => geo.request()}
                disabled={geo.loading}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">my_location</span>
                {geo.loading ? "Henter posisjon …" : "Bruk min posisjon"}
              </button>
            )}
            {geo.error && <p className="text-xs text-red-600 mt-2">{geo.error}</p>}
          </Section>

          <div className="sticky bottom-24 pt-4">
            <button
              type="submit"
              disabled={loading}
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

function Section({
  title,
  required,
  children,
}: {
  title: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
      <h2 className="font-bold text-slate-900 flex items-center gap-2">
        {title}
        {required && (
          <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
            Påkrevd
          </span>
        )}
      </h2>
      {children}
    </div>
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
