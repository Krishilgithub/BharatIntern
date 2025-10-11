/**
 * Email Service for BharatIntern AI Platform
 * Advanced email handling with templates, queues, and analytics
 */

const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs").promises;
const config = require("../config");

class EmailService {
	constructor() {
		this.transporter = null;
		this.emailQueue = [];
		this.templates = new Map();
		this.emailStats = {
			sent: 0,
			failed: 0,
			bounced: 0,
			opened: 0,
			clicked: 0,
		};
		this.isProcessing = false;
		this.retryAttempts = 3;
		this.retryDelay = 5000; // 5 seconds

		this.initializeTransporter();
		this.loadEmailTemplates();
		this.startQueueProcessor();
	}

	/**
	 * Initialize email transporter with multiple provider support
	 */
	async initializeTransporter() {
		const emailConfig = config.email || {};

		// Support multiple email providers
		const providers = {
			gmail: {
				host: "smtp.gmail.com",
				port: 587,
				secure: false,
			},
			outlook: {
				host: "smtp-mail.outlook.com",
				port: 587,
				secure: false,
			},
			sendgrid: {
				host: "smtp.sendgrid.net",
				port: 587,
				secure: false,
			},
			mailgun: {
				host: "smtp.mailgun.org",
				port: 587,
				secure: false,
			},
		};

		const providerConfig = providers[emailConfig.provider] || providers.gmail;

		try {
			this.transporter = nodemailer.createTransporter({
				...providerConfig,
				auth: {
					user: emailConfig.user || process.env.EMAIL_USER,
					pass: emailConfig.password || process.env.EMAIL_PASSWORD,
				},
				pool: true, // Use connection pooling
				maxConnections: 5,
				maxMessages: 100,
				rateLimit: 10, // Max 10 emails per second
				tls: {
					rejectUnauthorized: false,
				},
			});

			// Verify transporter
			await this.transporter.verify();
			console.log("Email service initialized successfully");
		} catch (error) {
			console.error("Failed to initialize email service:", error);
			// Fallback to console logging for development
			this.transporter = {
				sendMail: async (options) => {
					console.log("Email would be sent:", {
						to: options.to,
						subject: options.subject,
						text: options.text?.substring(0, 100) + "...",
					});
					return { messageId: "dev_" + Date.now() };
				},
			};
		}
	}

	/**
	 * Load email templates from files
	 */
	async loadEmailTemplates() {
		const templateDir = path.join(__dirname, "../templates/email");

		// Default templates (inline)
		const defaultTemplates = {
			welcome_candidate: {
				subject: "Welcome to BharatIntern - Your AI Career Journey Begins!",
				html: this.getWelcomeCandidateTemplate(),
				text: "Welcome to BharatIntern! Your AI-powered career journey starts now.",
			},
			welcome_company: {
				subject: "Welcome to BharatIntern - Transform Your Hiring Process",
				html: this.getWelcomeCompanyTemplate(),
				text: "Welcome to BharatIntern! Start hiring with AI-powered recruitment tools.",
			},
			job_application_received: {
				subject: "Application Received - {{jobTitle}}",
				html: this.getApplicationReceivedTemplate(),
				text: "Your application for {{jobTitle}} has been received and is under review.",
			},
			interview_scheduled: {
				subject: "Interview Scheduled - {{jobTitle}} at {{companyName}}",
				html: this.getInterviewScheduledTemplate(),
				text: "Your interview for {{jobTitle}} at {{companyName}} is scheduled for {{interviewDate}}.",
			},
			assessment_invitation: {
				subject: "Assessment Invitation - {{assessmentTitle}}",
				html: this.getAssessmentInvitationTemplate(),
				text: "You have been invited to take the {{assessmentTitle}} assessment.",
			},
			assessment_results: {
				subject: "Assessment Results - {{assessmentTitle}}",
				html: this.getAssessmentResultsTemplate(),
				text: "Your assessment results for {{assessmentTitle}} are now available.",
			},
			job_match_notification: {
				subject: "Perfect Job Match Found - {{matchScore}}% Match!",
				html: this.getJobMatchTemplate(),
				text: "We found a {{matchScore}}% job match: {{jobTitle}} at {{companyName}}",
			},
			application_status_update: {
				subject: "Application Update - {{jobTitle}}",
				html: this.getApplicationStatusTemplate(),
				text: "Your application status for {{jobTitle}} has been updated to: {{status}}",
			},
			interview_reminder: {
				subject: "Interview Reminder - Tomorrow at {{interviewTime}}",
				html: this.getInterviewReminderTemplate(),
				text: "Reminder: Your interview is scheduled for tomorrow at {{interviewTime}}",
			},
			password_reset: {
				subject: "Password Reset Request - BharatIntern",
				html: this.getPasswordResetTemplate(),
				text: "Click the link to reset your password: {{resetLink}}",
			},
			account_verification: {
				subject: "Verify Your BharatIntern Account",
				html: this.getAccountVerificationTemplate(),
				text: "Please verify your account by clicking: {{verificationLink}}",
			},
			weekly_summary: {
				subject: "Your Weekly Summary - {{weekStartDate}} to {{weekEndDate}}",
				html: this.getWeeklySummaryTemplate(),
				text: "Your weekly activity summary is available.",
			},
		};

		// Load templates
		for (const [name, template] of Object.entries(defaultTemplates)) {
			this.templates.set(name, template);
		}

		console.log(`Loaded ${this.templates.size} email templates`);
	}

