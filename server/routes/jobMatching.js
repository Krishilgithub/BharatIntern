/**
 * Job Matching Routes for BharatIntern AI Platform
 * Handles intelligent job-candidate matching and recommendations
 */

const express = require("express");
const router = express.Router();

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
const JobMatchingService = require("../services/JobMatchingService");
const { extractTextFromFile } = require("../utils/fileParser");

// Initialize services
const jobMatchingService = new JobMatchingService();

/**
 * @route POST /api/job-matching/match-candidates
 * @desc Find best candidates for a job posting
 * @access Protected - Company/Admin
 */
router.post(
	"/match-candidates",
	verifyToken,
	checkPermission("job_matching"),
	catchAsync(async (req, res) => {
		const {
			jobDescription,
			requirements,
			skills = [],
			experience = 0,
			location = "",
			industry = "general",
			matchingCriteria = "comprehensive",
			maxResults = 50,
		} = req.body;

		if (!jobDescription && !requirements) {
			throw new AppError("Job description or requirements are required", 400);
		}

		const jobData = {
			description: jobDescription || requirements,
			skills: skills,
			requiredExperience: experience,
			location: location,
			industry: industry,
			postedBy: req.user.id,
			companyId: req.user.companyId || null,
		};

		const matchingOptions = {
			criteria: matchingCriteria,
			maxResults: maxResults,
			includeScoring: true,
			includeExplanations: true,
			requestedBy: req.user.id,
		};

		const matches = await jobMatchingService.findMatchingCandidates(
			jobData,
			matchingOptions
		);

		res.json({
			success: true,
			jobData: {
				description: jobData.description.substring(0, 200) + "...",
				skills: jobData.skills,
				experience: jobData.requiredExperience,
				industry: jobData.industry,
			},
			matches: matches.candidates,
			totalMatches: matches.totalFound,
			matchingCriteria: matchingCriteria,
			algorithmVersion: matches.algorithmVersion,
			processingTime: matches.processingTime,
			recommendations: matches.recommendations,
		});
	})
);

/**
 * @route POST /api/job-matching/match-jobs
 * @desc Find best jobs for a candidate
 * @access Protected - Candidate
 */
router.post(
	"/match-jobs",
	verifyToken,
	checkPermission("job_matching"),
	upload.single("resume"),
	validateFileUpload("resume", false),
	cleanupFiles,
	catchAsync(async (req, res) => {
		const {
			candidateProfile = {},
			preferences = {},
			location = "",
			salaryRange = {},
			workType = "any",
			maxResults = 20,
		} = req.body;

		let profile = candidateProfile;

		// If resume uploaded, extract profile information
		if (req.file) {
			const extractionResult = await extractTextFromFile(req.file.path);
			if (extractionResult.success) {
				const resumeAnalysis =
					await jobMatchingService.analyzeResumeForMatching(
						extractionResult.text
					);
				profile = {
					...profile,
					...resumeAnalysis,
				};
			}
		}

		const candidateData = {
			...profile,
			candidateId: req.user.id,
			location: location,
			preferences: preferences,
			salaryRange: salaryRange,
			workType: workType,
		};

		const matchingOptions = {
			maxResults: maxResults,
			includeScoring: true,
			includeReasons: true,
			personalizedRecommendations: true,
		};

		const matches = await jobMatchingService.findMatchingJobs(
			candidateData,
			matchingOptions
		);

		res.json({
			success: true,
			candidateProfile: {
				skills: profile.skills || [],
				experience: profile.totalExperience || 0,
				education: profile.education || [],
				preferences: preferences,
			},
			matches: matches.jobs,
			totalMatches: matches.totalFound,
			personalizedInsights: matches.insights,
			marketAnalysis: matches.marketAnalysis,
			processingTime: matches.processingTime,
			recommendations: matches.recommendations,
		});
	})
);

/**
 * @route POST /api/job-matching/calculate-match
 * @desc Calculate match score between specific candidate and job
 * @access Protected
 */
router.post(
	"/calculate-match",
	verifyToken,
	upload.single("resume"),
	validateFileUpload("resume", false),
	cleanupFiles,
	catchAsync(async (req, res) => {
		const {
			jobDescription,
			candidateProfile = {},
			detailedAnalysis = true,
		} = req.body;

		if (!jobDescription) {
			throw new AppError("Job description is required", 400);
		}

		let profile = candidateProfile;

		// Extract profile from resume if provided
		if (req.file) {
			const extractionResult = await extractTextFromFile(req.file.path);
			if (extractionResult.success) {
				profile = await jobMatchingService.analyzeResumeForMatching(
					extractionResult.text
				);
			}
		}

		const matchAnalysis = await jobMatchingService.calculateDetailedMatch(
			profile,
			jobDescription,
			{
				includeSkillsBreakdown: detailedAnalysis,
				includeExperienceAnalysis: detailedAnalysis,
				includeRecommendations: detailedAnalysis,
				requestedBy: req.user.id,
			}
		);

		res.json({
			success: true,
			matchScore: matchAnalysis.overallScore,
			breakdown: matchAnalysis.breakdown,
			strengths: matchAnalysis.strengths,
			gaps: matchAnalysis.gaps,
			recommendations: matchAnalysis.recommendations,
			confidence: matchAnalysis.confidence,
			processingTime: matchAnalysis.processingTime,
			methodology: matchAnalysis.methodology,
		});
	})
);

