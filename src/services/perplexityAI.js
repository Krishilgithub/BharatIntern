/**
 * Perplexity AI Service
 * Handles resume analysis using Perplexity AI API
 */

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * Analyze resume using Perplexity AI
 * @param {string} resumeText - Extracted resume text
 * @param {object} options - Additional options for analysis
 * @returns {Promise<object>} Analysis results
 */
export const analyzeResumeWithPerplexity = async (resumeText, options = {}) => {
	const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

	if (!apiKey) {
		throw new Error("Perplexity API key not configured");
	}

	const prompt = buildResumeAnalysisPrompt(resumeText, options);

	try {
		const response = await fetch(PERPLEXITY_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: options.model || "llama-3.1-sonar-large-128k-online",
				messages: [
					{
						role: "system",
						content:
							"You are an expert HR professional and resume analyst with years of experience in talent acquisition and career development. Provide detailed, actionable feedback.",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.7,
				max_tokens: options.maxTokens || 4000,
				top_p: 0.9,
				stream: false,
			}),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(
				`Perplexity API error: ${error.message || response.statusText}`
			);
		}

		const data = await response.json();
		const analysisText = data.choices[0].message.content;

		// Parse the structured response
		return parseAnalysisResponse(analysisText, resumeText);
	} catch (error) {
		console.error("Perplexity AI analysis error:", error);
		throw error;
	}
};

/**
 * Build comprehensive resume analysis prompt
 */
const buildResumeAnalysisPrompt = (resumeText, options) => {
	return `Analyze this resume comprehensively and provide a detailed JSON response with the following structure:

RESUME TEXT:
${resumeText}

${options.targetRole ? `TARGET ROLE: ${options.targetRole}` : ""}
${options.targetIndustry ? `TARGET INDUSTRY: ${options.targetIndustry}` : ""}

Please analyze and return a JSON object with these exact fields:

{
  "overallScore": (number 0-100),
  "summary": "Brief 2-3 sentence summary of the candidate",
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  
  "extractedSkills": [
    {
      "name": "skill name",
      "category": "Technical|Soft|Business|Language",
      "level": "Beginner|Intermediate|Advanced|Expert",
      "confidence": (number 0-100),
      "years": (number, estimated years of experience)
    }
  ],
  
  "experience": {
    "totalYears": (number),
    "roles": [
      {
        "title": "job title",
        "company": "company name",
        "duration": "duration",
        "highlights": ["achievement 1", "achievement 2"]
      }
    ]
  },
  
  "education": [
    {
      "degree": "degree name",
      "institution": "university/college",
      "year": "graduation year",
      "gpa": "GPA if mentioned"
    }
  ],
  
  "improvements": [
    {
      "type": "Content|Formatting|Skills|Experience",
      "section": "section name",
      "priority": "High|Medium|Low",
      "original": "current text (if applicable)",
      "suggested": "suggested improvement",
      "reason": "why this improvement is needed"
    }
  ],
  
  "atsCompatibility": {
    "score": (number 0-100),
    "parsing_success": true,
    "format_issues": ["issue 1", "issue 2"],
    "keyword_optimization": (number 0-100),
    "recommendations": ["recommendation 1", "recommendation 2"]
  },
  
  "careerSuggestions": [
    {
      "title": "job title",
      "industry": "industry name",
      "match_score": (number 0-100),
      "required_skills": ["skill 1", "skill 2"],
      "salary_range": "estimated salary range",
      "growth_potential": "High|Medium|Low",
      "reasoning": "why this role fits"
    }
  ],
  
  "skillGaps": [
    {
      "skill": "skill name",
      "importance": "Critical|High|Medium|Low",
      "current_level": "None|Beginner|Intermediate",
      "required_level": "Intermediate|Advanced|Expert",
      "learning_resources": ["resource 1", "resource 2"],
      "estimated_time": "time to acquire"
    }
  ],
  
  "industryBenchmark": {
    "industry": "primary industry",
    "percentile": (number 0-100),
    "comparison": "how candidate compares to industry standards",
    "marketTrends": ["trend 1", "trend 2"]
  },
  
  "contactInfo": {
    "email": "email if found",
    "phone": "phone if found",
    "linkedin": "linkedin if found",
    "github": "github if found",
    "portfolio": "portfolio if found"
  },
  
  "keywords": ["keyword1", "keyword2", ...],
  
  "readabilityScore": (number 0-100),
  "formattingScore": (number 0-100),
  "impactScore": (number 0-100)
}

Ensure the response is valid JSON only, no additional text. Be thorough and specific in your analysis.`;
};

/**
 * Parse the analysis response from Perplexity AI
 */
