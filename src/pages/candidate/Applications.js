import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	Eye,
	Download,
	Calendar,
	Building2,
	MapPin,
	Star,
	Search,
	Filter,
	ChevronDown,
	ChevronRight,
	Users,
	DollarSign,
	FileText,
	Bell,
	ExternalLink,
	RefreshCw,
	Sort,
	Grid,
	List,
	MoreVertical,
	MessageCircle,
	Upload,
} from "lucide-react";
import toast from "react-hot-toast";

const Applications = () => {
	const [applications, setApplications] = useState([]);
	const [filteredApplications, setFilteredApplications] = useState([]);
	const [filter, setFilter] = useState("all");
	const [sortBy, setSortBy] = useState("appliedDate");
	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState("list");
	const [loading, setLoading] = useState(true);
	const [selectedApplication, setSelectedApplication] = useState(null);
	const [showFilters, setShowFilters] = useState(false);
	const [stats, setStats] = useState({});

	useEffect(() => {
		loadApplications();
	}, []);

	useEffect(() => {
		filterAndSortApplications();
	}, [applications, filter, sortBy, searchTerm]);

	const loadApplications = async () => {
		setLoading(true);
		try {
			// Enhanced mock data
			const mockApplications = [
				{
					id: 1,
					title: "Frontend Developer Intern",
					company: "WebTech Ltd",
					location: "Bangalore",
					status: "Shortlisted",
					appliedDate: "2024-01-15",
					matchScore: 92,
					skills: ["React", "JavaScript", "CSS", "HTML"],
					duration: "6 months",
					stipend: "₹15,000/month",
					type: "Full-time",
					description:
						"Work on modern web applications using React and modern frontend technologies.",
					requirements: [
						"Bachelor's in CS/IT",
						"Strong JavaScript skills",
						"React experience",
					],
					nextSteps: "Interview scheduled for February 20, 2024",
					interviewDate: "2024-02-20",
					applicationDeadline: "2024-02-10",
					companyLogo: "/api/placeholder/40/40",
					timeline: [
						{
							status: "Applied",
							date: "2024-01-15",
							completed: true,
							description: "Application submitted successfully",
						},
						{
							status: "Under Review",
							date: "2024-01-18",
							completed: true,
							description: "Resume reviewed by HR team",
						},
						{
							status: "Shortlisted",
							date: "2024-01-25",
							completed: true,
							description: "Selected for technical interview",
						},
						{
							status: "Interview",
							date: "2024-02-20",
							completed: false,
							description: "Technical interview scheduled",
						},
						{
							status: "Final Decision",
							date: "2024-02-25",
							completed: false,
							description: "Final decision pending",
						},
					],
					lastUpdate: "2024-01-25",
					recruiterContact: {
						name: "Sarah Johnson",
						email: "sarah@webtech.com",
						phone: "+91-9876543210",
					},
				},
				{
					id: 2,
					title: "Backend Developer Intern",
					company: "API Solutions",
					location: "Mumbai",
					status: "Applied",
					appliedDate: "2024-01-20",
					matchScore: 87,
					skills: ["Node.js", "Python", "MongoDB", "Express"],
					duration: "4 months",
					stipend: "₹12,000/month",
					type: "Remote",
					description:
						"Build scalable backend services and APIs for web applications.",
					requirements: [
						"Backend development skills",
						"Database knowledge",
						"API design",
					],
					nextSteps: "Application under review",
					interviewDate: null,
					applicationDeadline: "2024-02-15",
					companyLogo: "/api/placeholder/40/40",
					timeline: [
						{
							status: "Applied",
							date: "2024-01-20",
							completed: true,
							description: "Application submitted successfully",
						},
						{
							status: "Under Review",
							date: "2024-01-22",
							completed: true,
							description: "Application under review",
						},
						{
							status: "Shortlisted",
							date: "TBD",
							completed: false,
							description: "Waiting for shortlisting",
						},
						{
							status: "Interview",
							date: "TBD",
							completed: false,
							description: "Interview not scheduled",
						},
						{
							status: "Final Decision",
							date: "TBD",
							completed: false,
							description: "Final decision pending",
						},
					],
					lastUpdate: "2024-01-22",
					recruiterContact: {
						name: "Raj Patel",
						email: "raj@apisolutions.com",
						phone: "+91-9876543211",
					},
				},
				{
					id: 3,
					title: "Full Stack Developer Intern",
					company: "TechStart",
					location: "Delhi",
					status: "Interview Scheduled",
					appliedDate: "2024-01-12",
					matchScore: 90,
					skills: ["React", "Node.js", "MongoDB", "Express"],
					duration: "5 months",
					stipend: "₹18,000/month",
					type: "Hybrid",
					description:
						"Work on full-stack web development projects using MERN stack.",
					requirements: [
						"Full-stack development",
						"MERN stack experience",
						"Problem-solving skills",
					],
					nextSteps: "Final round interview on February 18, 2024",
					interviewDate: "2024-02-18",
					applicationDeadline: "2024-02-05",
					companyLogo: "/api/placeholder/40/40",
					timeline: [
						{
							status: "Applied",
							date: "2024-01-12",
							completed: true,
							description: "Application submitted successfully",
						},
						{
							status: "Under Review",
							date: "2024-01-15",
							completed: true,
							description: "Resume reviewed",
						},
						{
							status: "Shortlisted",
							date: "2024-01-20",
							completed: true,
							description: "Selected for technical round",
						},
						{
							status: "Interview",
							date: "2024-02-18",
							completed: false,
							description: "Final round scheduled",
						},
						{
							status: "Final Decision",
							date: "2024-02-22",
							completed: false,
							description: "Final decision pending",
						},
					],
					lastUpdate: "2024-01-28",
					recruiterContact: {
						name: "Priya Sharma",
						email: "priya@techstart.com",
						phone: "+91-9876543212",
					},
				},
				{
					id: 4,
					title: "Data Science Intern",
					company: "DataViz Solutions",
					location: "Pune",
					status: "Rejected",
					appliedDate: "2024-01-08",
					matchScore: 75,
					skills: ["Python", "Machine Learning", "SQL", "Pandas"],
					duration: "6 months",
					stipend: "₹20,000/month",
					type: "Full-time",
					description: "Work on data analysis and machine learning projects.",
					requirements: [
						"Python programming",
						"ML knowledge",
						"Statistics background",
					],
					nextSteps: "Application rejected - feedback provided",
					interviewDate: null,
					applicationDeadline: "2024-01-30",
					companyLogo: "/api/placeholder/40/40",
					timeline: [
						{
							status: "Applied",
							date: "2024-01-08",
							completed: true,
							description: "Application submitted successfully",
						},
						{
							status: "Under Review",
							date: "2024-01-10",
							completed: true,
							description: "Resume reviewed",
						},
						{
							status: "Rejected",
							date: "2024-01-15",
							completed: true,
							description: "Not selected - insufficient ML experience",
						},
					],
					lastUpdate: "2024-01-15",
					rejectionFeedback:
						"We were impressed with your application, but we need someone with more hands-on machine learning experience.",
					recruiterContact: {
						name: "Amit Kumar",
						email: "amit@dataviz.com",
						phone: "+91-9876543213",
					},
				},
				{
					id: 5,
					title: "Mobile App Developer Intern",
					company: "AppTech Solutions",
					location: "Hyderabad",
					status: "Offer Received",
					appliedDate: "2024-01-05",
					matchScore: 95,
					skills: [
						"React Native",
						"JavaScript",
						"Mobile Development",
						"Firebase",
					],
					duration: "6 months",
					stipend: "₹22,000/month",
					type: "Full-time",
					description:
						"Develop cross-platform mobile applications using React Native.",
					requirements: [
						"React Native experience",
						"Mobile app development",
						"JavaScript proficiency",
					],
					nextSteps: "Offer acceptance deadline: February 25, 2024",
					interviewDate: "2024-02-10",
					applicationDeadline: "2024-01-25",
					companyLogo: "/api/placeholder/40/40",
					timeline: [
						{
							status: "Applied",
							date: "2024-01-05",
							completed: true,
							description: "Application submitted successfully",
						},
						{
							status: "Under Review",
							date: "2024-01-08",
							completed: true,
							description: "Resume reviewed",
						},
						{
							status: "Shortlisted",
							date: "2024-01-12",
							completed: true,
							description: "Selected for technical interview",
						},
						{
							status: "Interview",
							date: "2024-02-10",
							completed: true,
							description: "Interview completed successfully",
						},
						{
							status: "Offer",
							date: "2024-02-12",
							completed: true,
							description: "Job offer received",
						},
					],
					lastUpdate: "2024-02-12",
					offerDetails: {
						salary: "₹22,000/month",
						joiningDate: "2024-03-01",
						acceptanceDeadline: "2024-02-25",
						benefits: ["Health Insurance", "Learning Budget", "Flexible Hours"],
					},
					recruiterContact: {
						name: "Neha Gupta",
						email: "neha@apptech.com",
						phone: "+91-9876543214",
					},
				},
			];

			setApplications(mockApplications);

			// Calculate stats
			const statsData = {
				total: mockApplications.length,
				applied: mockApplications.filter((app) => app.status === "Applied")
					.length,
				shortlisted: mockApplications.filter(
					(app) => app.status === "Shortlisted"
				).length,
				interviews: mockApplications.filter(
					(app) => app.status === "Interview Scheduled"
				).length,
				offers: mockApplications.filter(
					(app) => app.status === "Offer Received"
				).length,
				rejected: mockApplications.filter((app) => app.status === "Rejected")
					.length,
			};
			setStats(statsData);
		} catch (error) {
			console.error("Error loading applications:", error);
			toast.error("Failed to load applications");
		} finally {
			setLoading(false);
		}
	};

	const filterAndSortApplications = () => {
		let filtered = applications;

		// Filter by status
		if (filter !== "all") {
			filtered = filtered.filter(
				(app) => app.status.toLowerCase().replace(" ", "-") === filter
			);
		}

		// Filter by search term
		if (searchTerm) {
			filtered = filtered.filter(
				(app) =>
					app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
					app.location.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Sort applications
		filtered.sort((a, b) => {
			switch (sortBy) {
				case "appliedDate":
					return new Date(b.appliedDate) - new Date(a.appliedDate);
				case "matchScore":
					return b.matchScore - a.matchScore;
				case "company":
					return a.company.localeCompare(b.company);
				case "status":
					return a.status.localeCompare(b.status);
				default:
					return 0;
			}
		});

		setFilteredApplications(filtered);
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "Shortlisted":
				return "text-green-600 bg-green-100 border-green-200";
			case "Applied":
				return "text-blue-600 bg-blue-100 border-blue-200";
			case "Interview Scheduled":
				return "text-purple-600 bg-purple-100 border-purple-200";
			case "Offer Received":
				return "text-emerald-600 bg-emerald-100 border-emerald-200";
			case "Rejected":
				return "text-red-600 bg-red-100 border-red-200";
			default:
				return "text-gray-600 bg-gray-100 border-gray-200";
		}
	};

	const getStatusIcon = (status) => {
		switch (status) {
			case "Shortlisted":
				return <CheckCircle className="w-4 h-4" />;
			case "Applied":
				return <Clock className="w-4 h-4" />;
			case "Interview Scheduled":
				return <Calendar className="w-4 h-4" />;
			case "Offer Received":
				return <Star className="w-4 h-4" />;
			case "Rejected":
				return <XCircle className="w-4 h-4" />;
			default:
				return <AlertCircle className="w-4 h-4" />;
		}
	};

	const handleStatusChange = (applicationId, newStatus) => {
		setApplications((prev) =>
			prev.map((app) =>
				app.id === applicationId
					? {
							...app,
							status: newStatus,
							lastUpdate: new Date().toISOString().split("T")[0],
					  }
					: app
			)
		);
		toast.success("Application status updated");
	};

	const downloadApplicationDocument = (applicationId, documentType) => {
		// Mock download functionality
		toast.success(
			`Downloading ${documentType} for application #${applicationId}`
		);
	};

	const filterOptions = [
		{ value: "all", label: "All Applications", count: stats.total },
		{ value: "applied", label: "Applied", count: stats.applied },
		{ value: "shortlisted", label: "Shortlisted", count: stats.shortlisted },
		{
			value: "interview-scheduled",
			label: "Interview Scheduled",
			count: stats.interviews,
		},
		{ value: "offer-received", label: "Offer Received", count: stats.offers },
		{ value: "rejected", label: "Rejected", count: stats.rejected },
	];

	const sortOptions = [
		{ value: "appliedDate", label: "Applied Date" },
		{ value: "matchScore", label: "Match Score" },
		{ value: "company", label: "Company" },
		{ value: "status", label: "Status" },
	];

	if (loading) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading your applications...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<div className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="py-6">
						<div className="flex items-center justify-between">
							<div>
								<h1 className="text-2xl font-bold text-gray-900">
									My Applications
								</h1>
								<p className="text-gray-600">
									Track and manage your internship applications
								</p>
							</div>
							<div className="flex items-center space-x-4">
								<button
									onClick={() =>
										setViewMode(viewMode === "list" ? "grid" : "list")
									}
									className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
								>
									{viewMode === "list" ? (
										<Grid className="w-5 h-5" />
									) : (
										<List className="w-5 h-5" />
									)}
								</button>
								<button
									onClick={loadApplications}
									className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									<RefreshCw className="w-4 h-4" />
									<span>Refresh</span>
								</button>
							</div>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-6">
							{filterOptions.map((option) => (
								<div
									key={option.value}
									className={`p-4 rounded-lg border cursor-pointer transition-all ${
										filter === option.value
											? "bg-blue-50 border-blue-200 text-blue-700"
											: "bg-white border-gray-200 hover:bg-gray-50"
									}`}
									onClick={() => setFilter(option.value)}
								>
									<div className="text-center">
										<div className="text-2xl font-bold">
											{option.count || 0}
										</div>
										<div className="text-sm text-gray-600">{option.label}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Search and Filters */}
				<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
					<div className="flex flex-col sm:flex-row gap-4">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								placeholder="Search applications by title, company, or location..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>
						<div className="flex items-center space-x-4">
							<div className="relative">
								<select
									value={sortBy}
									onChange={(e) => setSortBy(e.target.value)}
									className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								>
									{sortOptions.map((option) => (
										<option key={option.value} value={option.value}>
											Sort by {option.label}
										</option>
									))}
								</select>
								<ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
							</div>
							<button
								onClick={() => setShowFilters(!showFilters)}
								className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
									showFilters
										? "bg-blue-50 border-blue-200 text-blue-700"
										: "hover:bg-gray-50"
								}`}
							>
								<Filter className="w-4 h-4" />
								<span>Filters</span>
							</button>
						</div>
					</div>

					{/* Advanced Filters */}
					<AnimatePresence>
						{showFilters && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="mt-4 pt-4 border-t border-gray-200"
							>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Location
										</label>
										<select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
											<option value="">All Locations</option>
											<option value="bangalore">Bangalore</option>
											<option value="mumbai">Mumbai</option>
											<option value="delhi">Delhi</option>
											<option value="pune">Pune</option>
											<option value="hyderabad">Hyderabad</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Duration
										</label>
										<select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
											<option value="">All Durations</option>
											<option value="3">3 months</option>
											<option value="4">4 months</option>
											<option value="5">5 months</option>
											<option value="6">6 months</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Type
										</label>
										<select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
											<option value="">All Types</option>
											<option value="full-time">Full-time</option>
											<option value="remote">Remote</option>
											<option value="hybrid">Hybrid</option>
										</select>
									</div>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Applications List/Grid */}
				<div
					className={
						viewMode === "grid"
							? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
							: "space-y-4"
					}
				>
					<AnimatePresence>
						{filteredApplications.map((application, index) => (
							<motion.div
								key={application.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ delay: index * 0.1 }}
								className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
							>
								{viewMode === "list" ? (
									// List View
									<div className="p-6">
										<div className="flex items-center justify-between">
											<div className="flex items-center space-x-4 flex-1">
												<div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
													<Building2 className="w-6 h-6 text-gray-600" />
												</div>
												<div className="flex-1">
													<div className="flex items-center space-x-2">
														<h3 className="font-semibold text-gray-900">
															{application.title}
														</h3>
														<span
															className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
																application.status
															)}`}
														>
															{getStatusIcon(application.status)}
															<span>{application.status}</span>
														</span>
													</div>
													<p className="text-gray-600">{application.company}</p>
													<div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
														<div className="flex items-center space-x-1">
															<MapPin className="w-4 h-4" />
															<span>{application.location}</span>
														</div>
														<div className="flex items-center space-x-1">
															<DollarSign className="w-4 h-4" />
															<span>{application.stipend}</span>
														</div>
														<div className="flex items-center space-x-1">
															<Clock className="w-4 h-4" />
															<span>{application.duration}</span>
														</div>
													</div>
												</div>
											</div>
											<div className="flex items-center space-x-4">
												<div className="text-right">
													<div className="text-lg font-semibold text-gray-900">
														{application.matchScore}%
													</div>
													<div className="text-sm text-gray-500">match</div>
												</div>
												<div className="flex items-center space-x-2">
													<button
														onClick={() => setSelectedApplication(application)}
														className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
													>
														<Eye className="w-5 h-5" />
													</button>
													<button
														onClick={() =>
															downloadApplicationDocument(
																application.id,
																"application"
															)
														}
														className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
													>
														<Download className="w-5 h-5" />
													</button>
													<button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
														<MoreVertical className="w-5 h-5" />
													</button>
												</div>
											</div>
										</div>
										{application.nextSteps && (
											<div className="mt-4 p-3 bg-blue-50 rounded-lg">
												<div className="flex items-center space-x-2">
													<Bell className="w-4 h-4 text-blue-600" />
													<span className="text-sm text-blue-800 font-medium">
														Next Steps:
													</span>
												</div>
												<p className="text-sm text-blue-700 mt-1">
													{application.nextSteps}
												</p>
											</div>
										)}
									</div>
								) : (
									// Grid View
									<div className="p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
												<Building2 className="w-5 h-5 text-gray-600" />
											</div>
											<span
												className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
													application.status
												)}`}
											>
												{getStatusIcon(application.status)}
												<span>{application.status}</span>
											</span>
										</div>
										<h3 className="font-semibold text-gray-900 mb-1">
											{application.title}
										</h3>
										<p className="text-gray-600 mb-3">{application.company}</p>
										<div className="space-y-2 text-sm text-gray-500">
											<div className="flex items-center space-x-1">
												<MapPin className="w-4 h-4" />
												<span>{application.location}</span>
											</div>
											<div className="flex items-center space-x-1">
												<DollarSign className="w-4 h-4" />
												<span>{application.stipend}</span>
											</div>
											<div className="flex items-center space-x-1">
												<Clock className="w-4 h-4" />
												<span>{application.duration}</span>
											</div>
										</div>
										<div className="mt-4 pt-4 border-t border-gray-200">
											<div className="flex items-center justify-between">
												<div className="text-sm">
													<span className="font-medium text-gray-900">
														{application.matchScore}%
													</span>
													<span className="text-gray-500"> match</span>
												</div>
												<button
													onClick={() => setSelectedApplication(application)}
													className="text-blue-600 hover:text-blue-800 text-sm font-medium"
												>
													View Details
												</button>
											</div>
										</div>
									</div>
								)}
							</motion.div>
						))}
					</AnimatePresence>
				</div>

				{filteredApplications.length === 0 && (
					<div className="text-center py-12">
						<FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">
							No applications found
						</h3>
						<p className="text-gray-600">
							{searchTerm || filter !== "all"
								? "Try adjusting your filters or search terms"
								: "Start applying to internships to see them here"}
						</p>
					</div>
				)}
			</div>

			{/* Application Detail Modal */}
			<AnimatePresence>
				{selectedApplication && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
						onClick={() => setSelectedApplication(null)}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center justify-between">
									<div>
										<h2 className="text-xl font-bold text-gray-900">
											{selectedApplication.title}
										</h2>
										<p className="text-gray-600">
											{selectedApplication.company}
										</p>
									</div>
									<button
										onClick={() => setSelectedApplication(null)}
										className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
									>
										<XCircle className="w-6 h-6 text-gray-400" />
									</button>
								</div>
							</div>

							<div className="p-6">
								<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
									<div className="lg:col-span-2">
										{/* Application Timeline */}
										<div className="mb-8">
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Application Timeline
											</h3>
											<div className="space-y-4">
												{selectedApplication.timeline.map((step, index) => (
													<div
														key={index}
														className="flex items-start space-x-4"
													>
														<div
															className={`w-8 h-8 rounded-full flex items-center justify-center ${
																step.completed ? "bg-green-500" : "bg-gray-300"
															}`}
														>
															{step.completed ? (
																<CheckCircle className="w-5 h-5 text-white" />
															) : (
																<Clock className="w-5 h-5 text-gray-600" />
															)}
														</div>
														<div className="flex-1">
															<div className="flex items-center justify-between">
																<h4
																	className={`font-medium ${
																		step.completed
																			? "text-gray-900"
																			: "text-gray-500"
																	}`}
																>
																	{step.status}
																</h4>
																<span className="text-sm text-gray-500">
																	{step.date}
																</span>
															</div>
															<p className="text-sm text-gray-600 mt-1">
																{step.description}
															</p>
														</div>
													</div>
												))}
											</div>
										</div>

										{/* Job Description */}
										<div className="mb-8">
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Job Description
											</h3>
											<p className="text-gray-700">
												{selectedApplication.description}
											</p>
										</div>

										{/* Requirements */}
										<div className="mb-8">
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Requirements
											</h3>
											<ul className="list-disc list-inside space-y-2">
												{selectedApplication.requirements.map((req, index) => (
													<li key={index} className="text-gray-700">
														{req}
													</li>
												))}
											</ul>
										</div>

										{/* Skills */}
										<div>
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Required Skills
											</h3>
											<div className="flex flex-wrap gap-2">
												{selectedApplication.skills.map((skill) => (
													<span
														key={skill}
														className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
													>
														{skill}
													</span>
												))}
											</div>
										</div>
									</div>

									<div>
										{/* Application Details */}
										<div className="bg-gray-50 rounded-lg p-6 mb-6">
											<h3 className="text-lg font-semibold text-gray-900 mb-4">
												Application Details
											</h3>
											<div className="space-y-3">
												<div className="flex items-center justify-between">
													<span className="text-gray-600">Status</span>
													<span
														className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
															selectedApplication.status
														)}`}
													>
														{getStatusIcon(selectedApplication.status)}
														<span>{selectedApplication.status}</span>
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-gray-600">Match Score</span>
													<span className="font-medium text-gray-900">
														{selectedApplication.matchScore}%
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-gray-600">Applied Date</span>
													<span className="text-gray-900">
														{selectedApplication.appliedDate}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-gray-600">Last Update</span>
													<span className="text-gray-900">
														{selectedApplication.lastUpdate}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-gray-600">Location</span>
													<span className="text-gray-900">
														{selectedApplication.location}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-gray-600">Duration</span>
													<span className="text-gray-900">
														{selectedApplication.duration}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-gray-600">Stipend</span>
													<span className="text-gray-900">
														{selectedApplication.stipend}
													</span>
												</div>
												<div className="flex items-center justify-between">
													<span className="text-gray-600">Type</span>
													<span className="text-gray-900">
														{selectedApplication.type}
													</span>
												</div>
											</div>
										</div>

										{/* Recruiter Contact */}
										{selectedApplication.recruiterContact && (
											<div className="bg-gray-50 rounded-lg p-6 mb-6">
												<h3 className="text-lg font-semibold text-gray-900 mb-4">
													Recruiter Contact
												</h3>
												<div className="space-y-3">
													<div>
														<span className="text-gray-600 block">Name</span>
														<span className="text-gray-900">
															{selectedApplication.recruiterContact.name}
														</span>
													</div>
													<div>
														<span className="text-gray-600 block">Email</span>
														<a
															href={`mailto:${selectedApplication.recruiterContact.email}`}
															className="text-blue-600 hover:text-blue-800"
														>
															{selectedApplication.recruiterContact.email}
														</a>
													</div>
													<div>
														<span className="text-gray-600 block">Phone</span>
														<a
															href={`tel:${selectedApplication.recruiterContact.phone}`}
															className="text-blue-600 hover:text-blue-800"
														>
															{selectedApplication.recruiterContact.phone}
														</a>
													</div>
												</div>
											</div>
										)}

										{/* Offer Details */}
										{selectedApplication.status === "Offer Received" &&
											selectedApplication.offerDetails && (
												<div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
													<h3 className="text-lg font-semibold text-green-900 mb-4">
														Offer Details
													</h3>
													<div className="space-y-3">
														<div className="flex items-center justify-between">
															<span className="text-green-700">Salary</span>
															<span className="font-medium text-green-900">
																{selectedApplication.offerDetails.salary}
															</span>
														</div>
														<div className="flex items-center justify-between">
															<span className="text-green-700">
																Joining Date
															</span>
															<span className="text-green-900">
																{selectedApplication.offerDetails.joiningDate}
															</span>
														</div>
														<div className="flex items-center justify-between">
															<span className="text-green-700">
																Response Deadline
															</span>
															<span className="text-green-900">
																{
																	selectedApplication.offerDetails
																		.acceptanceDeadline
																}
															</span>
														</div>
														<div>
															<span className="text-green-700 block mb-2">
																Benefits
															</span>
															<div className="space-y-1">
																{selectedApplication.offerDetails.benefits.map(
																	(benefit, index) => (
																		<div
																			key={index}
																			className="flex items-center space-x-2"
																		>
																			<CheckCircle className="w-4 h-4 text-green-600" />
																			<span className="text-green-900">
																				{benefit}
																			</span>
																		</div>
																	)
																)}
															</div>
														</div>
													</div>
													<div className="mt-4 pt-4 border-t border-green-200">
														<div className="flex space-x-3">
															<button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
																Accept Offer
															</button>
															<button className="flex-1 bg-white text-green-600 border border-green-600 py-2 px-4 rounded-lg hover:bg-green-50 transition-colors">
																Decline
															</button>
														</div>
													</div>
												</div>
											)}

										{/* Rejection Feedback */}
										{selectedApplication.status === "Rejected" &&
											selectedApplication.rejectionFeedback && (
												<div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
													<h3 className="text-lg font-semibold text-red-900 mb-4">
														Feedback
													</h3>
													<p className="text-red-800">
														{selectedApplication.rejectionFeedback}
													</p>
												</div>
											)}

										{/* Actions */}
										<div className="space-y-3">
											<button
												onClick={() =>
													downloadApplicationDocument(
														selectedApplication.id,
														"resume"
													)
												}
												className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
											>
												<Download className="w-4 h-4" />
												<span>Download Resume</span>
											</button>
											<button
												onClick={() =>
													downloadApplicationDocument(
														selectedApplication.id,
														"cover-letter"
													)
												}
												className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
											>
												<FileText className="w-4 h-4" />
												<span>Download Cover Letter</span>
											</button>
											<button className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
												<MessageCircle className="w-4 h-4" />
												<span>Contact Recruiter</span>
											</button>
										</div>
									</div>
								</div>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default Applications;
