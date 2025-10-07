/**
 * Resume Analyzer Service for BharatIntern AI Platform
 * Comprehensive resume analysis using AI models
 */

const {
	generateEmbeddings,
	cosineSimilarity,
	generateTextGemini,
	classifyText,
	extractEntities,
	promptTemplates,
	applyTemplate,
} = require("../utils/aiHelpers");
const { extractPatterns } = require("../utils/fileParser");
const config = require("../config");

class ResumeAnalyzer {
	constructor() {
		this.skillsDatabase = this.loadSkillsDatabase();
		this.industryKeywords = this.loadIndustryKeywords();
		this.atsKeywords = this.loadATSKeywords();
	}

	/**
	 * Main resume analysis function
	 */
	async analyzeResume(resumeText, options = {}) {
		const {
			includeSkills = true,
			includeExperience = true,
			includeEducation = true,
			includeContacts = true,
			includeSummary = true,
			jobDescription = "",
			analysisType = "comprehensive",
			userId = null,
		} = options;

		try {
			const startTime = Date.now();

			// Basic information extraction
			const basicInfo = await this.extractBasicInformation(resumeText);

			// Skills analysis
			const skillsAnalysis = includeSkills
				? await this.analyzeSkills(resumeText)
				: null;

			// Experience analysis
			const experienceAnalysis = includeExperience
				? await this.analyzeExperience(resumeText)
				: null;

			// Education analysis
			const educationAnalysis = includeEducation
				? await this.analyzeEducation(resumeText)
				: null;

			// Contact information
			const contactInfo = includeContacts
				? await this.extractContactInfo(resumeText)
				: null;

			// Generate summary
			const summary = includeSummary
				? await this.generateSummary(resumeText)
				: null;

			// Calculate overall scores
			const scores = await this.calculateScores({
				basicInfo,
				skillsAnalysis,
				experienceAnalysis,
				educationAnalysis,
				resumeText,
			});

			// Job matching if job description provided
			let jobMatch = null;
			if (jobDescription) {
				jobMatch = await this.calculateJobMatch(
					{ basicInfo, skillsAnalysis, experienceAnalysis },
					jobDescription
				);
			}

			const result = {
				id: this.generateAnalysisId(),
				timestamp: new Date().toISOString(),
				userId: userId,
				basicInfo: basicInfo,
				skills: skillsAnalysis,
				experience: experienceAnalysis,
				education: educationAnalysis,
				contactInfo: contactInfo,
				summary: summary,
				scores: scores,
				jobMatch: jobMatch,
				analysisType: analysisType,
				processingTime: Date.now() - startTime,
				confidence: this.calculateConfidence({
					basicInfo,
					skillsAnalysis,
					experienceAnalysis,
					educationAnalysis,
				}),
			};

			return result;
		} catch (error) {
			console.error("Error in resume analysis:", error);
			throw new Error(`Resume analysis failed: ${error.message}`);
		}
	}

	/**
	 * Extract basic information from resume
	 */
	async extractBasicInformation(resumeText) {
		try {
			// Extract patterns
			const patterns = extractPatterns(resumeText);

			// Use NER for name extraction
			const entities = await extractEntities(resumeText);

			// Extract names (PERSON entities)
			const names = entities.success
				? entities.entities.filter((e) => e.type === "PER").map((e) => e.text)
				: [];

			// Extract location information
			const locations = entities.success
				? entities.entities.filter((e) => e.type === "LOC").map((e) => e.text)
				: [];

			return {
				name:
					names.length > 0 ? names[0] : this.extractNameFromText(resumeText),
				emails: patterns.emails,
				phones: patterns.phones,
				linkedIn: patterns.linkedIn,
				github: patterns.github,
				websites: patterns.urls,
				location: locations.length > 0 ? locations[0] : null,
				extractedEntities: entities.success ? entities.entities : [],
			};
		} catch (error) {
			console.error("Error extracting basic info:", error);
			return {
				name: null,
				emails: [],
				phones: [],
				linkedIn: [],
				github: [],
				websites: [],
				location: null,
				extractedEntities: [],
			};
		}
	}

