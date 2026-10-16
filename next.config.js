/** @type {import('next').NextConfig} */
const nextConfig = {
  // Without this, Next.js's webpack bundling can mishandle sharp's native
  // binary when building the serverless function for Vercel - it works
  // perfectly locally (where sharp runs directly from node_modules) but
  // silently fails at runtime once deployed, because the binary either
  // doesn't get included in the function bundle correctly or gets bundled
  // in a way it can't load from. Marking it as an external package tells
  // Next.js to leave it alone and let Node require it normally instead.
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  images: {
    formats: ['image/webp'],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'inline',
    minimumCacheTTL: 31536000, // uploaded images never change, so cache them for a year
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
  },
  async headers() {
    return [
      {
        // Locally-stored uploads are filenamed with a timestamp + random
        // suffix, so they're effectively immutable - safe to cache hard.
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
