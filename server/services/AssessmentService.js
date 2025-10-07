/**
 * Assessment Service for BharatIntern AI Platform
 * Handles assessment creation, question generation, evaluation, and analysis
 */

const {
	generateTextGemini,
	generateText,
	applyTemplate,
	promptTemplates,
	classifyText,
} = require("../utils/aiHelpers");
const config = require("../config");

class AssessmentService {
	constructor() {
		this.assessments = new Map(); // In-memory storage (use database in production)
		this.sessions = new Map();
		this.results = new Map();
		this.questionBank = this.initializeQuestionBank();
	}

	/**
	 * Create a new assessment
	 */
	async createAssessment(assessmentData) {
		const assessment = {
			id: this.generateId("assessment"),
			...assessmentData,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			status: "draft",
			statistics: {
				totalAttempts: 0,
				averageScore: 0,
				passRate: 0,
			},
		};

		// Validate and enrich questions if provided
		if (assessment.questions && assessment.questions.length > 0) {
			assessment.questions = await this.validateAndEnrichQuestions(
				assessment.questions
			);
		}

		this.assessments.set(assessment.id, assessment);
		return assessment;
	}

	/**
	 * Generate assessment questions using AI
	 */
	async generateQuestions(options) {
		const {
			jobRole,
			skills,
			difficulty,
			questionCount,
			questionTypes,
			industry,
			customRequirements,
			generatedBy,
		} = options;

		const startTime = Date.now();

		try {
			const prompt = applyTemplate(promptTemplates.assessmentGeneration, {
				role: jobRole || "General Role",
				skills: skills.join(", "),
				difficulty: difficulty,
				questionType: questionTypes.join(", "),
				questionCount: questionCount,
			});

			// Add custom requirements to prompt
			const fullPrompt = customRequirements
				? `${prompt}\n\nAdditional Requirements: ${customRequirements}`
				: prompt;

			// Try Gemini first, fallback to Hugging Face
			let result = await generateTextGemini(fullPrompt, {
				maxTokens: 2000,
				temperature: 0.7,
			});

			if (!result.success) {
				result = await generateText(fullPrompt, {
					maxTokens: 1500,
					temperature: 0.7,
				});
			}

			let questions = [];
			if (result.success) {
				// Parse generated questions (assuming JSON format)
				try {
					const parsedContent = this.parseGeneratedQuestions(result.text);
					questions = parsedContent.questions || [];
				} catch (parseError) {
					console.warn(
						"Failed to parse AI-generated questions, using fallback"
					);
					questions = this.generateFallbackQuestions(options);
				}
			} else {
				questions = this.generateFallbackQuestions(options);
			}

			// Validate and enhance questions
			const validatedQuestions = await this.validateAndEnrichQuestions(
				questions
			);

			return {
				questions: validatedQuestions,
				processingTime: Date.now() - startTime,
				model: result.success ? result.model || "ai-generated" : "fallback",
				suggestions: this.generateQuestionSuggestions(options),
				metadata: {
					requestedCount: questionCount,
					generatedCount: validatedQuestions.length,
					difficulty: difficulty,
					skills: skills,
					generatedBy: generatedBy,
				},
			};
		} catch (error) {
			console.error("Error generating questions:", error);

			// Return fallback questions
			const fallbackQuestions = this.generateFallbackQuestions(options);
			return {
				questions: fallbackQuestions,
				processingTime: Date.now() - startTime,
				model: "fallback",
				error: error.message,
				suggestions: this.generateQuestionSuggestions(options),
			};
		}
	}

