"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "./Logo";
import { notifications as notificationsApi, getToken } from "../lib/api";

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
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
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
        )}
      </div>
    </motion.header>
  );
}
