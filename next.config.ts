import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // Disabled to prevent Turbopack panic
    // turbopackFileSystemCacheForDev: true,
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ asta ignoră toate erorile TypeScript la build
  },
};

export default nextConfig;