/** @type {import('next').NextConfig} */
const nextConfig = {
  // Production configuration for Render deployment
  output: "export",
  trailingSlash: true,
  // Use default .next dir during build; export outputs to 'out'

  images: {
    unoptimized: true,
    domains: ["localhost", "bharatintern-backend.onrender.com", "onrender.com"],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://bharatintern-backend.onrender.com",
  },
  // Specify custom pages directory to avoid conflicts with src/pages
  pageExtensions: ["js", "jsx"],

  // Ensure proper page resolution
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { isServer }) => {
    // Exclude backup and old files from build
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
  // Use default SWC transformer for better performance
  swcMinify: true,
  // Skip build-time pre-rendering for pages with context issues
};

module.exports = nextConfig;
