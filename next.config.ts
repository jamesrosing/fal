import type { NextConfig } from "next";

const config: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb'
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fal.media'
      },
      {
        protocol: 'https',
        hostname: '**.fal.run',
      },
      {
        protocol: 'https',
        hostname: '**.blob.vercel-storage.com',
      }
    ]
  }
};

export default config;
