const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
    ],
  },
  allowedDevOrigins: [
    '3000-firebase-thin-wallet-1754708969246.cluster-aj77uug3sjd4iut4ev6a4jbtf2.cloudworkstations.dev'
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'dotenv': require.resolve('./stubs/empty-dotenv.js'),
        'fs': require.resolve('./stubs/empty-fs.js'),
      };
    }
    return config;
  },
};

module.exports = nextConfig;