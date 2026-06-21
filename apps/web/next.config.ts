import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // In production, proxy /api/* → Render via Vercel's edge (same-origin, no CORS).
    // In development, direct calls are used instead (see API_BASE_URL in constants).
    if (process.env.NODE_ENV !== "production") return [];
    const renderUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!renderUrl) return [];
    return [
      {
        source: "/api/:path*",
        destination: `${renderUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
