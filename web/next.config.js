/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'placehold.co', 'via.placeholder.com', 'placekitten.com', 'onchainhub.io'],
  },
  // Configure static file serving
  async headers() {
    return [
      {
        source: '/config.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  // Add rewrites for development environment only
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/:path*',
        },
      ];
    }
    return [];
  },
}

module.exports = nextConfig