	/**
	 * Send email with queue support
	 */
	async sendEmail(emailData) {
		const {
			to,
			subject,
			template,
			data = {},
			attachments = [],
			priority = "normal",
			scheduleAt = null,
			trackOpens = false,
			trackClicks = false,
		} = emailData;

		// Validate email address
		if (!this.isValidEmail(to)) {
			throw new Error("Invalid email address");
		}

		const emailJob = {
			id: this.generateEmailId(),
			to,
			subject,
			template,
			data,
			attachments,
			priority,
			scheduleAt,
			trackOpens,
			trackClicks,
			attempts: 0,
			createdAt: new Date().toISOString(),
			status: "queued",
		};

		// Add to queue
		this.addToQueue(emailJob);

		return {
			emailId: emailJob.id,
			status: "queued",
			scheduledFor: scheduleAt,
		};
	}

	/**
	 * Send immediate email (bypass queue)
	 */
	async sendImmediateEmail(emailData) {
		const {
			to,
			subject,
			template,
			data = {},
			attachments = [],
			trackOpens = false,
			trackClicks = false,
		} = emailData;

		try {
			const templateData = this.templates.get(template);
			if (!templateData) {
				throw new Error(`Template '${template}' not found`);
			}

			// Render template
			const htmlContent = this.renderTemplate(templateData.html, data);
			const textContent = this.renderTemplate(templateData.text, data);
			const renderedSubject =
				subject || this.renderTemplate(templateData.subject, data);

			// Add tracking pixels if enabled
			let finalHtmlContent = htmlContent;
			if (trackOpens) {
				const trackingPixel = `<img src="${
					config.baseUrl
				}/api/email/track/open/${this.generateTrackingId()}" width="1" height="1" style="display:none;" />`;
				finalHtmlContent += trackingPixel;
			}

			if (trackClicks) {
				finalHtmlContent = this.addClickTracking(finalHtmlContent, data.userId);
			}

			const mailOptions = {
				from: `"BharatIntern" <${
					config.email.from || "noreply@bharatintern.com"
				}>`,
				to,
				subject: renderedSubject,
				html: finalHtmlContent,
				text: textContent,
				attachments,
				headers: {
					"X-Mailer": "BharatIntern-Platform-v1.0",
					"X-Priority": "3",
				},
			};

			const result = await this.transporter.sendMail(mailOptions);

			this.emailStats.sent++;

			return {
				success: true,
				messageId: result.messageId,
				response: result.response,
			};
		} catch (error) {
			this.emailStats.failed++;
			console.error("Email sending failed:", error);
			throw error;
		}
	}

	/**
	 * Send bulk emails
	 */
	async sendBulkEmails(recipients, emailTemplate, commonData = {}) {
		const bulkJob = {
			id: this.generateEmailId(),
			type: "bulk",
			recipients,
			template: emailTemplate.template,
			commonData: { ...commonData, ...emailTemplate.data },
			subject: emailTemplate.subject,
			priority: emailTemplate.priority || "normal",
			batchSize: emailTemplate.batchSize || 50,
			createdAt: new Date().toISOString(),
			status: "queued",
		};

		this.addToQueue(bulkJob);

		return {
			bulkJobId: bulkJob.id,
			totalRecipients: recipients.length,
			status: "queued",
		};
	}

