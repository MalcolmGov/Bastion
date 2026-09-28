import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@libsql/client', 'libsql'],
  outputFileTracingIncludes: {
    '/**': ['./studio.db', './src/lib/db/schema.sql', './src/content/**/*'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.goldfields.com',
      },
    ],
  },
};

export default nextConfig;