	/**
	 * Analyze skills from resume text
	 */
	async analyzeSkills(resumeText) {
		try {
			const detectedSkills = this.extractSkillsFromText(resumeText);

			// Categorize skills
			const categorizedSkills = this.categorizeSkills(detectedSkills);

			// Generate skill embeddings for semantic analysis
			const skillEmbeddings = {};
			for (const skill of detectedSkills.slice(0, 10)) {
				// Limit for API efficiency
				const embedding = await generateEmbeddings(skill);
				if (embedding.success) {
					skillEmbeddings[skill] = embedding.embedding;
				}
			}

			// Calculate skill levels
			const skillLevels = this.estimateSkillLevels(resumeText, detectedSkills);

			return {
				detected: detectedSkills,
				categorized: categorizedSkills,
				levels: skillLevels,
				embeddings: skillEmbeddings,
				totalCount: detectedSkills.length,
				categories: Object.keys(categorizedSkills),
			};
		} catch (error) {
			console.error("Error analyzing skills:", error);
			return {
				detected: [],
				categorized: {},
				levels: {},
				embeddings: {},
				totalCount: 0,
				categories: [],
			};
		}
	}

	/**
	 * Analyze work experience
	 */
	async analyzeExperience(resumeText) {
		try {
			// Extract experience sections
			const experienceText = this.extractExperienceSection(resumeText);

			// Parse individual experiences
			const experiences = this.parseExperiences(experienceText);

			// Calculate total experience
			const totalYears = this.calculateTotalExperience(experiences);

			// Extract companies and roles
			const companies = experiences.map((exp) => exp.company).filter(Boolean);
			const roles = experiences.map((exp) => exp.role).filter(Boolean);

			// Analyze career progression
			const progression = this.analyzeCareerProgression(experiences);

			return {
				experiences: experiences,
				totalYears: totalYears,
				companies: companies,
				roles: roles,
				progression: progression,
				seniorityLevel: this.determineSeniorityLevel(totalYears, roles),
				industryExperience: this.extractIndustryExperience(experienceText),
			};
		} catch (error) {
			console.error("Error analyzing experience:", error);
			return {
				experiences: [],
				totalYears: 0,
				companies: [],
				roles: [],
				progression: null,
				seniorityLevel: "entry",
				industryExperience: [],
			};
		}
	}

	/**
	 * Analyze education information
	 */
	async analyzeEducation(resumeText) {
		try {
			const educationText = this.extractEducationSection(resumeText);
			const educationEntries = this.parseEducation(educationText);

			return {
				entries: educationEntries,
				highestDegree: this.determineHighestDegree(educationEntries),
				institutions: educationEntries
					.map((e) => e.institution)
					.filter(Boolean),
				fields: educationEntries.map((e) => e.field).filter(Boolean),
				gpa: this.extractGPA(educationText),
				certifications: this.extractCertifications(resumeText),
			};
		} catch (error) {
			console.error("Error analyzing education:", error);
			return {
				entries: [],
				highestDegree: null,
				institutions: [],
				fields: [],
				gpa: null,
				certifications: [],
			};
		}
	}

	/**
	 * Extract contact information
	 */
	async extractContactInfo(resumeText) {
		const patterns = extractPatterns(resumeText);
		return {
			email: patterns.emails[0] || null,
			phone: patterns.phones[0] || null,
			linkedIn: patterns.linkedIn[0] || null,
			github: patterns.github[0] || null,
			portfolio:
				patterns.urls.find(
					(url) => url.includes("portfolio") || url.includes("personal")
				) || null,
		};
	}

	/**
	 * Generate resume summary using AI
	 */
	async generateSummary(resumeText) {
		try {
			const prompt = applyTemplate(promptTemplates.resumeAnalysis, {
				resumeText: resumeText.substring(0, 2000), // Limit for API efficiency
			});

			const result = await generateTextGemini(prompt, {
				maxTokens: 500,
				temperature: 0.3,
			});

			if (result.success) {
				return {
					generated: true,
					text: result.text,
					model: result.model,
				};
			} else {
				return {
					generated: false,
					text: this.generateFallbackSummary(resumeText),
					model: "fallback",
				};
			}
		} catch (error) {
			console.error("Error generating summary:", error);
			return {
				generated: false,
				text: this.generateFallbackSummary(resumeText),
				model: "fallback",
			};
		}
	}

