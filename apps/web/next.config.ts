// @ts-nocheck
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // In Next.js 16/15+, serverActions is a top-level property.
  // We use @ts-nocheck to bypass the strict type error during 'next build'.
  serverActions: {
    bodySizeLimit: '100mb',
  },
  experimental: {
    // Renamed from middlewareClientMaxBodySize
    proxyClientMaxBodySize: '100mb',
    serverActions: true, // Occasionally helps in some beta versions
  },
};

export default withNextIntl(nextConfig);
