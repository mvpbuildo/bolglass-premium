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
    proxyClientMaxBodySize: '10mb',
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default withNextIntl(nextConfig);
