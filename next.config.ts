import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // Disabled to prevent Turbopack panic
    // turbopackFileSystemCacheForDev: true,
  }
};

export default nextConfig;