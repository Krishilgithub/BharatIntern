/**
 * Authentication and authorization middleware for BharatIntern AI Platform
 * Handles JWT tokens, role-based access, and API key validation
 */

const jwt = require("jsonwebtoken");
const { AppError, catchAsync } = require("./errorHandler");
const config = require("../config");

// JWT token verification
const verifyToken = catchAsync(async (req, res, next) => {
	let token;

	// Get token from header
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies && req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (!token) {
		return next(
			new AppError("You are not logged in! Please log in to get access.", 401)
		);
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, config.auth.jwtSecret);

		// Add user info to request
		req.user = {
			id: decoded.id,
			email: decoded.email,
			role: decoded.role,
			iat: decoded.iat,
			exp: decoded.exp,
		};

		next();
	} catch (error) {
		if (error.name === "JsonWebTokenError") {
			return next(new AppError("Invalid token. Please log in again!", 401));
		} else if (error.name === "TokenExpiredError") {
			return next(
				new AppError("Your token has expired! Please log in again.", 401)
			);
		}
		return next(error);
	}
});

// Role-based authorization
const restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return next(
				new AppError("You must be logged in to access this resource.", 401)
			);
		}

		if (!roles.includes(req.user.role)) {
			return next(
				new AppError("You do not have permission to perform this action", 403)
			);
		}

		next();
	};
};

// API key validation for external services
const validateApiKey = (req, res, next) => {
	const apiKey = req.headers["x-api-key"] || req.query.apiKey;

	if (!apiKey) {
		return next(new AppError("API key is required", 401));
	}

	// In production, validate against database
	if (apiKey !== config.auth.apiKey) {
		return next(new AppError("Invalid API key", 401));
	}

	next();
};

// Optional authentication (for public endpoints with enhanced features for authenticated users)
const optionalAuth = catchAsync(async (req, res, next) => {
	let token;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	} else if (req.cookies && req.cookies.jwt) {
		token = req.cookies.jwt;
	}

	if (token) {
		try {
			const decoded = jwt.verify(token, config.auth.jwtSecret);
			req.user = {
				id: decoded.id,
				email: decoded.email,
				role: decoded.role,
				iat: decoded.iat,
				exp: decoded.exp,
			};
		} catch (error) {
			// Token invalid, but continue without user context
			req.user = null;
		}
	}

	next();
});

// Rate limiting by user
const userRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
	const requests = new Map();

	return (req, res, next) => {
		const identifier = req.user ? req.user.id : req.ip;
		const now = Date.now();
		const windowStart = now - windowMs;

		// Clean old requests
		if (requests.has(identifier)) {
			const userRequests = requests
				.get(identifier)
				.filter((time) => time > windowStart);
			requests.set(identifier, userRequests);
		}

		const currentRequests = requests.get(identifier) || [];

		if (currentRequests.length >= maxRequests) {
			return next(
				new AppError("Too many requests. Please try again later.", 429)
			);
		}

		currentRequests.push(now);
		requests.set(identifier, currentRequests);

		next();
	};
};

// Permission levels for different features
const checkPermission = (permission) => {
	const permissions = {
		basic: ["candidate", "company", "admin"],
		premium: ["company", "admin"],
		admin: ["admin"],
		resume_analysis: ["candidate", "company", "admin"],
		job_matching: ["candidate", "company", "admin"],
		assessment_create: ["company", "admin"],
		assessment_take: ["candidate", "admin"],
		interview_analysis: ["company", "admin"],
		bulk_operations: ["admin"],
		system_config: ["admin"],
	};

	return (req, res, next) => {
		if (!req.user) {
			return next(new AppError("Authentication required", 401));
		}

		const allowedRoles = permissions[permission];
		if (!allowedRoles || !allowedRoles.includes(req.user.role)) {
			return next(
				new AppError(`Insufficient permissions for ${permission}`, 403)
			);
		}

		next();
	};
};

// Generate JWT token
const generateToken = (payload) => {
	return jwt.sign(payload, config.auth.jwtSecret, {
		expiresIn: config.auth.jwtExpiry,
	});
};

// Verify and decode JWT without throwing errors
const decodeToken = (token) => {
	try {
		return jwt.verify(token, config.auth.jwtSecret);
	} catch (error) {
		return null;
	}
};

// Admin override for testing/debugging
const adminOverride = (req, res, next) => {
	const override = req.headers["x-admin-override"];
	if (
		override === config.auth.adminOverride &&
		config.server.env === "development"
	) {
		req.user = {
			id: "admin-override",
			email: "admin@bharatintern.com",
			role: "admin",
		};
	}
	next();
};

module.exports = {
	verifyToken,
	restrictTo,
	validateApiKey,
	optionalAuth,
	userRateLimit,
	checkPermission,
	generateToken,
	decodeToken,
	adminOverride,
};