const parseAnalysisResponse = (analysisText, originalText) => {
	try {
		// Try to extract JSON from the response
		let jsonMatch = analysisText.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			// If no JSON found, try to parse the whole response
			jsonMatch = [analysisText];
		}

		const parsed = JSON.parse(jsonMatch[0]);

		// Ensure all required fields exist with defaults
		return {
			overallScore: parsed.overallScore || 0,
			summary: parsed.summary || "No summary available",
			strengths: parsed.strengths || [],
			weaknesses: parsed.weaknesses || [],
			extractedSkills: parsed.extractedSkills || [],
			experience: parsed.experience || { totalYears: 0, roles: [] },
			education: parsed.education || [],
			improvements: parsed.improvements || [],
			atsCompatibility: parsed.atsCompatibility || {
				score: 0,
				parsing_success: true,
				format_issues: [],
				keyword_optimization: 0,
				recommendations: [],
			},
			careerSuggestions: parsed.careerSuggestions || [],
			skillGaps: parsed.skillGaps || [],
			industryBenchmark: parsed.industryBenchmark || null,
			contactInfo: parsed.contactInfo || {},
			keywords: parsed.keywords || [],
			readabilityScore: parsed.readabilityScore || 0,
			formattingScore: parsed.formattingScore || 0,
			impactScore: parsed.impactScore || 0,
			extractedText: originalText,
			analyzedAt: new Date().toISOString(),
			aiProvider: "Perplexity AI",
		};
	} catch (error) {
		console.error("Error parsing Perplexity AI response:", error);
		console.log("Raw response:", analysisText);

		// Return a structured error response
		throw new Error(
			"Failed to parse AI response. Please try again or check the resume format."
		);
	}
};

/**
 * Analyze resume with specific focus areas
 */
export const analyzeResumeWithFocus = async (
	resumeText,
	focusAreas = [],
	options = {}
) => {
	const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

	if (!apiKey) {
		throw new Error("Perplexity API key not configured");
	}

	const focusPrompt = `Focus specifically on these areas: ${focusAreas.join(
		", "
	)}`;

	try {
		const response = await fetch(PERPLEXITY_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "llama-3.1-sonar-large-128k-online",
				messages: [
					{
						role: "system",
						content:
							"You are an expert resume analyst. Provide targeted, actionable feedback.",
					},
					{
						role: "user",
						content: `${focusPrompt}\n\nRESUME:\n${resumeText}\n\nProvide detailed analysis as JSON.`,
					},
				],
				temperature: 0.7,
				max_tokens: 2000,
			}),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.statusText}`);
		}

		const data = await response.json();
		return {
			content: data.choices[0].message.content,
			focusAreas,
			analyzedAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Focus analysis error:", error);
		throw error;
	}
};

/**
 * Get career suggestions based on resume
 */
export const getCareerSuggestions = async (resumeText, preferences = {}) => {
	const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

	if (!apiKey) {
		throw new Error("Perplexity API key not configured");
	}

	const prompt = `Based on this resume, suggest 5-7 career paths with current market trends:

RESUME:
${resumeText}

PREFERENCES:
${JSON.stringify(preferences, null, 2)}

Return JSON array of career suggestions with: title, industry, match_score, required_skills, salary_range, growth_potential, reasoning, current_demand, future_outlook`;

	try {
		const response = await fetch(PERPLEXITY_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "llama-3.1-sonar-large-128k-online",
				messages: [
					{
						role: "system",
						content:
							"You are a career counselor with real-time market knowledge. Provide data-driven career suggestions.",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.8,
				max_tokens: 3000,
			}),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.statusText}`);
		}

		const data = await response.json();
		const content = data.choices[0].message.content;

		// Parse JSON response
		const jsonMatch = content.match(/\[[\s\S]*\]/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]);
		}

		return [];
	} catch (error) {
		console.error("Career suggestions error:", error);
		throw error;
	}
};

/**
 * Optimize resume for ATS systems
 */
export const optimizeForATS = async (resumeText, jobDescription = "") => {
	const apiKey = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY;

	if (!apiKey) {
		throw new Error("Perplexity API key not configured");
	}

	const prompt = `Analyze this resume for ATS compatibility and provide optimization suggestions:

RESUME:
${resumeText}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription}\n` : ""}

Return JSON with:
{
  "ats_score": (0-100),
  "issues": ["issue 1", "issue 2"],
  "missing_keywords": ["keyword 1", "keyword 2"],
  "suggestions": [{"type": "type", "current": "text", "optimized": "text", "reason": "why"}],
  "formatting_tips": ["tip 1", "tip 2"],
  "keyword_density": {"keyword": percentage}
}`;

	try {
		const response = await fetch(PERPLEXITY_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`,
			},
			body: JSON.stringify({
				model: "llama-3.1-sonar-large-128k-online",
				messages: [
					{
						role: "system",
						content:
							"You are an ATS optimization expert. Provide specific, actionable advice.",
					},
					{
						role: "user",
						content: prompt,
					},
				],
				temperature: 0.6,
				max_tokens: 2500,
			}),
		});

		if (!response.ok) {
			throw new Error(`API error: ${response.statusText}`);
		}

		const data = await response.json();
		const content = data.choices[0].message.content;

		const jsonMatch = content.match(/\{[\s\S]*\}/);
		if (jsonMatch) {
			return JSON.parse(jsonMatch[0]);
		}

		return null;
	} catch (error) {
		console.error("ATS optimization error:", error);
		throw error;
	}
};

export const perplexityService = {
	analyzeResume: analyzeResumeWithPerplexity,
	analyzeWithFocus: analyzeResumeWithFocus,
	getCareerSuggestions,
	optimizeForATS,
};
