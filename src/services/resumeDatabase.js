import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database service for Resume Analyzer
class ResumeDatabase {
	constructor() {
		this.supabase = supabase;
	}

	// Create resume analysis record
	async saveResumeAnalysis(userId, analysisData) {
		try {
			const { data, error } = await this.supabase
				.from("resume_analyses")
				.insert({
					user_id: userId,
					filename: analysisData.filename,
					file_type: analysisData.fileType,
					file_size: analysisData.fileSize,
					extracted_text: analysisData.extractedText,
					overall_score: analysisData.overallScore,
					analysis_data: analysisData.analysis,
					created_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error saving resume analysis:", error);
			throw error;
		}
	}

	// Get user's resume analysis history
	async getUserAnalysisHistory(userId) {
		try {
			const { data, error } = await this.supabase
				.from("resume_analyses")
				.select("*")
				.eq("user_id", userId)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error("Error fetching analysis history:", error);
			return [];
		}
	}

	// Get specific analysis by ID
	async getAnalysisById(analysisId) {
		try {
			const { data, error } = await this.supabase
				.from("resume_analyses")
				.select("*")
				.eq("id", analysisId)
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error fetching analysis:", error);
			throw error;
		}
	}

	// Save extracted skills
	async saveExtractedSkills(analysisId, skills) {
		try {
			const skillRecords = skills.map((skill) => ({
				analysis_id: analysisId,
				skill_name: skill.name,
				confidence: skill.confidence,
				category: skill.category,
				level: skill.level,
				years_experience: skill.yearsExp || 0,
			}));

			const { data, error } = await this.supabase
				.from("extracted_skills")
				.insert(skillRecords)
				.select();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error saving extracted skills:", error);
			throw error;
		}
	}

	// Save improvements
	async saveImprovements(analysisId, improvements) {
		try {
			const improvementRecords = improvements.map((improvement) => ({
				analysis_id: analysisId,
				section: improvement.section,
				priority: improvement.priority,
				suggestion: improvement.suggestion,
				impact: improvement.impact,
				details: improvement.details || null,
				applied: false,
			}));

			const { data, error } = await this.supabase
				.from("resume_improvements")
				.insert(improvementRecords)
				.select();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error saving improvements:", error);
			throw error;
		}
	}

	// Mark improvement as applied
	async markImprovementApplied(improvementId) {
		try {
			const { data, error } = await this.supabase
				.from("resume_improvements")
				.update({ applied: true, applied_at: new Date().toISOString() })
				.eq("id", improvementId)
				.select();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error marking improvement as applied:", error);
			throw error;
		}
	}

	// Save career suggestions
	async saveCareerSuggestions(analysisId, careerSuggestions) {
		try {
			const careerRecords = careerSuggestions.map((career) => ({
				analysis_id: analysisId,
				job_title: career.title,
				match_percentage: career.match,
				reason: career.reason,
				salary_range: career.salaryRange,
				skills_needed: career.skillsNeeded || null,
			}));

			const { data, error } = await this.supabase
				.from("career_suggestions")
				.insert(careerRecords)
				.select();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error saving career suggestions:", error);
			throw error;
		}
	}

	// Save ATS compatibility data
	async saveATSCompatibility(analysisId, atsData) {
		try {
			const { data, error } = await this.supabase
				.from("ats_compatibility")
				.insert({
					analysis_id: analysisId,
					score: atsData.score,
					issues: atsData.issues,
					recommendations: atsData.recommendations,
					keyword_density: atsData.keywordDensity || null,
					formatting_score: atsData.formattingScore || null,
				})
				.select();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error saving ATS compatibility:", error);
			throw error;
		}
	}

	// Get comprehensive analysis data
	async getFullAnalysis(analysisId) {
		try {
			const [analysis, skills, improvements, careers, ats] = await Promise.all([
				this.getAnalysisById(analysisId),
				this.getSkillsByAnalysisId(analysisId),
				this.getImprovementsByAnalysisId(analysisId),
				this.getCareersByAnalysisId(analysisId),
				this.getATSByAnalysisId(analysisId),
			]);

			return {
				...analysis,
				extractedSkills: skills,
				improvements: improvements,
				careerSuggestions: careers,
				atsCompatibility: ats,
			};
		} catch (error) {
			console.error("Error fetching full analysis:", error);
			throw error;
		}
	}

	// Helper methods for getting related data
	async getSkillsByAnalysisId(analysisId) {
		try {
			const { data, error } = await this.supabase
				.from("extracted_skills")
				.select("*")
				.eq("analysis_id", analysisId);

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error("Error fetching skills:", error);
			return [];
		}
	}

	async getImprovementsByAnalysisId(analysisId) {
		try {
			const { data, error } = await this.supabase
				.from("resume_improvements")
				.select("*")
				.eq("analysis_id", analysisId);

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error("Error fetching improvements:", error);
			return [];
		}
	}

	async getCareersByAnalysisId(analysisId) {
		try {
			const { data, error } = await this.supabase
				.from("career_suggestions")
				.select("*")
				.eq("analysis_id", analysisId);

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error("Error fetching careers:", error);
			return [];
		}
	}

	async getATSByAnalysisId(analysisId) {
		try {
			const { data, error } = await this.supabase
				.from("ats_compatibility")
				.select("*")
				.eq("analysis_id", analysisId)
				.single();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error fetching ATS data:", error);
			return null;
		}
	}

	// Analytics and statistics
	async getUserStatistics(userId) {
		try {
			const { data: analyses, error } = await this.supabase
				.from("resume_analyses")
				.select("overall_score, created_at")
				.eq("user_id", userId);

			if (error) throw error;

			const stats = {
				totalAnalyses: analyses.length,
				averageScore:
					analyses.length > 0
						? Math.round(
								analyses.reduce((sum, a) => sum + a.overall_score, 0) /
									analyses.length
						  )
						: 0,
				highestScore:
					analyses.length > 0
						? Math.max(...analyses.map((a) => a.overall_score))
						: 0,
				latestAnalysis: analyses.length > 0 ? analyses[0].created_at : null,
				scoreHistory: analyses
					.map((a) => ({
						date: a.created_at,
						score: a.overall_score,
					}))
					.reverse(),
			};

			return stats;
		} catch (error) {
			console.error("Error fetching user statistics:", error);
			return {
				totalAnalyses: 0,
				averageScore: 0,
				highestScore: 0,
				latestAnalysis: null,
				scoreHistory: [],
			};
		}
	}

	// Search and filter functionality
	async searchAnalyses(userId, searchTerm) {
		try {
			const { data, error } = await this.supabase
				.from("resume_analyses")
				.select("*")
				.eq("user_id", userId)
				.or(
					`filename.ilike.%${searchTerm}%,extracted_text.ilike.%${searchTerm}%`
				)
				.order("created_at", { ascending: false });

			if (error) throw error;
			return data || [];
		} catch (error) {
			console.error("Error searching analyses:", error);
			return [];
		}
	}

	// Delete analysis and related data
	async deleteAnalysis(analysisId, userId) {
		try {
			// Delete in correct order due to foreign key constraints
			await Promise.all([
				this.supabase
					.from("extracted_skills")
					.delete()
					.eq("analysis_id", analysisId),
				this.supabase
					.from("resume_improvements")
					.delete()
					.eq("analysis_id", analysisId),
				this.supabase
					.from("career_suggestions")
					.delete()
					.eq("analysis_id", analysisId),
				this.supabase
					.from("ats_compatibility")
					.delete()
					.eq("analysis_id", analysisId),
			]);

			const { data, error } = await this.supabase
				.from("resume_analyses")
				.delete()
				.eq("id", analysisId)
				.eq("user_id", userId)
				.select();

			if (error) throw error;
			return data;
		} catch (error) {
			console.error("Error deleting analysis:", error);
			throw error;
		}
	}
}

export const resumeDatabase = new ResumeDatabase();
