/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // الصور تتحمّل مباشرة من السيرفر بدون معالجة على سيرفر Next.js
    // (المعالجة كانت بتعمل 504 لأن جدار الحماية بيحجب طلبات السيرفر المتلاحقة)
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'admin.tix-eg.com' },
      { protocol: 'https', hostname: 'api.tix-eg.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ]
  },

  compress: true,
  output: 'standalone',
}

export default nextConfig
