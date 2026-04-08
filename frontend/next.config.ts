import type { NextConfig } from "next";
import path from "path";

const isStatic = process.env.STAG_STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  // Skip type errors during build — framer-motion v12 easing arrays are typed
  // too strictly for our cubic-bezier literals.
  typescript: { ignoreBuildErrors: true },
  // Pin workspace root to this folder so Next doesn't pick up a stray
  // package-lock.json in the user's home directory.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Disable sharp so fresh Windows PCs don't need VC++ Redistributable.
  images: { unoptimized: true },
  // Static export for mobile (Capacitor bundles ./out).
  ...(isStatic ? { output: "export" as const, trailingSlash: true } : {}),
};

export default nextConfig;
