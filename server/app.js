/**
 * Main Express server application for BharatIntern AI Platform
 * Provides comprehensive AI-powered internship and recruitment services
 *
 * @author BharatIntern Team
 * @version 1.0.0
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const validationHandler = require("./middleware/validationHandler");
const authMiddleware = require("./middleware/authMiddleware");

// Import routes
const resumeRoutes = require("./routes/resumeRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const jobMatchingRoutes = require("./routes/jobMatchingRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const codingProfileRoutes = require("./routes/codingProfileRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(
	helmet({
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'"],
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", "data:", "https:"],
			},
		},
	})
);

// CORS configuration
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
	})
);

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: {
		error: "Too many requests from this IP, please try again later.",
		retryAfter: 15 * 60,
	},
	standardHeaders: true,
	legacyHeaders: false,
});
app.use("/api/", limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Request logging middleware
app.use((req, res, next) => {
	console.log(
		`${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`
	);
	next();
});

// Health check endpoint
app.use("/api/health", healthRoutes);

// API Routes
app.use("/api/resume", resumeRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/jobs", jobMatchingRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/coding-profile", codingProfileRoutes);

// API Documentation endpoint
app.get("/api/docs", (req, res) => {
	res.json({
		title: "BharatIntern AI Platform API",
		version: "1.0.0",
		description: "Comprehensive AI-powered internship and recruitment platform",
		endpoints: {
			resume: {
				"POST /api/resume/analyze": "Analyze uploaded resume with AI",
				"GET /api/resume/suggestions/:id": "Get improvement suggestions",
				"POST /api/resume/build": "Generate professional resume",
				"GET /api/resume/download/:id": "Download generated resume",
			},
			assessment: {
				"POST /api/assessment/start": "Start new assessment",
				"POST /api/assessment/grade": "Grade assessment answers",
				"POST /api/assessment/voice-eval": "Evaluate voice interview",
			},
			jobs: {
				"POST /api/jobs/match": "Match candidates to jobs",
				"GET /api/jobs/suggestions/:candidateId": "Get job suggestions",
			},
			interview: {
				"POST /api/interview/submit": "Submit interview responses",
				"POST /api/interview/score": "Score interview performance",
			},
			codingProfile: {
				"GET /api/coding-profile/:platform/:username":
					"Get coding profile stats",
			},
		},
		authentication: "Bearer token or API key required for most endpoints",
		rateLimit: "100 requests per 15 minutes per IP",
	});
});

// Root endpoint
app.get("/", (req, res) => {
	res.json({
		message: "BharatIntern AI Platform API",
		version: "1.0.0",
		status: "running",
		timestamp: new Date().toISOString(),
		docs: "/api/docs",
	});
});

// 404 handler
app.use("*", (req, res) => {
	res.status(404).json({
		error: "Endpoint not found",
		message: `The endpoint ${req.method} ${req.originalUrl} does not exist`,
		availableEndpoints: "/api/docs",
	});
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on("SIGINT", () => {
	console.log("\nReceived SIGINT. Graceful shutdown initiated...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	console.log("\nReceived SIGTERM. Graceful shutdown initiated...");
	process.exit(0);
});

// Start server
app.listen(PORT, () => {
	console.log(`🚀 BharatIntern AI Platform API running on port ${PORT}`);
	console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
	console.log(`📚 API docs: http://localhost:${PORT}/api/docs`);
	console.log(
		`🔒 CORS enabled for: ${
			process.env.FRONTEND_URL || "http://localhost:3000"
		}`
	);
});

module.exports = app;
