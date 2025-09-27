import React, { useState, useEffect } from "react";
import {
	TrendingUp,
	Target,
	Star,
	BookOpen,
	Award,
	Calendar,
	ChevronRight,
	BarChart3,
	PieChart,
	Clock,
	CheckCircle,
	ArrowUp,
	ArrowDown,
	Zap,
	Brain,
	RefreshCw,
} from "lucide-react";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

const SkillPredictionDashboard = () => {
	const [predictions, setPredictions] = useState(null);
	const [loading, setLoading] = useState(false);
	const [selectedSkill, setSelectedSkill] = useState(null);
	const [timeFrame, setTimeFrame] = useState("6_months");

	useEffect(() => {
		fetchPredictions();
	}, [timeFrame]);

	const fetchPredictions = async () => {
		setLoading(true);
		try {
			const response = await apiService.getSkillPredictions(timeFrame);
			if (response.data.success) {
				setPredictions(response.data.predictions);
				toast.success("Skill predictions loaded successfully!");
			} else {
				toast.error("Failed to load skill predictions");
			}
		} catch (error) {
			console.error("Error fetching predictions:", error);
			toast.error("Error fetching skill predictions");
		} finally {
			setLoading(false);
		}
	};

	const getSkillLevel = (score) => {
		if (score >= 80)
			return { level: "Expert", color: "text-green-600", bg: "bg-green-100" };
		if (score >= 60)
			return { level: "Advanced", color: "text-blue-600", bg: "bg-blue-100" };
		if (score >= 40)
			return {
				level: "Intermediate",
				color: "text-yellow-600",
				bg: "bg-yellow-100",
			};
		return { level: "Beginner", color: "text-red-600", bg: "bg-red-100" };
	};

	const getTrendIcon = (trend) => {
		return trend === "up" ? (
			<ArrowUp className="w-4 h-4 text-green-600" />
		) : trend === "down" ? (
			<ArrowDown className="w-4 h-4 text-red-600" />
		) : (
			<div className="w-4 h-4" />
		);
	};

	const getDemandLevel = (demand) => {
		if (demand >= 80)
			return { level: "Very High", color: "text-red-600", bg: "bg-red-100" };
		if (demand >= 60)
			return { level: "High", color: "text-orange-600", bg: "bg-orange-100" };
		if (demand >= 40)
			return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-100" };
		return { level: "Low", color: "text-green-600", bg: "bg-green-100" };
	};

	if (loading && !predictions) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
				<span className="ml-2 text-lg">Loading Skill Predictions...</span>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<Brain className="w-8 h-8 text-purple-600" />
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							AI Skill Prediction Dashboard
						</h1>
						<p className="text-gray-600">
							Predict your career growth and skill development path
						</p>
					</div>
				</div>

				<div className="flex items-center space-x-4">
					<select
						value={timeFrame}
						onChange={(e) => setTimeFrame(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
					>
						<option value="3_months">3 Months</option>
						<option value="6_months">6 Months</option>
						<option value="1_year">1 Year</option>
						<option value="2_years">2 Years</option>
					</select>

					<button
						onClick={fetchPredictions}
						disabled={loading}
						className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
					>
						<RefreshCw
							className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
						/>
						Refresh
					</button>
				</div>
			</div>

			{predictions && (
				<>
					{/* Overall Career Score */}
					<div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold">Career Growth Score</h2>
								<p className="text-purple-100">
									Predicted progress in {timeFrame.replace("_", " ")}
								</p>
							</div>
							<div className="text-right">
								<div className="text-4xl font-bold">
									{predictions.career_score}/100
								</div>
								<div className="flex items-center text-lg">
									{getTrendIcon(predictions.career_trend)}
									<span className="ml-1">
										{predictions.career_growth > 0 ? "+" : ""}
										{predictions.career_growth}%
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Current Skills Overview */}
					<div className="grid md:grid-cols-2 gap-6">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<Star className="w-5 h-5 mr-2 text-yellow-600" />
								Current Skills Assessment
							</h3>
							<div className="space-y-4">
								{predictions.current_skills?.map((skill, index) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<div className="flex-1">
											<div className="flex items-center justify-between mb-1">
												<span className="font-medium text-gray-900">
													{skill.name}
												</span>
												<span
													className={`px-2 py-1 rounded text-xs ${
														getSkillLevel(skill.current_level).color
													} ${getSkillLevel(skill.current_level).bg}`}
												>
													{getSkillLevel(skill.current_level).level}
												</span>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2">
												<div
													className="bg-blue-600 h-2 rounded-full transition-all duration-300"
													style={{ width: `${skill.current_level}%` }}
												></div>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<TrendingUp className="w-5 h-5 mr-2 text-green-600" />
								Predicted Growth
							</h3>
							<div className="space-y-4">
								{predictions.growth_predictions?.map((skill, index) => (
									<div
										key={index}
										className="flex items-center justify-between"
									>
										<div className="flex-1">
											<div className="flex items-center justify-between mb-1">
												<span className="font-medium text-gray-900">
													{skill.name}
												</span>
												<div className="flex items-center">
													{getTrendIcon(skill.trend)}
													<span className="ml-1 text-sm font-medium text-green-600">
														+{skill.predicted_growth}%
													</span>
												</div>
											</div>
											<div className="w-full bg-gray-200 rounded-full h-2">
												<div
													className="bg-green-600 h-2 rounded-full transition-all duration-300"
													style={{ width: `${skill.predicted_level}%` }}
												></div>
											</div>
											<div className="text-xs text-gray-600 mt-1">
												Target: {getSkillLevel(skill.predicted_level).level}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Market Demand Analysis */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-lg font-semibold mb-4 flex items-center">
							<BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
							Market Demand Analysis
						</h3>
						<div className="grid md:grid-cols-3 gap-4">
							{predictions.market_demand?.map((skill, index) => (
								<div key={index} className="border rounded-lg p-4">
									<div className="flex items-center justify-between mb-2">
										<h4 className="font-medium text-gray-900">{skill.name}</h4>
										<span
											className={`px-2 py-1 rounded text-xs ${
												getDemandLevel(skill.demand_score).color
											} ${getDemandLevel(skill.demand_score).bg}`}
										>
											{getDemandLevel(skill.demand_score).level}
										</span>
									</div>
									<div className="text-sm text-gray-600 mb-2">
										Average Salary: ${skill.avg_salary?.toLocaleString()}
									</div>
									<div className="text-sm text-gray-600">
										Job Openings: {skill.job_openings?.toLocaleString()}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Recommended Learning Path */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h3 className="text-lg font-semibold mb-4 flex items-center">
							<BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
							Recommended Learning Path
						</h3>
						<div className="space-y-4">
							{predictions.learning_path?.map((step, index) => (
								<div
									key={index}
									className="flex items-start border-l-4 border-indigo-500 pl-4"
								>
									<div className="flex-1">
										<div className="flex items-center justify-between mb-2">
											<h4 className="font-medium text-gray-900">
												{step.title}
											</h4>
											<div className="flex items-center text-sm text-gray-600">
												<Clock className="w-4 h-4 mr-1" />
												{step.duration}
											</div>
										</div>
										<p className="text-gray-600 text-sm mb-2">
											{step.description}
										</p>
										<div className="flex items-center space-x-4">
											<span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
												{step.difficulty}
											</span>
											<span className="text-xs text-gray-500">
												Priority: {step.priority}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Skills to Develop */}
					<div className="grid md:grid-cols-2 gap-6">
						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<Zap className="w-5 h-5 mr-2 text-yellow-600" />
								High-Priority Skills
							</h3>
							<div className="space-y-3">
								{predictions.priority_skills?.map((skill, index) => (
									<div
										key={index}
										className="flex items-center justify-between p-3 border rounded-lg"
									>
										<div>
											<h4 className="font-medium text-gray-900">
												{skill.name}
											</h4>
											<p className="text-sm text-gray-600">{skill.reason}</p>
										</div>
										<div className="text-right">
											<div className="text-sm font-medium text-green-600">
												ROI: {skill.roi}%
											</div>
											<div className="text-xs text-gray-500">
												{skill.time_to_learn}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-md p-6">
							<h3 className="text-lg font-semibold mb-4 flex items-center">
								<Target className="w-5 h-5 mr-2 text-red-600" />
								Career Milestones
							</h3>
							<div className="space-y-3">
								{predictions.milestones?.map((milestone, index) => (
									<div key={index} className="flex items-start">
										<div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
											<span className="text-blue-600 font-semibold text-sm">
												{index + 1}
											</span>
										</div>
										<div className="flex-1">
											<h4 className="font-medium text-gray-900">
												{milestone.title}
											</h4>
											<p className="text-sm text-gray-600">
												{milestone.description}
											</p>
											<div className="flex items-center mt-2 space-x-4">
												<span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
													{milestone.timeline}
												</span>
												<span className="text-xs text-gray-500">
													Success Rate: {milestone.success_rate}%
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Action Items */}
					<div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
						<h3 className="text-lg font-semibold mb-4 flex items-center text-green-800">
							<CheckCircle className="w-5 h-5 mr-2" />
							Recommended Actions
						</h3>
						<div className="grid md:grid-cols-2 gap-4">
							<div>
								<h4 className="font-medium text-gray-900 mb-2">
									Immediate Actions (Next 30 days)
								</h4>
								<ul className="space-y-2">
									{predictions.immediate_actions?.map((action, index) => (
										<li key={index} className="flex items-start">
											<ChevronRight className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
											<span className="text-sm text-gray-700">{action}</span>
										</li>
									))}
								</ul>
							</div>
							<div>
								<h4 className="font-medium text-gray-900 mb-2">
									Long-term Goals ({timeFrame.replace("_", " ")})
								</h4>
								<ul className="space-y-2">
									{predictions.long_term_goals?.map((goal, index) => (
										<li key={index} className="flex items-start">
											<ChevronRight className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
											<span className="text-sm text-gray-700">{goal}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default SkillPredictionDashboard;
