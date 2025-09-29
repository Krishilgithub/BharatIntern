import React, { useState } from "react";
import { aiService } from "../services/aiService";
import toast from "react-hot-toast";

const AITestPage = () => {
	const [testResults, setTestResults] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [analysisResult, setAnalysisResult] = useState(null);

	const testAPIConnection = async () => {
		setIsLoading(true);
		try {
			const results = await aiService.testAPIConnection();
			setTestResults(results);
			toast.success("API test completed");
		} catch (error) {
			console.error("API test failed:", error);
			toast.error("API test failed");
		} finally {
			setIsLoading(false);
		}
	};

	const testAnalysis = async () => {
		setIsLoading(true);
		try {
			const sampleResume = `
        John Doe
        Software Developer
        john.doe@email.com
        (555) 123-4567
        
        EXPERIENCE
        Senior Frontend Developer - TechCorp (2021-2024)
        - Developed React applications with TypeScript
        - Implemented responsive designs using CSS and Tailwind
        - Collaborated with backend teams using Node.js APIs
        - Used Git for version control and GitHub Actions for CI/CD
        
        SKILLS
        - JavaScript, TypeScript, React, Vue.js
        - Node.js, Express.js, MongoDB
        - HTML, CSS, SCSS, Tailwind CSS
        - AWS, Docker, Kubernetes
        - Git, GitHub, VS Code
        
        EDUCATION
        Bachelor of Computer Science - State University (2017-2021)
      `;

			console.log("🧪 Testing analysis with sample resume...");
			const result = await aiService.analyzeResumeWithAI(sampleResume);
			setAnalysisResult(result);
			toast.success("Analysis test completed");
		} catch (error) {
			console.error("Analysis test failed:", error);
			toast.error("Analysis test failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-gray-900 mb-8">
					AI Service Test Page
				</h1>

				<div className="space-y-6">
					{/* API Connection Test */}
					<div className="bg-white rounded-lg p-6 shadow">
						<h2 className="text-xl font-semibold mb-4">API Connection Test</h2>
						<button
							onClick={testAPIConnection}
							disabled={isLoading}
							className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
						>
							{isLoading ? "Testing..." : "Test API Connection"}
						</button>

						{testResults && (
							<div className="mt-4 p-4 bg-gray-100 rounded">
								<h3 className="font-semibold mb-2">Test Results:</h3>
								<div className="space-y-2">
									<div
										className={`flex items-center space-x-2 ${
											testResults.gemini ? "text-green-600" : "text-red-600"
										}`}
									>
										<span>{testResults.gemini ? "✅" : "❌"}</span>
										<span>
											Gemini API: {testResults.gemini ? "Connected" : "Failed"}
										</span>
									</div>
									<div
										className={`flex items-center space-x-2 ${
											testResults.huggingface
												? "text-green-600"
												: "text-red-600"
										}`}
									>
										<span>{testResults.huggingface ? "✅" : "❌"}</span>
										<span>
											HuggingFace API:{" "}
											{testResults.huggingface ? "Connected" : "Failed"}
										</span>
									</div>
									<div
										className={`flex items-center space-x-2 ${
											testResults.overall ? "text-green-600" : "text-red-600"
										}`}
									>
										<span>{testResults.overall ? "✅" : "❌"}</span>
										<span>
											Overall:{" "}
											{testResults.overall
												? "At least one API working"
												: "No APIs working"}
										</span>
									</div>
								</div>
							</div>
						)}
					</div>

					{/* Analysis Test */}
					<div className="bg-white rounded-lg p-6 shadow">
						<h2 className="text-xl font-semibold mb-4">Resume Analysis Test</h2>
						<button
							onClick={testAnalysis}
							disabled={isLoading}
							className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
						>
							{isLoading ? "Analyzing..." : "Test Resume Analysis"}
						</button>

						{analysisResult && (
							<div className="mt-4 p-4 bg-gray-100 rounded">
								<h3 className="font-semibold mb-2">Analysis Results:</h3>
								<div className="space-y-2 text-sm">
									<div>
										<strong>Overall Score:</strong>{" "}
										{analysisResult.overallScore}/100
									</div>
									<div>
										<strong>Skills Found:</strong>{" "}
										{analysisResult.extractedSkills?.length || 0}
									</div>
									<div>
										<strong>Career Suggestions:</strong>{" "}
										{analysisResult.careerSuggestions?.length || 0}
									</div>
									<div>
										<strong>Improvements:</strong>{" "}
										{analysisResult.improvements?.length || 0}
									</div>
									<div>
										<strong>Missing Skills:</strong>{" "}
										{analysisResult.missingSkills?.length || 0}
									</div>

									{analysisResult.extractedSkills?.length > 0 && (
										<details className="mt-4">
											<summary className="font-semibold cursor-pointer">
												Detected Skills
											</summary>
											<div className="mt-2 pl-4">
												{analysisResult.extractedSkills.map((skill, index) => (
													<div
														key={index}
														className="flex justify-between py-1"
													>
														<span>
															{skill.name} ({skill.category})
														</span>
														<span>
															{skill.confidence}% - {skill.level}
														</span>
													</div>
												))}
											</div>
										</details>
									)}

									{analysisResult.careerSuggestions?.length > 0 && (
										<details className="mt-4">
											<summary className="font-semibold cursor-pointer">
												Career Suggestions
											</summary>
											<div className="mt-2 pl-4">
												{analysisResult.careerSuggestions.map(
													(career, index) => (
														<div
															key={index}
															className="py-2 border-b border-gray-200"
														>
															<div className="font-medium">
																{career.title} - {career.match}% match
															</div>
															<div className="text-gray-600">
																{career.reason}
															</div>
															<div className="text-green-600">
																{career.salaryRange}
															</div>
														</div>
													)
												)}
											</div>
										</details>
									)}
								</div>
							</div>
						)}
					</div>

					{/* Environment Check */}
					<div className="bg-white rounded-lg p-6 shadow">
						<h2 className="text-xl font-semibold mb-4">Environment Check</h2>
						<div className="space-y-2 text-sm">
							<div>
								<strong>Gemini API Key:</strong>{" "}
								{process.env.NEXT_PUBLIC_GEMINI_API_KEY
									? "✅ Set"
									: "❌ Not Set"}
							</div>
							<div>
								<strong>HuggingFace API Key:</strong>{" "}
								{process.env.NEXT_PUBLIC_HUGGING_FACE_API_KEY
									? "✅ Set"
									: "❌ Not Set"}
							</div>
							<div>
								<strong>OpenAI API Key:</strong>{" "}
								{process.env.NEXT_PUBLIC_OPENAI_API_KEY
									? "✅ Set"
									: "❌ Not Set"}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AITestPage;
