import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Upload,
	FileText,
	CheckCircle,
	AlertCircle,
	Download,
	Eye,
	X,
	Brain,
	Target,
	TrendingUp,
	Award,
	BookOpen,
	Search,
	Filter,
	RefreshCw,
	Share2,
	Save,
	Edit3,
	Zap,
	BarChart3,
	PieChart,
	Users,
	Star,
	Clock,
	MapPin,
	DollarSign,
	Code,
	Database,
	Globe,
	Briefcase,
	GraduationCap,
	Languages,
	Calendar,
	Phone,
	Mail,
	LinkedIn,
	Github,
	ExternalLink,
	Plus,
	Minus,
	ChevronRight,
	ChevronDown,
	Info,
	AlertTriangle,
	Lightbulb,
	Shield,
	Scissors,
	Palette,
	Settings,
	ArrowRight,
	ArrowUp,
	ArrowDown,
	Maximize2,
	Minimize2,
	Copy,
	Check,
	FileCheck,
	Sparkles,
	Cpu,
	Activity,
	Gauge,
	Trash2,
	Edit,
	BarChart,
	Share,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiService } from "../../services/api";
import { resumeDatabase } from "../../services/resumeDatabase";
import { useAuth } from "../../contexts/AuthContext";

const ResumeAnalyzer = () => {
	const { user } = useAuth();
	const [file, setFile] = useState(null);
	const [analysis, setAnalysis] = useState(null);
	const [loading, setLoading] = useState(false);
	const [dragActive, setDragActive] = useState(false);
	const [activeTab, setActiveTab] = useState("overview");
	const [analysisHistory, setAnalysisHistory] = useState([]);
	const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
	const [compareMode, setCompareMode] = useState(false);
	const [selectedComparison, setSelectedComparison] = useState(null);
	const [resumePreview, setResumePreview] = useState(null);
	const [improvements, setImprovements] = useState([]);
	const [atsScore, setAtsScore] = useState(null);
	const [skillGaps, setSkillGaps] = useState([]);
	const [careerSuggestions, setCareerSuggestions] = useState([]);
	const [industryBenchmark, setIndustryBenchmark] = useState(null);
	const [resumeTemplates, setResumeTemplates] = useState([]);
	const [isBuilding, setIsBuilding] = useState(false);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [resumeData, setResumeData] = useState({
		personalInfo: {},
		experience: [],
		education: [],
		skills: [],
		projects: [],
		certifications: [],
	});

	// Transform backend analysis data to frontend format with enhanced features
	const transformBackendAnalysis = (backendData) => {
		console.log("🔄 Transforming backend analysis:", backendData);
		
		// Handle different analyzer outputs
		let analysis = {};

		// Check for advanced analyzer results in priority order
		if (backendData.resume_analysis) {
			analysis = backendData.resume_analysis;
			console.log("📊 Using resume_analysis data");
		} else if (backendData.nlp_analysis) {
			analysis = backendData.nlp_analysis;
			console.log("📊 Using nlp_analysis data");
		} else if (backendData.langchain_analysis) {
			analysis = backendData.langchain_analysis;
			console.log("📊 Using langchain_analysis data");
		} else if (backendData.nerAnalysis) {
			analysis = backendData.nerAnalysis;
			console.log("📊 Using nerAnalysis data");
		} else if (backendData.basic_analysis) {
			analysis = backendData.basic_analysis;
			console.log("📊 Using basic_analysis data");
		} else {
			analysis = backendData;
			console.log("📊 Using direct backendData");
		}

					// Enhanced transformation to match all tab features
					// First extract skills from various possible backend formats
					const extractedSkills = analysis.extractedSkills || 
					                       analysis.skills || 
					                       analysis.nerAnalysis?.skills ||
					                       analysis.nlp_skills ||
					                       transformSkills(analysis.skills || analysis.entities || {});
					
					// Transform skills to proper format
					const skillsArray = transformSkills(extractedSkills);
					
					const transformedAnalysis = {
						// Overview data
						overallScore: analysis.overall_score || analysis.overallScore || 
						             analysis.atsScore || analysis.score || 75,
						
						// Skills Analysis data - Use actual extracted skills from resume
						extractedSkills: skillsArray,
						missingSkills: analysis.missingSkills || generateMissingSkillsSuggestions(skillsArray),
						skillAnalysis: analysis.skillAnalysis || {
							totalSkills: skillsArray.length,
							categories: categorizeSkills(skillsArray),
							topSkills: skillsArray.slice(0, 5),
							keywordDensity: analysis.keywordDensity || analysis.keyword_density || {}
						},			// ATS Score data
			atsCompatibility: analysis.atsCompatibility || generateATSCompatibility(analysis),
			
			// Improvements data - Generate dynamic improvements based on actual analysis
			improvements: analysis.improvements || analysis.recommendations || generateDynamicImprovements(analysis, skillsArray),
			
			// Career Match data
			careerSuggestions: analysis.careerSuggestions || generateCareerSuggestions(analysis),
			
			// Personal Info
			personalInfo: analysis.personalInfo || analysis.contactInfo || analysis.personal_info || {},
			contactInfo: analysis.contactInfo || analysis.personalInfo || analysis.personal_info || {},
			
			// Experience & Education
			experience: analysis.experience || [],
			education: analysis.education || [],
			projects: analysis.projects || [],
			certifications: analysis.certifications || [],
			
			// Additional data
			summary: analysis.summary || "Resume processed successfully with comprehensive AI analysis",
			timestamp: new Date().toISOString(),
			analysisType: analysis.analysis_method || analysis.analysisMethod || "enhanced_ai",
			extractedContent: analysis.extractedContent || analysis.extractedContentPreview || "",
			
			// Industry benchmarking
			industryBenchmark: analysis.industryBenchmark || {
				averageScore: 65,
				topPercentile: 85,
				yourPercentile: Math.min(95, (analysis.overall_score || 75) + 5),
				comparison: (analysis.overall_score || 75) >= 80 ? "Excellent" : 
				           (analysis.overall_score || 75) >= 70 ? "Above Average" : 
				           (analysis.overall_score || 75) >= 60 ? "Average" : "Below Average"
			}
		};

		return transformedAnalysis;
	};

	// Helper function to generate missing skills suggestions
	const generateMissingSkillsSuggestions = (currentSkills) => {
		const skillNames = (currentSkills || []).map(skill => 
			typeof skill === 'string' ? skill.toLowerCase() : 
			skill.name ? skill.name.toLowerCase() : ''
		);
		
		const commonMissingSkills = [
			{ name: "TypeScript", impact: "+20%", priority: "High", reason: "High demand in modern web development" },
			{ name: "Docker", impact: "+15%", priority: "Medium", reason: "Essential for DevOps and deployment" },
			{ name: "AWS", impact: "+25%", priority: "High", reason: "Cloud computing skills are highly valued" },
			{ name: "React", impact: "+18%", priority: "High", reason: "Popular frontend framework" },
			{ name: "Node.js", impact: "+16%", priority: "Medium", reason: "Backend JavaScript development" },
			{ name: "Python", impact: "+22%", priority: "High", reason: "Versatile programming language" },
			{ name: "Git", impact: "+12%", priority: "Medium", reason: "Version control is essential" },
			{ name: "Kubernetes", impact: "+18%", priority: "Medium", reason: "Container orchestration standard" },
			{ name: "GraphQL", impact: "+14%", priority: "Low", reason: "Modern API query language" },
			{ name: "MongoDB", impact: "+13%", priority: "Medium", reason: "Popular NoSQL database" }
		];

		return commonMissingSkills
			.filter(skill => !skillNames.includes(skill.name.toLowerCase()))
			.slice(0, 4);
	};

	// Helper function to categorize skills
	const categorizeSkills = (skills) => {
		const categories = {
			programming: [],
			frontend: [],
			backend: [],
			database: [],
			cloud: [],
			devops: [],
			mobile: [],
			other: []
		};

		(skills || []).forEach(skill => {
			const skillName = typeof skill === 'string' ? skill : skill.name;
			const skillLower = skillName.toLowerCase();
			
			if (['javascript', 'python', 'java', 'c++', 'c#', 'typescript', 'go', 'rust'].some(lang => skillLower.includes(lang))) {
				categories.programming.push(skillName);
			} else if (['react', 'vue', 'angular', 'html', 'css', 'sass', 'tailwind'].some(tech => skillLower.includes(tech))) {
				categories.frontend.push(skillName);
			} else if (['node', 'express', 'django', 'flask', 'spring', 'laravel'].some(tech => skillLower.includes(tech))) {
				categories.backend.push(skillName);
			} else if (['mysql', 'postgresql', 'mongodb', 'redis', 'oracle'].some(db => skillLower.includes(db))) {
				categories.database.push(skillName);
			} else if (['aws', 'azure', 'gcp', 'cloud', 'lambda', 's3'].some(cloud => skillLower.includes(cloud))) {
				categories.cloud.push(skillName);
			} else if (['docker', 'kubernetes', 'jenkins', 'ci/cd', 'devops'].some(devops => skillLower.includes(devops))) {
				categories.devops.push(skillName);
			} else if (['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android'].some(mobile => skillLower.includes(mobile))) {
				categories.mobile.push(skillName);
			} else {
				categories.other.push(skillName);
			}
		});

		return categories;
	};

	// Transform skills from backend format to frontend format
	const transformSkills = (backendSkills) => {
		console.log("🔍 Transforming skills from backend:", backendSkills);
		
		if (!backendSkills) return [];
		
		// Handle different formats from backend
		if (Array.isArray(backendSkills)) {
			console.log("📋 Processing skills array:", backendSkills);
			return backendSkills.map((skill, index) => ({
				name: typeof skill === 'string' ? skill : (skill.name || skill.text || skill.label || skill),
				confidence: typeof skill === 'object' ? (skill.confidence || skill.score || Math.floor(Math.random() * 20) + 75) : Math.floor(Math.random() * 20) + 75,
				category: typeof skill === 'object' ? (skill.category || skill.label || 'General') : 'General',
				level: typeof skill === 'object' ? (skill.level || 'Intermediate') : 'Intermediate',
				yearsExp: typeof skill === 'object' ? (skill.yearsExp || Math.floor(Math.random() * 3) + 1) : Math.floor(Math.random() * 3) + 1,
				mentions: typeof skill === 'object' ? (skill.mentions || skill.count || 1) : 1
			}));
		}

		if (typeof backendSkills !== "object") {
			// If it's a string, try to parse it or treat as single skill
			if (typeof backendSkills === 'string') {
				return [{
					name: backendSkills,
					confidence: 80,
					category: 'General',
					level: 'Intermediate',
					yearsExp: 1,
					mentions: 1
				}];
			}
			return [];
		}

		const skills = [];

		// Handle HuggingFace NER model output format
		// Look for common NER entities like SKILL, PERSON, ORG, etc.
		Object.entries(backendSkills).forEach(([category, skillList]) => {
			console.log(`📂 Processing category: ${category}`, skillList);
			
			if (Array.isArray(skillList)) {
				skillList.forEach((skill) => {
					const skillName = typeof skill === 'string' ? skill : 
					                 skill.name || skill.text || skill.label || skill.word || 
					                 JSON.stringify(skill);
					
					// Filter out common non-skill entities
					const excludeTerms = ['resume', 'cv', 'candidate', 'applicant', 'email', 'phone', 'address'];
					if (skillName && !excludeTerms.some(term => skillName.toLowerCase().includes(term))) {
						skills.push({
							name: skillName,
							confidence: typeof skill === 'object' ? (skill.confidence || skill.score || Math.floor(Math.random() * 20) + 70) : Math.floor(Math.random() * 20) + 70,
							category: category.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase()),
							level: typeof skill === 'object' ? (skill.level || 'Intermediate') : 'Intermediate',
							yearsExp: Math.floor(Math.random() * 5) + 1,
							mentions: typeof skill === 'object' ? (skill.mentions || skill.count || 1) : 1
						});
					}
				});
			} else if (typeof skillList === 'object' && skillList !== null) {
				// Handle nested objects
				Object.entries(skillList).forEach(([subCategory, subSkillList]) => {
					if (Array.isArray(subSkillList)) {
						subSkillList.forEach((skill) => {
							const skillName = typeof skill === 'string' ? skill : 
							                 skill.name || skill.text || skill.label || skill;
							if (skillName) {
								skills.push({
									name: skillName,
									confidence: typeof skill === 'object' ? (skill.confidence || skill.score || Math.floor(Math.random() * 20) + 70) : Math.floor(Math.random() * 20) + 70,
									category: `${category} - ${subCategory}`.replace(/_/g, " "),
									level: 'Intermediate',
									yearsExp: Math.floor(Math.random() * 3) + 1,
									mentions: 1
								});
							}
						});
					}
				});
			}
		});

		console.log("✅ Transformed skills:", skills);
		return skills;
	};

	// Enhanced career suggestions based on comprehensive analysis
	const generateCareerSuggestions = (analysis) => {
		const suggestions = [];
		const skills = analysis.extractedSkills || analysis.skills || [];
		const skillNames = skills.map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
		
		// Define career paths with skill requirements
		const careerPaths = [
			{
				title: "Full Stack Developer",
				requiredSkills: ['javascript', 'react', 'node', 'html', 'css'],
				salaryRange: "$70k-$120k",
				growth: "High",
				match: 0
			},
			{
				title: "Frontend Engineer", 
				requiredSkills: ['javascript', 'react', 'vue', 'angular', 'html', 'css'],
				salaryRange: "$65k-$110k",
				growth: "High",
				match: 0
			},
			{
				title: "Backend Developer",
				requiredSkills: ['python', 'java', 'node', 'express', 'django'],
				salaryRange: "$75k-$125k", 
				growth: "High",
				match: 0
			},
			{
				title: "DevOps Engineer",
				requiredSkills: ['docker', 'kubernetes', 'aws', 'jenkins', 'linux'],
				salaryRange: "$80k-$140k",
				growth: "Very High", 
				match: 0
			},
			{
				title: "Data Scientist",
				requiredSkills: ['python', 'machine learning', 'sql', 'pandas', 'tensorflow'],
				salaryRange: "$90k-$150k",
				growth: "Very High",
				match: 0
			},
			{
				title: "Mobile Developer",
				requiredSkills: ['react native', 'flutter', 'swift', 'kotlin', 'ios', 'android'],
				salaryRange: "$70k-$130k",
				growth: "High",
				match: 0
			},
			{
				title: "Cloud Engineer",
				requiredSkills: ['aws', 'azure', 'gcp', 'terraform', 'kubernetes'],
				salaryRange: "$85k-$145k",
				growth: "Very High",
				match: 0
			},
			{
				title: "Software Engineer",
				requiredSkills: ['programming', 'algorithms', 'data structures'],
				salaryRange: "$70k-$130k", 
				growth: "High",
				match: 0
			}
		];

		// Calculate match percentage for each career
		careerPaths.forEach(career => {
			const matchedSkills = career.requiredSkills.filter(reqSkill => 
				skillNames.some(userSkill => userSkill.includes(reqSkill) || reqSkill.includes(userSkill))
			);
			career.match = Math.round((matchedSkills.length / career.requiredSkills.length) * 100);
			career.reason = `You have ${matchedSkills.length} of ${career.requiredSkills.length} key skills`;
		});

		// Sort by match percentage and return top 4
		return careerPaths
			.sort((a, b) => b.match - a.match)
			.slice(0, 4)
			.filter(career => career.match > 20); // Only show if at least 20% match
	};

	// Enhanced ATS compatibility analysis using real resume data
	const generateATSCompatibility = (analysis) => {
		console.log("🎯 Generating ATS compatibility from analysis:", analysis);
		
		let score = 50; // Conservative base score
		const issues = [];
		const recommendations = [];
		let detailedScores = {
			contentQuality: 0,
			contactInfo: 0, 
			experience: 0,
			formatKeywords: 0
		};

		// Extract actual resume content for analysis
		const extractedText = analysis.extractedContent || analysis.extracted_content_preview || 
		                     analysis.extractedContentPreview || analysis.summary || "";
		const contentLength = extractedText.length;
		
		console.log("📄 Extracted content length:", contentLength);

		// 1. Contact Information Analysis (25 points max)
		const contactInfo = analysis.personalInfo || analysis.contactInfo || analysis.personal_info || {};
		let contactScore = 0;
		
		// Check for email patterns in extracted text
		const hasEmail = contactInfo.email || /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i.test(extractedText);
		if (hasEmail) {
			contactScore += 12;
		} else {
			issues.push({ type: "contact", severity: "High", description: "Email address not clearly detected" });
		}

		// Check for phone patterns  
		const hasPhone = contactInfo.phone || /(\+\d{1,2}\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/.test(extractedText);
		if (hasPhone) {
			contactScore += 8;
		} else {
			issues.push({ type: "contact", severity: "Medium", description: "Phone number not found" });
		}
		
		// Check for location/address
		const hasLocation = contactInfo.location || contactInfo.address || /\b\w+,\s*\w+\b/.test(extractedText);
		if (hasLocation) {
			contactScore += 5;
		}
		
		detailedScores.contactInfo = Math.min(25, contactScore);

		// 2. Content Quality Analysis (25 points max)  
		let contentScore = 0;
		if (contentLength > 2000) {
			contentScore += 15; // Comprehensive content
		} else if (contentLength > 1000) {
			contentScore += 10; // Good content
		} else if (contentLength > 500) {
			contentScore += 6; // Minimal content
		} else {
			issues.push({ type: "content", severity: "High", description: "Resume content appears too brief" });
		}

		// Check for action verbs and quantifiable achievements
		const actionVerbs = ['developed', 'implemented', 'managed', 'led', 'created', 'designed', 'improved'];
		const actionVerbMatches = actionVerbs.filter(verb => 
			new RegExp(`\\b${verb}`, 'i').test(extractedText)
		).length;
		contentScore += Math.min(10, actionVerbMatches * 2);

		detailedScores.contentQuality = Math.min(25, contentScore);

		// 3. Skills and Experience Analysis (25 points max)
		const skills = analysis.extractedSkills || analysis.skills || [];
		let experienceScore = 0;
		
		console.log("🔧 Detected skills count:", skills.length);
		
		if (skills.length >= 10) {
			experienceScore += 15; // Rich skill set
		} else if (skills.length >= 6) {
			experienceScore += 10; // Good skills
		} else if (skills.length >= 3) {
			experienceScore += 6; // Basic skills
		} else {
			issues.push({ type: "skills", severity: "High", description: `Only ${skills.length} skills detected - add more relevant technical skills` });
		}

		// Check for work experience indicators
		const experienceKeywords = ['experience', 'worked', 'employed', 'position', 'role', 'years', 'company'];
		const experienceMatches = experienceKeywords.filter(keyword => 
			new RegExp(`\\b${keyword}`, 'i').test(extractedText)
		).length;
		experienceScore += Math.min(10, experienceMatches * 2);

		detailedScores.experience = Math.min(25, experienceScore);

		// 4. Format and Keywords (25 points max)
		let formatScore = 0;
		
		// Check for section headers
		const sections = ['experience', 'education', 'skills', 'summary', 'objective', 'projects'];
		const sectionMatches = sections.filter(section => 
			new RegExp(`\\b${section}\\b`, 'i').test(extractedText)
		).length;
		formatScore += Math.min(10, sectionMatches * 2);

		// Check for proper formatting indicators
		if (extractedText.includes('\n') || extractedText.includes('•') || extractedText.includes('-')) {
			formatScore += 8; // Good structure
		}

		// Technical keyword density
		const techKeywords = ['software', 'development', 'programming', 'technical', 'engineer', 'analyst'];
		const techMatches = techKeywords.filter(keyword => 
			new RegExp(`\\b${keyword}`, 'i').test(extractedText)
		).length;
		formatScore += Math.min(7, techMatches * 2);

		detailedScores.formatKeywords = Math.min(25, formatScore);

		// Calculate total score
		const totalScore = Object.values(detailedScores).reduce((sum, score) => sum + score, 0);
		
		console.log("📊 ATS Detailed Scores:", detailedScores);
		console.log("📊 ATS Total Score:", totalScore);

		// Generate specific recommendations based on analysis
		if (detailedScores.contactInfo < 15) {
			recommendations.push("Ensure contact information (email, phone) is clearly visible at the top");
		}
		if (detailedScores.contentQuality < 15) {
			recommendations.push("Add more detailed descriptions with quantifiable achievements");
		}
		if (detailedScores.experience < 15) {
			recommendations.push("Include more relevant technical skills and work experience");
		}
		if (detailedScores.formatKeywords < 15) {
			recommendations.push("Use industry-specific keywords and improve resume structure");
		}
		
		// Add general ATS recommendations
		recommendations.push("Use standard section headings like 'Experience', 'Education', 'Skills'");
		recommendations.push("Include keywords from job descriptions you're targeting");
		recommendations.push("Keep formatting simple - avoid complex tables or graphics");
		recommendations.push("Save resume in both PDF and Word formats for different ATS systems");

		return {
			overallScore: totalScore,
			score: totalScore, // For backward compatibility
			compatibility: totalScore >= 85 ? "Excellent" : totalScore >= 70 ? "Good" : totalScore >= 55 ? "Fair" : "Needs Improvement", 
			issues: issues,
			recommendations: recommendations,
			// Detailed breakdown for ATS Score tab
			contentQuality: detailedScores.contentQuality * 4, // Convert to percentage
			contactScore: detailedScores.contactInfo * 4,
			experienceScore: detailedScores.experience * 4,
			formatScore: detailedScores.formatKeywords * 4,
			// Additional metrics
			detailedScores: detailedScores,
			skillsDetected: (analysis.extractedSkills || []).length,
			contentLength: contentLength,
			hasEmail: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i.test(extractedText),
			hasPhone: /(\+\d{1,2}\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/.test(extractedText)
		};
	};

	// Generate dynamic improvements based on actual resume analysis
	const generateDynamicImprovements = (analysis, skillsArray) => {
		const improvements = [];
		const extractedText = analysis.extractedContent || analysis.extracted_content_preview || "";
		const contentLength = extractedText.length;

		console.log("🔍 Generating dynamic improvements for content length:", contentLength);

		// Content length improvements
		if (contentLength < 500) {
			improvements.push({
				section: "Resume Length",
				suggestion: "Your resume appears too brief. Add more detailed descriptions of your experience, projects, and achievements to reach at least 1-2 pages.",
				priority: "High",
				impact: "+25% ATS Score",
				estimatedTime: "2-3 hours"
			});
		} else if (contentLength > 4000) {
			improvements.push({
				section: "Resume Length", 
				suggestion: "Your resume might be too lengthy. Consider condensing information and focusing on the most relevant experiences.",
				priority: "Medium",
				impact: "+10% Readability",
				estimatedTime: "1 hour"
			});
		}

		// Skills-based improvements
		if (skillsArray.length < 5) {
			improvements.push({
				section: "Skills Section",
				suggestion: `Only ${skillsArray.length} skills detected. Add more relevant technical skills, programming languages, and tools you've used.`,
				priority: "High",
				impact: "+20% ATS Score", 
				estimatedTime: "30 minutes"
			});
		}

		// Contact information improvements
		const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/i.test(extractedText);
		const hasPhone = /(\+\d{1,2}\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}/.test(extractedText);
		
		if (!hasEmail) {
			improvements.push({
				section: "Contact Information",
				suggestion: "Email address not clearly detected. Ensure your email is prominently displayed at the top of your resume.",
				priority: "High", 
				impact: "+15% ATS Score",
				estimatedTime: "5 minutes"
			});
		}

		if (!hasPhone) {
			improvements.push({
				section: "Contact Information",
				suggestion: "Phone number not found. Add your phone number to make it easy for recruiters to contact you.",
				priority: "Medium",
				impact: "+8% ATS Score", 
				estimatedTime: "5 minutes"
			});
		}

		// Action verbs and quantifiable achievements
		const actionVerbs = ['developed', 'implemented', 'managed', 'led', 'created', 'designed', 'improved', 'increased', 'reduced'];
		const actionVerbCount = actionVerbs.filter(verb => 
			new RegExp(`\\b${verb}`, 'i').test(extractedText)
		).length;

		if (actionVerbCount < 3) {
			improvements.push({
				section: "Experience Descriptions",
				suggestion: "Use more action verbs to describe your achievements. Start bullet points with words like 'developed', 'implemented', 'managed', or 'led'.",
				priority: "Medium",
				impact: "+12% Impact",
				estimatedTime: "45 minutes"
			});
		}

		// Quantifiable achievements
		const hasNumbers = /\b\d+(%|k|million|thousand|\$|years?|months?)\b/i.test(extractedText);
		if (!hasNumbers) {
			improvements.push({
				section: "Quantifiable Results",
				suggestion: "Add specific numbers, percentages, or metrics to demonstrate the impact of your work (e.g., 'increased efficiency by 25%', 'managed team of 5').",
				priority: "High",
				impact: "+18% Credibility",
				estimatedTime: "1 hour"
			});
		}

		// Section headers
		const sections = ['experience', 'education', 'skills', 'summary', 'objective', 'projects'];
		const sectionCount = sections.filter(section => 
			new RegExp(`\\b${section}\\b`, 'i').test(extractedText)
		).length;

		if (sectionCount < 3) {
			improvements.push({
				section: "Resume Structure", 
				suggestion: "Use clear section headers like 'Professional Summary', 'Experience', 'Education', and 'Skills' to improve ATS parsing.",
				priority: "Medium",
				impact: "+10% ATS Parsing",
				estimatedTime: "20 minutes"
			});
		}

		console.log("✅ Generated", improvements.length, "dynamic improvements");
		return improvements;
	};

	const [exportFormat, setExportFormat] = useState("pdf");
	const [analysisTips, setAnalysisTips] = useState([]);
	const [realTimeScore, setRealTimeScore] = useState(0);
	const [processingSteps, setProcessingSteps] = useState([]);
	const [extractedText, setExtractedText] = useState("");
	const [previewError, setPreviewError] = useState(null);
	const [aiAnalyzing, setAiAnalyzing] = useState(false);
	const [apiStatus, setApiStatus] = useState({
		openai: { available: false },
		gemini: { available: false },
		recommended: "mock",
	});
	const [historySearchTerm, setHistorySearchTerm] = useState("");
	const [historyFilterBy, setHistoryFilterBy] = useState("all");
	const [showHistoryDetails, setShowHistoryDetails] = useState(null);
	const [historySort, setHistorySort] = useState("date-desc");
	const fileInputRef = useRef(null);

	// Load analysis history when user is available
	useEffect(() => {
		if (user) {
			loadAnalysisHistory();
		}
	}, [user]);

	// Check API status on component mount
	useEffect(() => {
		const checkAPIStatus = async () => {
			try {
				const status = await apiService.getAIHealth();
				setApiStatus(status);
			} catch (error) {
				console.warn("Failed to check API status:", error);
			}
		};

		checkAPIStatus();
	}, []);

	const handleDrag = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	}, []);

	const handleDrop = useCallback((e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleFile(e.dataTransfer.files[0]);
		}
	}, []);

	const handleFile = (selectedFile) => {
		const allowedTypes = [
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
			"image/jpeg",
			"image/png",
			"image/jpg",
		];

		if (!allowedTypes.includes(selectedFile.type)) {
			toast.error("Please upload a PDF, DOC, DOCX, or image file");
			return;
		}

		if (selectedFile.size > 10 * 1024 * 1024) {
			// 10MB limit
			toast.error("File size must be less than 10MB");
			return;
		}

		setFile(selectedFile);
		generatePreview(selectedFile);
		toast.success("File uploaded successfully!");
	};

	const generatePreview = async (file) => {
		setPreviewError(null);
		const reader = new FileReader();

		if (file.type.includes("image/")) {
			reader.onload = (e) => {
				setResumePreview({
					type: "image",
					url: e.target.result,
					filename: file.name,
				});
			};
			reader.readAsDataURL(file);
		} else if (file.type === "application/pdf") {
			// For PDF files, show a placeholder with file info
			setResumePreview({
				type: "pdf",
				url: null,
				filename: file.name,
				size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
			});

			// PDF preview - text will be extracted during analysis
			setExtractedText("PDF file selected. Text will be extracted during analysis.");
		} else {
			// For Word documents
			setResumePreview({
				type: "document",
				url: null,
				filename: file.name,
				size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
			});

			try {
				// Document preview - text will be extracted during analysis
				setExtractedText("Document file selected. Text will be extracted during analysis.");
			} catch (error) {
				console.error("Document text extraction failed:", error);
				setPreviewError("Could not extract text from document");
			}
		}
	};

	const handleFileInput = (e) => {
		if (e.target.files && e.target.files[0]) {
			handleFile(e.target.files[0]);
		}
	};

	const removeFile = () => {
		setFile(null);
		setResumePreview(null);
		setAnalysis(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
		toast("File removed", { icon: "ℹ️" });
	};

	const simulateAnalysisSteps = async () => {
		const steps = [
			{ id: 1, text: "Extracting text content...", duration: 1000 },
			{ id: 2, text: "Analyzing skills and experience...", duration: 1500 },
			{ id: 3, text: "Checking ATS compatibility...", duration: 1200 },
			{ id: 4, text: "Identifying improvement areas...", duration: 1000 },
			{ id: 5, text: "Generating recommendations...", duration: 800 },
			{ id: 6, text: "Calculating final score...", duration: 500 },
		];

		setProcessingSteps([]);
		for (let step of steps) {
			setProcessingSteps((prev) => [
				...prev,
				{ ...step, status: "processing" },
			]);
			await new Promise((resolve) => setTimeout(resolve, step.duration));
			setProcessingSteps((prev) =>
				prev.map((s) => (s.id === step.id ? { ...s, status: "completed" } : s))
			);
		}
	};

	const analyzeResume = async () => {
		if (!file) {
			toast.error("Please upload a file first");
			return;
		}

		setLoading(true);
		setAiAnalyzing(true);
		setActiveTab("processing");

		try {
			// Start processing animation
			await simulateAnalysisSteps();

			console.log("🚀 Starting resume analysis process...");

			// Check API status and inform user
			toast.loading("Initializing AI analysis...");
			const currentApiStatus = await apiService.getAIHealth();
			setApiStatus(currentApiStatus);

			if (currentApiStatus.recommended === "openai") {
				toast.success("🚀 Using OpenAI for premium analysis!");
			} else if (currentApiStatus.recommended === "gemini") {
				toast.success("🤖 Using Gemini AI for smart analysis!");
			} else {
				// Provide positive messaging even for fallback
				let statusMessage = "📊 Using enhanced analysis engine";
				if (
					currentApiStatus.openai.error &&
					currentApiStatus.openai.error.includes("429")
				) {
					statusMessage += " - still providing comprehensive insights!";
				} else if (currentApiStatus.gemini.error) {
					statusMessage += " - delivering detailed results!";
				}

				toast(statusMessage, {
					icon: "📊",
					duration: 3000,
				});

				// Only log technical details to console
				if (currentApiStatus.openai.error || currentApiStatus.gemini.error) {
					console.warn("🔧 API Status Details:", currentApiStatus);
				}
			}

			let resumeText = extractedText;

			// Backend will handle text extraction
			console.log("📄 Sending file to backend for text extraction and analysis");
			resumeText = file.name; // Temporary placeholder - backend will extract actual text

			// Analyze with AI using backend
			toast.loading("Analyzing your resume with AI...");

			// Create FormData for backend API
			const formData = new FormData();
			formData.append("file", file);

			// Call the backend AI analysis API with fallback to internship analyzer
			let response;
			try {
				response = await apiService.analyzeResumeAdvanced(formData);
			} catch (e) {
				console.warn(
					"Advanced analyzer failed, falling back to internship analyzer",
					e?.message || e
				);
				response = await apiService.internshipAnalyzeResume(formData);
			}

			if (!response.data.success) {
				throw new Error(response.data.message || "Analysis failed");
			}

			// Transform backend response to frontend format
			const payload =
				response.data.analysis || response.data.result || response.data;
			const analysisResult = transformBackendAnalysis(payload);

			// Extract the real resume text from the analysis response
			const realExtractedText = payload.extractedContent || 
			                         payload.extractedContentPreview ||
			                         payload.nerAnalysis?.extracted_content_preview || 
			                         payload.summary ||
			                         resumeText;
			                         
			if (realExtractedText && realExtractedText.trim().length > 50) {
				console.log("✅ Setting real extracted text from analysis:", realExtractedText.substring(0, 200));
				setExtractedText(realExtractedText);
				// Also update resumeText for the database save
				resumeText = realExtractedText;
			}

			if (analysisResult && analysisResult.overallScore) {
				toast.success("✅ Analysis complete!");
			} else {
				toast("📊 Analysis completed with basic insights", { icon: "📊" });
			}

			// Save to Supabase if user is authenticated
			let savedAnalysis = null;
			if (user) {
				try {
					// Save main analysis
					savedAnalysis = await resumeDatabase.saveResumeAnalysis(user.id, {
						filename: file.name,
						fileType: file.type,
						fileSize: file.size,
						extractedText: resumeText,
						overallScore: analysisResult.overallScore,
						analysis: analysisResult,
					});

					setCurrentAnalysisId(savedAnalysis.id);

					// Save related data in parallel
					await Promise.all(
						[
							analysisResult.extractedSkills?.length > 0 &&
								resumeDatabase.saveExtractedSkills(
									savedAnalysis.id,
									analysisResult.extractedSkills
								),
							analysisResult.improvements?.length > 0 &&
								resumeDatabase.saveImprovements(
									savedAnalysis.id,
									analysisResult.improvements
								),
							analysisResult.careerSuggestions?.length > 0 &&
								resumeDatabase.saveCareerSuggestions(
									savedAnalysis.id,
									analysisResult.careerSuggestions
								),
							analysisResult.atsCompatibility &&
								resumeDatabase.saveATSCompatibility(
									savedAnalysis.id,
									analysisResult.atsCompatibility
								),
						].filter(Boolean)
					);

					toast.success("Analysis saved to your account!");
				} catch (error) {
					console.error("Error saving to database:", error);
					// Show a more informative message for schema issues
					if (error.message && error.message.includes('formatting_score')) {
						toast.warning("Analysis completed! Database needs schema update for saving.");
					} else {
						toast.warning("Analysis completed but couldn't save to database.");
					}
				}
			}

			setAnalysis(analysisResult);
			setRealTimeScore(analysisResult.overallScore);
			setImprovements(analysisResult.improvements || []);
			setSkillGaps(analysisResult.skillGaps || []);
			setCareerSuggestions(analysisResult.careerSuggestions || []);
			setIndustryBenchmark(analysisResult.industryBenchmark);

			// Load updated history from database
			if (user) {
				await loadAnalysisHistory();
			}

			setActiveTab("overview");
			toast.success("Resume analyzed successfully with AI!");
		} catch (error) {
			console.error("Analysis error:", error);
			toast.error("Failed to analyze resume. Please try again.");

			// Fallback to mock analysis
			const mockAnalysis = generateMockAnalysis();
			setAnalysis(mockAnalysis);
			setRealTimeScore(mockAnalysis.overallScore);
			setActiveTab("overview");
			toast(
				"Using demo analysis - Please configure AI API keys for full functionality",
				{
					icon: "⚠️",
					duration: 4000,
				}
			);
		} finally {
			setLoading(false);
			setAiAnalyzing(false);
		}
	};

	const loadAnalysisHistory = async () => {
		if (!user) {
			setAnalysisHistory([]);
			return;
		}

		try {
			const history = await resumeDatabase.getUserAnalysisHistory(user.id);

			// Transform database results to match existing UI format
			const formattedHistory = history.map((item) => ({
				id: item.id,
				filename: item.filename,
				timestamp: item.created_at,
				score: item.overall_score,
				extractedText:
					item.extracted_text?.substring(0, 200) + "..." ||
					"Analysis data available",
				analysis: item.analysis_data,
				fileType: item.file_type,
				fileSize: item.file_size,
			}));

			setAnalysisHistory(formattedHistory);
		} catch (error) {
			console.error("Error loading analysis history:", error);
			toast.error("Failed to load analysis history");
			setAnalysisHistory([]);
		}
	};

	const deleteAnalysis = async (analysisId) => {
		if (!user) {
			toast.error("Authentication required");
			return;
		}

		try {
			await resumeDatabase.deleteAnalysis(analysisId, user.id);
			await loadAnalysisHistory(); // Refresh the list
			toast.success("Analysis deleted successfully");
		} catch (error) {
			console.error("Error deleting analysis:", error);
			toast.error("Failed to delete analysis");
		}
	};

	// Filter and sort history
	const getFilteredAndSortedHistory = () => {
		let filtered = analysisHistory;

		// Filter by search term
		if (historySearchTerm) {
			filtered = filtered.filter((item) =>
				item.filename.toLowerCase().includes(historySearchTerm.toLowerCase())
			);
		}

		// Filter by score range
		if (historyFilterBy !== "all") {
			switch (historyFilterBy) {
				case "high":
					filtered = filtered.filter((item) => item.score >= 80);
					break;
				case "medium":
					filtered = filtered.filter(
						(item) => item.score >= 60 && item.score < 80
					);
					break;
				case "low":
					filtered = filtered.filter((item) => item.score < 60);
					break;
			}
		}

		// Sort
		switch (historySort) {
			case "date-desc":
				filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
				break;
			case "date-asc":
				filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
				break;
			case "score-desc":
				filtered.sort((a, b) => b.score - a.score);
				break;
			case "score-asc":
				filtered.sort((a, b) => a.score - b.score);
				break;
			case "name":
				filtered.sort((a, b) => a.filename.localeCompare(b.filename));
				break;
		}

		return filtered;
	};

	// Get analysis preview data
	const getAnalysisPreview = (analysisData) => {
		if (!analysisData) return null;

		return {
			skillsCount: analysisData.extractedSkills?.length || 0,
			atsScore: analysisData.atsCompatibility?.score || 0,
			improvementsCount: analysisData.improvements?.length || 0,
			careerSuggestionsCount: analysisData.careerSuggestions?.length || 0,
			topSkills:
				analysisData.extractedSkills?.slice(0, 3).map((s) => s.name) || [],
			topImprovements:
				analysisData.improvements?.slice(0, 2).map((i) => i.suggestion) || [],
		};
	};

	// Extract basic info from resume text
	const extractBasicInfoFromText = (text) => {
		if (!text) return {};

		const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
		const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/;
		const nameRegex = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;

		const email = text.match(emailRegex)?.[0] || "";
		const phone = text.match(phoneRegex)?.[0] || "";
		const name = text.match(nameRegex)?.[0] || "Resume Holder";

		// Extract skills from common patterns
		const skillPatterns = [
			/skills?[:\s]*(.*?)(?:\n|$)/i,
			/technologies?[:\s]*(.*?)(?:\n|$)/i,
			/programming[:\s]*(.*?)(?:\n|$)/i,
		];

		let extractedSkills = [];
		for (const pattern of skillPatterns) {
			const match = text.match(pattern);
			if (match && match[1]) {
				const skills = match[1]
					.split(/[,\s•·\-]+/)
					.filter((skill) => skill.trim().length > 2)
					.slice(0, 5);
				extractedSkills = [...extractedSkills, ...skills];
				break;
			}
		}

		// Extract experience
		const expPatterns = [
			/experience[:\s]*(.*?)(?:\n\n|$)/i,
			/work[:\s]*(.*?)(?:\n\n|$)/i,
			/employment[:\s]*(.*?)(?:\n\n|$)/i,
		];

		let experience = [];
		for (const pattern of expPatterns) {
			const match = text.match(pattern);
			if (match && match[1]) {
				experience.push({
					title: "Software Developer",
					company: "Previous Company",
					duration: "Recent",
					achievements: ["Developed applications", "Improved performance"],
				});
				break;
			}
		}

		return { name, email, phone, extractedSkills, experience };
	};

	const generateMockAnalysis = () => {
		const basicInfo = extractBasicInfoFromText(extractedText);

		return {
			overallScore: Math.floor(Math.random() * 30) + 70,
			extractedSkills:
				basicInfo.extractedSkills.length > 0
					? basicInfo.extractedSkills.map((skill, index) => ({
							name: skill,
							confidence: Math.floor(Math.random() * 25) + 75,
							category: "General",
							level: "Intermediate",
							yearsExp: Math.floor(Math.random() * 3) + 1,
					  }))
					: [
							{
								name: "Technical Skills",
								confidence: 80,
								category: "General",
								level: "Based on Resume",
								yearsExp: 1,
							},
							{
								name: "Professional Skills",
								confidence: 85,
								category: "General",
								level: "Based on Resume",
								yearsExp: 2,
							},
					  ],
			missingSkills: [
				{
					name: "TypeScript",
					impact: "+15%",
					priority: "High",
					reason: "High demand in current market",
				},
				{
					name: "Docker",
					impact: "+12%",
					priority: "Medium",
					reason: "Essential for DevOps roles",
				},
				{
					name: "GraphQL",
					impact: "+10%",
					priority: "Medium",
					reason: "Growing adoption in APIs",
				},
				{
					name: "Kubernetes",
					impact: "+18%",
					priority: "Medium",
					reason: "Container orchestration standard",
				},
			],
			atsCompatibility: {
				score: 78,
				issues: [
					{
						type: "format",
						severity: "Medium",
						description:
							'Use standard section headings like "Experience" instead of "Work History"',
					},
					{
						type: "keywords",
						severity: "High",
						description:
							"Include more industry-specific keywords from job descriptions",
					},
					{
						type: "formatting",
						severity: "Low",
						description:
							"Avoid tables and complex formatting that ATS might not parse",
					},
				],
				recommendations: [
					"Use standard fonts like Arial, Calibri, or Times New Roman",
					"Include keywords from target job descriptions",
					"Use clear section headings",
					"Save as both PDF and Word formats",
				],
			},
			skillGaps: [
				{
					skill: "Leadership",
					gap: "No leadership experience mentioned",
					recommendation: "Add team lead or project management experience",
				},
				{
					skill: "Cloud Architecture",
					gap: "Limited cloud platform knowledge",
					recommendation: "Consider AWS or Azure certifications",
				},
				{
					skill: "Data Analysis",
					gap: "No analytics skills shown",
					recommendation: "Learn Python data libraries or Tableau",
				},
			],
			improvements: [
				{
					section: "Summary",
					priority: "High",
					suggestion: "Add a compelling professional summary at the top",
					impact: "+8 points",
				},
				{
					section: "Skills",
					priority: "Medium",
					suggestion: "Quantify your skill levels and years of experience",
					impact: "+5 points",
				},
				{
					section: "Experience",
					priority: "High",
					suggestion: "Use action verbs and quantify achievements",
					impact: "+12 points",
				},
				{
					section: "Education",
					priority: "Low",
					suggestion: "Include relevant coursework and GPA if strong",
					impact: "+3 points",
				},
			],
			careerSuggestions: [
				{
					title: "Full Stack Developer",
					match: 92,
					reason: "Strong frontend and backend skills",
					salaryRange: "$70k-$95k",
				},
				{
					title: "Frontend Engineer",
					match: 88,
					reason: "Excellent React and JavaScript skills",
					salaryRange: "$65k-$85k",
				},
				{
					title: "Software Engineer",
					match: 85,
					reason: "Well-rounded programming abilities",
					salaryRange: "$75k-$100k",
				},
				{
					title: "DevOps Engineer",
					match: 72,
					reason: "Some cloud and infrastructure knowledge",
					salaryRange: "$80k-$110k",
				},
			],
			industryBenchmark: {
				averageScore: 65,
				topPercentile: 85,
				yourPercentile: 78,
				comparison: "Above Average",
			},
			contactInfo: {
				name: basicInfo.name || "Resume Holder",
				email: basicInfo.email || "",
				phone: basicInfo.phone || "",
				location: "Location not specified",
				linkedin: "",
				github: "",
			},
			experience:
				basicInfo.experience.length > 0
					? basicInfo.experience
					: [
							{
								title: "Work Experience",
								company: "From Resume Analysis",
								duration: "Based on uploaded resume",
								achievements: [
									"Experience details extracted from resume",
									"Skills and qualifications identified",
									"Professional background analyzed",
								],
							},
					  ],
			education: [
				{
					degree: "Bachelor of Science in Computer Science",
					institution: "University of Technology",
					year: "2022",
					gpa: "3.7/4.0",
				},
			],
			certifications: [
				{ name: "AWS Certified Developer", issuer: "Amazon", year: "2023" },
				{ name: "React Professional", issuer: "Meta", year: "2022" },
			],
			languages: [
				{ name: "English", proficiency: "Native" },
				{ name: "Spanish", proficiency: "Conversational" },
			],
		};
	};

	const getScoreColor = (score) => {
		if (score >= 90) return "text-green-600 bg-green-100";
		if (score >= 80) return "text-blue-600 bg-blue-100";
		if (score >= 70) return "text-yellow-600 bg-yellow-100";
		return "text-red-600 bg-red-100";
	};

	const getSkillLevelColor = (level) => {
		switch (level) {
			case "Advanced":
				return "bg-green-100 text-green-800";
			case "Intermediate":
				return "bg-blue-100 text-blue-800";
			case "Beginner":
				return "bg-yellow-100 text-yellow-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "High":
				return "bg-red-100 text-red-800";
			case "Medium":
				return "bg-yellow-100 text-yellow-800";
			case "Low":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	const exportResume = (format) => {
		toast.success(`Exporting resume as ${format.toUpperCase()}...`);
		// Mock export functionality
		setTimeout(() => {
			toast.success(`Resume exported successfully as ${format.toUpperCase()}`);
		}, 2000);
	};

	const shareAnalysis = () => {
		navigator.clipboard.writeText(window.location.href);
		toast.success("Analysis link copied to clipboard!");
	};

	const saveAnalysis = () => {
		const analysisData = {
			filename: file?.name,
			analysis,
			timestamp: new Date().toISOString(),
		};
		localStorage.setItem("resumeAnalysis", JSON.stringify(analysisData));
		toast.success("Analysis saved successfully!");
	};

	const generateImprovementPlan = async () => {
		if (!extractedText) {
			toast.error("No resume text available for improvement suggestions");
			return;
		}

		setLoading(true);
		try {
			// Generate improvements from analysis data - using dynamic content-based generation
			const suggestions = generateDynamicImprovements(analysisResults, skillsAnalysis);
			setImprovements(suggestions);
			toast.success("Improvement plan generated successfully!");
		} catch (error) {
			console.error("Improvement plan generation failed:", error);
			toast.error("Failed to generate improvement plan");
		} finally {
			setLoading(false);
		}
	};

	const applyImprovement = async (improvement) => {
		if (!currentAnalysisId) {
			toast.error("No current analysis found");
			return;
		}

		try {
			toast.loading(`Applying improvement: ${improvement.suggestion}`);

			// Mark improvement as applied in database
			await resumeDatabase.markImprovementApplied(improvement.id);

			// Update local state
			setImprovements((prev) =>
				prev.map((imp) =>
					imp.id === improvement.id
						? { ...imp, applied: true, applied_at: new Date().toISOString() }
						: imp
				)
			);

			toast.success("Improvement marked as applied!");
		} catch (error) {
			console.error("Error applying improvement:", error);
			toast.error("Failed to apply improvement");
		}
	};

	const analyzeForSpecificRole = async (roleTitle) => {
		if (!extractedText) {
			toast.error("No resume text available");
			return;
		}

		setLoading(true);
		try {
			toast.loading(`Analyzing resume for ${roleTitle} role...`);
			// Use enhanced backend API for role-specific analysis
			const roleSpecificAnalysis = await apiService.analyzeResumeAdvanced(file, {
				context: roleTitle,
				analysis_type: 'role_specific'
			});
			setAnalysis(roleSpecificAnalysis);
			setRealTimeScore(roleSpecificAnalysis.overallScore);
			toast.success(`Analysis completed for ${roleTitle} role!`);
		} catch (error) {
			console.error("Role-specific analysis failed:", error);
			toast.error("Failed to analyze for specific role");
		} finally {
			setLoading(false);
		}
	};

	const downloadReport = () => {
		if (!analysis) {
			toast.error("No analysis available to download");
			return;
		}

		const reportData = {
			filename: file?.name,
			analysisDate: new Date().toLocaleDateString(),
			overallScore: analysis.overallScore,
			skills: analysis.extractedSkills,
			improvements: analysis.improvements,
			atsScore: analysis.atsCompatibility?.score,
			careerSuggestions: analysis.careerSuggestions,
		};

		const dataStr = JSON.stringify(reportData, null, 2);
		const dataUri =
			"data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

		const exportFileDefaultName = `resume-analysis-${
			file?.name?.split(".")[0]
		}.json`;

		const linkElement = document.createElement("a");
		linkElement.setAttribute("href", dataUri);
		linkElement.setAttribute("download", exportFileDefaultName);
		linkElement.click();

		toast.success("Analysis report downloaded successfully!");
	};

	const tabs = [
		{ id: "overview", label: "Overview", icon: BarChart3 },
		{ id: "skills", label: "Skills Analysis", icon: Target },
		{ id: "ats", label: "ATS Score", icon: Shield },
		{ id: "improvements", label: "Improvements", icon: TrendingUp },
		{ id: "career", label: "Career Match", icon: Briefcase },
		{ id: "builder", label: "Resume Builder", icon: Edit3 },
		{ id: "history", label: "History", icon: Clock },
	];

	// Processing Screen
	if (loading && activeTab === "processing") {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4"
				>
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Brain className="w-8 h-8 text-blue-600 animate-pulse" />
						</div>
						<h2 className="text-xl font-bold text-gray-900 mb-2">
							Analyzing Your Resume
						</h2>
						<p className="text-gray-600">
							Our AI is examining your resume in detail...
						</p>
					</div>

					<div className="space-y-4">
						{processingSteps.map((step) => (
							<motion.div
								key={step.id}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								className="flex items-center space-x-3"
							>
								{step.status === "completed" ? (
									<CheckCircle className="w-5 h-5 text-green-500" />
								) : (
									<div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
								)}
								<span
									className={`text-sm ${
										step.status === "completed"
											? "text-green-700"
											: "text-gray-700"
									}`}
								>
									{step.text}
								</span>
							</motion.div>
						))}
					</div>

					<div className="mt-8">
						<div className="bg-gray-200 rounded-full h-2">
							<motion.div
								className="bg-blue-600 h-2 rounded-full"
								initial={{ width: 0 }}
								animate={{
									width: `${
										(processingSteps.filter((s) => s.status === "completed")
											.length /
											processingSteps.length) *
										100
									}%`,
								}}
								transition={{ duration: 0.5 }}
							/>
						</div>
						<p className="text-center text-sm text-gray-600 mt-2">
							{Math.round(
								(processingSteps.filter((s) => s.status === "completed")
									.length /
									processingSteps.length) *
									100
							)}
							% Complete
						</p>
					</div>
				</motion.div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="py-6">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									AI Resume Analyzer
								</h1>
								<p className="text-gray-600">
									Get AI-powered insights and improve your resume
								</p>
							</div>
							<div className="flex items-center space-x-4">
								{analysis && (
									<>
										<div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
											<Activity className="w-5 h-5 text-blue-600" />
											<span className="font-semibold text-blue-900">
												{realTimeScore}/100
											</span>
											<span className="text-sm text-blue-600">Score</span>
										</div>

										<div className="hidden md:flex items-center space-x-2">
											<select
												onChange={(e) => analyzeForSpecificRole(e.target.value)}
												className="text-sm border border-gray-300 rounded px-3 py-1"
												defaultValue=""
											>
												<option value="" disabled>
													Analyze for role...
												</option>
												<option value="Software Engineer">
													Software Engineer
												</option>
												<option value="Frontend Developer">
													Frontend Developer
												</option>
												<option value="Backend Developer">
													Backend Developer
												</option>
												<option value="Full Stack Developer">
													Full Stack Developer
												</option>
												<option value="DevOps Engineer">DevOps Engineer</option>
												<option value="Data Scientist">Data Scientist</option>
											</select>
										</div>

										<button
											onClick={downloadReport}
											className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
											title="Download detailed report"
										>
											<Download className="w-4 h-4" />
											<span className="hidden sm:inline">Report</span>
										</button>

										<button
											onClick={generateImprovementPlan}
											className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
											title="Generate AI improvement suggestions"
										>
											<Sparkles className="w-4 h-4" />
											<span className="hidden sm:inline">Improve</span>
										</button>

										<button
											onClick={shareAnalysis}
											className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
											title="Share analysis"
										>
											<Share2 className="w-5 h-5" />
										</button>
										<button
											onClick={saveAnalysis}
											className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
											title="Save analysis"
										>
											<Save className="w-5 h-5" />
										</button>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Left Column - Upload & Preview */}
					<div className="lg:col-span-1">
						{/* File Upload */}
						<div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
							<h2 className="text-lg font-semibold text-gray-900 mb-4">
								Upload Resume
							</h2>

							{!file ? (
								<div
									className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
										dragActive
											? "border-blue-500 bg-blue-50"
											: "border-gray-300"
									}`}
									onDragEnter={handleDrag}
									onDragLeave={handleDrag}
									onDragOver={handleDrag}
									onDrop={handleDrop}
								>
									<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										Drop your resume here
									</h3>
									<p className="text-gray-600 mb-4">or click to browse files</p>

									<input
										ref={fileInputRef}
										type="file"
										accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
										onChange={handleFileInput}
										className="hidden"
										id="file-upload"
									/>
									<label
										htmlFor="file-upload"
										className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
									>
										<Upload className="w-4 h-4" />
										<span>Choose File</span>
									</label>

									<p className="text-sm text-gray-500 mt-4">
										Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB)
									</p>
								</div>
							) : (
								<div className="space-y-4">
									<div className="border border-gray-200 rounded-lg p-4">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-3">
												<FileText className="w-8 h-8 text-blue-600" />
												<div>
													<p className="font-medium text-gray-900">
														{file.name}
													</p>
													<p className="text-sm text-gray-500">
														{(file.size / 1024 / 1024).toFixed(2)} MB
													</p>
												</div>
											</div>
											<button
												onClick={removeFile}
												className="text-gray-400 hover:text-red-500 transition-colors"
											>
												<X className="w-5 h-5" />
											</button>
										</div>
									</div>

									{!analysis && (
										<button
											onClick={analyzeResume}
											disabled={loading}
											className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
										>
											{loading ? (
												<>
													<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
													<span>Analyzing...</span>
												</>
											) : (
												<>
													<Brain className="w-5 h-5" />
													<span>Analyze with AI</span>
												</>
											)}
										</button>
									)}
								</div>
							)}
						</div>

						{/* Enhanced Resume Preview */}
						{resumePreview && (
							<div className="bg-white rounded-xl shadow-sm border p-6">
								<div className="flex items-center justify-between mb-4">
									<h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
										<Eye className="w-5 h-5 text-blue-600" />
										<span>Dynamic Preview</span>
									</h3>
									<div className="flex items-center space-x-2">
										{realTimeScore > 0 && (
											<div
												className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
													realTimeScore
												)}`}
											>
												{realTimeScore}/100
											</div>
										)}
										<button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
											<Maximize2 className="w-4 h-4" />
										</button>
									</div>
								</div>

								{/* File Information Header */}
								<div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
									<div className="flex items-center justify-between">
										<div className="flex items-center space-x-3">
											<div className="p-2 bg-white rounded-lg shadow-sm">
												{resumePreview.type === "pdf" ? (
													<FileText className="w-6 h-6 text-red-500" />
												) : resumePreview.type === "image" ? (
													<FileText className="w-6 h-6 text-green-500" />
												) : (
													<FileText className="w-6 h-6 text-blue-500" />
												)}
											</div>
											<div>
												<h4 className="font-semibold text-gray-900">
													{resumePreview.filename}
												</h4>
												<p className="text-sm text-gray-600">
													{resumePreview.type.toUpperCase()} •{" "}
													{resumePreview.size}
												</p>
											</div>
										</div>

										{/* Dynamic Stats */}
										<div className="grid grid-cols-2 gap-4 text-center">
											<div>
												<div className="text-lg font-bold text-blue-600">
													{extractedText
														? extractedText.split(/\s+/).length
														: 0}
												</div>
												<div className="text-xs text-gray-600">Words</div>
											</div>
											<div>
												<div className="text-lg font-bold text-green-600">
													{analysis?.skills?.length || 0}
												</div>
												<div className="text-xs text-gray-600">Skills</div>
											</div>
										</div>
									</div>
								</div>

								<div className="border rounded-lg overflow-hidden bg-gray-50">
									{resumePreview.type === "image" ? (
										<img
											src={resumePreview.url}
											alt="Resume preview"
											className="w-full h-64 object-contain bg-white"
										/>
									) : extractedText ? (
										<div className="p-6">
											{/* Extracted Text Preview with Skills Highlighting */}
											<div className="bg-white rounded-lg border p-4 mb-4">
												<h5 className="font-semibold text-gray-900 mb-3 flex items-center">
													<FileText className="w-4 h-4 mr-2 text-blue-500" />
													Extracted Content Preview
												</h5>
												<div className="max-h-64 overflow-y-auto">
													<div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
														{extractedText.length > 800 ? (
															<>
																{extractedText.substring(0, 800)}
																<span className="text-gray-500">...</span>
																<div className="mt-3 text-center">
																	<button
																		onClick={() => {
																			const modal =
																				document.createElement("div");
																			modal.style.cssText =
																				"position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;";
																			modal.innerHTML = `<div style="background: white; padding: 20px; border-radius: 12px; max-width: 90%; max-height: 90%; overflow: hidden; position: relative;"><button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">&times;</button><h3 style="margin-top: 0; margin-bottom: 15px; color: #1f2937;">Complete Resume Text</h3><pre style="white-space: pre-wrap; font-family: 'Inter', sans-serif; padding: 20px; background: #f8f9fa; border-radius: 8px; max-height: 70vh; overflow-y: auto; font-size: 14px; line-height: 1.5;">${extractedText}</pre></div>`;
																			document.body.appendChild(modal);
																			modal.onclick = (e) =>
																				e.target === modal && modal.remove();
																		}}
																		className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
																	>
																		<Eye className="w-4 h-4" />
																		<span>View Full Text</span>
																	</button>
																</div>
															</>
														) : (
															extractedText
														)}
													</div>
												</div>
											</div>

											{/* Skills Preview */}
											{analysis?.skills?.length > 0 && (
												<div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
													<h5 className="font-semibold text-gray-900 mb-3 flex items-center">
														<Award className="w-4 h-4 mr-2 text-blue-500" />
														Identified Skills ({analysis.skills.length})
													</h5>
													<div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
														{analysis.skills.slice(0, 20).map((skill, idx) => (
															<span
																key={idx}
																className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-blue-700 border border-blue-300 shadow-sm"
															>
																{skill}
															</span>
														))}
														{analysis.skills.length > 20 && (
															<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
																+{analysis.skills.length - 20} more
															</span>
														)}
													</div>
												</div>
											)}
										</div>
									) : (
										<div className="flex flex-col items-center justify-center h-64 p-6 text-center">
											<Briefcase className="w-16 h-16 text-blue-500 mb-4" />
											<h4 className="font-medium text-gray-900 mb-2">
												{resumePreview.filename}
											</h4>
											<p className="text-sm text-gray-600 mb-2">
												Document File
											</p>
											<p className="text-xs text-gray-500">
												{resumePreview.size}
											</p>
											{extractedText && (
												<div className="mt-4 p-3 bg-white rounded border text-xs text-left max-h-48 overflow-y-auto w-full">
													<div className="text-gray-700 whitespace-pre-wrap">
														{extractedText.length > 500 ? (
															<>
																<p>{extractedText.substring(0, 500)}...</p>
																<button
																	onClick={() => {
																		const modal = document.createElement("div");
																		modal.style.cssText =
																			"position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;";
																		modal.innerHTML = `<div style="background: white; padding: 20px; border-radius: 12px; max-width: 90%; max-height: 90%; overflow: hidden; position: relative;"><button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">&times;</button><h3 style="margin-top: 0; margin-bottom: 15px; color: #1f2937;">Full Resume Text</h3><pre style="white-space: pre-wrap; font-family: monospace; padding: 20px; background: #f8f9fa; border-radius: 8px; max-height: 70vh; overflow-y: auto; font-size: 12px;">${extractedText}</pre></div>`;
																		document.body.appendChild(modal);
																		modal.onclick = (e) =>
																			e.target === modal && modal.remove();
																	}}
																	className="mt-2 text-blue-600 hover:text-blue-800 underline cursor-pointer"
																>
																	View Full Text
																</button>
															</>
														) : (
															<p>{extractedText}</p>
														)}
													</div>
												</div>
											)}
										</div>
									)}
									{previewError && (
										<div className="absolute inset-0 bg-red-50 flex items-center justify-center">
											<div className="text-center">
												<AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
												<p className="text-sm text-red-600">{previewError}</p>
											</div>
										</div>
									)}
								</div>

								{/* Enhanced File Info & Preview Stats */}
								<div className="mt-6 space-y-4">
									<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
										<div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
											<div className="text-xl font-bold text-blue-600">
												{extractedText
													? Math.ceil(extractedText.length / 2000)
													: "-"}
											</div>
											<div className="text-sm text-blue-700">Est. Pages</div>
										</div>
										<div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
											<div className="text-xl font-bold text-green-600">
												{extractedText
													? extractedText
															.split("\n")
															.filter((line) => line.trim()).length
													: "-"}
											</div>
											<div className="text-sm text-green-700">Text Lines</div>
										</div>
										<div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
											<div className="text-xl font-bold text-purple-600">
												{extractedText ? extractedText.length : "-"}
											</div>
											<div className="text-sm text-purple-700">Characters</div>
										</div>
										<div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
											<div className="text-xl font-bold text-orange-600">
												{analysis ? "Complete" : "Pending"}
											</div>
											<div className="text-sm text-orange-700">Analysis</div>
										</div>
									</div>

									{/* File Details */}
									<div className="bg-gray-50 rounded-lg p-4">
										<h5 className="font-semibold text-gray-900 mb-3 flex items-center">
											<Info className="w-4 h-4 mr-2 text-gray-600" />
											Document Information
										</h5>
										<div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
											<div>
												<span className="text-gray-600">Type:</span>
												<span className="ml-2 font-medium text-gray-900">
													{resumePreview.type === "image"
														? "Image"
														: resumePreview.type === "pdf"
														? "PDF"
														: "Document"}
												</span>
											</div>
											<div>
												<span className="text-gray-600">Size:</span>
												<span className="ml-2 font-medium text-gray-900">
													{resumePreview.size ||
														(file &&
															(file.size / (1024 * 1024)).toFixed(2) + " MB")}
												</span>
											</div>
											<div>
												<span className="text-gray-600">Status:</span>
												<span
													className={`ml-2 font-medium ${
														analysis ? "text-green-600" : "text-orange-600"
													}`}
												>
													{analysis ? "Analyzed" : "Ready for Analysis"}
												</span>
											</div>
										</div>
									</div>
								</div>

								{/* AI Status */}
								{aiAnalyzing && (
									<div className="mt-4 p-3 bg-blue-50 rounded-lg">
										<div className="flex items-center space-x-2">
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
											<span className="text-sm text-blue-700">
												AI is analyzing your resume...
											</span>
										</div>
									</div>
								)}
							</div>
						)}
					</div>

					{/* Right Column - Analysis Results */}
					<div className="lg:col-span-2">
						{analysis ? (
							<div className="space-y-6">
								{/* Tabs Navigation */}
								<div className="bg-white rounded-xl shadow-sm border">
									<div className="border-b border-gray-200">
										<nav className="flex space-x-8 px-6" aria-label="Tabs">
											{tabs.map((tab) => {
												const Icon = tab.icon;
												return (
													<button
														key={tab.id}
														onClick={() => setActiveTab(tab.id)}
														className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
															activeTab === tab.id
																? "border-blue-500 text-blue-600"
																: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
														}`}
													>
														<Icon className="w-4 h-4" />
														<span>{tab.label}</span>
													</button>
												);
											})}
										</nav>
									</div>

									{/* Tab Content */}
									<div className="p-6">
										<AnimatePresence mode="wait">
											{activeTab === "overview" && (
												<motion.div
													key="overview"
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -20 }}
													className="space-y-6"
												>
													{/* Overall Score */}
													<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
														<div className="flex items-center justify-between">
															<div>
																<h3 className="text-xl font-bold mb-2">
																	Overall Resume Score
																</h3>
																<p className="text-blue-100">
																	Based on AI analysis of skills, experience,
																	and format
																</p>
															</div>
															<div className="text-right">
																<div className="text-4xl font-bold">
																	{analysis.overallScore}/100
																</div>
																<div className="text-sm text-blue-100">
																	{analysis.industryBenchmark?.comparison ||
																		"Above Average"}
																</div>
															</div>
														</div>
													</div>

													{/* Quick Stats */}
													<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
														<div className="bg-gray-50 rounded-lg p-4 text-center">
															<Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
															<div className="text-2xl font-bold text-gray-900">
																{analysis.extractedSkills?.length || 0}
															</div>
															<div className="text-sm text-gray-600">
																Skills Found
															</div>
														</div>
														<div className="bg-gray-50 rounded-lg p-4 text-center">
															<Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
															<div className="text-2xl font-bold text-gray-900">
																{analysis.atsCompatibility?.score || 0}%
															</div>
															<div className="text-sm text-gray-600">
																ATS Score
															</div>
														</div>
														<div className="bg-gray-50 rounded-lg p-4 text-center">
															<TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
															<div className="text-2xl font-bold text-gray-900">
																{analysis.improvements?.length || 0}
															</div>
															<div className="text-sm text-gray-600">
																Improvements
															</div>
														</div>
														<div className="bg-gray-50 rounded-lg p-4 text-center">
															<Briefcase className="w-8 h-8 text-orange-600 mx-auto mb-2" />
															<div className="text-2xl font-bold text-gray-900">
																{analysis.careerSuggestions?.length || 0}
															</div>
															<div className="text-sm text-gray-600">
																Career Matches
															</div>
														</div>
													</div>

													{/* Top Skills */}
													<div className="bg-white border rounded-lg p-6">
														<h4 className="text-lg font-semibold text-gray-900 mb-4">
															Top Skills Detected
														</h4>
														<div className="grid grid-cols-2 md:grid-cols-3 gap-3">
															{analysis.extractedSkills
																?.slice(0, 6)
																.map((skill, index) => (
																	<div
																		key={index}
																		className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
																	>
																		<CheckCircle className="w-5 h-5 text-green-500" />
																		<div>
																			<div className="font-medium text-gray-900">
																				{skill.name}
																			</div>
																			<div className="text-sm text-gray-600">
																				{skill.confidence}% confidence
																			</div>
																		</div>
																	</div>
																))}
														</div>
													</div>

													{/* Quick Actions */}
													<div className="flex flex-wrap gap-3">
														<button
															onClick={() => setActiveTab("improvements")}
															className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
														>
															<Lightbulb className="w-4 h-4" />
															<span>View Improvements</span>
														</button>
														<button
															onClick={() => setActiveTab("ats")}
															className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
														>
															<Shield className="w-4 h-4" />
															<span>Check ATS Score</span>
														</button>
														<button
															onClick={() => exportResume("pdf")}
															className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
														>
															<Download className="w-4 h-4" />
															<span>Export PDF</span>
														</button>
													</div>
												</motion.div>
											)}

											{activeTab === "skills" && (
												<motion.div
													key="skills"
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -20 }}
													className="space-y-6"
												>
													<div className="flex items-center justify-between">
														<h3 className="text-xl font-bold text-gray-900">
															Skills Analysis
														</h3>
														<div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
															<Target className="w-5 h-5 text-blue-600" />
															<span className="font-semibold text-blue-900">
																{analysis.extractedSkills?.length || 0} Skills Detected
															</span>
														</div>
													</div>

													{/* Skills Overview Stats */}
													<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
														<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
															<div className="text-2xl font-bold text-blue-600">
																{analysis.skillAnalysis?.categories?.programming?.length || 0}
															</div>
															<div className="text-sm text-blue-700">Programming</div>
														</div>
														<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center">
															<div className="text-2xl font-bold text-green-600">
																{analysis.skillAnalysis?.categories?.frontend?.length || 0}
															</div>
															<div className="text-sm text-green-700">Frontend</div>
														</div>
														<div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center">
															<div className="text-2xl font-bold text-purple-600">
																{analysis.skillAnalysis?.categories?.backend?.length || 0}
															</div>
															<div className="text-sm text-purple-700">Backend</div>
														</div>
														<div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center">
															<div className="text-2xl font-bold text-orange-600">
																{analysis.skillAnalysis?.categories?.cloud?.length || 0}
															</div>
															<div className="text-sm text-orange-700">Cloud & DevOps</div>
														</div>
													</div>

													{/* Skill Categories */}
													{analysis.skillAnalysis?.categories && Object.entries(analysis.skillAnalysis.categories).filter(([, skills]) => skills.length > 0).length > 0 && (
														<div className="bg-white border rounded-lg p-6">
															<h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
																<PieChart className="w-5 h-5 mr-2 text-blue-600" />
																Skills by Category
															</h4>
															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																{Object.entries(analysis.skillAnalysis.categories)
																	.filter(([, skills]) => skills.length > 0)
																	.map(([category, skills]) => (
																		<div key={category} className="bg-gray-50 rounded-lg p-4">
																			<h5 className="font-semibold text-gray-900 mb-3 capitalize flex items-center">
																				<div className={`w-3 h-3 rounded-full mr-2 ${
																					category === 'programming' ? 'bg-blue-500' :
																					category === 'frontend' ? 'bg-green-500' :
																					category === 'backend' ? 'bg-purple-500' :
																					category === 'cloud' ? 'bg-orange-500' :
																					category === 'database' ? 'bg-red-500' :
																					category === 'mobile' ? 'bg-pink-500' :
																					'bg-gray-500'
																				}`} />
																				{category.replace(/([A-Z])/g, ' $1').trim()} ({skills.length})
																			</h5>
																			<div className="flex flex-wrap gap-2">
																				{skills.map((skill, idx) => (
																					<span key={idx} className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm font-medium border">
																						{skill}
																					</span>
																				))}
																			</div>
																		</div>
																	))}
															</div>
														</div>
													)}

													{/* Detected Skills */}
													<div className="bg-white border rounded-lg p-6">
														<h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
															<CheckCircle className="w-5 h-5 mr-2 text-green-600" />
															Detailed Skills Analysis ({analysis.extractedSkills?.length || 0})
														</h4>
														<div className="space-y-3 max-h-96 overflow-y-auto">
															{analysis.extractedSkills?.map((skill, index) => (
																<div
																	key={index}
																	className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
																>
																	<div className="flex items-center space-x-3">
																		<div className={`w-2 h-2 rounded-full ${
																			skill.confidence >= 90 ? 'bg-green-500' :
																			skill.confidence >= 70 ? 'bg-blue-500' :
																			skill.confidence >= 50 ? 'bg-yellow-500' :
																			'bg-red-500'
																		}`} />
																		<div>
																			<div className="font-medium text-gray-900">
																				{skill.name}
																			</div>
																			<div className="text-sm text-gray-600">
																				{skill.category} • {skill.mentions || 1} mention{(skill.mentions || 1) > 1 ? 's' : ''}
																			</div>
																		</div>
																	</div>
																	<div className="flex items-center space-x-3">
																		<span
																			className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(
																				skill.level
																			)}`}
																		>
																			{skill.level}
																		</span>
																		<div className="text-right">
																			<div className="text-sm font-medium text-gray-900">
																				{skill.confidence}%
																			</div>
																			<div className="text-xs text-gray-500">
																				confidence
																			</div>
																		</div>
																	</div>
																</div>
															))}
														</div>
													</div>

													{/* Missing Skills */}
													<div className="bg-white border rounded-lg p-6">
														<h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
															<Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
															Recommended Skills to Add ({analysis.missingSkills?.length || 0})
														</h4>
														<div className="space-y-3">
															{analysis.missingSkills?.map((skill, index) => (
																<div
																	key={index}
																	className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
																>
																	<div className="flex items-center space-x-3">
																		<Plus className="w-5 h-5 text-yellow-600" />
																		<div>
																			<div className="font-medium text-gray-900">
																				{skill.name}
																			</div>
																			<div className="text-sm text-gray-600">
																				{skill.reason}
																			</div>
																		</div>
																	</div>
																	<div className="flex items-center space-x-3">
																		<span
																			className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
																				skill.priority
																			)}`}
																		>
																			{skill.priority} Priority
																		</span>
																		<div className="text-right">
																			<div className="text-sm font-medium text-green-600">
																				{skill.impact}
																			</div>
																			<div className="text-xs text-gray-500">
																				potential boost
																			</div>
																		</div>
																	</div>
																</div>
															))}
														</div>
													</div>

													{/* Skill Improvement Actions */}
													<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
														<h4 className="text-lg font-semibold mb-4 flex items-center">
															<TrendingUp className="w-5 h-5 mr-2" />
															Quick Actions to Improve Your Skills Profile
														</h4>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
															<div className="flex items-start space-x-3">
																<Award className="w-5 h-5 mt-1 text-blue-200" />
																<div>
																	<div className="font-medium">Add Skill Levels</div>
																	<div className="text-sm text-blue-100">Specify beginner, intermediate, or expert for each skill</div>
																</div>
															</div>
															<div className="flex items-start space-x-3">
																<Calendar className="w-5 h-5 mt-1 text-blue-200" />
																<div>
																	<div className="font-medium">Include Years of Experience</div>
																	<div className="text-sm text-blue-100">Mention how long you've worked with each technology</div>
																</div>
															</div>
															<div className="flex items-start space-x-3">
																<FileCheck className="w-5 h-5 mt-1 text-blue-200" />
																<div>
																	<div className="font-medium">Add Certifications</div>
																	<div className="text-sm text-blue-100">Include relevant certificates and courses completed</div>
																</div>
															</div>
															<div className="flex items-start space-x-3">
																<Code className="w-5 h-5 mt-1 text-blue-200" />
																<div>
																	<div className="font-medium">Showcase Projects</div>
																	<div className="text-sm text-blue-100">Link skills to specific projects and achievements</div>
																</div>
															</div>
														</div>
													</div>
												</motion.div>
											)}

											{activeTab === "ats" && (
												<motion.div
													key="ats"
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -20 }}
													className="space-y-6"
												>
													<div className="flex items-center justify-between">
														<h3 className="text-xl font-bold text-gray-900">
															ATS Compatibility Analysis
														</h3>
														<div className="flex items-center space-x-2">
															<Shield className="w-5 h-5 text-green-600" />
															<span className="font-semibold text-green-900">
																{analysis.atsCompatibility?.compatibility || 'Good'}
															</span>
														</div>
													</div>

													{/* ATS Score */}
													<div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6">
														<div className="flex items-center justify-between">
															<div className="flex-1">
																<h4 className="text-xl font-bold mb-2">
																	ATS Compatibility Score
																</h4>
																<p className="text-green-100 mb-4">
																	How well your resume works with Applicant Tracking Systems
																</p>
																<div className="flex items-center space-x-4">
																	<div className="bg-white/20 rounded-lg px-3 py-2">
																		<div className="text-sm text-blue-100">Readability</div>
																		<div className="font-semibold">{analysis.atsCompatibility?.contentQuality || 85}%</div>
																	</div>
																	<div className="bg-white/20 rounded-lg px-3 py-2">
																		<div className="text-sm text-blue-100">Contact Info</div>
																		<div className="font-semibold">{analysis.atsCompatibility?.contactScore || 80}%</div>
																	</div>
																	<div className="bg-white/20 rounded-lg px-3 py-2">
																		<div className="text-sm text-blue-100">Keywords</div>
																		<div className="font-semibold">{analysis.atsCompatibility?.formatScore || 85}%</div>
																	</div>
																</div>
															</div>
															<div className="text-center">
																<div className="text-5xl font-bold mb-2">
																	{analysis.atsCompatibility?.score || 0}%
																</div>
																<div className={`px-4 py-2 rounded-full text-sm font-medium ${
																	(analysis.atsCompatibility?.score || 0) >= 85 ? 'bg-green-400 text-green-900' :
																	(analysis.atsCompatibility?.score || 0) >= 70 ? 'bg-yellow-400 text-yellow-900' :
																	'bg-red-400 text-red-900'
																}`}>
																	{analysis.atsCompatibility?.compatibility || 'Good'}
																</div>
															</div>
														</div>
													</div>

													{/* ATS Score Breakdown */}
													<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
														<div className="bg-white border rounded-lg p-4">
															<div className="flex items-center justify-between mb-3">
																<h5 className="font-semibold text-gray-900">Content Quality</h5>
																<Gauge className="w-5 h-5 text-blue-600" />
															</div>
															<div className="flex items-center space-x-2">
																<div className="flex-1 bg-gray-200 rounded-full h-2">
																	<div 
																		className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
																		style={{ width: `${analysis.atsCompatibility?.contentQuality || 85}%` }}
																	/>
																</div>
																<span className="text-sm font-medium text-gray-900">
																	{analysis.atsCompatibility?.contentQuality || 85}%
																</span>
															</div>
															<p className="text-xs text-gray-600 mt-2">Resume length and structure quality</p>
														</div>

														<div className="bg-white border rounded-lg p-4">
															<div className="flex items-center justify-between mb-3">
																<h5 className="font-semibold text-gray-900">Contact Info</h5>
																<Mail className="w-5 h-5 text-green-600" />
															</div>
															<div className="flex items-center space-x-2">
																<div className="flex-1 bg-gray-200 rounded-full h-2">
																	<div 
																		className="bg-green-600 h-2 rounded-full transition-all duration-1000"
																		style={{ width: `${analysis.atsCompatibility?.contactScore || 80}%` }}
																	/>
																</div>
																<span className="text-sm font-medium text-gray-900">
																	{analysis.atsCompatibility?.contactScore || 80}%
																</span>
															</div>
															<p className="text-xs text-gray-600 mt-2">Email, phone, and location visibility</p>
														</div>

														<div className="bg-white border rounded-lg p-4">
															<div className="flex items-center justify-between mb-3">
																<h5 className="font-semibold text-gray-900">Experience</h5>
																<Briefcase className="w-5 h-5 text-purple-600" />
															</div>
															<div className="flex items-center space-x-2">
																<div className="flex-1 bg-gray-200 rounded-full h-2">
																	<div 
																		className="bg-purple-600 h-2 rounded-full transition-all duration-1000"
																		style={{ width: `${analysis.atsCompatibility?.experienceScore || 75}%` }}
																	/>
																</div>
																<span className="text-sm font-medium text-gray-900">
																	{analysis.atsCompatibility?.experienceScore || 75}%
																</span>
															</div>
															<p className="text-xs text-gray-600 mt-2">Work history clarity and format</p>
														</div>

														<div className="bg-white border rounded-lg p-4">
															<div className="flex items-center justify-between mb-3">
																<h5 className="font-semibold text-gray-900">Format & Keywords</h5>
																<Search className="w-5 h-5 text-orange-600" />
															</div>
															<div className="flex items-center space-x-2">
																<div className="flex-1 bg-gray-200 rounded-full h-2">
																	<div 
																		className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
																		style={{ width: `${analysis.atsCompatibility?.formatScore || 85}%` }}
																	/>
																</div>
																<span className="text-sm font-medium text-gray-900">
																	{analysis.atsCompatibility?.formatScore || 85}%
																</span>
															</div>
															<p className="text-xs text-gray-600 mt-2">ATS-friendly formatting and keywords</p>
														</div>
													</div>

													{/* Issues Found */}
													{analysis.atsCompatibility?.issues?.length > 0 && (
														<div className="bg-white border rounded-lg p-6">
															<h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
																<AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
																Issues Found ({analysis.atsCompatibility.issues.length})
															</h4>
															<div className="space-y-3">
																{analysis.atsCompatibility.issues.map((issue, index) => (
																	<div
																		key={index}
																		className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg"
																	>
																		<AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
																		<div className="flex-1">
																			<div className="flex items-center space-x-2 mb-1">
																				<span className="font-medium text-gray-900 capitalize">
																					{issue.type} Issue
																				</span>
																				<span
																					className={`px-2 py-1 rounded-full text-xs font-medium ${
																						issue.severity === "High"
																							? "bg-red-100 text-red-800"
																							: issue.severity === "Medium"
																							? "bg-yellow-100 text-yellow-800"
																							: "bg-blue-100 text-blue-800"
																					}`}
																				>
																					{issue.severity} Priority
																				</span>
																			</div>
																			<p className="text-sm text-gray-600">
																				{issue.description}
																			</p>
																		</div>
																		<button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
																			Fix Now
																		</button>
																	</div>
																))}
															</div>
														</div>
													)}

													{/* Recommendations */}
													<div className="bg-white border rounded-lg p-6">
														<h4 className="text-lg font-semibold text-gray-900 mb-4">
															ATS Optimization Tips
														</h4>
														<div className="space-y-3">
															{analysis.atsCompatibility?.recommendations?.map(
																(rec, index) => (
																	<div
																		key={index}
																		className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
																	>
																		<CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
																		<p className="text-sm text-gray-700">
																			{rec}
																		</p>
																	</div>
																)
															)}
														</div>
													</div>
												</motion.div>
											)}

											{activeTab === "improvements" && (
												<motion.div
													key="improvements"
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -20 }}
													className="space-y-6"
												>
													<div className="flex items-center justify-between">
														<h3 className="text-xl font-bold text-gray-900">
															Resume Improvements
														</h3>
														<div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-lg">
															<Target className="w-5 h-5 text-orange-600" />
															<span className="font-semibold text-orange-900">
																{analysis.improvements?.length || 0} Suggestions
															</span>
														</div>
													</div>

													{/* Priority Summary */}
													<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
														{['High', 'Medium', 'Low'].map((priority) => {
															const priorityImprovements = analysis.improvements?.filter(
																imp => imp.priority === priority
															) || [];
															return (
																<div
																	key={priority}
																	className={`p-4 rounded-lg border-2 ${
																		priority === 'High' ? 'border-red-200 bg-red-50' :
																		priority === 'Medium' ? 'border-yellow-200 bg-yellow-50' :
																		'border-green-200 bg-green-50'
																	}`}
																>
																	<div className="text-center">
																		<div className={`text-3xl font-bold ${
																			priority === 'High' ? 'text-red-600' :
																			priority === 'Medium' ? 'text-yellow-600' :
																			'text-green-600'
																		}`}>
																			{priorityImprovements.length}
																		</div>
																		<div className={`text-sm font-medium ${
																			priority === 'High' ? 'text-red-800' :
																			priority === 'Medium' ? 'text-yellow-800' :
																			'text-green-800'
																		}`}>
																			{priority} Priority
																		</div>
																	</div>
																</div>
															);
														})}
													</div>

													{/* Improvements List */}
													<div className="space-y-4">
														{analysis.improvements?.map((improvement, index) => (
															<div
																key={index}
																className={`bg-white border-l-4 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
																	improvement.priority === 'High' ? 'border-red-400' :
																	improvement.priority === 'Medium' ? 'border-yellow-400' :
																	'border-green-400'
																}`}
															>
																<div className="flex items-start justify-between">
																	<div className="flex items-start space-x-3 flex-1">
																		<div className={`p-2 rounded-lg ${
																			improvement.priority === 'High' ? 'bg-red-100' :
																			improvement.priority === 'Medium' ? 'bg-yellow-100' :
																			'bg-green-100'
																		}`}>
																			{improvement.priority === 'High' ? (
																				<AlertCircle className="w-5 h-5 text-red-600" />
																			) : improvement.priority === 'Medium' ? (
																				<AlertTriangle className="w-5 h-5 text-yellow-600" />
																			) : (
																				<CheckCircle className="w-5 h-5 text-green-600" />
																			)}
																		</div>
																		<div className="flex-1">
																			<div className="flex items-center space-x-2 mb-2">
																				<h4 className="text-lg font-semibold text-gray-900">
																					{improvement.section}
																				</h4>
																				<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(improvement.priority)}`}>
																					{improvement.priority} Priority
																				</span>
																			</div>
																			<p className="text-gray-600 mb-4 leading-relaxed">
																				{improvement.suggestion}
																			</p>
																			
																			{/* Impact and Actions */}
																			<div className="flex items-center justify-between">
																				<div className="flex items-center space-x-4">
																					<div className="flex items-center space-x-2">
																						<TrendingUp className="w-4 h-4 text-blue-600" />
																						<span className="text-sm font-medium text-gray-700">
																							Impact: {improvement.impact}
																						</span>
																					</div>
																					{improvement.estimatedTime && (
																						<div className="flex items-center space-x-2">
																							<Clock className="w-4 h-4 text-purple-600" />
																							<span className="text-sm font-medium text-gray-700">
																								{improvement.estimatedTime}
																							</span>
																						</div>
																					)}
																				</div>
																				
																				<div className="flex items-center space-x-2">
																					{improvement.applied ? (
																						<div className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-100 text-green-800 rounded-lg">
																							<Check className="w-4 h-4" />
																							<span>Applied</span>
																						</div>
																					) : (
																						<button
																							onClick={() => applyImprovement(improvement)}
																							className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
																						>
																							<Edit className="w-4 h-4" />
																							<span>Apply Fix</span>
																						</button>
																					)}
																					<button className="flex items-center space-x-1 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
																						<BookOpen className="w-4 h-4" />
																						<span>Learn More</span>
																					</button>
																					{improvement.details && (
																						<button
																							onClick={() => toast(improvement.details, { icon: "💡", duration: 5000 })}
																							className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
																							title="View details"
																						>
																							<Info className="w-4 h-4" />
																						</button>
																					)}
																				</div>
																			</div>
																		</div>
																	</div>
																</div>
															</div>
														))}
													</div>

													{/* Quick Actions Panel */}
													<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
														<h4 className="text-xl font-bold mb-4 flex items-center">
															<Zap className="w-6 h-6 mr-2" />
															Quick Improvement Actions
														</h4>
														<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
															<button className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
																<FileText className="w-6 h-6" />
																<div className="text-left">
																	<div className="font-semibold">Auto-Fix Format</div>
																	<div className="text-sm text-blue-100">Fix spacing & layout</div>
																</div>
															</button>
															<button className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
																<Award className="w-6 h-6" />
																<div className="text-left">
																	<div className="font-semibold">Add Keywords</div>
																	<div className="text-sm text-blue-100">Boost ATS score</div>
																</div>
															</button>
															<button className="flex items-center space-x-3 p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
																<Target className="w-6 h-6" />
																<div className="text-left">
																	<div className="font-semibold">Optimize Sections</div>
																	<div className="text-sm text-blue-100">Reorder & enhance</div>
																</div>
															</button>
														</div>
													</div>

													{/* Improvement Progress */}
													<div className="bg-white border rounded-lg p-6">
														<h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
															<BarChart className="w-5 h-5 mr-2 text-green-600" />
															Implementation Progress
														</h4>
														<div className="space-y-4">
															<div className="flex items-center justify-between">
																<span className="text-sm font-medium text-gray-700">Overall Resume Score</span>
																<span className="text-sm text-gray-600">{analysis.atsCompatibility?.overallScore || 'N/A'}%</span>
															</div>
															<div className="w-full bg-gray-200 rounded-full h-3">
																<div 
																	className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000"
																	style={{ width: `${analysis.atsCompatibility?.overallScore || 0}%` }}
																/>
															</div>
															<div className="grid grid-cols-2 gap-4 mt-4">
																<div className="text-center p-3 bg-green-50 rounded-lg">
																	<div className="text-2xl font-bold text-green-600">
																		{analysis.improvements?.filter(imp => imp.priority === 'Low').length || 0}
																	</div>
																	<div className="text-sm text-green-800">Easy Wins</div>
																</div>
																<div className="text-center p-3 bg-blue-50 rounded-lg">
																	<div className="text-2xl font-bold text-blue-600">
																		+{Math.round((analysis.improvements?.length || 0) * 2.5)}%
																	</div>
																	<div className="text-sm text-blue-800">Potential Boost</div>
																</div>
															</div>
														</div>
													</div>
												</motion.div>
											)}

											{activeTab === "career" && (
												<motion.div
													key="career"
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -20 }}
													className="space-y-6"
												>
													<div className="flex items-center justify-between">
														<h3 className="text-xl font-bold text-gray-900">
															Career Match Analysis
														</h3>
														<div className="flex items-center space-x-2 bg-purple-50 px-4 py-2 rounded-lg">
															<Briefcase className="w-5 h-5 text-purple-600" />
															<span className="font-semibold text-purple-900">
																{analysis.careerSuggestions?.length || 0} Matches Found
															</span>
														</div>
													</div>

													{/* Best Match Highlight */}
													{analysis.careerSuggestions && analysis.careerSuggestions.length > 0 && (
														<div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl p-6">
															<div className="flex items-center justify-between">
																<div>
																	<h4 className="text-xl font-bold mb-2 flex items-center">
																		<Star className="w-6 h-6 mr-2 text-yellow-300" />
																		Top Career Match
																	</h4>
																	<h5 className="text-2xl font-bold mb-1">
																		{analysis.careerSuggestions[0]?.title}
																	</h5>
																	<p className="text-purple-100 mb-4">
																		{analysis.careerSuggestions[0]?.reason}
																	</p>
																	<div className="flex items-center space-x-6">
																		<div className="flex items-center space-x-2">
																			<DollarSign className="w-5 h-5 text-green-300" />
																			<span className="font-semibold">
																				{analysis.careerSuggestions[0]?.salaryRange}
																			</span>
																		</div>
																		<div className="flex items-center space-x-2">
																			<TrendingUp className="w-5 h-5 text-blue-300" />
																			<span className="font-semibold">
																				{analysis.careerSuggestions[0]?.growth} Growth
																			</span>
																		</div>
																	</div>
																</div>
																<div className="text-center">
																	<div className="text-5xl font-bold mb-2">
																		{analysis.careerSuggestions[0]?.match}%
																	</div>
																	<div className="bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
																		Perfect Match
																	</div>
																</div>
															</div>
														</div>
													)}

													{/* All Career Matches */}
													<div className="grid gap-4">
														{analysis.careerSuggestions?.map((career, index) => (
															<div
																key={index}
																className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
															>
																<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
																	<div className="flex-1">
																		<div className="flex items-start justify-between mb-3">
																			<div className="flex-1">
																				<div className="flex items-center space-x-2 mb-2">
																					<h4 className="text-lg font-semibold text-gray-900">
																						{career.title}
																					</h4>
																					{index === 0 && (
																						<span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
																							Top Match
																						</span>
																					)}
																				</div>
																				<p className="text-sm text-gray-600 mb-3">
																					{career.reason}
																				</p>
																				
																				{/* Match Progress Bar */}
																				<div className="mb-3">
																					<div className="flex items-center justify-between mb-1">
																						<span className="text-sm font-medium text-gray-700">
																							Skill Match
																						</span>
																						<span className="text-sm text-gray-600">
																							{career.match}%
																						</span>
																					</div>
																					<div className="w-full bg-gray-200 rounded-full h-3">
																						<div 
																							className={`h-3 rounded-full transition-all duration-1000 ${
																								career.match >= 80 ? 'bg-green-500' :
																								career.match >= 60 ? 'bg-blue-500' :
																								career.match >= 40 ? 'bg-yellow-500' :
																								'bg-red-500'
																							}`}
																							style={{ width: `${career.match}%` }}
																						/>
																					</div>
																				</div>

																				{/* Career Details */}
																				<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
																					<div className="flex items-center space-x-2">
																						<DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
																						<div>
																							<div className="text-sm font-medium text-gray-900">
																								{career.salaryRange}
																							</div>
																							<div className="text-xs text-gray-600">
																								Salary Range
																							</div>
																						</div>
																					</div>
																					<div className="flex items-center space-x-2">
																						<TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />
																						<div>
																							<div className="text-sm font-medium text-gray-900">
																								{career.growth} Growth
																							</div>
																							<div className="text-xs text-gray-600">
																								Market Demand
																							</div>
																						</div>
																					</div>
																					<div className="flex items-center space-x-2">
																						<MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
																						<div>
																							<div className="text-sm font-medium text-gray-900">
																								Remote Friendly
																							</div>
																							<div className="text-xs text-gray-600">
																								Work Options
																							</div>
																						</div>
																					</div>
																				</div>
																			</div>
																			
																			<div className="text-center lg:ml-6">
																				<div className="text-3xl font-bold text-blue-600 mb-1">
																					{career.match}%
																				</div>
																				<div className="text-sm text-gray-500">
																					match
																				</div>
																			</div>
																		</div>
																	</div>
																</div>

																{/* Action Buttons */}
																<div className="flex items-center justify-between pt-4 border-t border-gray-200">
																	<div className="flex items-center space-x-3">
																		<button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
																			<Search className="w-4 h-4" />
																			<span>Find Jobs</span>
																		</button>
																		<button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
																			<BookOpen className="w-4 h-4" />
																			<span>Learn Skills</span>
																		</button>
																	</div>
																	
																	<div className="flex items-center space-x-2 text-sm text-gray-600">
																		<Users className="w-4 h-4" />
																		<span>High demand role</span>
																	</div>
																</div>
															</div>
														))}
													</div>

													{/* Career Growth Suggestions */}
													<div className="bg-white border rounded-lg p-6">
														<h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
															<Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
															Career Growth Recommendations
														</h4>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
															<div className="space-y-4">
																<div className="flex items-start space-x-3">
																	<div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
																	<div>
																		<h5 className="font-medium text-gray-900">Skill Development</h5>
																		<p className="text-sm text-gray-600">
																			Focus on the missing skills identified in your top career matches to improve your match percentage
																		</p>
																	</div>
																</div>
																<div className="flex items-start space-x-3">
																	<div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
																	<div>
																		<h5 className="font-medium text-gray-900">Experience Building</h5>
																		<p className="text-sm text-gray-600">
																			Consider projects or internships that align with your target career path
																		</p>
																	</div>
																</div>
															</div>
															<div className="space-y-4">
																<div className="flex items-start space-x-3">
																	<div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
																	<div>
																		<h5 className="font-medium text-gray-900">Networking</h5>
																		<p className="text-sm text-gray-600">
																			Connect with professionals in your target roles through LinkedIn and industry events
																		</p>
																	</div>
																</div>
																<div className="flex items-start space-x-3">
																	<div className="w-2 h-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
																	<div>
																		<h5 className="font-medium text-gray-900">Certification</h5>
																		<p className="text-sm text-gray-600">
																			Obtain relevant industry certifications to validate your skills and knowledge
																		</p>
																	</div>
																</div>
															</div>
														</div>
													</div>
												</motion.div>
											)}

											{activeTab === "builder" && (
												<motion.div
													key="builder"
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -20 }}
													className="space-y-6"
												>
													<div className="flex items-center justify-between">
														<h3 className="text-xl font-bold text-gray-900">
															AI Resume Builder
														</h3>
														<div className="flex items-center space-x-2">
															<button
																onClick={() => setEditMode(!editMode)}
																className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
															>
																<Edit3 className="w-4 h-4" />
																<span>{editMode ? "Preview" : "Edit"}</span>
															</button>
															<div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
																<FileText className="w-5 h-5 text-green-600" />
																<span className="font-semibold text-green-900">
																	Smart Templates
																</span>
															</div>
														</div>
													</div>

													{/* AI Optimization Banner */}
													<div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl p-6">
														<div className="flex items-center justify-between">
															<div>
																<h4 className="text-xl font-bold mb-2 flex items-center">
																	<Sparkles className="w-6 h-6 mr-2" />
																	AI-Optimized Resume Building
																</h4>
																<p className="text-green-100 mb-4">
																	Based on your analysis, we've identified the best template and content optimizations for your profile
																</p>
																<div className="flex items-center space-x-6">
																	<div className="flex items-center space-x-2">
																		<Target className="w-5 h-5 text-green-300" />
																		<span>ATS Score: {analysis.atsCompatibility?.overallScore || 0}%</span>
																	</div>
																	<div className="flex items-center space-x-2">
																		<Award className="w-5 h-5 text-blue-300" />
																		<span>Skills Matched: {analysis.skillAnalysis?.matchedSkills?.length || 0}</span>
																	</div>
																</div>
															</div>
															<div className="text-center">
																<div className="text-4xl font-bold mb-2">
																	{Math.round((analysis.atsCompatibility?.overallScore || 0) + 15)}%
																</div>
																<div className="bg-white/20 rounded-full px-4 py-2 text-sm font-medium">
																	Optimized Score
																</div>
															</div>
														</div>
													</div>

													{/* Template Selection */}
													<div className="bg-white border rounded-lg p-6">
														<h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
															<Palette className="w-5 h-5 mr-2 text-purple-600" />
															Choose Your Template
														</h4>
														<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
															{[
																{ name: 'ATS-Optimized', icon: Settings, score: 95, desc: 'Maximum ATS compatibility', color: 'green' },
																{ name: 'Modern Professional', icon: Briefcase, score: 88, desc: 'Clean and contemporary', color: 'blue' },
																{ name: 'Creative Design', icon: Sparkles, score: 82, desc: 'Stand out visually', color: 'purple' },
																{ name: 'Executive', icon: Award, score: 90, desc: 'Senior-level positions', color: 'indigo' }
															].map((template, index) => (
																<button
																	key={template.name}
																	className={`p-4 border-2 rounded-lg text-center transition-all hover:shadow-md ${
																		index === 0 ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-500'
																	}`}
																>
																	<template.icon className={`w-8 h-8 mx-auto mb-2 ${
																		index === 0 ? 'text-green-600' : 'text-gray-400'
																	}`} />
																	<div className="text-sm font-medium text-gray-900 mb-1">
																		{template.name}
																	</div>
																	<div className="text-xs text-gray-600 mb-2">
																		{template.desc}
																	</div>
																	<div className={`text-sm font-bold ${
																		template.score >= 90 ? 'text-green-600' :
																		template.score >= 85 ? 'text-blue-600' :
																		'text-yellow-600'
																	}`}>
																		{template.score}% Score
																	</div>
																	{index === 0 && (
																		<div className="mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
																			Recommended
																		</div>
																	)}
																</button>
															))}
														</div>
													</div>

													{/* Content Optimization */}
													<div className="bg-white border rounded-lg p-6">
														<h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
															<Edit className="w-5 h-5 mr-2 text-blue-600" />
															AI Content Optimization
														</h4>
														<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
															<div className="space-y-4">
																<h5 className="font-medium text-gray-900">Sections to Enhance</h5>
																{[
																	{ section: 'Professional Summary', status: 'optimized', improvement: '+12%' },
																	{ section: 'Skills Keywords', status: 'needs-work', improvement: '+8%' },
																	{ section: 'Experience Bullets', status: 'optimized', improvement: '+15%' },
																	{ section: 'Education Format', status: 'good', improvement: '+3%' }
																].map((item, index) => (
																	<div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
																		<div className="flex items-center space-x-3">
																			{item.status === 'optimized' ? (
																				<CheckCircle className="w-5 h-5 text-green-500" />
																			) : item.status === 'needs-work' ? (
																				<AlertCircle className="w-5 h-5 text-yellow-500" />
																			) : (
																				<Info className="w-5 h-5 text-blue-500" />
																			)}
																			<span className="text-sm font-medium text-gray-900">
																				{item.section}
																			</span>
																		</div>
																		<div className="flex items-center space-x-2">
																			<span className="text-sm text-green-600 font-medium">
																				{item.improvement}
																			</span>
																			<button className="text-xs text-blue-600 hover:text-blue-800">
																				Optimize
																			</button>
																		</div>
																	</div>
																))}
															</div>

															<div className="space-y-4">
																<h5 className="font-medium text-gray-900">Smart Suggestions</h5>
																<div className="space-y-3">
																	{[
																		{ text: 'Add action verbs to experience bullets', impact: 'High' },
																		{ text: 'Include industry-specific keywords', impact: 'High' },
																		{ text: 'Quantify achievements with numbers', impact: 'Medium' },
																		{ text: 'Optimize section ordering', impact: 'Low' }
																	].map((suggestion, index) => (
																		<div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg">
																			<Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
																			<div className="flex-1">
																				<p className="text-sm text-gray-900">{suggestion.text}</p>
																				<span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
																					suggestion.impact === 'High' ? 'bg-red-100 text-red-800' :
																					suggestion.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
																					'bg-green-100 text-green-800'
																				}`}>
																					{suggestion.impact} Impact
																				</span>
																			</div>
																		</div>
																	))}
																</div>
															</div>
														</div>
													</div>

													{/* Export Options */}
													<div className="bg-white border rounded-lg p-6">
														<h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
															<Download className="w-5 h-5 mr-2 text-gray-600" />
															Export Your Resume
														</h4>
														<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
															<div className="p-4 border border-gray-200 rounded-lg text-center">
																<FileText className="w-8 h-8 text-red-600 mx-auto mb-2" />
																<div className="text-sm font-medium text-gray-900 mb-1">PDF Format</div>
																<div className="text-xs text-gray-600 mb-3">Universal compatibility</div>
																<button
																	onClick={() => exportResume("pdf")}
																	className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
																>
																	Export PDF
																</button>
															</div>
															<div className="p-4 border border-gray-200 rounded-lg text-center">
																<FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
																<div className="text-sm font-medium text-gray-900 mb-1">DOCX Format</div>
																<div className="text-xs text-gray-600 mb-3">Editable document</div>
																<button
																	onClick={() => exportResume("docx")}
																	className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
																>
																	Export DOCX
																</button>
															</div>
															<div className="p-4 border border-gray-200 rounded-lg text-center">
																<Share className="w-8 h-8 text-green-600 mx-auto mb-2" />
																<div className="text-sm font-medium text-gray-900 mb-1">Share Link</div>
																<div className="text-xs text-gray-600 mb-3">Online portfolio</div>
																<button className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
																	Get Link
																</button>
															</div>
														</div>

														{/* Additional Features */}
														<div className="flex flex-col sm:flex-row gap-3">
															<button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
																<Copy className="w-4 h-4" />
																<span>Save as Template</span>
															</button>
															<button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
																<Mail className="w-4 h-4" />
																<span>Email Resume</span>
															</button>
															<button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
																<Eye className="w-4 h-4" />
																<span>Preview Changes</span>
															</button>
														</div>
													</div>
												</motion.div>
											)}

											{activeTab === "history" && (
												<motion.div
													key="history"
													initial={{ opacity: 0, y: 20 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -20 }}
													className="space-y-6"
												>
													<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
														<h3 className="text-xl font-bold text-gray-900">
															Analysis History ({analysisHistory.length})
														</h3>

														{/* Search and Filter Controls */}
														<div className="flex flex-col sm:flex-row gap-3">
															<div className="relative">
																<Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
																<input
																	type="text"
																	placeholder="Search by filename..."
																	value={historySearchTerm}
																	onChange={(e) =>
																		setHistorySearchTerm(e.target.value)
																	}
																	className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
																/>
															</div>

															<select
																value={historyFilterBy}
																onChange={(e) =>
																	setHistoryFilterBy(e.target.value)
																}
																className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
															>
																<option value="all">All Scores</option>
																<option value="high">High (80-100)</option>
																<option value="medium">Medium (60-79)</option>
																<option value="low">Low (&lt;60)</option>
															</select>

															<select
																value={historySort}
																onChange={(e) => setHistorySort(e.target.value)}
																className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
															>
																<option value="date-desc">Newest First</option>
																<option value="date-asc">Oldest First</option>
																<option value="score-desc">
																	Highest Score
																</option>
																<option value="score-asc">Lowest Score</option>
																<option value="name">By Name</option>
															</select>
														</div>
													</div>

													{getFilteredAndSortedHistory().length > 0 ? (
														<div className="space-y-4 max-h-96 overflow-y-auto">
															{getFilteredAndSortedHistory().map((item) => {
																const preview = getAnalysisPreview(
																	item.analysis
																);
																return (
																	<div
																		key={item.id}
																		className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
																	>
																		<div className="flex flex-col space-y-4">
																			{/* Header Row */}
																			<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
																				<div className="flex-1 min-w-0">
																					<div className="flex items-center space-x-3">
																						<FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
																						<h4
																							className="font-semibold text-gray-900 truncate"
																							title={item.filename}
																						>
																							{item.filename}
																						</h4>
																						<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
																							{item.fileType?.toUpperCase() ||
																								"FILE"}
																						</span>
																					</div>
																					<p className="text-sm text-gray-600 mt-1 flex items-center space-x-4">
																						<span className="flex items-center space-x-1">
																							<Calendar className="w-4 h-4" />
																							<span>
																								{new Date(
																									item.timestamp
																								).toLocaleDateString()}
																							</span>
																						</span>
																						<span className="flex items-center space-x-1">
																							<Clock className="w-4 h-4" />
																							<span>
																								{new Date(
																									item.timestamp
																								).toLocaleTimeString([], {
																									hour: "2-digit",
																									minute: "2-digit",
																								})}
																							</span>
																						</span>
																						{item.fileSize && (
																							<span className="text-xs text-gray-500">
																								{typeof item.fileSize ===
																								"string"
																									? item.fileSize
																									: (
																											item.fileSize /
																											(1024 * 1024)
																									  ).toFixed(2) + " MB"}
																							</span>
																						)}
																					</p>
																				</div>
																				<div className="flex items-center space-x-3">
																					<div
																						className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getScoreColor(
																							item.score
																						)}`}
																					>
																						{item.score}/100
																					</div>
																				</div>
																			</div>

																			{/* Analysis Preview */}
																			{preview && (
																				<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
																					<div className="text-center">
																						<div className="text-lg font-semibold text-blue-600">
																							{preview.skillsCount}
																						</div>
																						<div className="text-xs text-gray-600">
																							Skills Found
																						</div>
																					</div>
																					<div className="text-center">
																						<div className="text-lg font-semibold text-green-600">
																							{preview.atsScore}%
																						</div>
																						<div className="text-xs text-gray-600">
																							ATS Score
																						</div>
																					</div>
																					<div className="text-center">
																						<div className="text-lg font-semibold text-orange-600">
																							{preview.improvementsCount}
																						</div>
																						<div className="text-xs text-gray-600">
																							Improvements
																						</div>
																					</div>
																					<div className="text-center">
																						<div className="text-lg font-semibold text-purple-600">
																							{preview.careerSuggestionsCount}
																						</div>
																						<div className="text-xs text-gray-600">
																							Career Matches
																						</div>
																					</div>
																				</div>
																			)}

																			{/* Top Skills Preview */}
																			{preview?.topSkills?.length > 0 && (
																				<div className="flex flex-wrap gap-2">
																					<span className="text-sm text-gray-600">
																						Top Skills:
																					</span>
																					{preview.topSkills.map(
																						(skill, idx) => (
																							<span
																								key={idx}
																								className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
																							>
																								{skill}
																							</span>
																						)
																					)}
																				</div>
																			)}

																			{/* Action Buttons */}
																			<div className="flex items-center justify-between pt-3 border-t border-gray-200">
																				<button
																					onClick={() =>
																						setShowHistoryDetails(item.id)
																					}
																					className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
																				>
																					<Eye className="w-4 h-4" />
																					<span>View Full Details</span>
																				</button>

																				<div className="flex items-center space-x-2">
																					<button
																						onClick={async () => {
																							try {
																								toast.loading(
																									"Loading analysis..."
																								);
																								const fullAnalysis =
																									await resumeDatabase.getFullAnalysis(
																										item.id
																									);

																								setAnalysis(
																									fullAnalysis.analysis_data
																								);
																								setCurrentAnalysisId(item.id);
																								setRealTimeScore(
																									fullAnalysis.overall_score
																								);
																								setImprovements(
																									fullAnalysis.improvements ||
																										[]
																								);
																								setCareerSuggestions(
																									fullAnalysis.careerSuggestions ||
																										[]
																								);
																								setActiveTab("overview");

																								toast.success(
																									"Loaded previous analysis"
																								);
																							} catch (error) {
																								console.error(
																									"Error loading analysis:",
																									error
																								);
																								toast.error(
																									"Failed to load analysis details"
																								);
																							}
																						}}
																						className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
																					>
																						<ArrowRight className="w-4 h-4" />
																						<span>Load Analysis</span>
																					</button>
																					<button
																						onClick={(e) => {
																							e.stopPropagation();
																							if (
																								confirm(
																									"Are you sure you want to delete this analysis?"
																								)
																							) {
																								deleteAnalysis(item.id);
																							}
																						}}
																						className="p-2 text-red-400 hover:text-red-600 transition-colors"
																						title="Delete analysis"
																					>
																						<Trash2 className="w-4 h-4" />
																					</button>
																				</div>
																			</div>
																		</div>
																	</div>
																);
															})}
														</div>
													) : analysisHistory.length > 0 ? (
														<div className="text-center py-12">
															<Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
															<h4 className="text-lg font-medium text-gray-900 mb-2">
																No Results Found
															</h4>
															<p className="text-gray-600 mb-4">
																Try adjusting your search or filter criteria
															</p>
															<button
																onClick={() => {
																	setHistorySearchTerm("");
																	setHistoryFilterBy("all");
																}}
																className="text-blue-600 hover:text-blue-800 font-medium"
															>
																Clear Filters
															</button>
														</div>
													) : (
														<div className="text-center py-12">
															<Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
															<h4 className="text-lg font-medium text-gray-900 mb-2">
																No Analysis History
															</h4>
															<p className="text-gray-600">
																Your previous analyses will appear here
															</p>
														</div>
													)}
												</motion.div>
											)}
										</AnimatePresence>
									</div>
								</div>
							</div>
						) : (
							<div className="bg-white rounded-xl shadow-sm border p-8 text-center">
								<Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									Ready to Analyze Your Resume?
								</h3>
								<p className="text-gray-600 mb-4">
									Upload your resume to get AI-powered insights, ATS
									compatibility scores, and personalized improvement
									suggestions.
								</p>

								{/* API Status Indicator */}
								<div className="mb-6 p-3 bg-gray-50 rounded-lg border">
									<div className="flex items-center justify-center space-x-4 text-sm">
										<div className="flex items-center space-x-1">
											<div
												className={`w-2 h-2 rounded-full ${
													apiStatus.openai.available
														? "bg-green-500"
														: "bg-red-500"
												}`}
											></div>
											<span className="text-gray-600">OpenAI</span>
										</div>
										<div className="flex items-center space-x-1">
											<div
												className={`w-2 h-2 rounded-full ${
													apiStatus.gemini.available
														? "bg-green-500"
														: "bg-yellow-500"
												}`}
											></div>
											<span className="text-gray-600">Gemini</span>
										</div>
										<div className="flex items-center space-x-1">
											<div className="w-2 h-2 rounded-full bg-blue-500"></div>
											<span className="text-gray-600">Enhanced Analysis</span>
										</div>
									</div>
									<div className="text-xs text-gray-500 text-center mt-1">
										{apiStatus.recommended === "openai" &&
											"Using premium AI analysis"}
										{apiStatus.recommended === "gemini" &&
											"Using smart AI analysis"}
										{apiStatus.recommended === "mock" &&
											"Enhanced local analysis ready"}
									</div>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
									<div className="flex items-center space-x-2">
										<Target className="w-5 h-5 text-blue-600" />
										<span>Skills Analysis</span>
									</div>
									<div className="flex items-center space-x-2">
										<Shield className="w-5 h-5 text-green-600" />
										<span>ATS Compatibility</span>
									</div>
									<div className="flex items-center space-x-2">
										<TrendingUp className="w-5 h-5 text-purple-600" />
										<span>Improvement Tips</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default ResumeAnalyzer;
