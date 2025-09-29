"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
	FileText,
	Target,
	CheckCircle,
	Clock,
	TrendingUp,
	BookOpen,
	AlertCircle,
	Brain,
	Mic,
	Code,
	BarChart3,
	Star,
	Award,
	User,
	Calendar,
	Bell,
	RefreshCw,
	ChevronRight,
	Trophy,
	Zap,
	Eye,
	Plus,
	Activity,
	ArrowUpRight,
	Filter,
	Download,
	Share,
	MapPin,
	Building2,
	DollarSign,
	Users,
	Briefcase,
	GraduationCap,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const CandidateDashboard = () => {
	const { user } = useAuth();
	const router = useRouter();
	const [profileCompletion, setProfileCompletion] = useState(0);
	const [recommendations, setRecommendations] = useState([]);
	const [applications, setApplications] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [stats, setStats] = useState({});
	const [recentActivity, setRecentActivity] = useState([]);
	const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
	const [skillProgress, setSkillProgress] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedTab, setSelectedTab] = useState("overview");
	const [refreshing, setRefreshing] = useState(false);
	const [lastUpdated, setLastUpdated] = useState(new Date());
	const [showNotifications, setShowNotifications] = useState(false);

	useEffect(() => {
		loadDashboardData();
		calculateProfileCompletion();

		// Auto-refresh every 5 minutes
		const interval = setInterval(() => {
			loadDashboardData(true);
		}, 5 * 60 * 1000);

		return () => clearInterval(interval);
	}, [user]);

	const calculateProfileCompletion = () => {
		if (!user) return;

		const fields = [
			user.name,
			user.email,
			user.phone,
			user.location,
			user.bio,
			user.education,
			user.skills && user.skills.length > 0,
			user.experience,
		];

		const completedFields = fields.filter(
			(field) => field && field !== ""
		).length;
		const completionPercentage = Math.round(
			(completedFields / fields.length) * 100
		);
		setProfileCompletion(completionPercentage);
	};

	const loadDashboardData = async (isRefresh = false) => {
		if (isRefresh) {
			setRefreshing(true);
		} else {
			setLoading(true);
		}

		try {
			await Promise.all([
				loadRecommendations(),
				loadApplications(),
				loadStats(),
				loadRecentActivity(),
				loadSkillProgress(),
				loadNotifications(),
				loadUpcomingDeadlines(),
			]);
			setLastUpdated(new Date());
			if (isRefresh) {
				toast.success("Dashboard refreshed successfully!");
			}
		} catch (error) {
			console.error("Error loading dashboard data:", error);
			toast.error("Failed to load dashboard data");
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	};

	const handleRefresh = () => {
		loadDashboardData(true);
	};

	const handleQuickApply = async (jobId) => {
		try {
			// Simulate quick apply functionality
			toast.success("Application submitted successfully!");
			// Update applications state
			const newApplication = {
				id: Date.now(),
				title:
					recommendations.find((r) => r.id === jobId)?.title || "Unknown Job",
				company:
					recommendations.find((r) => r.id === jobId)?.company ||
					"Unknown Company",
				status: "Applied",
				appliedDate: new Date().toISOString().split("T")[0],
				matchScore:
					recommendations.find((r) => r.id === jobId)?.matchScore || 0,
				nextStep: "Under Review",
				interviewDate: null,
			};
			setApplications((prev) => [newApplication, ...prev]);
			// Remove from recommendations
			setRecommendations((prev) => prev.filter((r) => r.id !== jobId));
		} catch (error) {
			toast.error("Failed to submit application");
		}
	};

	const loadRecommendations = async () => {
		setRecommendations([
			{
				id: 1,
				title: "Software Development Intern",
				company: "TechCorp India",
				location: "Bangalore",
				duration: "6 months",
				matchScore: 95,
				skills: ["React", "Node.js", "JavaScript", "MongoDB"],
				deadline: "2024-02-15",
				stipend: "₹25,000/month",
				type: "Full-time",
				applicants: 1250,
				isNew: true,
			},
			{
				id: 2,
				title: "Data Science Intern",
				company: "DataViz Solutions",
				location: "Mumbai",
				duration: "4 months",
				matchScore: 88,
				skills: ["Python", "Machine Learning", "SQL", "Pandas"],
				deadline: "2024-02-20",
				stipend: "₹30,000/month",
				type: "Remote",
				applicants: 890,
				isNew: false,
			},
			{
				id: 3,
				title: "Product Management Intern",
				company: "StartupXYZ",
				location: "Delhi",
				duration: "3 months",
				matchScore: 82,
				skills: ["Product Strategy", "Analytics", "User Research"],
				deadline: "2024-02-25",
				stipend: "₹20,000/month",
				type: "Hybrid",
				applicants: 456,
				isNew: true,
			},
		]);
	};

	const loadApplications = async () => {
		setApplications([
			{
				id: 1,
				title: "Frontend Developer Intern",
				company: "WebTech Ltd",
				status: "Shortlisted",
				appliedDate: "2024-01-15",
				matchScore: 92,
				nextStep: "Technical Interview",
				interviewDate: "2024-02-20",
			},
			{
				id: 2,
				title: "Backend Developer Intern",
				company: "API Solutions",
				status: "Applied",
				appliedDate: "2024-01-20",
				matchScore: 85,
				nextStep: "Under Review",
				interviewDate: null,
			},
			{
				id: 3,
				title: "Full Stack Intern",
				company: "TechStart",
				status: "Interview Scheduled",
				appliedDate: "2024-01-12",
				matchScore: 90,
				nextStep: "Final Round",
				interviewDate: "2024-02-18",
			},
		]);
	};

	const loadStats = async () => {
		try {
			// Calculate dynamic stats from actual data
			const totalApps = applications.length;
			const shortlistedCount = applications.filter(
				(app) => app.status === "Shortlisted"
			).length;
			const interviewCount = applications.filter(
				(app) => app.status === "Interview Scheduled"
			).length;
			const offerCount = applications.filter(
				(app) => app.status === "Offer Received"
			).length;

			setStats({
				totalApplications: totalApps || 12,
				shortlisted: shortlistedCount || 5,
				interviews: interviewCount || 3,
				offers: offerCount || 1,
				profileViews: Math.floor(Math.random() * 200) + 100,
				skillRating: (4.0 + Math.random() * 1).toFixed(1),
				completedAssessments: Math.floor(Math.random() * 15) + 5,
				certificationsEarned: Math.floor(Math.random() * 8) + 2,
			});
		} catch (error) {
			console.error("Error loading stats:", error);
		}
	};

	const loadRecentActivity = async () => {
		setRecentActivity([
			{
				id: 1,
				type: "application",
				title: "Applied to Software Engineering Intern at TechCorp",
				timestamp: "2 hours ago",
				icon: Briefcase,
				color: "text-blue-600",
			},
			{
				id: 2,
				type: "assessment",
				title: "Completed JavaScript Fundamentals Assessment",
				timestamp: "1 day ago",
				icon: Brain,
				color: "text-green-600",
			},
			{
				id: 3,
				type: "recommendation",
				title: "New recommendation: Data Analyst Intern",
				timestamp: "2 days ago",
				icon: Target,
				color: "text-purple-600",
			},
			{
				id: 4,
				type: "profile",
				title: "Profile viewed by TechStart HR",
				timestamp: "3 days ago",
				icon: Eye,
				color: "text-orange-600",
			},
		]);
	};

	const loadSkillProgress = async () => {
		setSkillProgress([
			{
				skill: "JavaScript",
				current: 85,
				target: 95,
				category: "Programming",
				improved: 15,
			},
			{
				skill: "React",
				current: 78,
				target: 90,
				category: "Frontend",
				improved: 22,
			},
			{
				skill: "Node.js",
				current: 70,
				target: 85,
				category: "Backend",
				improved: 18,
			},
			{
				skill: "Problem Solving",
				current: 82,
				target: 90,
				category: "Core",
				improved: 12,
			},
		]);
	};

	const loadNotifications = async () => {
		setNotifications([
			{
				id: 1,
				title: "Interview Reminder",
				message: "Technical interview with TechCorp tomorrow at 2 PM",
				type: "warning",
				timestamp: "1 hour ago",
				actionRequired: true,
			},
			{
				id: 2,
				title: "Application Status Update",
				message: "You've been shortlisted for Frontend Developer position",
				type: "success",
				timestamp: "2 hours ago",
				actionRequired: false,
			},
			{
				id: 3,
				title: "New Recommendation",
				message: "3 new internship recommendations match your profile",
				type: "info",
				timestamp: "1 day ago",
				actionRequired: false,
			},
		]);
	};

	const loadUpcomingDeadlines = async () => {
		setUpcomingDeadlines([
			{
				id: 1,
				title: "Software Development Intern",
				company: "TechCorp India",
				deadline: "2024-02-15",
				daysLeft: 5,
			},
			{
				id: 2,
				title: "Data Science Intern",
				company: "DataViz Solutions",
				deadline: "2024-02-20",
				daysLeft: 10,
			},
		]);
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "Shortlisted":
				return "text-green-600 bg-green-100";
			case "Applied":
				return "text-blue-600 bg-blue-100";
			case "Interview Scheduled":
				return "text-purple-600 bg-purple-100";
			case "Rejected":
				return "text-red-600 bg-red-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const quickActions = [
		{
			title: "Resume Analyzer",
			description: "Analyze and improve your resume",
			icon: FileText,
			link: "/candidate/resume-analyzer",
			color: "bg-blue-500",
		},
		{
			title: "Take Assessment",
			description: "Complete skill assessments",
			icon: Brain,
			link: "/candidate/assessments",
			color: "bg-green-500",
		},
		{
			title: "Browse Jobs",
			description: "Explore recommendations",
			icon: Target,
			link: "/candidate/recommendations",
			color: "bg-purple-500",
		},
		{
			title: "Learning Path",
			description: "Continue your learning journey",
			icon: BookOpen,
			link: "/candidate/learning",
			color: "bg-orange-500",
		},
	];

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center py-6">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">
								Welcome back, {user?.name || "Candidate"}!
							</h1>
							<p className="text-gray-600">
								Here's what's happening with your internship journey
							</p>
							<p className="text-xs text-gray-500 mt-1">
								Last updated: {lastUpdated.toLocaleTimeString()}
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<button
								onClick={handleRefresh}
								disabled={refreshing}
								className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
							>
								<RefreshCw
									className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
								/>
								{refreshing ? "Refreshing..." : "Refresh"}
							</button>
							<div className="relative">
								<button
									onClick={() => setShowNotifications(!showNotifications)}
									className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<Bell className="w-6 h-6 text-gray-600" />
									{notifications.filter((n) => n.actionRequired).length > 0 && (
										<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
											{notifications.filter((n) => n.actionRequired).length}
										</span>
									)}
								</button>

								{showNotifications && (
									<div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
										<div className="p-4 border-b border-gray-200">
											<h3 className="font-medium text-gray-900">
												Notifications
											</h3>
										</div>
										<div className="max-h-64 overflow-y-auto">
											{notifications.length > 0 ? (
												notifications.slice(0, 5).map((notification, index) => (
													<div
														key={index}
														className="p-3 border-b border-gray-100 hover:bg-gray-50"
													>
														<p className="text-sm text-gray-900">
															{notification.message}
														</p>
														<p className="text-xs text-gray-500 mt-1">
															{notification.time}
														</p>
													</div>
												))
											) : (
												<div className="p-4 text-center text-gray-500">
													<Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
													<p>No new notifications</p>
												</div>
											)}
										</div>
										{notifications.length > 5 && (
											<div className="p-3 border-t border-gray-200 text-center">
												<button className="text-sm text-blue-600 hover:text-blue-800">
													View all notifications
												</button>
											</div>
										)}
									</div>
								)}
							</div>
							<Link
								href="/profile"
								className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
							>
								<div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
									<User className="w-5 h-5 text-white" />
								</div>
								<span className="text-sm font-medium text-gray-700">
									Profile
								</span>
							</Link>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Stats Overview */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Applications
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.totalApplications}
								</p>
								<p className="text-xs text-green-600 mt-1">+3 this week</p>
							</div>
							<div className="p-3 bg-blue-100 rounded-lg">
								<Briefcase className="w-6 h-6 text-blue-600" />
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">Shortlisted</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.shortlisted}
								</p>
								<p className="text-xs text-green-600 mt-1">+2 this week</p>
							</div>
							<div className="p-3 bg-green-100 rounded-lg">
								<CheckCircle className="w-6 h-6 text-green-600" />
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Profile Views
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.profileViews}
								</p>
								<p className="text-xs text-blue-600 mt-1">+12 this week</p>
							</div>
							<div className="p-3 bg-purple-100 rounded-lg">
								<Eye className="w-6 h-6 text-purple-600" />
							</div>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
					>
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-gray-600">
									Skill Rating
								</p>
								<p className="text-2xl font-bold text-gray-900">
									{stats.skillRating}/5.0
								</p>
								<p className="text-xs text-green-600 mt-1">+0.3 this month</p>
							</div>
							<div className="p-3 bg-orange-100 rounded-lg">
								<Star className="w-6 h-6 text-orange-600" />
							</div>
						</div>
					</motion.div>
				</div>

				{/* Profile Completion Banner */}
				{profileCompletion < 100 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 mb-8 text-white"
					>
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<h3 className="text-lg font-semibold mb-2">
									Complete Your Profile ({profileCompletion}%)
								</h3>
								<p className="text-blue-100 mb-4">
									Complete your profile to get better recommendations and
									increase your visibility
								</p>
								<div className="w-full bg-blue-400/30 rounded-full h-2 mb-4">
									<div
										className="bg-white h-2 rounded-full transition-all duration-300"
										style={{ width: `${profileCompletion}%` }}
									></div>
								</div>
								<button
									onClick={() => router.push("/profile")}
									className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
								>
									Complete Profile
								</button>
							</div>
							<div className="ml-6">
								<div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
									<User className="w-10 h-10 text-white" />
								</div>
							</div>
						</div>
					</motion.div>
				)}

				{/* Quick Actions */}
				<div className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						Quick Actions
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{quickActions.map((action, index) => (
							<motion.div
								key={action.title}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								<Link
									href={action.link}
									className="block bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
								>
									<div className="flex items-center space-x-4">
										<div
											className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}
										>
											<action.icon className="w-6 h-6 text-white" />
										</div>
										<div className="flex-1">
											<h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
												{action.title}
											</h3>
											<p className="text-sm text-gray-600">
												{action.description}
											</p>
										</div>
										<ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* Recent Applications */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-white rounded-xl shadow-sm border border-gray-200"
						>
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-semibold text-gray-900">
										Recent Applications
									</h2>
									<Link
										href="/candidate/applications"
										className="text-blue-600 hover:text-blue-800 text-sm font-medium"
									>
										View All
									</Link>
								</div>
							</div>
							<div className="p-6">
								<div className="space-y-4">
									{applications.slice(0, 3).map((app) => (
										<div
											key={app.id}
											className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
										>
											<div className="flex-1">
												<h3 className="font-medium text-gray-900">
													{app.title}
												</h3>
												<p className="text-sm text-gray-600">{app.company}</p>
												<div className="flex items-center space-x-4 mt-2">
													<span
														className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
															app.status
														)}`}
													>
														{app.status}
													</span>
													<span className="text-xs text-gray-500">
														Applied {app.appliedDate}
													</span>
												</div>
											</div>
											<div className="text-right">
												<div className="flex items-center space-x-2">
													<div className="text-sm font-medium text-gray-900">
														{app.matchScore}% match
													</div>
													<ChevronRight className="w-4 h-4 text-gray-400" />
												</div>
												{app.interviewDate && (
													<p className="text-xs text-blue-600 mt-1">
														Interview: {app.interviewDate}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						</motion.div>

						{/* Top Recommendations */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="bg-white rounded-xl shadow-sm border border-gray-200"
						>
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-semibold text-gray-900">
										Top Recommendations
									</h2>
									<Link
										href="/candidate/recommendations"
										className="text-blue-600 hover:text-blue-800 text-sm font-medium"
									>
										View All
									</Link>
								</div>
							</div>
							<div className="p-6">
								<div className="space-y-4">
									{recommendations.slice(0, 2).map((rec) => (
										<div
											key={rec.id}
											className="border border-gray-200 rounded-lg p-4"
										>
											<div className="flex items-start justify-between">
												<div className="flex-1">
													<div className="flex items-center space-x-2">
														<h3 className="font-medium text-gray-900">
															{rec.title}
														</h3>
														{rec.isNew && (
															<span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
																New
															</span>
														)}
													</div>
													<p className="text-sm text-gray-600 mb-2">
														{rec.company}
													</p>
													<div className="flex items-center space-x-4 text-sm text-gray-500">
														<div className="flex items-center space-x-1">
															<MapPin className="w-4 h-4" />
															<span>{rec.location}</span>
														</div>
														<div className="flex items-center space-x-1">
															<Clock className="w-4 h-4" />
															<span>{rec.duration}</span>
														</div>
														<div className="flex items-center space-x-1">
															<DollarSign className="w-4 h-4" />
															<span>{rec.stipend}</span>
														</div>
													</div>
													<div className="flex flex-wrap gap-1 mt-2">
														{rec.skills.slice(0, 3).map((skill) => (
															<span
																key={skill}
																className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
															>
																{skill}
															</span>
														))}
														{rec.skills.length > 3 && (
															<span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
																+{rec.skills.length - 3} more
															</span>
														)}
													</div>
												</div>
												<div className="text-right ml-4">
													<div className="text-lg font-bold text-green-600">
														{rec.matchScore}%
													</div>
													<p className="text-xs text-gray-500">match</p>
													<button
														onClick={() => handleQuickApply(rec.id)}
														className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
													>
														Quick Apply
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</motion.div>

						{/* Skill Progress */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.3 }}
							className="bg-white rounded-xl shadow-sm border border-gray-200"
						>
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-semibold text-gray-900">
										Skill Progress
									</h2>
									<Link
										href="/candidate/learning"
										className="text-blue-600 hover:text-blue-800 text-sm font-medium"
									>
										View Learning Path
									</Link>
								</div>
							</div>
							<div className="p-6">
								<div className="space-y-4">
									{skillProgress.map((skill) => (
										<div key={skill.skill}>
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center space-x-2">
													<span className="font-medium text-gray-900">
														{skill.skill}
													</span>
													<span className="text-xs text-gray-500">
														({skill.category})
													</span>
												</div>
												<div className="flex items-center space-x-2">
													<span className="text-sm text-green-600">
														+{skill.improved}%
													</span>
													<span className="text-sm text-gray-600">
														{skill.current}%
													</span>
												</div>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2">
												<div
													className="bg-blue-600 h-2 rounded-full transition-all duration-500"
													style={{ width: `${skill.current}%` }}
												></div>
											</div>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Upcoming Deadlines */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							className="bg-white rounded-xl shadow-sm border border-gray-200"
						>
							<div className="p-6 border-b border-gray-200">
								<h2 className="text-lg font-semibold text-gray-900">
									Upcoming Deadlines
								</h2>
							</div>
							<div className="p-6">
								<div className="space-y-4">
									{upcomingDeadlines.map((deadline) => (
										<div
											key={deadline.id}
											className="flex items-center space-x-3"
										>
											<div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
												<Calendar className="w-5 h-5 text-red-600" />
											</div>
											<div className="flex-1">
												<h3 className="font-medium text-gray-900 text-sm">
													{deadline.title}
												</h3>
												<p className="text-xs text-gray-600">
													{deadline.company}
												</p>
												<p className="text-xs text-red-600 font-medium">
													{deadline.daysLeft} days left
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</motion.div>

						{/* Recent Activity */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 }}
							className="bg-white rounded-xl shadow-sm border border-gray-200"
						>
							<div className="p-6 border-b border-gray-200">
								<h2 className="text-lg font-semibold text-gray-900">
									Recent Activity
								</h2>
							</div>
							<div className="p-6">
								<div className="space-y-4">
									{recentActivity.map((activity) => (
										<div
											key={activity.id}
											className="flex items-start space-x-3"
										>
											<div
												className={`p-2 rounded-lg ${activity.color
													.replace("text-", "bg-")
													.replace("-600", "-100")}`}
											>
												<activity.icon
													className={`w-4 h-4 ${activity.color}`}
												/>
											</div>
											<div className="flex-1">
												<p className="text-sm text-gray-900">
													{activity.title}
												</p>
												<p className="text-xs text-gray-500">
													{activity.timestamp}
												</p>
											</div>
										</div>
									))}
								</div>
							</div>
						</motion.div>

						{/* Notifications */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.2 }}
							className="bg-white rounded-xl shadow-sm border border-gray-200"
						>
							<div className="p-6 border-b border-gray-200">
								<h2 className="text-lg font-semibold text-gray-900">
									Notifications
								</h2>
							</div>
							<div className="p-6">
								<div className="space-y-4">
									{notifications.slice(0, 3).map((notification) => (
										<div
											key={notification.id}
											className={`p-3 rounded-lg border-l-4 ${
												notification.type === "warning"
													? "bg-yellow-50 border-yellow-400"
													: notification.type === "success"
													? "bg-green-50 border-green-400"
													: "bg-blue-50 border-blue-400"
											}`}
										>
											<h4 className="font-medium text-gray-900 text-sm">
												{notification.title}
											</h4>
											<p className="text-xs text-gray-600 mt-1">
												{notification.message}
											</p>
											<p className="text-xs text-gray-500 mt-2">
												{notification.timestamp}
											</p>
											{notification.actionRequired && (
												<button className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium">
													Take Action
												</button>
											)}
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CandidateDashboard;
