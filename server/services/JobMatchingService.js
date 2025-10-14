/**
 * Job Matching Service for BharatIntern AI Platform
 * Intelligent candidate-job matching using AI algorithms
 */

const {
	generateEmbeddings,
	cosineSimilarity,
	generateTextGemini,
	classifyText,
	extractEntities,
} = require("../utils/aiHelpers");
const config = require("../config");

class JobMatchingService {
	constructor() {
		this.candidates = new Map(); // In-memory storage (use database in production)
		this.jobs = new Map();
		this.savedSearches = new Map();
		this.matchingHistory = new Map();
		this.skillsDatabase = this.initializeSkillsDatabase();
		this.industryData = this.initializeIndustryData();
		this.salaryData = this.initializeSalaryData();
	}

	/**
	 * Find matching candidates for a job posting
	 */
	async findMatchingCandidates(jobData, options = {}) {
		const startTime = Date.now();
		const {
			criteria = "comprehensive",
			maxResults = 50,
			includeScoring = true,
			includeExplanations = true,
			requestedBy,
		} = options;

		try {
			// Generate job embedding for semantic matching
			const jobText = this.createJobSearchText(jobData);
			const jobEmbedding = await generateEmbeddings(jobText);

			if (!jobEmbedding.success) {
				throw new Error("Failed to generate job embedding");
			}

			// Get all candidates (in production, this would be from database)
			const allCandidates = this.generateMockCandidates(100);

			const matches = [];

			// Calculate match scores for each candidate
			for (const candidate of allCandidates) {
				try {
					const candidateText = this.createCandidateSearchText(candidate);
					const candidateEmbedding = await generateEmbeddings(candidateText);

					if (candidateEmbedding.success) {
						const semanticScore = cosineSimilarity(
							jobEmbedding.embedding,
							candidateEmbedding.embedding
						);

						// Calculate comprehensive match score
						const matchDetails = await this.calculateComprehensiveMatch(
							candidate,
							jobData
						);

						const finalScore = this.calculateWeightedScore(
							{
								semantic: semanticScore * 100,
								skills: matchDetails.skillsScore,
								experience: matchDetails.experienceScore,
								education: matchDetails.educationScore,
								location: matchDetails.locationScore,
							},
							criteria
						);

						if (finalScore >= 30) {
							// Minimum threshold
							matches.push({
								candidateId: candidate.id,
								candidate: this.sanitizeCandidateForResponse(candidate),
								matchScore: Math.round(finalScore),
								breakdown: includeScoring ? matchDetails : null,
								reasons: includeExplanations
									? this.generateMatchReasons(matchDetails, jobData)
									: null,
								confidence: this.calculateConfidence(matchDetails),
								lastUpdated: candidate.lastUpdated || new Date().toISOString(),
							});
						}
					}
				} catch (error) {
					console.warn(
						`Error processing candidate ${candidate.id}:`,
						error.message
					);
				}
			}

			// Sort by match score and limit results
			matches.sort((a, b) => b.matchScore - a.matchScore);
			const topMatches = matches.slice(0, maxResults);

			return {
				candidates: topMatches,
				totalFound: matches.length,
				algorithmVersion: "2.1.0",
				processingTime: Date.now() - startTime,
				recommendations: this.generateRecruitmentRecommendations(
					topMatches,
					jobData
				),
			};
		} catch (error) {
			console.error("Error finding matching candidates:", error);
			throw new Error(`Candidate matching failed: ${error.message}`);
		}
	}

