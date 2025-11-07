import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { useAuth } from "../contexts/AuthContext";
import {
	ArrowRight,
	Users,
	Building2,
	BarChart3,
	Target,
	Zap,
	Shield,
	Award,
	GraduationCap,
	Briefcase,
	Globe,
	Smartphone,
	Download,
	RefreshCw,
	Megaphone,
	Languages,
	UserCheck,
	Building,
	School,
	Settings,
	CheckCircle,
	TrendingUp,
	MapPin,
	Calendar,
	Star,
	Sparkles,
	Info,
	Mail,
	Phone,
} from "lucide-react";

// Move languages and translations outside component to avoid circular dependency
const languages = [
	{ code: "en", name: "English", flag: "🇺🇸" },
	{ code: "hi", name: "हिंदी", flag: "🇮🇳" },
	{ code: "bn", name: "বাংলা", flag: "🇧🇩" },
	{ code: "te", name: "తెలుగు", flag: "🇮🇳" },
	{ code: "mr", name: "मराठी", flag: "🇮🇳" },
	{ code: "ta", name: "தமிழ்", flag: "🇮🇳" },
	{ code: "gu", name: "ગુજરાતી", flag: "🇮🇳" },
	{ code: "kn", name: "ಕನ್ನಡ", flag: "🇮🇳" },
];

// Translation object - moved outside to prevent circular dependency
const translations = {
	en: {
		heroTitle: "AI-Driven Internship",
		heroSubtitle: "Recommendation Engine",
		heroDescription:
			"Empowering the PM Internship Scheme with intelligent matching, quota management, and seamless allocation processes.",
		aboutTitle: "About BharatIntern",
		aboutDescription:
			"Revolutionizing internship allocation through AI-driven matching, intelligent quota management, and seamless user experiences for the PM Internship Scheme.",
		contactTitle: "Contact Us",
		contactDescription:
			"Have questions? We're here to help. Get in touch with our support team.",
		mission: "Our Mission",
		missionText:
			"To democratize access to quality internship opportunities by leveraging artificial intelligence and data-driven insights, ensuring fair and efficient allocation while maintaining the highest standards of transparency and accountability.",
		features: {
			aiMatching: "AI-Powered Matching",
			aiMatchingDesc:
				"Advanced algorithms analyze skills and preferences for optimal matches",
			quotaEnforcement: "Quota Enforcement",
			quotaEnforcementDesc:
				"Automated compliance with affirmative action and diversity requirements",
			securePlatform: "Secure Platform",
			securePlatformDesc:
				"Enterprise-grade security with comprehensive audit trails and data protection",
		},
		contact: {
			emailUs: "Email Us",
			emailDesc: "Send us an email and we'll respond within 24 hours",
			callUs: "Call Us",
			callDesc: "Monday to Friday, 9:00 AM to 6:00 PM IST",
			visitUs: "Visit Us",
			visitDesc: "Ministry of Education, Government of India",
			sendMessage: "Send us a message",
			yourName: "Your Name",
			yourEmail: "Your Email",
			subject: "Subject",
			yourMessage: "Your Message",
			sendMsg: "Send Message",
		},
		buttons: {
			getStarted: "Get Started Now",
			learnMore: "Learn More",
		},
	},
	hi: {
		heroTitle: "एआई-संचालित इंटर्नशिप",
		heroSubtitle: "सिफारिश इंजन",
		heroDescription:
			"बुद्धिमान मैचिंग, कोटा प्रबंधन और निर्बाध आवंटन प्रक्रियाओं के साथ पीएम इंटर्नशिप योजना को सशक्त बनाना।",
		aboutTitle: "भारत इंटर्न के बारे में",
		aboutDescription:
			"पीएम इंटर्नशिप योजना के लिए एआई-संचालित मैचिंग, बुद्धिमान कोटा प्रबंधन और निर्बाध उपयोगकर्ता अनुभवों के माध्यम से इंटर्नशिप आवंटन में क्रांति।",
		contactTitle: "हमसे संपर्क करें",
		contactDescription:
			"कोई प्रश्न है? हम यहाँ मदद के लिए हैं। हमारी सहायता टीम से संपर्क करें।",
		mission: "हमारा मिशन",
		missionText:
			"कृत्रिम बुद्धिमत्ता और डेटा-संचालित अंतर्दृष्टि का लाभ उठाकर गुणवत्तापूर्ण इंटर्नशिप अवसरों तक पहुंच को लोकतांत्रिक बनाना।",
		features: {
			aiMatching: "एआई-संचालित मैचिंग",
			aiMatchingDesc:
				"उन्नत एल्गोरिदम कौशल और प्राथमिकताओं का विश्लेषण करते हैं",
			quotaEnforcement: "कोटा प्रवर्तन",
			quotaEnforcementDesc:
				"सकारात्मक कार्रवाई और विविधता आवश्यकताओं के साथ स्वचालित अनुपालन",
			securePlatform: "सुरक्षित प्लेटफॉर्म",
			securePlatformDesc:
				"व्यापक ऑडिट ट्रेल्स और डेटा सुरक्षा के साथ एंटरप्राइज़-ग्रेड सुरक्षा",
		},
		contact: {
			emailUs: "हमें ईमेल करें",
			emailDesc: "हमें ईमेल भेजें और हम 24 घंटे के भीतर जवाब देंगे",
			callUs: "हमें कॉल करें",
			callDesc: "सोमवार से शुक्रवार, सुबह 9:00 बजे से शाम 6:00 बजे तक",
			visitUs: "हमसे मिलें",
			visitDesc: "शिक्षा मंत्रालय, भारत सरकार",
			sendMessage: "हमें संदेश भेजें",
			yourName: "आपका नाम",
			yourEmail: "आपका ईमेल",
			subject: "विषय",
			yourMessage: "आपका संदेश",
			sendMsg: "संदेश भेजें",
		},
		buttons: {
			getStarted: "अभी शुरू करें",
			learnMore: "और जानें",
		},
	},
};

