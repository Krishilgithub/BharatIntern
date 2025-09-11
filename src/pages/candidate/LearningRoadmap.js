import React, { useState, useEffect } from "react";
import {
	BookOpen,
	CheckCircle,
	Clock,
	Play,
	ExternalLink,
	X,
} from "lucide-react";

const LearningRoadmap = () => {
	const [roadmap, setRoadmap] = useState([]);
	const [currentSkill, setCurrentSkill] = useState(null);
	const [progress, setProgress] = useState({});

	useEffect(() => {
		// Mock data - in real app, this would come from API
		const mockRoadmap = [
			{
				id: 1,
				skill: "JavaScript",
				category: "Programming",
				currentLevel: 3,
				targetLevel: 5,
				maxLevel: 5,
				description: "Master JavaScript fundamentals and advanced concepts",
				impact: "+25%",
				priority: "High",
				estimatedTime: "4 weeks",
				resources: [
					{
						title: "JavaScript Fundamentals Course",
						type: "Course",
						duration: "2 weeks",
						difficulty: "Beginner",
						completed: true,
						url: "#",
					},
					{
						title: "ES6+ Features Tutorial",
						type: "Tutorial",
						duration: "1 week",
						difficulty: "Intermediate",
						completed: true,
						url: "#",
					},
					{
						title: "Advanced JavaScript Patterns",
						type: "Course",
						duration: "2 weeks",
						difficulty: "Advanced",
						completed: false,
						url: "#",
					},
					{
						title: "JavaScript Best Practices",
						type: "Article",
						duration: "3 days",
						difficulty: "Intermediate",
						completed: false,
						url: "#",
					},
				],
				milestones: [
					{
						title: "Complete Fundamentals",
						completed: true,
						date: "2024-01-15",
					},
					{ title: "Learn ES6+ Features", completed: true, date: "2024-01-22" },
					{ title: "Build 3 Projects", completed: false, date: null },
					{ title: "Pass Advanced Assessment", completed: false, date: null },
				],
			},
			{
				id: 2,
				skill: "React",
				category: "Frontend",
				currentLevel: 2,
				targetLevel: 4,
				maxLevel: 5,
				description: "Learn React development and modern frontend practices",
				impact: "+20%",
				priority: "High",
				estimatedTime: "6 weeks",
				resources: [
					{
						title: "React Basics Course",
						type: "Course",
						duration: "3 weeks",
						difficulty: "Beginner",
						completed: true,
						url: "#",
					},
					{
						title: "React Hooks Deep Dive",
						type: "Tutorial",
						duration: "1 week",
						difficulty: "Intermediate",
						completed: false,
						url: "#",
					},
					{
						title: "State Management with Redux",
						type: "Course",
						duration: "2 weeks",
						difficulty: "Intermediate",
						completed: false,
						url: "#",
					},
				],
				milestones: [
					{
						title: "Complete React Basics",
						completed: true,
						date: "2024-01-10",
					},
					{ title: "Build First React App", completed: false, date: null },
					{ title: "Learn State Management", completed: false, date: null },
					{ title: "Deploy React App", completed: false, date: null },
				],
			},
			{
				id: 3,
				skill: "Node.js",
				category: "Backend",
				currentLevel: 1,
				targetLevel: 3,
				maxLevel: 5,
				description: "Master server-side JavaScript development",
				impact: "+15%",
				priority: "Medium",
				estimatedTime: "5 weeks",
				resources: [
					{
						title: "Node.js Fundamentals",
						type: "Course",
						duration: "2 weeks",
						difficulty: "Beginner",
						completed: false,
						url: "#",
					},
					{
						title: "Express.js Framework",
						type: "Tutorial",
						duration: "1 week",
						difficulty: "Intermediate",
						completed: false,
						url: "#",
					},
					{
						title: "Database Integration",
						type: "Course",
						duration: "2 weeks",
						difficulty: "Intermediate",
						completed: false,
						url: "#",
					},
				],
				milestones: [
					{ title: "Learn Node.js Basics", completed: false, date: null },
					{ title: "Build REST API", completed: false, date: null },
					{ title: "Database Integration", completed: false, date: null },
				],
			},
			{
				id: 4,
				skill: "TypeScript",
				category: "Programming",
				currentLevel: 0,
				targetLevel: 3,
				maxLevel: 5,
				description: "Add type safety to your JavaScript development",
				impact: "+30%",
				priority: "High",
				estimatedTime: "3 weeks",
				resources: [
					{
						title: "TypeScript Basics",
						type: "Course",
						duration: "1 week",
						difficulty: "Beginner",
						completed: false,
						url: "#",
					},
					{
						title: "Advanced TypeScript",
						type: "Course",
						duration: "2 weeks",
						difficulty: "Advanced",
						completed: false,
						url: "#",
					},
				],
				milestones: [
					{ title: "Learn TypeScript Basics", completed: false, date: null },
					{ title: "Convert JS Project to TS", completed: false, date: null },
					{ title: "Master Advanced Types", completed: false, date: null },
				],
			},
			{
				id: 5,
				skill: "Docker",
				category: "DevOps",
				currentLevel: 0,
				targetLevel: 2,
				maxLevel: 5,
				description: "Learn containerization and deployment",
				impact: "+20%",
				priority: "Medium",
				estimatedTime: "2 weeks",
				resources: [
					{
						title: "Docker Fundamentals",
						type: "Course",
						duration: "1 week",
						difficulty: "Beginner",
						completed: false,
						url: "#",
					},
					{
						title: "Docker Compose",
						type: "Tutorial",
						duration: "3 days",
						difficulty: "Intermediate",
						completed: false,
						url: "#",
					},
				],
				milestones: [
					{ title: "Learn Docker Basics", completed: false, date: null },
					{ title: "Containerize an App", completed: false, date: null },
				],
			},
		];

		setRoadmap(mockRoadmap);

		// Calculate progress for each skill
		const progressData = {};
		mockRoadmap.forEach((skill) => {
			const completedResources = skill.resources.filter(
				(r) => r.completed
			).length;
			const totalResources = skill.resources.length;
			const completedMilestones = skill.milestones.filter(
				(m) => m.completed
			).length;
			const totalMilestones = skill.milestones.length;

			progressData[skill.id] = {
				resources: Math.round((completedResources / totalResources) * 100),
				milestones: Math.round((completedMilestones / totalMilestones) * 100),
				overall: Math.round(
					((completedResources + completedMilestones) /
						(totalResources + totalMilestones)) *
						100
				),
			};
		});

		setProgress(progressData);
	}, []);

	const getPriorityColor = (priority) => {
		switch (priority) {
			case "High":
				return "text-red-600 bg-red-100";
			case "Medium":
				return "text-yellow-600 bg-yellow-100";
			case "Low":
				return "text-green-600 bg-green-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const getDifficultyColor = (difficulty) => {
		switch (difficulty) {
			case "Beginner":
				return "text-green-600 bg-green-100";
			case "Intermediate":
				return "text-yellow-600 bg-yellow-100";
			case "Advanced":
				return "text-red-600 bg-red-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const getResourceIcon = (type) => {
		switch (type) {
			case "Course":
				return <BookOpen className="w-4 h-4" />;
			case "Tutorial":
				return <Play className="w-4 h-4" />;
			case "Article":
				return <ExternalLink className="w-4 h-4" />;
			default:
				return <BookOpen className="w-4 h-4" />;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Learning Roadmap</h1>
					<p className="text-gray-600 mt-2">
						Personalized skill development path based on your career goals and
						current abilities.
					</p>
				</div>

				{/* Overview Stats */}
				<div className="grid md:grid-cols-4 gap-6 mb-8">
					<div className="card text-center">
						<div className="text-3xl font-bold text-primary mb-2">
							{roadmap.length}
						</div>
						<div className="text-gray-600">Skills to Learn</div>
					</div>
					<div className="card text-center">
						<div className="text-3xl font-bold text-accent mb-2">
							{
								roadmap.filter((skill) => progress[skill.id]?.overall === 100)
									.length
							}
						</div>
						<div className="text-gray-600">Skills Mastered</div>
					</div>
					<div className="card text-center">
						<div className="text-3xl font-bold text-yellow-600 mb-2">
							{roadmap.reduce(
								(acc, skill) =>
									acc + skill.resources.filter((r) => r.completed).length,
								0
							)}
						</div>
						<div className="text-gray-600">Resources Completed</div>
					</div>
					<div className="card text-center">
						<div className="text-3xl font-bold text-green-600 mb-2">
							{roadmap.reduce(
								(acc, skill) =>
									acc + skill.milestones.filter((m) => m.completed).length,
								0
							)}
						</div>
						<div className="text-gray-600">Milestones Achieved</div>
					</div>
				</div>

				{/* Skills Grid */}
				<div className="grid lg:grid-cols-2 gap-6">
					{roadmap.map((skill) => (
						<div
							key={skill.id}
							className="card hover:shadow-lg transition-shadow duration-300"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1">
									<h3 className="text-xl font-semibold text-gray-900 mb-2">
										{skill.skill}
									</h3>
									<p className="text-gray-600 text-sm mb-3">
										{skill.description}
									</p>
									<div className="flex items-center space-x-2 mb-3">
										<span
											className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
												skill.priority
											)}`}
										>
											{skill.priority} Priority
										</span>
										<span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
											{skill.category}
										</span>
									</div>
								</div>
								<div className="text-right">
									<div className="text-2xl font-bold text-primary mb-1">
										{skill.impact}
									</div>
									<div className="text-xs text-gray-500">Impact</div>
								</div>
							</div>

							{/* Skill Level */}
							<div className="mb-4">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm font-medium text-gray-700">
										Skill Level
									</span>
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

							{/* Progress */}
							<div className="grid grid-cols-2 gap-4 mb-4">
								<div className="text-center">
									<div className="text-lg font-bold text-gray-900">
										{progress[skill.id]?.overall || 0}%
									</div>
									<div className="text-xs text-gray-600">Overall Progress</div>
								</div>
								<div className="text-center">
									<div className="text-lg font-bold text-gray-900">
										{skill.estimatedTime}
									</div>
									<div className="text-xs text-gray-600">Est. Time</div>
								</div>
							</div>

							{/* Resources Preview */}
							<div className="mb-4">
								<h4 className="text-sm font-medium text-gray-900 mb-2">
									Learning Resources:
								</h4>
								<div className="space-y-2">
									{skill.resources.slice(0, 2).map((resource, index) => (
										<div
											key={index}
											className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
										>
											<div className="flex items-center space-x-2">
												{getResourceIcon(resource.type)}
												<span className="text-sm text-gray-900">
													{resource.title}
												</span>
												<span
													className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(
														resource.difficulty
													)}`}
												>
													{resource.difficulty}
												</span>
											</div>
											<div className="flex items-center space-x-2">
												{resource.completed ? (
													<CheckCircle className="w-4 h-4 text-green-500" />
												) : (
													<Clock className="w-4 h-4 text-gray-400" />
												)}
												<span className="text-xs text-gray-500">
													{resource.duration}
												</span>
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
								<h4 className="text-sm font-medium text-gray-900 mb-2">
									Milestones:
								</h4>
								<div className="space-y-1">
									{skill.milestones.slice(0, 3).map((milestone, index) => (
										<div key={index} className="flex items-center space-x-2">
											{milestone.completed ? (
												<CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
											) : (
												<div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
											)}
											<span
												className={`text-sm ${
													milestone.completed
														? "text-gray-900"
														: "text-gray-600"
												}`}
											>
												{milestone.title}
											</span>
										</div>
									))}
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center justify-between pt-4 border-t border-gray-200">
								<div className="text-sm text-gray-500">
									{skill.resources.filter((r) => r.completed).length}/
									{skill.resources.length} resources completed
								</div>
								<button
									onClick={() => setCurrentSkill(skill)}
									className="btn-primary text-sm px-4 py-2"
								>
									View Details
								</button>
							</div>
						</div>
					))}
				</div>

				{/* Skill Detail Modal */}
				{currentSkill && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6">
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-2xl font-bold text-gray-900">
										{currentSkill.skill} Learning Path
									</h2>
									<button
										onClick={() => setCurrentSkill(null)}
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
											{currentSkill.resources.map((resource, index) => (
												<div
													key={index}
													className="border border-gray-200 rounded-lg p-4"
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
													<div className="flex items-center space-x-4 text-sm text-gray-600">
														<span>{resource.type}</span>
														<span>•</span>
														<span>{resource.duration}</span>
														<span
															className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(
																resource.difficulty
															)}`}
														>
															{resource.difficulty}
														</span>
													</div>
												</div>
											))}
										</div>
									</div>

									{/* Milestones */}
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-4">
											Milestones
										</h3>
										<div className="space-y-3">
											{currentSkill.milestones.map((milestone, index) => (
												<div
													key={index}
													className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
												>
													{milestone.completed ? (
														<CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
													) : (
														<div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
													)}
													<div className="flex-1">
														<div
															className={`font-medium ${
																milestone.completed
																	? "text-gray-900"
																	: "text-gray-600"
															}`}
														>
															{milestone.title}
														</div>
														{milestone.date && (
															<div className="text-sm text-gray-500">
																Completed on{" "}
																{new Date(milestone.date).toLocaleDateString()}
															</div>
														)}
													</div>
												</div>
											))}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default LearningRoadmap;