/**
 * @route POST /api/job-matching/skill-demand
 * @desc Analyze skill demand in the job market
 * @access Public with enhanced features for authenticated users
 */
router.post(
	"/skill-demand",
	optionalAuth,
	catchAsync(async (req, res) => {
		const {
			skills = [],
			location = "global",
			industry = "all",
			timeframe = "3m",
			includeProjections = false,
		} = req.body;

		if (skills.length === 0) {
			throw new AppError("At least one skill is required for analysis", 400);
		}

		const demandAnalysis = await jobMatchingService.analyzeSkillDemand(skills, {
			location: location,
			industry: industry,
			timeframe: timeframe,
			includeProjections: includeProjections && !!req.user,
			includeSalaryData: !!req.user,
			requestedBy: req.user?.id,
		});

		res.json({
			success: true,
			skills: skills,
			demandAnalysis: demandAnalysis.skillsData,
			marketInsights: demandAnalysis.insights,
			trends: demandAnalysis.trends,
			recommendations: demandAnalysis.recommendations,
			projections: req.user ? demandAnalysis.projections : null,
			salaryInsights: req.user ? demandAnalysis.salaryData : null,
			lastUpdated: demandAnalysis.lastUpdated,
			processingTime: demandAnalysis.processingTime,
		});
	})
);

/**
 * @route GET /api/job-matching/market-insights
 * @desc Get job market insights and trends
 * @access Public with enhanced data for authenticated users
 */
router.get(
	"/market-insights",
	optionalAuth,
	catchAsync(async (req, res) => {
		const {
			industry = "technology",
			location = "global",
			period = "6m",
			role = "all",
		} = req.query;

		const insights = await jobMatchingService.getMarketInsights({
			industry: industry,
			location: location,
			period: period,
			role: role,
			enhancedData: !!req.user,
			requestedBy: req.user?.id,
		});

		res.json({
			success: true,
			insights: {
				overview: insights.overview,
				trends: insights.trends,
				hotSkills: insights.hotSkills,
				growingRoles: insights.growingRoles,
				salaryTrends: req.user ? insights.salaryTrends : null,
				demandForecast: req.user ? insights.forecast : null,
			},
			metadata: {
				industry: industry,
				location: location,
				period: period,
				generatedAt: new Date().toISOString(),
				dataPoints: insights.dataPoints,
			},
		});
	})
);

/**
 * @route POST /api/job-matching/optimize-profile
 * @desc Get profile optimization suggestions based on market demand
 * @access Protected - Candidates
 */
router.post(
	"/optimize-profile",
	verifyToken,
	checkPermission("job_matching"),
	upload.single("resume"),
	validateFileUpload("resume", false),
	cleanupFiles,
	catchAsync(async (req, res) => {
		const {
			targetRoles = [],
			targetIndustry = "technology",
			careerGoals = "",
			timeframe = "6m",
		} = req.body;

		let candidateProfile = {};

		// Extract current profile
		if (req.file) {
			const extractionResult = await extractTextFromFile(req.file.path);
			if (extractionResult.success) {
				candidateProfile = await jobMatchingService.analyzeResumeForMatching(
					extractionResult.text
				);
			}
		}

		const optimization = await jobMatchingService.optimizeProfile(
			candidateProfile,
			{
				targetRoles: targetRoles,
				targetIndustry: targetIndustry,
				careerGoals: careerGoals,
				timeframe: timeframe,
				candidateId: req.user.id,
			}
		);

		res.json({
			success: true,
			currentProfile: {
				skills: candidateProfile.skills || [],
				experience: candidateProfile.totalExperience || 0,
				strengths: optimization.currentStrengths,
			},
			recommendations: optimization.recommendations,
			skillGaps: optimization.skillGaps,
			learningPath: optimization.learningPath,
			marketAlignment: optimization.marketAlignment,
			projectedImprovement: optimization.projectedImpact,
			actionPlan: optimization.actionPlan,
			processingTime: optimization.processingTime,
		});
	})
);

/**
 * @route POST /api/job-matching/bulk-match
 * @desc Process multiple candidates or jobs for matching
 * @access Protected - Company/Admin
 */