// Translation helper function
const getTranslation = (currentLanguage, key) => {
	const keys = key.split(".");
	let value = translations[currentLanguage];
	for (const k of keys) {
		value = value?.[k];
	}
	return value || translations.en[key] || key;
};

const LandingPage = () => {
	const { user } = useAuth();
	const router = useRouter();
	const [dynamicStats, setDynamicStats] = useState({
		activeInternships: 1234,
		registeredCompanies: 567,
		successRate: 89,
		placedCandidates: 8901,
	});
	const [currentLanguage, setCurrentLanguage] = useState("en");
	const [announcements, setAnnouncements] = useState([]);
	const [showMobileApp, setShowMobileApp] = useState(false);

	// Redirect logged-in users to their dashboard
	useEffect(() => {
		if (user) {
			const dashboardPath =
				user.role === "candidate"
					? "/candidate/dashboard"
					: user.role === "company"
					? "/company/dashboard"
					: user.role === "admin"
					? "/admin/dashboard"
					: "/";
			router.push(dashboardPath);
		}
	}, [user, router]);

	// Don't render landing page if user is logged in
	if (user) {
		return null;
	}

	// Fetch dynamic statistics
	useEffect(() => {
		const fetchStats = async () => {
			try {
				// Fetch real-time stats from API
				const response = await fetch("/api/stats");
				if (response.ok) {
					const stats = await response.json();
					setDynamicStats(stats);
				} else {
					// Fallback to mock data if API fails
					const mockStats = {
						activeInternships: 1234,
						registeredCompanies: 567,
						successRate: 89,
						placedCandidates: 8901,
					};
					setDynamicStats(mockStats);
				}
			} catch (error) {
				console.log("Using fallback stats:", error);
				// Fallback to mock data
				const mockStats = {
					activeInternships: 1234,
					registeredCompanies: 567,
					successRate: 89,
					placedCandidates: 8901,
				};
				setDynamicStats(mockStats);
			}
		};

		// Auto-refresh stats every 30 seconds
		fetchStats();
		const statsInterval = setInterval(fetchStats, 30000);

		// Fetch announcements
		const fetchAnnouncements = async () => {
			try {
				const mockAnnouncements = [
					{
						id: 1,
						title: "New AI Features Released!",
						content:
							"Experience enhanced job matching with our latest AI algorithms.",
						date: new Date().toISOString(),
						priority: "high",
					},
					{
						id: 2,
						title: "Extended Application Deadline",
						content: "Summer internship applications extended till March 31st.",
						date: new Date().toISOString(),
						priority: "medium",
					},
				];
				setAnnouncements(mockAnnouncements);
			} catch (error) {
				console.log("Error fetching announcements:", error);
			}
		};

		fetchAnnouncements();
		const announcementInterval = setInterval(fetchAnnouncements, 60000);

		return () => {
			clearInterval(statsInterval);
			clearInterval(announcementInterval);
		};
	}, []);

	// Translation function using the helper
	const t = (key) => getTranslation(currentLanguage, key);

	const userTypes = [
		{
			type: "students",
			title: "Students",
			icon: <GraduationCap className="w-12 h-12 text-blue-600" />,
			description: "Find your perfect internship opportunity",
			features: ["AI-Powered Matching", "Skill Assessment", "Career Guidance"],
			color: "blue",
			link: "/signup?type=candidate",
		},
		{
			type: "companies",
			title: "Companies",
			icon: <Building2 className="w-12 h-12 text-green-600" />,
			description: "Discover talented interns for your organization",
			features: ["Smart Recruitment", "Bulk Hiring", "Analytics Dashboard"],
			color: "green",
			subcategories: ["MSME", "MNC", "NGO", "PSU"],
			link: "/signup?type=company",
		},
		{
			type: "institutions",
			title: "Training Partners/Institutions",
			icon: <School className="w-12 h-12 text-purple-600" />,
			description: "Partner with us to train future workforce",
			features: [
				"Curriculum Integration",
				"Progress Tracking",
				"Certification",
			],
			color: "purple",
			link: "/signup?type=institution",
		},
		{
			type: "government",
			title: "Government Administrators",
			icon: <Settings className="w-12 h-12 text-red-600" />,
			description: "Oversee and manage the internship ecosystem",
			features: ["Policy Management", "Compliance Monitoring", "Analytics"],
			color: "red",
			link: "/signup?type=admin",
		},
	];

	const features = [
		{
			icon: <Target className="w-8 h-8 text-primary" />,
			title: "AI-Powered Matching",
			description:
				"Advanced algorithms match candidates with the perfect internship based on skills, preferences, and requirements.",
		},
		{
			icon: <BarChart3 className="w-8 h-8 text-primary" />,
			title: "Quota Management",
			description:
				"Intelligent quota enforcement ensures fair distribution across demographics while maintaining quality standards.",
		},
		{
			icon: <Zap className="w-8 h-8 text-primary" />,
			title: "Resume Analysis",
			description:
				"Automated resume parsing extracts skills and suggests improvements to boost your chances of selection.",
		},
		{
			icon: <Shield className="w-8 h-8 text-primary" />,
			title: "Secure & Reliable",
			description:
				"Enterprise-grade security with comprehensive audit trails and data protection measures.",
		},
	];

	return (
		<div className="min-h-screen">
			{/* Language Toggle */}
			<div className="bg-gray-900 text-white py-2">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
					<div className="flex items-center space-x-4">
						<Globe className="w-4 h-4" />
						<select
							value={currentLanguage}
							onChange={(e) => setCurrentLanguage(e.target.value)}
							className="bg-transparent border-none text-sm focus:outline-none"
						>
							{languages.map((lang) => (
								<option
									key={lang.code}
									value={lang.code}
									className="bg-gray-900"
								>
									{lang.flag} {lang.name}
								</option>
							))}
						</select>
					</div>
					<div className="text-sm">
						🇮🇳 Proudly Supporting PM Internship Scheme
					</div>
				</div>
			</div>

			{/* Key Announcements */}
			{announcements.length > 0 && (
				<motion.div
					initial={{ y: -50, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3"
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center space-x-4">
							<Megaphone className="w-5 h-5 animate-pulse" />
							<div className="flex-1 overflow-hidden">
								<motion.div
									animate={{ x: ["100%", "-100%"] }}
									transition={{
										duration: 20,
										repeat: Infinity,
										ease: "linear",
									}}
									className="whitespace-nowrap"
								>
									{announcements.map((announcement, index) => (
										<span key={announcement.id} className="mx-8">
											<strong>{announcement.title}:</strong>{" "}
											{announcement.content}
										</span>
									))}
								</motion.div>
							</div>
							<button className="text-white/80 hover:text-white">
								<RefreshCw className="w-4 h-4" />
							</button>
						</div>
					</div>
				</motion.div>
			)}

			{/* Hero Section */}
			<section className="bg-gradient-to-br from-primary to-orange-600 text-white relative overflow-hidden">
				<div className="absolute inset-0 bg-black/20"></div>
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						className="text-center"
					>
						<motion.h1
							initial={{ scale: 0.5, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={{ duration: 1, delay: 0.2 }}
							className="text-4xl md:text-6xl font-bold mb-6"
						>
							{t("heroTitle")}
							<span className="block text-accent">{t("heroSubtitle")}</span>
						</motion.h1>
						<motion.p
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5 }}
							className="text-xl md:text-2xl mb-8 text-orange-100 max-w-3xl mx-auto"
						>
							{t("heroDescription")}
						</motion.p>

						{/* Dynamic Statistics */}
						<motion.div
							initial={{ y: 50, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.7 }}
							className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto"
						>
							<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
								<motion.div
									key={dynamicStats.activeInternships}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									className="text-2xl font-bold"
								>
									{dynamicStats.activeInternships.toLocaleString()}+
								</motion.div>
								<div className="text-sm text-orange-100">
									Active Internships
								</div>
							</div>
							<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
								<motion.div
									key={dynamicStats.registeredCompanies}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									className="text-2xl font-bold"
								>
									{dynamicStats.registeredCompanies.toLocaleString()}+
								</motion.div>
								<div className="text-sm text-orange-100">Partner Companies</div>
							</div>
							<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
								<motion.div
									key={dynamicStats.successRate}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									className="text-2xl font-bold"
								>
									{dynamicStats.successRate}%
								</motion.div>
								<div className="text-sm text-orange-100">Success Rate</div>
							</div>
							<div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
								<motion.div
									key={dynamicStats.placedCandidates}
									initial={{ scale: 1.2 }}
									animate={{ scale: 1 }}
									className="text-2xl font-bold"
								>
									{dynamicStats.placedCandidates.toLocaleString()}+
								</motion.div>
								<div className="text-sm text-orange-100">Placed Candidates</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ y: 30, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ delay: 0.9 }}
							className="flex flex-col sm:flex-row gap-4 justify-center"
						>
							<Link
								href="/signup"
								className="btn-accent text-lg px-8 py-4 inline-flex items-center justify-center transform hover:scale-105 transition-transform"
							>
								Get Started
								<ArrowRight className="ml-2 w-5 h-5" />
							</Link>
							<button
								onClick={() => setShowMobileApp(!showMobileApp)}
								className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center bg-white/20 text-white hover:bg-white/30"
							>
								<Smartphone className="mr-2 w-5 h-5" />
								Mobile App
							</button>
						</motion.div>
					</motion.div>
				</div>
			</section>

			{/* Mobile App Section */}
			{showMobileApp && (
				<motion.section
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className="bg-gray-900 text-white py-12"
				>
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid md:grid-cols-2 gap-8 items-center">
							<div>
								<h3 className="text-3xl font-bold mb-4">
									Download Our Mobile App
								</h3>
								<p className="text-gray-300 mb-6">
									Access all features on-the-go with our powerful mobile
									application. Available for Android and iOS.
								</p>
								<div className="flex space-x-4 mb-6">
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg flex items-center"
									>
										<Download className="w-5 h-5 mr-2" />
										Google Play
									</motion.button>
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg flex items-center"
									>
										<Download className="w-5 h-5 mr-2" />
										App Store
									</motion.button>
								</div>
								<div className="text-sm text-gray-400">
									<p>• Offline access to key features</p>
									<p>• Push notifications for updates</p>
									<p>• Biometric authentication</p>
									<p>• Voice search and navigation</p>
								</div>
							</div>
							<div className="flex justify-center">
								<div className="bg-white p-4 rounded-lg">
									<QRCode
										value="https://bharatintern.app/download"
										size={200}
									/>
									<p className="text-center text-gray-900 mt-2 text-sm">
										Scan to download
									</p>
								</div>
							</div>
						</div>
					</div>
				</motion.section>
			)}

			{/* User Type Selection Section */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Choose Your Role
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Select your category to get started with personalized features and
							experience
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{userTypes.map((userType, index) => (
							<motion.div
								key={userType.type}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								whileHover={{ y: -10, scale: 1.02 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border-2 border-transparent hover:border-${userType.color}-200`}
							>
								<div className="text-center mb-6">
									<motion.div
										whileHover={{ rotate: 360 }}
										transition={{ duration: 0.6 }}
										className="flex justify-center mb-4"
									>
										{userType.icon}
									</motion.div>
									<h3 className="text-xl font-bold text-gray-900 mb-2">
										{userType.title}
									</h3>
									<p className="text-gray-600 text-sm mb-4">
										{userType.description}
									</p>
								</div>

								<div className="space-y-2 mb-6">
									{userType.features.map((feature, idx) => (
										<div
											key={idx}
											className="flex items-center text-sm text-gray-700"
										>
											<CheckCircle
												className={`w-4 h-4 mr-2 text-${userType.color}-600`}
											/>
											{feature}
										</div>
									))}
								</div>

								{userType.subcategories && (
									<div className="mb-4">
										<p className="text-xs font-medium text-gray-500 mb-2">
											Categories:
										</p>
										<div className="flex flex-wrap gap-1">
											{userType.subcategories.map((sub, idx) => (
												<span
													key={idx}
													className={`px-2 py-1 bg-${userType.color}-100 text-${userType.color}-700 rounded-full text-xs`}
												>
													{sub}
												</span>
											))}
										</div>
									</div>
								)}

								<Link
									href={userType.link}
									className={`w-full bg-${userType.color}-600 hover:bg-${userType.color}-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center`}
								>
									Get Started
									<ArrowRight className="ml-2 w-4 h-4" />
								</Link>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Powerful AI Features
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Comprehensive tools powered by artificial intelligence and machine
							learning
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
						{features.map((feature, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								whileHover={{ scale: 1.05 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className="card text-center hover:shadow-xl transition-all duration-300"
							>
								<motion.div
									whileHover={{ rotate: 360 }}
									transition={{ duration: 0.6 }}
									className="flex justify-center mb-4"
								>
									{feature.icon}
								</motion.div>
								<h3 className="text-xl font-semibold text-gray-900 mb-3">
									{feature.title}
								</h3>
								<p className="text-gray-600">{feature.description}</p>
							</motion.div>
						))}
					</div>

					{/* Additional Feature Highlights */}
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mt-16 grid md:grid-cols-3 gap-8"
					>
						<div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">
							<div className="flex items-center mb-4">
								<TrendingUp className="w-8 h-8 text-blue-600 mr-3" />
								<h3 className="text-lg font-semibold text-gray-900">
									Real-time Analytics
								</h3>
							</div>
							<p className="text-gray-600">
								Monitor application trends, success rates, and candidate
								performance with live dashboards.
							</p>
						</div>
						<div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
							<div className="flex items-center mb-4">
								<MapPin className="w-8 h-8 text-green-600 mr-3" />
								<h3 className="text-lg font-semibold text-gray-900">
									Location-based Matching
								</h3>
							</div>
							<p className="text-gray-600">
								Smart geographic matching considering location preferences and
								regional opportunities.
							</p>
						</div>
						<div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6">
							<div className="flex items-center mb-4">
								<Calendar className="w-8 h-8 text-purple-600 mr-3" />
								<h3 className="text-lg font-semibold text-gray-900">
									Automated Scheduling
								</h3>
							</div>
							<p className="text-gray-600">
								AI-powered interview scheduling with calendar integration and
								timezone handling.
							</p>
						</div>
					</motion.div>
				</div>
			</section>

			{/* How It Works Section */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							How It Works
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Simple steps to connect talent with opportunity
						</p>
					</motion.div>

					<div className="grid md:grid-cols-4 gap-8">
						{[
							{
								step: "01",
								title: "Register & Profile",
								description:
									"Create your account and complete your detailed profile with AI assistance",
								icon: <UserCheck className="w-8 h-8 text-blue-600" />,
							},
							{
								step: "02",
								title: "AI Analysis",
								description:
									"Our AI analyzes your skills, preferences, and requirements for optimal matching",
								icon: <Target className="w-8 h-8 text-green-600" />,
							},
							{
								step: "03",
								title: "Smart Matching",
								description:
									"Get personalized recommendations and apply to the best-fit opportunities",
								icon: <Zap className="w-8 h-8 text-yellow-600" />,
							},
							{
								step: "04",
								title: "Success",
								description:
									"Track your progress and celebrate your successful internship placement",
								icon: <Award className="w-8 h-8 text-purple-600" />,
							},
						].map((item, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.2 }}
								className="text-center relative"
							>
								{index < 3 && (
									<div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-300"></div>
								)}
								<div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg border-2 border-gray-100">
									{item.icon}
								</div>
								<div className="text-sm font-bold text-gray-400 mb-2">
									STEP {item.step}
								</div>
								<h3 className="text-xl font-semibold text-gray-900 mb-3">
									{item.title}
								</h3>
								<p className="text-gray-600">{item.description}</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Success Stories Section */}
			<section className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Success Stories
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Real experiences from students and companies who found success
							through our platform
						</p>
					</motion.div>

					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								name: "Priya Sharma",
								role: "Computer Science Student",
								company: "Tech Mahindra",
								image: "PS",
								quote:
									"The AI-powered resume analysis helped me identify skills I didn't know I had. Got placed at my dream company!",
								rating: 5,
							},
							{
								name: "Rajesh Kumar",
								role: "HR Manager",
								company: "Infosys",
								image: "RK",
								quote:
									"We reduced our hiring time by 60% using the smart matching algorithms. Quality of candidates has improved significantly.",
								rating: 5,
							},
							{
								name: "Ananya Patel",
								role: "Mechanical Engineering Student",
								company: "L&T",
								image: "AP",
								quote:
									"The learning roadmap feature guided me perfectly. Landed an internship with 40% higher stipend than expected!",
								rating: 5,
							},
						].map((testimonial, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 50 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.2 }}
								className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
							>
								<div className="flex items-center mb-4">
									<div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-4">
										{testimonial.image}
									</div>
									<div>
										<h4 className="font-semibold text-gray-900">
											{testimonial.name}
										</h4>
										<p className="text-sm text-gray-600">{testimonial.role}</p>
										<p className="text-sm text-primary font-medium">
											{testimonial.company}
										</p>
									</div>
								</div>
								<div className="flex mb-4">
									{[...Array(testimonial.rating)].map((_, i) => (
										<Star
											key={i}
											className="w-4 h-4 text-yellow-400 fill-current"
										/>
									))}
								</div>
								<p className="text-gray-600 italic">"{testimonial.quote}"</p>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Partnership Section */}
			<section className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Trusted by Leading Organizations
						</h2>
						<p className="text-xl text-gray-600 max-w-2xl mx-auto">
							Partnering with top companies and institutions across India
						</p>
					</motion.div>

					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
						{[
							"TCS",
							"Infosys",
							"Wipro",
							"HCL",
							"Tech Mahindra",
							"L&T",
							"ISRO",
							"DRDO",
							"IIT",
							"NIT",
							"IIIT",
							"AICTE",
						].map((partner, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, scale: 0.8 }}
								whileInView={{ opacity: 0.6, scale: 1 }}
								whileHover={{ opacity: 1, scale: 1.1 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className="text-center p-4 hover:bg-gray-50 rounded-lg transition-all duration-300"
							>
								<div className="text-2xl font-bold text-gray-400 hover:text-primary transition-colors">
									{partner}
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* About Section */}
			<section id="about-section" className="py-20 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
							{t("aboutTitle")}
						</h2>
						<p className="text-xl text-gray-600 max-w-4xl mx-auto">
							{t("aboutDescription")}
						</p>
					</motion.div>

					<div className="grid md:grid-cols-2 gap-12 items-center mb-16">
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
						>
							<h3 className="text-2xl font-bold text-gray-900 mb-6">
								{t("mission")}
							</h3>
							<p className="text-gray-600 mb-6">{t("missionText")}</p>
							<div className="space-y-4">
								<div className="flex items-start space-x-3">
									<CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
									<div>
										<h4 className="font-semibold text-gray-900">
											{t("features.aiMatching")}
										</h4>
										<p className="text-gray-600">
											{t("features.aiMatchingDesc")}
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
									<div>
										<h4 className="font-semibold text-gray-900">
											{t("features.quotaEnforcement")}
										</h4>
										<p className="text-gray-600">
											{t("features.quotaEnforcementDesc")}
										</p>
									</div>
								</div>
								<div className="flex items-start space-x-3">
									<CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
									<div>
										<h4 className="font-semibold text-gray-900">
											{t("features.securePlatform")}
										</h4>
										<p className="text-gray-600">
											{t("features.securePlatformDesc")}
										</p>
									</div>
								</div>
							</div>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							className="bg-white rounded-xl shadow-lg p-8"
						>
							<h4 className="text-xl font-bold text-gray-900 mb-6">
								Key Statistics
							</h4>
							<div className="grid grid-cols-2 gap-6">
								<div className="text-center">
									<div className="text-3xl font-bold text-primary mb-2">
										95%
									</div>
									<div className="text-gray-600">Match Accuracy</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-bold text-primary mb-2">
										10K+
									</div>
									<div className="text-gray-600">Active Users</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-bold text-primary mb-2">
										500+
									</div>
									<div className="text-gray-600">Partner Companies</div>
								</div>
								<div className="text-center">
									<div className="text-3xl font-bold text-primary mb-2">
										50+
									</div>
									<div className="text-gray-600">Industries</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Contact Section */}
			<section id="contact-section" className="py-20 bg-white">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="text-center mb-16"
					>
						<h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
							{t("contactTitle")}
						</h2>
						<p className="text-xl text-gray-600 max-w-3xl mx-auto">
							{t("contactDescription")}
						</p>
					</motion.div>

					<div className="grid lg:grid-cols-2 gap-12">
						{/* Contact Information */}
						<motion.div
							initial={{ opacity: 0, x: -50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							className="space-y-8"
						>
							<div className="flex items-start space-x-4">
								<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
									<Mail className="w-6 h-6 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										{t("contact.emailUs")}
									</h3>
									<p className="text-gray-600 mb-1">
										support@pminternship.gov.in
									</p>
									<p className="text-gray-500 text-sm">
										{t("contact.emailDesc")}
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-4">
								<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
									<Phone className="w-6 h-6 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										{t("contact.callUs")}
									</h3>
									<p className="text-gray-600 mb-1">+91 11 2345 6789</p>
									<p className="text-gray-500 text-sm">
										{t("contact.callDesc")}
									</p>
								</div>
							</div>
							<div className="flex items-start space-x-4">
								<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
									<MapPin className="w-6 h-6 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2">
										{t("contact.visitUs")}
									</h3>
									<p className="text-gray-600 mb-1">New Delhi, India</p>
									<p className="text-gray-500 text-sm">
										{t("contact.visitDesc")}
									</p>
								</div>
							</div>
						</motion.div>

						{/* Contact Form */}
						<motion.div
							initial={{ opacity: 0, x: 50 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							className="bg-gray-50 rounded-xl p-8"
						>
							<h3 className="text-xl font-bold text-gray-900 mb-6">
								{t("contact.sendMessage")}
							</h3>
							<form className="space-y-6">
								<div className="grid md:grid-cols-2 gap-4">
									<input
										type="text"
										placeholder={t("contact.yourName")}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
									/>
									<input
										type="email"
										placeholder={t("contact.yourEmail")}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
									/>
								</div>
								<input
									type="text"
									placeholder={t("contact.subject")}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
								/>
								<textarea
									rows={5}
									placeholder={t("contact.yourMessage")}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
								/>
								<button
									type="submit"
									className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
								>
									<span>{t("contact.sendMsg")}</span>
									<ArrowRight className="w-5 h-5" />
								</button>
							</form>
						</motion.div>
					</div>
				</div>
			</section>

			{/* Enhanced CTA Section */}
			<section className="py-24 bg-gradient-to-br from-primary via-blue-600 to-accent relative overflow-hidden">
				{/* Animated Background Elements */}
				<div className="absolute inset-0 bg-black opacity-5"></div>
				<div className="absolute inset-0">
					<div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-10 rounded-full animate-pulse"></div>
					<div className="absolute bottom-10 right-10 w-32 h-32 bg-white opacity-5 rounded-full animate-pulse delay-1000"></div>
					<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white opacity-5 rounded-full animate-pulse delay-500"></div>
					<div className="absolute top-1/4 right-1/4 w-16 h-16 bg-white opacity-10 rounded-full animate-bounce"></div>
					<div className="absolute bottom-1/4 left-1/4 w-12 h-12 bg-white opacity-10 rounded-full animate-bounce delay-700"></div>
				</div>

				<div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
					<motion.div
						initial={{ opacity: 0, y: 50 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
					>
						{/* Main CTA Content */}
						<div className="mb-16">
							<motion.div
								initial={{ scale: 0.9 }}
								whileInView={{ scale: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className="inline-block"
							>
								<span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/20 text-white backdrop-blur-sm border border-white/30">
									<Sparkles className="w-4 h-4 mr-2" />
									AI-Powered Platform
								</span>
							</motion.div>

							<h2 className="text-4xl md:text-6xl font-bold text-white mb-6 mt-6 leading-tight">
								Ready to Transform Your
								<span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
									Career Journey?
								</span>
							</h2>

							<p className="text-xl md:text-2xl text-white mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
								Join over{" "}
								<span className="font-bold text-yellow-300">
									{dynamicStats.placedCandidates?.toLocaleString() || "10,000+"}
								</span>{" "}
								students and{" "}
								<span className="font-bold text-yellow-300">
									{dynamicStats.registeredCompanies || "500+"}
								</span>{" "}
								companies already using our AI-driven platform
							</p>

							{/* Enhanced CTA Buttons */}
							<div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
								<motion.div
									whileHover={{ scale: 1.05, y: -2 }}
									whileTap={{ scale: 0.95 }}
									className="relative group"
								>
									<Link
										href="/signup"
										className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-2xl hover:shadow-yellow-500/25 transition-all duration-300 transform hover:-translate-y-1"
									>
										<div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
										<Sparkles className="w-7 h-7 mr-3 relative z-10" />
										<span className="relative z-10">Start Your Journey</span>
										<ArrowRight className="w-7 h-7 ml-3 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
									</Link>
								</motion.div>

								<motion.div
									whileHover={{ scale: 1.05, y: -2 }}
									whileTap={{ scale: 0.95 }}
									className="relative group"
								>
									<Link
										href="/login"
										className="group relative inline-flex items-center justify-center px-10 py-5 text-xl font-semibold text-white bg-transparent border-2 border-white/50 rounded-2xl backdrop-blur-sm hover:bg-white/10 hover:border-white transition-all duration-300"
									>
										<UserCheck className="w-7 h-7 mr-3" />
										<span>Sign In</span>
									</Link>
								</motion.div>
							</div>

							{/* Trust Indicators */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, delay: 0.4 }}
								className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80"
							>
								<div className="flex items-center gap-2">
									<CheckCircle className="w-5 h-5 text-green-400" />
									<span className="text-sm">Free to Join</span>
								</div>
								<div className="flex items-center gap-2">
									<Shield className="w-5 h-5 text-blue-400" />
									<span className="text-sm">Secure & Private</span>
								</div>
								<div className="flex items-center gap-2">
									<Zap className="w-5 h-5 text-yellow-400" />
									<span className="text-sm">AI-Powered Matching</span>
								</div>
								<div className="flex items-center gap-2">
									<Award className="w-5 h-5 text-purple-400" />
									<span className="text-sm">Government Backed</span>
								</div>
							</motion.div>
						</div>

						{/* Enhanced Stats Grid */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8, delay: 0.4 }}
							className="grid grid-cols-2 md:grid-cols-4 gap-8"
						>
							<div className="text-center group">
								<div className="relative">
									<div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
										{dynamicStats.successRate || "94"}%
									</div>
									<div className="absolute -top-2 -right-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
								</div>
								<div className="text-white/90 text-sm font-medium">
									Success Rate
								</div>
								<div className="text-white/60 text-xs mt-1">
									Industry Leading
								</div>
							</div>

							<div className="text-center group">
								<div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
									₹25K
								</div>
								<div className="text-white/90 text-sm font-medium">
									Avg. Stipend
								</div>
								<div className="text-white/60 text-xs mt-1">Per Month</div>
							</div>

							<div className="text-center group">
								<div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
									{dynamicStats.registeredCompanies || "500"}+
								</div>
								<div className="text-white/90 text-sm font-medium">
									Partner Companies
								</div>
								<div className="text-white/60 text-xs mt-1">Top Tier</div>
							</div>

							<div className="text-center group">
								<div className="text-4xl md:text-5xl font-bold text-white mb-2 group-hover:scale-110 transition-transform duration-300">
									24/7
								</div>
								<div className="text-white/90 text-sm font-medium">
									AI Support
								</div>
								<div className="text-white/60 text-xs mt-1">
									Always Available
								</div>
							</div>
						</motion.div>

						{/* Additional CTA for different user types */}
						<motion.div
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.8, delay: 0.6 }}
							className="mt-16 pt-8 border-t border-white/20"
						>
							<p className="text-white/80 text-lg mb-6">
								Choose your path to success:
							</p>
							<div className="flex flex-col sm:flex-row gap-4 justify-center">
								<Link
									href="/signup?role=candidate"
									className="flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 backdrop-blur-sm"
								>
									<GraduationCap className="w-5 h-5 mr-2" />
									I'm a Student
								</Link>
								<Link
									href="/signup?role=company"
									className="flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 backdrop-blur-sm"
								>
									<Building2 className="w-5 h-5 mr-2" />
									I'm a Company
								</Link>
								<Link
									href="/signup?role=admin"
									className="flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-300 backdrop-blur-sm"
								>
									<Settings className="w-5 h-5 mr-2" />
									I'm an Admin
								</Link>
							</div>
						</motion.div>
					</motion.div>
				</div>
			</section>
		</div>
	);
};

export default LandingPage;
