import React, { useState, useEffect } from "react";
import {
	Search,
	Filter,
	Eye,
	Download,
	MapPin,
	Calendar,
	GraduationCap,
	Briefcase,
	ChevronDown,
} from "lucide-react";

const ShortlistReview = () => {
	const [applications, setApplications] = useState([]);
	const [filteredApplications, setFilteredApplications] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [filters, setFilters] = useState({
		status: "all",
		matchScore: 0,
		posting: "all",
	});
	const [selectedApplications, setSelectedApplications] = useState([]);
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		// Mock data - in real app, this would come from API
		const mockApplications = [
			{
				id: 1,
				candidateName: "John Doe",
				email: "john.doe@email.com",
				phone: "+91 98765 43210",
				postingTitle: "Frontend Developer Intern",
				postingId: 1,
				matchScore: 92,
				status: "Under Review",
				appliedDate: "2024-01-20",
				skills: ["React", "JavaScript", "CSS", "HTML", "TypeScript", "Redux"],
				experience: "2 years",
				education: "B.Tech Computer Science - IIT Delhi",
				location: "Bangalore",
				resumeUrl: "#",
				coverLetter:
					"I am passionate about frontend development and have been working with React for the past 2 years...",
				projects: [
					{
						title: "E-commerce Website",
						description:
							"Built a full-stack e-commerce platform using React and Node.js",
						technologies: ["React", "Node.js", "MongoDB", "Stripe"],
					},
					{
						title: "Task Management App",
						description:
							"Created a collaborative task management application with real-time updates",
						technologies: ["React", "Socket.io", "Express", "PostgreSQL"],
					},
				],
				achievements: [
					"Won 1st place in college hackathon",
					"Contributed to open-source React projects",
					"Completed 5+ online courses",
				],
			},
			{
				id: 2,
				candidateName: "Jane Smith",
				email: "jane.smith@email.com",
				phone: "+91 98765 43211",
				postingTitle: "Backend Developer Intern",
				postingId: 2,
				matchScore: 88,
				status: "Shortlisted",
				appliedDate: "2024-01-22",
				skills: ["Node.js", "Python", "MongoDB", "Express", "Docker", "AWS"],
				experience: "1.5 years",
				education: "B.Tech Information Technology - NIT Surat",
				location: "Mumbai",
				resumeUrl: "#",
				coverLetter:
					"I have strong backend development skills and experience with various databases...",
				projects: [
					{
						title: "REST API for E-commerce",
						description:
							"Developed a scalable REST API with authentication and payment integration",
						technologies: ["Node.js", "Express", "MongoDB", "JWT", "Stripe"],
					},
				],
				achievements: [
					"Published 3 technical articles",
					"Active contributor to Node.js community",
					"Certified AWS Developer",
				],
			},
			{
				id: 3,
				candidateName: "Mike Johnson",
				email: "mike.johnson@email.com",
				phone: "+91 98765 43212",
				postingTitle: "Frontend Developer Intern",
				postingId: 1,
				matchScore: 85,
				status: "Interview Scheduled",
				appliedDate: "2024-01-18",
				skills: ["React", "Vue.js", "JavaScript", "CSS", "Bootstrap", "SASS"],
				experience: "1 year",
				education: "B.Tech Computer Science - VIT Vellore",
				location: "Delhi",
				resumeUrl: "#",
				coverLetter:
					"I am a creative frontend developer with a passion for user experience...",
				projects: [
					{
						title: "Portfolio Website",
						description:
							"Designed and developed a responsive portfolio website",
						technologies: ["React", "CSS3", "Framer Motion", "Netlify"],
					},
				],
				achievements: [
					"UI/UX Design certification",
					"Freelance web development experience",
					"GitHub: 50+ repositories",
				],
			},
			{
				id: 4,
				candidateName: "Sarah Wilson",
				email: "sarah.wilson@email.com",
				phone: "+91 98765 43213",
				postingTitle: "Data Science Intern",
				postingId: 3,
				matchScore: 90,
				status: "Under Review",
				appliedDate: "2024-01-25",
				skills: [
					"Python",
					"Machine Learning",
					"SQL",
					"Pandas",
					"Scikit-learn",
					"TensorFlow",
				],
				experience: "2 years",
				education: "M.Tech Data Science - IISc Bangalore",
				location: "Pune",
				resumeUrl: "#",
				coverLetter:
					"I have a strong background in data science and machine learning...",
				projects: [
					{
						title: "Customer Churn Prediction",
						description:
							"Built a machine learning model to predict customer churn with 85% accuracy",
						technologies: ["Python", "Scikit-learn", "Pandas", "Matplotlib"],
					},
				],
				achievements: [
					"Published research paper in ML conference",
					"Kaggle competitions: Top 10%",
					"Data Science certification from Coursera",
				],
			},
		];

		setApplications(mockApplications);
		setFilteredApplications(mockApplications);
	}, []);

	useEffect(() => {
		let filtered = applications;

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(app) =>
					app.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
					app.postingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
					app.skills.some((skill) =>
						skill.toLowerCase().includes(searchTerm.toLowerCase())
					)
			);
		}

		// Status filter
		if (filters.status !== "all") {
			filtered = filtered.filter((app) => app.status === filters.status);
		}

		// Match score filter
		filtered = filtered.filter((app) => app.matchScore >= filters.matchScore);

		// Posting filter
		if (filters.posting !== "all") {
			filtered = filtered.filter(
				(app) => app.postingId.toString() === filters.posting
			);
		}

		setFilteredApplications(filtered);
	}, [applications, searchTerm, filters]);

	const handleStatusChange = (applicationId, newStatus) => {
		setApplications((prev) =>
			prev.map((app) =>
				app.id === applicationId ? { ...app, status: newStatus } : app
			)
		);
	};

	const handleSelectApplication = (applicationId) => {
		setSelectedApplications((prev) =>
			prev.includes(applicationId)
				? prev.filter((id) => id !== applicationId)
				: [...prev, applicationId]
		);
	};

	const handleBulkAction = (action) => {
		selectedApplications.forEach((appId) => {
			handleStatusChange(appId, action);
		});
		setSelectedApplications([]);
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "Shortlisted":
				return "text-green-600 bg-green-100";
			case "Under Review":
				return "text-blue-600 bg-blue-100";
			case "Interview Scheduled":
				return "text-yellow-600 bg-yellow-100";
			case "Rejected":
				return "text-red-600 bg-red-100";
			default:
				return "text-gray-600 bg-gray-100";
		}
	};

	const getMatchScoreColor = (score) => {
		if (score >= 90) return "text-green-600";
		if (score >= 80) return "text-blue-600";
		if (score >= 70) return "text-yellow-600";
		return "text-red-600";
	};

	const postings = [
		...new Set(
			applications.map((app) => ({
				id: app.postingId,
				title: app.postingTitle,
			}))
		),
	];

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Application Review
					</h1>
					<p className="text-gray-600 mt-2">
						Review and shortlist candidates for your internship positions.
					</p>
				</div>

				{/* Search and Filters */}
				<div className="card mb-8">
					<div className="flex flex-col lg:flex-row gap-4">
						{/* Search */}
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
							<input
								type="text"
								placeholder="Search by name, email, or skills..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="input-field pl-10"
							/>
						</div>

						{/* Filter Toggle */}
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="btn-secondary flex items-center space-x-2"
						>
							<Filter className="w-5 h-5" />
							<span>Filters</span>
							<ChevronDown
								className={`w-4 h-4 transition-transform ${
									showFilters ? "rotate-180" : ""
								}`}
							/>
						</button>
					</div>

					{/* Advanced Filters */}
					{showFilters && (
						<div className="mt-6 pt-6 border-t border-gray-200">
							<div className="grid md:grid-cols-3 gap-4">
								{/* Status Filter */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Status
									</label>
									<select
										value={filters.status}
										onChange={(e) =>
											setFilters({ ...filters, status: e.target.value })
										}
										className="input-field"
									>
										<option value="all">All Status</option>
										<option value="Under Review">Under Review</option>
										<option value="Shortlisted">Shortlisted</option>
										<option value="Interview Scheduled">
											Interview Scheduled
										</option>
										<option value="Rejected">Rejected</option>
									</select>
								</div>

								{/* Posting Filter */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Posting
									</label>
									<select
										value={filters.posting}
										onChange={(e) =>
											setFilters({ ...filters, posting: e.target.value })
										}
										className="input-field"
									>
										<option value="all">All Postings</option>
										{postings.map((posting) => (
											<option key={posting.id} value={posting.id}>
												{posting.title}
											</option>
										))}
									</select>
								</div>

								{/* Match Score Filter */}
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Min Match Score: {filters.matchScore}%
									</label>
									<input
										type="range"
										min="0"
										max="100"
										value={filters.matchScore}
										onChange={(e) =>
											setFilters({
												...filters,
												matchScore: parseInt(e.target.value),
											})
										}
										className="w-full"
									/>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Bulk Actions */}
				{selectedApplications.length > 0 && (
					<div className="card mb-6 bg-blue-50 border border-blue-200">
						<div className="flex items-center justify-between">
							<span className="text-blue-900 font-medium">
								{selectedApplications.length} application(s) selected
							</span>
							<div className="flex items-center space-x-2">
								<button
									onClick={() => handleBulkAction("Shortlisted")}
									className="btn-accent text-sm px-4 py-2"
								>
									Shortlist Selected
								</button>
								<button
									onClick={() => handleBulkAction("Rejected")}
									className="btn-secondary text-sm px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200"
								>
									Reject Selected
								</button>
								<button
									onClick={() => setSelectedApplications([])}
									className="text-blue-600 hover:text-blue-800 text-sm"
								>
									Clear Selection
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Results Count */}
				<div className="mb-6">
					<p className="text-gray-600">
						Showing {filteredApplications.length} of {applications.length}{" "}
						applications
					</p>
				</div>

				{/* Applications List */}
				<div className="space-y-6">
					{filteredApplications.map((app) => (
						<div
							key={app.id}
							className="card hover:shadow-lg transition-shadow duration-300"
						>
							<div className="flex items-start justify-between mb-4">
								<div className="flex items-start space-x-4">
									<input
										type="checkbox"
										checked={selectedApplications.includes(app.id)}
										onChange={() => handleSelectApplication(app.id)}
										className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
									/>
									<div className="flex-1">
										<div className="flex items-center space-x-3 mb-2">
											<h3 className="text-xl font-semibold text-gray-900">
												{app.candidateName}
											</h3>
											<span
												className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
													app.status
												)}`}
											>
												{app.status}
											</span>
											<div
												className={`text-2xl font-bold ${getMatchScoreColor(
													app.matchScore
												)}`}
											>
												{app.matchScore}%
											</div>
										</div>
										<div className="flex items-center space-x-4 text-gray-600 text-sm mb-3">
											<div className="flex items-center space-x-1">
												<Briefcase className="w-4 h-4" />
												<span>{app.postingTitle}</span>
											</div>
											<div className="flex items-center space-x-1">
												<MapPin className="w-4 h-4" />
												<span>{app.location}</span>
											</div>
											<div className="flex items-center space-x-1">
												<Calendar className="w-4 h-4" />
												<span>
													Applied on{" "}
													{new Date(app.appliedDate).toLocaleDateString()}
												</span>
											</div>
										</div>
										<p className="text-gray-600 mb-3">{app.coverLetter}</p>
									</div>
								</div>
								<div className="flex items-center space-x-2">
									<button className="p-2 text-gray-400 hover:text-primary">
										<Eye className="w-5 h-5" />
									</button>
									<button className="p-2 text-gray-400 hover:text-primary">
										<Download className="w-5 h-5" />
									</button>
								</div>
							</div>

							{/* Skills and Details */}
							<div className="grid md:grid-cols-2 gap-6 mb-4">
								<div>
									<h4 className="text-sm font-medium text-gray-900 mb-2">
										Skills:
									</h4>
									<div className="flex flex-wrap gap-2">
										{app.skills.map((skill, index) => (
											<span
												key={index}
												className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
											>
												{skill}
											</span>
										))}
									</div>
								</div>
								<div>
									<h4 className="text-sm font-medium text-gray-900 mb-2">
										Details:
									</h4>
									<div className="space-y-1 text-sm text-gray-600">
										<div className="flex items-center space-x-2">
											<GraduationCap className="w-4 h-4" />
											<span>{app.education}</span>
										</div>
										<div className="flex items-center space-x-2">
											<Briefcase className="w-4 h-4" />
											<span>{app.experience} experience</span>
										</div>
										<div className="flex items-center space-x-2">
											<MapPin className="w-4 h-4" />
											<span>{app.location}</span>
										</div>
									</div>
								</div>
							</div>

							{/* Projects */}
							<div className="mb-4">
								<h4 className="text-sm font-medium text-gray-900 mb-2">
									Recent Projects:
								</h4>
								<div className="space-y-2">
									{app.projects.slice(0, 2).map((project, index) => (
										<div key={index} className="p-3 bg-gray-50 rounded-lg">
											<div className="font-medium text-gray-900 text-sm">
												{project.title}
											</div>
											<div className="text-gray-600 text-sm mb-1">
												{project.description}
											</div>
											<div className="flex flex-wrap gap-1">
												{project.technologies.map((tech, techIndex) => (
													<span
														key={techIndex}
														className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
													>
														{tech}
													</span>
												))}
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Actions */}
							<div className="flex items-center justify-between pt-4 border-t border-gray-200">
								<div className="text-sm text-gray-500">
									Application ID: #{app.id.toString().padStart(4, "0")}
								</div>
								<div className="flex items-center space-x-2">
									<select
										value={app.status}
										onChange={(e) => handleStatusChange(app.id, e.target.value)}
										className="input-field text-sm"
									>
										<option value="Under Review">Under Review</option>
										<option value="Shortlisted">Shortlist</option>
										<option value="Interview Scheduled">
											Schedule Interview
										</option>
										<option value="Rejected">Reject</option>
									</select>
									<button className="btn-primary text-sm px-4 py-2">
										View Full Profile
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* No Applications */}
				{filteredApplications.length === 0 && (
					<div className="text-center py-12">
						<div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Search className="w-12 h-12 text-gray-400" />
						</div>
						<h3 className="text-xl font-semibold text-gray-900 mb-2">
							No applications found
						</h3>
						<p className="text-gray-600 mb-4">
							Try adjusting your search criteria or filters to find more
							applications.
						</p>
						<button
							onClick={() => {
								setSearchTerm("");
								setFilters({ status: "all", matchScore: 0, posting: "all" });
							}}
							className="btn-primary"
						>
							Clear All Filters
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ShortlistReview;
