/**
 * Interview Assessment Routes for BharatIntern AI Platform
 * Handles AI-powered interview assessments with speech-to-text and evaluation
 */

const express = require("express");
const multer = require("multer");
const { authenticateToken, requireRole } = require("../middleware/auth");
const { validateFile } = require("../middleware/upload");
const InterviewAssessmentService = require("../services/InterviewAssessmentService");
const { processAudio } = require("../utils/audioProcessor");
const router = express.Router();

// Initialize service
const interviewService = new InterviewAssessmentService();

// Configure multer for audio file uploads
const audioStorage = multer.memoryStorage();
const audioUpload = multer({
	storage: audioStorage,
	limits: {
		fileSize: 50 * 1024 * 1024, // 50MB limit for audio files
		files: 1,
	},
	fileFilter: (req, file, cb) => {
		const allowedMimeTypes = [
			"audio/mpeg",
			"audio/mp3",
			"audio/wav",
			"audio/mp4",
			"audio/ogg",
			"audio/webm",
			"video/mp4",
			"video/webm",
		];

		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error("Invalid file type. Only audio/video files are allowed."),
				false
			);
		}
	},
});

/**
 * @route POST /api/interview/sessions
 * @desc Create a new interview session
 * @access Private (Candidate/Company/Admin)
 */
router.post("/sessions", authenticateToken, async (req, res) => {
	try {
		const {
			jobId,
			candidateId,
			interviewType = "technical",
			difficulty = "medium",
			duration = 60,
			questionCount = 10,
			topics = [],
			customQuestions = [],
			settings = {},
		} = req.body;

		// Validate required fields
		if (!jobId && !candidateId) {
			return res.status(400).json({
				success: false,
				message: "Either jobId or candidateId is required",
			});
		}

		const sessionData = {
			jobId,
			candidateId: candidateId || req.user.id,
			interviewType,
			difficulty,
			duration,
			questionCount,
			topics,
			customQuestions,
			settings,
			createdBy: req.user.id,
			userRole: req.user.role,
		};

		const session = await interviewService.createInterviewSession(sessionData);

		res.status(201).json({
			success: true,
			message: "Interview session created successfully",
			data: {
				session: session,
				nextStep: "Start the interview using the session ID",
			},
		});
	} catch (error) {
		console.error("Error creating interview session:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to create interview session",
			error: process.env.NODE_ENV === "development" ? error.stack : undefined,
		});
	}
});

/**
 * @route GET /api/interview/sessions/:sessionId
 * @desc Get interview session details
 * @access Private (Owner/Company/Admin)
 */
router.get("/sessions/:sessionId", authenticateToken, async (req, res) => {
	try {
		const { sessionId } = req.params;
		const { includeQuestions = false, includeAnalysis = true } = req.query;

		const session = await interviewService.getInterviewSession(sessionId, {
			includeQuestions: includeQuestions === "true",
			includeAnalysis: includeAnalysis === "true",
			requestedBy: req.user.id,
			userRole: req.user.role,
		});

		if (!session) {
			return res.status(404).json({
				success: false,
				message: "Interview session not found",
			});
		}

		res.json({
			success: true,
			data: {
				session: session,
				permissions: {
					canModify:
						session.createdBy === req.user.id || req.user.role === "admin",
					canView: true,
				},
			},
		});
	} catch (error) {
		console.error("Error fetching interview session:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch interview session",
		});
	}
});

/**
 * @route POST /api/interview/sessions/:sessionId/start
 * @desc Start an interview session
 * @access Private (Candidate/Company/Admin)
 */
router.post(
	"/sessions/:sessionId/start",
	authenticateToken,
	async (req, res) => {
		try {
			const { sessionId } = req.params;
			const { browserInfo, deviceInfo } = req.body;

			const startResult = await interviewService.startInterview(sessionId, {
				candidateId: req.user.id,
				browserInfo,
				deviceInfo,
				startedAt: new Date().toISOString(),
			});

			res.json({
				success: true,
				message: "Interview started successfully",
				data: {
					session: startResult.session,
					firstQuestion: startResult.firstQuestion,
					instructions: startResult.instructions,
					timeRemaining: startResult.timeRemaining,
				},
			});
		} catch (error) {
			console.error("Error starting interview:", error);
			res.status(500).json({
				success: false,
				message: error.message || "Failed to start interview",
			});
		}
	}
);

/**
 * @route GET /api/interview/sessions/:sessionId/questions/:questionId
 * @desc Get specific question for interview
 * @access Private (Active session participant)
 */
