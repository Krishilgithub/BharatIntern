import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Upload,
	FileText,
	CheckCircle,
	AlertCircle,
	Brain,
	Target,
	TrendingUp,
	Award,
	BookOpen,
	Users,
	Clock,
	MapPin,
	Code,
	Briefcase,
	Star,
	ArrowRight,
	Download,
	Lightbulb,
	BarChart3,
	PieChart,
} from "lucide-react";
import { aiService } from "../../services/aiService";
import { toast } from "react-hot-toast";

const InternshipAssessment = () => {
	const [activeTab, setActiveTab] = useState("resume");
	const [isLoading, setIsLoading] = useState(false);
	const [assessmentData, setAssessmentData] = useState(null);
	const [selectedDomain, setSelectedDomain] = useState("Software Development");
	const [availableDomains, setAvailableDomains] = useState([]);

	// Resume Analysis State
	const [resumeFile, setResumeFile] = useState(null);
	const [resumeAnalysis, setResumeAnalysis] = useState(null);

	// Technical Assessment State
	const [technicalQuestions, setTechnicalQuestions] = useState([]);
	const [userAnswers, setUserAnswers] = useState({});
	const [assessmentResults, setAssessmentResults] = useState(null);
	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [assessmentStarted, setAssessmentStarted] = useState(false);

	// Skill Assessment State
	const [candidateInfo, setCandidateInfo] = useState("");
	const [skillAssessment, setSkillAssessment] = useState(null);

	// Internship Matching State
	const [internshipMatches, setInternshipMatches] = useState([]);
	const [learningRoadmap, setLearningRoadmap] = useState(null);

	useEffect(() => {
		loadInternshipDomains();
	}, []);

	const loadInternshipDomains = async () => {
		try {
			const domains = await aiService.getInternshipDomains();
			setAvailableDomains(domains);
		} catch (error) {
			console.error("Error loading domains:", error);
		}
	};

	const handleResumeUpload = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		if (
			!file.name.toLowerCase().endsWith(".pdf") &&
			!file.name.toLowerCase().endsWith(".docx")
		) {
			toast.error("Please upload a PDF or DOCX file");
			return;
		}

		setResumeFile(file);
		setIsLoading(true);

		try {
			const analysis = await aiService.analyzeInternshipResume(file);
			setResumeAnalysis(analysis);
			toast.success("Resume analyzed successfully!");
		} catch (error) {
			toast.error("Failed to analyze resume. Please try again.");
			console.error("Resume analysis error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const startTechnicalAssessment = async () => {
		setIsLoading(true);

		try {
			const result = await aiService.generateInternshipTechnicalAssessment(
				selectedDomain,
				10,
				"moderate"
			);

			if (result.success && result.questions) {
				setTechnicalQuestions(result.questions);
				setAssessmentStarted(true);
				setCurrentQuestion(0);
				setUserAnswers({});
				toast.success("Technical assessment loaded!");
			} else {
				throw new Error("Failed to load questions");
			}
		} catch (error) {
			toast.error("Failed to load technical assessment");
			console.error("Technical assessment error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const submitTechnicalAssessment = async () => {
		setIsLoading(true);

		try {
			const results = await aiService.evaluateInternshipAssessment(
				userAnswers,
				technicalQuestions
			);

			setAssessmentResults(results);
			toast.success("Assessment completed!");
		} catch (error) {
			toast.error("Failed to evaluate assessment");
			console.error("Assessment evaluation error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const performSkillAssessment = async () => {
		if (!candidateInfo.trim()) {
			toast.error("Please provide your information");
			return;
		}

		setIsLoading(true);

		try {
			const assessment = await aiService.assessInternshipSkills(
				candidateInfo,
				selectedDomain
			);
			setSkillAssessment(assessment);

			// Also generate learning roadmap
			const roadmap = await aiService.generateLearningRoadmap(
				assessment.assessment,
				selectedDomain
			);
			setLearningRoadmap(roadmap.roadmap);

			toast.success("Skill assessment completed!");
		} catch (error) {
			toast.error("Failed to perform skill assessment");
			console.error("Skill assessment error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const findInternshipMatches = async () => {
		if (!candidateInfo.trim()) {
			toast.error("Please provide your profile information");
			return;
		}

		setIsLoading(true);

		try {
			const matches = await aiService.matchInternships(candidateInfo);
			setInternshipMatches(matches.matches || []);
			toast.success("Internship matches found!");
		} catch (error) {
			toast.error("Failed to find internship matches");
			console.error("Internship matching error:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const renderResumeAnalysis = () => (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold mb-4 flex items-center">
					<Upload className="mr-2" size={20} />
					Upload Your Resume
				</h3>

				<div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
					<input
						type="file"
						accept=".pdf,.docx"
						onChange={handleResumeUpload}
						className="hidden"
						id="resume-upload"
					/>
					<label htmlFor="resume-upload" className="cursor-pointer">
						<FileText className="mx-auto mb-4 text-gray-400" size={48} />
						<p className="text-gray-600 mb-2">
							{resumeFile ? resumeFile.name : "Click to upload your resume"}
						</p>
						<p className="text-sm text-gray-500">PDF or DOCX files only</p>
					</label>
				</div>
			</div>

			{resumeAnalysis && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-lg shadow-sm border p-6"
				>
					<h3 className="text-lg font-semibold mb-4 flex items-center">
						<Brain className="mr-2" size={20} />
						Internship Resume Analysis
					</h3>

					{resumeAnalysis.success ? (
						<div className="space-y-4">
							{/* Display Model Information */}
							<div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
								<div className="flex items-center justify-between text-sm">
									<span className="text-blue-700">
										🤖 Analysis by:{" "}
										{resumeAnalysis.source === "langchain_huggingface"
											? "HuggingFace AI Model"
											: resumeAnalysis.source || "AI Model"}
									</span>
									<span className="text-blue-600">
										Model: {resumeAnalysis.model_name || "Unknown"}
									</span>
								</div>
							</div>

							{/* Overall Score */}
							<div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
								<span className="font-medium">Overall Score</span>
								<div className="flex items-center">
									<div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mr-3">
										<span className="text-xl font-bold text-blue-600">
											{typeof resumeAnalysis.analysis === "object" &&
											resumeAnalysis.analysis.overall_score
												? resumeAnalysis.analysis.overall_score
												: 78}
										</span>
									</div>
									<Star className="text-yellow-500" size={20} />
								</div>
							</div>

							{/* Analysis Content */}
							<div className="p-4 border rounded-lg">
								<h4 className="font-medium text-blue-600 mb-3">
									AI Analysis Results
								</h4>

								{/* Check if analysis is structured or raw text */}
								{typeof resumeAnalysis.analysis === "object" ? (
									/* Structured Analysis */
									<div className="space-y-4">
										<div className="grid md:grid-cols-2 gap-4">
											<div className="p-3 bg-green-50 border border-green-200 rounded">
												<h5 className="font-medium text-green-700 mb-2">
													Strengths
												</h5>
												<p className="text-sm text-gray-700">
													{resumeAnalysis.analysis.academic_analysis ||
														"Strong foundation identified"}
												</p>
											</div>
											<div className="p-3 bg-orange-50 border border-orange-200 rounded">
												<h5 className="font-medium text-orange-700 mb-2">
													Areas for Improvement
												</h5>
												<p className="text-sm text-gray-700">
													{resumeAnalysis.analysis.improvement_areas ||
														"Opportunities for growth"}
												</p>
											</div>
										</div>
										<div className="p-3 bg-purple-50 border border-purple-200 rounded">
											<h5 className="font-medium text-purple-700 mb-2">
												Recommended Roles
											</h5>
											<p className="text-sm text-gray-700">
												{resumeAnalysis.analysis.recommended_roles ||
													"Various internship opportunities"}
											</p>
										</div>
									</div>
								) : (
									/* Raw Text Analysis from HuggingFace */
									<div className="bg-gray-50 p-4 rounded border">
										<div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
											{resumeAnalysis.analysis ||
												"Analysis completed successfully"}
										</div>
									</div>
								)}
							</div>

							{/* Additional Information */}
							{resumeAnalysis.raw_response && (
								<details className="p-4 bg-gray-50 rounded-lg">
									<summary className="cursor-pointer font-medium text-gray-700 mb-2">
										📄 View Full AI Response
									</summary>
									<div className="mt-3 text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border max-h-60 overflow-y-auto">
										{resumeAnalysis.raw_response}
									</div>
								</details>
							)}

							{/* Processing Information */}
							<div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
								📊 Processing Stats:
								{resumeAnalysis.input_length &&
									` Original: ${resumeAnalysis.input_length} chars`}
								{resumeAnalysis.processed_length &&
									` | Processed: ${resumeAnalysis.processed_length} chars`}
								{resumeAnalysis.response_length &&
									` | Response: ${resumeAnalysis.response_length} chars`}
								{resumeAnalysis.timestamp &&
									` | Analyzed: ${new Date(
										resumeAnalysis.timestamp
									).toLocaleString()}`}
							</div>
						</div>
					) : (
						<div className="text-center py-8">
							<AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
							<p className="text-gray-600">
								Analysis data is not available in expected format
							</p>
						</div>
					)}
				</motion.div>
			)}
		</div>
	);

	const renderTechnicalAssessment = () => (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold mb-4 flex items-center">
					<Code className="mr-2" size={20} />
					Technical Assessment
				</h3>

				<div className="mb-4">
					<label className="block text-sm font-medium mb-2">
						Internship Domain
					</label>
					<select
						value={selectedDomain}
						onChange={(e) => setSelectedDomain(e.target.value)}
						className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
					>
						{availableDomains.map((domain) => (
							<option key={domain} value={domain}>
								{domain}
							</option>
						))}
					</select>
				</div>

				{!assessmentStarted ? (
					<button
						onClick={startTechnicalAssessment}
						disabled={isLoading}
						className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
					>
						{isLoading ? (
							<>
								<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
								Loading Assessment...
							</>
						) : (
							<>
								<Brain className="mr-2" size={20} />
								Start Technical Assessment
							</>
						)}
					</button>
				) : (
					<div className="space-y-4">
						{technicalQuestions.length > 0 &&
							currentQuestion < technicalQuestions.length && (
								<div className="border rounded-lg p-6">
									<div className="flex justify-between items-center mb-4">
										<span className="text-sm text-gray-500">
											Question {currentQuestion + 1} of{" "}
											{technicalQuestions.length}
										</span>
										<div className="w-32 bg-gray-200 rounded-full h-2">
											<div
												className="bg-blue-600 h-2 rounded-full transition-all duration-300"
												style={{
													width: `${
														((currentQuestion + 1) /
															technicalQuestions.length) *
														100
													}%`,
												}}
											></div>
										</div>
									</div>

									<h4 className="font-medium mb-4">
										{technicalQuestions[currentQuestion]?.question}
									</h4>

									<div className="space-y-2">
										{Object.entries(
											technicalQuestions[currentQuestion]?.options || {}
										).map(([key, value]) => (
											<label
												key={key}
												className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
											>
												<input
													type="radio"
													name={`question-${currentQuestion}`}
													value={key}
													onChange={(e) =>
														setUserAnswers({
															...userAnswers,
															[technicalQuestions[currentQuestion].id]:
																e.target.value,
														})
													}
													className="mr-3"
												/>
												<span>
													{key}) {value}
												</span>
											</label>
										))}
									</div>

									<div className="flex justify-between mt-6">
										<button
											onClick={() =>
												setCurrentQuestion(Math.max(0, currentQuestion - 1))
											}
											disabled={currentQuestion === 0}
											className="px-4 py-2 text-gray-600 border rounded-lg disabled:opacity-50"
										>
											Previous
										</button>

										{currentQuestion < technicalQuestions.length - 1 ? (
											<button
												onClick={() => setCurrentQuestion(currentQuestion + 1)}
												className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
											>
												Next
											</button>
										) : (
											<button
												onClick={submitTechnicalAssessment}
												disabled={isLoading}
												className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
											>
												{isLoading ? "Evaluating..." : "Submit Assessment"}
											</button>
										)}
									</div>
								</div>
							)}
					</div>
				)}
			</div>

			{assessmentResults && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-lg shadow-sm border p-6"
				>
					<h3 className="text-lg font-semibold mb-4 flex items-center">
						<Award className="mr-2" size={20} />
						Assessment Results
					</h3>

					{assessmentResults.success && assessmentResults.evaluation ? (
						<div className="space-y-4">
							<div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
								<div className="text-4xl font-bold text-blue-600 mb-2">
									{assessmentResults.evaluation.percentage}%
								</div>
								<div className="text-lg font-medium text-gray-700 mb-1">
									{assessmentResults.evaluation.level}
								</div>
								<div className="text-sm text-gray-600">
									{assessmentResults.evaluation.correct_answers}/
									{assessmentResults.evaluation.total_questions} correct
								</div>
							</div>

							<div className="p-4 bg-gray-50 rounded-lg">
								<h4 className="font-medium mb-2">Feedback</h4>
								<p className="text-sm text-gray-600">
									{assessmentResults.evaluation.feedback}
								</p>
							</div>
						</div>
					) : (
						<div className="text-center py-8">
							<AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
							<p className="text-gray-600">
								Assessment results are not available
							</p>
						</div>
					)}
				</motion.div>
			)}
		</div>
	);

	const renderSkillAssessment = () => (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold mb-4 flex items-center">
					<Target className="mr-2" size={20} />
					Skill Assessment
				</h3>

				<div className="mb-4">
					<label className="block text-sm font-medium mb-2">
						Tell us about yourself
					</label>
					<textarea
						value={candidateInfo}
						onChange={(e) => setCandidateInfo(e.target.value)}
						placeholder="Include your education, skills, projects, and experience..."
						className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-sm font-medium mb-2">
						Target Domain
					</label>
					<select
						value={selectedDomain}
						onChange={(e) => setSelectedDomain(e.target.value)}
						className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
					>
						{availableDomains.map((domain) => (
							<option key={domain} value={domain}>
								{domain}
							</option>
						))}
					</select>
				</div>

				<button
					onClick={performSkillAssessment}
					disabled={isLoading || !candidateInfo.trim()}
					className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
				>
					{isLoading ? (
						<>
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
							Analyzing Skills...
						</>
					) : (
						<>
							<Brain className="mr-2" size={20} />
							Assess My Skills
						</>
					)}
				</button>
			</div>

			{skillAssessment && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-lg shadow-sm border p-6"
				>
					<h3 className="text-lg font-semibold mb-4 flex items-center">
						<BarChart3 className="mr-2" size={20} />
						Skill Analysis Results
					</h3>

					{skillAssessment.success && skillAssessment.assessment ? (
						<div className="space-y-4">
							<div className="text-center p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
								<div className="text-3xl font-bold text-green-600 mb-2">
									{skillAssessment.assessment.overall_score}/100
								</div>
								<div className="text-lg font-medium text-gray-700">
									{skillAssessment.assessment.readiness_level}
								</div>
							</div>

							<div className="grid md:grid-cols-3 gap-4">
								<div className="p-4 border rounded-lg text-center">
									<div className="text-2xl font-bold text-blue-600 mb-1">
										{skillAssessment.assessment.technical_skills?.level || 7}/10
									</div>
									<div className="text-sm text-gray-600">Technical Skills</div>
								</div>

								<div className="p-4 border rounded-lg text-center">
									<div className="text-2xl font-bold text-green-600 mb-1">
										{skillAssessment.assessment.soft_skills?.level || 6}/10
									</div>
									<div className="text-sm text-gray-600">Soft Skills</div>
								</div>

								<div className="p-4 border rounded-lg text-center">
									<div className="text-2xl font-bold text-purple-600 mb-1">
										{skillAssessment.assessment.academic_background?.level || 8}
										/10
									</div>
									<div className="text-sm text-gray-600">
										Academic Background
									</div>
								</div>
							</div>

							{skillAssessment.assessment.recommendations && (
								<div className="p-4 bg-yellow-50 rounded-lg">
									<h4 className="font-medium mb-2 flex items-center">
										<Lightbulb className="mr-2" size={16} />
										Recommendations
									</h4>
									<ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
										{skillAssessment.assessment.recommendations.map(
											(rec, index) => (
												<li key={index}>{rec}</li>
											)
										)}
									</ul>
								</div>
							)}
						</div>
					) : (
						<div className="text-center py-8">
							<AlertCircle className="mx-auto mb-4 text-yellow-500" size={48} />
							<p className="text-gray-600">
								Skill assessment data is not available
							</p>
						</div>
					)}
				</motion.div>
			)}

			{learningRoadmap && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-lg shadow-sm border p-6"
				>
					<h3 className="text-lg font-semibold mb-4 flex items-center">
						<BookOpen className="mr-2" size={20} />
						Personalized Learning Roadmap
					</h3>

					<div className="space-y-4">
						<div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
							<span className="font-medium">Estimated Duration</span>
							<span className="text-blue-600 font-semibold">
								{learningRoadmap.estimated_duration}
							</span>
						</div>

						{Object.entries(learningRoadmap.phases || {}).map(
							([phase, tasks]) => (
								<div key={phase} className="border rounded-lg p-4">
									<h4 className="font-medium mb-3 text-gray-800">{phase}</h4>
									<ul className="space-y-2">
										{tasks.map((task, index) => (
											<li key={index} className="flex items-start">
												<CheckCircle
													className="mr-2 mt-0.5 text-green-500"
													size={16}
												/>
												<span className="text-sm text-gray-600">{task}</span>
											</li>
										))}
									</ul>
								</div>
							)
						)}
					</div>
				</motion.div>
			)}
		</div>
	);

	const renderInternshipMatching = () => (
		<div className="space-y-6">
			<div className="bg-white rounded-lg shadow-sm border p-6">
				<h3 className="text-lg font-semibold mb-4 flex items-center">
					<Briefcase className="mr-2" size={20} />
					Find Matching Internships
				</h3>

				<button
					onClick={findInternshipMatches}
					disabled={isLoading || !candidateInfo.trim()}
					className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
				>
					{isLoading ? (
						<>
							<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
							Finding Matches...
						</>
					) : (
						<>
							<Users className="mr-2" size={20} />
							Find Matching Internships
						</>
					)}
				</button>

				{!candidateInfo.trim() && (
					<p className="text-sm text-gray-500 mt-2">
						Please complete the skill assessment first to find matching
						internships.
					</p>
				)}
			</div>

			{internshipMatches.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-4"
				>
					<h3 className="text-lg font-semibold">
						Matching Internships ({internshipMatches.length})
					</h3>

					{internshipMatches.map((match, index) => (
						<div
							key={index}
							className="bg-white rounded-lg shadow-sm border p-6"
						>
							<div className="flex justify-between items-start mb-4">
								<div>
									<h4 className="text-lg font-semibold text-gray-800">
										{match.title}
									</h4>
									<p className="text-gray-600">{match.company}</p>
									<span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full mt-2">
										{match.domain}
									</span>
								</div>
								<div className="text-right">
									<div className="text-2xl font-bold text-green-600">
										{match.compatibility_score}%
									</div>
									<div className="text-sm text-gray-500">Match Score</div>
								</div>
							</div>

							{match.matching_factors && match.matching_factors.length > 0 && (
								<div className="mb-4">
									<h5 className="font-medium text-green-600 mb-2">
										Why it's a good match:
									</h5>
									<ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
										{match.matching_factors.map((factor, idx) => (
											<li key={idx}>{factor}</li>
										))}
									</ul>
								</div>
							)}

							{match.skill_gaps && match.skill_gaps.length > 0 && (
								<div className="mb-4">
									<h5 className="font-medium text-orange-600 mb-2">
										Skills to develop:
									</h5>
									<div className="flex flex-wrap gap-2">
										{match.skill_gaps.map((skill, idx) => (
											<span
												key={idx}
												className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded"
											>
												{skill}
											</span>
										))}
									</div>
								</div>
							)}

							{match.application_tips && match.application_tips.length > 0 && (
								<div>
									<h5 className="font-medium text-blue-600 mb-2">
										Application tips:
									</h5>
									<ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
										{match.application_tips.map((tip, idx) => (
											<li key={idx}>{tip}</li>
										))}
									</ul>
								</div>
							)}
						</div>
					))}
				</motion.div>
			)}
		</div>
	);

	const tabs = [
		{ id: "resume", label: "Resume Analysis", icon: FileText },
		{ id: "technical", label: "Technical Test", icon: Code },
		{ id: "skills", label: "Skill Assessment", icon: Target },
		{ id: "matching", label: "Find Internships", icon: Briefcase },
	];

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-6xl mx-auto px-4">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Internship Assessment Platform
					</h1>
					<p className="text-gray-600">
						Comprehensive AI-powered assessment to match you with the perfect
						internship
					</p>
				</div>

				{/* Tab Navigation */}
				<div className="flex justify-center mb-8">
					<div className="bg-white rounded-lg shadow-sm border p-1 flex space-x-1">
						{tabs.map((tab) => {
							const Icon = tab.icon;
							return (
								<button
									key={tab.id}
									onClick={() => setActiveTab(tab.id)}
									className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 ${
										activeTab === tab.id
											? "bg-blue-600 text-white"
											: "text-gray-600 hover:bg-gray-100"
									}`}
								>
									<Icon className="mr-2" size={16} />
									{tab.label}
								</button>
							);
						})}
					</div>
				</div>

				{/* Tab Content */}
				<AnimatePresence mode="wait">
					<motion.div
						key={activeTab}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.3 }}
					>
						{activeTab === "resume" && renderResumeAnalysis()}
						{activeTab === "technical" && renderTechnicalAssessment()}
						{activeTab === "skills" && renderSkillAssessment()}
						{activeTab === "matching" && renderInternshipMatching()}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
};

export default InternshipAssessment;
