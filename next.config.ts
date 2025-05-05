import { config } from 'dotenv'
// Load environment variables from .env file
config()

// Dynamically import Sentry if available
let withSentryConfig: any = (config: any) => config;
try {
  withSentryConfig = require('@sentry/nextjs').withSentryConfig;
} catch (e) {
  console.log('Sentry not installed, skipping Sentry integration');
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: true,
  },
  images: {
    domains: ['res.cloudinary.com', 'source.unsplash.com'],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
}

// For Sentry
const sentryWebpackPluginOptions = {
  silent: true,
  dryRun: process.env.NODE_ENV !== 'production',
}

// Apply all the plugins
export default withBundleAnalyzer(
  withSentryConfig(nextConfig, sentryWebpackPluginOptions)
)