	/**
	 * Find matching jobs for a candidate
	 */
	async findMatchingJobs(candidateData, options = {}) {
		const startTime = Date.now();
		const {
			maxResults = 20,
			includeScoring = true,
			includeReasons = true,
			personalizedRecommendations = true,
		} = options;

		try {
			// Generate candidate embedding
			const candidateText = this.createCandidateSearchText(candidateData);
			const candidateEmbedding = await generateEmbeddings(candidateText);

			if (!candidateEmbedding.success) {
				throw new Error("Failed to generate candidate embedding");
			}

			// Get available jobs (mock data for now)
			const availableJobs = this.generateMockJobs(200);
			const matches = [];

			// Calculate match scores for each job
			for (const job of availableJobs) {
				try {
					const jobText = this.createJobSearchText(job);
					const jobEmbedding = await generateEmbeddings(jobText);

					if (jobEmbedding.success) {
						const semanticScore = cosineSimilarity(
							candidateEmbedding.embedding,
							jobEmbedding.embedding
						);

						// Calculate comprehensive match
						const matchDetails = await this.calculateJobCandidateMatch(
							candidateData,
							job
						);

						const finalScore = this.calculateWeightedScore(
							{
								semantic: semanticScore * 100,
								skills: matchDetails.skillsScore,
								experience: matchDetails.experienceScore,
								salary: matchDetails.salaryScore,
								location: matchDetails.locationScore,
								preferences: matchDetails.preferencesScore,
							},
							"candidate_focused"
						);

						if (finalScore >= 25) {
							// Lower threshold for job recommendations
							matches.push({
								jobId: job.id,
								job: this.sanitizeJobForResponse(job),
								matchScore: Math.round(finalScore),
								breakdown: includeScoring ? matchDetails : null,
								reasons: includeReasons
									? this.generateJobMatchReasons(matchDetails, candidateData)
									: null,
								salaryMatch: this.calculateSalaryMatch(
									candidateData.salaryRange,
									job.salary
								),
								posted: job.postedDate || new Date().toISOString(),
							});
						}
					}
				} catch (error) {
					console.warn(`Error processing job ${job.id}:`, error.message);
				}
			}

			// Sort and limit results
			matches.sort((a, b) => b.matchScore - a.matchScore);
			const topMatches = matches.slice(0, maxResults);

			// Generate insights and market analysis
			const insights = personalizedRecommendations
				? await this.generatePersonalizedInsights(candidateData, topMatches)
				: null;

			const marketAnalysis = await this.generateMarketAnalysis(candidateData);

			return {
				jobs: topMatches,
				totalFound: matches.length,
				insights: insights,
				marketAnalysis: marketAnalysis,
				processingTime: Date.now() - startTime,
				recommendations: this.generateJobSearchRecommendations(
					candidateData,
					topMatches
				),
			};
		} catch (error) {
			console.error("Error finding matching jobs:", error);
			throw new Error(`Job matching failed: ${error.message}`);
		}
	}

	/**
	 * Calculate detailed match between candidate and job
	 */
	async calculateDetailedMatch(candidateProfile, jobDescription, options = {}) {
		const startTime = Date.now();
		const {
			includeSkillsBreakdown = true,
			includeExperienceAnalysis = true,
			includeRecommendations = true,
			requestedBy,
		} = options;

		try {
			// Parse job requirements
			const jobRequirements = await this.parseJobRequirements(jobDescription);

			// Calculate various match components
			const skillsMatch = this.calculateSkillsMatch(
				candidateProfile.skills || [],
				jobRequirements.skills
			);
			const experienceMatch = this.calculateExperienceMatch(
				candidateProfile,
				jobRequirements
			);
			const educationMatch = this.calculateEducationMatch(
				candidateProfile.education || [],
				jobRequirements.education
			);

			// Generate semantic similarity
			const candidateText = this.createCandidateSearchText(candidateProfile);
			const candidateEmbedding = await generateEmbeddings(candidateText);
			const jobEmbedding = await generateEmbeddings(jobDescription);

			let semanticScore = 0;
			if (candidateEmbedding.success && jobEmbedding.success) {
				semanticScore =
					cosineSimilarity(
						candidateEmbedding.embedding,
						jobEmbedding.embedding
					) * 100;
			}

			// Calculate overall score
			const overallScore = this.calculateWeightedScore(
				{
					semantic: semanticScore,
					skills: skillsMatch.score,
					experience: experienceMatch.score,
					education: educationMatch.score,
				},
				"comprehensive"
			);

			const breakdown = {
				skills: includeSkillsBreakdown
					? skillsMatch
					: { score: skillsMatch.score },
				experience: includeExperienceAnalysis
					? experienceMatch
					: { score: experienceMatch.score },
				education: { score: educationMatch.score },
				semantic: { score: Math.round(semanticScore) },
			};

			const strengths = this.identifyMatchStrengths(breakdown);
			const gaps = this.identifyMatchGaps(breakdown, jobRequirements);
			const recommendations = includeRecommendations
				? await this.generateMatchRecommendations(gaps, candidateProfile)
				: [];

			return {
				overallScore: Math.round(overallScore),
				breakdown: breakdown,
				strengths: strengths,
				gaps: gaps,
				recommendations: recommendations,
				confidence: this.calculateMatchConfidence(breakdown),
				processingTime: Date.now() - startTime,
				methodology: this.getMatchingMethodology(),
			};
		} catch (error) {
			console.error("Error calculating detailed match:", error);
			throw new Error(`Match calculation failed: ${error.message}`);
		}
	}

