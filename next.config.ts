import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/', // Match the root URL
        destination: '/main.html', // Serve the static HTML file
      },
    ];
  },
};

export default nextConfig;
