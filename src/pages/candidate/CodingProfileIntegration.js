import React, { useState, useEffect } from "react";
import {
	Github,
	Code,
	Trophy,
	Star,
	GitBranch,
	Users,
	TrendingUp,
	Target,
	Award,
	ExternalLink,
	RefreshCw,
} from "lucide-react";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

const CodingProfileIntegration = () => {
	const [profiles, setProfiles] = useState(null);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		githubUsername: "",
		leetcodeUsername: "",
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const fetchProfiles = async () => {
		if (!formData.githubUsername) {
			toast.error("Please enter your GitHub username");
			return;
		}

		setLoading(true);
		try {
			const response = await apiService.getCodingProfile(
				formData.githubUsername,
				formData.leetcodeUsername
			);

			if (response.data.success) {
				setProfiles(response.data.profile);
				toast.success("Profiles loaded successfully!");
			} else {
				toast.error("Failed to load profiles");
			}
		} catch (error) {
			console.error("Error fetching profiles:", error);
			toast.error("Error fetching profiles");
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

	const getLanguageColor = (language) => {
		const colors = {
			JavaScript: "bg-yellow-500",
			Python: "bg-blue-500",
			Java: "bg-red-500",
			TypeScript: "bg-blue-600",
			HTML: "bg-orange-500",
			CSS: "bg-blue-400",
			React: "bg-blue-500",
			"Node.js": "bg-green-600",
			default: "bg-gray-500",
		};
		return colors[language] || colors.default;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center space-x-3">
				<Code className="w-8 h-8 text-green-600" />
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Coding Profile Integration
					</h1>
					<p className="text-gray-600">
						Connect your coding profiles for AI-powered analysis
					</p>
				</div>
			</div>

			{/* Profile Input */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-lg font-semibold mb-4">Connect Your Profiles</h2>

				<div className="grid md:grid-cols-2 gap-4 mb-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							GitHub Username *
						</label>
						<div className="relative">
							<Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="text"
								name="githubUsername"
								value={formData.githubUsername}
								onChange={handleInputChange}
								placeholder="your-github-username"
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							LeetCode Username (Optional)
						</label>
						<div className="relative">
							<Code className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
							<input
								type="text"
								name="leetcodeUsername"
								value={formData.leetcodeUsername}
								onChange={handleInputChange}
								placeholder="your-leetcode-username"
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
					</div>
				</div>

				<button
					onClick={fetchProfiles}
					disabled={loading}
					className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
				>
					{loading ? (
						<>
							<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
							Fetching Profiles...
						</>
					) : (
						<>
							<Target className="w-4 h-4 mr-2" />
							Analyze Profiles
						</>
					)}
				</button>
			</div>

			{/* Profile Analysis Results */}
			{profiles && (
				<>
					{/* Overall Score */}
					<div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-2xl font-bold">Overall Coding Score</h2>
								<p className="text-green-100">
									Based on your GitHub and LeetCode activity
								</p>
							</div>
							<div className="text-right">
								<div className="text-4xl font-bold">
									{profiles.overall_skill_score}
								</div>
								<div
									className={`text-lg font-medium ${
										getSkillLevel(profiles.overall_skill_score).color
									}`}
								>
									{getSkillLevel(profiles.overall_skill_score).level}
								</div>
							</div>
						</div>
					</div>

					{/* GitHub Profile */}
					{profiles.github && (
						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold flex items-center">
									<Github className="w-5 h-5 mr-2" />
									GitHub Profile
								</h2>
								<a
									href={`https://github.com/${profiles.github.username}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center text-blue-600 hover:text-blue-800"
								>
									View Profile
									<ExternalLink className="w-4 h-4 ml-1" />
								</a>
							</div>

							<div className="grid md:grid-cols-3 gap-6 mb-6">
								<div className="text-center p-4 bg-gray-50 rounded-lg">
									<GitBranch className="w-8 h-8 text-blue-600 mx-auto mb-2" />
									<div className="text-2xl font-bold text-gray-900">
										{profiles.github.public_repos}
									</div>
									<div className="text-sm text-gray-600">
										Public Repositories
									</div>
								</div>

								<div className="text-center p-4 bg-gray-50 rounded-lg">
									<Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
									<div className="text-2xl font-bold text-gray-900">
										{profiles.github.followers}
									</div>
									<div className="text-sm text-gray-600">Followers</div>
								</div>

								<div className="text-center p-4 bg-gray-50 rounded-lg">
									<Code className="w-8 h-8 text-purple-600 mx-auto mb-2" />
									<div className="text-2xl font-bold text-gray-900">
										{profiles.github.languages?.length || 0}
									</div>
									<div className="text-sm text-gray-600">Languages</div>
								</div>
							</div>

							{/* Languages */}
							<div className="mb-6">
								<h3 className="text-md font-semibold text-gray-900 mb-3">
									Programming Languages
								</h3>
								<div className="flex flex-wrap gap-2">
									{profiles.github.languages?.map((language, index) => (
										<span
											key={index}
											className={`px-3 py-1 rounded-full text-white text-sm ${getLanguageColor(
												language
											)}`}
										>
											{language}
										</span>
									))}
								</div>
							</div>

							{/* Top Repositories */}
							<div>
								<h3 className="text-md font-semibold text-gray-900 mb-3">
									Top Repositories
								</h3>
								<div className="space-y-3">
									{profiles.github.top_repos?.map((repo, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-3 border rounded-lg"
										>
											<div>
												<h4 className="font-medium text-gray-900">
													{repo.name}
												</h4>
												<p className="text-sm text-gray-600">{repo.language}</p>
											</div>
											<div className="flex items-center space-x-2">
												<Star className="w-4 h-4 text-yellow-500" />
												<span className="text-sm font-medium">
													{repo.stars}
												</span>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* LeetCode Profile */}
					{profiles.leetcode && (
						<div className="bg-white rounded-lg shadow-md p-6">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-lg font-semibold flex items-center">
									<Trophy className="w-5 h-5 mr-2 text-yellow-600" />
									LeetCode Profile
								</h2>
								<a
									href={`https://leetcode.com/${profiles.leetcode.username}`}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center text-blue-600 hover:text-blue-800"
								>
									View Profile
									<ExternalLink className="w-4 h-4 ml-1" />
								</a>
							</div>

							<div className="grid md:grid-cols-4 gap-4 mb-6">
								<div className="text-center p-4 bg-green-50 rounded-lg">
									<div className="text-2xl font-bold text-green-600">
										{profiles.leetcode.problems_solved}
									</div>
									<div className="text-sm text-gray-600">Total Solved</div>
								</div>

								<div className="text-center p-4 bg-blue-50 rounded-lg">
									<div className="text-2xl font-bold text-blue-600">
										{profiles.leetcode.easy_solved}
									</div>
									<div className="text-sm text-gray-600">Easy</div>
								</div>

								<div className="text-center p-4 bg-yellow-50 rounded-lg">
									<div className="text-2xl font-bold text-yellow-600">
										{profiles.leetcode.medium_solved}
									</div>
									<div className="text-sm text-gray-600">Medium</div>
								</div>

								<div className="text-center p-4 bg-red-50 rounded-lg">
									<div className="text-2xl font-bold text-red-600">
										{profiles.leetcode.hard_solved}
									</div>
									<div className="text-sm text-gray-600">Hard</div>
								</div>
							</div>

							<div className="grid md:grid-cols-2 gap-4">
								<div className="p-4 bg-gray-50 rounded-lg">
									<div className="text-lg font-bold text-gray-900">
										{Math.round(profiles.leetcode.acceptance_rate * 100)}%
									</div>
									<div className="text-sm text-gray-600">Acceptance Rate</div>
								</div>

								<div className="p-4 bg-gray-50 rounded-lg">
									<div className="text-lg font-bold text-gray-900">
										#{profiles.leetcode.ranking?.toLocaleString()}
									</div>
									<div className="text-sm text-gray-600">Global Ranking</div>
								</div>
							</div>
						</div>
					)}

					{/* Recommendations */}
					<div className="bg-white rounded-lg shadow-md p-6">
						<h2 className="text-lg font-semibold mb-4 flex items-center">
							<TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
							Improvement Recommendations
						</h2>

						<div className="space-y-4">
							<div className="border-l-4 border-blue-500 pl-4">
								<h3 className="font-semibold text-gray-900">
									Increase Repository Activity
								</h3>
								<p className="text-gray-600">
									Consider contributing to more open source projects or creating
									new repositories to showcase your skills.
								</p>
							</div>

							<div className="border-l-4 border-green-500 pl-4">
								<h3 className="font-semibold text-gray-900">
									Practice More Algorithm Problems
								</h3>
								<p className="text-gray-600">
									Focus on medium and hard problems to improve your
									problem-solving skills and coding interview performance.
								</p>
							</div>

							<div className="border-l-4 border-purple-500 pl-4">
								<h3 className="font-semibold text-gray-900">
									Learn New Technologies
								</h3>
								<p className="text-gray-600">
									Consider learning trending technologies like TypeScript,
									React, or cloud platforms to stay competitive.
								</p>
							</div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex space-x-4">
						<button
							onClick={fetchProfiles}
							className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
						>
							<RefreshCw className="w-4 h-4 mr-2" />
							Refresh Analysis
						</button>
						<button className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
							<Award className="w-4 h-4 mr-2" />
							Generate Certificate
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default CodingProfileIntegration;
