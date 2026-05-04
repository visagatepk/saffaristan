/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // ── Unsplash — article cover images ─────────────────────────────────
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // ── Supabase Storage — avatars, service images ───────────────────────
      {
        protocol: 'https',
        hostname: 'kwwgundgdznlzssyosxl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // ── Google profile pictures (OAuth login) ────────────────────────────
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // ── UI Avatars fallback ──────────────────────────────────────────────
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
}

module.exports = nextConfig