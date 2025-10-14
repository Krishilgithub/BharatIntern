/**
 * AI utility functions for BharatIntern AI Platform
 * Common AI operations, prompt templates, and model interactions
 */

const { HfInference } = require("@huggingface/inference");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config");

// Initialize AI clients
const hf = new HfInference(config.ai.huggingface.apiKey);
const genAI = config.ai.gemini.apiKey
	? new GoogleGenerativeAI(config.ai.gemini.apiKey)
	: null;

/**
 * Generate embeddings for text using Hugging Face
 */
const generateEmbeddings = async (
	text,
	model = "sentence-transformers/all-MiniLM-L6-v2"
) => {
	try {
		const embedding = await hf.featureExtraction({
			model: model,
			inputs: text,
		});

		return {
			success: true,
			embedding: embedding,
			model: model,
			dimension: Array.isArray(embedding) ? embedding.length : null,
		};
	} catch (error) {
		console.error("Error generating embeddings:", error);
		return {
			success: false,
			error: error.message,
			embedding: null,
		};
	}
};

/**
 * Calculate cosine similarity between two embeddings
 */
const cosineSimilarity = (vecA, vecB) => {
	if (!vecA || !vecB || vecA.length !== vecB.length) {
		throw new Error("Invalid vectors for similarity calculation");
	}

	const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
	const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
	const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

	if (magnitudeA === 0 || magnitudeB === 0) {
		return 0;
	}

	return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Generate text using Hugging Face models
 */
const generateText = async (prompt, options = {}) => {
	const {
		model = "microsoft/DialoGPT-medium",
		maxTokens = 512,
		temperature = 0.7,
		topP = 0.9,
	} = options;

	try {
		const response = await hf.textGeneration({
			model: model,
			inputs: prompt,
			parameters: {
				max_new_tokens: maxTokens,
				temperature: temperature,
				top_p: topP,
				return_full_text: false,
			},
		});

		return {
			success: true,
			text: response.generated_text,
			model: model,
		};
	} catch (error) {
		console.error("Error generating text:", error);
		return {
			success: false,
			error: error.message,
			text: "",
		};
	}
};

/**
 * Generate text using Gemini API (premium)
 */
const generateTextGemini = async (prompt, options = {}) => {
	if (!genAI) {
		throw new Error("Gemini API not configured");
	}

	const { model = "gemini-pro", temperature = 0.7, maxTokens = 1024 } = options;

	try {
		const modelInstance = genAI.getGenerativeModel({ model });
		const result = await modelInstance.generateContent({
			contents: [{ role: "user", parts: [{ text: prompt }] }],
			generationConfig: {
				temperature: temperature,
				maxOutputTokens: maxTokens,
			},
		});

		const response = await result.response;
		return {
			success: true,
			text: response.text(),
			model: model,
		};
	} catch (error) {
		console.error("Error with Gemini API:", error);
		return {
			success: false,
			error: error.message,
			text: "",
		};
	}
};

/**
 * Classify text using Hugging Face models
 */
const classifyText = async (
	text,
	labels,
	model = "facebook/bart-large-mnli"
) => {
	try {
		const response = await hf.zeroShotClassification({
			model: model,
			inputs: text,
			parameters: { candidate_labels: labels },
		});

		return {
			success: true,
			classifications: response.labels.map((label, i) => ({
				label: label,
				score: response.scores[i],
			})),
			topLabel: response.labels[0],
			topScore: response.scores[0],
		};
	} catch (error) {
		console.error("Error classifying text:", error);
		return {
			success: false,
			error: error.message,
			classifications: [],
		};
	}
};

/**
 * Extract named entities from text
 */
const extractEntities = async (
	text,
	model = "dbmdz/bert-large-cased-finetuned-conll03-english"
) => {
	try {
		const response = await hf.tokenClassification({
			model: model,
			inputs: text,
		});

		// Group consecutive tokens of the same entity
		const entities = [];
		let currentEntity = null;

		response.forEach((token) => {
			if (token.entity.startsWith("B-")) {
				if (currentEntity) {
					entities.push(currentEntity);
				}
				currentEntity = {
					type: token.entity.substring(2),
					text: token.word,
					confidence: token.score,
					start: token.start,
					end: token.end,
				};
			} else if (token.entity.startsWith("I-") && currentEntity) {
				currentEntity.text += token.word;
				currentEntity.end = token.end;
				currentEntity.confidence = Math.min(
					currentEntity.confidence,
					token.score
				);
			} else {
				if (currentEntity) {
					entities.push(currentEntity);
					currentEntity = null;
				}
			}
		});

		if (currentEntity) {
			entities.push(currentEntity);
		}

		return {
			success: true,
			entities: entities,
			entityTypes: [...new Set(entities.map((e) => e.type))],
		};
	} catch (error) {
		console.error("Error extracting entities:", error);
		return {
			success: false,
			error: error.message,
			entities: [],
		};
	}
};

/**
 * Summarize text using Hugging Face models
 */
const summarizeText = async (text, options = {}) => {
	const {
		model = "facebook/bart-large-cnn",
		maxLength = 150,
		minLength = 30,
	} = options;

	try {
		const response = await hf.summarization({
			model: model,
			inputs: text,
			parameters: {
				max_length: maxLength,
				min_length: minLength,
			},
		});

		return {
			success: true,
			summary: response.summary_text,
			originalLength: text.length,
			summaryLength: response.summary_text.length,
			compressionRatio: response.summary_text.length / text.length,
		};
	} catch (error) {
		console.error("Error summarizing text:", error);
		return {
			success: false,
			error: error.message,
			summary: "",
		};
	}
};

/**
 * Analyze sentiment of text
 */
const analyzeSentiment = async (
	text,
	model = "cardiffnlp/twitter-roberta-base-sentiment-latest"
) => {
	try {
		const response = await hf.textClassification({
			model: model,
			inputs: text,
		});

		return {
			success: true,
			sentiment: response[0].label,
			confidence: response[0].score,
			allScores: response,
		};
	} catch (error) {
		console.error("Error analyzing sentiment:", error);
		return {
			success: false,
			error: error.message,
			sentiment: "neutral",
			confidence: 0,
		};
	}
};

/**
 * Common prompt templates
 */
const promptTemplates = {
	resumeAnalysis: `
Analyze the following resume and provide a comprehensive evaluation:

Resume Content:
{resumeText}

Please provide:
1. Overall assessment score (1-10)
2. Key strengths identified
3. Areas for improvement
4. Skills extracted
5. Experience level assessment
6. Recommendations for enhancement

Format your response as structured JSON.
  `,

	jobMatching: `
Match the candidate profile with the job requirements:

Candidate Profile:
{candidateProfile}

Job Requirements:
{jobRequirements}

Provide:
1. Match score (0-100%)
2. Matching skills
3. Missing skills
4. Experience alignment
5. Overall recommendation

Format as JSON.
  `,

	interviewAssessment: `
Analyze the interview response for the given question:

Question: {question}
Response: {response}

Evaluate:
1. Relevance to question (1-10)
2. Technical accuracy (1-10)
3. Communication clarity (1-10)
4. Depth of knowledge (1-10)
5. Overall score (1-10)
6. Specific feedback and suggestions

Provide detailed JSON response.
  `,

	assessmentGeneration: `
Generate assessment questions for the following role and skills:

Role: {role}
Skills: {skills}
Difficulty Level: {difficulty}
Question Type: {questionType}

Create {questionCount} questions with:
1. Question text
2. Multiple choice options (if applicable)
3. Correct answer
4. Explanation
5. Difficulty rating
6. Skills tested

Format as JSON array.
  `,
};

/**
 * Apply prompt template with variables
 */
const applyTemplate = (template, variables) => {
	let result = template;
	Object.entries(variables).forEach(([key, value]) => {
		result = result.replace(new RegExp(`{${key}}`, "g"), value);
	});
	return result;
};

/**
 * Batch process multiple texts
 */
const batchProcess = async (texts, operation, options = {}) => {
	const results = [];
	const batchSize = options.batchSize || 5;

	for (let i = 0; i < texts.length; i += batchSize) {
		const batch = texts.slice(i, i + batchSize);
		const batchPromises = batch.map((text) => operation(text, options));
		const batchResults = await Promise.allSettled(batchPromises);

		batchResults.forEach((result, index) => {
			results.push({
				index: i + index,
				success: result.status === "fulfilled",
				data: result.status === "fulfilled" ? result.value : null,
				error: result.status === "rejected" ? result.reason.message : null,
			});
		});
	}

	return results;
};

/**
 * Retry mechanism for AI operations
 */
const withRetry = async (operation, maxRetries = 3, delay = 1000) => {
	for (let attempt = 1; attempt <= maxRetries; attempt++) {
		try {
			return await operation();
		} catch (error) {
			if (attempt === maxRetries) {
				throw error;
			}
			console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
			await new Promise((resolve) => setTimeout(resolve, delay));
			delay *= 2; // Exponential backoff
		}
	}
};

module.exports = {
	generateEmbeddings,
	cosineSimilarity,
	generateText,
	generateTextGemini,
	classifyText,
	extractEntities,
	summarizeText,
	analyzeSentiment,
	promptTemplates,
	applyTemplate,
	batchProcess,
	withRetry,
};
