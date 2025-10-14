/**
 * Notification Service for BharatIntern AI Platform
 * Handles email notifications, in-app notifications, and push notifications
 */

const nodemailer = require("nodemailer");
const config = require("../config");

class NotificationService {
	constructor() {
		this.emailTransporter = this.initializeEmailTransporter();
		this.notifications = new Map(); // In-memory storage (use database in production)
		this.templates = this.initializeEmailTemplates();
		this.pushSubscriptions = new Map();
	}

	/**
	 * Initialize email transporter
	 */
	initializeEmailTransporter() {
		return nodemailer.createTransporter({
			host: config.email.host || "smtp.gmail.com",
			port: config.email.port || 587,
			secure: false,
			auth: {
				user: config.email.user,
				pass: config.email.password,
			},
			tls: {
				rejectUnauthorized: false,
			},
		});
	}

	/**
	 * Send email notification
	 */
	async sendEmail(emailData) {
		const {
			to,
			subject,
			template,
			data = {},
			attachments = [],
			priority = "normal",
		} = emailData;

		try {
			const templateContent = this.templates[template];
			if (!templateContent) {
				throw new Error(`Email template '${template}' not found`);
			}

			const htmlContent = this.renderTemplate(templateContent.html, data);
			const textContent = this.renderTemplate(templateContent.text, data);

			const mailOptions = {
				from: `"BharatIntern Platform" <${config.email.from}>`,
				to: to,
				subject: subject || templateContent.subject,
				html: htmlContent,
				text: textContent,
				attachments: attachments,
				priority: priority,
			};

			const result = await this.emailTransporter.sendMail(mailOptions);

			// Log email sent
			console.log(`Email sent successfully: ${result.messageId}`);

			return {
				success: true,
				messageId: result.messageId,
				response: result.response,
			};
		} catch (error) {
			console.error("Email sending failed:", error);
			throw new Error(`Email sending failed: ${error.message}`);
		}
	}

	/**
	 * Send welcome email to new user
	 */
	async sendWelcomeEmail(userData) {
		return await this.sendEmail({
			to: userData.email,
			template: "welcome",
			data: {
				name: userData.name,
				role: userData.role,
				loginUrl: `${config.baseUrl}/login`,
				supportEmail: config.email.support,
			},
		});
	}

	/**
	 * Send interview invitation
	 */
	async sendInterviewInvitation(invitationData) {
		const {
			candidateEmail,
			candidateName,
			companyName,
			interviewDate,
			interviewLink,
			jobTitle,
			interviewType,
		} = invitationData;

		return await this.sendEmail({
			to: candidateEmail,
			template: "interview_invitation",
			data: {
				candidateName,
				companyName,
				interviewDate: new Date(interviewDate).toLocaleString(),
				interviewLink,
				jobTitle,
				interviewType,
				supportEmail: config.email.support,
			},
		});
	}

	/**
	 * Send job match notification
	 */
	async sendJobMatchNotification(matchData) {
		const {
			candidateEmail,
			candidateName,
			jobTitle,
			companyName,
			matchScore,
			jobUrl,
			applicationDeadline,
		} = matchData;

		return await this.sendEmail({
			to: candidateEmail,
			template: "job_match",
			data: {
				candidateName,
				jobTitle,
				companyName,
				matchScore,
				jobUrl: `${config.baseUrl}/jobs/${jobUrl}`,
				applicationDeadline: applicationDeadline
					? new Date(applicationDeadline).toLocaleDateString()
					: "Not specified",
				profileUrl: `${config.baseUrl}/profile`,
			},
		});
	}

