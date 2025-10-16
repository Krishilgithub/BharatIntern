/** @type {import('next').NextConfig} */
const nextConfig = {
  // For Vercel deployment - do NOT use static export
  // Vercel handles Next.js deployments automatically
  
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

    // Fix for canvas module (if using pdf rendering)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
      };
    }

    return config;
  },
};

module.exports = nextConfig;
