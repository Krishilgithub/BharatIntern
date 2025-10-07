/**
 * File parsing utilities for BharatIntern AI Platform
 * Handles PDF, DOC, DOCX, TXT file parsing and text extraction
 */

const fs = require("fs").promises;
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const textract = require("textract");
const { promisify } = require("util");

const textractExtract = promisify(textract.fromFileWithPath);

/**
 * Extract text from various file formats
 * @param {string} filePath - Path to the file
 * @param {string} fileType - Type of file (pdf, doc, docx, txt)
 * @returns {Promise<Object>} - Extracted text and metadata
 */
const extractTextFromFile = async (filePath, fileType = null) => {
	try {
		// Auto-detect file type if not provided
		if (!fileType) {
			fileType = path.extname(filePath).toLowerCase().substring(1);
		}

		const stats = await fs.stat(filePath);
		const fileSize = stats.size;

		let extractedText = "";
		let pageCount = 1;
		let metadata = {};

		switch (fileType) {
			case "pdf":
				const pdfResult = await extractFromPDF(filePath);
				extractedText = pdfResult.text;
				pageCount = pdfResult.numpages;
				metadata = pdfResult.info || {};
				break;

			case "docx":
				const docxResult = await extractFromDOCX(filePath);
				extractedText = docxResult.value;
				metadata = docxResult.metadata || {};
				break;

			case "doc":
				extractedText = await extractFromDOC(filePath);
				break;

			case "txt":
				extractedText = await extractFromTXT(filePath);
				break;

			default:
				throw new Error(`Unsupported file type: ${fileType}`);
		}

		// Clean and process text
		const processedText = cleanExtractedText(extractedText);

		return {
			success: true,
			text: processedText,
			originalText: extractedText,
			metadata: {
				fileName: path.basename(filePath),
				fileType: fileType,
				fileSize: fileSize,
				pageCount: pageCount,
				wordCount: countWords(processedText),
				characterCount: processedText.length,
				extractedAt: new Date().toISOString(),
				...metadata,
			},
			sections: parseDocumentSections(processedText),
		};
	} catch (error) {
		console.error("Error extracting text from file:", error);
		return {
			success: false,
			error: error.message,
			text: "",
			metadata: {
				fileName: path.basename(filePath),
				fileType: fileType,
				extractedAt: new Date().toISOString(),
			},
		};
	}
};

/**
 * Extract text from PDF files
 */
const extractFromPDF = async (filePath) => {
	const dataBuffer = await fs.readFile(filePath);
	return await pdfParse(dataBuffer);
};

/**
 * Extract text from DOCX files
 */
const extractFromDOCX = async (filePath) => {
	return await mammoth.extractRawText({ path: filePath });
};

/**
 * Extract text from DOC files (legacy Word format)
 */
const extractFromDOC = async (filePath) => {
	return await textractExtract(filePath);
};

/**
 * Extract text from TXT files
 */
const extractFromTXT = async (filePath) => {
	return await fs.readFile(filePath, "utf-8");
};

/**
 * Clean and normalize extracted text
 */
const cleanExtractedText = (text) => {
	if (!text) return "";

	return (
		text
			// Remove excessive whitespaces
			.replace(/\s+/g, " ")
			// Remove special characters that might interfere with parsing
			.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "")
			// Normalize line breaks
			.replace(/\r\n/g, "\n")
			.replace(/\r/g, "\n")
			// Remove excessive line breaks
			.replace(/\n\s*\n\s*\n/g, "\n\n")
			// Trim whitespace
			.trim()
	);
};

/**
 * Parse document into logical sections
 */
const parseDocumentSections = (text) => {
	const sections = {
		personalInfo: "",
		summary: "",
		experience: "",
		education: "",
		skills: "",
		projects: "",
		certifications: "",
		other: "",
	};

	// Define keywords for each section
	const sectionKeywords = {
		personalInfo: ["name", "email", "phone", "address", "contact"],
		summary: ["summary", "objective", "profile", "about"],
		experience: ["experience", "employment", "work", "career", "position"],
		education: ["education", "academic", "degree", "university", "college"],
		skills: ["skills", "competencies", "technologies", "proficiency"],
		projects: ["projects", "portfolio", "work samples"],
		certifications: ["certifications", "certificates", "licenses", "awards"],
	};

	// Split text into paragraphs
	const paragraphs = text.split("\n\n").filter((p) => p.trim().length > 0);

	// Classify paragraphs into sections
	paragraphs.forEach((paragraph) => {
		const lowerParagraph = paragraph.toLowerCase();
		let bestMatch = "other";
		let bestScore = 0;

		Object.entries(sectionKeywords).forEach(([section, keywords]) => {
			const score = keywords.reduce((acc, keyword) => {
				return acc + (lowerParagraph.includes(keyword) ? 1 : 0);
			}, 0);

			if (score > bestScore) {
				bestScore = score;
				bestMatch = section;
			}
		});

		sections[bestMatch] += (sections[bestMatch] ? "\n\n" : "") + paragraph;
	});

	return sections;
};

/**
 * Count words in text
 */
const countWords = (text) => {
	if (!text) return 0;
	return text
		.trim()
		.split(/\s+/)
		.filter((word) => word.length > 0).length;
};

/**
 * Extract specific information patterns (emails, phones, etc.)
 */
const extractPatterns = (text) => {
	const patterns = {
		emails:
			text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [],
		phones:
			text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) ||
			[],
		urls: text.match(/https?:\/\/[^\s]+/g) || [],
		linkedIn: text.match(/linkedin\.com\/in\/[^\s]+/g) || [],
		github: text.match(/github\.com\/[^\s]+/g) || [],
	};

	return patterns;
};

/**
 * Validate file before processing
 */
const validateFile = async (filePath) => {
	try {
		const stats = await fs.stat(filePath);
		const fileSize = stats.size;
		const maxSize = 10 * 1024 * 1024; // 10MB

		if (fileSize > maxSize) {
			throw new Error(
				`File size (${Math.round(
					fileSize / 1024 / 1024
				)}MB) exceeds maximum allowed size (10MB)`
			);
		}

		const ext = path.extname(filePath).toLowerCase();
		const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];

		if (!allowedExtensions.includes(ext)) {
			throw new Error(
				`File type ${ext} not supported. Allowed types: ${allowedExtensions.join(
					", "
				)}`
			);
		}

		return { valid: true, fileSize, extension: ext };
	} catch (error) {
		return { valid: false, error: error.message };
	}
};

/**
 * Batch process multiple files
 */
const batchExtractText = async (filePaths) => {
	const results = [];

	for (const filePath of filePaths) {
		try {
			const result = await extractTextFromFile(filePath);
			results.push({
				filePath,
				...result,
			});
		} catch (error) {
			results.push({
				filePath,
				success: false,
				error: error.message,
			});
		}
	}

	return results;
};

module.exports = {
	extractTextFromFile,
	extractFromPDF,
	extractFromDOCX,
	extractFromDOC,
	extractFromTXT,
	cleanExtractedText,
	parseDocumentSections,
	countWords,
	extractPatterns,
	validateFile,
	batchExtractText,
};
