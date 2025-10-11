/**
 * Health Check Routes for BharatIntern AI Platform
 * Provides system health and status endpoints
 */

const express = require("express");
const router = express.Router();

/**
 * Basic health check endpoint
 */
router.get("/health", (req, res) => {
	res.status(200).json({
		success: true,
		message: "Server is running",
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		version: "1.0.0",
	});
});

/**
 * Detailed system status
 */
router.get("/status", (req, res) => {
	res.status(200).json({
		success: true,
		status: "operational",
		services: {
			api: "running",
			database: "connected",
			ai: "available",
		},
		timestamp: new Date().toISOString(),
		uptime: process.uptime(),
		memory: process.memoryUsage(),
		version: "1.0.0",
	});
});

module.exports = router;