	/**
	 * Analyze skill demand in the job market
	 */
	async analyzeSkillDemand(skills, options = {}) {
		const startTime = Date.now();
		const {
			location = "global",
			industry = "all",
			timeframe = "3m",
			includeProjections = false,
			includeSalaryData = false,
			requestedBy,
		} = options;

		try {
			const skillsData = {};

			// Analyze each skill
			for (const skill of skills) {
				const demandData = await this.getSkillDemandData(skill, {
					location: location,
					industry: industry,
					timeframe: timeframe,
				});

				skillsData[skill] = {
					demandLevel: demandData.level,
					growth: demandData.growth,
					jobCount: demandData.jobCount,
					averageSalary: includeSalaryData ? demandData.salary : null,
					relatedSkills: demandData.relatedSkills,
					topIndustries: demandData.industries,
					competitionLevel: demandData.competition,
				};
			}

			// Generate insights
			const insights = this.generateSkillInsights(skillsData, options);

			// Calculate trends
			const trends = this.analyzeSkillTrends(skills, timeframe);

			// Generate recommendations
			const recommendations = this.generateSkillRecommendations(
				skillsData,
				insights
			);

			// Future projections (premium feature)
			const projections = includeProjections
				? await this.generateSkillProjections(skills, options)
				: null;

			return {
				skillsData: skillsData,
				insights: insights,
				trends: trends,
				recommendations: recommendations,
				projections: projections,
				salaryData: includeSalaryData
					? this.getSkillSalaryData(skills, location)
					: null,
				lastUpdated: new Date().toISOString(),
				processingTime: Date.now() - startTime,
			};
		} catch (error) {
			console.error("Error analyzing skill demand:", error);
			throw new Error(`Skill demand analysis failed: ${error.message}`);
		}
	}

	/**
	 * Get job market insights and trends
	 */
	async getMarketInsights(options = {}) {
		const {
			industry = "technology",
			location = "global",
			period = "6m",
			role = "all",
			enhancedData = false,
			requestedBy,
		} = options;

		try {
			const overview = {
				totalJobs: this.calculateTotalJobs(industry, location),
				averageSalary: this.calculateAverageSalary(industry, location),
				growthRate: this.calculateGrowthRate(industry, period),
				competitionLevel: this.calculateCompetitionLevel(industry),
			};

			const trends = {
				salaryTrend: this.getSalaryTrend(industry, period),
				demandTrend: this.getDemandTrend(industry, period),
				skillsTrend: this.getSkillsTrend(industry, period),
			};

			const hotSkills = this.getHotSkills(industry, location, 10);
			const growingRoles = this.getGrowingRoles(industry, location, 15);

			// Enhanced data for authenticated users
			const salaryTrends = enhancedData
				? this.getDetailedSalaryTrends(industry, period)
				: null;
			const forecast = enhancedData
				? await this.generateMarketForecast(industry, location)
				: null;

			return {
				overview: overview,
				trends: trends,
				hotSkills: hotSkills,
				growingRoles: growingRoles,
				salaryTrends: salaryTrends,
				forecast: forecast,
				dataPoints: this.getDataPointsCount(industry, location),
			};
		} catch (error) {
			console.error("Error getting market insights:", error);
			throw new Error(`Market insights generation failed: ${error.message}`);
		}
	}

	/**
	 * Optimize candidate profile based on market demand
	 */
	async optimizeProfile(candidateProfile, options = {}) {
		const startTime = Date.now();
		const {
			targetRoles = [],
			targetIndustry = "technology",
			careerGoals = "",
			timeframe = "6m",
			candidateId,
		} = options;

		try {
			// Analyze current profile strengths
			const currentStrengths = this.analyzeProfileStrengths(candidateProfile);

			// Identify market-demanded skills
			const marketDemand = await this.analyzeMarketDemand(
				targetIndustry,
				targetRoles
			);

			// Calculate skill gaps
			const skillGaps = this.calculateSkillGaps(
				candidateProfile.skills || [],
				marketDemand.skills
			);

			// Generate learning path
			const learningPath = await this.generateLearningPath(
				skillGaps,
				timeframe
			);

			// Calculate market alignment
			const marketAlignment = this.assessMarketAlignment(
				candidateProfile,
				marketDemand
			);

			// Generate specific recommendations
			const recommendations = await this.generateOptimizationRecommendations(
				candidateProfile,
				marketDemand,
				skillGaps
			);

			// Create action plan
			const actionPlan = this.createActionPlan(
				recommendations,
				learningPath,
				timeframe
			);

			// Calculate projected impact
			const projectedImpact = this.calculateProjectedImpact(
				candidateProfile,
				recommendations,
				marketDemand
			);

			return {
				currentStrengths: currentStrengths,
				recommendations: recommendations,
				skillGaps: skillGaps,
				learningPath: learningPath,
				marketAlignment: marketAlignment,
				projectedImpact: projectedImpact,
				actionPlan: actionPlan,
				processingTime: Date.now() - startTime,
			};
		} catch (error) {
			console.error("Error optimizing profile:", error);
			throw new Error(`Profile optimization failed: ${error.message}`);
		}
	}

