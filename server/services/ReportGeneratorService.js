/**
 * Report Generator Service for BharatIntern AI Platform
 * Generates PDF reports, analytics dashboards, and data exports
 */

const PDFDocument = require("pdfkit");
const fs = require("fs").promises;
const path = require("path");
const ExcelJS = require("exceljs");
const ChartJSNodeCanvas = require("chartjs-node-canvas");

class ReportGeneratorService {
	constructor() {
		this.chartRenderer = new ChartJSNodeCanvas({
			width: 800,
			height: 400,
			backgroundColour: "white",
		});
		this.reportTemplates = this.initializeReportTemplates();
		this.reportsDir = path.join(__dirname, "../reports");
		this.ensureReportsDirectory();
	}

	/**
	 * Ensure reports directory exists
	 */
	async ensureReportsDirectory() {
		try {
			await fs.access(this.reportsDir);
		} catch {
			await fs.mkdir(this.reportsDir, { recursive: true });
		}
	}

	/**
	 * Generate comprehensive candidate profile report
	 */
	async generateCandidateReport(candidateData) {
		const {
			candidateId,
			personalInfo,
			resumeAnalysis,
			skillAssessments,
			interviewResults,
			codingProfile,
			jobMatches,
			applicationHistory,
		} = candidateData;

		const doc = new PDFDocument({ margin: 50 });
		const filename = `candidate_report_${candidateId}_${Date.now()}.pdf`;
		const filepath = path.join(this.reportsDir, filename);

		const stream = fs.createWriteStream(filepath);
		doc.pipe(stream);

		// Header
		await this.addReportHeader(
			doc,
			"Candidate Profile Report",
			personalInfo.name
		);

		// Personal Information Section
		this.addSection(doc, "Personal Information", () => {
			doc
				.fontSize(12)
				.text(`Name: ${personalInfo.name}`)
				.text(`Email: ${personalInfo.email}`)
				.text(`Phone: ${personalInfo.phone || "Not provided"}`)
				.text(`Location: ${personalInfo.location || "Not specified"}`)
				.text(`Experience: ${personalInfo.experience || "Not specified"} years`)
				.moveDown();
		});

		// Resume Analysis Section
		if (resumeAnalysis) {
			this.addSection(doc, "Resume Analysis", () => {
				doc
					.fontSize(12)
					.text(`Overall Score: ${resumeAnalysis.overallScore}/100`)
					.text(`ATS Compatibility: ${resumeAnalysis.atsScore}/100`)
					.text(
						`Key Skills: ${
							resumeAnalysis.skills?.slice(0, 10).join(", ") || "None detected"
						}`
					)
					.moveDown();

				if (resumeAnalysis.strengths?.length > 0) {
					doc.text("Strengths:", { underline: true });
					resumeAnalysis.strengths.forEach((strength) => {
						doc.text(`• ${strength}`, { indent: 20 });
					});
					doc.moveDown();
				}

				if (resumeAnalysis.recommendations?.length > 0) {
					doc.text("Recommendations:", { underline: true });
					resumeAnalysis.recommendations.forEach((rec) => {
						doc.text(`• ${rec}`, { indent: 20 });
					});
					doc.moveDown();
				}
			});
		}

		// Skill Assessments Section
		if (skillAssessments?.length > 0) {
			this.addSection(doc, "Skill Assessment Results", () => {
				skillAssessments.forEach((assessment) => {
					doc
						.fontSize(12)
						.text(
							`${assessment.title}: ${assessment.score}% (${assessment.level})`
						)
						.text(
							`Completed: ${new Date(
								assessment.completedAt
							).toLocaleDateString()}`
						)
						.text(`Time Taken: ${assessment.timeTaken} minutes`)
						.moveDown(0.5);
				});
			});
		}

		// Interview Results Section
		if (interviewResults?.length > 0) {
			this.addSection(doc, "Interview Performance", () => {
				interviewResults.forEach((interview) => {
					doc
						.fontSize(12)
						.text(`${interview.type} Interview - ${interview.company}`)
						.text(`Overall Score: ${interview.overallScore}/100`)
						.text(
							`Communication: ${interview.scores?.communication || "N/A"}/100`
						)
						.text(
							`Technical Skills: ${interview.scores?.technical || "N/A"}/100`
						)
						.text(
							`Problem Solving: ${
								interview.scores?.problemSolving || "N/A"
							}/100`
						)
						.text(`Date: ${new Date(interview.date).toLocaleDateString()}`)
						.moveDown();
				});
			});
		}

		// Coding Profile Section
		if (codingProfile) {
			this.addSection(doc, "Coding Profile Analysis", () => {
				doc
					.fontSize(12)
					.text(
						`GitHub Profile: ${
							codingProfile.github?.username || "Not connected"
						}`
					)
					.text(
						`Public Repositories: ${codingProfile.github?.publicRepos || 0}`
					)
					.text(
						`LeetCode Problems Solved: ${
							codingProfile.leetcode?.totalSolved || 0
						}`
					)
					.text(
						`LeetCode Ranking: ${codingProfile.leetcode?.ranking || "Unranked"}`
					)
					.text(
						`Primary Languages: ${
							codingProfile.primaryLanguages?.join(", ") || "None detected"
						}`
					)
					.text(`Coding Score: ${codingProfile.overallScore || 0}/100`)
					.moveDown();
			});
		}

		// Job Matches Section
		if (jobMatches?.length > 0) {
			this.addSection(doc, "Recent Job Matches", () => {
				const topMatches = jobMatches.slice(0, 5);
				topMatches.forEach((match) => {
					doc
						.fontSize(12)
						.text(`${match.jobTitle} at ${match.companyName}`)
						.text(`Match Score: ${match.matchScore}%`)
						.text(`Status: ${match.applicationStatus || "Not applied"}`)
						.moveDown(0.5);
				});
			});
		}

		// Application History Section
		if (applicationHistory?.length > 0) {
			this.addSection(doc, "Application History", () => {
				applicationHistory.slice(0, 10).forEach((app) => {
					doc
						.fontSize(12)
						.text(`${app.jobTitle} at ${app.companyName}`)
						.text(`Applied: ${new Date(app.appliedAt).toLocaleDateString()}`)
						.text(`Status: ${app.status}`)
						.moveDown(0.5);
				});
			});
		}

		// Footer
		this.addFooter(doc);

		doc.end();

		return new Promise((resolve, reject) => {
			stream.on("finish", () => {
				resolve({
					filename,
					filepath,
					size: null, // Will be calculated after file is written
				});
			});
			stream.on("error", reject);
		});
	}

