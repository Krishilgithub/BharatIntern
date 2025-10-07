/**
 * Audio processing utilities for BharatIntern AI Platform
 * Handles audio file processing, speech-to-text, and audio analysis
 */

const fs = require("fs").promises;
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { promisify } = require("util");
const { HfInference } = require("@huggingface/inference");
const config = require("../config");

// Initialize Hugging Face client
const hf = new HfInference(config.ai.huggingface.apiKey);

/**
 * Speech-to-text conversion using Hugging Face Whisper
 */
const speechToText = async (audioPath, options = {}) => {
	const {
		model = "openai/whisper-small",
		language = "en",
		returnTimestamps = false,
	} = options;

	try {
		// Read audio file
		const audioBuffer = await fs.readFile(audioPath);

		// Convert to text using Hugging Face
		const response = await hf.automaticSpeechRecognition({
			model: model,
			data: audioBuffer,
			parameters: {
				return_timestamps: returnTimestamps,
				language: language,
			},
		});

		return {
			success: true,
			text: response.text || response,
			timestamps: returnTimestamps ? response.chunks : null,
			confidence: response.confidence || null,
			language: language,
			model: model,
			duration: await getAudioDuration(audioPath),
		};
	} catch (error) {
		console.error("Error in speech-to-text conversion:", error);

		// Fallback to alternative method if available
		try {
			return await speechToTextFallback(audioPath, options);
		} catch (fallbackError) {
			return {
				success: false,
				error: error.message,
				fallbackError: fallbackError.message,
				text: "",
				timestamps: null,
			};
		}
	}
};

/**
 * Fallback speech-to-text method
 */
const speechToTextFallback = async (audioPath, options = {}) => {
	// Alternative: Use a different model or service
	const { model = "facebook/wav2vec2-large-960h-lv60-self" } = options;

	try {
		const audioBuffer = await fs.readFile(audioPath);

		const response = await hf.automaticSpeechRecognition({
			model: model,
			data: audioBuffer,
		});

		return {
			success: true,
			text: response.text || response,
			model: model,
			isFallback: true,
		};
	} catch (error) {
		throw new Error(`Fallback STT failed: ${error.message}`);
	}
};

/**
 * Convert audio to supported format
 */
const convertAudio = async (inputPath, outputPath = null, format = "wav") => {
	return new Promise((resolve, reject) => {
		if (!outputPath) {
			outputPath = inputPath.replace(path.extname(inputPath), `.${format}`);
		}

		ffmpeg(inputPath)
			.toFormat(format)
			.audioChannels(1) // Mono
			.audioFrequency(16000) // 16kHz sample rate
			.on("end", () => {
				resolve({
					success: true,
					outputPath: outputPath,
					format: format,
				});
			})
			.on("error", (error) => {
				reject(new Error(`Audio conversion failed: ${error.message}`));
			})
			.save(outputPath);
	});
};

/**
 * Get audio file duration
 */
const getAudioDuration = async (audioPath) => {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(audioPath, (err, metadata) => {
			if (err) {
				reject(err);
			} else {
				resolve(metadata.format.duration);
			}
		});
	});
};

/**
 * Get audio file metadata
 */
const getAudioMetadata = async (audioPath) => {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(audioPath, (err, metadata) => {
			if (err) {
				reject(err);
			} else {
				const audioStream = metadata.streams.find(
					(s) => s.codec_type === "audio"
				);
				resolve({
					duration: metadata.format.duration,
					size: metadata.format.size,
					bitRate: metadata.format.bit_rate,
					format: metadata.format.format_name,
					codec: audioStream?.codec_name,
					sampleRate: audioStream?.sample_rate,
					channels: audioStream?.channels,
					tags: metadata.format.tags || {},
				});
			}
		});
	});
};

/**
 * Trim audio file
 */
const trimAudio = async (inputPath, outputPath, startTime, duration) => {
	return new Promise((resolve, reject) => {
		ffmpeg(inputPath)
			.seekInput(startTime)
			.duration(duration)
			.on("end", () => {
				resolve({
					success: true,
					outputPath: outputPath,
					startTime: startTime,
					duration: duration,
				});
			})
			.on("error", (error) => {
				reject(new Error(`Audio trimming failed: ${error.message}`));
			})
			.save(outputPath);
	});
};

/**
 * Analyze audio quality
 */
