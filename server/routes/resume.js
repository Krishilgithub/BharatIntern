/**
 * Resume Analysis Routes for BharatIntern AI Platform
 * Handles resume parsing, analysis, scoring, and recommendations
 */

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs").promises;

// Middleware imports
const {
	upload,
	validateFileUpload,
	cleanupFiles,
} = require("../middleware/upload");
const {
	verifyToken,
	optionalAuth,
	checkPermission,
} = require("../middleware/auth");
const { catchAsync, AppError } = require("../middleware/errorHandler");

// Service imports
const ResumeAnalyzer = require("../services/ResumeAnalyzer");
const { extractTextFromFile } = require("../utils/fileParser");
const { generateEmbeddings, cosineSimilarity } = require("../utils/aiHelpers");

// Initialize services
const resumeAnalyzer = new ResumeAnalyzer();

/**
 * @route POST /api/resume/analyze
 * @desc Analyze uploaded resume
 * @access Public (with optional auth for enhanced features)
 */
router.post(
	"/analyze",
	optionalAuth,
	upload.single("resume"),
	validateFileUpload("resume", true),
	cleanupFiles,
	catchAsync(async (req, res) => {
		if (!req.file) {
			throw new AppError("Resume file is required", 400);
		}

		const {
			jobDescription = "",
			analysisType = "comprehensive",
			includeRecommendations = true,
			generateScore = true,
		} = req.body;

		// Extract text from uploaded file
		const extractionResult = await extractTextFromFile(req.file.path);

		if (!extractionResult.success) {
			throw new AppError(
				`Failed to extract text from resume: ${extractionResult.error}`,
				400
			);
		}

		// Analyze resume
		const analysisOptions = {
			includeSkills: true,
			includeExperience: true,
			includeEducation: true,
			includeContacts: true,
			includeSummary: true,
			jobDescription: jobDescription,
			analysisType: analysisType,
			userId: req.user?.id,
		};

		const analysisResult = await resumeAnalyzer.analyzeResume(
			extractionResult.text,
			analysisOptions
		);

		// Generate recommendations if requested
		let recommendations = null;
		if (includeRecommendations) {
			recommendations = await resumeAnalyzer.generateRecommendations(
				analysisResult,
				jobDescription
			);
		}

		// Calculate match score if job description provided
		let matchScore = null;
		if (jobDescription) {
			matchScore = await resumeAnalyzer.calculateJobMatch(
				analysisResult,
				jobDescription
			);
		}

		// Prepare response
		const response = {
			success: true,
			analysis: {
				...analysisResult,
				fileInfo: {
					originalName: req.file.originalname,
					size: req.file.size,
					type: path.extname(req.file.originalname),
					extractedText: extractionResult.text.substring(0, 500) + "...", // Preview only
					wordCount: extractionResult.metadata.wordCount,
					sections: extractionResult.sections,
				},
			},
			recommendations: recommendations,
			matchScore: matchScore,
			processingTime: Date.now() - req.startTime,
			enhancedFeatures: !!req.user,
		};

		res.json(response);
	})
);

/**
 * @route POST /api/resume/compare
 * @desc Compare multiple resumes
 * @access Protected - Company/Admin
 */
router.post(
	"/compare",
	verifyToken,
	checkPermission("premium"),
	upload.array("resumes", 5),
	validateFileUpload("resumes", true),
	cleanupFiles,
	catchAsync(async (req, res) => {
		if (!req.files || req.files.length < 2) {
			throw new AppError(
				"At least 2 resume files are required for comparison",
				400
			);
		}

		const { jobDescription, criteria = "overall" } = req.body;
		const comparisons = [];

		// Process each resume
		for (const file of req.files) {
			const extractionResult = await extractTextFromFile(file.path);

			if (extractionResult.success) {
				const analysisResult = await resumeAnalyzer.analyzeResume(
					extractionResult.text,
					{
						includeSkills: true,
						includeExperience: true,
						jobDescription: jobDescription,
					}
				);

				comparisons.push({
					fileName: file.originalname,
					fileSize: file.size,
					analysis: analysisResult,
					extractedText: extractionResult.text,
				});
			}
		}

		// Generate comparison matrix
		const comparisonMatrix = await resumeAnalyzer.compareResumes(
			comparisons,
			jobDescription,
			criteria
		);

		res.json({
			success: true,
			comparisons: comparisons.map((c) => ({
				fileName: c.fileName,
				fileSize: c.fileSize,
				analysis: c.analysis,
			})),
			comparisonMatrix: comparisonMatrix,
			recommendation: comparisonMatrix.topCandidate,
			processingTime: Date.now() - req.startTime,
		});
	})
);

