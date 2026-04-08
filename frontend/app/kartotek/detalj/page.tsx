"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import TopBar from "../../components/TopBar";
import { items as itemsApi, chip, ItemEvent, Item } from "../../lib/api";
import { useToast } from "../../components/Toast";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const MapView = dynamic(() => import("../../sporing/MapView"), { ssr: false });

const statusMeta = {
  secured: { label: "Sikret", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500", icon: "verified" },
  missing: { label: "Savnet", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500", icon: "warning" },
  inactive: { label: "Inaktiv", color: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400", icon: "pause_circle" },
};

const EVENT_ICON: Record<string, string> = {
  created: "add_circle",
  updated: "edit",
  chip_paired: "nfc",
  chip_unpaired: "nfc_off",
  marked_lost: "location_off",
  marked_found: "check_circle",
  transferred: "swap_horiz",
};

function timeAgo(iso: string) {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "nå nettopp";
  if (diff < 3600) return `${Math.floor(diff / 60)} min siden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} t siden`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} d siden`;
  return d.toLocaleDateString("nb-NO");
}

export default function ItemDetailPageWrapper() {
  return (
    <Suspense fallback={null}>
      <ItemDetailPage />
    </Suspense>
  );
}

function ItemDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const id = searchParams.get("id") || "";
  const [item, setItem] = useState<Item | null>(null);
  const [events, setEvents] = useState<ItemEvent[]>([]);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const refreshItem = async () => {
    const data = await itemsApi.get(id);
    setItem(data);
    return data;
  };

  useEffect(() => {
    itemsApi
      .get(id)
      .then((data) => {
        setItem(data);
        setLoading(false);
        fetch(`${API_BASE}/api/geocode?lat=${data.lat}&lng=${data.lng}`)
          .then((r) => r.json())
          .then((g) => g && setAddress(g.display || ""))
          .catch(() => {});
        itemsApi.events(id).then(setEvents).catch(() => setEvents([]));
      })
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
  const isMissing = item.status === "missing";

  const toggleLost = async () => {
    try {
      if (isMissing) {
        await itemsApi.markFound(item.id);
        toast.success("Markert som funnet");
      } else {
        const msg = window.prompt("Valgfri melding til finnere:") || "";
        await itemsApi.markLost(item.id, msg);
        toast.info("Markert som savnet — finnere kan nå varsle deg");
      }
      await refreshItem();
      const ev = await itemsApi.events(id);
      setEvents(ev);
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke oppdatere");
    }
  };

  const removeItem = async () => {
    if (!confirm(`Slette "${item.name}" permanent?`)) return;
    try {
      await itemsApi.remove(item.id);
      toast.success("Gjenstanden er slettet");
      router.replace("/kartotek");
    } catch (err: any) {
      toast.error(err.message || "Kunne ikke slette");
    }
  };

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
              <span
                className={`inline-flex items-center gap-1.5 ${meta.bg} ${meta.color} text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
              <h1 className="text-4xl font-extrabold text-slate-900 leading-tight tracking-tight">
                {item.name}
              </h1>
              <p className="text-slate-500 font-mono text-sm mt-1">{item.tagId}</p>
            </div>
          </div>
        </motion.div>

        {/* Savnet-banner */}
        {isMissing && item.lostMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1">
              Melding til finnere
            </p>
            <p className="text-sm text-red-900">{item.lostMessage}</p>
          </div>
        )}

        {/* Bilde */}
        {item.photoUrl && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.photoUrl} alt={item.name} className="w-full h-56 object-cover" />
          </div>
        )}

        {/* Kart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 rounded-3xl overflow-hidden border border-slate-200 shadow-sm h-56"
        >
          <MapView items={[item]} selectedId={item.id} />
        </motion.div>

        {/* Adresse-kort */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#0f2a5c] text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                location_on
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Sist sett
              </p>
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
        </div>

        {/* Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm space-y-4">
          <DetailRow icon="qr_code_2" label="Tag-ID" value={item.tagId} mono />
          {item.brand && <DetailRow icon="sell" label="Merke" value={item.brand} />}
          {item.model && <DetailRow icon="category" label="Modell" value={item.model} />}
          {item.color && <DetailRow icon="palette" label="Farge" value={item.color} />}
          {item.serialNumber && (
            <DetailRow icon="fingerprint" label="Serienummer" value={item.serialNumber} mono />
          )}
          {item.valueNok && (
            <DetailRow
              icon="payments"
              label="Verdi"
              value={`${new Intl.NumberFormat("nb-NO").format(item.valueNok)} kr`}
            />
          )}
          {item.purchasedAt && (
            <DetailRow
              icon="calendar_month"
              label="Kjøpt"
              value={new Date(item.purchasedAt).toLocaleDateString("nb-NO")}
            />
          )}
          {item.description && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Beskrivelse
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">{item.description}</p>
            </div>
          )}
          {item.publicCode && (
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                Offentlig funnet-kode
              </p>
              <p className="text-sm text-slate-900 font-mono">{item.publicCode}</p>
              <p className="text-[10px] text-slate-500 mt-1">
                Del denne koden — finnere kan bruke den på /funnet/{item.publicCode} uten å logge inn.
              </p>
            </div>
          )}
        </div>

        {/* Chip pairing */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[#0f2a5c]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  nfc
                </span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  S-TAG chip
                </p>
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
                item.chipStatus === "active"
                  ? "bg-emerald-500 animate-pulse"
                  : item.chipStatus === "paired"
                  ? "bg-amber-500"
                  : "bg-slate-300"
              }`}
            />
          </div>
          {item.chipUid && (
            <p className="text-xs text-slate-500 font-mono mt-2 mb-3 break-all">UID: {item.chipUid}</p>
          )}
          {item.chipStatus === "unpaired" ? (
            <button
              onClick={async () => {
                const mockUid = "CHIP-" + Math.random().toString(36).slice(2, 10).toUpperCase();
                if (!confirm(`Simulerer chip-skann.\nUID: ${mockUid}\n\nPare med ${item.name}?`)) return;
                try {
                  const updated = await chip.pair(item.id, mockUid);
                  setItem(updated);
                  toast.success("Chip paret");
                } catch (err: any) {
                  toast.error(err.message || "Kunne ikke pare");
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
                  setItem(updated);
                  toast.info("Paring fjernet");
                } catch (err: any) {
                  toast.error(err.message || "Kunne ikke fjerne paring");
                }
              }}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition"
            >
              Fjern paring
            </button>
          )}
        </div>

        {/* Aktivitetslogg */}
        {events.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3">Aktivitetslogg</h3>
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-slate-600 text-[18px]">
                      {EVENT_ICON[ev.kind] || "circle"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 capitalize">
                      {ev.kind.replace(/_/g, " ")}
                    </p>
                    {ev.detail && <p className="text-xs text-slate-500 truncate">{ev.detail}</p>}
                    <p className="text-[10px] text-slate-400 mt-0.5">{timeAgo(ev.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Handlinger */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={toggleLost}
            className={`rounded-2xl py-4 px-4 flex flex-col items-center gap-2 shadow-sm border transition ${
              isMissing
                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
            }`}
          >
            <span className="material-symbols-outlined">
              {isMissing ? "check_circle" : "location_off"}
            </span>
            <span className="text-xs font-bold">{isMissing ? "Marker som funnet" : "Marker som savnet"}</span>
          </button>
          <button
            onClick={removeItem}
            className="bg-white border border-slate-200 text-slate-700 rounded-2xl py-4 px-4 flex flex-col items-center gap-2 shadow-sm hover:bg-slate-50 transition"
          >
            <span className="material-symbols-outlined">delete</span>
            <span className="text-xs font-bold">Slett gjenstand</span>
          </button>
        </div>
      </main>
    </>
  );
}

function DetailRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: string;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-slate-500 text-[18px]">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
        <p className={`text-slate-900 font-semibold text-sm truncate ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}
