import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

const Contact = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		message: "",
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		// Simulate form submission
		setTimeout(() => {
			toast.success("Message sent successfully! We'll get back to you soon.");
			setFormData({ name: "", email: "", subject: "", message: "" });
			setLoading(false);
		}, 1000);
	};

	const contactInfo = [
		{
			icon: <Mail className="w-6 h-6 text-primary" />,
			title: "Email Us",
			details: "support@pminternship.gov.in",
			description: "Send us an email and we'll respond within 24 hours",
		},
		{
			icon: <Phone className="w-6 h-6 text-primary" />,
			title: "Call Us",
			details: "+91 11 2345 6789",
			description: "Monday to Friday, 9:00 AM to 6:00 PM IST",
		},
		{
			icon: <MapPin className="w-6 h-6 text-primary" />,
			title: "Visit Us",
			details: "New Delhi, India",
			description: "Ministry of Education, Government of India",
		},
	];

	const faqs = [
		{
			question: "How does the AI matching algorithm work?",
			answer:
				"Our AI analyzes candidate profiles, skills, preferences, and company requirements to find the best matches. It considers factors like skill compatibility, location preferences, and quota requirements.",
		},
		{
			question: "Is the platform free to use?",
			answer:
				"Yes, the PM Internship Portal is completely free for all candidates, companies, and educational institutions participating in the PM Internship Scheme.",
		},
		{
			question: "How do I reset my password?",
			answer:
				"Click on 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email to reset your password.",
		},
		{
			question: "Can companies post multiple internship opportunities?",
			answer:
				"Yes, companies can post unlimited internship opportunities. Each posting can be customized with specific requirements, duration, and other details.",
		},
		{
			question: "How are quotas enforced in the system?",
			answer:
				"The system automatically enforces affirmative action quotas and diversity requirements during the matching process. Administrators can configure and monitor quota compliance in real-time.",
		},
		{
			question: "What data is required for resume analysis?",
			answer:
				"Our resume analyzer extracts skills, education, experience, and other relevant information from uploaded resumes. We only collect data necessary for matching and improving recommendations.",
		},
	];

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary to-orange-600 text-white py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
						<p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
							Have questions? We're here to help. Get in touch with our support
							team.
						</p>
					</div>
				</div>
			</section>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
				<div className="grid lg:grid-cols-3 gap-12">
					{/* Contact Form */}
					<div className="lg:col-span-2">
						<div className="card">
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								Send us a message
							</h2>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="grid md:grid-cols-2 gap-6">
									<div>
										<label
											htmlFor="name"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Full Name
										</label>
										<input
											type="text"
											id="name"
											name="name"
											required
											value={formData.name}
											onChange={handleChange}
											className="input-field"
											placeholder="Enter your full name"
										/>
									</div>
									<div>
										<label
											htmlFor="email"
											className="block text-sm font-medium text-gray-700 mb-2"
										>
											Email Address
										</label>
										<input
											type="email"
											id="email"
											name="email"
											required
											value={formData.email}
											onChange={handleChange}
											className="input-field"
											placeholder="Enter your email"
										/>
									</div>
								</div>

								<div>
									<label
										htmlFor="subject"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Subject
									</label>
									<input
										type="text"
										id="subject"
										name="subject"
										required
										value={formData.subject}
										onChange={handleChange}
										className="input-field"
										placeholder="What's this about?"
									/>
								</div>

								<div>
									<label
										htmlFor="message"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Message
									</label>
									<textarea
										id="message"
										name="message"
										rows={6}
										required
										value={formData.message}
										onChange={handleChange}
										className="input-field resize-none"
										placeholder="Tell us how we can help you..."
									/>
								</div>

								<button
									type="submit"
									disabled={loading}
									className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
								>
									{loading ? (
										<div className="flex items-center justify-center">
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
											Sending...
										</div>
									) : (
										<div className="flex items-center justify-center">
											<Send className="w-5 h-5 mr-2" />
											Send Message
										</div>
									)}
								</button>
							</form>
						</div>
					</div>

					{/* Contact Information */}
					<div className="space-y-8">
						<div>
							<h2 className="text-2xl font-bold text-gray-900 mb-6">
								Get in touch
							</h2>
							<div className="space-y-6">
								{contactInfo.map((info, index) => (
									<div key={index} className="flex items-start space-x-4">
										<div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
											{info.icon}
										</div>
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-1">
												{info.title}
											</h3>
											<p className="text-primary font-medium mb-1">
												{info.details}
											</p>
											<p className="text-gray-600 text-sm">
												{info.description}
											</p>
										</div>
									</div>
								))}
							</div>
						</div>

						{/* Support Hours */}
						<div className="card">
							<div className="flex items-center space-x-3 mb-4">
								<Clock className="w-6 h-6 text-accent" />
								<h3 className="text-lg font-semibold text-gray-900">
									Support Hours
								</h3>
							</div>
							<div className="space-y-2 text-gray-600">
								<p>
									<strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM IST
								</p>
								<p>
									<strong>Saturday:</strong> 10:00 AM - 4:00 PM IST
								</p>
								<p>
									<strong>Sunday:</strong> Closed
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* FAQ Section */}
				<div className="mt-20">
					<div className="text-center mb-12">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">
							Frequently Asked Questions
						</h2>
						<p className="text-xl text-gray-600">
							Find answers to common questions about our platform
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-8">
						{faqs.map((faq, index) => (
							<div key={index} className="card">
								<h3 className="text-lg font-semibold text-gray-900 mb-3">
									{faq.question}
								</h3>
								<p className="text-gray-600">{faq.answer}</p>
							</div>
						))}
					</div>
				</div>

				{/* Additional Help */}
				<div className="mt-16 text-center">
					<div className="card max-w-2xl mx-auto">
						<MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
						<h3 className="text-xl font-semibold text-gray-900 mb-4">
							Still need help?
						</h3>
						<p className="text-gray-600 mb-6">
							Can't find what you're looking for? Our support team is here to
							help you with any questions or issues.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<a
								href="mailto:support@pminternship.gov.in"
								className="btn-primary"
							>
								Email Support
							</a>
							<a href="tel:+911123456789" className="btn-secondary">
								Call Support
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Contact;