	/**
	 * Process multiple candidates for bulk matching
	 */
	async bulkMatchCandidates(candidates, jobDescription, options = {}) {
		const startTime = Date.now();
		const {
			criteria = "comprehensive",
			includeReports = true,
			requestedBy,
		} = options;

		try {
			const matches = [];
			const reports = [];

			// Process each candidate
			for (const candidateData of candidates) {
				try {
					const matchResult = await this.calculateDetailedMatch(
						candidateData.profile,
						jobDescription,
						{
							includeSkillsBreakdown: true,
							includeRecommendations: false,
							requestedBy: requestedBy,
						}
					);

					matches.push({
						fileName: candidateData.fileName,
						candidateId: candidateData.profile.candidateId || "unknown",
						matchScore: matchResult.overallScore,
						breakdown: matchResult.breakdown,
						strengths: matchResult.strengths,
						gaps: matchResult.gaps,
						confidence: matchResult.confidence,
					});

					if (includeReports) {
						reports.push({
							fileName: candidateData.fileName,
							detailedAnalysis: matchResult,
							recommendations: await this.generateMatchRecommendations(
								matchResult.gaps,
								candidateData.profile
							),
						});
					}
				} catch (error) {
					console.warn(
						`Failed to process ${candidateData.fileName}:`,
						error.message
					);
					matches.push({
						fileName: candidateData.fileName,
						error: error.message,
						matchScore: 0,
					});
				}
			}

			// Sort by match score
			matches.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

			// Generate summary
			const summary = this.generateBulkMatchSummary(matches);

			// Generate recommendations
			const recommendations = this.generateBulkRecommendations(
				matches,
				jobDescription
			);

			return {
				matches: matches,
				summary: summary,
				reports: reports,
				recommendations: recommendations,
				processingTime: Date.now() - startTime,
				exportFormats: ["pdf", "xlsx", "csv"],
			};
		} catch (error) {
			console.error("Error in bulk matching:", error);
			throw new Error(`Bulk matching failed: ${error.message}`);
		}
	}

	/**
	 * Analyze resume for job matching
	 */
	async analyzeResumeForMatching(resumeText) {
		try {
			// Extract key information for matching
			const skills = this.extractSkillsFromText(resumeText);
			const experience = this.extractExperienceFromText(resumeText);
			const education = this.extractEducationFromText(resumeText);
			const contact = this.extractContactFromText(resumeText);

			return {
				skills: skills,
				totalExperience: this.calculateTotalExperience(experience),
				experience: experience,
				education: education,
				contact: contact,
				summary: this.generateProfileSummary(resumeText),
				lastUpdated: new Date().toISOString(),
			};
		} catch (error) {
			console.error("Error analyzing resume for matching:", error);
			return {
				skills: [],
				totalExperience: 0,
				experience: [],
				education: [],
				contact: {},
				summary: "",
			};
		}
	}

	// Helper methods and utilities

	initializeSkillsDatabase() {
		return {
			programming: [
				"JavaScript",
				"Python",
				"Java",
				"C++",
				"React",
				"Node.js",
				"Angular",
			],
			data: [
				"SQL",
				"MongoDB",
				"PostgreSQL",
				"Data Analysis",
				"Machine Learning",
			],
			cloud: ["AWS", "Azure", "Google Cloud", "Docker", "Kubernetes"],
			design: ["UI/UX", "Figma", "Adobe Creative Suite", "Sketch"],
			management: ["Project Management", "Agile", "Scrum", "Leadership"],
		};
	}

	initializeIndustryData() {
		return {
			technology: {
				averageSalary: 85000,
				growthRate: 15,
				hotSkills: ["React", "Python", "AWS", "Machine Learning"],
				demandLevel: "high",
			},
			finance: {
				averageSalary: 75000,
				growthRate: 8,
				hotSkills: ["Excel", "Python", "SQL", "Risk Management"],
				demandLevel: "medium",
			},
			healthcare: {
				averageSalary: 65000,
				growthRate: 12,
				hotSkills: ["Data Analysis", "EMR Systems", "Patient Care"],
				demandLevel: "high",
			},
		};
	}

