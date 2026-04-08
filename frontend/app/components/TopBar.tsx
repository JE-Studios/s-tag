"use client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Logo from "./Logo";

interface TopBarProps {
  showBack?: boolean;
  title?: string;
  rightIcon?: string;
  onRightClick?: () => void;
}

export default function TopBar({ showBack = false, title, rightIcon = "notifications", onRightClick }: TopBarProps) {
  const router = useRouter();

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
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onRightClick}
          className="p-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
          aria-label={rightIcon}
        >
          <span className="material-symbols-outlined">{rightIcon}</span>
        </motion.button>
      </div>
    </motion.header>
  );
}