const analyzeAudioQuality = async (audioPath) => {
	try {
		const metadata = await getAudioMetadata(audioPath);
		const stats = await fs.stat(audioPath);

		// Quality scoring based on various factors
		let qualityScore = 10;
		const issues = [];

		// Check sample rate
		if (metadata.sampleRate < 16000) {
			qualityScore -= 2;
			issues.push("Low sample rate (< 16kHz)");
		}

		// Check bit rate
		if (metadata.bitRate < 64000) {
			qualityScore -= 2;
			issues.push("Low bit rate (< 64kbps)");
		}

		// Check duration
		if (metadata.duration > 600) {
			// 10 minutes
			qualityScore -= 1;
			issues.push("Very long audio file");
		} else if (metadata.duration < 5) {
			qualityScore -= 2;
			issues.push("Very short audio file");
		}

		// Check file size relative to duration
		const expectedSize = metadata.duration * 32000; // ~32KB per second for decent quality
		if (stats.size < expectedSize * 0.5) {
			qualityScore -= 1;
			issues.push("File size suggests low quality encoding");
		}

		return {
			success: true,
			qualityScore: Math.max(0, qualityScore),
			issues: issues,
			metadata: metadata,
			recommendations: generateQualityRecommendations(qualityScore, issues),
		};
	} catch (error) {
		return {
			success: false,
			error: error.message,
			qualityScore: 0,
		};
	}
};

/**
 * Generate quality improvement recommendations
 */
const generateQualityRecommendations = (score, issues) => {
	const recommendations = [];

	if (issues.includes("Low sample rate (< 16kHz)")) {
		recommendations.push(
			"Consider re-recording with at least 16kHz sample rate"
		);
	}

	if (issues.includes("Low bit rate (< 64kbps)")) {
		recommendations.push("Use higher bit rate encoding for better quality");
	}

	if (issues.includes("Very long audio file")) {
		recommendations.push(
			"Consider splitting into smaller segments for better processing"
		);
	}

	if (issues.includes("Very short audio file")) {
		recommendations.push(
			"Provide longer audio samples for more accurate analysis"
		);
	}

	if (score < 5) {
		recommendations.push(
			"Audio quality is poor - consider re-recording with better equipment"
		);
	}

	return recommendations;
};

/**
 * Extract audio features for analysis
 */
const extractAudioFeatures = async (audioPath) => {
	try {
		const metadata = await getAudioMetadata(audioPath);

		// Basic features extraction
		const features = {
			duration: metadata.duration,
			sampleRate: metadata.sampleRate,
			channels: metadata.channels,
			bitRate: metadata.bitRate,
			format: metadata.format,
			// Additional features would require more advanced audio processing
			speechRate: metadata.duration > 0 ? 1 : 0, // Placeholder
			silenceRatio: 0, // Placeholder
			averageVolume: 0.5, // Placeholder
		};

		return {
			success: true,
			features: features,
		};
	} catch (error) {
		return {
			success: false,
			error: error.message,
			features: {},
		};
	}
};

/**
 * Validate audio file
 */
const validateAudioFile = async (audioPath) => {
	try {
		const stats = await fs.stat(audioPath);
		const metadata = await getAudioMetadata(audioPath);

		const validations = {
			exists: true,
			readable: true,
			size: stats.size,
			duration: metadata.duration,
			format: metadata.format,
			isValid: true,
			errors: [],
		};

		// Check file size limits
		const maxSize = config.files.maxSize;
		if (stats.size > maxSize) {
			validations.isValid = false;
			validations.errors.push(
				`File size (${Math.round(
					stats.size / 1024 / 1024
				)}MB) exceeds maximum (${Math.round(maxSize / 1024 / 1024)}MB)`
			);
		}

		// Check duration limits
		const maxDuration = 1200; // 20 minutes
		if (metadata.duration > maxDuration) {
			validations.isValid = false;
			validations.errors.push(
				`Duration (${Math.round(
					metadata.duration
				)}s) exceeds maximum (${maxDuration}s)`
			);
		}

		// Check minimum duration
		if (metadata.duration < 1) {
			validations.isValid = false;
			validations.errors.push("Audio duration too short (< 1 second)");
		}

		return validations;
	} catch (error) {
		return {
			exists: false,
			readable: false,
			isValid: false,
			errors: [error.message],
		};
	}
};

/**
 * Batch process multiple audio files
 */
const batchProcessAudio = async (audioPaths, operation, options = {}) => {
	const results = [];

	for (const audioPath of audioPaths) {
		try {
			const result = await operation(audioPath, options);
			results.push({
				audioPath,
				success: true,
				...result,
			});
		} catch (error) {
			results.push({
				audioPath,
				success: false,
				error: error.message,
			});
		}
	}

	return results;
};

/**
 * Clean up temporary audio files
 */
const cleanupAudioFiles = async (filePaths) => {
	const results = [];

	for (const filePath of filePaths) {
		try {
			await fs.unlink(filePath);
			results.push({ filePath, deleted: true });
		} catch (error) {
			results.push({ filePath, deleted: false, error: error.message });
		}
	}

	return results;
};

module.exports = {
	speechToText,
	speechToTextFallback,
	convertAudio,
	getAudioDuration,
	getAudioMetadata,
	trimAudio,
	analyzeAudioQuality,
	generateQualityRecommendations,
	extractAudioFeatures,
	validateAudioFile,
	batchProcessAudio,
	cleanupAudioFiles,
};