	initializeSalaryData() {
		return {
			JavaScript: { min: 60000, max: 120000, avg: 85000 },
			Python: { min: 70000, max: 140000, avg: 95000 },
			React: { min: 65000, max: 125000, avg: 90000 },
			AWS: { min: 80000, max: 150000, avg: 110000 },
		};
	}

	createJobSearchText(jobData) {
		return `${jobData.description} ${jobData.skills.join(" ")} ${
			jobData.industry
		} ${jobData.location}`;
	}

	createCandidateSearchText(candidateData) {
		const skills = candidateData.skills ? candidateData.skills.join(" ") : "";
		const experience = candidateData.experience
			? candidateData.experience.map((e) => e.role).join(" ")
			: "";
		return `${skills} ${experience} ${candidateData.summary || ""}`;
	}

	generateMockCandidates(count) {
		const candidates = [];
		const skills = ["JavaScript", "Python", "React", "Node.js", "AWS", "SQL"];
		const roles = [
			"Software Developer",
			"Data Scientist",
			"Full Stack Developer",
			"DevOps Engineer",
		];

		for (let i = 0; i < count; i++) {
			candidates.push({
				id: `candidate_${i}`,
				name: `Candidate ${i}`,
				email: `candidate${i}@example.com`,
				skills: skills.slice(0, Math.floor(Math.random() * 4) + 2),
				totalExperience: Math.floor(Math.random() * 8) + 1,
				currentRole: roles[Math.floor(Math.random() * roles.length)],
				location: ["Mumbai", "Delhi", "Bangalore", "Pune"][
					Math.floor(Math.random() * 4)
				],
				education: "Bachelor of Technology",
				expectedSalary: 50000 + Math.floor(Math.random() * 100000),
				lastUpdated: new Date().toISOString(),
			});
		}

		return candidates;
	}

	generateMockJobs(count) {
		const jobs = [];
		const companies = ["TechCorp", "DataSoft", "InnovateLabs", "CloudTech"];
		const roles = [
			"Software Developer",
			"Data Scientist",
			"Full Stack Developer",
			"DevOps Engineer",
		];
		const skills = ["JavaScript", "Python", "React", "Node.js", "AWS", "SQL"];

		for (let i = 0; i < count; i++) {
			jobs.push({
				id: `job_${i}`,
				title: roles[Math.floor(Math.random() * roles.length)],
				company: companies[Math.floor(Math.random() * companies.length)],
				description: `Looking for an experienced ${
					roles[Math.floor(Math.random() * roles.length)]
				} to join our team.`,
				skills: skills.slice(0, Math.floor(Math.random() * 4) + 2),
				requiredExperience: Math.floor(Math.random() * 5) + 1,
				salary: { min: 60000, max: 120000 },
				location: ["Mumbai", "Delhi", "Bangalore", "Pune"][
					Math.floor(Math.random() * 4)
				],
				type: "full-time",
				postedDate: new Date(
					Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
				).toISOString(),
			});
		}

		return jobs;
	}

	calculateComprehensiveMatch(candidate, jobData) {
		const skillsScore = this.calculateSkillsMatch(
			candidate.skills,
			jobData.skills
		).score;
		const experienceScore = Math.min(
			(candidate.totalExperience / jobData.requiredExperience) * 100,
			100
		);
		const locationScore = candidate.location === jobData.location ? 100 : 50;
		const educationScore = 80; // Simplified

		return {
			skillsScore: skillsScore,
			experienceScore: experienceScore,
			educationScore: educationScore,
			locationScore: locationScore,
		};
	}

	calculateJobCandidateMatch(candidateData, job) {
		const skillsScore = this.calculateSkillsMatch(
			candidateData.skills || [],
			job.skills
		).score;
		const experienceScore = Math.min(
			(candidateData.totalExperience / job.requiredExperience) * 100,
			100
		);
		const salaryScore = this.calculateSalaryMatch(
			candidateData.salaryRange,
			job.salary
		).score;
		const locationScore = candidateData.location === job.location ? 100 : 60;
		const preferencesScore = 75; // Simplified

		return {
			skillsScore: skillsScore,
			experienceScore: experienceScore,
			salaryScore: salaryScore,
			locationScore: locationScore,
			preferencesScore: preferencesScore,
		};
	}

	calculateSkillsMatch(candidateSkills, requiredSkills) {
		if (!candidateSkills || !requiredSkills) {
			return { score: 0, matching: [], missing: requiredSkills || [] };
		}

		const matching = candidateSkills.filter((skill) =>
			requiredSkills.some((req) =>
				req.toLowerCase().includes(skill.toLowerCase())
			)
		);

		const missing = requiredSkills.filter(
			(skill) =>
				!candidateSkills.some((candidate) =>
					candidate.toLowerCase().includes(skill.toLowerCase())
				)
		);

		const score =
			requiredSkills.length > 0
				? (matching.length / requiredSkills.length) * 100
				: 0;

		return {
			score: Math.round(score),
			matching: matching,
			missing: missing,
			total: requiredSkills.length,
		};
	}