	/**
	 * Generate company hiring analytics report
	 */
	async generateCompanyAnalyticsReport(companyData) {
		const {
			companyId,
			companyName,
			hiringStats,
			candidateAnalytics,
			jobPostings,
			interviewMetrics,
			timeRange,
		} = companyData;

		const doc = new PDFDocument({ margin: 50 });
		const filename = `company_analytics_${companyId}_${Date.now()}.pdf`;
		const filepath = path.join(this.reportsDir, filename);

		const stream = fs.createWriteStream(filepath);
		doc.pipe(stream);

		// Header
		await this.addReportHeader(doc, "Hiring Analytics Report", companyName);

		// Executive Summary
		this.addSection(doc, "Executive Summary", () => {
			doc
				.fontSize(12)
				.text(`Report Period: ${timeRange.start} to ${timeRange.end}`)
				.text(`Total Applications: ${hiringStats.totalApplications}`)
				.text(`Interviews Conducted: ${hiringStats.totalInterviews}`)
				.text(`Offers Made: ${hiringStats.offersExtended}`)
				.text(`Hires Completed: ${hiringStats.hiresCompleted}`)
				.text(`Average Time to Hire: ${hiringStats.avgTimeToHire} days`)
				.moveDown();
		});

		// Key Metrics
		this.addSection(doc, "Key Performance Indicators", () => {
			const conversionRate = (
				(hiringStats.hiresCompleted / hiringStats.totalApplications) *
				100
			).toFixed(2);
			const interviewToOfferRate = (
				(hiringStats.offersExtended / hiringStats.totalInterviews) *
				100
			).toFixed(2);

			doc
				.fontSize(12)
				.text(`Application to Hire Conversion Rate: ${conversionRate}%`)
				.text(`Interview to Offer Rate: ${interviewToOfferRate}%`)
				.text(`Offer Acceptance Rate: ${hiringStats.offerAcceptanceRate || 0}%`)
				.text(`Average Cost per Hire: $${hiringStats.avgCostPerHire || 0}`)
				.moveDown();
		});

		// Job Postings Performance
		if (jobPostings?.length > 0) {
			this.addSection(doc, "Job Postings Performance", () => {
				jobPostings.forEach((job) => {
					doc
						.fontSize(12)
						.text(`${job.title}`)
						.text(`Applications: ${job.applicationsCount}`)
						.text(`Interviews: ${job.interviewsCount}`)
						.text(`Status: ${job.status}`)
						.text(`Posted: ${new Date(job.postedAt).toLocaleDateString()}`)
						.moveDown(0.5);
				});
			});
		}

		// Candidate Analytics
		if (candidateAnalytics) {
			this.addSection(doc, "Candidate Analytics", () => {
				doc
					.fontSize(12)
					.text(
						`Top Skills in Demand: ${
							candidateAnalytics.topSkills?.join(", ") || "None"
						}`
					)
					.text(
						`Average Experience Level: ${
							candidateAnalytics.avgExperience || 0
						} years`
					)
					.text(
						`Most Common Locations: ${
							candidateAnalytics.topLocations?.join(", ") || "None"
						}`
					)
					.text(
						`Education Levels: ${
							candidateAnalytics.educationBreakdown || "Not analyzed"
						}`
					)
					.moveDown();
			});
		}

		// Interview Metrics
		if (interviewMetrics) {
			this.addSection(doc, "Interview Performance Metrics", () => {
				doc
					.fontSize(12)
					.text(
						`Average Interview Score: ${interviewMetrics.avgScore || 0}/100`
					)
					.text(
						`Technical Assessment Average: ${
							interviewMetrics.avgTechnicalScore || 0
						}/100`
					)
					.text(
						`Communication Score Average: ${
							interviewMetrics.avgCommunicationScore || 0
						}/100`
					)
					.text(
						`Average Interview Duration: ${
							interviewMetrics.avgDuration || 0
						} minutes`
					)
					.moveDown();
			});
		}

		this.addFooter(doc);
		doc.end();

		return new Promise((resolve, reject) => {
			stream.on("finish", () => {
				resolve({
					filename,
					filepath,
				});
			});
			stream.on("error", reject);
		});
	}

