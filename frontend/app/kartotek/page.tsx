"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import TopBar from "../components/TopBar";
import { items as itemsApi, Item } from "../lib/api";

type RegistryItem = Item;

const statusBadge = {
  secured: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Sikret" },
  missing: { bg: "bg-red-50", text: "text-red-600", label: "Savnet" },
  inactive: { bg: "bg-slate-200", text: "text-slate-600", label: "Inaktiv" },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const itemAnim = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function KartotekPage() {
  const [list, setList] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsApi
      .list()
      .then((data) => setList(data))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar showBack rightIcon="filter_list" />
      <main className="pt-28 pb-40 px-6 max-w-2xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="font-extrabold text-5xl text-slate-900 leading-tight mb-2 tracking-tight">
            Kartotek
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            Administrer dine registrerte eiendeler og{" "}
            <span className="s-tag-wordmark text-sm">
              S<span className="accent">-</span>TAG
            </span>{" "}
            status.
          </p>
        </motion.section>

        {!loading && list.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
            <span className="material-symbols-outlined text-6xl text-slate-300">inventory_2</span>
            <h3 className="mt-4 text-xl font-bold text-slate-700">Ingen gjenstander enda</h3>
            <p className="text-slate-500 mt-1">Registrer din første gjenstand for å komme i gang.</p>
          </div>
        )}

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {list.map((item) => {
            const badge = statusBadge[item.status];
            const isMissing = item.status === "missing";
            const isInactive = item.status === "inactive";
            return (
              <motion.div key={item.id} variants={itemAnim} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={`/kartotek/detalj?id=${item.id}`}
                  className={`block bg-white rounded-2xl p-5 flex items-center gap-5 shadow-sm transition-all duration-300 hover:shadow-lg border group ${
                    isMissing
                      ? "border-red-100 border-l-4 border-l-red-500"
                      : isInactive
                      ? "border-slate-100 bg-slate-50 opacity-80"
                      : "border-slate-100"
                  }`}
                >
                  <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 flex items-center justify-center group-hover:bg-slate-50 transition-colors">
                    <span className="material-symbols-outlined text-slate-400 text-4xl">
                      {item.status === "missing" ? "laptop_mac" : "inventory_2"}
                    </span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-lg text-slate-900 truncate">{item.name}</h3>
                      <span className={`${badge.bg} ${badge.text} text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider whitespace-nowrap`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium mt-1">
                      ID: <span className="text-slate-900 font-mono text-xs">{item.tagId}</span>
                    </p>
                    <p className={`text-xs mt-0.5 ${isMissing ? "text-red-600 font-bold uppercase tracking-tight" : "text-slate-500"}`}>
                      {item.lastSeen}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 text-xl group-hover:text-[#0f2a5c] group-hover:translate-x-1 transition-all">
                    chevron_right
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </main>

      {/* Sticky CTA */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
        className="fixed bottom-28 left-0 w-full px-6 z-40 pointer-events-none"
      >
        <div className="max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              const name = prompt("Navn på gjenstand:");
              if (!name) return;
              try {
                const created = await itemsApi.create({ name });
                setList((l) => [...l, created]);
              } catch (err: any) {
                alert(err.message || "Kunne ikke opprette");
              }
            }}
            className="pointer-events-auto w-full bg-[#0f2a5c] hover:bg-[#1e40af] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#0f2a5c]/20 flex items-center justify-center gap-3 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              add_circle
            </span>
            Registrer ny gjenstand
          </motion.button>
        </div>
      </motion.div>
    </>
  );
}
