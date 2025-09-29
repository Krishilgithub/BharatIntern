import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Search,
	Filter,
	MapPin,
	Clock,
	Building2,
	Bookmark,
	ExternalLink,
	ChevronDown,
	Star,
	TrendingUp,
	Users,
	Award,
	DollarSign,
	Calendar,
	Heart,
	Target,
	Zap,
	Brain,
	Lightbulb,
	CheckCircle,
	ArrowRight,
	BarChart3,
	Eye,
	Share2,
	MessageCircle,
	Bell,
	Sparkles,
	Filter as FilterIcon,
	SortAsc,
	Globe,
	Code,
	Briefcase,
	GraduationCap,
	ChevronRight,
	Plus,
	X,
	RefreshCw,
	ThumbsUp,
	ThumbsDown,
	AlertCircle
} from "lucide-react";

const EnhancedRecommendations = () => {
	const [recommendations, setRecommendations] = useState([]);
	const [filteredRecommendations, setFilteredRecommendations] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filters, setFilters] = useState({
		location: "",
		duration: "",
		skills: [],
		matchScore: 0,
		salaryRange: "",
		companySize: "",
		remote: "",
		experience: "",
		industry: ""
	});
	const [showFilters, setShowFilters] = useState(false);
	const [sortBy, setSortBy] = useState("matchScore");
	const [viewMode, setViewMode] = useState("grid");
	const [selectedRecommendation, setSelectedRecommendation] = useState(null);
	const [aiInsights, setAiInsights] = useState(null);
	const [personalPreferences, setPersonalPreferences] = useState({
		preferredIndustries: ["Technology", "Healthcare", "Finance"],
		careerGoals: ["Full Stack Development", "Product Management"],
		workStyle: "hybrid",
		salaryExpectation: "25000-40000"
	});
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [showPreferences, setShowPreferences] = useState(false);
	const [savedSearches, setSavedSearches] = useState([]);
	const [alerts, setAlerts] = useState([]);
	const [recentlyViewed, setRecentlyViewed] = useState([]);

	useEffect(() => {
		// Enhanced mock data with AI-powered recommendations
		const mockRecommendations = [
			{
				id: 1,
				title: "AI Software Development Intern",
				company: "TechCorp India",
				companyLogo: "/api/placeholder/40/40",
				location: "Bangalore",
				remote: "Hybrid",
				duration: "6 months",
				matchScore: 95,
				aiMatchReason: "Perfect match for your React and ML skills, aligned with your full-stack career goals",
				skills: ["React", "Node.js", "JavaScript", "MongoDB", "Express", "Machine Learning", "Python"],
				deadline: "2024-02-15",
				salary: "₹30,000 - ₹40,000",
				companySize: "1000+",
				industry: "Technology",
				experience: "0-1 years",
				description: "Join our dynamic team to work on cutting-edge AI-powered web applications using modern technologies. You'll work on real projects that impact millions of users.",
				requirements: [
					"Bachelor's in CS/IT or equivalent",
					"Strong JavaScript and React skills",
					"Basic understanding of Machine Learning",
					"Problem-solving mindset"
				],
				responsibilities: [
					"Develop AI-powered web features",
					"Collaborate with senior developers",
					"Participate in code reviews",
					"Learn advanced ML techniques"
				],
				benefits: ["Mentorship from industry experts", "₹35K stipend", "Certificate", "PPO opportunity", "Health insurance", "Flexible hours"],
				culture: ["Innovation-driven", "Learning-focused", "Collaborative", "Remote-friendly"],
				applied: false,
				bookmarked: false,
				viewed: false,
				trending: true,
				featured: true,
				urgency: "high",
				applicants: 142,
				views: 1250,
				postedDate: "2024-01-10",
				companyRating: 4.5,
				interviewProcess: ["Application Review", "Technical Test", "HR Interview", "Technical Interview", "Final Round"],
				successRate: 78,
				averageResponseTime: "3 days",
				similarRoles: 12,
				growthOpportunity: 95,
				learningPotential: 90,
				workLifeBalance: 85,
				mentorshipQuality: 92,
				tags: ["Hot", "Fast-hiring", "Trending"],
				aiRecommendationScore: {
					skillMatch: 95,
					careerAlignment: 90,
					cultureMatch: 88,
					growthPotential: 92,
					locationPreference: 85
				}
			},
			{
				id: 2,
				title: "Data Science & AI Intern",
				company: "DataViz Solutions",
				companyLogo: "/api/placeholder/40/40",
				location: "Mumbai",
				remote: "Remote",
				duration: "4 months",
				matchScore: 88,
				aiMatchReason: "Strong alignment with your Python skills and data analysis interests",
				skills: ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn", "TensorFlow", "Power BI"],
				deadline: "2024-02-20",
				salary: "₹25,000 - ₹35,000",
				companySize: "100-500",
				industry: "Technology",
				experience: "0-1 years",
				description: "Work on real-world data science projects and build machine learning models that drive business decisions. Perfect for aspiring data scientists.",
				requirements: [
					"Python proficiency with pandas/numpy",
					"Statistics and probability knowledge",
					"SQL experience",
					"Machine learning fundamentals"
				],
				responsibilities: [
					"Build ML models for business problems",
					"Analyze large datasets",
					"Create data visualizations",
					"Present insights to stakeholders"
				],
				benefits: ["Industry mentorship", "₹30K stipend", "Certificate", "Real project experience", "Flexible timings"],
				culture: ["Data-driven", "Analytical", "Innovative", "Growth-oriented"],
				applied: false,
				bookmarked: true,
				viewed: true,
				trending: false,
				featured: false,
				urgency: "medium",
				applicants: 89,
				views: 756,
				postedDate: "2024-01-12",
				companyRating: 4.2,
				interviewProcess: ["Application Review", "Data Challenge", "Technical Interview", "Final Interview"],
				successRate: 65,
				averageResponseTime: "5 days",
				similarRoles: 8,
				growthOpportunity: 88,
				learningPotential: 95,
				workLifeBalance: 90,
				mentorshipQuality: 85,
				tags: ["Remote", "Data-focused"],
				aiRecommendationScore: {
					skillMatch: 85,
					careerAlignment: 88,
					cultureMatch: 82,
					growthPotential: 90,
					locationPreference: 95
				}
			},
			{
				id: 3,
				title: "Product Management Intern",
				company: "StartupXYZ",
				companyLogo: "/api/placeholder/40/40",
				location: "Delhi",
				remote: "Hybrid",
				duration: "3 months",
				matchScore: 82,
				aiMatchReason: "Matches your product management career goals and analytical skills",
				skills: ["Product Strategy", "Analytics", "User Research", "Figma", "SQL", "A/B Testing"],
				deadline: "2024-02-25",
				salary: "₹20,000 - ₹30,000",
				companySize: "50-100",
				industry: "Technology",
				experience: "0-1 years",
				description: "Learn product management fundamentals and work on real product features that impact thousands of users. Great opportunity to understand the full product lifecycle.",
				requirements: [
					"Analytical thinking and problem-solving",
					"Strong communication skills",
					"Basic design knowledge",
					"Interest in user experience"
				],
				responsibilities: [
					"Conduct user research and analysis",
					"Assist in product roadmap planning",
					"Analyze user behavior data",
					"Collaborate with engineering teams"
				],
				benefits: ["PM mentorship", "₹25K stipend", "Certificate", "Product launch experience"],
				culture: ["Fast-paced", "User-centric", "Collaborative", "Innovation-focused"],
				applied: false,
				bookmarked: false,
				viewed: false,
				trending: true,
				featured: false,
				urgency: "medium",
				applicants: 67,
				views: 432,
				postedDate: "2024-01-15",
				companyRating: 4.0,
				interviewProcess: ["Application Review", "Case Study", "Product Interview", "Culture Fit"],
				successRate: 45,
				averageResponseTime: "7 days",
				similarRoles: 5,
				growthOpportunity: 85,
				learningPotential: 88,
				workLifeBalance: 75,
				mentorshipQuality: 80,
				tags: ["Startup", "Fast-growth"],
				aiRecommendationScore: {
					skillMatch: 75,
					careerAlignment: 95,
					cultureMatch: 85,
					growthPotential: 88,
					locationPreference: 70
				}
			},
			{
				id: 4,
				title: "Full Stack Developer Intern",
				company: "WebTech Ltd",
				companyLogo: "/api/placeholder/40/40",
				location: "Pune",
				remote: "On-site",
				duration: "5 months",
				matchScore: 90,
				aiMatchReason: "Excellent match for your full-stack development goals and tech stack preferences",
				skills: ["React", "Node.js", "PostgreSQL", "Docker", "AWS", "TypeScript", "GraphQL"],
				deadline: "2024-02-18",
				salary: "₹32,000 - ₹42,000",
				companySize: "500-1000",
				industry: "Technology",
				experience: "0-2 years",
				description: "Build end-to-end web applications using modern technologies. Work with experienced developers on enterprise-grade applications.",
				requirements: [
					"Full-stack development knowledge",
					"Database design experience",
					"Cloud computing basics",
					"Version control with Git"
				],
				responsibilities: [
					"Develop full-stack web applications",
					"Design and implement APIs",
					"Work with cloud services",
					"Participate in system architecture decisions"
				],
				benefits: ["Senior developer mentorship", "₹37K stipend", "Certificate", "PPO opportunity", "Tech conference access"],
				culture: ["Tech-focused", "Learning-oriented", "Quality-driven", "Team-collaborative"],
				applied: true,
				bookmarked: true,
				viewed: true,
				trending: false,
				featured: true,
				urgency: "high",
				applicants: 234,
				views: 1890,
				postedDate: "2024-01-08",
				companyRating: 4.3,
				interviewProcess: ["Application Review", "Coding Challenge", "Technical Interview", "System Design", "HR Round"],
				successRate: 72,
				averageResponseTime: "4 days",
				similarRoles: 15,
				growthOpportunity: 92,
				learningPotential: 95,
				workLifeBalance: 80,
				mentorshipQuality: 90,
				tags: ["Hot", "High-salary", "Growth"],
				aiRecommendationScore: {
					skillMatch: 92,
					careerAlignment: 95,
					cultureMatch: 88,
					growthPotential: 90,
					locationPreference: 75
				}
			},
			{
				id: 5,
				title: "UI/UX Design Intern",
				company: "DesignStudio",
				companyLogo: "/api/placeholder/40/40",
				location: "Hyderabad",
				remote: "Hybrid",
				duration: "4 months",
				matchScore: 75,
				aiMatchReason: "Good match based on your design interests and user-focused mindset",
				skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "Wireframing", "Design Systems"],
				deadline: "2024-03-01",
				salary: "₹22,000 - ₹32,000",
				companySize: "50-100",
				industry: "Design",
				experience: "0-1 years",
				description: "Create beautiful and functional user interfaces for web and mobile applications. Work on real client projects with experienced designers.",
				requirements: [
					"Strong design portfolio",
					"Figma proficiency",
					"User-centered design thinking",
					"Understanding of design principles"
				],
				responsibilities: [
					"Create user interface designs",
					"Conduct user research",
					"Build design systems",
					"Prototype user interactions"
				],
				benefits: ["Design tools access", "₹27K stipend", "Certificate", "Portfolio development"],
				culture: ["Creative", "User-focused", "Collaborative", "Design-thinking"],
				applied: false,
				bookmarked: false,
				viewed: false,
				trending: false,
				featured: false,
				urgency: "low",
				applicants: 45,
				views: 289,
				postedDate: "2024-01-18",
				companyRating: 3.9,
				interviewProcess: ["Portfolio Review", "Design Challenge", "Design Interview", "Culture Fit"],
				successRate: 55,
				averageResponseTime: "6 days",
				similarRoles: 7,
				growthOpportunity: 80,
				learningPotential: 85,
				workLifeBalance: 88,
				mentorshipQuality: 82,
				tags: ["Creative", "Portfolio-focused"],
				aiRecommendationScore: {
					skillMatch: 70,
					careerAlignment: 75,
					cultureMatch: 90,
					growthPotential: 80,
					locationPreference: 80
				}
			},
			{
				id: 6,
				title: "DevOps & Cloud Intern",
				company: "CloudOps Inc",
				companyLogo: "/api/placeholder/40/40",
				location: "Chennai",
				remote: "Remote",
				duration: "6 months",
				matchScore: 85,
				aiMatchReason: "Strong alignment with your interest in cloud technologies and automation",
				skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform", "Jenkins"],
				deadline: "2024-02-22",
				salary: "₹28,000 - ₹38,000",
				companySize: "200-500",
				industry: "Technology",
				experience: "0-1 years",
				description: "Learn modern DevOps practices and cloud infrastructure management. Work with cutting-edge cloud technologies and automation tools.",
				requirements: [
					"Linux command line knowledge",
					"Basic scripting skills",
					"Interest in cloud computing",
					"Understanding of software development lifecycle"
				],
				responsibilities: [
					"Manage cloud infrastructure",
					"Build CI/CD pipelines",
					"Monitor system performance",
					"Automate deployment processes"
				],
				benefits: ["Cloud certifications", "₹33K stipend", "Certificate", "Industry exposure"],
				culture: ["Tech-forward", "Automation-focused", "Problem-solving", "Continuous learning"],
				applied: false,
				bookmarked: false,
				viewed: true,
				trending: true,
				featured: false,
				urgency: "medium",
				applicants: 78,
				views: 567,
				postedDate: "2024-01-14",
				companyRating: 4.1,
				interviewProcess: ["Application Review", "Technical Test", "DevOps Interview", "Final Round"],
				successRate: 68,
				averageResponseTime: "5 days",
				similarRoles: 9,
				growthOpportunity: 88,
				learningPotential: 92,
				workLifeBalance: 82,
				mentorshipQuality: 85,
				tags: ["Remote", "Cloud-focused", "Growing"],
				aiRecommendationScore: {
					skillMatch: 82,
					careerAlignment: 85,
					cultureMatch: 85,
					growthPotential: 90,
					locationPreference: 95
				}
			}
		];

		setRecommendations(mockRecommendations);
		setFilteredRecommendations(mockRecommendations);

		// Simulate AI insights generation
		setTimeout(() => {
			setAiInsights({
				totalMatches: mockRecommendations.length,
				perfectMatches: mockRecommendations.filter(r => r.matchScore >= 90).length,
				averageMatchScore: Math.round(mockRecommendations.reduce((acc, r) => acc + r.matchScore, 0) / mockRecommendations.length),
				topSkillDemand: "React",
				recommendedActions: [
					"Complete React certification to improve match scores",
					"Add Machine Learning skills for trending opportunities",
					"Consider remote positions for better work-life balance"
				],
				marketTrends: {
					hotSkills: ["React", "Python", "Machine Learning", "AWS"],
					growingIndustries: ["Technology", "Healthcare", "FinTech"],
					averageSalary: "₹31,500",
					competitionLevel: "Medium"
				}
			});
		}, 1500);

		// Simulate recent activity
		setSavedSearches([
			{ id: 1, name: "React Developer Positions", query: "React", count: 23 },
			{ id: 2, name: "Remote Opportunities", query: "remote", count: 15 }
		]);

		setAlerts([
			{ id: 1, type: "new_match", message: "3 new high-match positions available", time: "2 hours ago" },
			{ id: 2, type: "deadline", message: "Application deadline approaching for 2 positions", time: "1 day ago" }
		]);

	}, []);

	useEffect(() => {
		filterAndSortRecommendations();
	}, [recommendations, searchTerm, filters, sortBy]);

	const filterAndSortRecommendations = () => {
		let filtered = recommendations;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(rec) =>
					rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					rec.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
					rec.skills.some((skill) =>
						skill.toLowerCase().includes(searchTerm.toLowerCase())
					) ||
					rec.industry.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Apply filters
		Object.keys(filters).forEach(key => {
			const value = filters[key];
			if (value) {
				switch (key) {
					case 'location':
						filtered = filtered.filter(rec => rec.location === value);
						break;
					case 'duration':
						filtered = filtered.filter(rec => rec.duration === value);
						break;
					case 'skills':
						if (value.length > 0) {
							filtered = filtered.filter(rec =>
								value.some(skill => rec.skills.includes(skill))
							);
						}
						break;
					case 'matchScore':
						filtered = filtered.filter(rec => rec.matchScore >= value);
						break;
					case 'salaryRange':
						// Simple salary range filtering
						filtered = filtered.filter(rec => rec.salary.includes(value.split('-')[0]));
						break;
					case 'companySize':
						filtered = filtered.filter(rec => rec.companySize === value);
						break;
					case 'remote':
						filtered = filtered.filter(rec => rec.remote === value);
						break;
					case 'industry':
						filtered = filtered.filter(rec => rec.industry === value);
						break;
				}
			}
		});

		// Sort
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "matchScore":
					return b.matchScore - a.matchScore;
				case "deadline":
					return new Date(a.deadline) - new Date(b.deadline);
				case "company":
					return a.company.localeCompare(b.company);
				case "salary":
					return b.salary.localeCompare(a.salary);
				case "posted":
					return new Date(b.postedDate) - new Date(a.postedDate);
				default:
					return 0;
			}
		});

		setFilteredRecommendations(filtered);
	};

	const handleApply = (recId) => {
		setRecommendations(prev =>
			prev.map(rec => rec.id === recId ? { ...rec, applied: true } : rec)
		);
	};

	const handleBookmark = (recId) => {
		setRecommendations(prev =>
			prev.map(rec =>
				rec.id === recId ? { ...rec, bookmarked: !rec.bookmarked } : rec
			)
		);
	};

	const handleView = (recommendation) => {
		// Mark as viewed
		setRecommendations(prev =>
			prev.map(rec =>
				rec.id === recommendation.id ? { ...rec, viewed: true } : rec
			)
		);

		// Add to recently viewed
		setRecentlyViewed(prev => {
			const updated = [recommendation, ...prev.filter(r => r.id !== recommendation.id)];
			return updated.slice(0, 5);
		});

		setSelectedRecommendation(recommendation);
	};

	const analyzeRecommendations = () => {
		setIsAnalyzing(true);
		setTimeout(() => {
			setIsAnalyzing(false);
			// Generate fresh AI insights
			setAiInsights(prev => ({
				...prev,
				lastAnalyzed: new Date().toLocaleString(),
				personalizedTips: [
					"Your profile shows strong technical skills - consider highlighting leadership experience",
					"Companies in your target locations are actively hiring for your skill set",
					"Consider applying to 3-5 positions per week for optimal results"
				]
			}));
		}, 2000);
	};

	const getMatchScoreColor = (score) => {
		if (score >= 90) return "text-green-600 bg-green-100";
		if (score >= 80) return "text-blue-600 bg-blue-100";
		if (score >= 70) return "text-yellow-600 bg-yellow-100";
		return "text-red-600 bg-red-100";
	};

	const getUrgencyColor = (urgency) => {
		switch (urgency) {
			case 'high': return 'text-red-600 bg-red-100';
			case 'medium': return 'text-yellow-600 bg-yellow-100';
			case 'low': return 'text-green-600 bg-green-100';
			default: return 'text-gray-600 bg-gray-100';
		}
	};

	const locations = [...new Set(recommendations.map(rec => rec.location))];
	const durations = [...new Set(recommendations.map(rec => rec.duration))];
	const allSkills = [...new Set(recommendations.flatMap(rec => rec.skills))];
	const companySizes = [...new Set(recommendations.map(rec => rec.companySize))];
	const industries = [...new Set(recommendations.map(rec => rec.industry))];
	const remoteOptions = [...new Set(recommendations.map(rec => rec.remote))];

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Enhanced Header with AI Insights */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<div className="flex items-center justify-between mb-4">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 flex items-center">
								<Sparkles className="w-8 h-8 text-primary mr-3" />
								AI-Powered Recommendations
							</h1>
							<p className="text-gray-600 mt-2">
								Discover personalized opportunities tailored to your profile and career goals
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<button
								onClick={() => setShowPreferences(true)}
								className="btn-secondary flex items-center space-x-2"
							>
								<Target className="w-5 h-5" />
								<span>Preferences</span>
							</button>
							<button
								onClick={analyzeRecommendations}
								disabled={isAnalyzing}
								className="btn-primary flex items-center space-x-2"
							>
								{isAnalyzing ? (
									<RefreshCw className="w-5 h-5 animate-spin" />
								) : (
									<Brain className="w-5 h-5" />
								)}
								<span>{isAnalyzing ? 'Analyzing...' : 'AI Analysis'}</span>
							</button>
						</div>
					</div>

					{/* AI Insights Dashboard */}
					{aiInsights && (
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="grid md:grid-cols-4 gap-4 mb-6"
						>
							<div className="card text-center bg-gradient-to-r from-blue-50 to-indigo-50">
								<div className="text-2xl font-bold text-primary mb-1">
									{aiInsights.totalMatches}
								</div>
								<div className="text-sm text-gray-600">Total Matches</div>
							</div>
							<div className="card text-center bg-gradient-to-r from-green-50 to-emerald-50">
								<div className="text-2xl font-bold text-green-600 mb-1">
									{aiInsights.perfectMatches}
								</div>
								<div className="text-sm text-gray-600">Perfect Matches</div>
							</div>
							<div className="card text-center bg-gradient-to-r from-purple-50 to-pink-50">
								<div className="text-2xl font-bold text-purple-600 mb-1">
									{aiInsights.averageMatchScore}%
								</div>
								<div className="text-sm text-gray-600">Avg Match Score</div>
							</div>
							<div className="card text-center bg-gradient-to-r from-yellow-50 to-orange-50">
								<div className="text-2xl font-bold text-orange-600 mb-1">
									{aiInsights.marketTrends.competitionLevel}
								</div>
								<div className="text-sm text-gray-600">Competition</div>
							</div>
						</motion.div>
					)}
				</motion.div>

				{/* Enhanced Search and Filters */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="card mb-8"
				>
					<div className="flex flex-col lg:flex-row gap-4 mb-4">
						{/* Enhanced Search */}
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								placeholder="Search by title, company, skills, or industry..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="input-field pl-10 pr-12"
							/>
							{searchTerm && (
								<button
									onClick={() => setSearchTerm("")}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
								>
									<X className="w-5 h-5" />
								</button>
							)}
						</div>

						{/* View Mode Toggle */}
						<div className="flex bg-gray-100 rounded-lg p-1">
							<button
								onClick={() => setViewMode("grid")}
								className={`px-3 py-2 rounded-md text-sm ${
									viewMode === "grid" 
										? "bg-white text-primary shadow-sm" 
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								<BarChart3 className="w-4 h-4" />
							</button>
							<button
								onClick={() => setViewMode("list")}
								className={`px-3 py-2 rounded-md text-sm ${
									viewMode === "list" 
										? "bg-white text-primary shadow-sm" 
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								<Eye className="w-4 h-4" />
							</button>
						</div>

						{/* Filter Toggle */}
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="btn-secondary flex items-center space-x-2"
						>
							<FilterIcon className="w-5 h-5" />
							<span>Filters</span>
							<span className={`w-2 h-2 rounded-full ${Object.values(filters).some(f => f && (Array.isArray(f) ? f.length > 0 : true)) ? 'bg-primary' : 'bg-transparent'}`}></span>
							<ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
						</button>

						{/* Sort */}
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="input-field min-w-[180px]"
						>
							<option value="matchScore">Sort by Match Score</option>
							<option value="deadline">Sort by Deadline</option>
							<option value="company">Sort by Company</option>
							<option value="salary">Sort by Salary</option>
							<option value="posted">Sort by Posted Date</option>
						</select>
					</div>

					{/* Advanced Filters Panel */}
					<AnimatePresence>
						{showFilters && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="border-t border-gray-200 pt-6"
							>
								<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
									{/* Location Filter */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											<MapPin className="w-4 h-4 inline mr-1" />
											Location
										</label>
										<select
											value={filters.location}
											onChange={(e) => setFilters({ ...filters, location: e.target.value })}
											className="input-field"
										>
											<option value="">All Locations</option>
											{locations.map((location) => (
												<option key={location} value={location}>
													{location}
												</option>
											))}
										</select>
									</div>

									{/* Remote Work */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											<Globe className="w-4 h-4 inline mr-1" />
											Work Mode
										</label>
										<select
											value={filters.remote}
											onChange={(e) => setFilters({ ...filters, remote: e.target.value })}
											className="input-field"
										>
											<option value="">All Modes</option>
											{remoteOptions.map((remote) => (
												<option key={remote} value={remote}>
													{remote}
												</option>
											))}
										</select>
									</div>

									{/* Duration Filter */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											<Clock className="w-4 h-4 inline mr-1" />
											Duration
										</label>
										<select
											value={filters.duration}
											onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
											className="input-field"
										>
											<option value="">All Durations</option>
											{durations.map((duration) => (
												<option key={duration} value={duration}>
													{duration}
												</option>
											))}
										</select>
									</div>

									{/* Industry Filter */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											<Briefcase className="w-4 h-4 inline mr-1" />
											Industry
										</label>
										<select
											value={filters.industry}
											onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
											className="input-field"
										>
											<option value="">All Industries</option>
											{industries.map((industry) => (
												<option key={industry} value={industry}>
													{industry}
												</option>
											))}
										</select>
									</div>

									{/* Company Size */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											<Building2 className="w-4 h-4 inline mr-1" />
											Company Size
										</label>
										<select
											value={filters.companySize}
											onChange={(e) => setFilters({ ...filters, companySize: e.target.value })}
											className="input-field"
										>
											<option value="">All Sizes</option>
											{companySizes.map((size) => (
												<option key={size} value={size}>
													{size}
												</option>
											))}
										</select>
									</div>

									{/* Match Score Filter */}
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											<Target className="w-4 h-4 inline mr-1" />
											Min Match Score: {filters.matchScore}%
										</label>
										<input
											type="range"
											min="0"
											max="100"
											value={filters.matchScore}
											onChange={(e) => setFilters({ ...filters, matchScore: parseInt(e.target.value) })}
											className="w-full accent-primary"
										/>
									</div>

									{/* Skills Filter */}
									<div className="lg:col-span-2">
										<label className="block text-sm font-medium text-gray-700 mb-2">
											<Code className="w-4 h-4 inline mr-1" />
											Skills
										</label>
										<div className="max-h-20 overflow-y-auto">
											<select
												multiple
												value={filters.skills}
												onChange={(e) => setFilters({ 
													...filters, 
													skills: Array.from(e.target.selectedOptions, option => option.value) 
												})}
												className="input-field h-20"
											>
												{allSkills.map((skill) => (
													<option key={skill} value={skill}>
														{skill}
													</option>
												))}
											</select>
										</div>
									</div>
								</div>

								{/* Filter Actions */}
								<div className="flex items-center justify-between">
									<div className="text-sm text-gray-500">
										{Object.values(filters).filter(f => f && (Array.isArray(f) ? f.length > 0 : true)).length} filters active
									</div>
									<div className="flex items-center space-x-3">
										<button
											onClick={() => setFilters({
												location: "", duration: "", skills: [], matchScore: 0,
												salaryRange: "", companySize: "", remote: "", experience: "", industry: ""
											})}
											className="text-primary hover:text-blue-700 font-medium text-sm"
										>
											Clear All Filters
										</button>
										<button
											onClick={() => setShowFilters(false)}
											className="btn-secondary text-sm px-4 py-2"
										>
											Apply Filters
										</button>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				{/* Results Info and Quick Actions */}
				<motion.div 
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="flex items-center justify-between mb-6"
				>
					<div className="flex items-center space-x-4">
						<p className="text-gray-600">
							Showing <span className="font-semibold">{filteredRecommendations.length}</span> of <span className="font-semibold">{recommendations.length}</span> recommendations
						</p>
						{filteredRecommendations.length !== recommendations.length && (
							<button
								onClick={() => {
									setSearchTerm("");
									setFilters({
										location: "", duration: "", skills: [], matchScore: 0,
										salaryRange: "", companySize: "", remote: "", experience: "", industry: ""
									});
								}}
								className="text-primary hover:text-blue-700 text-sm font-medium"
							>
								Show All
							</button>
						)}
					</div>
					<div className="flex items-center space-x-3">
						<button className="btn-secondary text-sm px-3 py-2 flex items-center space-x-1">
							<Bell className="w-4 h-4" />
							<span>Set Alert</span>
						</button>
						<button className="btn-secondary text-sm px-3 py-2 flex items-center space-x-1">
							<Plus className="w-4 h-4" />
							<span>Save Search</span>
						</button>
					</div>
				</motion.div>

				{/* Recommendations Grid/List */}
				<div className={viewMode === "grid" ? "grid lg:grid-cols-2 gap-6" : "space-y-4"}>
					<AnimatePresence>
						{filteredRecommendations.map((rec, index) => (
							<motion.div
								key={rec.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ delay: index * 0.1 }}
								className={`card hover:shadow-lg transition-all duration-300 relative overflow-hidden ${
									rec.featured ? 'ring-2 ring-primary ring-opacity-20' : ''
								}`}
								onClick={() => handleView(rec)}
							>
								{/* Priority Indicators */}
								<div className="absolute top-4 right-4 flex items-center space-x-2">
									{rec.featured && (
										<span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
											Featured
										</span>
									)}
									{rec.trending && (
										<span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full flex items-center">
											<TrendingUp className="w-3 h-3 mr-1" />
											Trending
										</span>
									)}
									<span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(rec.urgency)}`}>
										{rec.urgency.charAt(0).toUpperCase() + rec.urgency.slice(1)} Priority
									</span>
								</div>

								{/* Company Info */}
								<div className="flex items-start justify-between mb-4 pr-24">
									<div className="flex items-center space-x-3">
										<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
											<Building2 className="w-6 h-6 text-gray-600" />
										</div>
										<div>
											<h3 className="text-xl font-semibold text-gray-900 mb-1">
												{rec.title}
											</h3>
											<div className="flex items-center space-x-2 text-gray-600">
												<span className="font-medium">{rec.company}</span>
												<div className="flex items-center">
													<Star className="w-4 h-4 text-yellow-400 fill-current" />
													<span className="text-sm ml-1">{rec.companyRating}</span>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Key Details */}
								<div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
									<div className="flex items-center space-x-2">
										<MapPin className="w-4 h-4" />
										<span>{rec.location}</span>
										{rec.remote !== "On-site" && (
											<span className="text-green-600">({rec.remote})</span>
										)}
									</div>
									<div className="flex items-center space-x-2">
										<Clock className="w-4 h-4" />
										<span>{rec.duration}</span>
									</div>
									<div className="flex items-center space-x-2">
										<DollarSign className="w-4 h-4" />
										<span>{rec.salary}</span>
									</div>
									<div className="flex items-center space-x-2">
										<Users className="w-4 h-4" />
										<span>{rec.applicants} applicants</span>
									</div>
								</div>

								{/* AI Match Reason */}
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
									<div className="flex items-start space-x-2">
										<Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
										<div>
											<div className="text-xs font-medium text-blue-800 mb-1">AI Match Insight</div>
											<div className="text-sm text-blue-700">{rec.aiMatchReason}</div>
										</div>
									</div>
								</div>

								{/* Description */}
								<p className="text-gray-600 mb-4 line-clamp-2">{rec.description}</p>

								{/* Skills */}
								<div className="mb-4">
									<h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
									<div className="flex flex-wrap gap-2">
										{rec.skills.slice(0, 5).map((skill, index) => (
											<span
												key={index}
												className={`px-2 py-1 text-xs rounded-full ${
													personalPreferences.careerGoals.some(goal => 
														skill.toLowerCase().includes(goal.toLowerCase().split(' ')[0])
													) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
												}`}
											>
												{skill}
											</span>
										))}
										{rec.skills.length > 5 && (
											<span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
												+{rec.skills.length - 5} more
											</span>
										)}
									</div>
								</div>

								{/* Match Score and Analytics */}
								<div className="flex items-center justify-between mb-4">
									<div className="flex items-center space-x-4">
										<div className="text-center">
											<div className={`text-2xl font-bold ${getMatchScoreColor(rec.matchScore).split(' ')[0]}`}>
												{rec.matchScore}%
											</div>
											<div className="text-xs text-gray-500">Match Score</div>
										</div>
										<div className="text-center">
											<div className="text-lg font-bold text-gray-900">
												{rec.successRate}%
											</div>
											<div className="text-xs text-gray-500">Success Rate</div>
										</div>
										<div className="text-center">
											<div className="text-lg font-bold text-gray-900">
												{rec.averageResponseTime}
											</div>
											<div className="text-xs text-gray-500">Response Time</div>
										</div>
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center justify-between pt-4 border-t border-gray-200">
									<div className="flex items-center space-x-2">
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleBookmark(rec.id);
											}}
											className={`p-2 rounded-lg transition-colors ${
												rec.bookmarked
													? "text-yellow-500 bg-yellow-100"
													: "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
											}`}
										>
											<Bookmark className={`w-5 h-5 ${rec.bookmarked ? "fill-current" : ""}`} />
										</button>
										<button className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
											<Share2 className="w-5 h-5" />
										</button>
									</div>
									<div className="flex items-center space-x-2">
										<div className="text-sm text-gray-500">
											Apply by {new Date(rec.deadline).toLocaleDateString()}
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleApply(rec.id);
											}}
											disabled={rec.applied}
											className={`btn-primary text-sm px-4 py-2 ${
												rec.applied ? "bg-green-600 hover:bg-green-700" : ""
											} disabled:opacity-50 disabled:cursor-not-allowed`}
										>
											{rec.applied ? (
												<>
													<CheckCircle className="w-4 h-4 mr-1" />
													Applied
												</>
											) : (
												<>
													<ArrowRight className="w-4 h-4 mr-1" />
													Apply Now
												</>
											)}
										</button>
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>

				{/* No Results State */}
				{filteredRecommendations.length === 0 && (
					<motion.div 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-12"
					>
						<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Search className="w-12 h-12 text-gray-400" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							No recommendations found
						</h3>
						<p className="text-gray-600 mb-6">
							Try adjusting your search criteria or filters to find more opportunities.
						</p>
						<div className="flex items-center justify-center space-x-4">
							<button className="btn-primary" onClick={() => {
								setSearchTerm("");
								setFilters({
									location: "", duration: "", skills: [], matchScore: 0,
									salaryRange: "", companySize: "", remote: "", experience: "", industry: ""
								});
							}}>
								Clear All Filters
							</button>
							<button className="btn-secondary" onClick={() => setShowPreferences(true)}>
								Update Preferences
							</button>
						</div>
					</motion.div>
				)}

				{/* Recommendation Detail Modal */}
				<AnimatePresence>
					{selectedRecommendation && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
							onClick={() => setSelectedRecommendation(null)}
						>
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
								onClick={(e) => e.stopPropagation()}
							>
								{/* Modal content would be here - comprehensive job details, application form, etc. */}
								<div className="p-6">
									<div className="flex items-center justify-between mb-6">
										<h2 className="text-2xl font-bold text-gray-900">
											{selectedRecommendation.title}
										</h2>
										<button
											onClick={() => setSelectedRecommendation(null)}
											className="text-gray-400 hover:text-gray-600"
										>
											<X className="w-6 h-6" />
										</button>
									</div>
									{/* Detailed job information would go here */}
									<div className="text-gray-600">
										Detailed view of {selectedRecommendation.title} at {selectedRecommendation.company}
									</div>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Preferences Modal */}
				<AnimatePresence>
					{showPreferences && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
							onClick={() => setShowPreferences(false)}
						>
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="p-6">
									<div className="flex items-center justify-between mb-6">
										<h2 className="text-2xl font-bold text-gray-900">
											Job Preferences
										</h2>
										<button
											onClick={() => setShowPreferences(false)}
											className="text-gray-400 hover:text-gray-600"
										>
											<X className="w-6 h-6" />
										</button>
									</div>
									{/* Preferences form would go here */}
									<div className="space-y-6">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Preferred Industries
											</label>
											<div className="flex flex-wrap gap-2">
												{personalPreferences.preferredIndustries.map((industry, index) => (
													<span key={index} className="px-3 py-1 bg-primary text-white text-sm rounded-full">
														{industry}
													</span>
												))}
											</div>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">
												Career Goals
											</label>
											<div className="flex flex-wrap gap-2">
												{personalPreferences.careerGoals.map((goal, index) => (
													<span key={index} className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
														{goal}
													</span>
												))}
											</div>
										</div>
									</div>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
};

export default EnhancedRecommendations;
