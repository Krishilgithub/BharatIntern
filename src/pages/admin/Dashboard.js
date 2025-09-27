import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
	BarChart3,
	Users,
	Target,
	AlertCircle,
	CheckCircle,
	PieChart,
	Activity,
	Building,
	Briefcase,
	Settings,
	Shield,
	TrendingUp,
	UserCheck,
	Database,
	Globe,
	Zap,
	Monitor,
	Bell,
	User,
	Filter,
	Search,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const AdminDashboard = () => {
	const { user } = useAuth();
	const [stats, setStats] = useState({});
	const [quotaData, setQuotaData] = useState({});
	const [recentActivity, setRecentActivity] = useState([]);
	const [topCompanies, setTopCompanies] = useState([]);
	const [topSkills, setTopSkills] = useState([]);
	const [activeTab, setActiveTab] = useState("overview");

	useEffect(() => {
		// Mock data - in real app, this would come from API
		setStats({
			totalCandidates: 1250,
			totalCompanies: 45,
			totalPostings: 78,
			totalApplications: 3420,
			quotaFilled: 68,
			avgMatchScore: 82,
			conversionRate: 15.2,
			responseTime: 2.3,
		});

		setQuotaData({
			general: { target: 40, filled: 28, percentage: 70 },
			obc: { target: 27, filled: 18, percentage: 67 },
			sc: { target: 15, filled: 12, percentage: 80 },
			st: { target: 7.5, filled: 4, percentage: 53 },
			ews: { target: 10, filled: 6, percentage: 60 },
			women: { target: 30, filled: 22, percentage: 73 },
		});

		setRecentActivity([
			{
				id: 1,
				type: "matching",
				message: "Batch matching completed for 150 candidates",
				timestamp: "2 hours ago",
				status: "success",
			},
			{
				id: 2,
				type: "quota",
				message: "SC quota exceeded by 5% - manual review required",
				timestamp: "4 hours ago",
				status: "warning",
			},
			{
				id: 3,
				type: "application",
				message: "New high-priority application received",
				timestamp: "6 hours ago",
				status: "info",
			},
			{
				id: 4,
				type: "system",
				message: "System maintenance completed successfully",
				timestamp: "1 day ago",
				status: "success",
			},
		]);

		setTopCompanies([
			{
				name: "TechCorp India",
				applications: 245,
				shortlisted: 45,
				selected: 12,
			},
			{
				name: "DataViz Solutions",
				applications: 189,
				shortlisted: 38,
				selected: 8,
			},
			{ name: "WebTech Ltd", applications: 156, shortlisted: 32, selected: 6 },
			{ name: "StartupXYZ", applications: 134, shortlisted: 28, selected: 5 },
			{ name: "DesignStudio", applications: 98, shortlisted: 20, selected: 4 },
		]);

		setTopSkills([
			{ skill: "JavaScript", demand: 85, supply: 72, gap: 13 },
			{ skill: "Python", demand: 78, supply: 65, gap: 13 },
			{ skill: "React", demand: 72, supply: 58, gap: 14 },
			{ skill: "Node.js", demand: 68, supply: 45, gap: 23 },
			{ skill: "Machine Learning", demand: 65, supply: 38, gap: 27 },
		]);
	}, []);

	const getActivityIcon = (type) => {
		switch (type) {
			case "matching":
				return <Target className="w-5 h-5 text-blue-500" />;
			case "quota":
				return <PieChart className="w-5 h-5 text-yellow-500" />;
			case "application":
				return <Users className="w-5 h-5 text-green-500" />;
			case "system":
				return <Activity className="w-5 h-5 text-purple-500" />;
			default:
				return <AlertCircle className="w-5 h-5 text-gray-500" />;
		}
	};

	const getActivityStatusColor = (status) => {
		switch (status) {
			case "success":
				return "text-green-600 bg-green-100";
			case "warning":
				return "text-yellow-600 bg-yellow-100";
			case "info":
				return "text-blue-600 bg-blue-100";
			case "error":
				return "text-red-600 bg-red-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">
								Administrator Dashboard
							</h1>
							<p className="text-gray-600 mt-2">
								System management and oversight for BharatIntern platform
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<Link
								to="/profile"
								className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
							>
								<User className="h-5 w-5 text-gray-600" />
							</Link>
							<div className="relative">
								<button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
									<Bell className="h-5 w-5 text-gray-600" />
								</button>
								<span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
									5
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Admin Tools Section */}
				<div className="mb-8">
					<h2 className="text-xl font-semibold text-gray-900 mb-4">
						System Management Tools
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
						<Link
							to="/admin/quota-configurator"
							className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300"
						>
							<div className="flex items-center justify-center mb-4">
								<PieChart className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								Quota Management
							</h3>
							<p className="text-sm text-gray-600">
								Configure allocation quotas
							</p>
						</Link>

						<Link
							to="/admin/batch-matching"
							className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300"
						>
							<div className="flex items-center justify-center mb-4">
								<Target className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								Batch Matching
							</h3>
							<p className="text-sm text-gray-600">
								AI-powered allocation system
							</p>
						</Link>

						<Link
							to="/admin/whatif-simulator"
							className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300"
						>
							<div className="flex items-center justify-center mb-4">
								<BarChart3 className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								What-If Simulator
							</h3>
							<p className="text-sm text-gray-600">
								Scenario planning and analysis
							</p>
						</Link>

						<Link
							to="/admin/allocation-review"
							className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-300"
						>
							<div className="flex items-center justify-center mb-4">
								<CheckCircle className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								Allocation Review
							</h3>
							<p className="text-sm text-gray-600">
								Review and approve allocations
							</p>
						</Link>

						<div className="group p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 hover:shadow-md transition-all duration-300 cursor-pointer">
							<div className="flex items-center justify-center mb-4">
								<Shield className="h-8 w-8 text-red-600 group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								Security Center
							</h3>
							<p className="text-sm text-gray-600">
								System security and audits
							</p>
						</div>

						<div className="group p-6 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl border border-teal-200 hover:shadow-md transition-all duration-300 cursor-pointer">
							<div className="flex items-center justify-center mb-4">
								<Database className="h-8 w-8 text-teal-600 group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								Data Management
							</h3>
							<p className="text-sm text-gray-600">Database and backup tools</p>
						</div>

						<div className="group p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 hover:shadow-md transition-all duration-300 cursor-pointer">
							<div className="flex items-center justify-center mb-4">
								<Monitor className="h-8 w-8 text-indigo-600 group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								System Monitor
							</h3>
							<p className="text-sm text-gray-600">
								Performance and health metrics
							</p>
						</div>

						<div className="group p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border border-pink-200 hover:shadow-md transition-all duration-300 cursor-pointer">
							<div className="flex items-center justify-center mb-4">
								<Settings className="h-8 w-8 text-pink-600 group-hover:scale-110 transition-transform" />
							</div>
							<h3 className="font-semibold text-gray-900 mb-2">
								System Settings
							</h3>
							<p className="text-sm text-gray-600">Platform configuration</p>
						</div>
					</div>
				</div>

				{/* Key Metrics */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
					<div className="card text-center">
						<div className="text-3xl font-bold text-primary mb-2">
							{stats.totalCandidates}
						</div>
						<div className="text-gray-600">Total Candidates</div>
					</div>
					<div className="card text-center">
						<div className="text-3xl font-bold text-accent mb-2">
							{stats.totalCompanies}
						</div>
						<div className="text-gray-600">Partner Companies</div>
					</div>
					<div className="card text-center">
						<div className="text-3xl font-bold text-yellow-600 mb-2">
							{stats.totalPostings}
						</div>
						<div className="text-gray-600">Active Postings</div>
					</div>
					<div className="card text-center">
						<div className="text-3xl font-bold text-green-600 mb-2">
							{stats.quotaFilled}%
						</div>
						<div className="text-gray-600">Quota Filled</div>
					</div>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-8">
						{/* Quick Actions */}
						<div className="card">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Quick Actions
							</h2>
							<div className="grid md:grid-cols-2 gap-4">
								<Link
									to="/admin/quota-config"
									className="card hover:shadow-lg transition-shadow duration-300 group"
								>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
											<PieChart className="w-6 h-6 text-primary" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												Quota Configuration
											</h3>
											<p className="text-sm text-gray-600">
												Manage quota settings and policies
											</p>
										</div>
									</div>
								</Link>

								<Link
									to="/admin/simulator"
									className="card hover:shadow-lg transition-shadow duration-300 group"
								>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
											<BarChart3 className="w-6 h-6 text-accent" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												What-If Simulator
											</h3>
											<p className="text-sm text-gray-600">
												Test different quota scenarios
											</p>
										</div>
									</div>
								</Link>

								<Link
									to="/admin/batch-matching"
									className="card hover:shadow-lg transition-shadow duration-300 group"
								>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
											<Target className="w-6 h-6 text-purple-600" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												Batch Matching
											</h3>
											<p className="text-sm text-gray-600">
												Run automated matching process
											</p>
										</div>
									</div>
								</Link>

								<Link
									to="/admin/allocation-review"
									className="card hover:shadow-lg transition-shadow duration-300 group"
								>
									<div className="flex items-center space-x-4">
										<div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
											<CheckCircle className="w-6 h-6 text-orange-600" />
										</div>
										<div>
											<h3 className="font-semibold text-gray-900">
												Allocation Review
											</h3>
											<p className="text-sm text-gray-600">
												Review and approve allocations
											</p>
										</div>
									</div>
								</Link>
							</div>
						</div>

						{/* Quota Status */}
						<div className="card">
							<h2 className="text-xl font-semibold text-gray-900 mb-6">
								Quota Status
							</h2>
							<div className="space-y-4">
								{Object.entries(quotaData).map(([category, data]) => (
									<div
										key={category}
										className="flex items-center justify-between"
									>
										<div className="flex-1">
											<div className="flex items-center justify-between mb-1">
												<span className="text-sm font-medium text-gray-900 capitalize">
													{category === "obc"
														? "OBC"
														: category === "sc"
														? "SC"
														: category === "st"
														? "ST"
														: category === "ews"
														? "EWS"
														: category}
												</span>
												<span className="text-sm text-gray-600">
													{data.filled}/{data.target} ({data.percentage}%)
												</span>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2">
												<div
													className={`h-2 rounded-full transition-all duration-300 ${
														data.percentage >= 100
															? "bg-red-500"
															: data.percentage >= 80
															? "bg-green-500"
															: data.percentage >= 60
															? "bg-yellow-500"
															: "bg-gray-400"
													}`}
													style={{
														width: `${Math.min(data.percentage, 100)}%`,
													}}
												></div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Top Companies */}
						<div className="card">
							<h2 className="text-xl font-semibold text-gray-900 mb-6">
								Top Performing Companies
							</h2>
							<div className="space-y-4">
								{topCompanies.map((company, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
									>
										<div className="flex-1">
											<h3 className="font-medium text-gray-900">
												{company.name}
											</h3>
											<div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
												<span>{company.applications} applications</span>
												<span>{company.shortlisted} shortlisted</span>
												<span>{company.selected} selected</span>
											</div>
										</div>
										<div className="text-right">
											<div className="text-lg font-bold text-primary">
												{Math.round(
													(company.selected / company.applications) * 100
												)}
												%
											</div>
											<div className="text-xs text-gray-500">Conversion</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* System Performance */}
						<div className="card">
							<h3 className="font-semibold text-gray-900 mb-4">
								System Performance
							</h3>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Avg. Match Score</span>
									<span className="font-semibold text-gray-900">
										{stats.avgMatchScore}%
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Conversion Rate</span>
									<span className="font-semibold text-gray-900">
										{stats.conversionRate}%
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Response Time</span>
									<span className="font-semibold text-gray-900">
										{stats.responseTime} days
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">System Uptime</span>
									<span className="font-semibold text-green-600">99.9%</span>
								</div>
							</div>
						</div>

						{/* Skill Gap Analysis */}
						<div className="card">
							<h3 className="font-semibold text-gray-900 mb-4">
								Skill Gap Analysis
							</h3>
							<div className="space-y-3">
								{topSkills.slice(0, 5).map((skill, index) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<div className="flex-1">
											<div className="text-sm font-medium text-gray-900">
												{skill.skill}
											</div>
											<div className="text-xs text-gray-600">
												Demand: {skill.demand}% | Supply: {skill.supply}%
											</div>
										</div>
										<div
											className={`text-sm font-bold ${
												skill.gap > 20
													? "text-red-600"
													: skill.gap > 10
													? "text-yellow-600"
													: "text-green-600"
											}`}
										>
											{skill.gap}%
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Recent Activity */}
						<div className="card">
							<h3 className="font-semibold text-gray-900 mb-4">
								Recent Activity
							</h3>
							<div className="space-y-3">
								{recentActivity.map((activity) => (
									<div key={activity.id} className="flex items-start space-x-3">
										{getActivityIcon(activity.type)}
										<div className="flex-1">
											<p className="text-sm text-gray-900">
												{activity.message}
											</p>
											<div className="flex items-center space-x-2 mt-1">
												<span className="text-xs text-gray-500">
													{activity.timestamp}
												</span>
												<span
													className={`px-2 py-1 text-xs rounded-full ${getActivityStatusColor(
														activity.status
													)}`}
												>
													{activity.status}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Alerts */}
						<div className="card bg-yellow-50 border border-yellow-200">
							<div className="flex items-start space-x-3">
								<AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-1" />
								<div>
									<h3 className="font-medium text-yellow-900">System Alerts</h3>
									<ul className="mt-2 space-y-1 text-sm text-yellow-800">
										<li>• ST quota needs attention (53% filled)</li>
										<li>• High demand for Node.js skills</li>
										<li>• 3 companies pending verification</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
