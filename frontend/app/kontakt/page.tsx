"use client";
import { motion } from "framer-motion";
import TopBar from "../components/TopBar";
import { useAuth } from "../lib/auth-context";

const insurers = [
  { name: "If Skadeforsikring", tagline: "Trygghet i hverdagen", logo: "If" },
  { name: "Gjensidige", tagline: "Tiden går. Vi består.", logo: "Gj" },
  { name: "Tryg", tagline: "Det handler om å være trygg", logo: "Tryg", color: "#d30f1d" },
  { name: "Storebrand", tagline: "Fremtiden din er her", logo: "St" },
  { name: "Fremtind", tagline: "Smart og enkel forsikring", logo: "Fr" },
  { name: "Codan", tagline: "Vi bryr oss", logo: "Co" },
];

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function KontaktPage() {
  const { user, logout } = useAuth();
  return (
    <>
      <TopBar showBack title="Profil" />
      <main className="pt-28 pb-40 px-6 max-w-2xl mx-auto">
        {user && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[#0f2a5c] text-white font-black text-2xl flex items-center justify-center">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-black text-xl text-slate-900 truncate">{user.name}</h2>
                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                  {user.plan === "free" ? "Gratis" : "Premium"}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition"
            >
              Logg ut
            </button>
          </motion.section>
        )}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="font-extrabold text-4xl text-slate-900 leading-tight mb-4 tracking-tight">
            Har du opplevd et tap?
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            Vi har samlet de viktigste ressursene for å hjelpe deg med å sikre dine verdier eller melde om skade og
            tyveri gjennom <span className="font-bold text-slate-900">S-TAG</span>.
          </p>
        </motion.section>

        {/* Politiet */}
        <motion.section
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl p-8 relative overflow-hidden border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0f2a5c]/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#0f2a5c] text-2xl">policy</span>
              </div>
              <h2 className="font-bold text-2xl text-slate-900">Politiet</h2>
            </div>
            <p className="text-slate-600 mb-8 max-w-md leading-relaxed">
              Ved tyveri eller hærverk bør du kontakte politiet umiddelbart. Du kan anmelde de fleste forhold digitalt.
            </p>
            <motion.a
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              href="https://www.politiet.no"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between w-full bg-white text-slate-900 px-8 py-5 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all border border-slate-200 shadow-sm"
            >
              <span>Anmeld på Politiet.no</span>
              <span className="material-symbols-outlined">open_in_new</span>
            </motion.a>
          </div>
        </motion.section>

        {/* Insurers */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-bold text-2xl text-slate-900 mb-1">Forsikringsselskaper</h2>
              <p className="text-slate-500 text-sm font-medium">Meld skade direkte til ditt selskap</p>
            </div>
            <span className="material-symbols-outlined text-slate-400">shield_with_heart</span>
          </div>

          <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 gap-4">
            {insurers.map((ins) => (
              <motion.div
                key={ins.name}
                variants={item}
                whileHover={{ y: -2 }}
                className="bg-slate-50 p-5 rounded-2xl flex items-center justify-between border border-slate-200 hover:bg-white hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black text-slate-900 text-sm border border-slate-200" style={{ color: ins.color }}>
                    {ins.logo}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{ins.name}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ins.tagline}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#0f2a5c] text-white px-5 py-2.5 rounded-lg font-bold text-xs hover:bg-[#1e40af] transition-colors"
                >
                  Meld skade
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
    </>
  );
}
