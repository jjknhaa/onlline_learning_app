/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Tells Next.js to generate static files into the 'out' folder
  images: {
    unoptimized: true, // Required for static exports & mobile wrappers
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;