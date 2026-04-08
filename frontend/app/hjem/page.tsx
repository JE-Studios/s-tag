"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import TopBar from "../components/TopBar";
import { useAuth } from "../lib/auth-context";

const tiles = [
  { href: "/sporing", label: "Sporing", sub: "Aktive enheter", icon: "location_on" },
  { href: "/kartotek", label: "Kartotek", sub: "Arkiv & historikk", icon: "inventory_2" },
  { href: "/kartotek", label: "Sikring", sub: "Status: Sikret", icon: "security" },
  { href: "/eierskifte", label: "Eierskifte", sub: "Overfør eierskap", icon: "swap_horiz" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomePage() {
  const { user } = useAuth();
  return (
    <>
      <TopBar />
      <main className="flex-grow pt-28 pb-32 px-6 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mb-10 text-center"
        >
          <motion.div
            className="float mx-auto mb-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={220}
              height={160}
              priority
              className="object-contain mx-auto"
            />
          </motion.div>
          <p className="text-slate-500 text-sm font-medium tracking-wide">
            Sikring · Sporing · Eierskifte
          </p>
          {user && (
            <p className="text-slate-900 text-lg font-bold tracking-tight mt-3">
              Velkommen, {user.name.split(" ")[0]}
            </p>
          )}
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full max-w-md grid grid-cols-2 gap-5"
        >
          {tiles.map((tile) => (
            <motion.div key={tile.label} variants={item}>
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

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mt-10"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 border border-slate-200 shadow-sm group hover:shadow-lg transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold tracking-widest uppercase">
                ● Live status
              </span>
              <span className="text-slate-500 text-xs">Akkurat nå</span>
            </div>
            <p className="text-slate-700 text-sm leading-relaxed mb-4 font-medium">
              Alle dine registrerte eiendeler er for øyeblikket verifisert og sikret i det nasjonale registeret.
            </p>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-grow bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.4, delay: 0.9, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#0f2a5c] to-[#2563eb] rounded-full"
                />
              </div>
              <span className="text-[#0f2a5c] text-[10px] font-bold tracking-widest">100%</span>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}