/**
 * @route POST /api/resume/skills-gap
 * @desc Analyze skills gap between resume and job requirements
 * @access Public with auth for enhanced features
 */
router.post(
	"/skills-gap",
	optionalAuth,
	upload.single("resume"),
	validateFileUpload("resume", true),
	cleanupFiles,
	catchAsync(async (req, res) => {
		const { jobDescription, targetRole } = req.body;

		if (!jobDescription && !targetRole) {
			throw new AppError(
				"Either job description or target role is required",
				400
			);
		}

		if (!req.file) {
			throw new AppError("Resume file is required", 400);
		}

		// Extract and analyze resume
		const extractionResult = await extractTextFromFile(req.file.path);
		if (!extractionResult.success) {
			throw new AppError(
				`Failed to extract text: ${extractionResult.error}`,
				400
			);
		}

		const resumeAnalysis = await resumeAnalyzer.analyzeResume(
			extractionResult.text
		);

		// Perform skills gap analysis
		const skillsGapAnalysis = await resumeAnalyzer.analyzeSkillsGap(
			resumeAnalysis,
			jobDescription || targetRole
		);

		res.json({
			success: true,
			currentSkills: resumeAnalysis.skills,
			requiredSkills: skillsGapAnalysis.requiredSkills,
			missingSkills: skillsGapAnalysis.missingSkills,
			matchingSkills: skillsGapAnalysis.matchingSkills,
			gapScore: skillsGapAnalysis.gapScore,
			recommendations: skillsGapAnalysis.recommendations,
			learningPath: req.user ? skillsGapAnalysis.learningPath : null,
			processingTime: Date.now() - req.startTime,
		});
	})
);

/**
 * @route POST /api/resume/extract-info
 * @desc Extract specific information from resume
 * @access Public
 */
router.post(
	"/extract-info",
	optionalAuth,
	upload.single("resume"),
	validateFileUpload("resume", true),
	cleanupFiles,
	catchAsync(async (req, res) => {
		const { extractFields = ["all"] } = req.body;

		if (!req.file) {
			throw new AppError("Resume file is required", 400);
		}

		// Extract text from file
		const extractionResult = await extractTextFromFile(req.file.path);
		if (!extractionResult.success) {
			throw new AppError(
				`Failed to extract text: ${extractionResult.error}`,
				400
			);
		}

		// Extract specific information
		const extractedInfo = await resumeAnalyzer.extractInformation(
			extractionResult.text,
			extractFields
		);

		res.json({
			success: true,
			extractedInfo: extractedInfo,
			fileInfo: {
				name: req.file.originalname,
				size: req.file.size,
				wordCount: extractionResult.metadata.wordCount,
			},
			processingTime: Date.now() - req.startTime,
		});
	})
);

/**
 * @route POST /api/resume/score
 * @desc Get resume scoring based on various criteria
 * @access Public with enhanced scoring for authenticated users
 */