	/**
	 * Calculate various scores for the resume
	 */
	async calculateScores(analysisData) {
		const {
			basicInfo,
			skillsAnalysis,
			experienceAnalysis,
			educationAnalysis,
			resumeText,
		} = analysisData;

		// ATS Compatibility Score (0-100)
		const atsScore = this.calculateATSScore(resumeText, skillsAnalysis);

		// Completeness Score (0-100)
		const completenessScore = this.calculateCompletenessScore({
			basicInfo,
			skillsAnalysis,
			experienceAnalysis,
			educationAnalysis,
		});

		// Professional Score (0-100)
		const professionalScore = this.calculateProfessionalScore(
			resumeText,
			experienceAnalysis
		);

		// Skills Relevance Score (0-100)
		const skillsScore = skillsAnalysis
			? this.calculateSkillsScore(skillsAnalysis)
			: 0;

		// Overall Score (weighted average)
		const overallScore = Math.round(
			atsScore * 0.3 +
				completenessScore * 0.25 +
				professionalScore * 0.25 +
				skillsScore * 0.2
		);

		return {
			overall: overallScore,
			ats: atsScore,
			completeness: completenessScore,
			professional: professionalScore,
			skills: skillsScore,
			breakdown: {
				ats: { score: atsScore, weight: 30 },
				completeness: { score: completenessScore, weight: 25 },
				professional: { score: professionalScore, weight: 25 },
				skills: { score: skillsScore, weight: 20 },
			},
		};
	}

	/**
	 * Calculate job matching score
	 */
	async calculateJobMatch(analysisResult, jobDescription) {
		try {
			// Generate embeddings for skills and job description
			const skillsText =
				analysisResult.skillsAnalysis?.detected?.join(" ") || "";
			const experienceText =
				analysisResult.experienceAnalysis?.roles?.join(" ") || "";
			const candidateProfile = `${skillsText} ${experienceText}`;

			const candidateEmbedding = await generateEmbeddings(candidateProfile);
			const jobEmbedding = await generateEmbeddings(jobDescription);

			if (candidateEmbedding.success && jobEmbedding.success) {
				const similarity = cosineSimilarity(
					candidateEmbedding.embedding,
					jobEmbedding.embedding
				);
				const matchScore = Math.round(similarity * 100);

				// Detailed matching analysis
				const skillsMatch = this.calculateSkillsMatch(
					analysisResult.skillsAnalysis?.detected || [],
					jobDescription
				);

				const experienceMatch = this.calculateExperienceMatch(
					analysisResult.experienceAnalysis || {},
					jobDescription
				);

				return {
					overallScore: matchScore,
					similarity: similarity,
					skillsMatch: skillsMatch,
					experienceMatch: experienceMatch,
					recommendation: this.generateMatchRecommendation(matchScore),
					missingSkills: skillsMatch.missing,
					matchingSkills: skillsMatch.matching,
				};
			}

			return {
				overallScore: 0,
				error: "Failed to generate embeddings for matching",
			};
		} catch (error) {
			console.error("Error calculating job match:", error);
			return {
				overallScore: 0,
				error: error.message,
			};
		}
	}