	/**
	 * Process email queue
	 */
	async processEmailQueue() {
		if (this.isProcessing || this.emailQueue.length === 0) {
			return;
		}

		this.isProcessing = true;

		while (this.emailQueue.length > 0) {
			const emailJob = this.emailQueue.shift();

			try {
				if (emailJob.type === "bulk") {
					await this.processBulkEmail(emailJob);
				} else {
					await this.processSingleEmail(emailJob);
				}
			} catch (error) {
				console.error("Error processing email job:", error);
				await this.handleFailedEmail(emailJob, error);
			}

			// Rate limiting - delay between emails
			await this.delay(100); // 100ms delay
		}

		this.isProcessing = false;
	}

	/**
	 * Process single email from queue
	 */
	async processSingleEmail(emailJob) {
		// Check if scheduled email
		if (emailJob.scheduleAt && new Date(emailJob.scheduleAt) > new Date()) {
			// Re-queue for later
			this.addToQueue(emailJob);
			return;
		}

		try {
			await this.sendImmediateEmail({
				to: emailJob.to,
				subject: emailJob.subject,
				template: emailJob.template,
				data: emailJob.data,
				attachments: emailJob.attachments,
				trackOpens: emailJob.trackOpens,
				trackClicks: emailJob.trackClicks,
			});

			emailJob.status = "sent";
			emailJob.sentAt = new Date().toISOString();
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Process bulk email job
	 */
	async processBulkEmail(bulkJob) {
		const { recipients, template, commonData, subject, batchSize } = bulkJob;
		const results = [];

		// Process in batches
		for (let i = 0; i < recipients.length; i += batchSize) {
			const batch = recipients.slice(i, i + batchSize);

			const batchPromises = batch.map(async (recipient) => {
				try {
					await this.sendImmediateEmail({
						to: recipient.email,
						subject,
						template,
						data: { ...commonData, ...recipient },
					});
					return { email: recipient.email, status: "sent" };
				} catch (error) {
					return {
						email: recipient.email,
						status: "failed",
						error: error.message,
					};
				}
			});

			const batchResults = await Promise.all(batchPromises);
			results.push(...batchResults);

			// Delay between batches
			if (i + batchSize < recipients.length) {
				await this.delay(2000); // 2 second delay between batches
			}
		}

		bulkJob.status = "completed";
		bulkJob.completedAt = new Date().toISOString();
		bulkJob.results = results;

		return results;
	}

	/**
	 * Handle failed email with retry logic
	 */
	async handleFailedEmail(emailJob, error) {
		emailJob.attempts++;
		emailJob.lastError = error.message;

		if (emailJob.attempts < this.retryAttempts) {
			// Retry with exponential backoff
			setTimeout(() => {
				this.addToQueue(emailJob);
			}, this.retryDelay * Math.pow(2, emailJob.attempts - 1));
		} else {
			emailJob.status = "failed";
			emailJob.failedAt = new Date().toISOString();
			console.error(`Email job ${emailJob.id} failed permanently:`, error);
		}
	}

	/**
	 * Add email to queue with priority handling
	 */
	addToQueue(emailJob) {
		if (emailJob.priority === "high") {
			this.emailQueue.unshift(emailJob);
		} else {
			this.emailQueue.push(emailJob);
		}
	}

	/**
	 * Start queue processor
	 */
	startQueueProcessor() {
		// Process queue every 5 seconds
		setInterval(() => {
			this.processEmailQueue();
		}, 5000);
	}

	/**
	 * Get email statistics
	 */
	getEmailStats() {
		return {
			...this.emailStats,
			queueLength: this.emailQueue.length,
			queueStatus: this.isProcessing ? "processing" : "idle",
		};
	}

	/**
	 * Template rendering methods
	 */
	renderTemplate(template, data) {
		let rendered = template;

		// Replace variables
		Object.entries(data).forEach(([key, value]) => {
			const regex = new RegExp(`{{${key}}}`, "g");
			rendered = rendered.replace(regex, value || "");
		});

		// Handle conditionals
		rendered = rendered.replace(
			/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g,
			(match, condition, content) => {
				return data[condition] ? content : "";
			}
		);

		// Handle loops (simplified)
		rendered = rendered.replace(
			/{{#each\s+(\w+)}}([\s\S]*?){{\/each}}/g,
			(match, arrayName, content) => {
				const array = data[arrayName];
				if (Array.isArray(array)) {
					return array
						.map((item) => {
							let itemContent = content;
							Object.entries(item).forEach(([key, value]) => {
								const regex = new RegExp(`{{${key}}}`, "g");
								itemContent = itemContent.replace(regex, value || "");
							});
							return itemContent;
						})
						.join("");
				}
				return "";
			}
		);

		return rendered;
	}

	/**
	 * Email template methods
	 */
	getWelcomeCandidateTemplate() {
		return `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BharatIntern!</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Your AI-powered career journey starts now</p>
        </div>
        
        <div style="padding: 40px 20px; background-color: white;">
          <h2 style="color: #1a202c; margin-top: 0;">Hi {{name}},</h2>
          
          <p style="color: #4a5568; line-height: 1.6;">
            Welcome to BharatIntern, where AI meets opportunity! We're excited to help you discover your perfect career match.
          </p>
          
          <div style="background-color: #edf2f7; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="color: #2d3748; margin-top: 0;">🚀 What You Can Do:</h3>
            <ul style="color: #4a5568; padding-left: 20px;">
              <li>Get AI-powered resume analysis and suggestions</li>
              <li>Discover jobs that match your skills perfectly</li>
              <li>Take skill assessments to showcase your abilities</li>
              <li>Practice with our AI interview simulator</li>
              <li>Track your coding profile across platforms</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{dashboardUrl}}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
              Explore Your Dashboard
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 40px;">
            <p style="color: #718096; font-size: 14px; margin: 0;">
              Need help? Reply to this email or contact us at <a href="mailto:{{supportEmail}}" style="color: #667eea;">{{supportEmail}}</a>
            </p>
          </div>
        </div>
        
        <div style="padding: 20px; text-align: center; background-color: #1a202c;">
          <p style="color: #a0aec0; margin: 0; font-size: 14px;">
            © 2024 BharatIntern. Empowering careers with AI.
          </p>
        </div>
      </div>
    `;
	}

	getWelcomeCompanyTemplate() {
		return `
      <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to BharatIntern!</h1>
          <p style="color: #e2e8f0; margin: 10px 0 0 0; font-size: 16px;">Transform your hiring with AI</p>
        </div>
        
        <div style="padding: 40px 20px; background-color: white;">
          <h2 style="color: #1a202c; margin-top: 0;">Hello {{companyName}},</h2>
          
          <p style="color: #4a5568; line-height: 1.6;">
            Welcome to BharatIntern! We're thrilled to help you discover exceptional talent through our AI-powered recruitment platform.
          </p>
          
          <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #48bb78;">
            <h3 style="color: #2d3748; margin-top: 0;">🎯 AI-Powered Features:</h3>
            <ul style="color: #4a5568; padding-left: 20px;">
              <li>Smart candidate matching based on skills and culture fit</li>
              <li>Automated resume screening and ranking</li>
              <li>Customizable skill assessments and coding challenges</li>
              <li>AI-driven interview analysis and insights</li>
              <li>Real-time candidate performance analytics</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 40px 0;">
            <a href="{{dashboardUrl}}" style="background: linear-gradient(135deg, #48bb78 0%, #38a169 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
              Start Hiring Smarter
            </a>
          </div>
        </div>
      </div>
    `;
	}

	getJobMatchTemplate() {
		return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎯 Perfect Match Found!</h1>
          <div style="color: #bee3f8; font-size: 18px; margin-top: 10px;">{{matchScore}}% Match</div>
        </div>
        
        <div style="padding: 30px 20px; background-color: white;">
          <h2 style="color: #2d3748; margin-top: 0;">Hi {{candidateName}},</h2>
          
          <p style="color: #4a5568;">Our AI has found an exceptional opportunity that aligns perfectly with your skills and career goals!</p>
          
          <div style="background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%); padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h3 style="color: #1a202c; margin-top: 0; font-size: 22px;">{{jobTitle}}</h3>
            <p style="color: #2d3748; font-size: 16px; margin: 5px 0;"><strong>{{companyName}}</strong></p>
            <div style="display: flex; align-items: center; margin: 15px 0;">
              <div style="background-color: #48bb78; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 600;">
                {{matchScore}}% Match
              </div>
            </div>
            <p style="color: #4a5568; margin: 15px 0 0 0;">
              <strong>Application Deadline:</strong> {{applicationDeadline}}
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{jobUrl}}" style="background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block;">
              View Job & Apply
            </a>
          </div>
        </div>
      </div>
    `;
	}

	getInterviewScheduledTemplate() {
		return `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background: linear-gradient(135deg, #805ad5 0%, #6b46c1 100%); padding: 30px 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">📅 Interview Scheduled!</h1>
        </div>
        
        <div style="padding: 30px 20px; background-color: white;">
          <h2 style="color: #2d3748;">Hi {{candidateName}},</h2>
          
          <p style="color: #4a5568;">Great news! Your interview has been scheduled for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>.</p>
          
          <div style="background-color: #faf5ff; border: 2px solid #d6bcfa; padding: 25px; border-radius: 12px; margin: 25px 0;">
            <h3 style="color: #553c9a; margin-top: 0;">Interview Details</h3>
            <p><strong>Position:</strong> {{jobTitle}}</p>
            <p><strong>Company:</strong> {{companyName}}</p>
            <p><strong>Date & Time:</strong> {{interviewDate}}</p>
            <p><strong>Type:</strong> {{interviewType}}</p>
            <p><strong>Duration:</strong> {{duration}}</p>
            {{#if interviewLink}}<p><strong>Link:</strong> <a href="{{interviewLink}}">Join Interview</a></p>{{/if}}
          </div>
          
          <div style="background-color: #fff5f5; border-left: 4px solid #fc8181; padding: 15px; margin: 20px 0;">
            <h4 style="color: #c53030; margin-top: 0;">💡 Preparation Tips:</h4>
            <ul style="color: #4a5568;">
              <li>Review your resume and the job description</li>
              <li>Research the company and its culture</li>
              <li>Prepare questions about the role and team</li>
              <li>Test your internet connection and audio/video</li>
            </ul>
          </div>
        </div>
      </div>
    `;
	}

	// Additional template methods would go here...
	getApplicationReceivedTemplate() {
		return `<div style="padding: 20px;"><h2>Application Received</h2><p>Your application for {{jobTitle}} has been received and is under review.</p></div>`;
	}

	getAssessmentInvitationTemplate() {
		return `<div style="padding: 20px;"><h2>Assessment Invitation</h2><p>You have been invited to take the {{assessmentTitle}} assessment.</p></div>`;
	}

	getAssessmentResultsTemplate() {
		return `<div style="padding: 20px;"><h2>Assessment Results</h2><p>Your assessment results for {{assessmentTitle}} are now available. Score: {{score}}%</p></div>`;
	}

	getApplicationStatusTemplate() {
		return `<div style="padding: 20px;"><h2>Application Update</h2><p>Your application status for {{jobTitle}} has been updated to: {{status}}</p></div>`;
	}

	getInterviewReminderTemplate() {
		return `<div style="padding: 20px;"><h2>Interview Reminder</h2><p>Reminder: Your interview is scheduled for tomorrow at {{interviewTime}}</p></div>`;
	}

	getPasswordResetTemplate() {
		return `<div style="padding: 20px;"><h2>Password Reset</h2><p>Click <a href="{{resetLink}}">here</a> to reset your password.</p></div>`;
	}

	getAccountVerificationTemplate() {
		return `<div style="padding: 20px;"><h2>Verify Account</h2><p>Please <a href="{{verificationLink}}">verify your account</a>.</p></div>`;
	}

	getWeeklySummaryTemplate() {
		return `<div style="padding: 20px;"><h2>Weekly Summary</h2><p>Your weekly activity summary from {{weekStartDate}} to {{weekEndDate}} is available.</p></div>`;
	}

	/**
	 * Utility methods
	 */
	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	generateEmailId() {
		return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	generateTrackingId() {
		return `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	addClickTracking(html, userId) {
		// Simple click tracking implementation
		return html.replace(
			/<a\s+href="([^"]+)"([^>]*)>/gi,
			`<a href="${config.baseUrl}/api/email/track/click?url=$1&user=${userId}"$2>`
		);
	}

	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
}

module.exports = EmailService;
