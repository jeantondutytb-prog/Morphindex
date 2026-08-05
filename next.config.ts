import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  serverExternalPackages: ["@napi-rs/canvas", "sharp"],
  experimental: {
    viewTransition: true,
  },
  async rewrites() {
    // Stripe n'accepte pas les redirections 308 — réécriture interne sans slash final.
    return [{ source: "/api/stripe/webhook", destination: "/api/stripe/webhook/" }];
  },
};

export default nextConfig;
