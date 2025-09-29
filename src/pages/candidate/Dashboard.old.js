import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const CandidateDashboard = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [profileCompletion, setProfileCompletion] = useState(75);
	const [recommendations, setRecommendations] = useState([]);
	const [applications, setApplications] = useState([]);
	const [notifications, setNotifications] = useState([]);
	const [aiInsights, setAiInsights] = useState(null);
	const [stats, setStats] = useState({});
	const [recentActivity, setRecentActivity] = useState([]);
	const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
	const [skillProgress, setSkillProgress] = useState([]);
	const [loading, setLoading] = useState(true);
	const [selectedTab, setSelectedTab] = useState('overview');

	useEffect(() => {
		loadDashboardData();
	}, []);

	const loadDashboardData = async () => {
		setLoading(true);
		try {
			// Simulate API calls - in real app, these would be actual API calls
			await Promise.all([
				loadRecommendations(),
				loadApplications(),
				loadStats(),
				loadRecentActivity(),
				loadSkillProgress(),
				loadNotifications(),
				loadUpcomingDeadlines(),
			]);
		} catch (error) {
			console.error("Error loading dashboard data:", error);
			toast.error("Failed to load dashboard data");
		} finally {
			setLoading(false);
		}
	};

	const loadRecommendations = async () => {
		// Enhanced recommendations with more data
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

		setApplications([
			{
				id: 1,
				title: "Frontend Developer Intern",
				company: "WebTech Ltd",
				status: "Shortlisted",
				appliedDate: "2024-01-15",
				matchScore: 92,
			},
			{
				id: 2,
				title: "Backend Developer Intern",
				company: "API Solutions",
				status: "Applied",
				appliedDate: "2024-01-20",
				matchScore: 87,
			},
			{
				id: 3,
				title: "Full Stack Intern",
				company: "DevCorp",
				status: "Rejected",
				appliedDate: "2024-01-10",
				matchScore: 78,
			},
		]);

		setNotifications([
			{
				id: 1,
				title: "New recommendation available",
				message: "3 new internships match your profile",
				type: "info",
				time: "2 hours ago",
			},
			{
				id: 2,
				title: "Application status update",
				message:
					"You've been shortlisted for Frontend Developer Intern at WebTech Ltd",
				type: "success",
				time: "1 day ago",
			},
			{
				id: 3,
				title: "Resume analysis complete",
				message: "Your resume has been analyzed. Check out the insights!",
				type: "info",
				time: "3 days ago",
			},
		]);
	}, []);

	const getStatusColor = (status) => {
		switch (status) {
			case "Shortlisted":
				return "text-green-600 bg-green-100";
			case "Applied":
				return "text-blue-600 bg-blue-100";
			case "Rejected":
				return "text-red-600 bg-red-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const getNotificationIcon = (type) => {
		switch (type) {
			case "success":
				return <CheckCircle className="w-5 h-5 text-green-500" />;
			case "info":
				return <AlertCircle className="w-5 h-5 text-blue-500" />;
			default:
				return <AlertCircle className="w-5 h-5 text-gray-500" />;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Welcome back, {user?.firstName || "Candidate"}!
							</h1>
							<p className="text-gray-600 mt-2">
								Here's your personalized dashboard with AI-powered insights and
								internship updates.
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<Link
								href="/profile"
								className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								<User className="w-4 h-4 text-gray-600" />
								<span className="text-gray-700">Profile</span>
							</Link>
							<div className="relative">
								<button className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
									<Bell className="w-5 h-5 text-gray-600" />
								</button>
								{notifications.length > 0 && (
									<span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
										{notifications.length}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* Profile Completion */}
						<div className="card">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-semibold text-gray-900">
									Profile Completion
								</h2>
								<span className="text-sm text-gray-500">
									{profileCompletion}% Complete
								</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-3 mb-4">
								<div
									className="bg-primary h-3 rounded-full transition-all duration-300"
									style={{ width: `${profileCompletion}%` }}
								></div>
							</div>
							<div className="flex items-center justify-between text-sm text-gray-600">
								<span>Complete your profile to get better recommendations</span>
								<Link
									href="/candidate/resume"
									className="text-primary hover:text-blue-700 font-medium"
								>
									Update Profile
								</Link>
							</div>
						</div>

						{/* AI-Powered Features */}
						<div className="card">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-gray-900 flex items-center">
									<Brain className="w-6 h-6 text-purple-600 mr-2" />
									AI-Powered Features
								</h2>
								<span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
									New
								</span>
							</div>
							<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
								<Link
									href="/candidate/ai-resume-analyzer"
									className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group"
								>
									<div className="text-center">
										<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 transition-colors">
											<FileText className="w-6 h-6 text-purple-600" />
										</div>
										<h3 className="font-semibold text-gray-900 mb-1">
											AI Resume Analyzer
										</h3>
										<p className="text-xs text-gray-600">
											Smart resume analysis with AI insights
										</p>
									</div>
								</Link>

								<Link
									href="/candidate/ai-job-recommendations"
									className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group"
								>
									<div className="text-center">
										<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-green-200 transition-colors">
											<Target className="w-6 h-6 text-green-600" />
										</div>
										<h3 className="font-semibold text-gray-900 mb-1">
											Job Matching
										</h3>
										<p className="text-xs text-gray-600">
											AI-powered job recommendations
										</p>
									</div>
								</Link>

								<Link
									href="/candidate/voice-assessment"
									className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
								>
									<div className="text-center">
										<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 transition-colors">
											<Mic className="w-6 h-6 text-blue-600" />
										</div>
										<h3 className="font-semibold text-gray-900 mb-1">
											Voice Assessment
										</h3>
										<p className="text-xs text-gray-600">
											AI voice interview practice
										</p>
									</div>
								</Link>

								<Link
									href="/candidate/coding-profile"
									className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors group"
								>
									<div className="text-center">
										<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 transition-colors">
											<Code className="w-6 h-6 text-orange-600" />
										</div>
										<h3 className="font-semibold text-gray-900 mb-1">
											Coding Profile
										</h3>
										<p className="text-xs text-gray-600">
											GitHub & LeetCode integration
										</p>
									</div>
								</Link>
							</div>
							<div className="mt-4 grid md:grid-cols-2 gap-4">
								<Link
									href="/candidate/skill-prediction"
									className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
								>
									<div className="flex items-center space-x-3">
										<div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
											<TrendingUp className="w-5 h-5 text-indigo-600" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												Skill Prediction
											</h3>
											<p className="text-xs text-gray-600">
												AI career growth insights
											</p>
										</div>
									</div>
								</Link>

								<Link
									href="/candidate/analytics"
									className="p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors group"
								>
									<div className="flex items-center space-x-3">
										<div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
											<BarChart3 className="w-5 h-5 text-red-600" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												Analytics Dashboard
											</h3>
											<p className="text-xs text-gray-600">
												Performance analytics & insights
											</p>
										</div>
									</div>
								</Link>
							</div>
						</div>

						{/* Quick Actions */}
						<div className="grid md:grid-cols-2 gap-6">
							<Link
								href="/candidate/resume"
								className="card hover:shadow-lg transition-shadow duration-300 group"
							>
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
										<FileText className="w-6 h-6 text-primary" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">
											Resume Analyzer
										</h3>
										<p className="text-sm text-gray-600">
											Upload and analyze your resume
										</p>
									</div>
								</div>
							</Link>

							<Link
								href="/candidate/recommendations"
								className="card hover:shadow-lg transition-shadow duration-300 group"
							>
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
										<Target className="w-6 h-6 text-accent" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">
											Recommendations
										</h3>
										<p className="text-sm text-gray-600">
											View personalized matches
										</p>
									</div>
								</div>
							</Link>

							<Link
								href="/candidate/assessments"
								className="card hover:shadow-lg transition-shadow duration-300 group"
							>
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
										<BookOpen className="w-6 h-6 text-purple-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">Assessments</h3>
										<p className="text-sm text-gray-600">
											Take skill assessments
										</p>
									</div>
								</div>
							</Link>

							<Link
								href="/candidate/roadmap"
								className="card hover:shadow-lg transition-shadow duration-300 group"
							>
								<div className="flex items-center space-x-4">
									<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
										<TrendingUp className="w-6 h-6 text-orange-600" />
									</div>
									<div>
										<h3 className="font-semibold text-gray-900">
											Learning Roadmap
										</h3>
										<p className="text-sm text-gray-600">
											Track your skill development
										</p>
									</div>
								</div>
							</Link>
						</div>

						{/* Top Recommendations */}
						<div className="card">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-gray-900">
									Top Recommendations
								</h2>
								<Link
									href="/candidate/recommendations"
									className="text-primary hover:text-blue-700 font-medium"
								>
									View All
								</Link>
							</div>
							<div className="space-y-4">
								{recommendations.slice(0, 3).map((rec) => (
									<div
										key={rec.id}
										className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
									>
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<h3 className="font-semibold text-gray-900 mb-1">
													{rec.title}
												</h3>
												<p className="text-gray-600 text-sm mb-2">
													{rec.company} • {rec.location} • {rec.duration}
												</p>
												<div className="flex flex-wrap gap-2 mb-3">
													{rec.skills.map((skill, index) => (
														<span
															key={index}
															className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
														>
															{skill}
														</span>
													))}
												</div>
												<div className="flex items-center text-sm text-gray-500">
													<Clock className="w-4 h-4 mr-1" />
													Apply by {new Date(rec.deadline).toLocaleDateString()}
												</div>
											</div>
											<div className="text-right ml-4">
												<div className="text-2xl font-bold text-primary mb-1">
													{rec.matchScore}%
												</div>
												<div className="text-xs text-gray-500">Match Score</div>
												<button className="btn-primary text-sm px-4 py-2 mt-2">
													Apply Now
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Recent Applications */}
						<div className="card">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-semibold text-gray-900">
									Recent Applications
								</h3>
								<Link
									href="/candidate/applications"
									className="text-primary hover:text-blue-700 text-sm"
								>
									View All
								</Link>
							</div>
							<div className="space-y-3">
								{applications.slice(0, 3).map((app) => (
									<div
										key={app.id}
										className="flex items-center justify-between py-2"
									>
										<div className="flex-1">
											<p className="font-medium text-gray-900 text-sm">
												{app.title}
											</p>
											<p className="text-gray-600 text-xs">{app.company}</p>
										</div>
										<div className="text-right">
											<span
												className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
													app.status
												)}`}
											>
												{app.status}
											</span>
											<p className="text-xs text-gray-500 mt-1">
												{app.matchScore}% match
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Notifications */}
						<div className="card">
							<h3 className="font-semibold text-gray-900 mb-4">
								Notifications
							</h3>
							<div className="space-y-3">
								{notifications.map((notification) => (
									<div
										key={notification.id}
										className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
									>
										{getNotificationIcon(notification.type)}
										<div className="flex-1">
											<p className="font-medium text-gray-900 text-sm">
												{notification.title}
											</p>
											<p className="text-gray-600 text-xs">
												{notification.message}
											</p>
											<p className="text-gray-400 text-xs mt-1">
												{notification.time}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Stats */}
						<div className="card">
							<h3 className="font-semibold text-gray-900 mb-4">Your Stats</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Applications Sent</span>
									<span className="font-semibold text-gray-900">
										{applications.length}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Shortlisted</span>
									<span className="font-semibold text-green-600">
										{
											applications.filter((app) => app.status === "Shortlisted")
												.length
										}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Avg. Match Score</span>
									<span className="font-semibold text-primary">
										{Math.round(
											applications.reduce(
												(acc, app) => acc + app.matchScore,
												0
											) / applications.length
										)}
										%
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CandidateDashboard;
