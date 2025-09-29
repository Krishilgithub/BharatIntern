import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "/api";

// Create axios instance
const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// Add request interceptor for debugging
api.interceptors.request.use(
	(config) => {
		console.log(
			"API Request:",
			config.method?.toUpperCase(),
			config.url,
			config.data
		);
		return config;
	},
	(error) => {
		console.error("API Request Error:", error);
		return Promise.reject(error);
	}
);

// Add response interceptor for debugging
api.interceptors.response.use(
	(response) => {
		console.log("API Response:", response.config.url, response.data);
		return response;
	},
	(error) => {
		console.error("API Response Error:", error.response?.data || error.message);
		return Promise.reject(error);
	}
);

// API service functions
export const apiService = {
	// Authentication with mock implementation for development
	login: async (credentials) => {
		console.log("Mock login called with:", credentials);
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Mock successful login
		return {
			data: {
				success: true,
				user: {
					id: 1,
					email: credentials.email,
					name:
						credentials.role === "candidate"
							? "John Doe"
							: credentials.role === "company"
							? "TechCorp India"
							: "Admin User",
					role: credentials.role,
					phone: "+91 98765 43210",
					location: "Bangalore",
				},
			},
		};
	},

	signup: async (userData) => {
		console.log("Mock signup called with:", userData);
		// Simulate API delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Mock successful signup
		return {
			data: {
				success: true,
				user: {
					id: Math.floor(Math.random() * 1000),
					email: userData.email,
					name: userData.name,
					role: userData.role,
					phone: userData.phone,
					location: userData.location,
				},
			},
		};
	},

	// Resume
	analyzeResume: (fileData) => api.post("/resume/analyze", fileData),

	// AI Resume Analysis
	analyzeResumeAI: (fileData) => api.post("/ai/analyze-resume", fileData),

	// AI Job Recommendations
	getAIJobRecommendations: (userId) =>
		api.get(`/ai/job-recommendations?user_id=${userId}`),

	// Coding Profile Integration
	getCodingProfile: (githubUsername, leetcodeUsername = "") =>
		api.get(
			`/ai/coding-profile?github=${githubUsername}&leetcode=${leetcodeUsername}`
		),

	// Voice Assessment
	analyzeVoice: (formData) =>
		api.post("/ai/voice-assessment", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}),

	// Skill Predictions
	getSkillPredictions: (timeFrame = "6_months") =>
		api.get(`/ai/skill-prediction?timeframe=${timeFrame}`),

	// Analytics Dashboard
	getAnalytics: () => api.get("/ai/analytics"),

	// Recommendations
	getRecommendations: (userId, limit = 10) =>
		api.get(`/recommendations?user_id=${userId}&limit=${limit}`),

	// Applications
	getApplications: (userId) => api.get(`/applications?user_id=${userId}`),

	// Postings
	getPostings: () => api.get("/postings"),
	createPosting: (posting) => api.post("/postings", posting),

	// Company
	getShortlist: (companyId) =>
		api.get(`/company/shortlist?company_id=${companyId}`),

	// Admin
	getAdminStats: () => api.get("/admin/dashboard-stats"),
	runMatching: () => api.post("/admin/run-matching"),
	getAllocations: () => api.get("/admin/allocations"),

	// Health check
	healthCheck: () => api.get("/health"),
};

export default apiService;
