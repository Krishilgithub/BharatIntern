import React, { useState, useEffect } from "react";
import {
	Star,
	TrendingUp,
	MapPin,
	Clock,
	DollarSign,
	Brain,
	Target,
	BookOpen,
	ChevronRight,
	Sparkles,
	Lightbulb,
} from "lucide-react";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

const AIJobRecommendations = () => {
	const [recommendations, setRecommendations] = useState(null);
	const [loading, setLoading] = useState(false);
	const [userProfile, setUserProfile] = useState({
		skills: "React, JavaScript, Python, HTML, CSS",
		experience: 2,
		preferences: {
			location: "Bangalore",
			jobType: "internship",
			industry: "technology",
		},
	});

	useEffect(() => {
		loadRecommendations();
	}, []);

	const loadRecommendations = async () => {
		setLoading(true);
		try {
			const response = await apiService.getJobRecommendations(
				1, // candidate_id
				userProfile.skills,
				userProfile.experience
			);

			if (response.data.success) {
				setRecommendations(response.data.recommendations);
			} else {
				toast.error("Failed to load recommendations");
			}
		} catch (error) {
			console.error("Error loading recommendations:", error);
			toast.error("Error loading recommendations");
		} finally {
			setLoading(false);
		}
	};

	const getMatchScoreColor = (score) => {
		if (score >= 0.9) return "bg-green-500";
		if (score >= 0.7) return "bg-blue-500";
		if (score >= 0.5) return "bg-yellow-500";
		return "bg-red-500";
	};

	const getGrowthPotentialIcon = (potential) => {
		switch (potential) {
			case "high":
				return <TrendingUp className="w-4 h-4 text-green-600" />;
			case "medium":
				return <Target className="w-4 h-4 text-blue-600" />;
			default:
				return <Clock className="w-4 h-4 text-gray-600" />;
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center space-x-3">
				<Brain className="w-8 h-8 text-purple-600" />
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						AI Job Recommendations
					</h1>
					<p className="text-gray-600">
						Personalized job matches powered by AI
					</p>
				</div>
			</div>

			{/* Profile Summary */}
			<div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white">
				<h2 className="text-lg font-semibold mb-4">Your Profile Summary</h2>
				<div className="grid md:grid-cols-3 gap-4">
					<div>
						<p className="text-purple-100">Skills</p>
						<p className="font-medium">{userProfile.skills}</p>
					</div>
					<div>
						<p className="text-purple-100">Experience</p>
						<p className="font-medium">{userProfile.experience} years</p>
					</div>
					<div>
						<p className="text-purple-100">Preferred Location</p>
						<p className="font-medium">{userProfile.preferences.location}</p>
					</div>
				</div>
			</div>

			{recommendations && (
				<>
					{/* Recommended Jobs */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-lg font-semibold mb-4 flex items-center">
							<Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
							Recommended Jobs for You
						</h2>

						<div className="space-y-4">
							{recommendations.personalized_jobs?.map((job, index) => (
								<div
									key={job.job_id}
									className="border rounded-lg p-4 hover:shadow-md transition-shadow"
								>
									<div className="flex justify-between items-start mb-3">
										<div>
											<h3 className="text-lg font-semibold text-gray-900">
												{job.title}
											</h3>
											<p className="text-gray-600">{job.company}</p>
										</div>
										<div className="text-right">
											<div className="flex items-center space-x-2">
												<span className="text-sm font-medium text-gray-600">
													Match
												</span>
												<div
													className={`px-2 py-1 rounded-full text-white text-sm font-medium ${getMatchScoreColor(
														job.match_score
													)}`}
												>
													{Math.round(job.match_score * 100)}%
												</div>
											</div>
										</div>
									</div>

									<div className="grid md:grid-cols-3 gap-4 mb-3">
										<div className="flex items-center space-x-2">
											<DollarSign className="w-4 h-4 text-green-600" />
											<span className="text-sm text-gray-700">
												{job.stipend}
											</span>
										</div>
										<div className="flex items-center space-x-2">
											<MapPin className="w-4 h-4 text-blue-600" />
											<span className="text-sm text-gray-700">
												{job.location}
											</span>
										</div>
										<div className="flex items-center space-x-2">
											{getGrowthPotentialIcon(job.growth_potential)}
											<span className="text-sm text-gray-700 capitalize">
												{job.growth_potential} Growth
											</span>
										</div>
									</div>

									<div className="mb-3">
										<p className="text-sm font-medium text-gray-900 mb-1">
											Why this matches you:
										</p>
										<div className="flex flex-wrap gap-2">
											{job.reasons?.map((reason, idx) => (
												<span
													key={idx}
													className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
												>
													{reason}
												</span>
											))}
										</div>
									</div>

									<button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center">
										Apply Now
										<ChevronRight className="w-4 h-4 ml-2" />
									</button>
								</div>
							))}
						</div>
					</div>

					{/* Skill Development Suggestions */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-lg font-semibold mb-4 flex items-center">
							<Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
							Skill Development Suggestions
						</h2>

						<div className="space-y-4">
							{recommendations.skill_development_suggestions?.map(
								(suggestion, index) => (
									<div key={index} className="border-l-4 border-blue-500 pl-4">
										<div className="flex justify-between items-start mb-2">
											<h3 className="font-semibold text-gray-900">
												{suggestion.skill}
											</h3>
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													suggestion.priority === "high"
														? "bg-red-100 text-red-800"
														: suggestion.priority === "medium"
														? "bg-yellow-100 text-yellow-800"
														: "bg-green-100 text-green-800"
												}`}
											>
												{suggestion.priority} priority
											</span>
										</div>
										<p className="text-gray-600 mb-2">{suggestion.reason}</p>
										<div className="flex flex-wrap gap-2">
											{suggestion.resources?.map((resource, idx) => (
												<a
													key={idx}
													href="#"
													className="text-blue-600 hover:text-blue-800 text-sm underline"
												>
													{resource}
												</a>
											))}
										</div>
									</div>
								)
							)}
						</div>
					</div>

					{/* Learning Roadmap */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-lg font-semibold mb-4 flex items-center">
							<BookOpen className="w-5 h-5 mr-2 text-green-500" />
							Your Learning Roadmap
						</h2>

						<div className="space-y-6">
							{/* Short Term */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-2 flex items-center">
									<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
									Short Term (1-3 months)
								</h3>
								<ul className="ml-5 space-y-1">
									{recommendations.learning_roadmap?.short_term?.map(
										(item, index) => (
											<li
												key={index}
												className="text-gray-700 flex items-center"
											>
												<ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
												{item}
											</li>
										)
									)}
								</ul>
							</div>

							{/* Medium Term */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-2 flex items-center">
									<div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
									Medium Term (3-6 months)
								</h3>
								<ul className="ml-5 space-y-1">
									{recommendations.learning_roadmap?.medium_term?.map(
										(item, index) => (
											<li
												key={index}
												className="text-gray-700 flex items-center"
											>
												<ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
												{item}
											</li>
										)
									)}
								</ul>
							</div>

							{/* Long Term */}
							<div>
								<h3 className="font-semibold text-gray-900 mb-2 flex items-center">
									<div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
									Long Term (6+ months)
								</h3>
								<ul className="ml-5 space-y-1">
									{recommendations.learning_roadmap?.long_term?.map(
										(item, index) => (
											<li
												key={index}
												className="text-gray-700 flex items-center"
											>
												<ChevronRight className="w-4 h-4 mr-2 text-gray-400" />
												{item}
											</li>
										)
									)}
								</ul>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex space-x-4">
						<button
							onClick={loadRecommendations}
							className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
						>
							<Brain className="w-4 h-4 mr-2" />
							Refresh Recommendations
						</button>
						<button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
							<Target className="w-4 h-4 mr-2" />
							Update Preferences
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default AIJobRecommendations;
