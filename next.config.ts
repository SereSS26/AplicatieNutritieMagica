import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
<<<<<<< HEAD
    // Disabled to prevent Turbopack panic
    // turbopackFileSystemCacheForDev: true,
=======
    turbopackFileSystemCacheForDev: true,
>>>>>>> cf1ae22a259f9391ac1f0aa4377454bd986eaeaf
  }
};

export default nextConfig;