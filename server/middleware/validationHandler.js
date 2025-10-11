/**
 * Validation Middleware for BharatIntern AI Platform
 * Provides request validation and sanitization
 */

const { body, param, query, validationResult } = require("express-validator");

/**
 * Handle validation results
 */
const handleValidationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({
			success: false,
			message: "Validation failed",
			errors: errors.array(),
		});
	}
	next();
};

/**
 * Resume upload validation
 */
const validateResumeUpload = [
	body("userId").optional().isString().withMessage("User ID must be a string"),
	body("jobId").optional().isString().withMessage("Job ID must be a string"),
	handleValidationErrors,
];

/**
 * Assessment submission validation
 */
const validateAssessmentSubmission = [
	body("assessmentId").notEmpty().withMessage("Assessment ID is required"),
	body("answers").isArray().withMessage("Answers must be an array"),
	body("timeSpent")
		.optional()
		.isNumeric()
		.withMessage("Time spent must be numeric"),
	handleValidationErrors,
];

/**
 * Job matching request validation
 */
const validateJobMatchingRequest = [
	body("candidateId").notEmpty().withMessage("Candidate ID is required"),
	body("skills").optional().isArray().withMessage("Skills must be an array"),
	body("experience")
		.optional()
		.isNumeric()
		.withMessage("Experience must be numeric"),
	body("location")
		.optional()
		.isString()
		.withMessage("Location must be a string"),
	handleValidationErrors,
];

/**
 * Interview scheduling validation
 */
const validateInterviewSchedule = [
	body("candidateId").notEmpty().withMessage("Candidate ID is required"),
	body("interviewType")
		.isIn(["technical", "behavioral", "hr"])
		.withMessage("Invalid interview type"),
	body("scheduledDate").isISO8601().withMessage("Invalid date format"),
	body("duration")
		.optional()
		.isNumeric()
		.withMessage("Duration must be numeric"),
	handleValidationErrors,
];

/**
 * Coding profile validation
 */
const validateCodingProfile = [
	body("userId").notEmpty().withMessage("User ID is required"),
	body("platforms")
		.optional()
		.isArray()
		.withMessage("Platforms must be an array"),
	body("username")
		.optional()
		.isString()
		.withMessage("Username must be a string"),
	handleValidationErrors,
];

/**
 * General ID parameter validation
 */
const validateId = [
	param("id").isString().notEmpty().withMessage("Valid ID is required"),
	handleValidationErrors,
];

/**
 * Pagination validation
 */
const validatePagination = [
	query("page")
		.optional()
		.isInt({ min: 1 })
		.withMessage("Page must be a positive integer"),
	query("limit")
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage("Limit must be between 1 and 100"),
	handleValidationErrors,
];

/**
 * Email validation
 */
const validateEmail = [
	body("email")
		.isEmail()
		.normalizeEmail()
		.withMessage("Valid email is required"),
	handleValidationErrors,
];

/**
 * User registration validation
 */
const validateUserRegistration = [
	body("email")
		.isEmail()
		.normalizeEmail()
		.withMessage("Valid email is required"),
	body("password")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters"),
	body("firstName").notEmpty().trim().withMessage("First name is required"),
	body("lastName").notEmpty().trim().withMessage("Last name is required"),
	body("userType")
		.isIn(["candidate", "company", "admin"])
		.withMessage("Invalid user type"),
	handleValidationErrors,
];

/**
 * User login validation
 */
const validateUserLogin = [
	body("email")
		.isEmail()
		.normalizeEmail()
		.withMessage("Valid email is required"),
	body("password").notEmpty().withMessage("Password is required"),
	handleValidationErrors,
];

module.exports = {
	handleValidationErrors,
	validateResumeUpload,
	validateAssessmentSubmission,
	validateJobMatchingRequest,
	validateInterviewSchedule,
	validateCodingProfile,
	validateId,
	validatePagination,
	validateEmail,
	validateUserRegistration,
	validateUserLogin,
};
