/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'placehold.co', 'via.placeholder.com', 'placekitten.com'],
  },
  // Add rewrites for API requests
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL || 'http://backend:8080/:path*',
      },
    ];
  },
}

module.exports = nextConfig
