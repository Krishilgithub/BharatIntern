/**
 * File validation and upload middleware for BharatIntern AI Platform
 * Handles resume uploads, audio files, and other document processing
 */

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { AppError } = require("./errorHandler");
const config = require("../config");

// Ensure upload directories exist
const ensureUploadDirs = () => {
	const dirs = [
		config.files.upload.destination,
		path.join(config.files.upload.destination, "resumes"),
		path.join(config.files.upload.destination, "audio"),
		path.join(config.files.upload.destination, "temp"),
	];

	dirs.forEach((dir) => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	});
};

// Initialize upload directories
ensureUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		let uploadPath = config.files.uploadDir;

		// Determine subdirectory based on file type
		if (file.fieldname === "resume") {
			uploadPath = path.join(uploadPath, "resumes");
		} else if (file.fieldname === "audio") {
			uploadPath = path.join(uploadPath, "audio");
		} else {
			uploadPath = path.join(uploadPath, "temp");
		}

		cb(null, uploadPath);
	},
	filename: (req, file, cb) => {
		// Generate unique filename
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		const name = file.originalname
			.replace(ext, "")
			.replace(/[^a-zA-Z0-9]/g, "_");
		cb(null, `${name}_${uniqueSuffix}${ext}`);
	},
});

// File filter
const fileFilter = (req, file, cb) => {
	const allowedTypes = {
		resume: [".pdf", ".doc", ".docx", ".txt"],
		audio: [".mp3", ".wav", ".m4a", ".ogg", ".webm"],
		general: [".pdf", ".doc", ".docx", ".txt", ".jpg", ".jpeg", ".png"],
	};

	const ext = path.extname(file.originalname).toLowerCase();
	const fieldType =
		file.fieldname === "resume"
			? "resume"
			: file.fieldname === "audio"
			? "audio"
			: "general";

	if (allowedTypes[fieldType].includes(ext)) {
		cb(null, true);
	} else {
		cb(
			new AppError(
				`Invalid file type for ${fieldType}. Allowed: ${allowedTypes[
					fieldType
				].join(", ")}`,
				400
			),
			false
		);
	}
};

// Multer configuration
const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: config.files.maxSize,
		files: 5, // Maximum 5 files per request
	},
});

// File validation middleware
const validateFileUpload = (fieldName, required = false) => {
	return (req, res, next) => {
		if (required && (!req.files || !req.files[fieldName])) {
			return next(new AppError(`${fieldName} file is required`, 400));
		}

		if (req.files && req.files[fieldName]) {
			const file = Array.isArray(req.files[fieldName])
				? req.files[fieldName][0]
				: req.files[fieldName];

			// Additional validation
			if (file.size > config.files.maxSize) {
				return next(
					new AppError(
						`File size exceeds maximum limit of ${
							config.files.maxSize / (1024 * 1024)
						}MB`,
						400
					)
				);
			}

			// Validate file content (basic check)
			const ext = path.extname(file.originalname).toLowerCase();
			if (
				fieldName === "resume" &&
				![".pdf", ".doc", ".docx", ".txt"].includes(ext)
			) {
				return next(
					new AppError("Resume must be in PDF, DOC, DOCX, or TXT format", 400)
				);
			}

			if (
				fieldName === "audio" &&
				![".mp3", ".wav", ".m4a", ".ogg", ".webm"].includes(ext)
			) {
				return next(
					new AppError(
						"Audio must be in MP3, WAV, M4A, OGG, or WebM format",
						400
					)
				);
			}
		}

		next();
	};
};

// File cleanup middleware
const cleanupFiles = (req, res, next) => {
	const originalEnd = res.end;
	const originalSend = res.send;

	const cleanup = () => {
		if (req.files) {
			Object.values(req.files)
				.flat()
				.forEach((file) => {
					if (file.path && fs.existsSync(file.path)) {
						fs.unlink(file.path, (err) => {
							if (err) console.error("Failed to cleanup file:", file.path, err);
						});
					}
				});
		}
	};

	res.end = function (...args) {
		cleanup();
		originalEnd.apply(this, args);
	};

	res.send = function (...args) {
		cleanup();
		originalSend.apply(this, args);
	};

	next();
};

// File size formatter
const formatFileSize = (bytes) => {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// File type detector
const detectFileType = (filePath) => {
	const ext = path.extname(filePath).toLowerCase();
	const types = {
		".pdf": "application/pdf",
		".doc": "application/msword",
		".docx":
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		".txt": "text/plain",
		".mp3": "audio/mpeg",
		".wav": "audio/wav",
		".m4a": "audio/mp4",
		".ogg": "audio/ogg",
		".webm": "audio/webm",
	};
	return types[ext] || "application/octet-stream";
};

module.exports = {
	upload,
	validateFileUpload,
	cleanupFiles,
	formatFileSize,
	detectFileType,
	ensureUploadDirs,
};