	/**
	 * Get assessments with filtering and pagination
	 */
	async getAssessments(filters, options) {
		const { page, limit, sortBy, sortOrder } = options;

		let assessmentList = Array.from(this.assessments.values());

		// Apply filters
		if (filters.type) {
			assessmentList = assessmentList.filter((a) => a.type === filters.type);
		}
		if (filters.difficulty) {
			assessmentList = assessmentList.filter(
				(a) => a.difficulty === filters.difficulty
			);
		}
		if (filters.skills && filters.skills.length > 0) {
			assessmentList = assessmentList.filter((a) =>
				filters.skills.some((skill) => a.skills.includes(skill))
			);
		}
		if (filters.search) {
			const searchTerm = filters.search.toLowerCase();
			assessmentList = assessmentList.filter(
				(a) =>
					a.title.toLowerCase().includes(searchTerm) ||
					a.description.toLowerCase().includes(searchTerm)
			);
		}
		if (filters.createdBy) {
			assessmentList = assessmentList.filter(
				(a) => a.createdBy === filters.createdBy
			);
		}

		// Sort
		assessmentList.sort((a, b) => {
			const aValue = a[sortBy] || "";
			const bValue = b[sortBy] || "";

			if (sortOrder === "desc") {
				return bValue > aValue ? 1 : -1;
			}
			return aValue > bValue ? 1 : -1;
		});

		// Paginate
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const paginatedAssessments = assessmentList.slice(startIndex, endIndex);

		return {
			assessments: paginatedAssessments.map((a) =>
				this.sanitizeAssessmentForList(a)
			),
			currentPage: page,
			totalPages: Math.ceil(assessmentList.length / limit),
			totalItems: assessmentList.length,
			limit: limit,
		};
	}

	/**
	 * Get assessment by ID
	 */
	async getAssessmentById(id, options = {}) {
		const assessment = this.assessments.get(id);
		if (!assessment) return null;

		const result = { ...assessment };

		// Remove answers if candidate is requesting
		if (!options.includeAnswers && options.userRole === "candidate") {
			result.questions = result.questions.map((q) => {
				const { correctAnswer, explanation, ...questionWithoutAnswer } = q;
				return questionWithoutAnswer;
			});
		}

		// Include questions based on option
		if (!options.includeQuestions) {
			delete result.questions;
		}

		return result;
	}

	/**
	 * Start assessment session
	 */
	async startAssessmentSession(assessmentId, sessionData) {
		const assessment = this.assessments.get(assessmentId);
		if (!assessment) {
			throw new Error("Assessment not found");
		}

		const session = {
			id: this.generateId("session"),
			assessmentId: assessmentId,
			candidateId: sessionData.candidateId,
			candidateInfo: sessionData.candidateInfo,
			startTime: sessionData.startTime,
			endTime: null,
			timeLimit: assessment.duration * 60 * 1000, // Convert to milliseconds
			status: "active",
			answers: {},
			currentQuestionIndex: 0,
			timeSpent: 0,
			createdAt: new Date().toISOString(),
		};

		this.sessions.set(session.id, session);

		// Return session with questions (without correct answers)
		return {
			...session,
			questions: assessment.questions.map((q) => {
				const { correctAnswer, explanation, ...questionForCandidate } = q;
				return questionForCandidate;
			}),
		};
	}

	/**
	 * Get session by ID
	 */
	async getSession(sessionId) {
		return this.sessions.get(sessionId);
	}

	/**
	 * Check for existing attempt
	 */
	async getExistingAttempt(assessmentId, candidateId) {
		// Find existing session for this candidate and assessment
		for (const session of this.sessions.values()) {
			if (
				session.assessmentId === assessmentId &&
				session.candidateId === candidateId
			) {
				return session;
			}
		}
		return null;
	}

	/**
	 * Submit assessment and calculate results
	 */
	async submitAssessment(sessionId, submissionData) {
		const session = this.sessions.get(sessionId);
		if (!session) {
			throw new Error("Session not found");
		}

		const assessment = this.assessments.get(session.assessmentId);
		if (!assessment) {
			throw new Error("Assessment not found");
		}

		// Update session
		session.answers = submissionData.answers;
		session.timeSpent = submissionData.timeSpent;
		session.endTime = submissionData.submittedAt;
		session.status = "completed";

		// Calculate results
		const results = await this.evaluateAnswers(
			assessment,
			submissionData.answers
		);

		// Store results
		const resultRecord = {
			id: this.generateId("result"),
			sessionId: sessionId,
			assessmentId: session.assessmentId,
			candidateId: session.candidateId,
			score: results.score,
			percentage: results.percentage,
			passed: results.passed,
			correctAnswers: results.correctAnswers,
			totalQuestions: results.totalQuestions,
			timeSpent: submissionData.timeSpent,
			answers: submissionData.answers,
			feedback: results.feedback,
			submittedAt: submissionData.submittedAt,
			evaluatedAt: new Date().toISOString(),
		};

		this.results.set(resultRecord.id, resultRecord);

		// Update assessment statistics
		this.updateAssessmentStatistics(session.assessmentId, results);

		return resultRecord;
	}

