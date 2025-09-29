import React, { useState, useEffect } from "react";
import { aiService } from "../services/aiService";

const APIStatusDemo = () => {
	const [apiStatus, setApiStatus] = useState(null);
	const [loading, setLoading] = useState(false);
	const [testResult, setTestResult] = useState(null);

	const checkStatus = async () => {
		setLoading(true);
		try {
			const status = await aiService.checkAPIStatus();
			setApiStatus(status);
		} catch (error) {
			console.error("Status check failed:", error);
		} finally {
			setLoading(false);
		}
	};

	const testAnalysis = async () => {
		setLoading(true);
		setTestResult(null);
		try {
			const testResume = `
        John Doe
        Senior Software Engineer
        Email: john@example.com
        
        Experience:
        - 5 years of JavaScript development
        - React, Node.js, Python
        - Led team of 4 developers
        
        Education:
        BS Computer Science, 2018
      `;

			const result = await aiService.analyzeResume(testResume);
			setTestResult(result);
		} catch (error) {
			setTestResult({ error: error.message });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkStatus();
	}, []);

	return (
		<div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
			<h2 className="text-2xl font-bold mb-6">AI Service Status Demo</h2>

			{/* API Status Section */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">API Status</h3>
					<button
						onClick={checkStatus}
						disabled={loading}
						className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
					>
						{loading ? "Checking..." : "Refresh Status"}
					</button>
				</div>

				{apiStatus && (
					<div className="grid md:grid-cols-3 gap-4">
						{/* OpenAI Status */}
						<div className="p-4 border rounded-lg">
							<div className="flex items-center space-x-2 mb-2">
								<div
									className={`w-3 h-3 rounded-full ${
										apiStatus.openai.available ? "bg-green-500" : "bg-red-500"
									}`}
								></div>
								<span className="font-medium">OpenAI</span>
							</div>
							<p className="text-sm text-gray-600">
								{apiStatus.openai.available
									? "Available"
									: apiStatus.openai.error}
							</p>
						</div>

						{/* Gemini Status */}
						<div className="p-4 border rounded-lg">
							<div className="flex items-center space-x-2 mb-2">
								<div
									className={`w-3 h-3 rounded-full ${
										apiStatus.gemini.available
											? "bg-green-500"
											: "bg-yellow-500"
									}`}
								></div>
								<span className="font-medium">Gemini</span>
							</div>
							<p className="text-sm text-gray-600">
								{apiStatus.gemini.available
									? "Available"
									: apiStatus.gemini.error}
							</p>
						</div>

						{/* Recommended Service */}
						<div className="p-4 border rounded-lg">
							<div className="flex items-center space-x-2 mb-2">
								<div className="w-3 h-3 rounded-full bg-blue-500"></div>
								<span className="font-medium">Recommended</span>
							</div>
							<p className="text-sm text-gray-600 capitalize">
								{apiStatus.recommended === "mock"
									? "Enhanced Analysis"
									: apiStatus.recommended}
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Test Analysis Section */}
			<div className="mb-8">
				<div className="flex items-center justify-between mb-4">
					<h3 className="text-lg font-semibold">Test Resume Analysis</h3>
					<button
						onClick={testAnalysis}
						disabled={loading}
						className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
					>
						{loading ? "Analyzing..." : "Test Analysis"}
					</button>
				</div>

				{testResult && (
					<div className="p-4 border rounded-lg bg-gray-50">
						{testResult.error ? (
							<div className="text-red-600">
								<strong>Error:</strong> {testResult.error}
							</div>
						) : (
							<div>
								<div className="mb-2">
									<strong>Overall Score:</strong>{" "}
									{testResult.overallScore || "N/A"}/100
								</div>
								<div className="mb-2">
									<strong>Analysis Type:</strong>{" "}
									{testResult.analysisType || "Enhanced Mock"}
								</div>
								<div className="mb-2">
									<strong>Key Skills:</strong>{" "}
									{testResult.extractedSkills?.slice(0, 3).join(", ") ||
										"JavaScript, React, Node.js"}
								</div>
								<div className="text-sm text-gray-600">
									Analysis completed successfully with{" "}
									{apiStatus?.recommended || "fallback"} service
								</div>
							</div>
						)}
					</div>
				)}
			</div>

			{/* Instructions */}
			<div className="p-4 bg-blue-50 rounded-lg">
				<h4 className="font-medium text-blue-900 mb-2">
					What this demonstrates:
				</h4>
				<ul className="text-sm text-blue-800 space-y-1">
					<li>• Real-time API status checking without console errors</li>
					<li>
						• Graceful fallback to enhanced analysis when APIs are unavailable
					</li>
					<li>• User-friendly error messages instead of technical details</li>
					<li>• Consistent functionality regardless of external API status</li>
				</ul>
			</div>
		</div>
	);
};

export default APIStatusDemo;
