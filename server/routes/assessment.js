/**
 * Assessment Routes for BharatIntern AI Platform
 * Handles assessment creation, management, and evaluation
 */

const express = require("express");
const router = express.Router();

// Middleware imports
const {
	verifyToken,
	optionalAuth,
	checkPermission,
} = require("../middleware/auth");
const { catchAsync, AppError } = require("../middleware/errorHandler");

// Service imports
const AssessmentService = require("../services/AssessmentService");

// Initialize services
const assessmentService = new AssessmentService();

/**
 * @route POST /api/assessment/create
 * @desc Create a new assessment
 * @access Protected - Company/Admin only
 */
router.post(
	"/create",
	verifyToken,
	checkPermission("assessment_create"),
	catchAsync(async (req, res) => {
		const {
			title,
			description,
			type = "multiple_choice",
			difficulty = "intermediate",
			skills = [],
			duration = 60,
			questions = [],
			passingScore = 70,
			industry = "general",
			jobRole = "",
			customInstructions = "",
		} = req.body;

		if (!title || !description) {
			throw new AppError("Title and description are required", 400);
		}

		const assessmentData = {
			title,
			description,
			type,
			difficulty,
			skills,
			duration,
			questions,
			passingScore,
			industry,
			jobRole,
			customInstructions,
			createdBy: req.user.id,
			companyId: req.user.companyId || null,
		};

		const assessment = await assessmentService.createAssessment(assessmentData);

		res.status(201).json({
			success: true,
			assessment: assessment,
			message: "Assessment created successfully",
		});
	})
);

/**
 * @route POST /api/assessment/generate
 * @desc Generate assessment questions using AI
 * @access Protected - Company/Admin only
 */
router.post(
	"/generate",
	verifyToken,
	checkPermission("assessment_create"),
	catchAsync(async (req, res) => {
		const {
			jobRole,
			skills = [],
			difficulty = "intermediate",
			questionCount = 10,
			questionTypes = ["multiple_choice"],
			industry = "general",
			customRequirements = "",
		} = req.body;

		if (!jobRole && skills.length === 0) {
			throw new AppError("Either job role or skills must be specified", 400);
		}

		const generationOptions = {
			jobRole,
			skills,
			difficulty,
			questionCount,
			questionTypes,
			industry,
			customRequirements,
			generatedBy: req.user.id,
		};

		const generatedQuestions = await assessmentService.generateQuestions(
			generationOptions
		);

		res.json({
			success: true,
			questions: generatedQuestions.questions,
			metadata: {
				totalGenerated: generatedQuestions.questions.length,
				difficulty: difficulty,
				skills: skills,
				generationTime: generatedQuestions.processingTime,
				model: generatedQuestions.model,
			},
			suggestions: generatedQuestions.suggestions,
		});
	})
);

/**
 * @route GET /api/assessment/list
 * @desc Get list of assessments
 * @access Protected
 */
router.get(
	"/list",
	verifyToken,
	catchAsync(async (req, res) => {
		const {
			page = 1,
			limit = 10,
			type = "all",
			difficulty = "all",
			skills = "",
			search = "",
			sortBy = "createdAt",
			sortOrder = "desc",
		} = req.query;

		const filters = {
			type: type !== "all" ? type : undefined,
			difficulty: difficulty !== "all" ? difficulty : undefined,
			skills: skills ? skills.split(",") : undefined,
			search: search || undefined,
			createdBy: req.user.role === "company" ? req.user.id : undefined,
		};

		const options = {
			page: parseInt(page),
			limit: parseInt(limit),
			sortBy,
			sortOrder,
		};

		const result = await assessmentService.getAssessments(filters, options);

		res.json({
			success: true,
			assessments: result.assessments,
			pagination: {
				currentPage: result.currentPage,
				totalPages: result.totalPages,
				totalItems: result.totalItems,
				limit: result.limit,
			},
			filters: filters,
		});
	})
);

/**
 * @route GET /api/assessment/:id
 * @desc Get specific assessment details
 * @access Protected
 */
