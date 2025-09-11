import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, Play, Award, RefreshCw } from "lucide-react";

const MicroAssessments = () => {
	const [assessments, setAssessments] = useState([]);
	const [currentAssessment, setCurrentAssessment] = useState(null);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [answers, setAnswers] = useState({});
	const [timeLeft, setTimeLeft] = useState(0);
	const [showResults, setShowResults] = useState(false);

	useEffect(() => {
		// Mock data - in real app, this would come from API
		const mockAssessments = [
			{
				id: 1,
				title: "JavaScript Fundamentals",
				description:
					"Test your knowledge of JavaScript basics, ES6 features, and common patterns.",
				duration: 30, // minutes
				questions: 20,
				difficulty: "Beginner",
				skills: ["JavaScript", "ES6", "DOM", "Async Programming"],
				category: "Programming",
				attempts: 0,
				bestScore: 0,
				isCompleted: false,
			},
			{
				id: 2,
				title: "React Development",
				description:
					"Assess your React skills including components, hooks, state management, and lifecycle.",
				duration: 45,
				questions: 25,
				difficulty: "Intermediate",
				skills: ["React", "JSX", "Hooks", "State Management", "Props"],
				category: "Frontend",
				attempts: 1,
				bestScore: 75,
				isCompleted: true,
			},
			{
				id: 3,
				title: "Data Structures & Algorithms",
				description:
					"Evaluate your understanding of common data structures and algorithmic thinking.",
				duration: 60,
				questions: 30,
				difficulty: "Advanced",
				skills: ["Arrays", "Linked Lists", "Trees", "Sorting", "Searching"],
				category: "Computer Science",
				attempts: 0,
				bestScore: 0,
				isCompleted: false,
			},
			{
				id: 4,
				title: "Python Programming",
				description:
					"Test your Python programming skills including syntax, libraries, and best practices.",
				duration: 40,
				questions: 22,
				difficulty: "Intermediate",
				skills: ["Python", "OOP", "Libraries", "Data Types", "Functions"],
				category: "Programming",
				attempts: 2,
				bestScore: 88,
				isCompleted: true,
			},
			{
				id: 5,
				title: "SQL Database Queries",
				description:
					"Assess your SQL skills for database querying, joins, and optimization.",
				duration: 35,
				questions: 18,
				difficulty: "Intermediate",
				skills: ["SQL", "Joins", "Subqueries", "Indexing", "Normalization"],
				category: "Database",
				attempts: 1,
				bestScore: 82,
				isCompleted: true,
			},
			{
				id: 6,
				title: "System Design Basics",
				description:
					"Test your understanding of system design principles and scalability concepts.",
				duration: 50,
				questions: 15,
				difficulty: "Advanced",
				skills: [
					"System Design",
					"Scalability",
					"Load Balancing",
					"Caching",
					"Microservices",
				],
				category: "System Design",
				attempts: 0,
				bestScore: 0,
				isCompleted: false,
			},
		];

		setAssessments(mockAssessments);
	}, []);

	const startAssessment = (assessment) => {
		setCurrentAssessment(assessment);
		setCurrentQuestion(0);
		setAnswers({});
		setTimeLeft(assessment.duration * 60); // Convert to seconds
		setShowResults(false);
	};

	const submitAnswer = (questionId, answer) => {
		setAnswers((prev) => ({
			...prev,
			[questionId]: answer,
		}));
	};

	const nextQuestion = () => {
		if (currentQuestion < currentAssessment.questions - 1) {
			setCurrentQuestion(currentQuestion + 1);
		} else {
			finishAssessment();
		}
	};

	const previousQuestion = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion(currentQuestion - 1);
		}
	};

	const finishAssessment = () => {
		// Calculate score (mock calculation)
		const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-100

		// Update assessment with new attempt
		setAssessments((prev) =>
			prev.map((assessment) =>
				assessment.id === currentAssessment.id
					? {
							...assessment,
							attempts: assessment.attempts + 1,
							bestScore: Math.max(assessment.bestScore, score),
							isCompleted: true,
					  }
					: assessment
			)
		);

		setShowResults(true);
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

	const getScoreColor = (score) => {
		if (score >= 90) return "text-green-600";
		if (score >= 80) return "text-blue-600";
		if (score >= 70) return "text-yellow-600";
		return "text-red-600";
	};

	// Mock questions for the assessment
	const mockQuestions = [
		{
			id: 1,
			question: "What is the correct way to declare a variable in JavaScript?",
			options: [
				"var name = 'John';",
				"variable name = 'John';",
				"v name = 'John';",
				"declare name = 'John';",
			],
			correct: 0,
		},
		{
			id: 2,
			question:
				"Which method is used to add an element to the end of an array?",
			options: ["push()", "append()", "add()", "insert()"],
			correct: 0,
		},
		{
			id: 3,
			question: "What does 'this' refer to in JavaScript?",
			options: [
				"The current function",
				"The current object",
				"The global object",
				"The parent object",
			],
			correct: 1,
		},
	];

	if (currentAssessment && !showResults) {
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					{/* Assessment Header */}
					<div className="card mb-6">
						<div className="flex items-center justify-between mb-4">
							<h1 className="text-2xl font-bold text-gray-900">
								{currentAssessment.title}
							</h1>
							<div className="flex items-center space-x-4">
								<div className="text-sm text-gray-600">
									Question {currentQuestion + 1} of{" "}
									{currentAssessment.questions}
								</div>
								<div className="flex items-center space-x-2 text-sm text-gray-600">
									<Clock className="w-4 h-4" />
									<span>
										{Math.floor(timeLeft / 60)}:
										{(timeLeft % 60).toString().padStart(2, "0")}
									</span>
								</div>
							</div>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2">
							<div
								className="bg-primary h-2 rounded-full transition-all duration-300"
								style={{
									width: `${
										((currentQuestion + 1) / currentAssessment.questions) * 100
									}%`,
								}}
							></div>
						</div>
					</div>

					{/* Question */}
					<div className="card mb-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-6">
							{mockQuestions[currentQuestion]?.question || "Sample Question"}
						</h2>
						<div className="space-y-3">
							{mockQuestions[currentQuestion]?.options.map((option, index) => (
								<label
									key={index}
									className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
								>
									<input
										type="radio"
										name={`question-${currentQuestion}`}
										value={index}
										checked={answers[currentQuestion] === index}
										onChange={() => submitAnswer(currentQuestion, index)}
										className="w-4 h-4 text-primary"
									/>
									<span className="text-gray-900">{option}</span>
								</label>
							))}
						</div>
					</div>

					{/* Navigation */}
					<div className="flex items-center justify-between">
						<button
							onClick={previousQuestion}
							disabled={currentQuestion === 0}
							className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
						>
							Previous
						</button>
						<button onClick={nextQuestion} className="btn-primary">
							{currentQuestion === currentAssessment.questions - 1
								? "Finish"
								: "Next"}
						</button>
					</div>
				</div>
			</div>
		);
	}

	if (showResults) {
		const score = Math.floor(Math.random() * 40) + 60;
		return (
			<div className="min-h-screen bg-gray-50 py-8">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="card text-center">
						<div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<Award className="w-12 h-12 text-green-500" />
						</div>
						<h1 className="text-3xl font-bold text-gray-900 mb-4">
							Assessment Complete!
						</h1>
						<div className="text-6xl font-bold text-primary mb-2">{score}%</div>
						<p className="text-xl text-gray-600 mb-8">
							Great job on completing the assessment!
						</p>

						<div className="grid md:grid-cols-3 gap-6 mb-8">
							<div className="bg-gray-50 rounded-lg p-4">
								<div className="text-2xl font-bold text-gray-900">
									{currentAssessment.questions}
								</div>
								<div className="text-sm text-gray-600">Total Questions</div>
							</div>
							<div className="bg-gray-50 rounded-lg p-4">
								<div className="text-2xl font-bold text-gray-900">
									{currentAssessment.duration}
								</div>
								<div className="text-sm text-gray-600">Minutes</div>
							</div>
							<div className="bg-gray-50 rounded-lg p-4">
								<div className="text-2xl font-bold text-gray-900">
									{currentAssessment.attempts + 1}
								</div>
								<div className="text-sm text-gray-600">Attempts</div>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<button
								onClick={() => setShowResults(false)}
								className="btn-primary"
							>
								Back to Assessments
							</button>
							<button
								onClick={() => startAssessment(currentAssessment)}
								className="btn-secondary"
							>
								<RefreshCw className="w-4 h-4 mr-2" />
								Retake Assessment
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Micro Assessments
					</h1>
					<p className="text-gray-600 mt-2">
						Test your skills with our comprehensive assessments and track your
						progress.
					</p>
				</div>

				{/* Stats */}
				<div className="grid md:grid-cols-4 gap-6 mb-8">
					<div className="card text-center">
						<div className="text-3xl font-bold text-primary mb-2">
							{assessments.length}
						</div>
						<div className="text-gray-600">Total Assessments</div>
					</div>
					<div className="card text-center">
						<div className="text-3xl font-bold text-accent mb-2">
							{assessments.filter((a) => a.isCompleted).length}
						</div>
						<div className="text-gray-600">Completed</div>
					</div>
					<div className="card text-center">
						<div className="text-3xl font-bold text-yellow-600 mb-2">
							{assessments.reduce((acc, a) => acc + a.attempts, 0)}
						</div>
						<div className="text-gray-600">Total Attempts</div>
					</div>
					<div className="card text-center">
						<div className="text-3xl font-bold text-green-600 mb-2">
							{assessments.filter((a) => a.bestScore > 0).length > 0
								? Math.round(
										assessments
											.filter((a) => a.bestScore > 0)
											.reduce((acc, a) => acc + a.bestScore, 0) /
											assessments.filter((a) => a.bestScore > 0).length
								  )
								: 0}
							%
						</div>
						<div className="text-gray-600">Avg. Score</div>
					</div>
				</div>

				{/* Assessments Grid */}
				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{assessments.map((assessment) => (
						<div
							key={assessment.id}
							className="card hover:shadow-lg transition-shadow duration-300"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="flex-1">
									<h3 className="text-xl font-semibold text-gray-900 mb-2">
										{assessment.title}
									</h3>
									<p className="text-gray-600 text-sm mb-3">
										{assessment.description}
									</p>
								</div>
								<span
									className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(
										assessment.difficulty
									)}`}
								>
									{assessment.difficulty}
								</span>
							</div>

							<div className="space-y-3 mb-4">
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600">Category:</span>
									<span className="font-medium text-gray-900">
										{assessment.category}
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600">Duration:</span>
									<span className="font-medium text-gray-900">
										{assessment.duration} min
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600">Questions:</span>
									<span className="font-medium text-gray-900">
										{assessment.questions}
									</span>
								</div>
								<div className="flex items-center justify-between text-sm">
									<span className="text-gray-600">Attempts:</span>
									<span className="font-medium text-gray-900">
										{assessment.attempts}
									</span>
								</div>
								{assessment.bestScore > 0 && (
									<div className="flex items-center justify-between text-sm">
										<span className="text-gray-600">Best Score:</span>
										<span
											className={`font-bold ${getScoreColor(
												assessment.bestScore
											)}`}
										>
											{assessment.bestScore}%
										</span>
									</div>
								)}
							</div>

							{/* Skills */}
							<div className="mb-4">
								<h4 className="text-sm font-medium text-gray-900 mb-2">
									Skills Tested:
								</h4>
								<div className="flex flex-wrap gap-2">
									{assessment.skills.map((skill, index) => (
										<span
											key={index}
											className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
										>
											{skill}
										</span>
									))}
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center justify-between pt-4 border-t border-gray-200">
								<div className="flex items-center space-x-2">
									{assessment.isCompleted && (
										<CheckCircle className="w-5 h-5 text-green-500" />
									)}
									<span className="text-sm text-gray-600">
										{assessment.isCompleted ? "Completed" : "Not Started"}
									</span>
								</div>
								<button
									onClick={() => startAssessment(assessment)}
									className="btn-primary text-sm px-4 py-2"
								>
									<Play className="w-4 h-4 mr-1" />
									{assessment.attempts > 0 ? "Retake" : "Start"}
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default MicroAssessments;
