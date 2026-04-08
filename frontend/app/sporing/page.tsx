"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import TopBar from "../components/TopBar";
import type { Item } from "./MapView";
import { items as itemsApi, API_BASE } from "../lib/api";
import { useToast } from "../components/Toast";
import { setGeoConsent } from "../lib/use-geolocation";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
      <motion.span
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.6, repeat: Infinity }}
        className="text-slate-400 text-sm font-medium tracking-wider"
      >
        LASTER KART…
      </motion.span>
    </div>
  ),
});

const statusMeta: Record<Item["status"], { label: string; color: string; bg: string; dot: string }> = {
  secured: { label: "Sikret", color: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
  missing: { label: "Savnet", color: "text-red-600", bg: "bg-red-50", dot: "bg-red-500" },
  inactive: { label: "Inaktiv", color: "text-slate-600", bg: "bg-slate-100", dot: "bg-slate-400" },
};

export default function SporingPage() {
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [address, setAddress] = useState<string>("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom?: number; nonce: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const goToMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      toast.error("Posisjonstjenester er ikke tilgjengelig på denne enheten");
      return;
    }
    setLocating(true);
    setSelectedId(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoConsent(true);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserPosition({ lat, lng });
        setFlyTo({ lat, lng, zoom: 16, nonce: Date.now() });
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Posisjon er avslått — aktiver det i innstillinger");
        } else {
          toast.error(err.message || "Kunne ikke hente posisjon");
        }
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 }
    );
  };

  useEffect(() => {
    itemsApi
      .list()
      .then((data) => setItems(data as Item[]))
      .catch(() => setItems([]))
      .finally(() => setLoaded(true));
  }, []);

  // Reverse-geocode whenever the selected item changes
  useEffect(() => {
    if (!selectedId) {
      setAddress("");
      return;
    }
    const item = items.find((i) => i.id === selectedId);
    if (!item) return;
    setLoadingAddress(true);
    fetch(`${API_BASE}/api/geocode?lat=${item.lat}&lng=${item.lng}`)
      .then((r) => r.json())
      .then((j) => {
        setAddress(j.display || "Ukjent adresse");
        setLoadingAddress(false);
      })
      .catch(() => {
        setAddress("Adresse ikke tilgjengelig");
        setLoadingAddress(false);
      });
  }, [selectedId, items]);

  const selected = items.find((i) => i.id === selectedId);

  return (
    <>
      <TopBar
        showBack
        title="Sporing"
        rightIcon="settings"
        onRightClick={() => router.push("/innstillinger")}
      />
      <main className="relative w-full">
        {/* Map fills viewport behind everything (fixed so it doesn't compete with body flex) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed inset-0 pt-16 pb-[90px] z-0"
        >
          <MapView
            items={items}
            selectedId={selectedId}
            onSelect={setSelectedId}
            flyTo={flyTo}
            userPosition={userPosition}
          />
        </motion.div>

        {/* Spacer so the page has height (keeps body layout happy) */}
        <div className="h-[100dvh]" aria-hidden />

        {/* Selected address pill (top, under topbar) */}
        <AnimatePresence>
          {selected && (
            <motion.div
              key={selected.id}
              initial={{ y: -30, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -30, opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="fixed top-20 left-4 right-4 z-40 max-w-md mx-auto"
            >
              <div className="glass border border-slate-200/60 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${statusMeta[selected.status].bg}`}>
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    location_on
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm truncate">{selected.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusMeta[selected.status].dot}`} />
                  </div>
                  <div className="text-xs text-slate-600 truncate">
                    {loadingAddress ? (
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.4, repeat: Infinity }}
                      >
                        Henter adresse…
                      </motion.span>
                    ) : (
                      address
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Lukk"
                >
                  <span className="material-symbols-outlined text-slate-500 text-[18px]">close</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* My location button — henter ekte GPS-posisjon og flyr kartet dit */}
        <motion.button
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={goToMyLocation}
          disabled={locating}
          aria-label="Vis min posisjon"
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 bg-[#0f2a5c] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-[#0f2a5c]/30 disabled:opacity-70"
        >
          <motion.span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
            animate={locating ? { rotate: 360 } : { rotate: 0 }}
            transition={locating ? { duration: 1.2, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
          >
            {locating ? "progress_activity" : "my_location"}
          </motion.span>
        </motion.button>

        {/* Bottom sheet — clickable list (fixed so BottomNav stays below) */}
        <motion.div
          initial={{ y: 200, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="fixed bottom-[100px] left-4 right-4 z-40 max-w-lg mx-auto"
        >
          <div className="glass p-4 rounded-2xl shadow-2xl border border-slate-200/60">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-bold text-base text-slate-900">Dine gjenstander</h3>
              <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-1 rounded-md border border-slate-200 uppercase tracking-wider">
                {items.length} aktive
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
              {items.map((item) => {
                const meta = statusMeta[item.status];
                const isActive = item.id === selectedId;
                return (
                  <motion.button
                    key={item.id}
                    layout
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setSelectedId(isActive ? null : item.id)}
                    className={`flex-shrink-0 snap-start w-[180px] text-left p-3 rounded-xl border transition-all ${
                      isActive
                        ? "bg-[#0f2a5c] text-white border-[#0f2a5c] shadow-lg shadow-[#0f2a5c]/30"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? "text-white/70" : meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className={`font-bold text-sm truncate ${isActive ? "text-white" : "text-slate-900"}`}>
                      {item.name}
                    </div>
                    <div className={`text-[10px] mt-0.5 truncate ${isActive ? "text-white/70" : "text-slate-500"}`}>
                      {item.lastSeen}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
