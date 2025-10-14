import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance with timeout
const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 10000, // 10 second timeout
	headers: {
		"Content-Type": "application/json",
	},
});

// Simple cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Add request interceptor with caching
api.interceptors.request.use(
	(config) => {
		// Check cache for GET requests only
		if (config.method === "get") {
			const cacheKey = `${config.url}?${JSON.stringify(config.params)}`;
			const cached = cache.get(cacheKey);

			if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
				console.log("API Cache Hit:", config.url);
				// Return cached response in the same format as axios
				return Promise.resolve({
					...config,
					__cached: true,
					__cachedData: cached.data,
				});
			}
		}

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

// Add response interceptor with caching
api.interceptors.response.use(
	(response) => {
		// Handle cached responses
		if (response.config.__cached) {
			console.log("API Cache Response:", response.config.url);
			return {
				...response,
				data: response.config.__cachedData,
			};
		}

		// Cache GET responses
		if (response.config.method === "get" && response.status === 200) {
			const cacheKey = `${response.config.url}?${JSON.stringify(
				response.config.params
			)}`;
			cache.set(cacheKey, {
				data: response.data,
				timestamp: Date.now(),
			});
		}

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

	// Resume Analysis
	analyzeResume: (fileData) => api.post("/resume/analyze", fileData),

	// AI Resume Analysis - Basic
	analyzeResumeAI: (formData) =>
		api.post("/ai/analyze-resume", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}),

	// AI Resume Analysis - Advanced
	analyzeResumeAdvanced: (formData) =>
		api.post("/ai/analyze-resume-advanced", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}),

	// Internship Resume Analysis (models in placement_ai/simple_main)
	internshipAnalyzeResume: (formData) =>
		api.post("/internship/analyze-resume", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}),

	// AI Job Matching
	matchJobsAI: (candidateProfiles, jobDescriptions) =>
		api.post("/ai/match-jobs", {
			candidate_profiles: candidateProfiles,
			job_descriptions: jobDescriptions,
		}),

	// Coding Profile Integration
	integrateCodingProfile: (githubUsername, leetcodeUsername = "") =>
		api.post("/ai/coding-profile", {
			github_username: githubUsername,
			leetcode_username: leetcodeUsername,
		}),

	// Voice Assessment
	analyzeVoice: (formData) =>
		api.post("/ai/voice-assessment", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		}),

	// AI System Health
	getAIHealth: () => api.get("/ai/health"),

	// AI Analytics
	getAIAnalytics: (timeframe = "30d") =>
		api.get(`/ai/analytics?timeframe=${timeframe}`),

	// Recommendations with fallback
	getRecommendations: async (userId, limit = 10) => {
		try {
			return await api.get(`/recommendations?user_id=${userId}&limit=${limit}`);
		} catch (error) {
			console.warn("Recommendations API failed, using mock data");
			// Return mock data immediately
			return {
				data: [
					{
						id: 1,
						title: "Software Development Intern",
						company: "TechCorp India",
						location: "Bangalore",
						duration: "6 months",
						matchScore: 95,
						skills: ["React", "Node.js", "JavaScript"],
						deadline: "2024-02-15",
						stipend: "₹25,000/month",
						type: "Full-time",
						applicants: 1250,
						isNew: true,
					},
				],
			};
		}
	},

	// Applications with fallback
	getApplications: async (userId) => {
		try {
			return await api.get(`/applications?user_id=${userId}`);
		} catch (error) {
			console.warn("Applications API failed, using mock data");
			return {
				data: [
					{
						id: 1,
						title: "Frontend Developer Intern",
						company: "StartupXYZ",
						status: "Under Review",
						appliedDate: "2024-01-15",
						matchScore: 85,
						nextStep: "Technical Interview",
						interviewDate: "2024-02-10",
					},
				],
			};
		}
	},

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

	// Perplexity AI Resume Analysis
	analyzeResumeWithPerplexity: async (formData, options = {}) => {
		try {
			// Try backend endpoint first
			return await api.post("/ai/analyze-resume-perplexity", formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
				params: options,
			});
		} catch (error) {
			console.warn("Backend Perplexity API failed, using client-side", error);
			// Fallback to client-side Perplexity if backend fails
			const { perplexityService } = await import("./perplexityAI");

			// Extract text from file
			const file = formData.get("file");
			const text = await file.text();

			const result = await perplexityService.analyzeResume(text, options);
			return { data: { success: true, analysis: result } };
		}
	},

	// Perplexity Career Suggestions
	getCareerSuggestionsPerplexity: async (resumeText, preferences = {}) => {
		try {
			return await api.post("/ai/career-suggestions-perplexity", {
				resume_text: resumeText,
				preferences,
			});
		} catch (error) {
			console.warn("Backend career suggestions failed, using client-side");
			const { perplexityService } = await import("./perplexityAI");
			const suggestions = await perplexityService.getCareerSuggestions(
				resumeText,
				preferences
			);
			return { data: { success: true, suggestions } };
		}
	},

	// Perplexity ATS Optimization
	optimizeResumeForATS: async (resumeText, jobDescription = "") => {
		try {
			return await api.post("/ai/optimize-ats-perplexity", {
				resume_text: resumeText,
				job_description: jobDescription,
			});
		} catch (error) {
			console.warn("Backend ATS optimization failed, using client-side");
			const { perplexityService } = await import("./perplexityAI");
			const optimization = await perplexityService.optimizeForATS(
				resumeText,
				jobDescription
			);
			return { data: { success: true, optimization } };
		}
	},
};

export default apiService;
