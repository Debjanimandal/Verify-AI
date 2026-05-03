import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Suppress the NEXT_PUBLIC_BACKEND_URL warning at build time when not set
  // (it will be set via Vercel environment variables in production)
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL ?? "",
  },

  // Recommended for Vercel deployments
  poweredByHeader: false,

  // Allow cross-origin requests from the backend in development
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;
