/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['socket.io', 'socket.io-client']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fallbacks pour les modules Node.js côté client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        path: false,
        os: false,
        util: false,
      };
      
      // Exclure Socket.IO du bundle client
      config.externals.push({
        'socket.io': 'commonjs socket.io',
      });
    }
    return config;
  },
};

module.exports = nextConfig;