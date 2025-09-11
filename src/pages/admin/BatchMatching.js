import React, { useState } from "react";
import {
	Play,
	Pause,
	RotateCcw,
	Download,
	CheckCircle,
	AlertCircle,
	Clock,
} from "lucide-react";

const BatchMatching = () => {
	const [isRunning, setIsRunning] = useState(false);
	const [progress, setProgress] = useState(0);
	const [currentStep, setCurrentStep] = useState("");
	const [logs, setLogs] = useState([]);
	const [results, setResults] = useState(null);
	const [settings, setSettings] = useState({
		algorithm: "weighted",
		quotaEnforcement: true,
		skillWeight: 0.4,
		locationWeight: 0.2,
		experienceWeight: 0.2,
		quotaWeight: 0.2,
		maxIterations: 100,
		convergenceThreshold: 0.01,
	});

	const matchingSteps = [
		{
			step: "Initialization",
			description: "Loading candidate and company data",
		},
		{
			step: "Data Validation",
			description: "Validating input data and constraints",
		},
		{ step: "Quota Analysis", description: "Analyzing current quota status" },
		{
			step: "Skill Matching",
			description: "Matching candidates based on skills",
		},
		{
			step: "Location Optimization",
			description: "Optimizing for location preferences",
		},
		{ step: "Quota Enforcement", description: "Applying quota constraints" },
		{
			step: "Conflict Resolution",
			description: "Resolving allocation conflicts",
		},
		{ step: "Final Optimization", description: "Final optimization pass" },
		{
			step: "Results Generation",
			description: "Generating allocation results",
		},
		{ step: "Validation", description: "Validating final allocations" },
	];

	const runMatching = async () => {
		setIsRunning(true);
		setProgress(0);
		setLogs([]);
		setResults(null);

		// Simulate the matching process
		for (let i = 0; i < matchingSteps.length; i++) {
			setCurrentStep(matchingSteps[i].step);
			setProgress(((i + 1) / matchingSteps.length) * 100);

			// Add log entry
			const logEntry = {
				id: Date.now() + i,
				timestamp: new Date().toLocaleTimeString(),
				step: matchingSteps[i].step,
				status: "success",
				message: matchingSteps[i].description,
				details: `Completed ${matchingSteps[
					i
				].step.toLowerCase()} successfully`,
			};

			setLogs((prev) => [...prev, logEntry]);

			// Simulate processing time
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		// Generate results
		const mockResults = {
			totalCandidates: 1250,
			totalCompanies: 45,
			totalPostings: 78,
			totalMatches: 342,
			matchRate: 27.4,
			avgMatchScore: 82.3,
			quotaCompliance: 94.2,
			processingTime: "2.3 minutes",
			iterations: 47,
			converged: true,
			allocations: [
				{ category: "General", allocated: 145, target: 150, percentage: 96.7 },
				{ category: "OBC", allocated: 98, target: 101, percentage: 97.0 },
				{ category: "SC", allocated: 54, target: 56, percentage: 96.4 },
				{ category: "ST", allocated: 27, target: 28, percentage: 96.4 },
				{ category: "EWS", allocated: 36, target: 38, percentage: 94.7 },
				{ category: "Women", allocated: 102, target: 108, percentage: 94.4 },
			],
			topMatches: [
				{
					candidate: "John Doe",
					company: "TechCorp India",
					score: 95,
					category: "General",
				},
				{
					candidate: "Jane Smith",
					company: "DataViz Solutions",
					score: 93,
					category: "OBC",
				},
				{
					candidate: "Mike Johnson",
					company: "WebTech Ltd",
					score: 91,
					category: "General",
				},
				{
					candidate: "Sarah Wilson",
					company: "StartupXYZ",
					score: 89,
					category: "Women",
				},
				{
					candidate: "David Brown",
					company: "DesignStudio",
					score: 87,
					category: "SC",
				},
			],
			warnings: [
				"ST quota slightly below target - consider additional outreach",
				"Some high-scoring candidates not matched due to quota constraints",
				"Location preferences caused 12% of matches to be suboptimal",
			],
			recommendations: [
				"Consider increasing ST quota target for better representation",
				"Implement location flexibility scoring for better matches",
				"Add more companies in underrepresented regions",
			],
		};

		setResults(mockResults);
		setIsRunning(false);
		setCurrentStep("Completed");
	};

	const stopMatching = () => {
		setIsRunning(false);
		setCurrentStep("Stopped");
		setLogs((prev) => [
			...prev,
			{
				id: Date.now(),
				timestamp: new Date().toLocaleTimeString(),
				step: "Stopped",
				status: "warning",
				message: "Matching process stopped by user",
				details: "Process interrupted at user request",
			},
		]);
	};

	const resetMatching = () => {
		setIsRunning(false);
		setProgress(0);
		setCurrentStep("");
		setLogs([]);
		setResults(null);
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "success":
				return <CheckCircle className="w-4 h-4 text-green-500" />;
			case "warning":
				return <AlertCircle className="w-4 h-4 text-yellow-500" />;
			case "error":
				return <AlertCircle className="w-4 h-4 text-red-500" />;
			default:
				return <Clock className="w-4 h-4 text-gray-500" />;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Batch Matching</h1>
					<p className="text-gray-600 mt-2">
						Run automated matching algorithms to allocate candidates to
						internship positions.
					</p>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Control Panel */}
						<div className="card">
							<h2 className="text-xl font-semibold text-gray-900 mb-4">
								Matching Control
							</h2>

							<div className="flex items-center space-x-4 mb-6">
								{!isRunning ? (
									<button onClick={runMatching} className="btn-primary">
										<Play className="w-4 h-4 mr-2" />
										Start Matching
									</button>
								) : (
									<button
										onClick={stopMatching}
										className="btn-secondary bg-red-100 text-red-700 hover:bg-red-200"
									>
										<Pause className="w-4 h-4 mr-2" />
										Stop Matching
									</button>
								)}
								<button
									onClick={resetMatching}
									disabled={isRunning}
									className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
								>
									<RotateCcw className="w-4 h-4 mr-2" />
									Reset
								</button>
								{results && (
									<button className="btn-secondary">
										<Download className="w-4 h-4 mr-2" />
										Export Results
									</button>
								)}
							</div>

							{/* Progress Bar */}
							{isRunning && (
								<div className="mb-6">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-gray-700">
											{currentStep}
										</span>
										<span className="text-sm text-gray-600">
											{Math.round(progress)}%
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-3">
										<div
											className="bg-primary h-3 rounded-full transition-all duration-300"
											style={{ width: `${progress}%` }}
										></div>
									</div>
								</div>
							)}

							{/* Algorithm Settings */}
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Algorithm Type
									</label>
									<select
										value={settings.algorithm}
										onChange={(e) =>
											setSettings({ ...settings, algorithm: e.target.value })
										}
										className="input-field"
										disabled={isRunning}
									>
										<option value="weighted">Weighted Scoring</option>
										<option value="greedy">Greedy Algorithm</option>
										<option value="genetic">Genetic Algorithm</option>
										<option value="simulated">Simulated Annealing</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Max Iterations
									</label>
									<input
										type="number"
										value={settings.maxIterations}
										onChange={(e) =>
											setSettings({
												...settings,
												maxIterations: parseInt(e.target.value),
											})
										}
										className="input-field"
										disabled={isRunning}
									/>
								</div>
							</div>

							<div className="mt-4">
								<label className="flex items-center space-x-2">
									<input
										type="checkbox"
										checked={settings.quotaEnforcement}
										onChange={(e) =>
											setSettings({
												...settings,
												quotaEnforcement: e.target.checked,
											})
										}
										className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
										disabled={isRunning}
									/>
									<span className="text-sm text-gray-700">
										Enforce quota constraints
									</span>
								</label>
							</div>
						</div>

						{/* Results */}
						{results && (
							<div className="card">
								<h2 className="text-xl font-semibold text-gray-900 mb-4">
									Matching Results
								</h2>

								{/* Summary Stats */}
								<div className="grid md:grid-cols-4 gap-4 mb-6">
									<div className="text-center p-4 bg-blue-50 rounded-lg">
										<div className="text-2xl font-bold text-blue-600">
											{results.totalMatches}
										</div>
										<div className="text-sm text-gray-600">Total Matches</div>
									</div>
									<div className="text-center p-4 bg-green-50 rounded-lg">
										<div className="text-2xl font-bold text-green-600">
											{results.matchRate}%
										</div>
										<div className="text-sm text-gray-600">Match Rate</div>
									</div>
									<div className="text-center p-4 bg-yellow-50 rounded-lg">
										<div className="text-2xl font-bold text-yellow-600">
											{results.avgMatchScore}
										</div>
										<div className="text-sm text-gray-600">Avg Score</div>
									</div>
									<div className="text-center p-4 bg-purple-50 rounded-lg">
										<div className="text-2xl font-bold text-purple-600">
											{results.quotaCompliance}%
										</div>
										<div className="text-sm text-gray-600">
											Quota Compliance
										</div>
									</div>
								</div>

								{/* Quota Allocations */}
								<div className="mb-6">
									<h3 className="font-semibold text-gray-900 mb-3">
										Quota Allocations
									</h3>
									<div className="space-y-2">
										{results.allocations.map((allocation, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
											>
												<div className="flex-1">
													<div className="font-medium text-gray-900">
														{allocation.category}
													</div>
													<div className="text-sm text-gray-600">
														{allocation.allocated}/{allocation.target} allocated
													</div>
												</div>
												<div className="text-right">
													<div className="text-lg font-bold text-primary">
														{allocation.percentage}%
													</div>
													<div className="text-xs text-gray-500">of target</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Top Matches */}
								<div className="mb-6">
									<h3 className="font-semibold text-gray-900 mb-3">
										Top Matches
									</h3>
									<div className="space-y-2">
										{results.topMatches.map((match, index) => (
											<div
												key={index}
												className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
											>
												<div className="flex-1">
													<div className="font-medium text-gray-900">
														{match.candidate}
													</div>
													<div className="text-sm text-gray-600">
														{match.company}
													</div>
												</div>
												<div className="text-right">
													<div className="text-lg font-bold text-primary">
														{match.score}
													</div>
													<div className="text-xs text-gray-500">
														{match.category}
													</div>
												</div>
											</div>
										))}
									</div>
								</div>

								{/* Warnings and Recommendations */}
								<div className="grid md:grid-cols-2 gap-4">
									{results.warnings.length > 0 && (
										<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
											<h4 className="font-medium text-yellow-900 mb-2">
												Warnings
											</h4>
											<ul className="space-y-1 text-sm text-yellow-800">
												{results.warnings.map((warning, index) => (
													<li key={index}>• {warning}</li>
												))}
											</ul>
										</div>
									)}

									{results.recommendations.length > 0 && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
											<h4 className="font-medium text-blue-900 mb-2">
												Recommendations
											</h4>
											<ul className="space-y-1 text-sm text-blue-800">
												{results.recommendations.map((rec, index) => (
													<li key={index}>• {rec}</li>
												))}
											</ul>
										</div>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Sidebar */}
					<div className="space-y-6">
						{/* Process Logs */}
						<div className="card">
							<h3 className="font-semibold text-gray-900 mb-4">Process Logs</h3>
							<div className="space-y-2 max-h-96 overflow-y-auto">
								{logs.map((log) => (
									<div
										key={log.id}
										className="flex items-start space-x-2 p-2 bg-gray-50 rounded-lg"
									>
										{getStatusIcon(log.status)}
										<div className="flex-1">
											<div className="text-sm font-medium text-gray-900">
												{log.step}
											</div>
											<div className="text-xs text-gray-600">{log.message}</div>
											<div className="text-xs text-gray-500">
												{log.timestamp}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* System Status */}
						<div className="card">
							<h3 className="font-semibold text-gray-900 mb-4">
								System Status
							</h3>
							<div className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-gray-600">CPU Usage</span>
									<span className="font-medium text-gray-900">45%</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Memory Usage</span>
									<span className="font-medium text-gray-900">2.1 GB</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Active Processes</span>
									<span className="font-medium text-gray-900">12</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-600">Queue Status</span>
									<span className="font-medium text-green-600">Ready</span>
								</div>
							</div>
						</div>

						{/* Performance Metrics */}
						{results && (
							<div className="card">
								<h3 className="font-semibold text-gray-900 mb-4">
									Performance Metrics
								</h3>
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<span className="text-gray-600">Processing Time</span>
										<span className="font-medium text-gray-900">
											{results.processingTime}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-gray-600">Iterations</span>
										<span className="font-medium text-gray-900">
											{results.iterations}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span className="text-gray-600">Converged</span>
										<span
											className={`font-medium ${
												results.converged ? "text-green-600" : "text-red-600"
											}`}
										>
											{results.converged ? "Yes" : "No"}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default BatchMatching;