	/**
	 * Generate recommendations for resume improvement
	 */
	async generateRecommendations(analysisResult, jobDescription = "") {
		const recommendations = [];

		// Skills recommendations
		if (analysisResult.skills?.detected?.length < 5) {
			recommendations.push({
				category: "skills",
				priority: "high",
				title: "Add More Skills",
				description:
					"Include more relevant technical and soft skills to improve visibility",
				actionItems: [
					"List programming languages you know",
					"Add software tools you've used",
					"Include industry-specific skills",
					"Mention certifications",
				],
			});
		}

		// Experience recommendations
		if (analysisResult.experience?.totalYears < 1) {
			recommendations.push({
				category: "experience",
				priority: "medium",
				title: "Highlight Projects and Internships",
				description:
					"Emphasize academic projects, internships, and volunteer work",
				actionItems: [
					"Add relevant academic projects",
					"Include internship experiences",
					"Mention volunteer work",
					"Highlight freelance projects",
				],
			});
		}

		// Contact information recommendations
		const contact = analysisResult.contactInfo;
		if (!contact?.email || !contact?.phone) {
			recommendations.push({
				category: "contact",
				priority: "high",
				title: "Complete Contact Information",
				description: "Ensure all essential contact details are included",
				actionItems: [
					"Add professional email address",
					"Include phone number",
					"Add LinkedIn profile link",
					"Consider adding portfolio website",
				],
			});
		}

		// ATS optimization recommendations
		if (analysisResult.scores?.ats < 70) {
			recommendations.push({
				category: "formatting",
				priority: "high",
				title: "Improve ATS Compatibility",
				description: "Optimize resume format for Applicant Tracking Systems",
				actionItems: [
					"Use standard section headings",
					"Include relevant keywords",
					"Use simple, clean formatting",
					"Save as both PDF and Word formats",
				],
			});
		}

		return recommendations;
	}

	/**
	 * Compare multiple resumes
	 */
	async compareResumes(resumes, jobDescription = "", criteria = "overall") {
		const comparisons = [];

		// Generate embeddings for each resume
		for (let i = 0; i < resumes.length; i++) {
			const resume = resumes[i];
			const profileText = this.createProfileText(resume.analysis);
			const embedding = await generateEmbeddings(profileText);

			comparisons.push({
				index: i,
				fileName: resume.fileName,
				profileText: profileText,
				embedding: embedding.success ? embedding.embedding : null,
				analysis: resume.analysis,
			});
		}

		// Calculate similarity matrix
		const similarityMatrix = [];
		for (let i = 0; i < comparisons.length; i++) {
			const row = [];
			for (let j = 0; j < comparisons.length; j++) {
				if (i === j) {
					row.push(1.0);
				} else if (comparisons[i].embedding && comparisons[j].embedding) {
					const similarity = cosineSimilarity(
						comparisons[i].embedding,
						comparisons[j].embedding
					);
					row.push(similarity);
				} else {
					row.push(0);
				}
			}
			similarityMatrix.push(row);
		}

		// Rank resumes based on criteria
		const rankings = this.rankResumes(comparisons, jobDescription, criteria);

		return {
			resumes: comparisons.map((c) => ({
				fileName: c.fileName,
				analysis: c.analysis,
			})),
			similarityMatrix: similarityMatrix,
			rankings: rankings,
			topCandidate: rankings[0],
			criteria: criteria,
		};
	}

	/**
	 * Analyze skills gap between resume and job requirements
	 */
	async analyzeSkillsGap(resumeAnalysis, jobRequirements) {
		const candidateSkills = resumeAnalysis.skills?.detected || [];
		const requiredSkills = this.extractSkillsFromText(jobRequirements);

		const matchingSkills = candidateSkills.filter((skill) =>
			requiredSkills.some((req) =>
				req.toLowerCase().includes(skill.toLowerCase())
			)
		);

		const missingSkills = requiredSkills.filter(
			(skill) =>
				!candidateSkills.some((candidate) =>
					candidate.toLowerCase().includes(skill.toLowerCase())
				)
		);

		const gapScore =
			(matchingSkills.length / Math.max(requiredSkills.length, 1)) * 100;

		return {
			requiredSkills: requiredSkills,
			candidateSkills: candidateSkills,
			matchingSkills: matchingSkills,
			missingSkills: missingSkills,
			gapScore: Math.round(gapScore),
			recommendations: this.generateSkillsGapRecommendations(missingSkills),
			learningPath: this.generateLearningPath(missingSkills),
		};
	}

	// Helper methods (simplified for brevity)

