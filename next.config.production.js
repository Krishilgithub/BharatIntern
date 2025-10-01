/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production configuration for Render deployment
  output: "export",
  trailingSlash: true,
  distDir: "build",

  images: {
    unoptimized: true,
    domains: ["localhost", "bharatintern-backend.onrender.com", "onrender.com"],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://bharatintern-backend.onrender.com",
  },

  // Disable server-side features for static export
  experimental: {
    esmExternals: false,
  },

  // Webpack configuration for production
  webpack: (config, { isServer }) => {
    // Exclude problematic files from build
    config.module.rules.push({
      test: /\.(backup|old)\.(js|jsx|ts|tsx)$/,
      use: "ignore-loader",
    });

    // Handle static export
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Skip problematic rewrites for static export
  async rewrites() {
    return [];
  },

  // Skip redirects for static export
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;