router.get(
	"/:id",
	verifyToken,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const { includeQuestions = "false", includeAnswers = "false" } = req.query;

		const assessment = await assessmentService.getAssessmentById(id, {
			includeQuestions: includeQuestions === "true",
			includeAnswers:
				includeAnswers === "true" && req.user.role !== "candidate",
			userId: req.user.id,
			userRole: req.user.role,
		});

		if (!assessment) {
			throw new AppError("Assessment not found", 404);
		}

		res.json({
			success: true,
			assessment: assessment,
		});
	})
);

/**
 * @route POST /api/assessment/:id/start
 * @desc Start an assessment session
 * @access Protected - Candidates
 */
router.post(
	"/:id/start",
	verifyToken,
	checkPermission("assessment_take"),
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const { candidateInfo = {} } = req.body;

		const assessment = await assessmentService.getAssessmentById(id);
		if (!assessment) {
			throw new AppError("Assessment not found", 404);
		}

		// Check if candidate has already taken this assessment
		const existingAttempt = await assessmentService.getExistingAttempt(
			id,
			req.user.id
		);
		if (existingAttempt && existingAttempt.status === "completed") {
			throw new AppError("You have already completed this assessment", 400);
		}

		const session = await assessmentService.startAssessmentSession(id, {
			candidateId: req.user.id,
			candidateInfo: candidateInfo,
			startTime: new Date(),
		});

		res.json({
			success: true,
			session: session,
			assessment: {
				id: assessment.id,
				title: assessment.title,
				description: assessment.description,
				duration: assessment.duration,
				questionCount: assessment.questions.length,
				passingScore: assessment.passingScore,
				instructions: assessment.customInstructions,
			},
			timeLimit: assessment.duration * 60 * 1000, // Convert to milliseconds
			message: "Assessment session started successfully",
		});
	})
);

/**
 * @route POST /api/assessment/:id/submit
 * @desc Submit assessment answers
 * @access Protected - Candidates
 */
router.post(
	"/:id/submit",
	verifyToken,
	checkPermission("assessment_take"),
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const { sessionId, answers, timeSpent } = req.body;

		if (!sessionId || !answers) {
			throw new AppError("Session ID and answers are required", 400);
		}

		// Validate session
		const session = await assessmentService.getSession(sessionId);
		if (!session || session.candidateId !== req.user.id) {
			throw new AppError("Invalid session", 400);
		}

		if (session.status === "completed") {
			throw new AppError("Assessment already submitted", 400);
		}

		// Submit and evaluate assessment
		const result = await assessmentService.submitAssessment(sessionId, {
			answers: answers,
			timeSpent: timeSpent,
			submittedAt: new Date(),
			candidateId: req.user.id,
		});

		res.json({
			success: true,
			result: {
				sessionId: sessionId,
				score: result.score,
				percentage: result.percentage,
				passed: result.passed,
				correctAnswers: result.correctAnswers,
				totalQuestions: result.totalQuestions,
				timeSpent: result.timeSpent,
				feedback: result.feedback,
				submittedAt: result.submittedAt,
			},
			message: result.passed
				? "Congratulations! You passed the assessment."
				: "Assessment completed. Better luck next time!",
		});
	})
);

/**
 * @route GET /api/assessment/:id/results
 * @desc Get assessment results
 * @access Protected - Candidates (own results), Companies/Admin (all results)
 */
router.get(
	"/:id/results",
	verifyToken,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const { page = 1, limit = 10, candidateId = null } = req.query;

		const options = {
			page: parseInt(page),
			limit: parseInt(limit),
			assessmentId: id,
			candidateId: req.user.role === "candidate" ? req.user.id : candidateId,
			requestedBy: req.user.id,
			userRole: req.user.role,
		};

		const results = await assessmentService.getAssessmentResults(options);

		res.json({
			success: true,
			results: results.results,
			statistics: results.statistics,
			pagination: {
				currentPage: results.currentPage,
				totalPages: results.totalPages,
				totalItems: results.totalItems,
				limit: results.limit,
			},
		});
	})
);

/**
 * @route POST /api/assessment/:id/analyze
 * @desc Analyze assessment performance and provide insights
 * @access Protected - Company/Admin
 */
