// @ts-nocheck
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  experimental: {
    // Renamed from middlewareClientMaxBodySize
    proxyClientMaxBodySize: '100mb',
  }
};

const finalConfig = withNextIntl(nextConfig);

// Force top-level properties for Next.js 15/16+
finalConfig.serverActions = {
  bodySizeLimit: '100mb',
};

export default finalConfig;