	loadSkillsDatabase() {
		return {
			programming: [
				"JavaScript",
				"Python",
				"Java",
				"C++",
				"C#",
				"Ruby",
				"PHP",
				"Go",
				"Rust",
			],
			web: [
				"HTML",
				"CSS",
				"React",
				"Angular",
				"Vue.js",
				"Node.js",
				"Express",
				"Django",
			],
			database: [
				"MySQL",
				"PostgreSQL",
				"MongoDB",
				"Redis",
				"Oracle",
				"SQL Server",
			],
			cloud: [
				"AWS",
				"Azure",
				"Google Cloud",
				"Docker",
				"Kubernetes",
				"Terraform",
			],
			tools: [
				"Git",
				"GitHub",
				"GitLab",
				"Jira",
				"Confluence",
				"Jenkins",
				"Docker",
			],
			soft: [
				"Leadership",
				"Communication",
				"Problem Solving",
				"Team Work",
				"Project Management",
			],
		};
	}

	loadIndustryKeywords() {
		return {
			technology: [
				"software",
				"development",
				"programming",
				"coding",
				"engineering",
			],
			finance: ["banking", "investment", "financial", "accounting", "trading"],
			healthcare: ["medical", "clinical", "patient", "healthcare", "hospital"],
			education: [
				"teaching",
				"education",
				"academic",
				"research",
				"university",
			],
		};
	}

	loadATSKeywords() {
		return [
			"experience",
			"skills",
			"education",
			"qualifications",
			"achievements",
			"responsibilities",
			"projects",
			"certifications",
		];
	}

	extractSkillsFromText(text) {
		const skills = [];
		const allSkills = Object.values(this.skillsDatabase).flat();

		allSkills.forEach((skill) => {
			const regex = new RegExp(`\\b${skill}\\b`, "gi");
			if (regex.test(text)) {
				skills.push(skill);
			}
		});

		return [...new Set(skills)]; // Remove duplicates
	}

	categorizeSkills(skills) {
		const categorized = {};

		Object.entries(this.skillsDatabase).forEach(
			([category, categorySkills]) => {
				categorized[category] = skills.filter((skill) =>
					categorySkills.some(
						(catSkill) => catSkill.toLowerCase() === skill.toLowerCase()
					)
				);
			}
		);

		return categorized;
	}

	extractNameFromText(text) {
		// Simple name extraction fallback
		const lines = text.split("\n");
		const firstLine = lines[0]?.trim();

		if (firstLine && firstLine.length < 50 && !firstLine.includes("@")) {
			return firstLine;
		}

		return null;
	}

	generateAnalysisId() {
		return (
			"resume_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
		);
	}

	calculateConfidence(analysisData) {
		const { basicInfo, skillsAnalysis, experienceAnalysis, educationAnalysis } =
			analysisData;

		let confidence = 0;
		let factors = 0;

		if (basicInfo?.emails?.length > 0) {
			confidence += 20;
			factors++;
		}
		if (skillsAnalysis?.detected?.length > 0) {
			confidence += 30;
			factors++;
		}
		if (experienceAnalysis?.experiences?.length > 0) {
			confidence += 30;
			factors++;
		}
		if (educationAnalysis?.entries?.length > 0) {
			confidence += 20;
			factors++;
		}

		return factors > 0 ? Math.round(confidence / factors) : 0;
	}

	// Additional helper methods would be implemented here...
	// (extractExperienceSection, parseExperiences, calculateATSScore, etc.)