router.post(
	"/score",
	optionalAuth,
	upload.single("resume"),
	validateFileUpload("resume", true),
	cleanupFiles,
	catchAsync(async (req, res) => {
		const {
			scoringCriteria = "ats",
			jobDescription = "",
			industry = "general",
		} = req.body;

		if (!req.file) {
			throw new AppError("Resume file is required", 400);
		}

		// Extract and analyze resume
		const extractionResult = await extractTextFromFile(req.file.path);
		if (!extractionResult.success) {
			throw new AppError(
				`Failed to extract text: ${extractionResult.error}`,
				400
			);
		}

		const analysisResult = await resumeAnalyzer.analyzeResume(
			extractionResult.text
		);

		// Generate comprehensive scoring
		const scoring = await resumeAnalyzer.scoreResume(analysisResult, {
			criteria: scoringCriteria,
			jobDescription: jobDescription,
			industry: industry,
			enhancedScoring: !!req.user,
		});

		res.json({
			success: true,
			overallScore: scoring.overallScore,
			categoryScores: scoring.categoryScores,
			strengths: scoring.strengths,
			weaknesses: scoring.weaknesses,
			improvementSuggestions: scoring.improvementSuggestions,
			atsCompatibility: scoring.atsCompatibility,
			industryAlignment: scoring.industryAlignment,
			detailedFeedback: req.user ? scoring.detailedFeedback : null,
			processingTime: Date.now() - req.startTime,
		});
	})
);

/**
 * @route GET /api/resume/templates
 * @desc Get resume templates and formats
 * @access Public
 */
router.get(
	"/templates",
	catchAsync(async (req, res) => {
		const { category = "all", industry = "general" } = req.query;

		const templates = await resumeAnalyzer.getResumeTemplates(
			category,
			industry
		);

		res.json({
			success: true,
			templates: templates,
			categories: [
				"professional",
				"creative",
				"technical",
				"academic",
				"entry-level",
			],
			industries: [
				"technology",
				"finance",
				"healthcare",
				"education",
				"marketing",
				"general",
			],
		});
	})
);

/**
 * @route POST /api/resume/optimize
 * @desc Optimize resume for ATS systems
 * @access Protected - Enhanced feature
 */
router.post(
	"/optimize",
	verifyToken,
	checkPermission("premium"),
	upload.single("resume"),
	validateFileUpload("resume", true),
	cleanupFiles,
	catchAsync(async (req, res) => {
		const {
			jobDescription,
			targetATS = "general",
			optimizationLevel = "moderate",
		} = req.body;

		if (!req.file) {
			throw new AppError("Resume file is required", 400);
		}

		// Extract and analyze resume
		const extractionResult = await extractTextFromFile(req.file.path);
		if (!extractionResult.success) {
			throw new AppError(
				`Failed to extract text: ${extractionResult.error}`,
				400
			);
		}

		// Optimize resume
		const optimization = await resumeAnalyzer.optimizeForATS(
			extractionResult.text,
			{
				jobDescription: jobDescription,
				targetATS: targetATS,
				level: optimizationLevel,
			}
		);

		res.json({
			success: true,
			originalScore: optimization.originalScore,
			optimizedScore: optimization.optimizedScore,
			improvements: optimization.improvements,
			optimizedContent: optimization.optimizedContent,
			keywordSuggestions: optimization.keywordSuggestions,
			formatRecommendations: optimization.formatRecommendations,
			processingTime: Date.now() - req.startTime,
		});
	})
);

/**
 * @route GET /api/resume/history
 * @desc Get user's resume analysis history
 * @access Protected
 */
router.get(
	"/history",
	verifyToken,
	catchAsync(async (req, res) => {
		const { page = 1, limit = 10 } = req.query;
		const userId = req.user.id;

		// In production, this would fetch from database
		const history = await resumeAnalyzer.getUserHistory(userId, {
			page,
			limit,
		});

		res.json({
			success: true,
			history: history.items,
			pagination: {
				currentPage: parseInt(page),
				totalPages: history.totalPages,
				totalItems: history.totalItems,
				limit: parseInt(limit),
			},
		});
	})
);

// Error handling middleware specific to resume routes
router.use((error, req, res, next) => {
	// Log resume-specific errors
	console.error(`Resume API Error: ${error.message}`, {
		endpoint: req.originalUrl,
		method: req.method,
		user: req.user?.id,
		file: req.file?.originalname,
	});

	next(error);
});

module.exports = router;
