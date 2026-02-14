/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
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