	/**
	 * Send assessment completion notification
	 */
	async sendAssessmentCompletionNotification(assessmentData) {
		const {
			candidateEmail,
			candidateName,
			assessmentTitle,
			score,
			companyName,
			resultsUrl,
			feedback,
		} = assessmentData;

		return await this.sendEmail({
			to: candidateEmail,
			template: "assessment_completion",
			data: {
				candidateName,
				assessmentTitle,
				score,
				companyName,
				resultsUrl: `${config.baseUrl}/results/${resultsUrl}`,
				feedback,
				dashboardUrl: `${config.baseUrl}/dashboard`,
			},
		});
	}

	/**
	 * Send bulk notification to multiple recipients
	 */
	async sendBulkNotification(recipients, notificationData) {
		const results = [];
		const { template, subject, data, batchSize = 10 } = notificationData;

		// Process in batches to avoid overwhelming the email service
		for (let i = 0; i < recipients.length; i += batchSize) {
			const batch = recipients.slice(i, i + batchSize);
			const batchPromises = batch.map(async (recipient) => {
				try {
					const result = await this.sendEmail({
						to: recipient.email,
						subject: subject,
						template: template,
						data: { ...data, ...recipient },
					});
					return { email: recipient.email, success: true, result };
				} catch (error) {
					return {
						email: recipient.email,
						success: false,
						error: error.message,
					};
				}
			});

			const batchResults = await Promise.all(batchPromises);
			results.push(...batchResults);

			// Add delay between batches
			if (i + batchSize < recipients.length) {
				await this.delay(1000); // 1 second delay
			}
		}

		return {
			totalRecipients: recipients.length,
			successful: results.filter((r) => r.success).length,
			failed: results.filter((r) => !r.success).length,
			results: results,
		};
	}

	/**
	 * Create in-app notification
	 */
	async createInAppNotification(notificationData) {
		const {
			userId,
			type,
			title,
			message,
			data = {},
			priority = "normal",
			expiresAt = null,
		} = notificationData;

		const notification = {
			id: this.generateId("notification"),
			userId,
			type,
			title,
			message,
			data,
			priority,
			read: false,
			createdAt: new Date().toISOString(),
			expiresAt:
				expiresAt ||
				new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
		};

		this.notifications.set(notification.id, notification);

		return notification;
	}

	/**
	 * Get notifications for user
	 */
	async getUserNotifications(userId, options = {}) {
		const { unreadOnly = false, limit = 50, offset = 0, type = null } = options;

		const userNotifications = Array.from(this.notifications.values())
			.filter((notification) => {
				if (notification.userId !== userId) return false;
				if (unreadOnly && notification.read) return false;
				if (type && notification.type !== type) return false;
				if (
					notification.expiresAt &&
					new Date(notification.expiresAt) < new Date()
				)
					return false;
				return true;
			})
			.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
			.slice(offset, offset + limit);

		const unreadCount = Array.from(this.notifications.values()).filter(
			(n) => n.userId === userId && !n.read
		).length;

		return {
			notifications: userNotifications,
			unreadCount: unreadCount,
			total: userNotifications.length,
		};
	}

	/**
	 * Mark notification as read
	 */
	async markNotificationAsRead(notificationId, userId) {
		const notification = this.notifications.get(notificationId);

		if (!notification) {
			throw new Error("Notification not found");
		}

		if (notification.userId !== userId) {
			throw new Error("Access denied to this notification");
		}

		notification.read = true;
		notification.readAt = new Date().toISOString();

		this.notifications.set(notificationId, notification);

		return notification;
	}

	/**
	 * Mark all notifications as read for user
	 */
	async markAllNotificationsAsRead(userId) {
		let updatedCount = 0;

		for (const [id, notification] of this.notifications.entries()) {
			if (notification.userId === userId && !notification.read) {
				notification.read = true;
				notification.readAt = new Date().toISOString();
				this.notifications.set(id, notification);
				updatedCount++;
			}
		}

		return { updatedCount };
	}

	/**
	 * Delete notification
	 */
	async deleteNotification(notificationId, userId) {
		const notification = this.notifications.get(notificationId);

		if (!notification) {
			throw new Error("Notification not found");
		}

		if (notification.userId !== userId) {
			throw new Error("Access denied to this notification");
		}

		this.notifications.delete(notificationId);

		return { success: true };
	}

