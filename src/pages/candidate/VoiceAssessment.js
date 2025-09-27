import React, { useState, useRef, useEffect } from "react";
import {
	Mic,
	Square,
	Play,
	Pause,
	RotateCcw,
	Volume2,
	FileAudio,
	Brain,
	MessageSquare,
	BarChart3,
	Clock,
	CheckCircle,
	AlertCircle,
	Upload,
} from "lucide-react";
import { apiService } from "../../services/api";
import toast from "react-hot-toast";

const VoiceAssessment = () => {
	const [isRecording, setIsRecording] = useState(false);
	const [audioBlob, setAudioBlob] = useState(null);
	const [audioUrl, setAudioUrl] = useState(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [assessment, setAssessment] = useState(null);
	const [loading, setLoading] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [selectedQuestion, setSelectedQuestion] = useState(null);

	const mediaRecorderRef = useRef(null);
	const audioRef = useRef(null);
	const chunksRef = useRef([]);
	const timerRef = useRef(null);

	const assessmentQuestions = [
		{
			id: 1,
			question: "Tell me about yourself and your professional background.",
			category: "Introduction",
			timeLimit: 120,
		},
		{
			id: 2,
			question:
				"Describe a challenging project you worked on and how you overcame obstacles.",
			category: "Problem Solving",
			timeLimit: 180,
		},
		{
			id: 3,
			question:
				"What are your career goals and how does this position align with them?",
			category: "Career Goals",
			timeLimit: 120,
		},
		{
			id: 4,
			question:
				"Explain a technical concept to someone without a technical background.",
			category: "Communication",
			timeLimit: 150,
		},
		{
			id: 5,
			question:
				"Describe a time when you had to work with a difficult team member.",
			category: "Teamwork",
			timeLimit: 150,
		},
	];

	useEffect(() => {
		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, []);

	const startRecording = async () => {
		if (!selectedQuestion) {
			toast.error("Please select a question first");
			return;
		}

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const mediaRecorder = new MediaRecorder(stream);
			mediaRecorderRef.current = mediaRecorder;
			chunksRef.current = [];

			mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					chunksRef.current.push(event.data);
				}
			};

			mediaRecorder.onstop = () => {
				const blob = new Blob(chunksRef.current, { type: "audio/wav" });
				setAudioBlob(blob);
				setAudioUrl(URL.createObjectURL(blob));
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.start();
			setIsRecording(true);
			setRecordingTime(0);

			// Start timer
			timerRef.current = setInterval(() => {
				setRecordingTime((prev) => {
					const newTime = prev + 1;
					// Auto-stop after time limit
					if (newTime >= selectedQuestion.timeLimit) {
						stopRecording();
					}
					return newTime;
				});
			}, 1000);

			toast.success("Recording started");
		} catch (error) {
			console.error("Error starting recording:", error);
			toast.error(
				"Could not start recording. Please check microphone permissions."
			);
		}
	};

	const stopRecording = () => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			toast.success("Recording stopped");
		}
	};

	const playAudio = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
				setIsPlaying(false);
			} else {
				audioRef.current.play();
				setIsPlaying(true);
			}
		}
	};

	const resetRecording = () => {
		setAudioBlob(null);
		setAudioUrl(null);
		setIsPlaying(false);
		setRecordingTime(0);
		setAssessment(null);
		if (timerRef.current) {
			clearInterval(timerRef.current);
		}
	};

	const analyzeVoice = async () => {
		if (!audioBlob) {
			toast.error("No audio recording found");
			return;
		}

		setLoading(true);
		try {
			const formData = new FormData();
			formData.append("audio", audioBlob, "recording.wav");
			formData.append("question_id", selectedQuestion.id);
			formData.append("question_text", selectedQuestion.question);

			const response = await apiService.analyzeVoice(formData);

			if (response.data.success) {
				setAssessment(response.data.assessment);
				toast.success("Voice analysis completed!");
			} else {
				toast.error("Failed to analyze voice recording");
			}
		} catch (error) {
			console.error("Error analyzing voice:", error);
			toast.error("Error analyzing voice recording");
		} finally {
			setLoading(false);
		}
	};

	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const getScoreColor = (score) => {
		if (score >= 80) return "text-green-600";
		if (score >= 60) return "text-blue-600";
		if (score >= 40) return "text-yellow-600";
		return "text-red-600";
	};

	const getScoreBg = (score) => {
		if (score >= 80) return "bg-green-100";
		if (score >= 60) return "bg-blue-100";
		if (score >= 40) return "bg-yellow-100";
		return "bg-red-100";
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center space-x-3">
				<Mic className="w-8 h-8 text-purple-600" />
				<div>
					<h1 className="text-2xl font-bold text-gray-900">
						Voice AI Assessment
					</h1>
					<p className="text-gray-600">
						AI-powered voice analysis for interview preparation
					</p>
				</div>
			</div>

			{/* Question Selection */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-lg font-semibold mb-4">
					Select Interview Question
				</h2>
				<div className="grid gap-3">
					{assessmentQuestions.map((q) => (
						<div
							key={q.id}
							onClick={() => setSelectedQuestion(q)}
							className={`p-4 border rounded-lg cursor-pointer transition-colors ${
								selectedQuestion?.id === q.id
									? "border-purple-500 bg-purple-50"
									: "border-gray-200 hover:border-gray-300"
							}`}
						>
							<div className="flex items-center justify-between">
								<div className="flex-1">
									<h3 className="font-medium text-gray-900">{q.question}</h3>
									<div className="flex items-center space-x-4 mt-2">
										<span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
											{q.category}
										</span>
										<span className="text-sm text-gray-600 flex items-center">
											<Clock className="w-4 h-4 mr-1" />
											{formatTime(q.timeLimit)} max
										</span>
									</div>
								</div>
								{selectedQuestion?.id === q.id && (
									<CheckCircle className="w-5 h-5 text-purple-600" />
								)}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Recording Controls */}
			<div className="bg-white rounded-lg shadow-md p-6">
				<h2 className="text-lg font-semibold mb-4">Voice Recording</h2>

				{selectedQuestion && (
					<div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
						<p className="text-purple-800 font-medium">Selected Question:</p>
						<p className="text-purple-700">{selectedQuestion.question}</p>
						<p className="text-sm text-purple-600 mt-2">
							Time Limit: {formatTime(selectedQuestion.timeLimit)}
						</p>
					</div>
				)}

				<div className="flex items-center justify-center space-x-4 mb-6">
					{!isRecording && !audioBlob && (
						<button
							onClick={startRecording}
							disabled={!selectedQuestion}
							className="flex items-center px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Mic className="w-5 h-5 mr-2" />
							Start Recording
						</button>
					)}

					{isRecording && (
						<>
							<div className="flex items-center space-x-4">
								<div className="flex items-center space-x-2">
									<div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
									<span className="text-red-600 font-semibold">
										Recording...
									</span>
								</div>
								<span className="text-lg font-mono">
									{formatTime(recordingTime)}
								</span>
								<button
									onClick={stopRecording}
									className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-full hover:bg-gray-700"
								>
									<Square className="w-5 h-5 mr-2" />
									Stop
								</button>
							</div>
						</>
					)}

					{audioBlob && (
						<div className="flex items-center space-x-4">
							<button
								onClick={playAudio}
								className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								{isPlaying ? (
									<>
										<Pause className="w-4 h-4 mr-2" />
										Pause
									</>
								) : (
									<>
										<Play className="w-4 h-4 mr-2" />
										Play
									</>
								)}
							</button>

							<button
								onClick={resetRecording}
								className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
							>
								<RotateCcw className="w-4 h-4 mr-2" />
								Reset
							</button>

							<button
								onClick={analyzeVoice}
								disabled={loading}
								className="flex items-center px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
							>
								{loading ? (
									<>
										<Brain className="w-4 h-4 mr-2 animate-pulse" />
										Analyzing...
									</>
								) : (
									<>
										<Brain className="w-4 h-4 mr-2" />
										Analyze Voice
									</>
								)}
							</button>
						</div>
					)}
				</div>

				{/* Audio Player */}
				{audioUrl && (
					<div className="flex items-center justify-center">
						<audio
							ref={audioRef}
							src={audioUrl}
							onEnded={() => setIsPlaying(false)}
							onPlay={() => setIsPlaying(true)}
							onPause={() => setIsPlaying(false)}
							className="w-full max-w-md"
							controls
						/>
					</div>
				)}
			</div>

			{/* Assessment Results */}
			{assessment && (
				<div className="bg-white rounded-lg shadow-md p-6">
					<h2 className="text-lg font-semibold mb-6">Voice Analysis Results</h2>

					{/* Overall Score */}
					<div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg p-6 text-white mb-6">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-2xl font-bold">Overall Score</h3>
								<p className="text-purple-100">
									Based on voice analysis and content evaluation
								</p>
							</div>
							<div className="text-right">
								<div className="text-4xl font-bold">
									{assessment.overall_score}/100
								</div>
								<div className="text-lg font-medium">
									{assessment.overall_score >= 80
										? "Excellent"
										: assessment.overall_score >= 60
										? "Good"
										: assessment.overall_score >= 40
										? "Fair"
										: "Needs Improvement"}
								</div>
							</div>
						</div>
					</div>

					{/* Detailed Metrics */}
					<div className="grid md:grid-cols-2 gap-6 mb-6">
						{/* Voice Quality */}
						<div className="border rounded-lg p-4">
							<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
								<Volume2 className="w-5 h-5 mr-2 text-blue-600" />
								Voice Quality
							</h4>
							<div className="space-y-3">
								{Object.entries(assessment.voice_metrics).map(
									([metric, value]) => (
										<div
											key={metric}
											className="flex items-center justify-between"
										>
											<span className="text-gray-700 capitalize">
												{metric.replace("_", " ")}
											</span>
											<div className="flex items-center">
												<div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
													<div
														className={`h-2 rounded-full ${getScoreColor(
															value
														).replace("text-", "bg-")}`}
														style={{ width: `${value}%` }}
													></div>
												</div>
												<span
													className={`text-sm font-medium ${getScoreColor(
														value
													)}`}
												>
													{value}%
												</span>
											</div>
										</div>
									)
								)}
							</div>
						</div>

						{/* Content Analysis */}
						<div className="border rounded-lg p-4">
							<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
								<MessageSquare className="w-5 h-5 mr-2 text-green-600" />
								Content Analysis
							</h4>
							<div className="space-y-3">
								{Object.entries(assessment.content_metrics).map(
									([metric, value]) => (
										<div
											key={metric}
											className="flex items-center justify-between"
										>
											<span className="text-gray-700 capitalize">
												{metric.replace("_", " ")}
											</span>
											<div className="flex items-center">
												<div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
													<div
														className={`h-2 rounded-full ${getScoreColor(
															value
														).replace("text-", "bg-")}`}
														style={{ width: `${value}%` }}
													></div>
												</div>
												<span
													className={`text-sm font-medium ${getScoreColor(
														value
													)}`}
												>
													{value}%
												</span>
											</div>
										</div>
									)
								)}
							</div>
						</div>
					</div>

					{/* Transcript */}
					<div className="border rounded-lg p-4 mb-6">
						<h4 className="font-semibold text-gray-900 mb-3">Transcript</h4>
						<div className="bg-gray-50 rounded p-4">
							<p className="text-gray-700 leading-relaxed">
								{assessment.transcript}
							</p>
						</div>
					</div>

					{/* Key Phrases */}
					<div className="border rounded-lg p-4 mb-6">
						<h4 className="font-semibold text-gray-900 mb-3">
							Key Phrases Detected
						</h4>
						<div className="flex flex-wrap gap-2">
							{assessment.key_phrases?.map((phrase, index) => (
								<span
									key={index}
									className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
								>
									{phrase}
								</span>
							))}
						</div>
					</div>

					{/* Recommendations */}
					<div className="border rounded-lg p-4">
						<h4 className="font-semibold text-gray-900 mb-3 flex items-center">
							<BarChart3 className="w-5 h-5 mr-2 text-purple-600" />
							Improvement Recommendations
						</h4>
						<div className="space-y-3">
							{assessment.recommendations?.map((rec, index) => (
								<div key={index} className="flex items-start">
									<AlertCircle className="w-5 h-5 text-orange-500 mr-2 mt-0.5" />
									<div>
										<p className="text-gray-900 font-medium">{rec.title}</p>
										<p className="text-gray-600 text-sm">{rec.description}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default VoiceAssessment;
