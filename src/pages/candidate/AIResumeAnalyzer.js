import React, { useState, useEffect } from "react";
import {
	Brain,
	FileText,
	TrendingUp,
	Target,
	Upload,
	Download,
	CheckCircle,
	AlertCircle,
	Loader,
} from "lucide-react";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

const AIResumeAnalyzer = () => {
	const [file, setFile] = useState(null);
	const [analysis, setAnalysis] = useState(null);
	const [loading, setLoading] = useState(false);
	const [dragActive, setDragActive] = useState(false);

	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		if (e.type === "dragenter" || e.type === "dragover") {
			setDragActive(true);
		} else if (e.type === "dragleave") {
			setDragActive(false);
		}
	};

	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			setFile(e.dataTransfer.files[0]);
		}
	};

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
		}
	};

	const analyzeResume = async () => {
		if (!file) {
			toast.error("Please select a file first");
			return;
		}

		setLoading(true);
		try {
			const reader = new FileReader();
			reader.onload = async (e) => {
				try {
					const resumeText = e.target.result;
					const response = await apiService.analyzeResumeAI(resumeText);

					if (response.data.success) {
						setAnalysis(response.data.analysis);
						toast.success("Resume analyzed successfully!");
					} else {
						toast.error("Analysis failed. Please try again.");
					}
				} catch (error) {
					console.error("Analysis error:", error);
					toast.error("Error analyzing resume");
				} finally {
					setLoading(false);
				}
			};
			reader.readAsText(file);
		} catch (error) {
			console.error("File reading error:", error);
			toast.error("Error reading file");
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center space-x-3">
				<Brain className="w-8 h-8 text-blue-600" />
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						AI Resume Analyzer
					</h1>
					<p className="text-gray-600">
						Get AI-powered insights about your resume
					</p>
				</div>
			</div>

			{/* File Upload */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-lg font-semibold mb-4">Upload Your Resume</h2>

				<div
					className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
						dragActive
							? "border-blue-500 bg-blue-50"
							: "border-gray-300 hover:border-gray-400"
					}`}
					onDragEnter={handleDrag}
					onDragLeave={handleDrag}
					onDragOver={handleDrag}
					onDrop={handleDrop}
				>
					<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
					<p className="text-lg font-medium text-gray-900 mb-2">
						Drag and drop your resume here
					</p>
					<p className="text-gray-600 mb-4">or</p>
					<input
						type="file"
						accept=".txt,.pdf,.doc,.docx"
						onChange={handleFileChange}
						className="hidden"
						id="resume-upload"
					/>
					<label
						htmlFor="resume-upload"
						className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
					>
						<FileText className="w-4 h-4 mr-2" />
						Choose File
					</label>

					{file && (
						<div className="mt-4 p-3 bg-gray-50 rounded-md">
							<p className="text-sm text-gray-700">
								Selected: <span className="font-medium">{file.name}</span>
							</p>
						</div>
					)}
				</div>

				<button
					onClick={analyzeResume}
					disabled={!file || loading}
					className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
				>
					{loading ? (
						<>
							<Loader className="w-4 h-4 mr-2 animate-spin" />
							Analyzing...
						</>
					) : (
						<>
							<Brain className="w-4 h-4 mr-2" />
							Analyze Resume
						</>
					)}
				</button>
			</div>

			{/* Analysis Results */}
			{analysis && (
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-lg font-semibold mb-4">Analysis Results</h2>

					{/* Skills Extracted */}
					<div className="mb-6">
						<h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
							<Target className="w-5 h-5 mr-2 text-green-600" />
							Skills Identified
						</h3>
						<div className="flex flex-wrap gap-2">
							{analysis.skills?.map((skill, index) => (
								<span
									key={index}
									className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
								>
									{skill}
								</span>
							))}
						</div>
					</div>

					{/* Entities Extracted */}
					{analysis.entities && analysis.entities.length > 0 && (
						<div className="mb-6">
							<h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
								<CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
								Contact Information
							</h3>
							<div className="space-y-2">
								{analysis.entities.map((entity, index) => (
									<div key={index} className="flex items-center space-x-2">
										<span className="text-sm font-medium text-gray-600">
											{entity[1]}:
										</span>
										<span className="text-sm text-gray-900">{entity[0]}</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Summary */}
					<div className="mb-6">
						<h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
							<FileText className="w-5 h-5 mr-2 text-purple-600" />
							Summary
						</h3>
						<p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
					</div>

					{/* Confidence Score */}
					<div className="bg-gray-50 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-gray-900">
								Analysis Confidence
							</span>
							<span
								className={`text-sm font-bold ${
									analysis.confidence > 0.8
										? "text-green-600"
										: analysis.confidence > 0.6
										? "text-yellow-600"
										: "text-red-600"
								}`}
							>
								{Math.round(analysis.confidence * 100)}%
							</span>
						</div>
						<div className="mt-2 bg-gray-200 rounded-full h-2">
							<div
								className={`h-2 rounded-full ${
									analysis.confidence > 0.8
										? "bg-green-500"
										: analysis.confidence > 0.6
										? "bg-yellow-500"
										: "bg-red-500"
								}`}
								style={{ width: `${analysis.confidence * 100}%` }}
							></div>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="mt-6 flex space-x-4">
						<button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
							<Download className="w-4 h-4 mr-2" />
							Download Report
						</button>
						<button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
							<TrendingUp className="w-4 h-4 mr-2" />
							Get Improvement Tips
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

export default AIResumeAnalyzer;
