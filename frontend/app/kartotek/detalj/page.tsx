"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import TopBar from "../../components/TopBar";
import type { Item } from "../../sporing/MapView";
import { items as itemsApi, chip } from "../../lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const MapView = dynamic(() => import("../../sporing/MapView"), { ssr: false });

type DetailItem = Item & {
  tagId?: string;
  owner?: string;
  registered?: string;
  description?: string;
};

const statusMeta = {
  secured: { label: "Sikret", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500", icon: "verified" },
  missing: { label: "Savnet", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500", icon: "warning" },
  inactive: { label: "Inaktiv", color: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400", icon: "pause_circle" },
};

export default function ItemDetailPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ItemDetailPage />
    </Suspense>
  );
}

function ItemDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const [item, setItem] = useState<DetailItem | null>(null);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsApi
      .get(id)
      .then((data) => {
        setItem(data as DetailItem);
        setLoading(false);
        return fetch(`${API_BASE}/api/geocode?lat=${data.lat}&lng=${data.lng}`);
      })
      .then((r) => r?.json())
      .then((g) => g && setAddress(g.display || ""))
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <TopBar showBack />
        <main className="pt-28 px-6 max-w-2xl mx-auto">
          <div className="space-y-4">
            <div className="h-12 w-2/3 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-48 w-full bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-32 w-full bg-slate-100 rounded-2xl animate-pulse" />
          </div>
        </main>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <TopBar showBack />
        <main className="pt-28 px-6 max-w-2xl mx-auto text-center">
          <p className="text-slate-500">Fant ikke gjenstanden.</p>
        </main>
      </>
    );
  }

  const meta = statusMeta[item.status];

  return (
    <>
      <TopBar showBack />
      <main className="pt-24 pb-40 px-6 max-w-2xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <span className={`inline-flex items-center gap-1.5 ${meta.bg} ${meta.color} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
              <h1 className="text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {item.name}
              </h1>
              <p className="text-slate-500 font-mono text-sm mt-1">{item.tagId || `ST-${item.id}`}</p>
            </div>
          </div>
        </motion.div>

        {/* Map preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 rounded-3xl overflow-hidden border border-slate-200 shadow-sm h-64"
        >
          <MapView items={[item]} selectedId={item.id} />
        </motion.div>

        {/* Address card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0f2a5c] text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                location_on
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sist sett</p>
              <p className="text-slate-900 font-bold text-base">{address || item.lastSeen}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-3 border-t border-slate-100">
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">Bredde</span>
              <span className="text-slate-700 font-mono">{item.lat.toFixed(5)}</span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">Lengde</span>
              <span className="text-slate-700 font-mono">{item.lng.toFixed(5)}</span>
            </div>
          </div>
        </motion.div>

        {/* Owner / details */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm space-y-4"
        >
          <DetailRow icon="person" label="Eier" value={item.owner || "Ikke angitt"} />
          <DetailRow icon="calendar_month" label="Registrert" value={item.registered || "—"} />
          <DetailRow icon="qr_code_2" label="Tag-ID" value={item.tagId || `ST-${item.id}`} mono />
        </motion.div>

        {/* Chip pairing */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0f2a5c]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  nfc
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">S-TAG chip</p>
                <p className="text-slate-900 font-bold text-sm">
                  {item.chipStatus === "unpaired" && "Ikke paret"}
                  {item.chipStatus === "paired" && "Paret · venter på signal"}
                  {item.chipStatus === "active" && "Aktiv · live"}
                  {item.chipStatus === "lost" && "Mistet signal"}
                </p>
              </div>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                item.chipStatus === "active" ? "bg-emerald-500 animate-pulse" :
                item.chipStatus === "paired" ? "bg-amber-500" :
                "bg-slate-300"
              }`}
            />
          </div>
          {item.chipUid && (
            <p className="text-xs text-slate-500 font-mono mt-2 mb-3 break-all">UID: {item.chipUid}</p>
          )}
          {item.chipStatus === "unpaired" ? (
            <button
              onClick={async () => {
                // Mock chip UID generator until hardware is ready.
                // On mobile this triggers NFC scan via Capacitor plugin instead.
                const mockUid = "CHIP-" + Math.random().toString(36).slice(2, 10).toUpperCase();
                const confirmed = confirm(`Simulerer chip-skann.\nUID: ${mockUid}\n\nPare med ${item.name}?`);
                if (!confirmed) return;
                try {
                  const updated = await chip.pair(item.id, mockUid);
                  setItem(updated as DetailItem);
                } catch (err: any) {
                  alert(err.message || "Kunne ikke pare");
                }
              }}
              className="w-full py-3 rounded-xl bg-[#0f2a5c] text-white font-bold hover:bg-[#1a3d7c] transition"
            >
              Par ny chip
            </button>
          ) : (
            <button
              onClick={async () => {
                if (!confirm("Fjerne chip-paring?")) return;
                try {
                  const updated = await chip.unpair(item.id);
                  setItem(updated as DetailItem);
                } catch (err: any) {
                  alert(err.message || "Kunne ikke fjerne paring");
                }
              }}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
            >
              Fjern paring
            </button>
          )}
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 gap-3"
        >
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white border border-slate-200 rounded-2xl py-4 px-4 flex flex-col items-center gap-2 shadow-sm hover:shadow-md transition-shadow"
          >
            <span className="material-symbols-outlined text-[#0f2a5c]">share</span>
            <span className="text-xs font-bold text-slate-900">Del</span>
          </motion.button>
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="bg-[#0f2a5c] text-white rounded-2xl py-4 px-4 flex flex-col items-center gap-2 shadow-lg shadow-[#0f2a5c]/20 hover:bg-[#1e40af] transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>swap_horiz</span>
            <span className="text-xs font-bold">Eierskifte</span>
          </motion.button>
        </motion.div>
      </main>
    </>
  );
}

function DetailRow({ icon, label, value, mono }: { icon: string; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-slate-500 text-[18px]">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-slate-900 font-semibold text-sm truncate ${mono ? "font-mono" : ""}`}>{value}</p>
      </div>
    </div>
  );
}
