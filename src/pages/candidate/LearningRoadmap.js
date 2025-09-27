import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	BookOpen,
	CheckCircle,
	Clock,
	Play,
	ExternalLink,
	X,
	Target,
	Trophy,
	Star,
	TrendingUp,
	Users,
	Award,
	Brain,
	Lightbulb,
	Zap,
	Code,
	Database,
	Globe,
	Shield,
	Briefcase,
	GraduationCap,
	Calendar,
	ChevronRight,
	ChevronDown,
	ChevronUp,
	ArrowRight,
	Plus,
	Minus,
	Filter,
	Search,
	BarChart3,
	PieChart,
	Activity,
	Timer,
	RefreshCw,
	Download,
	Share2,
	Bookmark,
	Bell,
	Settings,
	Eye,
	Heart,
	MessageCircle,
	ThumbsUp,
	Flag,
	RotateCcw,
	Pause,
	FastForward,
	Volume2,
	Maximize2,
	Minimize2,
	Info,
	AlertCircle,
	CheckCircle2,
	XCircle,
	HelpCircle,
	Sparkles,
	Rocket,
	Map,
	Navigation,
	Compass,
	Route,
	MapPin,
	Milestone,
	LineChart,
	TrendingDown
} from "lucide-react";

const EnhancedLearningRoadmap = () => {
	const [roadmap, setRoadmap] = useState([]);
	const [selectedSkill, setSelectedSkill] = useState(null);
	const [progress, setProgress] = useState({});
	const [filter, setFilter] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const [sortBy, setSortBy] = useState("priority");
	const [viewMode, setViewMode] = useState("cards");
	const [showAnalytics, setShowAnalytics] = useState(false);
	const [currentLearningSession, setCurrentLearningSession] = useState(null);
	const [aiRecommendations, setAiRecommendations] = useState(null);
	const [learningGoals, setLearningGoals] = useState([]);
	const [streakData, setStreakData] = useState({ current: 0, longest: 0 });
	const [weeklyTarget, setWeeklyTarget] = useState(10);
	const [completedThisWeek, setCompletedThisWeek] = useState(7);
	const [skillAssessments, setSkillAssessments] = useState({});
	const [certificates, setCertificates] = useState([]);
	const [studyGroups, setStudyGroups] = useState([]);
	const [mentorshipOpportunities, setMentorshipOpportunities] = useState([]);
	const [interactiveContent, setInteractiveContent] = useState([]);

	useEffect(() => {
		// Enhanced mock data with comprehensive learning system
		const mockRoadmap = [
			{
				id: 1,
				skill: "JavaScript Mastery",
				category: "Programming",
				currentLevel: 3,
				targetLevel: 5,
				maxLevel: 5,
				description: "Master JavaScript fundamentals and advanced concepts for modern web development",
				impact: "+35%",
				priority: "High",
				estimatedTime: "4-6 weeks",
				difficulty: "Intermediate",
				prerequisite: null,
				nextSkills: ["React", "Node.js"],
				marketDemand: 95,
				salaryImpact: "+₹15,000",
				aiPersonalization: "Tailored based on your frontend development goals and current React knowledge",
				resources: [
					{
						id: 1,
						title: "JavaScript Fundamentals Bootcamp",
						type: "Course",
						provider: "CodeAcademy Pro",
						duration: "2 weeks",
						difficulty: "Beginner",
						completed: true,
						rating: 4.8,
						reviews: 15420,
						price: "Free",
						url: "#",
						format: "Interactive",
						certificate: true,
						hands_on_projects: 5,
						completion_date: "2024-01-15",
						time_spent: "24 hours"
					},
					{
						id: 2,
						title: "ES6+ Features Deep Dive",
						type: "Tutorial",
						provider: "JavaScript.info",
						duration: "1 week",
						difficulty: "Intermediate",
						completed: true,
						rating: 4.9,
						reviews: 8730,
						price: "Free",
						url: "#",
						format: "Article Series",
						certificate: false,
						hands_on_projects: 3,
						completion_date: "2024-01-22",
						time_spent: "16 hours"
					},
					{
						id: 3,
						title: "Advanced JavaScript Patterns & Performance",
						type: "Course",
						provider: "Udemy",
						duration: "3 weeks",
						difficulty: "Advanced",
						completed: false,
						rating: 4.7,
						reviews: 12650,
						price: "₹1,999",
						url: "#",
						format: "Video + Exercises",
						certificate: true,
						hands_on_projects: 8,
						estimated_completion: "2024-03-01"
					},
					{
						id: 4,
						title: "JavaScript Testing with Jest",
						type: "Workshop",
						provider: "Frontend Masters",
						duration: "1 week",
						difficulty: "Intermediate",
						completed: false,
						rating: 4.6,
						reviews: 3240,
						price: "₹2,499",
						url: "#",
						format: "Live + Recording",
						certificate: true,
						hands_on_projects: 4
					}
				],
				milestones: [
					{
						id: 1,
						title: "Complete Fundamentals",
						description: "Master basic JavaScript syntax and concepts",
						completed: true,
						date: "2024-01-15",
						points: 100,
						badge: "Foundation Master"
					},
					{
						id: 2,
						title: "Learn ES6+ Features",
						description: "Understand modern JavaScript features",
						completed: true,
						date: "2024-01-22",
						points: 150,
						badge: "Modern JS Developer"
					},
					{
						id: 3,
						title: "Build 3 Interactive Projects",
						description: "Apply knowledge in real-world projects",
						completed: false,
						target_date: "2024-02-15",
						points: 200,
						badge: "JavaScript Builder",
						current_progress: 1,
						total_required: 3
					},
					{
						id: 4,
						title: "Pass Advanced Assessment",
						description: "Score 85+ on comprehensive JavaScript test",
						completed: false,
						target_date: "2024-03-01",
						points: 250,
						badge: "JavaScript Expert"
					}
				],
				projects: [
					{
						id: 1,
						title: "Interactive Task Manager",
						difficulty: "Intermediate",
						estimated_time: "8 hours",
						completed: true,
						technologies: ["Vanilla JS", "Local Storage", "CSS3"],
						demo_url: "#",
						github_url: "#"
					},
					{
						id: 2,
						title: "Weather Dashboard API",
						difficulty: "Intermediate",
						estimated_time: "12 hours",
						completed: false,
						technologies: ["Fetch API", "JSON", "Chart.js"],
						requirements: ["API Integration", "Data Visualization", "Responsive Design"]
					}
				],
				assessments: [
					{
						id: 1,
						title: "JavaScript Fundamentals Quiz",
						questions: 30,
						time_limit: "45 minutes",
						completed: true,
						score: 88,
						max_score: 100,
						completed_date: "2024-01-16"
					},
					{
						id: 2,
						title: "Advanced Concepts Challenge",
						questions: 50,
						time_limit: "90 minutes",
						completed: false,
						unlock_condition: "Complete ES6+ Tutorial"
					}
				],
				studyPlan: {
					weekly_hours: 8,
					preferred_time: "Evening",
					learning_style: "Visual + Hands-on",
					next_session: "2024-02-01T18:00:00Z"
				},
				communityStats: {
					learners: 45230,
					discussions: 1250,
					success_rate: 78
				}
			},
			{
				id: 2,
				skill: "React Development",
				category: "Frontend",
				currentLevel: 2,
				targetLevel: 4,
				maxLevel: 5,
				description: "Build modern, scalable user interfaces with React and its ecosystem",
				impact: "+40%",
				priority: "High",
				estimatedTime: "6-8 weeks",
				difficulty: "Intermediate",
				prerequisite: "JavaScript",
				nextSkills: ["Next.js", "React Native"],
				marketDemand: 92,
				salaryImpact: "+₹20,000",
				aiPersonalization: "Perfect match for your full-stack development goals and current JavaScript skills",
				resources: [
					{
						id: 1,
						title: "React Fundamentals",
						type: "Course",
						provider: "React Training",
						duration: "3 weeks",
						difficulty: "Beginner",
						completed: true,
						rating: 4.9,
						reviews: 23450,
						price: "₹2,999",
						url: "#",
						format: "Interactive + Projects",
						certificate: true,
						hands_on_projects: 6,
						completion_date: "2024-01-10"
					},
					{
						id: 2,
						title: "React Hooks Masterclass",
						type: "Tutorial",
						provider: "YouTube",
						duration: "1.5 weeks",
						difficulty: "Intermediate",
						completed: false,
						rating: 4.7,
						reviews: 8960,
						price: "Free",
						url: "#",
						format: "Video Series",
						certificate: false,
						hands_on_projects: 4
					},
					{
						id: 3,
						title: "State Management with Redux Toolkit",
						type: "Course",
						provider: "Egghead.io",
						duration: "2 weeks",
						difficulty: "Intermediate",
						completed: false,
						rating: 4.8,
						reviews: 5680,
						price: "₹1,999",
						url: "#",
						format: "Video + Code",
						certificate: true,
						hands_on_projects: 3
					}
				],
				milestones: [
					{
						id: 1,
						title: "Complete React Basics",
						completed: true,
						date: "2024-01-10",
						points: 120,
						badge: "React Beginner"
					},
					{
						id: 2,
						title: "Build First React App",
						completed: false,
						target_date: "2024-02-05",
						points: 180,
						badge: "React Developer",
						current_progress: 30,
						total_required: 100
					},
					{
						id: 3,
						title: "Master State Management",
						completed: false,
						target_date: "2024-02-20",
						points: 220,
						badge: "State Master"
					},
					{
						id: 4,
						title: "Deploy Production App",
						completed: false,
						target_date: "2024-03-10",
						points: 300,
						badge: "React Professional"
					}
				],
				projects: [
					{
						id: 1,
						title: "E-commerce Product Catalog",
						difficulty: "Intermediate",
						estimated_time: "20 hours",
						completed: false,
						technologies: ["React", "Context API", "CSS Modules"],
						requirements: ["Component Architecture", "State Management", "API Integration"]
					}
				]
			},
			{
				id: 3,
				skill: "Node.js Backend",
				category: "Backend",
				currentLevel: 1,
				targetLevel: 3,
				maxLevel: 5,
				description: "Build robust server-side applications and APIs with Node.js",
				impact: "+30%",
				priority: "Medium",
				estimatedTime: "5-7 weeks",
				difficulty: "Intermediate",
				prerequisite: "JavaScript",
				nextSkills: ["Express.js", "MongoDB"],
				marketDemand: 88,
				salaryImpact: "+₹18,000",
				aiPersonalization: "Complements your frontend skills for full-stack development capability",
				resources: [
					{
						id: 1,
						title: "Node.js Complete Guide",
						type: "Course",
						provider: "Node University",
						duration: "4 weeks",
						difficulty: "Beginner",
						completed: false,
						rating: 4.7,
						reviews: 18760,
						price: "₹3,499",
						url: "#",
						format: "Video + Labs",
						certificate: true,
						hands_on_projects: 8
					},
					{
						id: 2,
						title: "RESTful API Development",
						type: "Workshop",
						provider: "API Academy",
						duration: "2 weeks",
						difficulty: "Intermediate",
						completed: false,
						rating: 4.8,
						reviews: 7240,
						price: "₹2,499",
						url: "#",
						format: "Live Coding",
						certificate: true,
						hands_on_projects: 5
					}
				],
				milestones: [
					{
						id: 1,
						title: "Learn Node.js Basics",
						completed: false,
						target_date: "2024-02-15",
						points: 100,
						badge: "Node Beginner"
					},
					{
						id: 2,
						title: "Build REST API",
						completed: false,
						target_date: "2024-03-01",
						points: 200,
						badge: "API Developer"
					},
					{
						id: 3,
						title: "Database Integration",
						completed: false,
						target_date: "2024-03-15",
						points: 250,
						badge: "Backend Developer"
					}
				]
			},
			{
				id: 4,
				skill: "Machine Learning Fundamentals",
				category: "Data Science",
				currentLevel: 0,
				targetLevel: 3,
				maxLevel: 5,
				description: "Understand core ML concepts and implement basic algorithms",
				impact: "+50%",
				priority: "High",
				estimatedTime: "8-10 weeks",
				difficulty: "Advanced",
				prerequisite: "Python",
				nextSkills: ["Deep Learning", "MLOps"],
				marketDemand: 96,
				salaryImpact: "+₹25,000",
				aiPersonalization: "High-growth skill that aligns with industry trends and your technical background",
				resources: [
					{
						id: 1,
						title: "Machine Learning A-Z",
						type: "Course",
						provider: "SuperDataScience",
						duration: "6 weeks",
						difficulty: "Beginner",
						completed: false,
						rating: 4.9,
						reviews: 89340,
						price: "₹4,999",
						url: "#",
						format: "Theory + Practice",
						certificate: true,
						hands_on_projects: 12
					},
					{
						id: 2,
						title: "Python for Data Science",
						type: "Bootcamp",
						provider: "DataCamp",
						duration: "3 weeks",
						difficulty: "Beginner",
						completed: false,
						rating: 4.6,
						reviews: 34560,
						price: "₹2,999",
						url: "#",
						format: "Interactive",
						certificate: true,
						hands_on_projects: 15
					}
				],
				milestones: [
					{
						id: 1,
						title: "Learn Python for ML",
						completed: false,
						target_date: "2024-03-01",
						points: 150,
						badge: "ML Beginner"
					},
					{
						id: 2,
						title: "Implement First Algorithm",
						completed: false,
						target_date: "2024-03-20",
						points: 200,
						badge: "Algorithm Implementer"
					},
					{
						id: 3,
						title: "Complete ML Project",
						completed: false,
						target_date: "2024-04-15",
						points: 300,
						badge: "ML Practitioner"
					}
				]
			},
			{
				id: 5,
				skill: "Cloud Computing (AWS)",
				category: "DevOps",
				currentLevel: 0,
				targetLevel: 2,
				maxLevel: 5,
				description: "Learn cloud infrastructure and deployment on AWS platform",
				impact: "+35%",
				priority: "Medium",
				estimatedTime: "4-6 weeks",
				difficulty: "Intermediate",
				prerequisite: null,
				nextSkills: ["Kubernetes", "Docker"],
				marketDemand: 89,
				salaryImpact: "+₹22,000",
				aiPersonalization: "Essential for modern application deployment and scalability",
				resources: [
					{
						id: 1,
						title: "AWS Cloud Practitioner",
						type: "Certification",
						provider: "AWS Training",
						duration: "3 weeks",
						difficulty: "Beginner",
						completed: false,
						rating: 4.8,
						reviews: 45680,
						price: "₹5,999",
						url: "#",
						format: "Online + Exam",
						certificate: true,
						hands_on_projects: 10
					}
				],
				milestones: [
					{
						id: 1,
						title: "AWS Fundamentals",
						completed: false,
						target_date: "2024-03-15",
						points: 120,
						badge: "Cloud Beginner"
					},
					{
						id: 2,
						title: "Deploy First Application",
						completed: false,
						target_date: "2024-04-01",
						points: 200,
						badge: "Cloud Deployer"
					}
				]
			}
		];

		setRoadmap(mockRoadmap);

		// Calculate comprehensive progress
		const progressData = {};
		mockRoadmap.forEach((skill) => {
			const completedResources = skill.resources.filter(r => r.completed).length;
			const totalResources = skill.resources.length;
			const completedMilestones = skill.milestones.filter(m => m.completed).length;
			const totalMilestones = skill.milestones.length;
			const completedProjects = skill.projects ? skill.projects.filter(p => p.completed).length : 0;
			const totalProjects = skill.projects ? skill.projects.length : 0;

			progressData[skill.id] = {
				resources: Math.round((completedResources / totalResources) * 100),
				milestones: Math.round((completedMilestones / totalMilestones) * 100),
				projects: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0,
				overall: Math.round(
					((completedResources + completedMilestones + completedProjects) / 
					(totalResources + totalMilestones + totalProjects)) * 100
				),
				skillLevel: Math.round((skill.currentLevel / skill.maxLevel) * 100),
				timeSpent: skill.resources.reduce((acc, r) => acc + (r.time_spent ? parseInt(r.time_spent) : 0), 0),
				points: skill.milestones.reduce((acc, m) => acc + (m.completed ? m.points : 0), 0)
			};
		});

		setProgress(progressData);

		// AI Recommendations
		setTimeout(() => {
			setAiRecommendations({
				nextBestSkill: "React Development",
				reasoning: "Based on your JavaScript progress and career goals in full-stack development",
				weeklyRecommendation: "Focus 8 hours on React Hooks this week",
				skillGaps: [
					{ skill: "Testing", impact: "High", reason: "Essential for professional development" },
					{ skill: "TypeScript", impact: "Medium", reason: "Improves code quality and marketability" }
				],
				careerPath: {
					current: "Frontend Developer",
					next: "Full-Stack Developer",
					timeline: "3-4 months",
					requiredSkills: ["React", "Node.js", "Databases"]
				},
				marketInsights: {
					demandTrend: "Increasing",
					salaryGrowth: "+15%",
					jobOpenings: 2340,
					topCompaniesHiring: ["TCS", "Infosys", "Wipro", "Accenture"]
				}
			});
		}, 2000);

		// Learning Goals
		setLearningGoals([
			{
				id: 1,
				title: "Master React Development",
				target_date: "2024-03-31",
				progress: 35,
				skills: ["React", "Redux", "Testing"],
				priority: "High"
			},
			{
				id: 2,
				title: "Become Full-Stack Developer",
				target_date: "2024-06-30",
				progress: 20,
				skills: ["Node.js", "Databases", "API Design"],
				priority: "High"
			}
		]);

		// Certificates and Achievements
		setCertificates([
			{
				id: 1,
				title: "JavaScript Fundamentals",
				provider: "CodeAcademy",
				issued_date: "2024-01-15",
				credential_id: "JS-FUND-2024-001",
				verification_url: "#"
			}
		]);

		// Study Groups
		setStudyGroups([
			{
				id: 1,
				name: "React Developers India",
				members: 1250,
				activity: "Very Active",
				next_session: "2024-02-03T15:00:00Z",
				topic: "Advanced React Patterns"
			}
		]);

		// Mentorship
		setMentorshipOpportunities([
			{
				id: 1,
				mentor_name: "Priya Sharma",
				expertise: "Full-Stack Development",
				experience: "8 years",
				rating: 4.9,
				availability: "Weekends",
				price: "₹2,000/hour"
			}
		]);

		// Interactive Content
		setInteractiveContent([
			{
				id: 1,
				title: "JavaScript Code Challenges",
				type: "Coding Practice",
				difficulty: "Mixed",
				problems: 50,
				completed: 23
			},
			{
				id: 2,
				title: "React Component Playground",
				type: "Interactive Tutorial",
				lessons: 15,
				completed: 8
			}
		]);

	}, []);

	const filteredRoadmap = roadmap.filter(skill => {
		const matchesSearch = skill.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
						    skill.category.toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesFilter = filter === "all" || 
						     (filter === "in-progress" && skill.currentLevel > 0 && skill.currentLevel < skill.targetLevel) ||
						     (filter === "completed" && skill.currentLevel >= skill.targetLevel) ||
						     (filter === "not-started" && skill.currentLevel === 0) ||
						     (filter === "high-priority" && skill.priority === "High");
		
		return matchesSearch && matchesFilter;
	}).sort((a, b) => {
		switch (sortBy) {
			case "priority":
				const priorityOrder = { "High": 3, "Medium": 2, "Low": 1 };
				return priorityOrder[b.priority] - priorityOrder[a.priority];
			case "progress":
				return (progress[b.id]?.overall || 0) - (progress[a.id]?.overall || 0);
			case "marketDemand":
				return b.marketDemand - a.marketDemand;
			case "impact":
				return parseInt(b.impact.replace('%', '').replace('+', '')) - parseInt(a.impact.replace('%', '').replace('+', ''));
			default:
				return 0;
		}
	});

	const startLearningSession = useCallback((skill) => {
		setCurrentLearningSession({
			skill: skill,
			startTime: new Date(),
			currentResource: skill.resources.find(r => !r.completed) || skill.resources[0],
			sessionGoal: "Complete one resource or milestone",
			estimatedDuration: "45 minutes"
		});
	}, []);

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "High": return "text-red-600 bg-red-100 border-red-200";
			case "Medium": return "text-yellow-600 bg-yellow-100 border-yellow-200";
			case "Low": return "text-green-600 bg-green-100 border-green-200";
			default: return "text-gray-600 bg-gray-100 border-gray-200";
		}
	};

	const getDifficultyColor = (difficulty) => {
		switch (difficulty) {
			case "Beginner": return "text-green-600 bg-green-100";
			case "Intermediate": return "text-yellow-600 bg-yellow-100";
			case "Advanced": return "text-red-600 bg-red-100";
			default: return "text-gray-600 bg-gray-100";
		}
	};

	const getResourceIcon = (type) => {
		switch (type) {
			case "Course": return <BookOpen className="w-4 h-4" />;
			case "Tutorial": return <Play className="w-4 h-4" />;
			case "Article": return <ExternalLink className="w-4 h-4" />;
			case "Workshop": return <Users className="w-4 h-4" />;
			case "Certification": return <Award className="w-4 h-4" />;
			case "Bootcamp": return <Zap className="w-4 h-4" />;
			default: return <BookOpen className="w-4 h-4" />;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Enhanced Header with AI Insights */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-8"
				>
					<div className="flex items-center justify-between mb-6">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 flex items-center">
								<Map className="w-8 h-8 text-primary mr-3" />
								AI-Powered Learning Roadmap
							</h1>
							<p className="text-gray-600 mt-2">
								Personalized skill development path tailored to your career goals and learning style
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<button
								onClick={() => setShowAnalytics(!showAnalytics)}
								className="btn-secondary flex items-center space-x-2"
							>
								<BarChart3 className="w-5 h-5" />
								<span>Analytics</span>
							</button>
							<button className="btn-primary flex items-center space-x-2">
								<Target className="w-5 h-5" />
								<span>Set Goals</span>
							</button>
						</div>
					</div>

					{/* Progress Overview Dashboard */}
					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<motion.div 
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className="card text-center bg-gradient-to-r from-blue-50 to-indigo-50"
						>
							<div className="flex items-center justify-center mb-3">
								<Trophy className="w-8 h-8 text-primary" />
							</div>
							<div className="text-2xl font-bold text-primary mb-1">
								{roadmap.filter(skill => progress[skill.id]?.overall === 100).length}
							</div>
							<div className="text-sm text-gray-600">Skills Mastered</div>
						</motion.div>

						<motion.div 
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.1 }}
							className="card text-center bg-gradient-to-r from-green-50 to-emerald-50"
						>
							<div className="flex items-center justify-center mb-3">
								<Activity className="w-8 h-8 text-green-600" />
							</div>
							<div className="text-2xl font-bold text-green-600 mb-1">
								{streakData.current}
							</div>
							<div className="text-sm text-gray-600">Day Streak</div>
						</motion.div>

						<motion.div 
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.2 }}
							className="card text-center bg-gradient-to-r from-purple-50 to-pink-50"
						>
							<div className="flex items-center justify-center mb-3">
								<Target className="w-8 h-8 text-purple-600" />
							</div>
							<div className="text-2xl font-bold text-purple-600 mb-1">
								{Math.round((completedThisWeek / weeklyTarget) * 100)}%
							</div>
							<div className="text-sm text-gray-600">Weekly Goal</div>
						</motion.div>

						<motion.div 
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: 0.3 }}
							className="card text-center bg-gradient-to-r from-orange-50 to-red-50"
						>
							<div className="flex items-center justify-center mb-3">
								<Star className="w-8 h-8 text-orange-600" />
							</div>
							<div className="text-2xl font-bold text-orange-600 mb-1">
								{Object.values(progress).reduce((acc, p) => acc + (p.points || 0), 0)}
							</div>
							<div className="text-sm text-gray-600">Total Points</div>
						</motion.div>
					</div>

					{/* AI Recommendations Panel */}
					{aiRecommendations && (
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.4 }}
							className="card mb-8 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50"
						>
							<div className="flex items-start space-x-4">
								<div className="bg-primary text-white p-3 rounded-lg">
									<Brain className="w-6 h-6" />
								</div>
								<div className="flex-1">
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										AI Learning Recommendations
									</h3>
									<div className="grid md:grid-cols-2 gap-4 mb-4">
										<div>
											<h4 className="font-medium text-gray-900 mb-1">Next Best Skill</h4>
											<p className="text-gray-600 text-sm">{aiRecommendations.nextBestSkill}</p>
											<p className="text-gray-500 text-xs mt-1">{aiRecommendations.reasoning}</p>
										</div>
										<div>
											<h4 className="font-medium text-gray-900 mb-1">This Week's Focus</h4>
											<p className="text-gray-600 text-sm">{aiRecommendations.weeklyRecommendation}</p>
										</div>
									</div>
									<div className="flex items-center space-x-6 text-sm">
										<div className="flex items-center space-x-2">
											<TrendingUp className="w-4 h-4 text-green-600" />
											<span className="text-gray-600">Market Trend: {aiRecommendations.marketInsights.demandTrend}</span>
										</div>
										<div className="flex items-center space-x-2">
											<DollarSign className="w-4 h-4 text-green-600" />
											<span className="text-gray-600">Salary Impact: {aiRecommendations.marketInsights.salaryGrowth}</span>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					)}
				</motion.div>

				{/* Search and Filter Controls */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.5 }}
					className="card mb-8"
				>
					<div className="flex flex-col lg:flex-row gap-4">
						{/* Search */}
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								placeholder="Search skills, categories, or topics..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="input-field pl-10"
							/>
						</div>

						{/* Filter */}
						<select
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
							className="input-field min-w-[160px]"
						>
							<option value="all">All Skills</option>
							<option value="in-progress">In Progress</option>
							<option value="completed">Completed</option>
							<option value="not-started">Not Started</option>
							<option value="high-priority">High Priority</option>
						</select>

						{/* Sort */}
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value)}
							className="input-field min-w-[160px]"
						>
							<option value="priority">Sort by Priority</option>
							<option value="progress">Sort by Progress</option>
							<option value="marketDemand">Sort by Market Demand</option>
							<option value="impact">Sort by Impact</option>
						</select>

						{/* View Mode */}
						<div className="flex bg-gray-100 rounded-lg p-1">
							<button
								onClick={() => setViewMode("cards")}
								className={`px-3 py-2 rounded-md text-sm ${
									viewMode === "cards" 
										? "bg-white text-primary shadow-sm" 
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								<BarChart3 className="w-4 h-4" />
							</button>
							<button
								onClick={() => setViewMode("timeline")}
								className={`px-3 py-2 rounded-md text-sm ${
									viewMode === "timeline" 
										? "bg-white text-primary shadow-sm" 
										: "text-gray-600 hover:text-gray-900"
								}`}
							>
								<Route className="w-4 h-4" />
							</button>
						</div>
					</div>
				</motion.div>

				{/* Results Info */}
				<div className="flex items-center justify-between mb-6">
					<p className="text-gray-600">
						Showing {filteredRoadmap.length} of {roadmap.length} skills
					</p>
					<div className="flex items-center space-x-3">
						<button className="btn-secondary text-sm px-3 py-2 flex items-center space-x-1">
							<Download className="w-4 h-4" />
							<span>Export Plan</span>
						</button>
						<button className="btn-secondary text-sm px-3 py-2 flex items-center space-x-1">
							<Share2 className="w-4 h-4" />
							<span>Share Progress</span>
						</button>
					</div>
				</div>

				{/* Skills Roadmap */}
				<div className={viewMode === "cards" ? "grid lg:grid-cols-2 gap-6" : "space-y-6"}>
					<AnimatePresence>
						{filteredRoadmap.map((skill, index) => (
							<motion.div
								key={skill.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ delay: index * 0.1 }}
								className="card hover:shadow-lg transition-all duration-300 relative overflow-hidden"
							>
								{/* Skill Header */}
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center space-x-3 flex-1">
										<div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
											{skill.skill.charAt(0)}
										</div>
										<div className="flex-1">
											<h3 className="text-xl font-semibold text-gray-900 mb-1">
												{skill.skill}
											</h3>
											<p className="text-gray-600 text-sm mb-2">
												{skill.description}
											</p>
											<div className="flex items-center space-x-2 mb-2">
												<span className={`px-2 py-1 text-xs rounded-full border ${getPriorityColor(skill.priority)}`}>
													{skill.priority} Priority
												</span>
												<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
													{skill.category}
												</span>
												<span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(skill.difficulty)}`}>
													{skill.difficulty}
												</span>
											</div>
										</div>
									</div>
									<div className="text-right">
										<div className="text-2xl font-bold text-primary mb-1">
											{skill.impact}
										</div>
										<div className="text-xs text-gray-500">Impact</div>
									</div>
								</div>

								{/* AI Personalization */}
								{skill.aiPersonalization && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
										<div className="flex items-start space-x-2">
											<Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
											<div>
												<div className="text-xs font-medium text-blue-800 mb-1">AI Insight</div>
												<div className="text-sm text-blue-700">{skill.aiPersonalization}</div>
											</div>
										</div>
									</div>
								)}

								{/* Skill Level Progress */}
								<div className="mb-4">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-gray-700">Skill Level</span>
										<span className="text-sm text-gray-600">
											{skill.currentLevel}/{skill.maxLevel} → {skill.targetLevel}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-3">
										<div
											className={`h-3 rounded-full transition-all duration-300 ${
												skill.currentLevel >= skill.targetLevel
													? "bg-green-500"
													: "bg-primary"
											}`}
											style={{
												width: `${(skill.currentLevel / skill.maxLevel) * 100}%`,
											}}
										></div>
									</div>
								</div>

								{/* Progress Stats */}
								<div className="grid grid-cols-4 gap-4 mb-4">
									<div className="text-center">
										<div className="text-lg font-bold text-gray-900">
											{progress[skill.id]?.overall || 0}%
										</div>
										<div className="text-xs text-gray-600">Overall</div>
									</div>
									<div className="text-center">
										<div className="text-lg font-bold text-gray-900">
											{progress[skill.id]?.points || 0}
										</div>
										<div className="text-xs text-gray-600">Points</div>
									</div>
									<div className="text-center">
										<div className="text-lg font-bold text-gray-900">
											{skill.marketDemand}%
										</div>
										<div className="text-xs text-gray-600">Demand</div>
									</div>
									<div className="text-center">
										<div className="text-lg font-bold text-gray-900">
											{skill.estimatedTime}
										</div>
										<div className="text-xs text-gray-600">Est. Time</div>
									</div>
								</div>

								{/* Market Info */}
								<div className="flex items-center justify-between mb-4 text-sm text-gray-600">
									<div className="flex items-center space-x-2">
										<TrendingUp className="w-4 h-4" />
										<span>Market Demand: {skill.marketDemand}%</span>
									</div>
									<div className="flex items-center space-x-2">
										<DollarSign className="w-4 h-4" />
										<span>Salary Impact: {skill.salaryImpact}</span>
									</div>
								</div>

								{/* Resources Preview */}
								<div className="mb-4">
									<h4 className="text-sm font-medium text-gray-900 mb-2">Learning Resources:</h4>
									<div className="space-y-2">
										{skill.resources.slice(0, 2).map((resource) => (
											<div
												key={resource.id}
												className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
											>
												<div className="flex items-center space-x-2">
													{getResourceIcon(resource.type)}
													<span className="text-sm text-gray-900">{resource.title}</span>
													<span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(resource.difficulty)}`}>
														{resource.difficulty}
													</span>
													{resource.certificate && (
														<Award className="w-3 h-3 text-yellow-600" />
													)}
												</div>
												<div className="flex items-center space-x-2">
													{resource.completed ? (
														<CheckCircle className="w-4 h-4 text-green-500" />
													) : (
														<Clock className="w-4 h-4 text-gray-400" />
													)}
													<span className="text-xs text-gray-500">{resource.duration}</span>
												</div>
											</div>
										))}
										{skill.resources.length > 2 && (
											<div className="text-xs text-gray-500 text-center">
												+{skill.resources.length - 2} more resources
											</div>
										)}
									</div>
								</div>

								{/* Milestones */}
								<div className="mb-4">
									<h4 className="text-sm font-medium text-gray-900 mb-2">Next Milestones:</h4>
									<div className="space-y-1">
										{skill.milestones.slice(0, 3).map((milestone) => (
											<div key={milestone.id} className="flex items-center space-x-2">
												{milestone.completed ? (
													<CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
												) : (
													<div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
												)}
												<span className={`text-sm ${milestone.completed ? "text-gray-900" : "text-gray-600"}`}>
													{milestone.title}
												</span>
												{milestone.points && (
													<span className="text-xs text-yellow-600">+{milestone.points} pts</span>
												)}
											</div>
										))}
									</div>
								</div>

								{/* Action Buttons */}
								<div className="flex items-center justify-between pt-4 border-t border-gray-200">
									<div className="flex items-center space-x-2">
										<button className="p-2 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors">
											<Bookmark className="w-5 h-5" />
										</button>
										<button className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors">
											<Share2 className="w-5 h-5" />
										</button>
										<button className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
											<Heart className="w-5 h-5" />
										</button>
									</div>
									<div className="flex items-center space-x-2">
										<button
											onClick={() => setSelectedSkill(skill)}
											className="btn-secondary text-sm px-4 py-2"
										>
											View Details
										</button>
										<button
											onClick={() => startLearningSession(skill)}
											className="btn-primary text-sm px-4 py-2 flex items-center space-x-1"
										>
											<Play className="w-4 h-4" />
											<span>Start Learning</span>
										</button>
									</div>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>

				{/* No Results */}
				{filteredRoadmap.length === 0 && (
					<motion.div 
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="text-center py-12"
					>
						<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Search className="w-12 h-12 text-gray-400" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							No skills found
						</h3>
						<p className="text-gray-600 mb-4">
							Try adjusting your search or filter criteria.
						</p>
						<button
							onClick={() => {
								setSearchTerm("");
								setFilter("all");
							}}
							className="btn-primary"
						>
							Clear Filters
						</button>
					</motion.div>
				)}

				{/* Skill Detail Modal */}
				<AnimatePresence>
					{selectedSkill && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
							onClick={() => setSelectedSkill(null)}
						>
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="p-6">
									<div className="flex items-center justify-between mb-6">
										<h2 className="text-2xl font-bold text-gray-900">
											{selectedSkill.skill} Learning Path
										</h2>
										<button
											onClick={() => setSelectedSkill(null)}
											className="text-gray-400 hover:text-gray-600"
										>
											<X className="w-6 h-6" />
										</button>
									</div>

									<div className="grid lg:grid-cols-2 gap-8">
										{/* Resources */}
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Learning Resources
											</h3>
											<div className="space-y-3">
												{selectedSkill.resources.map((resource) => (
													<div
														key={resource.id}
														className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
													>
														<div className="flex items-start justify-between mb-2">
															<div className="flex items-center space-x-2">
																{getResourceIcon(resource.type)}
																<span className="font-medium text-gray-900">
																	{resource.title}
																</span>
															</div>
															<div className="flex items-center space-x-2">
																{resource.completed ? (
																	<CheckCircle className="w-5 h-5 text-green-500" />
																) : (
																	<Clock className="w-5 h-5 text-gray-400" />
																)}
															</div>
														</div>
														<div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
															<span>{resource.provider}</span>
															<span>•</span>
															<span>{resource.duration}</span>
															<span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(resource.difficulty)}`}>
																{resource.difficulty}
															</span>
														</div>
														{resource.rating && (
															<div className="flex items-center space-x-2 mb-2">
																<div className="flex items-center">
																	<Star className="w-4 h-4 text-yellow-400 fill-current" />
																	<span className="text-sm ml-1">{resource.rating}</span>
																</div>
																<span className="text-xs text-gray-500">({resource.reviews} reviews)</span>
																<span className="text-sm font-medium text-green-600">{resource.price}</span>
															</div>
														)}
														{resource.hands_on_projects && (
															<div className="text-xs text-gray-600">
																{resource.hands_on_projects} hands-on projects
															</div>
														)}
													</div>
												))}
											</div>
										</div>

										{/* Milestones & Projects */}
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Milestones & Projects
											</h3>
											<div className="space-y-3">
												{selectedSkill.milestones.map((milestone) => (
													<div
														key={milestone.id}
														className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
													>
														{milestone.completed ? (
															<CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
														) : (
															<div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0 mt-0.5"></div>
														)}
														<div className="flex-1">
															<div className={`font-medium ${milestone.completed ? "text-gray-900" : "text-gray-600"}`}>
																{milestone.title}
															</div>
															<div className="text-sm text-gray-500 mb-1">
																{milestone.description}
															</div>
															{milestone.points && (
																<span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
																	<Star className="w-3 h-3 mr-1" />
																	{milestone.points} points
																</span>
															)}
															{milestone.current_progress && (
																<div className="mt-2">
																	<div className="flex justify-between text-xs text-gray-600 mb-1">
																		<span>Progress</span>
																		<span>{milestone.current_progress}/{milestone.total_required}</span>
																	</div>
																	<div className="w-full bg-gray-200 rounded-full h-2">
																		<div
																			className="bg-primary h-2 rounded-full"
																			style={{
																				width: `${(milestone.current_progress / milestone.total_required) * 100}%`
																			}}
																		></div>
																	</div>
																</div>
															)}
														</div>
													</div>
												))}
											</div>

											{/* Projects */}
											{selectedSkill.projects && selectedSkill.projects.length > 0 && (
												<div className="mt-6">
													<h4 className="font-medium text-gray-900 mb-3">Practice Projects</h4>
													<div className="space-y-3">
														{selectedSkill.projects.map((project) => (
															<div key={project.id} className="border border-gray-200 rounded-lg p-3">
																<div className="flex items-center justify-between mb-2">
																	<h5 className="font-medium text-gray-900">{project.title}</h5>
																	{project.completed ? (
																		<CheckCircle className="w-5 h-5 text-green-500" />
																	) : (
																		<Clock className="w-5 h-5 text-gray-400" />
																	)}
																</div>
																<div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
																	<span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(project.difficulty)}`}>
																		{project.difficulty}
																	</span>
																	<span>{project.estimated_time}</span>
																</div>
																{project.technologies && (
																	<div className="flex flex-wrap gap-1 mb-2">
																		{project.technologies.map((tech, index) => (
																			<span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
																				{tech}
																			</span>
																		))}
																	</div>
																)}
																{project.demo_url && (
																	<div className="flex items-center space-x-2">
																		<button className="text-primary text-sm hover:underline">
																			View Demo
																		</button>
																		<button className="text-gray-600 text-sm hover:underline">
																			View Code
																		</button>
																	</div>
																)}
															</div>
														))}
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Current Learning Session */}
				<AnimatePresence>
					{currentLearningSession && (
						<motion.div
							initial={{ opacity: 0, y: 100 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 100 }}
							className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 max-w-sm z-40"
						>
							<div className="flex items-center justify-between mb-3">
								<h4 className="font-medium text-gray-900">Learning Session</h4>
								<button
									onClick={() => setCurrentLearningSession(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									<X className="w-5 h-5" />
								</button>
							</div>
							<div className="text-sm text-gray-600 mb-2">
								{currentLearningSession.skill.skill}
							</div>
							<div className="text-sm text-gray-500 mb-3">
								Goal: {currentLearningSession.sessionGoal}
							</div>
							<div className="flex items-center space-x-2">
								<button className="btn-primary text-sm px-3 py-1">
									Continue
								</button>
								<button className="btn-secondary text-sm px-3 py-1">
									Pause
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Analytics Modal */}
				<AnimatePresence>
					{showAnalytics && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
							onClick={() => setShowAnalytics(false)}
						>
							<motion.div
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
								className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
								onClick={(e) => e.stopPropagation()}
							>
								<div className="p-6">
									<div className="flex items-center justify-between mb-6">
										<h2 className="text-2xl font-bold text-gray-900">
											Learning Analytics
										</h2>
										<button
											onClick={() => setShowAnalytics(false)}
											className="text-gray-400 hover:text-gray-600"
										>
											<X className="w-6 h-6" />
										</button>
									</div>
									{/* Analytics content would go here */}
									<div className="text-gray-600">
										Comprehensive learning analytics and progress insights would be displayed here.
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

export default EnhancedLearningRoadmap;