	/**
	 * Initialize email templates
	 */
	initializeEmailTemplates() {
		return {
			welcome: {
				subject: "Welcome to BharatIntern AI Platform!",
				html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #2563eb;">Welcome to BharatIntern, {{name}}!</h2>
            <p>Thank you for joining our AI-powered recruitment platform.</p>
            <p>As a <strong>{{role}}</strong>, you now have access to:</p>
            <ul>
              <li>AI-powered resume analysis</li>
              <li>Intelligent job matching</li>
              <li>Comprehensive skill assessments</li>
              <li>Interview preparation tools</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{loginUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                Get Started
              </a>
            </div>
            <p>If you have any questions, contact us at <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
            <p>Best regards,<br>The BharatIntern Team</p>
          </div>
        `,
				text: `Welcome to BharatIntern, {{name}}! Thank you for joining our platform. Login at {{loginUrl}} to get started.`,
			},

			interview_invitation: {
				subject: "Interview Invitation - {{jobTitle}} at {{companyName}}",
				html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #2563eb;">Interview Invitation</h2>
            <p>Dear {{candidateName}},</p>
            <p>We're pleased to invite you for a <strong>{{interviewType}}</strong> interview for the position of <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>.</p>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Interview Details:</h3>
              <p><strong>Position:</strong> {{jobTitle}}</p>
              <p><strong>Company:</strong> {{companyName}}</p>
              <p><strong>Date & Time:</strong> {{interviewDate}}</p>
              <p><strong>Type:</strong> {{interviewType}}</p>
              <p><strong>Interview Link:</strong> <a href="{{interviewLink}}">{{interviewLink}}</a></p>
            </div>
            
            <p>Please prepare accordingly and join the interview on time. If you have any questions, feel free to reach out.</p>
            <p>Good luck!</p>
            <p>Best regards,<br>The BharatIntern Team</p>
          </div>
        `,
				text: `Interview invitation for {{jobTitle}} at {{companyName}} on {{interviewDate}}. Join at: {{interviewLink}}`,
			},

			job_match: {
				subject: "New Job Match Found - {{matchScore}}% Match!",
				html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #2563eb;">Great News! We Found a Perfect Match</h2>
            <p>Hi {{candidateName}},</p>
            <p>Our AI has found an excellent job opportunity that matches your skills and preferences!</p>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">{{jobTitle}}</h3>
              <p><strong>Company:</strong> {{companyName}}</p>
              <p><strong>Match Score:</strong> <span style="color: #059669; font-weight: bold;">{{matchScore}}%</span></p>
              <p><strong>Application Deadline:</strong> {{applicationDeadline}}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{jobUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                View Job Details
              </a>
            </div>
            
            <p>Don't miss this opportunity! <a href="{{profileUrl}}">Update your profile</a> to get even better matches.</p>
            <p>Best of luck!</p>
            <p>The BharatIntern Team</p>
          </div>
        `,
				text: `New job match: {{jobTitle}} at {{companyName}} ({{matchScore}}% match). View at: {{jobUrl}}`,
			},

			assessment_completion: {
				subject: "Assessment Results - {{assessmentTitle}}",
				html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h2 style="color: #2563eb;">Assessment Completed!</h2>
            <p>Dear {{candidateName}},</p>
            <p>You have successfully completed the <strong>{{assessmentTitle}}</strong> assessment for <strong>{{companyName}}</strong>.</p>
            
            <div style="text-align: center; background-color: #f8fafc; padding: 30px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Your Score</h3>
              <div style="font-size: 48px; font-weight: bold; color: #059669;">{{score}}%</div>
            </div>
            
            {{#if feedback}}
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>Feedback:</h4>
              <p>{{feedback}}</p>
            </div>
            {{/if}}
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{resultsUrl}}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                View Detailed Results
              </a>
            </div>
            
            <p>Keep up the great work! Visit your <a href="{{dashboardUrl}}">dashboard</a> to track your progress.</p>
            <p>Best regards,<br>The BharatIntern Team</p>
          </div>
        `,
				text: `Assessment completed: {{assessmentTitle}}. Score: {{score}}%. View results: {{resultsUrl}}`,
			},
		};
	}

	/**
	 * Render email template with data
	 */
	renderTemplate(template, data) {
		let rendered = template;

		// Simple template rendering (in production, use a proper template engine)
		Object.entries(data).forEach(([key, value]) => {
			const regex = new RegExp(`{{${key}}}`, "g");
			rendered = rendered.replace(regex, value || "");
		});

		// Handle conditional blocks (simplified)
		rendered = rendered.replace(
			/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g,
			(match, condition, content) => {
				return data[condition] ? content : "";
			}
		);

		return rendered;
	}

	/**
	 * Send push notification (mock implementation)
	 */
	async sendPushNotification(pushData) {
		const {
			userId,
			title,
			body,
			data = {},
			icon = "/icon-192x192.png",
			badge = "/badge-72x72.png",
		} = pushData;

		// In production, integrate with actual push service (FCM, etc.)
		console.log(`Push notification sent to user ${userId}: ${title}`);

		return {
			success: true,
			messageId: this.generateId("push"),
			deliveredAt: new Date().toISOString(),
		};
	}

	/**
	 * Schedule notification for later delivery
	 */
	async scheduleNotification(scheduleData) {
		const { userId, type, deliverAt, notificationData } = scheduleData;

		const scheduledNotification = {
			id: this.generateId("scheduled"),
			userId,
			type,
			deliverAt,
			notificationData,
			status: "scheduled",
			createdAt: new Date().toISOString(),
		};

		// In production, use a job queue like Redis/Bull
		setTimeout(async () => {
			try {
				if (type === "email") {
					await this.sendEmail(notificationData);
				} else if (type === "in-app") {
					await this.createInAppNotification(notificationData);
				} else if (type === "push") {
					await this.sendPushNotification(notificationData);
				}

				scheduledNotification.status = "delivered";
				scheduledNotification.deliveredAt = new Date().toISOString();
			} catch (error) {
				scheduledNotification.status = "failed";
				scheduledNotification.error = error.message;
			}
		}, new Date(deliverAt) - new Date());

		return scheduledNotification;
	}

	/**
	 * Get notification statistics
	 */
	async getNotificationStats(userId = null, timeframe = "30d") {
		const startDate = new Date();
		startDate.setDate(
			startDate.getDate() - parseInt(timeframe.replace("d", ""))
		);

		const notifications = Array.from(this.notifications.values()).filter(
			(n) => {
				if (userId && n.userId !== userId) return false;
				return new Date(n.createdAt) >= startDate;
			}
		);

		const stats = {
			total: notifications.length,
			unread: notifications.filter((n) => !n.read).length,
			byType: {},
			byPriority: {},
			readRate: 0,
		};

		notifications.forEach((n) => {
			stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
			stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
		});

		const readNotifications = notifications.filter((n) => n.read).length;
		stats.readRate =
			notifications.length > 0
				? Math.round((readNotifications / notifications.length) * 100)
				: 0;

		return stats;
	}

	/**
	 * Utility methods
	 */
	generateId(prefix = "notif") {
		return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	delay(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	/**
	 * Cleanup expired notifications
	 */
	async cleanupExpiredNotifications() {
		const now = new Date();
		let deletedCount = 0;

		for (const [id, notification] of this.notifications.entries()) {
			if (notification.expiresAt && new Date(notification.expiresAt) < now) {
				this.notifications.delete(id);
				deletedCount++;
			}
		}

		return { deletedCount };
	}
}

module.exports = NotificationService;