router.get(
	"/sessions/:sessionId/questions/:questionId",
	authenticateToken,
	async (req, res) => {
		try {
			const { sessionId, questionId } = req.params;

			const question = await interviewService.getQuestion(
				sessionId,
				questionId,
				{
					candidateId: req.user.id,
					includeHints: req.query.includeHints === "true",
				}
			);

			res.json({
				success: true,
				data: {
					question: question,
					metadata: {
						timeLimit: question.timeLimit,
						allowedAttempts: question.allowedAttempts,
						difficulty: question.difficulty,
					},
				},
			});
		} catch (error) {
			console.error("Error fetching question:", error);
			res.status(500).json({
				success: false,
				message: error.message || "Failed to fetch question",
			});
		}
	}
);

/**
 * @route POST /api/interview/sessions/:sessionId/responses
 * @desc Submit response to interview question
 * @access Private (Active session participant)
 */
router.post(
	"/sessions/:sessionId/responses",
	authenticateToken,
	async (req, res) => {
		try {
			const { sessionId } = req.params;
			const {
				questionId,
				responseText,
				responseTime,
				confidence = 50,
				metadata = {},
			} = req.body;

			if (!questionId || !responseText) {
				return res.status(400).json({
					success: false,
					message: "Question ID and response text are required",
				});
			}

			const responseData = {
				questionId,
				candidateId: req.user.id,
				responseText,
				responseTime,
				confidence,
				metadata,
				submittedAt: new Date().toISOString(),
			};

			const result = await interviewService.submitResponse(
				sessionId,
				responseData
			);

			res.json({
				success: true,
				message: "Response submitted successfully",
				data: {
					responseId: result.responseId,
					evaluation: result.evaluation,
					nextQuestion: result.nextQuestion,
					progress: result.progress,
				},
			});
		} catch (error) {
			console.error("Error submitting response:", error);
			res.status(500).json({
				success: false,
				message: error.message || "Failed to submit response",
			});
		}
	}
);

/**
 * @route POST /api/interview/sessions/:sessionId/audio-response
 * @desc Submit audio response with speech-to-text processing
 * @access Private (Active session participant)
 */
router.post(
	"/sessions/:sessionId/audio-response",
	authenticateToken,
	audioUpload.single("audioFile"),
	async (req, res) => {
		try {
			const { sessionId } = req.params;
			const {
				questionId,
				responseTime,
				confidence = 50,
				audioMetadata = "{}",
			} = req.body;

			if (!req.file) {
				return res.status(400).json({
					success: false,
					message: "Audio file is required",
				});
			}

			if (!questionId) {
				return res.status(400).json({
					success: false,
					message: "Question ID is required",
				});
			}

			// Process audio file
			const audioProcessResult = await processAudio(req.file.buffer, {
				format: req.file.mimetype,
				enhanceAudio: true,
				extractKeywords: true,
				detectSentiment: true,
			});

			if (!audioProcessResult.success) {
				return res.status(400).json({
					success: false,
					message: "Failed to process audio file",
					details: audioProcessResult.error,
				});
			}

			const responseData = {
				questionId,
				candidateId: req.user.id,
				responseText: audioProcessResult.transcription,
				audioAnalysis: audioProcessResult.analysis,
				responseTime: responseTime || audioProcessResult.duration,
				confidence,
				metadata: {
					...JSON.parse(audioMetadata),
					audioQuality: audioProcessResult.quality,
					speechMetrics: audioProcessResult.speechMetrics,
				},
				submittedAt: new Date().toISOString(),
			};

			const result = await interviewService.submitResponse(
				sessionId,
				responseData
			);

			res.json({
				success: true,
				message: "Audio response processed and submitted successfully",
				data: {
					responseId: result.responseId,
					transcription: audioProcessResult.transcription,
					audioAnalysis: audioProcessResult.analysis,
					evaluation: result.evaluation,
					nextQuestion: result.nextQuestion,
					progress: result.progress,
				},
			});
		} catch (error) {
			console.error("Error processing audio response:", error);
			res.status(500).json({
				success: false,
				message: error.message || "Failed to process audio response",
			});
		}
	}
);

/**
 * @route POST /api/interview/sessions/:sessionId/complete
 * @desc Complete an interview session
 * @access Private (Active session participant)
 */
router.post(
	"/sessions/:sessionId/complete",
	authenticateToken,
	async (req, res) => {
		try {
			const { sessionId } = req.params;
			const {
				feedback = "",
				experience = "",
				technicalIssues = false,
				completionReason = "finished",
			} = req.body;

			const completionData = {
				candidateId: req.user.id,
				feedback,
				experience,
				technicalIssues,
				completionReason,
				completedAt: new Date().toISOString(),
			};

			const result = await interviewService.completeInterview(
				sessionId,
				completionData
			);

			res.json({
				success: true,
				message: "Interview completed successfully",
				data: {
					sessionSummary: result.summary,
					overallScore: result.overallScore,
					detailedAnalysis: result.analysis,
					recommendations: result.recommendations,
					certificate: result.certificate,
				},
			});
		} catch (error) {
			console.error("Error completing interview:", error);
			res.status(500).json({
				success: false,
				message: error.message || "Failed to complete interview",
			});
		}
	}
);

