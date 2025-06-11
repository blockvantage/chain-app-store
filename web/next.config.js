// In Docker, we'll use environment variables
const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

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
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
