/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // CETTE PARTIE EST VITALE POUR O2SWITCH
  experimental: {
    serverActions: {
      allowedOrigins: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [],
    },
  },
  async redirects() {
    return [
      {
        source: '/register',
        destination: '/catalogue',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/admin/profile',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;