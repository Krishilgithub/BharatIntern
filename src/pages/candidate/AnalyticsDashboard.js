import React, { useState, useEffect } from "react";
import {
	BarChart3,
	PieChart,
	TrendingUp,
	AlertTriangle,
	Shield,
	Eye,
	Users,
	Activity,
	Clock,
	Target,
	CheckCircle,
	XCircle,
	RefreshCw,
} from "lucide-react";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

const AnalyticsDashboard = () => {
	const [analytics, setAnalytics] = useState(null);
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("overview");

	useEffect(() => {
		fetchAnalytics();
	}, []);

	const fetchAnalytics = async () => {
		setLoading(true);
		try {
			const response = await apiService.getAnalytics();
			if (response.data.success) {
				setAnalytics(response.data.analytics);
				toast.success("Analytics loaded successfully!");
			} else {
				toast.error("Failed to load analytics");
			}
		} catch (error) {
			console.error("Error fetching analytics:", error);
			toast.error("Error fetching analytics");
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "high":
				return "text-red-600 bg-red-100";
			case "medium":
				return "text-yellow-600 bg-yellow-100";
			case "low":
				return "text-green-600 bg-green-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const getBiasLevel = (score) => {
		if (score >= 8)
			return { level: "Low Bias", color: "text-green-600", bg: "bg-green-100" };
		if (score >= 6)
			return {
				level: "Moderate Bias",
				color: "text-yellow-600",
				bg: "bg-yellow-100",
			};
		return { level: "High Bias", color: "text-red-600", bg: "bg-red-100" };
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
				<span className="ml-2 text-lg">Loading Analytics...</span>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<BarChart3 className="w-8 h-8 text-blue-600" />
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							AI Analytics Dashboard
						</h1>
						<p className="text-gray-600">
							Monitor AI performance, bias, and fraud detection
						</p>
					</div>
				</div>
				<button
					onClick={fetchAnalytics}
					className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
				>
					<RefreshCw className="w-4 h-4 mr-2" />
					Refresh
				</button>
			</div>

			{/* Tabs */}
			<div className="bg-white rounded-lg shadow-md">
				<div className="border-b border-gray-200">
					<nav className="flex space-x-8 px-6">
						{[
							{ id: "overview", label: "Overview", icon: BarChart3 },
							{ id: "fraud", label: "Fraud Detection", icon: Shield },
							{ id: "bias", label: "Bias Analysis", icon: Eye },
							{ id: "performance", label: "Performance", icon: TrendingUp },
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
									activeTab === tab.id
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<tab.icon className="w-4 h-4 mr-2" />
								{tab.label}
							</button>
						))}
					</nav>
				</div>

				<div className="p-6">
					{/* Overview Tab */}
					{activeTab === "overview" && analytics && (
						<div className="space-y-6">
							{/* Key Metrics */}
							<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
								<div className="bg-blue-50 p-6 rounded-lg">
									<div className="flex items-center">
										<Users className="w-8 h-8 text-blue-600" />
										<div className="ml-4">
											<p className="text-sm font-medium text-gray-600">
												Total Applications
											</p>
											<p className="text-2xl font-bold text-gray-900">
												{analytics.total_applications}
											</p>
										</div>
									</div>
								</div>

								<div className="bg-green-50 p-6 rounded-lg">
									<div className="flex items-center">
										<CheckCircle className="w-8 h-8 text-green-600" />
										<div className="ml-4">
											<p className="text-sm font-medium text-gray-600">
												Match Rate
											</p>
											<p className="text-2xl font-bold text-gray-900">
												{analytics.match_rate}%
											</p>
										</div>
									</div>
								</div>

								<div className="bg-yellow-50 p-6 rounded-lg">
									<div className="flex items-center">
										<Clock className="w-8 h-8 text-yellow-600" />
										<div className="ml-4">
											<p className="text-sm font-medium text-gray-600">
												Avg Processing
											</p>
											<p className="text-2xl font-bold text-gray-900">
												{analytics.avg_processing_time}s
											</p>
										</div>
									</div>
								</div>

								<div className="bg-red-50 p-6 rounded-lg">
									<div className="flex items-center">
										<AlertTriangle className="w-8 h-8 text-red-600" />
										<div className="ml-4">
											<p className="text-sm font-medium text-gray-600">
												Fraud Detected
											</p>
											<p className="text-2xl font-bold text-gray-900">
												{analytics.fraud_detected}
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Recent Activity */}
							<div className="bg-white rounded-lg border p-6">
								<h3 className="text-lg font-semibold mb-4 flex items-center">
									<Activity className="w-5 h-5 mr-2 text-blue-600" />
									Recent AI Activity
								</h3>
								<div className="space-y-3">
									{analytics.recent_activity?.map((activity, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
										>
											<div className="flex items-center">
												<div
													className={`w-2 h-2 rounded-full mr-3 ${getStatusColor(
														activity.type
													)
														.replace("text-", "bg-")
														.replace("bg-", "bg-")}`}
												></div>
												<div>
													<p className="font-medium text-gray-900">
														{activity.action}
													</p>
													<p className="text-sm text-gray-600">
														{activity.details}
													</p>
												</div>
											</div>
											<span className="text-sm text-gray-500">
												{activity.timestamp}
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Fraud Detection Tab */}
					{activeTab === "fraud" && analytics && (
						<div className="space-y-6">
							<div className="bg-red-50 border border-red-200 rounded-lg p-6">
								<div className="flex items-center mb-4">
									<Shield className="w-6 h-6 text-red-600 mr-2" />
									<h3 className="text-lg font-semibold text-red-800">
										Fraud Detection Summary
									</h3>
								</div>
								<p className="text-red-700">
									Our AI system has detected {analytics.fraud_detected}{" "}
									potentially fraudulent applications out of{" "}
									{analytics.total_applications} total applications.
								</p>
							</div>

							{/* Fraud Patterns */}
							<div className="grid md:grid-cols-2 gap-6">
								<div className="bg-white border rounded-lg p-6">
									<h4 className="font-semibold text-gray-900 mb-4">
										Fraud Patterns Detected
									</h4>
									<div className="space-y-3">
										{analytics.fraud_patterns?.map((pattern, index) => (
											<div
												key={index}
												className="flex items-center justify-between"
											>
												<span className="text-gray-700">{pattern.type}</span>
												<div className="flex items-center">
													<span
														className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
															pattern.risk_level
														)}`}
													>
														{pattern.risk_level.toUpperCase()}
													</span>
													<span className="ml-2 text-sm font-medium">
														{pattern.count}
													</span>
												</div>
											</div>
										))}
									</div>
								</div>

								<div className="bg-white border rounded-lg p-6">
									<h4 className="font-semibold text-gray-900 mb-4">
										Prevention Measures
									</h4>
									<div className="space-y-3">
										{analytics.prevention_measures?.map((measure, index) => (
											<div key={index} className="flex items-start">
												<CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
												<div>
													<p className="text-gray-900 font-medium">
														{measure.title}
													</p>
													<p className="text-gray-600 text-sm">
														{measure.description}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* Flagged Applications */}
							<div className="bg-white border rounded-lg p-6">
								<h4 className="font-semibold text-gray-900 mb-4">
									Recently Flagged Applications
								</h4>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b">
												<th className="text-left py-2">Application ID</th>
												<th className="text-left py-2">Risk Score</th>
												<th className="text-left py-2">Reason</th>
												<th className="text-left py-2">Status</th>
											</tr>
										</thead>
										<tbody>
											{analytics.flagged_applications?.map((app) => (
												<tr key={app.id} className="border-b">
													<td className="py-2 font-mono text-sm">{app.id}</td>
													<td className="py-2">
														<span
															className={`px-2 py-1 rounded ${getStatusColor(
																app.risk_level
															)}`}
														>
															{app.risk_score}%
														</span>
													</td>
													<td className="py-2 text-sm">{app.reason}</td>
													<td className="py-2">
														<span className="text-sm text-gray-600">
															{app.status}
														</span>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					)}

					{/* Bias Analysis Tab */}
					{activeTab === "bias" && analytics && (
						<div className="space-y-6">
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
								<div className="flex items-center mb-4">
									<Eye className="w-6 h-6 text-blue-600 mr-2" />
									<h3 className="text-lg font-semibold text-blue-800">
										Fairness Analysis
									</h3>
								</div>
								<p className="text-blue-700">
									Our AI fairness score is {analytics.fairness_score}/10,
									indicating {getBiasLevel(analytics.fairness_score).level}.
								</p>
							</div>

							{/* Bias Metrics */}
							<div className="grid md:grid-cols-3 gap-6">
								{analytics.bias_metrics?.map((metric, index) => (
									<div key={index} className="bg-white border rounded-lg p-6">
										<h4 className="font-semibold text-gray-900 mb-2">
											{metric.category}
										</h4>
										<div className="flex items-center justify-between">
											<span
												className={`px-3 py-1 rounded-full text-sm ${
													getBiasLevel(metric.score).color
												} ${getBiasLevel(metric.score).bg}`}
											>
												{getBiasLevel(metric.score).level}
											</span>
											<span className="text-lg font-bold">
												{metric.score}/10
											</span>
										</div>
										<p className="text-sm text-gray-600 mt-2">
											{metric.description}
										</p>
									</div>
								))}
							</div>

							{/* Improvement Recommendations */}
							<div className="bg-white border rounded-lg p-6">
								<h4 className="font-semibold text-gray-900 mb-4">
									Bias Mitigation Recommendations
								</h4>
								<div className="space-y-4">
									{analytics.bias_recommendations?.map((rec, index) => (
										<div
											key={index}
											className="border-l-4 border-blue-500 pl-4"
										>
											<h5 className="font-medium text-gray-900">{rec.title}</h5>
											<p className="text-gray-600 text-sm">{rec.description}</p>
											<span
												className={`inline-block mt-2 px-2 py-1 rounded text-xs ${getStatusColor(
													rec.priority
												)}`}
											>
												{rec.priority.toUpperCase()} PRIORITY
											</span>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Performance Tab */}
					{activeTab === "performance" && analytics && (
						<div className="space-y-6">
							{/* Performance Metrics */}
							<div className="grid md:grid-cols-2 gap-6">
								<div className="bg-white border rounded-lg p-6">
									<h4 className="font-semibold text-gray-900 mb-4 flex items-center">
										<Target className="w-5 h-5 mr-2 text-green-600" />
										Model Accuracy
									</h4>
									<div className="space-y-3">
										{analytics.model_performance?.map((model, index) => (
											<div
												key={index}
												className="flex items-center justify-between"
											>
												<span className="text-gray-700">{model.name}</span>
												<div className="flex items-center">
													<div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
														<div
															className="bg-green-600 h-2 rounded-full"
															style={{ width: `${model.accuracy}%` }}
														></div>
													</div>
													<span className="text-sm font-medium">
														{model.accuracy}%
													</span>
												</div>
											</div>
										))}
									</div>
								</div>

								<div className="bg-white border rounded-lg p-6">
									<h4 className="font-semibold text-gray-900 mb-4 flex items-center">
										<Clock className="w-5 h-5 mr-2 text-blue-600" />
										Response Times
									</h4>
									<div className="space-y-3">
										{analytics.response_times?.map((endpoint, index) => (
											<div
												key={index}
												className="flex items-center justify-between"
											>
												<span className="text-gray-700">
													{endpoint.endpoint}
												</span>
												<span className="text-sm font-medium">
													{endpoint.avg_time}ms
												</span>
											</div>
										))}
									</div>
								</div>
							</div>

							{/* System Health */}
							<div className="bg-white border rounded-lg p-6">
								<h4 className="font-semibold text-gray-900 mb-4">
									System Health
								</h4>
								<div className="grid md:grid-cols-4 gap-4">
									<div className="text-center">
										<div className="text-2xl font-bold text-green-600">
											99.9%
										</div>
										<div className="text-sm text-gray-600">Uptime</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-blue-600">1.2M</div>
										<div className="text-sm text-gray-600">Requests/day</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-yellow-600">
											45ms
										</div>
										<div className="text-sm text-gray-600">Avg Latency</div>
									</div>
									<div className="text-center">
										<div className="text-2xl font-bold text-red-600">0.01%</div>
										<div className="text-sm text-gray-600">Error Rate</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default AnalyticsDashboard;
