"use client";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Link from "next/link";
import TopBar from "../components/TopBar";
import { items as itemsApi, Item } from "../lib/api";

type RegistryItem = Item;

const statusBadge = {
  secured: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Sikret" },
  missing: { bg: "bg-red-50", text: "text-red-600", label: "Savnet" },
  inactive: { bg: "bg-slate-200", text: "text-slate-600", label: "Inaktiv" },
};

type SortKey = "newest" | "oldest" | "name" | "status";
type FilterKey = "all" | "secured" | "missing" | "paired" | "unpaired";

const SORT_LABEL: Record<SortKey, string> = {
  newest: "Nyeste først",
  oldest: "Eldste først",
  name: "Navn A–Å",
  status: "Savnet først",
};

const FILTER_LABEL: Record<FilterKey, string> = {
  all: "Alle",
  secured: "Sikret",
  missing: "Savnet",
  paired: "Aktiv chip",
  unpaired: "Venter på signal",
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
};

const itemAnim: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function KartotekPage() {
  const [list, setList] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [controlsOpen, setControlsOpen] = useState(false);

  useEffect(() => {
    itemsApi
      .list()
      .then((data) => setList(data))
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = list.filter((i) => {
      if (filter === "secured" && i.status !== "secured") return false;
      if (filter === "missing" && i.status !== "missing") return false;
      if (filter === "paired" && !i.chipUid) return false;
      if (filter === "unpaired" && i.chipUid) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.tagId.toLowerCase().includes(q) ||
        (i.brand || "").toLowerCase().includes(q) ||
        (i.model || "").toLowerCase().includes(q) ||
        (i.serialNumber || "").toLowerCase().includes(q)
      );
    });
    out = [...out].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "nb");
      if (sort === "status") {
        const rank = (s: string) => (s === "missing" ? 0 : s === "secured" ? 1 : 2);
        return rank(a.status) - rank(b.status);
      }
      const at = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
      return sort === "oldest" ? at - bt : bt - at;
    });
    return out;
  }, [list, query, sort, filter]);

  return (
    <>
      <TopBar
        showBack
        rightIcon={controlsOpen ? "close" : "tune"}
        onRightClick={() => setControlsOpen((v) => !v)}
      />
      <main className="pt-28 pb-40 px-6 max-w-2xl mx-auto">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6"
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

        {/* Søk */}
        <div className="relative mb-4">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk på navn, merke, serienr …"
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f2a5c] focus:ring-2 focus:ring-[#0f2a5c]/10 transition"
          />
        </div>

        {/* Filter / sort panel */}
        <AnimatePresence>
          {controlsOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    Filter
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(FILTER_LABEL) as FilterKey[]).map((k) => (
                      <button
                        key={k}
                        onClick={() => setFilter(k)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                          filter === k
                            ? "bg-[#0f2a5c] text-white border-[#0f2a5c]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {FILTER_LABEL[k]}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                    Sorter
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                      <button
                        key={k}
                        onClick={() => setSort(k)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                          sort === k
                            ? "bg-[#0f2a5c] text-white border-[#0f2a5c]"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {SORT_LABEL[k]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resultatantall */}
        {!loading && (
          <p className="text-xs text-slate-500 mb-4 font-medium">
            Viser {filtered.length} av {list.length}
            {filter !== "all" && ` · filter: ${FILTER_LABEL[filter]}`}
          </p>
        )}

        {!loading && list.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-3xl">
            <span className="material-symbols-outlined text-6xl text-slate-300">inventory_2</span>
            <h3 className="mt-4 text-xl font-bold text-slate-700">Ingen gjenstander enda</h3>
            <p className="text-slate-500 mt-1">Registrer din første gjenstand for å komme i gang.</p>
          </div>
        )}

        {!loading && list.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 border border-slate-200 rounded-2xl bg-slate-50">
            <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
            <p className="text-slate-500 mt-2 font-medium">Ingen treff på søket</p>
          </div>
        )}

        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {filtered.map((item) => {
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
                    {item.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-slate-400 text-4xl">
                        {item.status === "missing" ? "laptop_mac" : "inventory_2"}
                      </span>
                    )}
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
          <Link
            href="/kartotek/ny"
            className="pointer-events-auto w-full bg-[#0f2a5c] hover:bg-[#1e40af] text-white font-bold py-4 rounded-2xl shadow-xl shadow-[#0f2a5c]/20 flex items-center justify-center gap-3 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              add_circle
            </span>
            Registrer ny gjenstand
          </Link>
        </div>
      </motion.div>
    </>
  );
}