	calculateExperienceMatch(candidateProfile, jobRequirements) {
		const candidateExp = candidateProfile.totalExperience || 0;
		const requiredExp = jobRequirements.experience || 0;

		if (requiredExp === 0) return { score: 100 };

		const ratio = candidateExp / requiredExp;
		let score = 0;

		if (ratio >= 1) {
			score = 100;
		} else if (ratio >= 0.7) {
			score = 80;
		} else if (ratio >= 0.5) {
			score = 60;
		} else {
			score = 30;
		}

		return {
			score: score,
			candidateExperience: candidateExp,
			requiredExperience: requiredExp,
			ratio: ratio,
		};
	}

	calculateEducationMatch(candidateEducation, jobEducation) {
		// Simplified education matching
		if (!jobEducation || jobEducation.length === 0) return { score: 100 };
		if (!candidateEducation || candidateEducation.length === 0)
			return { score: 30 };

		return { score: 80 }; // Default good match
	}

	calculateWeightedScore(scores, criteria) {
		const weights = {
			comprehensive: {
				semantic: 0.3,
				skills: 0.35,
				experience: 0.25,
				education: 0.1,
			},
			candidate_focused: {
				semantic: 0.25,
				skills: 0.3,
				experience: 0.2,
				salary: 0.15,
				location: 0.1,
			},
			skills_heavy: {
				skills: 0.5,
				experience: 0.3,
				semantic: 0.2,
			},
		};

		const criteriaWeights = weights[criteria] || weights.comprehensive;

		let weightedScore = 0;
		let totalWeight = 0;

		Object.entries(scores).forEach(([key, score]) => {
			const weight = criteriaWeights[key] || 0;
			weightedScore += score * weight;
			totalWeight += weight;
		});

		return totalWeight > 0 ? weightedScore / totalWeight : 0;
	}

	calculateSalaryMatch(candidateRange, jobSalary) {
		if (!candidateRange || !jobSalary) {
			return { score: 75, reason: "No salary information available" };
		}

		const candidateMin = candidateRange.min || 0;
		const candidateMax = candidateRange.max || Infinity;
		const jobMin = jobSalary.min || 0;
		const jobMax = jobSalary.max || Infinity;

		// Check for overlap
		const hasOverlap = candidateMin <= jobMax && candidateMax >= jobMin;

		if (hasOverlap) {
			return { score: 100, reason: "Salary expectations align" };
		} else if (candidateMin > jobMax) {
			return {
				score: 30,
				reason: "Candidate expectations higher than offered",
			};
		} else {
			return { score: 60, reason: "Candidate expectations lower than offered" };
		}
	}

	sanitizeCandidateForResponse(candidate) {
		return {
			id: candidate.id,
			name: candidate.name,
			currentRole: candidate.currentRole,
			totalExperience: candidate.totalExperience,
			skills: candidate.skills,
			location: candidate.location,
			education: candidate.education,
		};
	}

	sanitizeJobForResponse(job) {
		return {
			id: job.id,
			title: job.title,
			company: job.company,
			location: job.location,
			type: job.type,
			skills: job.skills,
			requiredExperience: job.requiredExperience,
			salary: job.salary,
		};
	}

	generateMatchReasons(matchDetails, jobData) {
		const reasons = [];

		if (matchDetails.skillsScore >= 70) {
			reasons.push("Strong skill alignment with job requirements");
		}

		if (matchDetails.experienceScore >= 80) {
			reasons.push("Experience level matches or exceeds requirements");
		}

		if (matchDetails.locationScore === 100) {
			reasons.push("Located in preferred job location");
		}

		return reasons;
	}

	generateJobMatchReasons(matchDetails, candidateData) {
		const reasons = [];

		if (matchDetails.skillsScore >= 70) {
			reasons.push("Your skills align well with this role");
		}

		if (matchDetails.salaryScore >= 80) {
			reasons.push("Salary range matches your expectations");
		}

		if (matchDetails.experienceScore >= 60) {
			reasons.push("Your experience is suitable for this position");
		}

		return reasons;
	}

