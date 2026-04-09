"use client";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { notifications as notificationsApi, getToken, auth as authApi } from "../lib/api";
import { useTranslation, LOCALE_FLAGS, LOCALE_NAMES, Locale } from "../lib/i18n";

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  rightIcon?: string;
  onRightClick?: () => void;
  /** Når satt skjuler vi default-bjellen og bruker denne i stedet */
  rightSlot?: React.ReactNode;
}

export default function TopBar({
  showBack = false,
  title,
  rightIcon,
  onRightClick,
  rightSlot,
}: TopBarProps) {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const { locale, setLocale } = useTranslation();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Lukk dropdown ved klikk utenfor
  useEffect(() => {
    if (!langOpen) return;
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [langOpen]);

  // Poll unread-count hver 60s når innlogget
  useEffect(() => {
    if (rightSlot || rightIcon || onRightClick) return; // custom slot — ikke hent bjelle
    if (!getToken()) return;
    let cancelled = false;
    const load = async () => {
      try {
        const { count } = await notificationsApi.unreadCount();
        if (!cancelled) setUnread(count);
      } catch {
        /* stille */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [rightSlot, rightIcon, onRightClick]);

  const showCustomBtn = !!rightIcon || !!onRightClick;
  const showBell = !rightSlot && !showCustomBtn;

  return (
    <header
      className="fixed top-0 w-full z-50 glass border-b border-slate-100"
    >
      <div className="flex items-center justify-between px-6 h-16 w-full max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          {showBack && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => router.back()}
              className="hover:bg-slate-100 p-2 rounded-full transition-colors"
              aria-label="Tilbake"
            >
              <span className="material-symbols-outlined text-slate-900">arrow_back</span>
            </motion.button>
          )}
          <Logo size={36} />
          {title && (
            <h1 className="font-bold text-lg text-slate-900 tracking-tight ml-1">{title}</h1>
          )}
        </div>

        {rightSlot}

        {showCustomBtn && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={onRightClick}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
            aria-label={rightIcon || "action"}
          >
            <span className="material-symbols-outlined">{rightIcon || "more_vert"}</span>
          </motion.button>
        )}

        {showBell && (
          <div className="flex items-center gap-1">
            {/* Språkvelger */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors text-base leading-none"
                aria-label="Velg språk"
              >
                {LOCALE_FLAGS[locale]}
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 py-1 min-w-[160px] z-[200]"
                  >
                    {(Object.keys(LOCALE_NAMES) as Locale[]).map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          setLocale(code);
                          authApi.updateProfile({ language: code }).catch(() => {});
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                          locale === code
                            ? "font-bold text-[#0f2a5c] bg-slate-50"
                            : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span>{LOCALE_FLAGS[code]}</span>
                        {LOCALE_NAMES[code]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/varsler"
              className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Varsler"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unread > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <Link
              href="/innstillinger"
              className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Innstillinger"
            >
              <span className="material-symbols-outlined">settings</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