	/**
	 * Evaluate assessment answers
	 */
	async evaluateAnswers(assessment, answers) {
		let correctCount = 0;
		const totalQuestions = assessment.questions.length;
		const feedback = [];

		assessment.questions.forEach((question, index) => {
			const userAnswer = answers[question.id] || answers[index];
			const isCorrect = this.checkAnswer(question, userAnswer);

			if (isCorrect) {
				correctCount++;
			}

			feedback.push({
				questionId: question.id,
				questionText: question.text,
				userAnswer: userAnswer,
				correctAnswer: question.correctAnswer,
				isCorrect: isCorrect,
				explanation: question.explanation || "",
				difficulty: question.difficulty,
				skill: question.skill,
			});
		});

		const percentage = Math.round((correctCount / totalQuestions) * 100);
		const passed = percentage >= assessment.passingScore;

		return {
			score: correctCount,
			totalQuestions: totalQuestions,
			correctAnswers: correctCount,
			percentage: percentage,
			passed: passed,
			feedback: feedback,
		};
	}

	/**
	 * Check if an answer is correct
	 */
	checkAnswer(question, userAnswer) {
		if (!userAnswer) return false;

		switch (question.type) {
			case "multiple_choice":
				return userAnswer === question.correctAnswer;

			case "multiple_select":
				if (
					!Array.isArray(userAnswer) ||
					!Array.isArray(question.correctAnswer)
				) {
					return false;
				}
				return (
					userAnswer.sort().join(",") ===
					question.correctAnswer.sort().join(",")
				);

			case "true_false":
				return userAnswer === question.correctAnswer;

			case "short_answer":
				return this.checkShortAnswer(question.correctAnswer, userAnswer);

			case "coding":
				return this.checkCodingAnswer(question, userAnswer);

			default:
				return false;
		}
	}

	/**
	 * Check short answer with fuzzy matching
	 */
	checkShortAnswer(correctAnswer, userAnswer) {
		if (!correctAnswer || !userAnswer) return false;

		const correct = correctAnswer.toLowerCase().trim();
		const user = userAnswer.toLowerCase().trim();

		// Exact match
		if (correct === user) return true;

		// Check if user answer contains the correct answer
		if (user.includes(correct) || correct.includes(user)) {
			return true;
		}

		// Simple similarity check (70% match)
		const similarity = this.calculateStringSimilarity(correct, user);
		return similarity >= 0.7;
	}

	/**
	 * Check coding answer (simplified)
	 */
	checkCodingAnswer(question, userAnswer) {
		// In production, this would run test cases
		if (!userAnswer || !userAnswer.code) return false;

		// Simple check - contains required keywords
		const requiredKeywords = question.requiredKeywords || [];
		const code = userAnswer.code.toLowerCase();

		return requiredKeywords.every((keyword) =>
			code.includes(keyword.toLowerCase())
		);
	}

	/**
	 * Calculate string similarity (Jaccard similarity)
	 */
	calculateStringSimilarity(str1, str2) {
		const set1 = new Set(str1.split(" "));
		const set2 = new Set(str2.split(" "));

		const intersection = new Set([...set1].filter((x) => set2.has(x)));
		const union = new Set([...set1, ...set2]);

		return intersection.size / union.size;
	}