	/**
	 * Generate assessment analytics report
	 */
	async generateAssessmentReport(assessmentData) {
		const {
			assessmentId,
			title,
			participants,
			statistics,
			questionAnalytics,
			performanceMetrics,
		} = assessmentData;

		const doc = new PDFDocument({ margin: 50 });
		const filename = `assessment_report_${assessmentId}_${Date.now()}.pdf`;
		const filepath = path.join(this.reportsDir, filename);

		const stream = fs.createWriteStream(filepath);
		doc.pipe(stream);

		await this.addReportHeader(doc, "Assessment Analytics Report", title);

		// Overview
		this.addSection(doc, "Assessment Overview", () => {
			doc
				.fontSize(12)
				.text(`Assessment Title: ${title}`)
				.text(`Total Participants: ${participants.length}`)
				.text(`Completion Rate: ${statistics.completionRate}%`)
				.text(`Average Score: ${statistics.averageScore}/100`)
				.text(`Average Time Taken: ${statistics.averageTime} minutes`)
				.moveDown();
		});

		// Score Distribution
		this.addSection(doc, "Score Distribution", () => {
			const scoreRanges = {
				"Excellent (90-100)": participants.filter((p) => p.score >= 90).length,
				"Good (80-89)": participants.filter(
					(p) => p.score >= 80 && p.score < 90
				).length,
				"Average (70-79)": participants.filter(
					(p) => p.score >= 70 && p.score < 80
				).length,
				"Below Average (60-69)": participants.filter(
					(p) => p.score >= 60 && p.score < 70
				).length,
				"Poor (< 60)": participants.filter((p) => p.score < 60).length,
			};

			Object.entries(scoreRanges).forEach(([range, count]) => {
				const percentage = ((count / participants.length) * 100).toFixed(1);
				doc.text(`${range}: ${count} participants (${percentage}%)`);
			});
			doc.moveDown();
		});

		// Question Analytics
		if (questionAnalytics?.length > 0) {
			this.addSection(doc, "Question Performance Analysis", () => {
				questionAnalytics.forEach((question, index) => {
					doc
						.fontSize(11)
						.text(
							`Question ${index + 1}: ${question.text.substring(0, 100)}...`
						)
						.text(
							`Correct Answers: ${question.correctAnswers}/${participants.length} (${question.correctPercentage}%)`
						)
						.text(`Average Time: ${question.averageTime} seconds`)
						.text(`Difficulty Level: ${question.difficultyLevel}`)
						.moveDown(0.5);
				});
			});
		}

		this.addFooter(doc);
		doc.end();

		return new Promise((resolve, reject) => {
			stream.on("finish", () => {
				resolve({
					filename,
					filepath,
				});
			});
			stream.on("error", reject);
		});
	}

