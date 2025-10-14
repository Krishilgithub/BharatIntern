import React from "react";
import {
	Target,
	BarChart3,
	Zap,
	Shield,
	Users,
	Building2,
	Award,
	CheckCircle,
} from "lucide-react";

const About = () => {
	const features = [
		{
			icon: <Target className="w-8 h-8 text-primary" />,
			title: "AI-Powered Matching",
			description:
				"Our advanced machine learning algorithms analyze candidate profiles, skills, and preferences to match them with the most suitable internship opportunities.",
		},
		{
			icon: <BarChart3 className="w-8 h-8 text-primary" />,
			title: "Quota Management",
			description:
				"Intelligent quota enforcement ensures fair distribution across demographics while maintaining quality standards and meeting policy requirements.",
		},
		{
			icon: <Zap className="w-8 h-8 text-primary" />,
			title: "Resume Analysis",
			description:
				"Automated resume parsing extracts skills, qualifications, and experience to provide personalized recommendations and improvement suggestions.",
		},
		{
			icon: <Shield className="w-8 h-8 text-primary" />,
			title: "Secure Platform",
			description:
				"Enterprise-grade security with comprehensive audit trails, data protection measures, and compliance with government standards.",
		},
	];

	const benefits = [
		{
			role: "Candidates",
			icon: <Users className="w-6 h-6 text-accent" />,
			items: [
				"Personalized internship recommendations",
				"Resume analysis and skill gap identification",
				"Application tracking and status updates",
				"Learning roadmap and skill development",
				"Micro-assessments for skill validation",
			],
		},
		{
			role: "Companies",
			icon: <Building2 className="w-6 h-6 text-accent" />,
			items: [
				"Automated candidate shortlisting",
				"Detailed candidate analytics and insights",
				"Streamlined selection workflow",
				"Quota compliance monitoring",
				"Performance tracking and reporting",
			],
		},
		{
			role: "Administrators",
			icon: <Award className="w-6 h-6 text-accent" />,
			items: [
				"Real-time quota monitoring and management",
				"What-if scenario simulations",
				"Batch matching and allocation tools",
				"Comprehensive analytics dashboard",
				"Manual override and audit capabilities",
			],
		},
	];

	const stats = [
		{
			number: "95%",
			label: "Match Accuracy",
			description:
				"Our AI achieves 95% accuracy in matching candidates with suitable internships",
		},
		{
			number: "10,000+",
			label: "Active Users",
			description:
				"Over 10,000 candidates and companies actively using our platform",
		},
		{
			number: "500+",
			label: "Partner Companies",
			description:
				"Trusted by 500+ leading companies across various industries",
		},
		{
			number: "50+",
			label: "Industries",
			description:
				"Covering 50+ industries and sectors for diverse opportunities",
		},
	];

	return (
		<div className="min-h-screen bg-white">
			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary to-orange-600 text-white py-20">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center">
						<h1 className="text-4xl md:text-5xl font-bold mb-6">
							About BharatIntern
						</h1>
						<p className="text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto">
							Revolutionizing internship allocation through AI-driven matching,
							intelligent quota management, and seamless user experiences.
						</p>
					</div>
				</div>
			</section>

			{/* Mission Section */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
							Our Mission
						</h2>
						<p className="text-xl text-gray-600 max-w-4xl mx-auto">
							To democratize access to quality internship opportunities by
							leveraging artificial intelligence and data-driven insights,
							ensuring fair and efficient allocation while maintaining the
							highest standards of transparency and accountability.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-12 items-center">
						<div>
							<h3 className="text-2xl font-bold text-gray-900 mb-6">
								Problem Statement (SIH25034)
							</h3>
							<p className="text-gray-600 mb-6">
								The PM Internship Scheme requires an intelligent system to match
								candidates with internships based on skills, qualifications,
								location preferences, and sector interests while enforcing
								affirmative action quotas, past participation limits, and
								industry capacity constraints.
							</p>
							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
									<div>
										<h4 className="font-semibold text-gray-900">
											Skills-Based Matching
										</h4>
										<p className="text-gray-600">
											AI analyzes candidate skills and matches with relevant
											opportunities
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
									<div>
										<h4 className="font-semibold text-gray-900">
											Quota Enforcement
										</h4>
										<p className="text-gray-600">
											Automated compliance with affirmative action and diversity
											requirements
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
									<div>
										<h4 className="font-semibold text-gray-900">
											Capacity Management
										</h4>
										<p className="text-gray-600">
											Intelligent allocation considering industry capacity and
											past participation
										</p>
									</div>
								</div>
							</div>
						</div>
						<div className="bg-white rounded-xl shadow-lg p-8">
							<h4 className="text-xl font-bold text-gray-900 mb-4">
								Key Features
							</h4>
							<ul className="space-y-3">
								<li className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									<span className="text-gray-700">
										Resume Analyzer with AI-powered skill extraction
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									<span className="text-gray-700">
										Admin quota simulator and policy configurator
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									<span className="text-gray-700">
										Company dashboards for posting management
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									<span className="text-gray-700">
										Real-time matching and allocation engine
									</span>
								</li>
								<li className="flex items-center space-x-3">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									<span className="text-gray-700">
										Comprehensive analytics and reporting
									</span>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							How It Works
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Our platform leverages cutting-edge technology to deliver
							intelligent matching
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<div key={index} className="card text-center">
								<div className="flex justify-center mb-4">{feature.icon}</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Benefits Section */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Benefits for Everyone
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Our platform delivers value to all stakeholders in the internship
							ecosystem
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{benefits.map((benefit, index) => (
							<div key={index} className="card">
								<div className="flex items-center mb-4">
									<div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mr-4">
										{benefit.icon}
									</div>
									<h3 className="text-xl font-semibold text-gray-900">
										{benefit.role}
									</h3>
								</div>
								<ul className="space-y-3">
									{benefit.items.map((item, itemIndex) => (
										<li key={itemIndex} className="flex items-start space-x-3">
											<CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
											<span className="text-gray-700">{item}</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Platform Impact
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Measurable results that demonstrate our platform's effectiveness
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{stats.map((stat, index) => (
							<div key={index} className="text-center">
								<div className="text-4xl md:text-5xl font-bold text-primary mb-2">
									{stat.number}
								</div>
								<div className="text-lg font-semibold text-gray-900 mb-2">
									{stat.label}
								</div>
								<div className="text-gray-600">{stat.description}</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-primary text-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<h2 className="text-3xl md:text-4xl font-bold mb-6">
						Ready to Transform Internship Matching?
					</h2>
					<p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
						Join thousands of candidates and companies already using our
						platform
					</p>
					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<a
							href="/signup"
							className="btn-accent text-lg px-8 py-4 inline-block"
						>
							Get Started Today
						</a>
						<a
							href="/contact"
							className="btn-secondary text-lg px-8 py-4 inline-block bg-white/20 text-white hover:bg-white/30"
						>
							Contact Our Team
						</a>
					</div>
				</div>
			</section>
		</div>
	);
};

export default About;