	/**
	 * Get assessment results
	 */
	async getAssessmentResults(options) {
		const { assessmentId, candidateId, page, limit, requestedBy, userRole } =
			options;

		let resultsList = Array.from(this.results.values());

		// Apply filters
		if (assessmentId) {
			resultsList = resultsList.filter((r) => r.assessmentId === assessmentId);
		}
		if (candidateId) {
			resultsList = resultsList.filter((r) => r.candidateId === candidateId);
		}

		// Security check - candidates can only see their own results
		if (userRole === "candidate") {
			resultsList = resultsList.filter((r) => r.candidateId === requestedBy);
		}

		// Sort by submission date (newest first)
		resultsList.sort(
			(a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
		);

		// Calculate statistics
		const statistics = this.calculateResultStatistics(resultsList);

		// Paginate
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const paginatedResults = resultsList.slice(startIndex, endIndex);

		return {
			results: paginatedResults,
			statistics: statistics,
			currentPage: page,
			totalPages: Math.ceil(resultsList.length / limit),
			totalItems: resultsList.length,
			limit: limit,
		};
	}

	/**
	 * Analyze assessment performance
	 */
	async analyzeAssessmentPerformance(assessmentId, options) {
		const { analysisType, timeRange, requestedBy } = options;
		const startTime = Date.now();

		const assessment = this.assessments.get(assessmentId);
		if (!assessment) {
			throw new Error("Assessment not found");
		}

		// Get all results for this assessment
		const results = Array.from(this.results.values()).filter(
			(r) => r.assessmentId === assessmentId
		);

		// Filter by time range
		const filteredResults = this.filterResultsByTimeRange(results, timeRange);

		const analysis = {
			overview: this.calculateOverviewStatistics(filteredResults),
			candidatePerformance: this.analyzeCandidatePerformance(filteredResults),
			questionAnalysis: this.analyzeQuestionPerformance(
				filteredResults,
				assessment
			),
			skillsAnalysis: this.analyzeSkillsPerformance(
				filteredResults,
				assessment
			),
			trends: this.analyzeTrends(filteredResults),
			recommendations: await this.generateAnalysisRecommendations(
				filteredResults,
				assessment
			),
			processingTime: Date.now() - startTime,
		};

		return analysis;
	}

	/**
	 * Update assessment
	 */
	async updateAssessment(id, updateData) {
		const assessment = this.assessments.get(id);
		if (!assessment) {
			throw new Error("Assessment not found");
		}

		// Validate update data
		const allowedFields = [
			"title",
			"description",
			"duration",
			"passingScore",
			"customInstructions",
			"status",
			"questions",
		];

		const updates = {};
		allowedFields.forEach((field) => {
			if (updateData[field] !== undefined) {
				updates[field] = updateData[field];
			}
		});

		// Update assessment
		Object.assign(assessment, updates, {
			updatedAt: new Date().toISOString(),
		});

		this.assessments.set(id, assessment);
		return assessment;
	}

	/**
	 * Delete assessment
	 */
	async deleteAssessment(id) {
		const assessment = this.assessments.get(id);
		if (!assessment) {
			throw new Error("Assessment not found");
		}

		// In production, you'd want to handle cascading deletes carefully
		this.assessments.delete(id);

		// Clean up related sessions and results
		this.cleanupAssessmentData(id);

		return true;
	}

	/**
	 * Get candidate assessment history
	 */
	async getCandidateHistory(options) {
		const { candidateId, page, limit, status } = options;

		let results = Array.from(this.results.values()).filter(
			(r) => r.candidateId === candidateId
		);

		if (status) {
			results = results.filter((r) => {
				if (status === "passed") return r.passed;
				if (status === "failed") return !r.passed;
				return true;
			});
		}

		// Sort by date (newest first)
		results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

		// Calculate summary
		const summary = {
			totalAssessments: results.length,
			passed: results.filter((r) => r.passed).length,
			failed: results.filter((r) => !r.passed).length,
			averageScore:
				results.length > 0
					? Math.round(
							results.reduce((sum, r) => sum + r.percentage, 0) / results.length
					  )
					: 0,
		};

		// Paginate
		const startIndex = (page - 1) * limit;
		const endIndex = startIndex + limit;
		const paginatedResults = results.slice(startIndex, endIndex);

		// Enrich with assessment info
		const enrichedResults = paginatedResults.map((result) => {
			const assessment = this.assessments.get(result.assessmentId);
			return {
				...result,
				assessmentTitle: assessment?.title || "Unknown Assessment",
				assessmentType: assessment?.type || "unknown",
				difficulty: assessment?.difficulty || "unknown",
			};
		});

		return {
			assessments: enrichedResults,
			summary: summary,
			currentPage: page,
			totalPages: Math.ceil(results.length / limit),
			totalItems: results.length,
			limit: limit,
		};
	}

	/**
	 * Get platform statistics
	 */
	async getPlatformStatistics(options) {
		const { period, groupBy, requestedBy, userRole } = options;

		const assessments = Array.from(this.assessments.values());
		const results = Array.from(this.results.values());

		// Filter by user role and permissions
		const filteredAssessments =
			userRole === "admin"
				? assessments
				: assessments.filter((a) => a.createdBy === requestedBy);

		const filteredResults =
			userRole === "admin"
				? results
				: results.filter((r) => {
						const assessment = this.assessments.get(r.assessmentId);
						return assessment && assessment.createdBy === requestedBy;
				  });

		return {
			overview: {
				totalAssessments: filteredAssessments.length,
				totalAttempts: filteredResults.length,
				averageScore:
					filteredResults.length > 0
						? Math.round(
								filteredResults.reduce((sum, r) => sum + r.percentage, 0) /
									filteredResults.length
						  )
						: 0,
				passRate:
					filteredResults.length > 0
						? Math.round(
								(filteredResults.filter((r) => r.passed).length /
									filteredResults.length) *
									100
						  )
						: 0,
			},
			trends: this.calculateTrends(filteredResults, period, groupBy),
			topPerformingAssessments: this.getTopPerformingAssessments(
				filteredAssessments,
				filteredResults
			),
			skillsAnalysis: this.getSkillsStatistics(
				filteredAssessments,
				filteredResults
			),
			candidateInsights: this.getCandidateInsights(filteredResults),
		};
	}

	// Helper methods

	initializeQuestionBank() {
		return {
			programming: [
				{
					text: "What is the time complexity of binary search?",
					type: "multiple_choice",
					options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
					correctAnswer: "O(log n)",
					explanation:
						"Binary search divides the search space in half each iteration.",
					difficulty: "intermediate",
					skill: "Algorithms",
				},
			],
			general: [
				{
					text: "What does API stand for?",
					type: "multiple_choice",
					options: [
						"Application Programming Interface",
						"Automated Program Integration",
						"Advanced Programming Instructions",
						"Application Process Interface",
					],
					correctAnswer: "Application Programming Interface",
					explanation: "API stands for Application Programming Interface.",
					difficulty: "beginner",
					skill: "General Knowledge",
				},
			],
		};
	}

	generateId(prefix = "item") {
		return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	parseGeneratedQuestions(text) {
		try {
			return JSON.parse(text);
		} catch (error) {
			// Try to extract JSON from text
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (jsonMatch) {
				return JSON.parse(jsonMatch[0]);
			}
			throw new Error("No valid JSON found in generated text");
		}
	}

	generateFallbackQuestions(options) {
		const { skills, difficulty, questionCount, questionTypes } = options;
		const questions = [];

		// Use question bank to generate fallback questions
		const relevantQuestions =
			skills.includes("Programming") || skills.includes("JavaScript")
				? this.questionBank.programming
				: this.questionBank.general;

		for (
			let i = 0;
			i < Math.min(questionCount, relevantQuestions.length);
			i++
		) {
			const baseQuestion = relevantQuestions[i % relevantQuestions.length];
			questions.push({
				...baseQuestion,
				id: this.generateId("question"),
				difficulty: difficulty,
				skill: skills[0] || "General",
			});
		}

		return questions;
	}

	async validateAndEnrichQuestions(questions) {
		return questions.map((question) => ({
			id: question.id || this.generateId("question"),
			text: question.text || "Sample question",
			type: question.type || "multiple_choice",
			options: question.options || [],
			correctAnswer: question.correctAnswer,
			explanation: question.explanation || "",
			difficulty: question.difficulty || "intermediate",
			skill: question.skill || "General",
			points: question.points || 1,
			timeLimit: question.timeLimit || null,
			requiredKeywords: question.requiredKeywords || [],
		}));
	}

	generateQuestionSuggestions(options) {
		return [
			"Include more practical, scenario-based questions",
			"Add questions of varying difficulty levels",
			"Consider including coding challenges for technical roles",
			"Add time limits for better assessment control",
		];
	}

	sanitizeAssessmentForList(assessment) {
		return {
			id: assessment.id,
			title: assessment.title,
			description: assessment.description,
			type: assessment.type,
			difficulty: assessment.difficulty,
			duration: assessment.duration,
			skills: assessment.skills,
			questionCount: assessment.questions?.length || 0,
			passingScore: assessment.passingScore,
			status: assessment.status,
			createdAt: assessment.createdAt,
			statistics: assessment.statistics,
		};
	}

	updateAssessmentStatistics(assessmentId, results) {
		const assessment = this.assessments.get(assessmentId);
		if (!assessment) return;

		if (!assessment.statistics) {
			assessment.statistics = {
				totalAttempts: 0,
				averageScore: 0,
				passRate: 0,
			};
		}

		// Get all results for this assessment
		const allResults = Array.from(this.results.values()).filter(
			(r) => r.assessmentId === assessmentId
		);

		assessment.statistics.totalAttempts = allResults.length;
		assessment.statistics.averageScore =
			allResults.length > 0
				? Math.round(
						allResults.reduce((sum, r) => sum + r.percentage, 0) /
							allResults.length
				  )
				: 0;
		assessment.statistics.passRate =
			allResults.length > 0
				? Math.round(
						(allResults.filter((r) => r.passed).length / allResults.length) *
							100
				  )
				: 0;

		this.assessments.set(assessmentId, assessment);
	}

	calculateResultStatistics(results) {
		if (results.length === 0) {
			return {
				totalAttempts: 0,
				averageScore: 0,
				passRate: 0,
				highestScore: 0,
				lowestScore: 0,
			};
		}

		const scores = results.map((r) => r.percentage);
		return {
			totalAttempts: results.length,
			averageScore: Math.round(
				scores.reduce((sum, score) => sum + score, 0) / scores.length
			),
			passRate: Math.round(
				(results.filter((r) => r.passed).length / results.length) * 100
			),
			highestScore: Math.max(...scores),
			lowestScore: Math.min(...scores),
		};
	}

	filterResultsByTimeRange(results, timeRange) {
		const now = new Date();
		const days = parseInt(timeRange.replace("d", ""));
		const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

		return results.filter((r) => new Date(r.submittedAt) >= cutoffDate);
	}

	calculateOverviewStatistics(results) {
		return {
			totalAttempts: results.length,
			uniqueCandidates: new Set(results.map((r) => r.candidateId)).size,
			averageScore:
				results.length > 0
					? Math.round(
							results.reduce((sum, r) => sum + r.percentage, 0) / results.length
					  )
					: 0,
			passRate:
				results.length > 0
					? Math.round(
							(results.filter((r) => r.passed).length / results.length) * 100
					  )
					: 0,
			averageTimeSpent:
				results.length > 0
					? Math.round(
							results.reduce((sum, r) => sum + r.timeSpent, 0) /
								results.length /
								1000 /
								60
					  )
					: 0, // in minutes
		};
	}

	analyzeCandidatePerformance(results) {
		const candidateStats = {};

		results.forEach((result) => {
			if (!candidateStats[result.candidateId]) {
				candidateStats[result.candidateId] = {
					attempts: 0,
					scores: [],
					totalTimeSpent: 0,
				};
			}

			candidateStats[result.candidateId].attempts++;
			candidateStats[result.candidateId].scores.push(result.percentage);
			candidateStats[result.candidateId].totalTimeSpent += result.timeSpent;
		});

		return Object.entries(candidateStats).map(([candidateId, stats]) => ({
			candidateId,
			attempts: stats.attempts,
			averageScore: Math.round(
				stats.scores.reduce((sum, score) => sum + score, 0) /
					stats.scores.length
			),
			bestScore: Math.max(...stats.scores),
			averageTimeSpent: Math.round(
				stats.totalTimeSpent / stats.attempts / 1000 / 60
			), // in minutes
		}));
	}

	analyzeQuestionPerformance(results, assessment) {
		const questionStats = {};

		// Initialize question stats
		assessment.questions.forEach((q) => {
			questionStats[q.id] = {
				questionId: q.id,
				text: q.text,
				difficulty: q.difficulty,
				skill: q.skill,
				correctCount: 0,
				totalAttempts: 0,
				averageTime: 0,
			};
		});

		// Calculate statistics
		results.forEach((result) => {
			result.feedback.forEach((feedback) => {
				if (questionStats[feedback.questionId]) {
					questionStats[feedback.questionId].totalAttempts++;
					if (feedback.isCorrect) {
						questionStats[feedback.questionId].correctCount++;
					}
				}
			});
		});

		return Object.values(questionStats).map((stat) => ({
			...stat,
			successRate:
				stat.totalAttempts > 0
					? Math.round((stat.correctCount / stat.totalAttempts) * 100)
					: 0,
		}));
	}

	analyzeSkillsPerformance(results, assessment) {
		const skillStats = {};

		results.forEach((result) => {
			result.feedback.forEach((feedback) => {
				if (!skillStats[feedback.skill]) {
					skillStats[feedback.skill] = {
						skill: feedback.skill,
						totalQuestions: 0,
						correctAnswers: 0,
						attempts: 0,
					};
				}

				skillStats[feedback.skill].totalQuestions++;
				skillStats[feedback.skill].attempts++;
				if (feedback.isCorrect) {
					skillStats[feedback.skill].correctAnswers++;
				}
			});
		});

		return Object.values(skillStats).map((stat) => ({
			...stat,
			successRate:
				stat.attempts > 0
					? Math.round((stat.correctAnswers / stat.attempts) * 100)
					: 0,
		}));
	}

	analyzeTrends(results) {
		// Group results by date
		const dailyStats = {};

		results.forEach((result) => {
			const date = new Date(result.submittedAt).toISOString().split("T")[0];
			if (!dailyStats[date]) {
				dailyStats[date] = {
					date,
					attempts: 0,
					totalScore: 0,
					passed: 0,
				};
			}

			dailyStats[date].attempts++;
			dailyStats[date].totalScore += result.percentage;
			if (result.passed) {
				dailyStats[date].passed++;
			}
		});

		return Object.values(dailyStats)
			.map((stat) => ({
				...stat,
				averageScore: Math.round(stat.totalScore / stat.attempts),
				passRate: Math.round((stat.passed / stat.attempts) * 100),
			}))
			.sort((a, b) => new Date(a.date) - new Date(b.date));
	}

	async generateAnalysisRecommendations(results, assessment) {
		const recommendations = [];

		const averageScore =
			results.length > 0
				? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
				: 0;

		if (averageScore < 60) {
			recommendations.push({
				type: "difficulty",
				priority: "high",
				title: "Consider reducing difficulty",
				description:
					"The average score is quite low. Consider reviewing question difficulty or providing additional preparation materials.",
			});
		}

		if (results.length < 10) {
			recommendations.push({
				type: "promotion",
				priority: "medium",
				title: "Increase assessment visibility",
				description:
					"Low participation rate. Consider promoting the assessment to reach more candidates.",
			});
		}

		const passRate =
			results.length > 0
				? (results.filter((r) => r.passed).length / results.length) * 100
				: 0;

		if (passRate > 90) {
			recommendations.push({
				type: "difficulty",
				priority: "medium",
				title: "Consider increasing difficulty",
				description:
					"Very high pass rate suggests the assessment might be too easy for effective screening.",
			});
		}

		return recommendations;
	}

	cleanupAssessmentData(assessmentId) {
		// Remove related sessions
		for (const [sessionId, session] of this.sessions.entries()) {
			if (session.assessmentId === assessmentId) {
				this.sessions.delete(sessionId);
			}
		}

		// Remove related results
		for (const [resultId, result] of this.results.entries()) {
			if (result.assessmentId === assessmentId) {
				this.results.delete(resultId);
			}
		}
	}

	calculateTrends(results, period, groupBy) {
		// Simplified trend calculation
		return {
			scoresTrend: "stable",
			participationTrend: "increasing",
			passRateTrend: "stable",
		};
	}

	getTopPerformingAssessments(assessments, results) {
		return assessments.slice(0, 5).map((a) => ({
			id: a.id,
			title: a.title,
			attempts: results.filter((r) => r.assessmentId === a.id).length,
			averageScore: 75, // Simplified
		}));
	}

	getSkillsStatistics(assessments, results) {
		const skills = {};
		assessments.forEach((a) => {
			a.skills.forEach((skill) => {
				if (!skills[skill]) {
					skills[skill] = { skill, assessments: 0, attempts: 0 };
				}
				skills[skill].assessments++;
			});
		});
		return Object.values(skills);
	}

	getCandidateInsights(results) {
		return {
			totalCandidates: new Set(results.map((r) => r.candidateId)).size,
			averageAttempts:
				results.length > 0
					? Math.round(
							results.length / new Set(results.map((r) => r.candidateId)).size
					  )
					: 0,
		};
	}
}

module.exports = AssessmentService;
