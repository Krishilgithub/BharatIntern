/**
 * Configuration manager for BharatIntern AI Platform
 * Handles environment variables and service configurations
 */

require("dotenv").config();

const config = {
	// Server configuration
	server: {
		port: process.env.PORT || 5000,
		env: process.env.NODE_ENV || "development",
		corsOrigin: process.env.FRONTEND_URL || "http://localhost:3000",
	},

	// Database configuration
	database: {
		mongodb: {
			uri: process.env.MONGODB_URI || "mongodb://localhost:27017/bharatintern",
			options: {
				useNewUrlParser: true,
				useUnifiedTopology: true,
			},
		},
		redis: {
			host: process.env.REDIS_HOST || "localhost",
			port: process.env.REDIS_PORT || 6379,
			password: process.env.REDIS_PASSWORD,
			ttl: 3600, // 1 hour default TTL
		},
	},

	// AI Service configurations
	ai: {
		// Gemini AI configuration
		gemini: {
			apiKey: process.env.GEMINI_API_KEY,
			model: "gemini-pro",
			maxTokens: 8192,
			temperature: 0.7,
			enabled: !!process.env.GEMINI_API_KEY,
		},

		// OpenAI configuration
		openai: {
			apiKey: process.env.OPENAI_API_KEY,
			model: "gpt-3.5-turbo",
			maxTokens: 4096,
			temperature: 0.7,
			enabled: !!process.env.OPENAI_API_KEY,
		},

		// Hugging Face configuration
		huggingface: {
			apiKey: process.env.HUGGINGFACE_API_KEY,
			apiUrl: "https://api-inference.huggingface.co/models",
			models: {
				textGeneration: "microsoft/DialoGPT-medium",
				sentenceTransformer: "sentence-transformers/all-MiniLM-L6-v2",
				questionAnswering: "deepset/roberta-base-squad2",
				textClassification: "cardiffnlp/twitter-roberta-base-sentiment-latest",
				speechToText: "openai/whisper-small",
				resumeParser: "microsoft/DialoGPT-medium",
			},
			enabled: true, // Always enabled as fallback
		},

		// LangChain configuration
		langchain: {
			verbose: process.env.NODE_ENV === "development",
			callbacks: true,
			cache: true,
		},
	},

	// File handling configuration
	files: {
		upload: {
			maxSize: 10 * 1024 * 1024, // 10MB
			allowedTypes: {
				resume: [".pdf", ".docx", ".doc", ".txt"],
				audio: [".mp3", ".wav", ".m4a", ".ogg"],
				image: [".jpg", ".jpeg", ".png", ".webp"],
			},
			destination: "./uploads/",
		},
		storage: {
			temp: "./temp/",
			processed: "./processed/",
			generated: "./generated/",
		},
	},

	// Security configuration
	security: {
		jwtSecret: process.env.JWT_SECRET || "bharatintern-secret-key-2024",
		jwtExpiry: "24h",
		bcryptRounds: 12,
		apiKeyHeader: "x-api-key",
		rateLimitWindow: 15 * 60 * 1000, // 15 minutes
		rateLimitMax: 100,
	},

	// Assessment configuration
	assessment: {
		types: {
			skill: { duration: 30, questions: 20 },
			psychometric: { duration: 45, questions: 50 },
			behavioral: { duration: 25, questions: 15 },
			technical: { duration: 60, questions: 30 },
			coding: { duration: 90, questions: 5 },
			voice: { duration: 20, questions: 10 },
		},
		scoring: {
			passThreshold: 70,
			excellentThreshold: 90,
			weights: {
				technical: 0.4,
				behavioral: 0.3,
				communication: 0.3,
			},
		},
	},

	// Job matching configuration
	jobMatching: {
		similarity: {
			threshold: 0.6,
			skillWeight: 0.4,
			experienceWeight: 0.3,
			locationWeight: 0.2,
			educationWeight: 0.1,
		},
		cache: {
			ttl: 1800, // 30 minutes
			maxEntries: 1000,
		},
	},

	// Coding profile platforms
	codingPlatforms: {
		github: {
			apiUrl: "https://api.github.com",
			rateLimit: 5000, // per hour
		},
		leetcode: {
			apiUrl: "https://leetcode.com/api",
			graphqlUrl: "https://leetcode.com/graphql",
		},
		hackerrank: {
			apiUrl: "https://www.hackerrank.com/rest",
		},
	},

	// Logging configuration
	logging: {
		level: process.env.LOG_LEVEL || "info",
		format: "json",
		destination: "./logs/",
		maxFiles: 10,
		maxSize: "10m",
	},
};

// Validation function
const validateConfig = () => {
	const required = ["server.port", "security.jwtSecret"];

	const missing = required.filter((path) => {
		const keys = path.split(".");
		let current = config;
		for (const key of keys) {
			if (!current[key]) return true;
			current = current[key];
		}
		return false;
	});

	if (missing.length > 0) {
		throw new Error(`Missing required configuration: ${missing.join(", ")}`);
	}

	// Warn about missing AI configurations
	if (!config.ai.gemini.enabled && !config.ai.openai.enabled) {
		console.warn(
			"⚠️  No premium AI services configured. Using Hugging Face models only."
		);
	}

	return true;
};

// Initialize configuration
validateConfig();

module.exports = config;
