"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const tabs = [
  { href: "/hjem", label: "Hjem", icon: "home" },
  { href: "/kartotek", label: "Register", icon: "inventory_2" },
  { href: "/sporing", label: "Søk", icon: "search" },
  { href: "/kontakt", label: "Profil", icon: "person" },
];

const HIDDEN_ROUTES = ["/", "/logg-inn", "/registrer"];

export default function BottomNav() {
  const pathname = usePathname();

  if (HIDDEN_ROUTES.includes(pathname)) return null;

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed bottom-0 left-0 w-full z-[100] flex justify-around items-center px-4 pt-3 pb-8 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href || (tab.href !== "/hjem" && pathname.startsWith(tab.href));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex flex-col items-center justify-center px-5 py-2 group relative"
          >
            {active && (
              <motion.div
                layoutId="active-tab-pill"
                className="absolute inset-0 bg-slate-900/5 rounded-2xl"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <motion.span
              animate={{ scale: active ? 1.05 : 1, y: active ? -2 : 0 }}
              className={`material-symbols-outlined text-2xl relative z-10 transition-colors ${
                active ? "text-[#0f2a5c]" : "text-slate-400 group-hover:text-slate-700"
              }`}
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
            >
              {tab.icon}
            </motion.span>
            <span
              className={`text-[10px] tracking-widest mt-1 uppercase relative z-10 transition-colors ${
                active ? "text-[#0f2a5c] font-bold" : "text-slate-400 font-medium group-hover:text-slate-700"
              }`}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </motion.nav>
  );
}