router.post(
	"/:id/analyze",
	verifyToken,
	checkPermission("premium"),
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const { analysisType = "comprehensive", timeRange = "30d" } = req.body;

		const analysis = await assessmentService.analyzeAssessmentPerformance(id, {
			analysisType: analysisType,
			timeRange: timeRange,
			requestedBy: req.user.id,
		});

		res.json({
			success: true,
			analysis: {
				overview: analysis.overview,
				candidatePerformance: analysis.candidatePerformance,
				questionAnalysis: analysis.questionAnalysis,
				skillsAnalysis: analysis.skillsAnalysis,
				trends: analysis.trends,
				recommendations: analysis.recommendations,
			},
			metadata: {
				assessmentId: id,
				analysisType: analysisType,
				timeRange: timeRange,
				generatedAt: new Date().toISOString(),
				processingTime: analysis.processingTime,
			},
		});
	})
);

/**
 * @route PUT /api/assessment/:id
 * @desc Update assessment
 * @access Protected - Creator/Admin only
 */
router.put(
	"/:id",
	verifyToken,
	catchAsync(async (req, res) => {
		const { id } = req.params;
		const updateData = req.body;

		// Validate ownership or admin rights
		const assessment = await assessmentService.getAssessmentById(id);
		if (!assessment) {
			throw new AppError("Assessment not found", 404);
		}

		if (assessment.createdBy !== req.user.id && req.user.role !== "admin") {
			throw new AppError(
				"You do not have permission to update this assessment",
				403
			);
		}

		const updatedAssessment = await assessmentService.updateAssessment(
			id,
			updateData
		);

		res.json({
			success: true,
			assessment: updatedAssessment,
			message: "Assessment updated successfully",
		});
	})
);

/**
 * @route DELETE /api/assessment/:id
 * @desc Delete assessment
 * @access Protected - Creator/Admin only
 */
router.delete(
	"/:id",
	verifyToken,
	catchAsync(async (req, res) => {
		const { id } = req.params;

		// Validate ownership or admin rights
		const assessment = await assessmentService.getAssessmentById(id);
		if (!assessment) {
			throw new AppError("Assessment not found", 404);
		}

		if (assessment.createdBy !== req.user.id && req.user.role !== "admin") {
			throw new AppError(
				"You do not have permission to delete this assessment",
				403
			);
		}

		await assessmentService.deleteAssessment(id);

		res.json({
			success: true,
			message: "Assessment deleted successfully",
		});
	})
);

/**
 * @route GET /api/assessment/candidate/history
 * @desc Get candidate's assessment history
 * @access Protected - Candidates
 */
router.get(
	"/candidate/history",
	verifyToken,
	checkPermission("assessment_take"),
	catchAsync(async (req, res) => {
		const { page = 1, limit = 10, status = "all" } = req.query;

		const options = {
			candidateId: req.user.id,
			page: parseInt(page),
			limit: parseInt(limit),
			status: status !== "all" ? status : undefined,
		};

		const history = await assessmentService.getCandidateHistory(options);

		res.json({
			success: true,
			history: history.assessments,
			summary: history.summary,
			pagination: {
				currentPage: history.currentPage,
				totalPages: history.totalPages,
				totalItems: history.totalItems,
				limit: history.limit,
			},
		});
	})
);

/**
 * @route GET /api/assessment/statistics
 * @desc Get assessment platform statistics
 * @access Protected - Admin/Company
 */
router.get(
	"/statistics",
	verifyToken,
	checkPermission("premium"),
	catchAsync(async (req, res) => {
		const { period = "30d", groupBy = "day" } = req.query;

		const statistics = await assessmentService.getPlatformStatistics({
			period: period,
			groupBy: groupBy,
			requestedBy: req.user.id,
			userRole: req.user.role,
		});

		res.json({
			success: true,
			statistics: statistics,
			period: period,
			generatedAt: new Date().toISOString(),
		});
	})
);

// Error handling middleware specific to assessment routes
router.use((error, req, res, next) => {
	// Log assessment-specific errors
	console.error(`Assessment API Error: ${error.message}`, {
		endpoint: req.originalUrl,
		method: req.method,
		user: req.user?.id,
		assessmentId: req.params?.id,
	});

	next(error);
});

module.exports = router;