/**
 * @route GET /api/interview/sessions/:sessionId/results
 * @desc Get interview results and analysis
 * @access Private (Participant/Company/Admin)
 */
router.get(
	"/sessions/:sessionId/results",
	authenticateToken,
	async (req, res) => {
		try {
			const { sessionId } = req.params;
			const {
				includeDetailed = true,
				includeRecommendations = true,
				format = "json",
			} = req.query;

			const results = await interviewService.getInterviewResults(sessionId, {
				includeDetailed: includeDetailed === "true",
				includeRecommendations: includeRecommendations === "true",
				requestedBy: req.user.id,
				userRole: req.user.role,
			});

			if (format === "pdf") {
				const pdfBuffer = await interviewService.generateResultsPDF(results);
				res.setHeader("Content-Type", "application/pdf");
				res.setHeader(
					"Content-Disposition",
					`attachment; filename="interview-results-${sessionId}.pdf"`
				);
				return res.send(pdfBuffer);
			}

			res.json({
				success: true,
				data: {
					results: results,
					exportOptions: ["pdf", "json", "csv"],
					sharing: {
						canShare: req.user.role !== "candidate",
						shareableLink: results.shareableLink,
					},
				},
			});
		} catch (error) {
			console.error("Error fetching interview results:", error);
			res.status(500).json({
				success: false,
				message: error.message || "Failed to fetch interview results",
			});
		}
	}
);

/**
 * @route GET /api/interview/sessions/:sessionId/analysis/:type
 * @desc Get specific type of interview analysis
 * @access Private (Company/Admin)
 */
router.get(
	"/sessions/:sessionId/analysis/:type",
	authenticateToken,
	requireRole(["company", "admin"]),
	async (req, res) => {
		try {
			const { sessionId, type } = req.params;
			const { detailed = false } = req.query;

			const validAnalysisTypes = [
				"technical-skills",
				"communication",
				"problem-solving",
				"behavioral",
				"cultural-fit",
				"overall-assessment",
			];

			if (!validAnalysisTypes.includes(type)) {
				return res.status(400).json({
					success: false,
					message: "Invalid analysis type",
					validTypes: validAnalysisTypes,
				});
			}

			const analysis = await interviewService.getSpecificAnalysis(
				sessionId,
				type,
				{
					detailed: detailed === "true",
					requestedBy: req.user.id,
				}
			);

			res.json({
				success: true,
				data: {
					analysisType: type,
					analysis: analysis,
					methodology: analysis.methodology,
					confidence: analysis.confidence,
				},
			});
		} catch (error) {
			console.error("Error fetching specific analysis:", error);
			res.status(500).json({
				success: false,
				message: error.message || "Failed to fetch analysis",
			});
		}
	}
);

/**
 * @route GET /api/interview/sessions
 * @desc Get interview sessions for user
 * @access Private (All authenticated users)
 */
router.get("/sessions", authenticateToken, async (req, res) => {
	try {
		const {
			status = "all",
			page = 1,
			limit = 20,
			sortBy = "createdAt",
			sortOrder = "desc",
			candidateId,
			jobId,
		} = req.query;

		const filters = {
			status: status !== "all" ? status : undefined,
			candidateId:
				candidateId ||
				(req.user.role === "candidate" ? req.user.id : undefined),
			jobId,
			requestedBy: req.user.id,
			userRole: req.user.role,
		};

		const options = {
			page: parseInt(page),
			limit: parseInt(limit),
			sortBy,
			sortOrder,
		};

		const sessions = await interviewService.getUserSessions(filters, options);

		res.json({
			success: true,
			data: {
				sessions: sessions.sessions,
				pagination: sessions.pagination,
				statistics: sessions.statistics,
			},
		});
	} catch (error) {
		console.error("Error fetching user sessions:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to fetch sessions",
		});
	}
});

/**
 * @route GET /api/interview/templates
 * @desc Get interview question templates
 * @access Private (Company/Admin)
 */
