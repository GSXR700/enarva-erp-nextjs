/** @type {import('next').NextConfig} */
const nextConfig = {
  // AJOUTER CETTE SECTION
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'files.edgestore.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;