	/**
	 * Generate Excel export for data analysis
	 */
	async generateExcelReport(data, reportType) {
		const workbook = new ExcelJS.Workbook();
		const filename = `${reportType}_export_${Date.now()}.xlsx`;
		const filepath = path.join(this.reportsDir, filename);

		switch (reportType) {
			case "candidates":
				await this.createCandidatesExcelSheet(workbook, data);
				break;
			case "applications":
				await this.createApplicationsExcelSheet(workbook, data);
				break;
			case "assessments":
				await this.createAssessmentsExcelSheet(workbook, data);
				break;
			case "interviews":
				await this.createInterviewsExcelSheet(workbook, data);
				break;
			default:
				throw new Error(`Unsupported report type: ${reportType}`);
		}

		await workbook.xlsx.writeFile(filepath);

		return {
			filename,
			filepath,
			format: "xlsx",
		};
	}

	/**
	 * Create candidates Excel sheet
	 */
	async createCandidatesExcelSheet(workbook, candidates) {
		const worksheet = workbook.addWorksheet("Candidates");

		// Headers
		worksheet.columns = [
			{ header: "ID", key: "id", width: 15 },
			{ header: "Name", key: "name", width: 25 },
			{ header: "Email", key: "email", width: 30 },
			{ header: "Phone", key: "phone", width: 15 },
			{ header: "Experience", key: "experience", width: 12 },
			{ header: "Skills", key: "skills", width: 40 },
			{ header: "Resume Score", key: "resumeScore", width: 12 },
			{ header: "Last Active", key: "lastActive", width: 15 },
			{ header: "Applications", key: "applications", width: 12 },
			{ header: "Interview Score", key: "interviewScore", width: 15 },
		];

		// Style headers
		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFE0E0E0" },
		};

