import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // reactCompiler: true, // Disabled due to HMR infinite loop issues

  // Add empty turbopack config to silence the warning
  turbopack: {},
};

export default nextConfig;