	calculateConfidence(matchDetails) {
		const scores = Object.values(matchDetails);
		const validScores = scores.filter((score) => typeof score === "number");

		if (validScores.length === 0) return 50;

		const average =
			validScores.reduce((sum, score) => sum + score, 0) / validScores.length;
		const variance =
			validScores.reduce(
				(sum, score) => sum + Math.pow(score - average, 2),
				0
			) / validScores.length;

		// Lower variance = higher confidence
		return Math.max(30, Math.min(95, 100 - Math.sqrt(variance)));
	}

	// Additional helper methods would be implemented here...
	// (generateRecruitmentRecommendations, parseJobRequirements, etc.)

	generateRecruitmentRecommendations(matches, jobData) {
		const recommendations = [];

		if (matches.length < 5) {
			recommendations.push(
				"Consider broadening your search criteria to find more candidates"
			);
		}

		const avgScore =
			matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length;
		if (avgScore < 60) {
			recommendations.push(
				"You might want to review your job requirements or consider remote candidates"
			);
		}

		return recommendations;
	}

	async parseJobRequirements(jobDescription) {
		// Simplified job parsing
		const skills = this.extractSkillsFromText(jobDescription);
		const experience = this.extractExperienceRequirement(jobDescription);
		const education = this.extractEducationRequirement(jobDescription);

		return {
			skills: skills,
			experience: experience,
			education: education,
		};
	}

	extractSkillsFromText(text) {
		const allSkills = Object.values(this.skillsDatabase).flat();
		const foundSkills = [];

		allSkills.forEach((skill) => {
			if (text.toLowerCase().includes(skill.toLowerCase())) {
				foundSkills.push(skill);
			}
		});

		return [...new Set(foundSkills)];
	}

	extractExperienceRequirement(text) {
		const expMatch = text.match(/(\d+)[\s\-+]*(?:years?|yrs?)/i);
		return expMatch ? parseInt(expMatch[1]) : 0;
	}

	extractEducationRequirement(text) {
		const degrees = ["bachelor", "master", "phd", "degree"];
		return degrees.filter((degree) => text.toLowerCase().includes(degree));
	}

	// Mock data generators and other utility methods...

	async getSkillDemandData(skill, options) {
		// Mock skill demand data
		return {
			level: "high",
			growth: 15,
			jobCount: 1200,
			salary: this.salaryData[skill] || { avg: 75000 },
			relatedSkills: ["React", "Node.js", "AWS"],
			industries: ["Technology", "Finance", "Healthcare"],
			competition: "medium",
		};
	}

	generateSkillInsights(skillsData, options) {
		return {
			highDemandSkills: Object.keys(skillsData).filter(
				(s) => skillsData[s].demandLevel === "high"
			),
			emergingSkills: ["AI/ML", "Blockchain", "Cloud Computing"],
			recommendations: [
				"Focus on high-demand skills",
				"Consider emerging technologies",
			],
		};
	}

	async saveSearchCriteria(searchData) {
		const search = {
			id: this.generateId("search"),
			...searchData,
		};

		this.savedSearches.set(search.id, search);
		return search;
	}

	async getSavedSearches(candidateId, options = {}) {
		const searches = Array.from(this.savedSearches.values()).filter(
			(s) => s.candidateId === candidateId
		);

		if (options.activeOnly) {
			return searches.filter((s) => s.isActive);
		}

		return searches;
	}

