"use client";
import Image from "next/image";
import { motion } from "framer-motion";

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  animated?: boolean;
}

export default function Logo({ size = 48, showWordmark = false, className = "", animated = false }: LogoProps) {
  const logoEl = (
    <Image
      src="/logo.png"
      alt="S-TAG logo"
      width={size}
      height={size}
      priority
      className="object-contain"
    />
  );

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {animated ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {logoEl}
        </motion.div>
      ) : (
        logoEl
      )}
      {showWordmark && (
        <span className="s-tag-wordmark text-xl">
          S<span className="accent">-</span>TAG
        </span>
      )}
    </div>
  );
}
