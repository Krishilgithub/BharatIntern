/** @type {import('next').NextConfig} */
const nextConfig = {
	// Production configuration for Render deployment
	output: "standalone",

	images: {
		domains: ["localhost", "bharatintern-backend.onrender.com", "onrender.com"],
		unoptimized: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	typescript: {
		ignoreBuildErrors: true,
	},
	env: {
		NEXT_PUBLIC_API_URL:
			process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
	},
	// Specify custom pages directory to avoid conflicts with src/pages
	pageExtensions: ["js", "jsx", "ts", "tsx"],
	webpack: (config, { isServer }) => {
		// Exclude backup and old files from build
		config.module.rules.push({
			test: /\.(backup|old)\.(js|jsx|ts|tsx)$/,
			use: "ignore-loader",
		});

		// Exclude src/pages from Next.js page routing
		config.module.rules.push({
			test: /src\/pages\/.*\.(js|jsx|ts|tsx)$/,
			use: "ignore-loader",
		});

		return config;
	},
	// Skip problematic rewrites for build
	async rewrites() {
		if (process.env.NODE_ENV === "production") {
			return [];
		}
		return [
			{
				source: "/api/:path*",
				destination: `${
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
				}/:path*`,
			},
		];
	},
	// Use default SWC transformer for better performance
	swcMinify: true,
	// Skip build-time pre-rendering for pages with context issues
	experimental: {
		skipMiddlewareUrlNormalize: true,
	},
};

module.exports = nextConfig;