	generateId(prefix = "item") {
		return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	// Additional mock methods for completeness...
	calculateTotalJobs(industry, location) {
		return 15000;
	}
	calculateAverageSalary(industry, location) {
		return 85000;
	}
	calculateGrowthRate(industry, period) {
		return 12;
	}
	calculateCompetitionLevel(industry) {
		return "medium";
	}
	getSalaryTrend(industry, period) {
		return "increasing";
	}
	getDemandTrend(industry, period) {
		return "stable";
	}
	getSkillsTrend(industry, period) {
		return ["AI/ML", "Cloud", "DevOps"];
	}
	getHotSkills(industry, location, count) {
		return ["React", "Python", "AWS"];
	}
	getGrowingRoles(industry, location, count) {
		return ["Data Scientist", "DevOps Engineer"];
	}
	getDataPointsCount(industry, location) {
		return 50000;
	}

	// Profile optimization helpers
	analyzeProfileStrengths(profile) {
		return ["Strong technical skills", "Good educational background"];
	}

	async analyzeMarketDemand(industry, roles) {
		return {
			skills: ["JavaScript", "Python", "React", "AWS"],
			growth: 15,
			opportunities: 1200,
		};
	}

	calculateSkillGaps(candidateSkills, marketSkills) {
		return marketSkills.filter((skill) => !candidateSkills.includes(skill));
	}

	async generateLearningPath(skillGaps, timeframe) {
		return skillGaps.slice(0, 3).map((skill, index) => ({
			skill: skill,
			priority: index === 0 ? "high" : "medium",
			estimatedTime: "4-6 weeks",
			resources: ["Online courses", "Practice projects"],
		}));
	}

	assessMarketAlignment(profile, marketDemand) {
		return {
			score: 75,
			level: "good",
			improvements: [
				"Add cloud skills",
				"Gain more experience with modern frameworks",
			],
		};
	}

	async generateOptimizationRecommendations(profile, marketDemand, skillGaps) {
		return [
			{
				type: "skills",
				priority: "high",
				action: "Learn React and Node.js",
				impact: "Increase job opportunities by 40%",
			},
			{
				type: "experience",
				priority: "medium",
				action: "Work on open source projects",
				impact: "Demonstrate practical skills to employers",
			},
		];
	}

	createActionPlan(recommendations, learningPath, timeframe) {
		return {
			phase1: "0-2 months: Focus on high-priority skills",
			phase2: "2-4 months: Build projects and gain experience",
			phase3: "4-6 months: Advanced skills and specialization",
		};
	}

	calculateProjectedImpact(profile, recommendations, marketDemand) {
		return {
			jobOpportunities: "+45%",
			salaryIncrease: "+25%",
			marketFit: "+30%",
		};
	}

	// Bulk processing helpers
	generateBulkMatchSummary(matches) {
		const successfulMatches = matches.filter((m) => !m.error);
		return {
			totalProcessed: matches.length,
			successfulMatches: successfulMatches.length,
			averageScore:
				successfulMatches.length > 0
					? Math.round(
							successfulMatches.reduce((sum, m) => sum + m.matchScore, 0) /
								successfulMatches.length
					  )
					: 0,
			topScore: Math.max(...successfulMatches.map((m) => m.matchScore)),
			recommendedCandidates: successfulMatches.filter((m) => m.matchScore >= 70)
				.length,
		};
	}

	generateBulkRecommendations(matches, jobDescription) {
		return [
			"Focus on candidates with scores above 70 for initial screening",
			"Consider candidates with complementary skill sets",
			"Review gap analysis for training opportunities",
		];
	}

	// Additional utility methods
	extractExperienceFromText(text) {
		// Simplified experience extraction
		return [
			{
				role: "Software Developer",
				company: "TechCorp",
				duration: "2020-2023",
			},
		];
	}

	extractEducationFromText(text) {
		return [
			{
				degree: "Bachelor of Technology",
				field: "Computer Science",
				year: "2020",
			},
		];
	}

	extractContactFromText(text) {
		const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
		const phoneMatch = text.match(/\d{10}/);

		return {
			email: emailMatch ? emailMatch[0] : null,
			phone: phoneMatch ? phoneMatch[0] : null,
		};
	}

	calculateTotalExperience(experienceArray) {
		return experienceArray.length * 2; // Simplified: 2 years per role
	}

	generateProfileSummary(resumeText) {
		return resumeText.substring(0, 200) + "...";
	}

	identifyMatchStrengths(breakdown) {
		const strengths = [];

		if (breakdown.skills.score >= 70) strengths.push("Strong skill match");
		if (breakdown.experience.score >= 80)
			strengths.push("Excellent experience fit");
		if (breakdown.semantic.score >= 70)
			strengths.push("High semantic similarity");

		return strengths;
	}

	identifyMatchGaps(breakdown, jobRequirements) {
		const gaps = [];

		if (breakdown.skills.score < 60)
			gaps.push({ type: "skills", severity: "high" });
		if (breakdown.experience.score < 50)
			gaps.push({ type: "experience", severity: "medium" });

		return gaps;
	}

	async generateMatchRecommendations(gaps, candidateProfile) {
		return gaps.map((gap) => ({
			type: gap.type,
			recommendation: `Improve ${gap.type} to better match job requirements`,
			priority: gap.severity,
		}));
	}

	calculateMatchConfidence(breakdown) {
		const scores = Object.values(breakdown).map((b) => b.score);
		const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length;
		return Math.min(95, Math.max(30, avg));
	}

	getMatchingMethodology() {
		return {
			algorithm: "Hybrid semantic and rule-based matching",
			version: "2.1.0",
			components: [
				"Skill matching",
				"Experience analysis",
				"Semantic similarity",
				"Location matching",
			],
		};
	}

	async getMatchingStatistics(options) {
		// Mock statistics
		return {
			totalMatches: 15000,
			averageScore: 72,
			successRate: 85,
			topIndustries: ["Technology", "Finance", "Healthcare"],
		};
	}
}

module.exports = JobMatchingService;
