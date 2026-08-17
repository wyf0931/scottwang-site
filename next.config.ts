import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true, remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }] },
  turbopack: { root: process.cwd() },
};

export default nextConfig;
