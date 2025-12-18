import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // For VPS deployment
  serverExternalPackages: ['mongoose']
};

export default nextConfig;
