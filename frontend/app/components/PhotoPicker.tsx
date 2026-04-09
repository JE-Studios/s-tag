"use client";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const MAX_SIZE_PX = 1200;
const JPEG_QUALITY = 0.75;
const MAX_BYTES = 800_000; // ~800 KB base64

/**
 * Compresses an image file to a JPEG base64 data-URL.
 * Resizes to max MAX_SIZE_PX on the longest edge and uses JPEG_QUALITY.
 */
function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > MAX_SIZE_PX || height > MAX_SIZE_PX) {
        const ratio = Math.min(MAX_SIZE_PX / width, MAX_SIZE_PX / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality if too large
      let quality = JPEG_QUALITY;
      let dataUrl = canvas.toDataURL("image/jpeg", quality);
      while (dataUrl.length > MAX_BYTES && quality > 0.3) {
        quality -= 0.1;
        dataUrl = canvas.toDataURL("image/jpeg", quality);
      }
      resolve(dataUrl);
    };
    img.onerror = () => reject(new Error("Kunne ikke lese bildet"));
    img.src = URL.createObjectURL(file);
  });
}

type Props = {
  value: string;
  onChange: (dataUrl: string) => void;
};

export default function PhotoPicker({ value, onChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError("Kun bildefiler er støttet");
        return;
      }
      if (file.size > 20_000_000) {
        setError("Bildet er for stort (maks 20 MB)");
        return;
      }
      setError(null);
      setLoading(true);
      try {
        const dataUrl = await compressImage(file);
        onChange(dataUrl);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Kunne ikke lese bildet");
      } finally {
        setLoading(false);
      }
    },
    [onChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0]);
    // Reset so same file can be picked again
    e.target.value = "";
  };

  const remove = () => {
    onChange("");
    setError(null);
  };

  return (
    <div>
      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5">
        Bilde
      </span>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-50"
          >
            <Image
              src={value}
              alt="Bilde av gjenstanden"
              width={600}
              height={400}
              className="w-full h-48 object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex-1 py-2 rounded-xl bg-white/90 backdrop-blur text-slate-900 text-xs font-bold hover:bg-white transition flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">photo_camera</span>
                Bytt bilde
              </button>
              <button
                type="button"
                onClick={remove}
                className="px-4 py-2 rounded-xl bg-red-500/90 backdrop-blur text-white text-xs font-bold hover:bg-red-600 transition flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="picker"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:border-[#0f2a5c]/30 hover:bg-slate-100 transition disabled:opacity-50"
          >
            {loading ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="material-symbols-outlined text-3xl text-slate-400"
              >
                progress_activity
              </motion.span>
            ) : (
              <>
                <span
                  className="material-symbols-outlined text-3xl text-[#0f2a5c]/40"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  add_a_photo
                </span>
                <span className="text-xs font-bold text-slate-500">
                  Ta bilde eller velg fra galleri
                </span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}