router.post(
	"/bulk-match",
	verifyToken,
	checkPermission("premium"),
	upload.array("resumes", 20),
	validateFileUpload("resumes", false),
	cleanupFiles,
	catchAsync(async (req, res) => {
		const {
			jobDescription,
			matchingCriteria = "comprehensive",
			includeReports = true,
		} = req.body;

		if (!jobDescription) {
			throw new AppError("Job description is required for bulk matching", 400);
		}

		if (!req.files || req.files.length === 0) {
			throw new AppError("At least one resume file is required", 400);
		}

		const candidates = [];

		// Process each resume
		for (const file of req.files) {
			try {
				const extractionResult = await extractTextFromFile(file.path);
				if (extractionResult.success) {
					const profile = await jobMatchingService.analyzeResumeForMatching(
						extractionResult.text
					);
					candidates.push({
						fileName: file.originalname,
						profile: profile,
						fileSize: file.size,
					});
				}
			} catch (error) {
				console.warn(`Failed to process ${file.originalname}:`, error.message);
			}
		}

		const bulkResults = await jobMatchingService.bulkMatchCandidates(
			candidates,
			jobDescription,
			{
				criteria: matchingCriteria,
				includeReports: includeReports,
				requestedBy: req.user.id,
			}
		);

		res.json({
			success: true,
			processedCandidates: candidates.length,
			matches: bulkResults.matches,
			summary: bulkResults.summary,
			reports: includeReports ? bulkResults.reports : null,
			recommendations: bulkResults.recommendations,
			processingTime: bulkResults.processingTime,
			exportOptions: bulkResults.exportFormats,
		});
	})
);

/**
 * @route GET /api/job-matching/candidate-rankings
 * @desc Get ranked list of candidates for a company
 * @access Protected - Company/Admin
 */
router.get(
	"/candidate-rankings",
	verifyToken,
	checkPermission("premium"),
	catchAsync(async (req, res) => {
		const {
			jobId = null,
			skills = "",
			experience = "all",
			location = "all",
			sortBy = "score",
			page = 1,
			limit = 25,
		} = req.query;

		const filters = {
			skills: skills ? skills.split(",") : [],
			experience: experience !== "all" ? parseInt(experience) : null,
			location: location !== "all" ? location : null,
			companyId: req.user.companyId,
		};

		const options = {
			jobId: jobId,
			sortBy: sortBy,
			page: parseInt(page),
			limit: parseInt(limit),
			includeProfiles: true,
			includeScoring: true,
		};

		const rankings = await jobMatchingService.getCandidateRankings(
			filters,
			options
		);

		res.json({
			success: true,
			candidates: rankings.candidates,
			totalCandidates: rankings.totalCount,
			filters: filters,
			pagination: {
				currentPage: rankings.currentPage,
				totalPages: rankings.totalPages,
				limit: rankings.limit,
			},
			aggregateStats: rankings.stats,
			processingTime: rankings.processingTime,
		});
	})
);

/**
 * @route POST /api/job-matching/save-search
 * @desc Save job search criteria for alerts
 * @access Protected - Candidates
 */
router.post(
	"/save-search",
	verifyToken,
	checkPermission("job_matching"),
	catchAsync(async (req, res) => {
		const {
			searchName,
			criteria,
			alertFrequency = "weekly",
			isActive = true,
		} = req.body;

		if (!searchName || !criteria) {
			throw new AppError("Search name and criteria are required", 400);
		}

		const savedSearch = await jobMatchingService.saveSearchCriteria({
			name: searchName,
			criteria: criteria,
			alertFrequency: alertFrequency,
			isActive: isActive,
			candidateId: req.user.id,
			createdAt: new Date().toISOString(),
		});

		res.json({
			success: true,
			savedSearch: savedSearch,
			message: "Search criteria saved successfully",
		});
	})
);

/**
 * @route GET /api/job-matching/saved-searches
 * @desc Get user's saved search criteria
 * @access Protected - Candidates
 */
router.get(
	"/saved-searches",
	verifyToken,
	checkPermission("job_matching"),
	catchAsync(async (req, res) => {
		const { active = "all" } = req.query;

		const savedSearches = await jobMatchingService.getSavedSearches(
			req.user.id,
			{ activeOnly: active === "true" }
		);

		res.json({
			success: true,
			savedSearches: savedSearches,
			totalSaved: savedSearches.length,
		});
	})
);

/**
 * @route GET /api/job-matching/statistics
 * @desc Get job matching platform statistics
 * @access Protected - Admin/Company
 */
router.get(
	"/statistics",
	verifyToken,
	checkPermission("premium"),
	catchAsync(async (req, res) => {
		const { period = "30d", breakdown = "daily" } = req.query;

		const statistics = await jobMatchingService.getMatchingStatistics({
			period: period,
			breakdown: breakdown,
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

// Error handling middleware specific to job matching routes
router.use((error, req, res, next) => {
	// Log job matching specific errors
	console.error(`Job Matching API Error: ${error.message}`, {
		endpoint: req.originalUrl,
		method: req.method,
		user: req.user?.id,
		files: req.files?.map((f) => f.originalname),
	});

	next(error);
});

module.exports = router;
