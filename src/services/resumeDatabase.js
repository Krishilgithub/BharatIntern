import { supabase } from "../lib/supabase";

/**
 * Resume Database Service
 * Handles all database operations related to resume analysis
 */

export const resumeDatabase = {
	/**
	 * Save resume analysis to database
	 * @param {string} userId - User ID
	 * @param {object} analysisData - Analysis data to save
	 * @returns {Promise<object>} Saved analysis
	 */
	saveResumeAnalysis: async (userId, analysisData) => {
		try {
			const { data, error } = await supabase
				.from("resume_analyses")
				.insert([
					{
						user_id: userId,
						filename: analysisData.filename || "resume.pdf",
						file_type: analysisData.fileType || "application/pdf",
						file_size: analysisData.fileSize || 0,
						extracted_text: analysisData.extractedText || "",
						overall_score: analysisData.overallScore || 0,
						analysis_data: analysisData,
						created_at: new Date().toISOString(),
						updated_at: new Date().toISOString(),
					},
				])
				.select()
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error saving resume analysis:", error);
			throw error;
		}
	},

	/**
	 * Save extracted skills from resume
	 * @param {string} analysisId - Analysis ID
	 * @param {array} skills - Array of skills
	 * @returns {Promise<array>} Saved skills
	 */
	saveExtractedSkills: async (analysisId, skills) => {
		try {
			const skillsData = skills.map((skill) => ({
				analysis_id: analysisId,
				skill_name: skill.name || skill,
				confidence: skill.confidence || 80,
				category: skill.category || "General",
				level: skill.level || "Intermediate",
				years_experience: skill.years || 0,
				created_at: new Date().toISOString(),
			}));

			const { data, error } = await supabase
				.from("extracted_skills")
				.insert(skillsData)
				.select();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error saving extracted skills:", error);
			throw error;
		}
	},

	/**
	 * Save resume improvements
	 * @param {string} analysisId - Analysis ID
	 * @param {array} improvements - Array of improvements
	 * @returns {Promise<array>} Saved improvements
	 */
	saveImprovements: async (analysisId, improvements) => {
		try {
			const improvementsData = improvements.map((improvement) => ({
				analysis_id: analysisId,
				improvement_type: improvement.type || "General",
				section: improvement.section || "General",
				original_text: improvement.original || "",
				suggested_text: improvement.suggested || "",
				priority: improvement.priority || "Medium",
				reason: improvement.reason || "",
				applied: false,
				created_at: new Date().toISOString(),
			}));

			const { data, error } = await supabase
				.from("resume_improvements")
				.insert(improvementsData)
				.select();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error saving improvements:", error);
			throw error;
		}
	},

	/**
	 * Save career suggestions
	 * @param {string} analysisId - Analysis ID
	 * @param {array} suggestions - Array of career suggestions
	 * @returns {Promise<array>} Saved suggestions
	 */
	saveCareerSuggestions: async (analysisId, suggestions) => {
		try {
			const suggestionsData = suggestions.map((suggestion) => ({
				analysis_id: analysisId,
				job_title: suggestion.title || suggestion.job_title || "",
				industry: suggestion.industry || "Technology",
				match_score: suggestion.match_score || suggestion.score || 0,
				required_skills: suggestion.required_skills || [],
				salary_range: suggestion.salary_range || "",
				growth_potential: suggestion.growth_potential || "Medium",
				reasoning: suggestion.reasoning || suggestion.reason || "",
				created_at: new Date().toISOString(),
			}));

			const { data, error } = await supabase
				.from("career_suggestions")
				.insert(suggestionsData)
				.select();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error saving career suggestions:", error);
			throw error;
		}
	},

	/**
	 * Save ATS compatibility data
	 * @param {string} analysisId - Analysis ID
	 * @param {object} atsData - ATS compatibility data
	 * @returns {Promise<object>} Saved ATS data
	 */
	saveATSCompatibility: async (analysisId, atsData) => {
		try {
			const { data, error } = await supabase
				.from("ats_compatibility")
				.insert([
					{
						analysis_id: analysisId,
						ats_score: atsData.score || 0,
						parsing_success: atsData.parsing_success || true,
						format_issues: atsData.format_issues || [],
						keyword_optimization: atsData.keyword_optimization || 0,
						recommendations: atsData.recommendations || [],
						created_at: new Date().toISOString(),
					},
				])
				.select()
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error saving ATS compatibility:", error);
			throw error;
		}
	},

	/**
	 * Get user's analysis history
	 * @param {string} userId - User ID
	 * @returns {Promise<array>} Analysis history
	 */
	getUserAnalysisHistory: async (userId) => {
		try {
			const { data, error } = await supabase
				.from("resume_analyses")
				.select("*")
				.eq("user_id", userId)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error("Error getting analysis history:", error);
			return [];
		}
	},

	/**
	 * Delete an analysis
	 * @param {string} analysisId - Analysis ID
	 * @param {string} userId - User ID
	 * @returns {Promise<boolean>} Success status
	 */
	deleteAnalysis: async (analysisId, userId) => {
		try {
			const { error } = await supabase
				.from("resume_analyses")
				.delete()
				.eq("id", analysisId)
				.eq("user_id", userId);

			if (error) throw error;
			return true;
		} catch (error) {
			console.error("Error deleting analysis:", error);
			throw error;
		}
	},

	/**
	 * Mark improvement as applied
	 * @param {string} improvementId - Improvement ID
	 * @returns {Promise<object>} Updated improvement
	 */
	markImprovementApplied: async (improvementId) => {
		try {
			const { data, error } = await supabase
				.from("resume_improvements")
				.update({ applied: true, updated_at: new Date().toISOString() })
				.eq("id", improvementId)
				.select()
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error marking improvement as applied:", error);
			throw error;
		}
	},

	/**
	 * Get full analysis with all related data
	 * @param {string} analysisId - Analysis ID
	 * @returns {Promise<object>} Full analysis data
	 */
	getFullAnalysis: async (analysisId) => {
		try {
			// Get main analysis
			const { data: analysis, error: analysisError } = await supabase
				.from("resume_analyses")
				.select("*")
				.eq("id", analysisId)
				.single();

			if (analysisError) throw analysisError;

			// Get related data in parallel
			const [skills, improvements, suggestions, atsData] = await Promise.all([
				supabase
					.from("extracted_skills")
					.select("*")
					.eq("analysis_id", analysisId),
				supabase
					.from("resume_improvements")
					.select("*")
					.eq("analysis_id", analysisId),
				supabase
					.from("career_suggestions")
					.select("*")
					.eq("analysis_id", analysisId),
				supabase
					.from("ats_compatibility")
					.select("*")
					.eq("analysis_id", analysisId)
					.single(),
			]);

			return {
				...analysis,
				skills: skills.data || [],
				improvements: improvements.data || [],
				suggestions: suggestions.data || [],
				ats: atsData.data || null,
			};
		} catch (error) {
			console.error("Error getting full analysis:", error);
			throw error;
		}
	},
};

// Export supabase client for backward compatibility
export { supabase };
