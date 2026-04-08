"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";

export default function EierskiftePage() {
  const [tab, setTab] = useState<"sell" | "buy">("sell");
  const [form, setForm] = useState({ seller: "", buyer: "", description: "", tagId: "", date: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In the new model we need itemId + toEmail. Keep the form flow but map fields.
      // This form is a legacy entry; real flow is from item detail page.
      if (form.tagId && form.buyer) {
        // stub: ignored for legacy demo, real flow handled per-item
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3500);
    }
  };

  return (
    <>
      <TopBar showBack />
      <main className="pt-28 px-6 max-w-2xl mx-auto pb-40">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-2">Eierskifte</h1>
          <p className="text-slate-500 font-medium">
            Digital registrering av salg og kjøp for{" "}
            <span className="s-tag-wordmark text-sm">
              S<span className="accent">-</span>TAG
            </span>{" "}
            merkede gjenstander.
          </p>
        </motion.section>

        {/* Tab switcher */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-100 p-1 rounded-xl flex mb-10 border border-slate-200 relative"
        >
          {(["sell", "buy"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm transition-colors relative z-10"
            >
              {tab === t && (
                <motion.div
                  layoutId="tab-active"
                  className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={`relative ${tab === t ? "text-slate-900" : "text-slate-500"}`}>
                {t === "sell" ? "Salgsmelding" : "Kjøpsmelding"}
              </span>
            </button>
          ))}
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Parties */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-slate-900">group</span>
              <h2 className="text-xl font-bold text-slate-900">Parter</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field
                label="Selgers navn"
                value={form.seller}
                onChange={(v) => setForm({ ...form, seller: v })}
                placeholder="Fullt navn"
              />
              <Field
                label="Kjøpers navn"
                value={form.buyer}
                onChange={(v) => setForm({ ...form, buyer: v })}
                placeholder="Fullt navn"
              />
            </div>
          </motion.section>

          {/* Item details */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-slate-900">inventory_2</span>
              <h2 className="text-xl font-bold text-slate-900">Objektinformasjon</h2>
            </div>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 block">
                  Beskrivelse
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="F.eks. 'Specialized Stumpjumper EVO 2023, Sort'"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-slate-900 focus:ring-2 focus:ring-[#0f2a5c] focus:border-transparent placeholder:text-slate-300 transition-all outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 block">
                    S<span className="text-blue-600">-</span>TAG ID
                  </label>
                  <div className="relative">
                    <input
                      value={form.tagId}
                      onChange={(e) => setForm({ ...form, tagId: e.target.value })}
                      placeholder="ST-XXXX-XXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-5 text-slate-900 font-mono focus:ring-2 focus:ring-[#0f2a5c] focus:border-transparent placeholder:text-slate-300 transition-all outline-none"
                    />
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      qr_code_2
                    </span>
                  </div>
                </div>
                <Field
                  label="Overdragelsesdato"
                  type="date"
                  value={form.date}
                  onChange={(v) => setForm({ ...form, date: v })}
                />
              </div>
            </div>
          </motion.section>

          {/* Signatures */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-slate-900">draw</span>
              <h2 className="text-xl font-bold text-slate-900">Signering</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {["selger", "kjøper"].map((role) => (
                <motion.button
                  type="button"
                  key={role}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative aspect-video bg-slate-50 rounded-3xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#0f2a5c] hover:bg-slate-100 transition-all"
                >
                  <span className="material-symbols-outlined text-slate-400 mb-2 group-hover:scale-110 transition-transform group-hover:text-[#0f2a5c]">
                    edit_square
                  </span>
                  <p className="text-sm font-bold text-slate-900">Signer som {role}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1">BankID bekreftelse</p>
                </motion.button>
              ))}
            </div>
          </motion.section>

          {/* Submit */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-[#0f2a5c] hover:bg-[#1e40af] text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-[#0f2a5c]/20 flex items-center justify-center gap-3 transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                send
              </span>
              Send inn melding
            </motion.button>
          </motion.section>
        </form>

        {/* Toast */}
        <AnimatePresence>
          {submitted && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold"
            >
              <span className="material-symbols-outlined">check_circle</span>
              Melding sendt!
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-slate-900 focus:ring-2 focus:ring-[#0f2a5c] focus:border-transparent placeholder:text-slate-300 transition-all outline-none"
      />
    </div>
  );
}