	extractExperienceSection(text) {
		const experienceKeywords = [
			"experience",
			"work history",
			"employment",
			"career",
		];
		const lines = text.split("\n");
		let startIndex = -1;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].toLowerCase();
			if (experienceKeywords.some((keyword) => line.includes(keyword))) {
				startIndex = i;
				break;
			}
		}

		if (startIndex === -1) return text; // Fallback to full text

		return lines.slice(startIndex).join("\n");
	}

	parseExperiences(experienceText) {
		// Simplified experience parsing
		return [
			{
				company: "Example Corp",
				role: "Software Developer",
				duration: "2020-2023",
				description: "Developed web applications",
			},
		];
	}

	calculateTotalExperience(experiences) {
		// Simplified calculation
		return experiences.length * 2; // Assume 2 years per role
	}

	analyzeCareerProgression(experiences) {
		return {
			trend: "ascending",
			promotions: 1,
			industryChanges: 0,
		};
	}

	determineSeniorityLevel(totalYears, roles) {
		if (totalYears < 2) return "entry";
		if (totalYears < 5) return "mid";
		return "senior";
	}

	extractIndustryExperience(text) {
		return ["technology"];
	}

	extractEducationSection(text) {
		const educationKeywords = ["education", "academic", "degree", "university"];
		const lines = text.split("\n");
		let startIndex = -1;

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].toLowerCase();
			if (educationKeywords.some((keyword) => line.includes(keyword))) {
				startIndex = i;
				break;
			}
		}

		if (startIndex === -1) return "";

		return lines.slice(startIndex).join("\n");
	}

	parseEducation(educationText) {
		return [
			{
				degree: "Bachelor of Science",
				field: "Computer Science",
				institution: "University of Technology",
				year: "2020",
			},
		];
	}

	determineHighestDegree(educationEntries) {
		if (educationEntries.some((e) => e.degree?.toLowerCase().includes("phd")))
			return "PhD";
		if (
			educationEntries.some((e) => e.degree?.toLowerCase().includes("master"))
		)
			return "Masters";
		if (
			educationEntries.some((e) => e.degree?.toLowerCase().includes("bachelor"))
		)
			return "Bachelors";
		return "Other";
	}

	extractGPA(text) {
		const gpaMatch = text.match(/gpa[:\s]+(\d+\.?\d*)/i);
		return gpaMatch ? parseFloat(gpaMatch[1]) : null;
	}

	extractCertifications(text) {
		const certKeywords = ["certified", "certification", "certificate"];
		const lines = text.split("\n");
		return lines.filter((line) =>
			certKeywords.some((keyword) => line.toLowerCase().includes(keyword))
		);
	}

	generateFallbackSummary(resumeText) {
		const firstParagraph = resumeText.split("\n\n")[0];
		return firstParagraph.length > 100
			? firstParagraph.substring(0, 200) + "..."
			: "Professional with experience in various technologies and domains.";
	}

	calculateATSScore(resumeText, skillsAnalysis) {
		let score = 0;

		// Check for standard sections
		const sections = ["experience", "education", "skills"];
		sections.forEach((section) => {
			if (resumeText.toLowerCase().includes(section)) score += 20;
		});

		// Check for skills
		const skillCount = skillsAnalysis?.detected?.length || 0;
		score += Math.min(skillCount * 2, 20);

		// Check for contact info
		if (resumeText.includes("@")) score += 10;

		return Math.min(score, 100);
	}

	calculateCompletenessScore(analysisData) {
		let score = 0;

		if (analysisData.basicInfo?.emails?.length > 0) score += 25;
		if (analysisData.skillsAnalysis?.detected?.length > 0) score += 25;
		if (analysisData.experienceAnalysis?.experiences?.length > 0) score += 25;
		if (analysisData.educationAnalysis?.entries?.length > 0) score += 25;

		return score;
	}

	calculateProfessionalScore(resumeText, experienceAnalysis) {
		let score = 50; // Base score

		// Check for professional language
		const professionalWords = [
			"achieved",
			"managed",
			"developed",
			"implemented",
		];
		professionalWords.forEach((word) => {
			if (resumeText.toLowerCase().includes(word)) score += 5;
		});

		// Experience years bonus
		const years = experienceAnalysis?.totalYears || 0;
		score += Math.min(years * 5, 30);

		return Math.min(score, 100);
	}

	calculateSkillsScore(skillsAnalysis) {
		const skillCount = skillsAnalysis.detected?.length || 0;
		const categoryCount = Object.keys(skillsAnalysis.categorized || {}).length;

		return Math.min(skillCount * 3 + categoryCount * 10, 100);
	}

	calculateSkillsMatch(candidateSkills, jobDescription) {
		const jobSkills = this.extractSkillsFromText(jobDescription);
		const matching = candidateSkills.filter((skill) =>
			jobSkills.some((job) => job.toLowerCase().includes(skill.toLowerCase()))
		);
		const missing = jobSkills.filter(
			(skill) =>
				!candidateSkills.some((candidate) =>
					candidate.toLowerCase().includes(skill.toLowerCase())
				)
		);

		return {
			matching: matching,
			missing: missing,
			score: (matching.length / Math.max(jobSkills.length, 1)) * 100,
		};
	}

	calculateExperienceMatch(experienceAnalysis, jobDescription) {
		const roles = experienceAnalysis.roles || [];
		const jobText = jobDescription.toLowerCase();
		const matchingRoles = roles.filter((role) =>
			jobText.includes(role.toLowerCase())
		);

		return {
			matching: matchingRoles,
			score: (matchingRoles.length / Math.max(roles.length, 1)) * 100,
		};
	}

	generateMatchRecommendation(score) {
		if (score >= 80) return "Excellent match - highly recommended";
		if (score >= 60)
			return "Good match - recommended with some skill development";
		if (score >= 40)
			return "Moderate match - requires significant skill development";
		return "Low match - consider alternative positions or extensive training";
	}

	createProfileText(analysis) {
		const skills = analysis.skills?.detected?.join(" ") || "";
		const roles = analysis.experience?.roles?.join(" ") || "";
		const education = analysis.education?.fields?.join(" ") || "";
		return `${skills} ${roles} ${education}`;
	}

	rankResumes(comparisons, jobDescription, criteria) {
		return comparisons
			.map((c) => ({
				fileName: c.fileName,
				analysis: c.analysis,
				score: c.analysis.scores?.overall || 0,
			}))
			.sort((a, b) => b.score - a.score);
	}

	generateSkillsGapRecommendations(missingSkills) {
		return missingSkills.slice(0, 5).map((skill) => ({
			skill: skill,
			priority: "high",
			recommendation: `Learn ${skill} through online courses or certification programs`,
		}));
	}

	generateLearningPath(missingSkills) {
		return missingSkills.slice(0, 3).map((skill, index) => ({
			step: index + 1,
			skill: skill,
			estimatedTime: "2-4 weeks",
			resources: [
				"Online tutorials",
				"Practice projects",
				"Certification courses",
			],
		}));
	}

	estimateSkillLevels(resumeText, skills) {
		const levels = {};
		skills.forEach((skill) => {
			const occurrences = (
				resumeText.toLowerCase().match(new RegExp(skill.toLowerCase(), "g")) ||
				[]
			).length;
			if (occurrences >= 3) levels[skill] = "advanced";
			else if (occurrences >= 2) levels[skill] = "intermediate";
			else levels[skill] = "beginner";
		});
		return levels;
	}

	async extractInformation(resumeText, extractFields) {
		const info = {};

		if (extractFields.includes("all") || extractFields.includes("contact")) {
			info.contact = await this.extractContactInfo(resumeText);
		}

		if (extractFields.includes("all") || extractFields.includes("skills")) {
			info.skills = await this.analyzeSkills(resumeText);
		}

		if (extractFields.includes("all") || extractFields.includes("experience")) {
			info.experience = await this.analyzeExperience(resumeText);
		}

		if (extractFields.includes("all") || extractFields.includes("education")) {
			info.education = await this.analyzeEducation(resumeText);
		}

		return info;
	}

	async scoreResume(analysisResult, options) {
		const scores = analysisResult.scores;

		return {
			overallScore: scores.overall,
			categoryScores: scores.breakdown,
			strengths: this.identifyStrengths(analysisResult),
			weaknesses: this.identifyWeaknesses(analysisResult),
			improvementSuggestions: await this.generateRecommendations(
				analysisResult,
				options.jobDescription
			),
			atsCompatibility: scores.ats,
			industryAlignment: this.calculateIndustryAlignment(
				analysisResult,
				options.industry
			),
			detailedFeedback: options.enhancedScoring
				? this.generateDetailedFeedback(analysisResult)
				: null,
		};
	}

	identifyStrengths(analysisResult) {
		const strengths = [];

		if (analysisResult.skills?.detected?.length > 10) {
			strengths.push("Rich skill set with diverse technologies");
		}

		if (analysisResult.experience?.totalYears > 3) {
			strengths.push("Substantial work experience");
		}

		if (analysisResult.scores?.overall > 80) {
			strengths.push("Well-structured and comprehensive resume");
		}

		return strengths;
	}

	identifyWeaknesses(analysisResult) {
		const weaknesses = [];

		if (analysisResult.skills?.detected?.length < 5) {
			weaknesses.push("Limited skills mentioned");
		}

		if (analysisResult.experience?.totalYears < 1) {
			weaknesses.push("Limited professional experience");
		}

		if (analysisResult.scores?.ats < 60) {
			weaknesses.push("Poor ATS compatibility");
		}

		return weaknesses;
	}

	calculateIndustryAlignment(analysisResult, industry) {
		if (!industry || industry === "general") return 75;

		const skills = analysisResult.skills?.detected || [];
		const industrySkills = this.industryKeywords[industry] || [];

		const alignment = skills.filter((skill) =>
			industrySkills.some((ind) => skill.toLowerCase().includes(ind))
		).length;

		return Math.min(
			(alignment / Math.max(industrySkills.length, 1)) * 100,
			100
		);
	}

	generateDetailedFeedback(analysisResult) {
		return {
			structuralAnalysis: "Resume follows standard format with clear sections",
			contentDepth: "Provides adequate detail in experience descriptions",
			keywordOptimization: "Good use of industry-relevant keywords",
			professionalPresentation: "Professional tone and formatting",
		};
	}

	async getResumeTemplates(category, industry) {
		// Return template information (would be loaded from database in production)
		return {
			professional: [
				{
					name: "Classic Professional",
					description: "Clean, traditional format",
				},
				{
					name: "Modern Professional",
					description: "Contemporary design with subtle colors",
				},
			],
			creative: [
				{
					name: "Creative Designer",
					description: "Visual appeal for creative roles",
				},
				{ name: "Portfolio Style", description: "Showcase-focused layout" },
			],
			technical: [
				{
					name: "Engineering Resume",
					description: "Technical skills emphasis",
				},
				{
					name: "Developer Portfolio",
					description: "Code and project focused",
				},
			],
		};
	}

	async optimizeForATS(resumeText, options) {
		const { jobDescription, targetATS, level } = options;

		// Analyze current ATS score
		const originalScore = this.calculateATSScore(resumeText, {
			detected: this.extractSkillsFromText(resumeText),
		});

		// Generate optimization suggestions
		const improvements = [
			"Add more relevant keywords from job description",
			"Use standard section headings (Experience, Education, Skills)",
			"Include more action verbs in experience descriptions",
			"Ensure contact information is clearly formatted",
		];

		const keywordSuggestions = this.extractSkillsFromText(jobDescription || "");

		return {
			originalScore: originalScore,
			optimizedScore: Math.min(originalScore + 20, 100), // Simulated improvement
			improvements: improvements,
			optimizedContent: resumeText, // Would be actually optimized in production
			keywordSuggestions: keywordSuggestions,
			formatRecommendations: [
				"Use bullet points for experience items",
				"Maintain consistent formatting throughout",
				"Use standard fonts (Arial, Calibri, Times New Roman)",
				"Save in both PDF and Word formats",
			],
		};
	}

	async getUserHistory(userId, options) {
		// Mock implementation - would fetch from database in production
		return {
			items: [
				{
					id: "analysis_1",
					timestamp: new Date().toISOString(),
					fileName: "resume_v1.pdf",
					overallScore: 75,
					analysisType: "comprehensive",
				},
			],
			totalPages: 1,
			totalItems: 1,
		};
	}
}

module.exports = ResumeAnalyzer;
