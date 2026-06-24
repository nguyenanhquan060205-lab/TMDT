import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kích hoạt standalone output cho Docker (giúp tạo thư mục .next/standalone)
  output: 'standalone',

  allowedDevOrigins: ['26.20.148.36', 'localhost:3000'],

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // Dùng biến môi trường: khi chạy Docker hoặc deploy sẽ set biến này
        // - Docker: API_URL=http://backend:5000/api (nhờ docker-compose DNS)
        // - Vercel: set trong Env Variables trên dashboard
        // - Local: NEXT_PUBLIC_API_URL=http://localhost:5000/api (trong .env.local)
        destination: `${process.env.API_URL || 'http://localhost:5000/api'}/:path*`,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