router.get(
	"/templates",
	authenticateToken,
	requireRole(["company", "admin"]),
	async (req, res) => {
		try {
			const {
				category = "all",
				difficulty = "all",
				type = "all",
				skills = [],
				industry = "all",
			} = req.query;

			const filters = {
				category: category !== "all" ? category : undefined,
				difficulty: difficulty !== "all" ? difficulty : undefined,
				type: type !== "all" ? type : undefined,
				skills: Array.isArray(skills)
					? skills
					: skills.split(",").filter(Boolean),
				industry: industry !== "all" ? industry : undefined,
			};

			const templates = await interviewService.getQuestionTemplates(filters);

			res.json({
				success: true,
				data: {
					templates: templates.templates,
					categories: templates.categories,
					availableSkills: templates.availableSkills,
					industries: templates.industries,
				},
			});
		} catch (error) {
			console.error("Error fetching templates:", error);
			res.status(500).json({
				success: false,
				message: error.message || "Failed to fetch templates",
			});
		}
	}
);

/**
 * @route POST /api/interview/templates
 * @desc Create custom interview template
 * @access Private (Company/Admin)
 */
router.post(
	"/templates",
	authenticateToken,
	requireRole(["company", "admin"]),
	async (req, res) => {
		try {
			const {
				name,
				description,
				category,
				difficulty,
				questions,
				settings = {},
				tags = [],
			} = req.body;

			if (!name || !questions || questions.length === 0) {
				return res.status(400).json({
					success: false,
					message: "Template name and questions are required",
				});
			}

			const templateData = {
				name,
				description,
				category,
				difficulty,
				questions,
				settings,
				tags,
				createdBy: req.user.id,
				companyId: req.user.companyId,
			};

			const template = await interviewService.createQuestionTemplate(
				templateData
			);

			res.status(201).json({
				success: true,
				message: "Interview template created successfully",
				data: {
					template: template,
					usage: "Use template ID when creating interview sessions",
				},
			});
		} catch (error) {
			console.error("Error creating template:", error);
			res.status(500).json({
				success: false,
				message: error.message || "Failed to create template",
			});
		}
	}
);

/**
 * @route GET /api/interview/analytics
 * @desc Get interview analytics and insights
 * @access Private (Company/Admin)
 */
router.get(
	"/analytics",
	authenticateToken,
	requireRole(["company", "admin"]),
	async (req, res) => {
		try {
			const {
				period = "30d",
				metric = "all",
				jobId,
				department,
				includeComparisons = true,
			} = req.query;

			const filters = {
				period,
				metric,
				jobId,
				department,
				companyId: req.user.companyId,
				requestedBy: req.user.id,
			};

			const analytics = await interviewService.getInterviewAnalytics(filters, {
				includeComparisons: includeComparisons === "true",
			});

			res.json({
				success: true,
				data: {
					analytics: analytics,
					insights: analytics.insights,
					recommendations: analytics.recommendations,
					benchmarks: analytics.benchmarks,
				},
			});
		} catch (error) {
			console.error("Error fetching analytics:", error);
			res.status(500).json({
				success: false,
				message: error.message || "Failed to fetch analytics",
			});
		}
	}
);

/**
 * @route POST /api/interview/feedback
 * @desc Submit feedback for interview experience
 * @access Private (All authenticated users)
 */
router.post("/feedback", authenticateToken, async (req, res) => {
	try {
		const {
			sessionId,
			rating,
			feedback,
			category = "general",
			anonymous = false,
		} = req.body;

		if (!sessionId || !rating) {
			return res.status(400).json({
				success: false,
				message: "Session ID and rating are required",
			});
		}

		const feedbackData = {
			sessionId,
			rating,
			feedback,
			category,
			anonymous,
			submittedBy: anonymous ? null : req.user.id,
			submittedAt: new Date().toISOString(),
		};

		const result = await interviewService.submitFeedback(feedbackData);

		res.json({
			success: true,
			message: "Feedback submitted successfully",
			data: {
				feedbackId: result.feedbackId,
				acknowledgment: "Thank you for your feedback!",
			},
		});
	} catch (error) {
		console.error("Error submitting feedback:", error);
		res.status(500).json({
			success: false,
			message: error.message || "Failed to submit feedback",
		});
	}
});

// Error handling middleware specific to interview routes
router.use((error, req, res, next) => {
	console.error("Interview Assessment Route Error:", error);

	if (error.code === "LIMIT_FILE_SIZE") {
		return res.status(413).json({
			success: false,
			message: "Audio file too large. Maximum size is 50MB.",
		});
	}

	if (error.message.includes("Invalid file type")) {
		return res.status(400).json({
			success: false,
			message: "Invalid file type. Only audio and video files are allowed.",
		});
	}

	res.status(500).json({
		success: false,
		message: "Interview assessment error occurred",
		error: process.env.NODE_ENV === "development" ? error.message : undefined,
	});
});

module.exports = router;
