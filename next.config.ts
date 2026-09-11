import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling Node.js built-ins used in lib/ modules
  // (child_process, fs, path) — these must run server-side only.
  serverExternalPackages: ["child_process", "fs"],

  experimental: {
    // Allow larger payloads on API routes (videos uploaded as form-data if ever needed)
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
