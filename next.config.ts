import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  serverExternalPackages: ["@napi-rs/canvas", "sharp"],
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
