"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import TopBar from "../components/TopBar";
import { useAuth } from "../lib/auth-context";
import { stats as statsApi, Stats } from "../lib/api";

const tiles = [
  { href: "/sporing", label: "Sporing", sub: "Live posisjoner", icon: "location_on" },
  { href: "/kartotek", label: "Kartotek", sub: "Registrerte eiendeler", icon: "inventory_2" },
  { href: "/varsler", label: "Varsler", sub: "Oppdateringer", icon: "notifications" },
  { href: "/eierskifte", label: "Eierskifte", sub: "Overfør eierskap", icon: "swap_horiz" },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const itemAnim: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "God natt";
  if (h < 11) return "God morgen";
  if (h < 17) return "God dag";
  if (h < 22) return "God kveld";
  return "God natt";
}

function formatKr(n: number) {
  return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 }).format(n);
}

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!user) return;
    statsApi
      .me()
      .then(setStats)
      .catch(() => setStats(null));
  }, [user]);

  const firstName = user?.name.split(" ")[0] || "";
  const hasItems = stats && stats.total > 0;
  const allSecured = stats && stats.total > 0 && stats.missing === 0;

  return (
    <>
      <TopBar />
      <main className="flex-grow pt-28 pb-32 px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mb-8 text-center"
        >
          <motion.div
            className="mx-auto mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <motion.div
              animate={{
                y: [0, -5, 0, -3, 0],
                rotateZ: [0, -0.8, 0.8, -0.4, 0],
                scale: [1, 1.015, 1, 1.008, 1],
              }}
              transition={{
                duration: 6,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
              }}
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={180}
                height={130}
                priority
                className="object-contain mx-auto drop-shadow-sm"
              />
            </motion.div>
          </motion.div>
          {user ? (
            <>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                {greeting()}
              </p>
              <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight mt-1">
                {firstName}
              </h1>
            </>
          ) : (
            <p className="text-slate-500 text-sm font-medium tracking-wide">
              Sikring · Sporing · Eierskifte
            </p>
          )}
        </motion.div>

        {/* Personalisert stats-kort */}
        {user && stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-md mb-8 bg-gradient-to-br from-[#0a1e3d] via-[#0f2a5c] to-[#132f5e] text-white rounded-3xl p-6 shadow-xl shadow-[#0a1e3d]/30"
          >
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Din oversikt
                </p>
                <p className="text-4xl font-extrabold tracking-tight mt-1">{stats.total}</p>
                <p className="text-white/70 text-xs font-medium">
                  {stats.total === 1 ? "registrert gjenstand" : "registrerte gjenstander"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  Samlet verdi
                </p>
                <p className="text-xl font-extrabold mt-1">
                  {stats.totalValueNok > 0 ? `${formatKr(stats.totalValueNok)} kr` : "—"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/10">
              <StatMini label="Sikret" value={stats.secured} tone="ok" />
              <StatMini label="Savnet" value={stats.missing} tone={stats.missing > 0 ? "warn" : "ok"} />
              <StatMini label="S-TAG aktiv" value={stats.chipActive} tone="ok" />
            </div>
          </motion.div>
        )}

        {/* Tomt kartotek → onboarding-CTA */}
        {user && stats && !hasItems && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-md mb-8"
          >
            <Link
              href="/kartotek/ny"
              className="block bg-white border-2 border-dashed border-[#0f2a5c]/20 rounded-3xl p-6 text-center hover:border-[#0f2a5c]/50 transition"
            >
              <span className="material-symbols-outlined text-5xl text-[#0f2a5c]">add_circle</span>
              <h3 className="font-extrabold text-xl text-slate-900 mt-2">Registrer din første gjenstand</h3>
              <p className="text-slate-500 text-sm mt-1">Start med å legge til noe du vil sikre.</p>
            </Link>
          </motion.div>
        )}

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-md grid grid-cols-2 gap-5"
        >
          {tiles.map((tile) => (
            <motion.div key={tile.label} variants={itemAnim}>
              <Link
                href={tile.href}
                className="aspect-square bg-slate-50 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 group transition-all duration-300 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:bg-white hover:border-[#0f2a5c]/20"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 3 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-16 h-16 flex items-center justify-center bg-white rounded-full border border-slate-100 group-hover:bg-[#0f2a5c] transition-colors duration-300"
                >
                  <span
                    className="material-symbols-outlined text-[#0f2a5c] text-3xl group-hover:text-white transition-colors duration-300"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    {tile.icon}
                  </span>
                </motion.div>
                <div className="text-center flex flex-col items-center">
                  <span className="block text-slate-900 font-bold text-lg tracking-tight leading-tight">
                    {tile.label}
                  </span>
                  <span className="text-slate-500 text-[10px] font-medium mt-1 uppercase tracking-wider">
                    {tile.sub}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {user && hasItems && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md mt-10"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 border border-slate-200 shadow-sm group hover:shadow-lg transition-all">
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${
                    allSecured
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  ● {allSecured ? "Alle sikret" : `${stats!.missing} savnet`}
                </span>
                <span className="text-slate-500 text-xs">Live</span>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-4 font-medium">
                {allSecured
                  ? `Alle dine ${stats!.total} registrerte eiendeler er verifisert og sikret i det nasjonale registeret.`
                  : `${stats!.missing} av ${stats!.total} eiendeler er markert som savnet. Sjekk Kartoteket for detaljer.`}
              </p>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-grow bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stats!.secured / Math.max(stats!.total, 1)) * 100}%` }}
                    transition={{ duration: 1.4, delay: 0.9, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#0a1e3d] to-[#0f2a5c] rounded-full"
                  />
                </div>
                <span className="text-[#0f2a5c] text-[10px] font-bold tracking-widest">
                  {Math.round((stats!.secured / Math.max(stats!.total, 1)) * 100)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </>
  );
}

function StatMini({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" }) {
  return (
    <div className="text-center">
      <p
        className={`text-2xl font-extrabold ${
          tone === "warn" ? "text-red-300" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="text-[10px] text-white/60 font-bold uppercase tracking-wider">{label}</p>
    </div>
  );
}
