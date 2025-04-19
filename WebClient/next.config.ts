import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // devIndicators: false, // disable the default Next.js dev indicators
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"],
  },
};

export default nextConfig;