		// Add data
		candidates.forEach((candidate) => {
			worksheet.addRow({
				id: candidate.id,
				name: candidate.name,
				email: candidate.email,
				phone: candidate.phone || "N/A",
				experience: candidate.experience || 0,
				skills: candidate.skills?.join(", ") || "None",
				resumeScore: candidate.resumeAnalysis?.overallScore || "N/A",
				lastActive: candidate.lastActive
					? new Date(candidate.lastActive).toLocaleDateString()
					: "N/A",
				applications: candidate.applicationsCount || 0,
				interviewScore: candidate.avgInterviewScore || "N/A",
			});
		});
	}

	/**
	 * Create applications Excel sheet
	 */
	async createApplicationsExcelSheet(workbook, applications) {
		const worksheet = workbook.addWorksheet("Applications");

		worksheet.columns = [
			{ header: "Application ID", key: "id", width: 15 },
			{ header: "Candidate Name", key: "candidateName", width: 25 },
			{ header: "Job Title", key: "jobTitle", width: 30 },
			{ header: "Company", key: "company", width: 25 },
			{ header: "Applied Date", key: "appliedDate", width: 15 },
			{ header: "Status", key: "status", width: 15 },
			{ header: "Match Score", key: "matchScore", width: 12 },
			{ header: "Resume Score", key: "resumeScore", width: 12 },
			{ header: "Last Updated", key: "lastUpdated", width: 15 },
		];

		worksheet.getRow(1).font = { bold: true };
		worksheet.getRow(1).fill = {
			type: "pattern",
			pattern: "solid",
			fgColor: { argb: "FFE0E0E0" },
		};

		applications.forEach((app) => {
			worksheet.addRow({
				id: app.id,
				candidateName: app.candidate?.name || "Unknown",
				jobTitle: app.job?.title || "Unknown",
				company: app.job?.company || "Unknown",
				appliedDate: new Date(app.appliedAt).toLocaleDateString(),
				status: app.status,
				matchScore: app.matchScore || "N/A",
				resumeScore: app.resumeScore || "N/A",
				lastUpdated: new Date(app.updatedAt).toLocaleDateString(),
			});
		});
	}

	/**
	 * Generate chart image
	 */
	async generateChart(chartConfig) {
		try {
			const imageBuffer = await this.chartRenderer.renderToBuffer(chartConfig);
			const filename = `chart_${Date.now()}.png`;
			const filepath = path.join(this.reportsDir, filename);

			await fs.writeFile(filepath, imageBuffer);

			return {
				filename,
				filepath,
				buffer: imageBuffer,
			};
		} catch (error) {
			console.error("Chart generation failed:", error);
			return null;
		}
	}

	/**
	 * Add report header
	 */
	async addReportHeader(doc, title, subtitle = "") {
		// Logo placeholder (in production, add actual logo)
		doc
			.fontSize(24)
			.fillColor("#2563eb")
			.text("BharatIntern", 50, 50)
			.fontSize(10)
			.fillColor("gray")
			.text("AI-Powered Recruitment Platform", 50, 75)
			.moveDown(2);

		// Title
		doc
			.fontSize(18)
			.fillColor("black")
			.text(title, { align: "center" })
			.fontSize(14)
			.text(subtitle, { align: "center" })
			.moveDown();

		// Date and time
		doc
			.fontSize(10)
			.fillColor("gray")
			.text(`Generated on: ${new Date().toLocaleString()}`, { align: "right" })
			.moveDown(2);
	}

	/**
	 * Add section to PDF
	 */
	addSection(doc, title, contentCallback) {
		// Check if we need a new page
		if (doc.y > 700) {
			doc.addPage();
		}

		doc
			.fontSize(14)
			.fillColor("#2563eb")
			.text(title, { underline: true })
			.fillColor("black")
			.moveDown(0.5);

		contentCallback();
		doc.moveDown();
	}

	/**
	 * Add footer to PDF
	 */
	addFooter(doc) {
		const pages = doc.bufferedPageRange();
		for (let i = pages.start; i < pages.start + pages.count; i++) {
			doc.switchToPage(i);
			doc
				.fontSize(8)
				.fillColor("gray")
				.text(`Page ${i + 1} of ${pages.count}`, 50, doc.page.height - 50, {
					align: "center",
				})
				.text("© 2024 BharatIntern - Confidential", 50, doc.page.height - 35, {
					align: "center",
				});
		}
	}

	/**
	 * Initialize report templates
	 */
	initializeReportTemplates() {
		return {
			candidate_summary: {
				sections: ["personal_info", "resume_analysis", "skills", "experience"],
				format: "pdf",
			},
			company_analytics: {
				sections: ["hiring_stats", "candidate_pipeline", "performance_metrics"],
				format: "pdf",
			},
			assessment_results: {
				sections: ["overview", "score_distribution", "question_analytics"],
				format: "pdf",
			},
			bulk_export: {
				sections: ["all_data"],
				format: "excel",
			},
		};
	}

	/**
	 * Get report status
	 */
	async getReportStatus(reportId) {
		// In production, this would check database for report status
		return {
			id: reportId,
			status: "completed",
			generatedAt: new Date().toISOString(),
			downloadUrl: `/api/reports/download/${reportId}`,
		};
	}

	/**
	 * List available reports
	 */
	async listReports() {
		try {
			const files = await fs.readdir(this.reportsDir);
			const reports = [];

			for (const file of files) {
				const filepath = path.join(this.reportsDir, file);
				const stats = await fs.stat(filepath);

				reports.push({
					filename: file,
					size: stats.size,
					createdAt: stats.birthtime,
					modifiedAt: stats.mtime,
					type: path.extname(file).substring(1),
				});
			}

			return reports.sort(
				(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
			);
		} catch (error) {
			console.error("Error listing reports:", error);
			return [];
		}
	}

	/**
	 * Delete old reports
	 */
	async cleanupOldReports(maxAge = 30) {
		try {
			const files = await fs.readdir(this.reportsDir);
			const cutoffDate = new Date(Date.now() - maxAge * 24 * 60 * 60 * 1000);
			let deletedCount = 0;

			for (const file of files) {
				const filepath = path.join(this.reportsDir, file);
				const stats = await fs.stat(filepath);

				if (stats.birthtime < cutoffDate) {
					await fs.unlink(filepath);
					deletedCount++;
				}
			}

			return { deletedCount };
		} catch (error) {
			console.error("Error cleaning up reports:", error);
			return { deletedCount: 0 };
		}
	}
}

module.exports = ReportGeneratorService;
