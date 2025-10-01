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
	webpack: (config, { isServer }) => {
		// Exclude backup and old files from build
		config.module.rules.push({
			test: /\.(backup|old)\.(js|jsx|ts|tsx)$/,
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
	// Experimental feature to handle build issues
	experimental: {
		forceSwcTransforms: false,
	},
};

module.exports = nextConfig;
