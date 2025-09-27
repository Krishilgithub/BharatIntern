import React, { useState, useEffect } from "react";
import {
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	Briefcase,
	GraduationCap,
	Settings,
	Edit3,
	Save,
	X,
	Camera,
	Shield,
	Bell,
	Globe,
	Lock,
	Eye,
	EyeOff,
	Star,
	Award,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";

const UserProfile = () => {
	const { user } = useAuth();
	const [activeTab, setActiveTab] = useState("personal");
	const [isEditing, setIsEditing] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const [profileData, setProfileData] = useState({
		// Personal Information
		firstName: user?.firstName || "",
		lastName: user?.lastName || "",
		email: user?.email || "",
		phone: user?.phone || "",
		dateOfBirth: user?.dateOfBirth || "",
		location: user?.location || "",
		bio: user?.bio || "",
		profileImage: user?.profileImage || null,

		// Professional Information
		currentPosition: user?.currentPosition || "",
		company: user?.company || "",
		experience: user?.experience || "",
		skills: user?.skills || [],

		// Education
		education: user?.education || [],
		certifications: user?.certifications || [],

		// Settings
		notifications: {
			email: user?.settings?.notifications?.email ?? true,
			push: user?.settings?.notifications?.push ?? true,
			sms: user?.settings?.notifications?.sms ?? false,
		},
		privacy: {
			profileVisibility: user?.settings?.privacy?.profileVisibility || "public",
			contactInfo: user?.settings?.privacy?.contactInfo || "private",
		},
	});

	const [tempProfileData, setTempProfileData] = useState(profileData);

	useEffect(() => {
		// Load user profile data from API
		// This would typically fetch from your backend
		console.log("Loading profile for user:", user);
	}, [user]);

	const handleEdit = () => {
		setTempProfileData(profileData);
		setIsEditing(true);
	};

	const handleCancel = () => {
		setTempProfileData(profileData);
		setIsEditing(false);
	};

	const handleSave = async () => {
		try {
			// Here you would typically make an API call to update the profile
			setProfileData(tempProfileData);
			setIsEditing(false);
			toast.success("Profile updated successfully!");
		} catch (error) {
			toast.error("Failed to update profile");
			console.error("Profile update error:", error);
		}
	};

	const handleInputChange = (section, field, value) => {
		setTempProfileData((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: value,
			},
		}));
	};

	const handleDirectChange = (field, value) => {
		setTempProfileData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const addSkill = (skill) => {
		if (skill && !tempProfileData.skills.includes(skill)) {
			setTempProfileData((prev) => ({
				...prev,
				skills: [...prev.skills, skill],
			}));
		}
	};

	const removeSkill = (skillToRemove) => {
		setTempProfileData((prev) => ({
			...prev,
			skills: prev.skills.filter((skill) => skill !== skillToRemove),
		}));
	};

	const addEducation = () => {
		setTempProfileData((prev) => ({
			...prev,
			education: [
				...prev.education,
				{
					id: Date.now(),
					degree: "",
					institution: "",
					year: "",
					gpa: "",
				},
			],
		}));
	};

	const updateEducation = (id, field, value) => {
		setTempProfileData((prev) => ({
			...prev,
			education: prev.education.map((edu) =>
				edu.id === id ? { ...edu, [field]: value } : edu
			),
		}));
	};

	const removeEducation = (id) => {
		setTempProfileData((prev) => ({
			...prev,
			education: prev.education.filter((edu) => edu.id !== id),
		}));
	};

	const getRoleSpecificContent = () => {
		switch (user?.role) {
			case "candidate":
				return {
					title: "Candidate Profile",
					specialSections: ["skills", "education", "certifications"],
				};
			case "company":
				return {
					title: "Company Profile",
					specialSections: ["company-info", "hiring-preferences"],
				};
			case "admin":
				return {
					title: "Administrator Profile",
					specialSections: ["system-access", "permissions"],
				};
			default:
				return {
					title: "User Profile",
					specialSections: [],
				};
		}
	};

	const roleContent = getRoleSpecificContent();

	return (
		<div className="max-w-6xl mx-auto p-6 space-y-6">
			{/* Header */}
			<div className="bg-white rounded-lg shadow-md overflow-hidden">
				<div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
				<div className="px-6 pb-6">
					<div className="flex items-end -mt-16 mb-4">
						<div className="relative">
							<div className="w-32 h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden">
								{profileData.profileImage ? (
									<img
										src={profileData.profileImage}
										alt="Profile"
										className="w-full h-full object-cover"
									/>
								) : (
									<User className="w-16 h-16 text-gray-400" />
								)}
							</div>
							{isEditing && (
								<button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
									<Camera className="w-4 h-4" />
								</button>
							)}
						</div>
						<div className="ml-6 flex-1">
							<div className="flex items-center justify-between">
								<div>
									<h1 className="text-2xl font-bold text-gray-900">
										{profileData.firstName} {profileData.lastName}
									</h1>
									<p className="text-gray-600">{roleContent.title}</p>
									<p className="text-gray-500">{profileData.currentPosition}</p>
								</div>
								<div className="flex items-center space-x-2">
									{!isEditing ? (
										<button
											onClick={handleEdit}
											className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
										>
											<Edit3 className="w-4 h-4 mr-2" />
											Edit Profile
										</button>
									) : (
										<>
											<button
												onClick={handleCancel}
												className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center"
											>
												<X className="w-4 h-4 mr-2" />
												Cancel
											</button>
											<button
												onClick={handleSave}
												className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
											>
												<Save className="w-4 h-4 mr-2" />
												Save Changes
											</button>
										</>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="bg-white rounded-lg shadow-md">
				<div className="border-b border-gray-200">
					<nav className="flex space-x-8 px-6">
						{[
							{ id: "personal", label: "Personal Info", icon: User },
							{ id: "professional", label: "Professional", icon: Briefcase },
							{ id: "education", label: "Education", icon: GraduationCap },
							{ id: "settings", label: "Settings", icon: Settings },
						].map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
									activeTab === tab.id
										? "border-blue-500 text-blue-600"
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								}`}
							>
								<tab.icon className="w-4 h-4 mr-2" />
								{tab.label}
							</button>
						))}
					</nav>
				</div>

				<div className="p-6">
					{/* Personal Information Tab */}
					{activeTab === "personal" && (
						<div className="space-y-6">
							<h2 className="text-lg font-semibold text-gray-900">
								Personal Information
							</h2>

							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										First Name
									</label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
										<input
											type="text"
											value={
												isEditing
													? tempProfileData.firstName
													: profileData.firstName
											}
											onChange={(e) =>
												handleDirectChange("firstName", e.target.value)
											}
											disabled={!isEditing}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Last Name
									</label>
									<div className="relative">
										<User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
										<input
											type="text"
											value={
												isEditing
													? tempProfileData.lastName
													: profileData.lastName
											}
											onChange={(e) =>
												handleDirectChange("lastName", e.target.value)
											}
											disabled={!isEditing}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Email
									</label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
										<input
											type="email"
											value={
												isEditing ? tempProfileData.email : profileData.email
											}
											onChange={(e) =>
												handleDirectChange("email", e.target.value)
											}
											disabled={!isEditing}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Phone
									</label>
									<div className="relative">
										<Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
										<input
											type="tel"
											value={
												isEditing ? tempProfileData.phone : profileData.phone
											}
											onChange={(e) =>
												handleDirectChange("phone", e.target.value)
											}
											disabled={!isEditing}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Date of Birth
									</label>
									<div className="relative">
										<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
										<input
											type="date"
											value={
												isEditing
													? tempProfileData.dateOfBirth
													: profileData.dateOfBirth
											}
											onChange={(e) =>
												handleDirectChange("dateOfBirth", e.target.value)
											}
											disabled={!isEditing}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Location
									</label>
									<div className="relative">
										<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
										<input
											type="text"
											value={
												isEditing
													? tempProfileData.location
													: profileData.location
											}
											onChange={(e) =>
												handleDirectChange("location", e.target.value)
											}
											disabled={!isEditing}
											className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
										/>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Bio
								</label>
								<textarea
									value={isEditing ? tempProfileData.bio : profileData.bio}
									onChange={(e) => handleDirectChange("bio", e.target.value)}
									disabled={!isEditing}
									rows={4}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
									placeholder="Tell us about yourself..."
								/>
							</div>
						</div>
					)}

					{/* Professional Information Tab */}
					{activeTab === "professional" && (
						<div className="space-y-6">
							<h2 className="text-lg font-semibold text-gray-900">
								Professional Information
							</h2>

							<div className="grid md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Current Position
									</label>
									<input
										type="text"
										value={
											isEditing
												? tempProfileData.currentPosition
												: profileData.currentPosition
										}
										onChange={(e) =>
											handleDirectChange("currentPosition", e.target.value)
										}
										disabled={!isEditing}
										className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Company
									</label>
									<input
										type="text"
										value={
											isEditing ? tempProfileData.company : profileData.company
										}
										onChange={(e) =>
											handleDirectChange("company", e.target.value)
										}
										disabled={!isEditing}
										className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Experience
								</label>
								<textarea
									value={
										isEditing
											? tempProfileData.experience
											: profileData.experience
									}
									onChange={(e) =>
										handleDirectChange("experience", e.target.value)
									}
									disabled={!isEditing}
									rows={4}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
									placeholder="Describe your professional experience..."
								/>
							</div>

							{/* Skills Section */}
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Skills
								</label>
								<div className="space-y-2">
									<div className="flex flex-wrap gap-2">
										{(isEditing
											? tempProfileData.skills
											: profileData.skills
										).map((skill, index) => (
											<span
												key={index}
												className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
											>
												{skill}
												{isEditing && (
													<button
														onClick={() => removeSkill(skill)}
														className="ml-2 text-blue-600 hover:text-blue-800"
													>
														<X className="w-3 h-3" />
													</button>
												)}
											</span>
										))}
									</div>
									{isEditing && (
										<div className="flex items-center space-x-2">
											<input
												type="text"
												placeholder="Add a skill"
												className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												onKeyPress={(e) => {
													if (e.key === "Enter") {
														addSkill(e.target.value);
														e.target.value = "";
													}
												}}
											/>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Education Tab */}
					{activeTab === "education" && (
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h2 className="text-lg font-semibold text-gray-900">
									Education & Certifications
								</h2>
								{isEditing && (
									<button
										onClick={addEducation}
										className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
									>
										Add Education
									</button>
								)}
							</div>

							<div className="space-y-4">
								{(isEditing
									? tempProfileData.education
									: profileData.education
								).map((edu, index) => (
									<div
										key={edu.id || index}
										className="border border-gray-200 rounded-lg p-4"
									>
										<div className="grid md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Degree
												</label>
												<input
													type="text"
													value={edu.degree || ""}
													onChange={(e) =>
														updateEducation(edu.id, "degree", e.target.value)
													}
													disabled={!isEditing}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Institution
												</label>
												<input
													type="text"
													value={edu.institution || ""}
													onChange={(e) =>
														updateEducation(
															edu.id,
															"institution",
															e.target.value
														)
													}
													disabled={!isEditing}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Year
												</label>
												<input
													type="text"
													value={edu.year || ""}
													onChange={(e) =>
														updateEducation(edu.id, "year", e.target.value)
													}
													disabled={!isEditing}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													GPA/Grade
												</label>
												<input
													type="text"
													value={edu.gpa || ""}
													onChange={(e) =>
														updateEducation(edu.id, "gpa", e.target.value)
													}
													disabled={!isEditing}
													className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
												/>
											</div>
										</div>
										{isEditing && (
											<div className="mt-3 flex justify-end">
												<button
													onClick={() => removeEducation(edu.id)}
													className="text-red-600 hover:text-red-800"
												>
													<X className="w-4 h-4" />
												</button>
											</div>
										)}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Settings Tab */}
					{activeTab === "settings" && (
						<div className="space-y-6">
							<h2 className="text-lg font-semibold text-gray-900">
								Account Settings
							</h2>

							{/* Notification Settings */}
							<div className="bg-gray-50 rounded-lg p-4">
								<h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
									<Bell className="w-4 h-4 mr-2" />
									Notification Preferences
								</h3>
								<div className="space-y-3">
									{Object.entries(tempProfileData.notifications).map(
										([key, value]) => (
											<div
												key={key}
												className="flex items-center justify-between"
											>
												<span className="text-gray-700 capitalize">
													{key} Notifications
												</span>
												<label className="relative inline-flex items-center cursor-pointer">
													<input
														type="checkbox"
														checked={value}
														onChange={(e) =>
															handleInputChange(
																"notifications",
																key,
																e.target.checked
															)
														}
														disabled={!isEditing}
														className="sr-only"
													/>
													<div
														className={`w-11 h-6 rounded-full ${
															value ? "bg-blue-600" : "bg-gray-300"
														} ${!isEditing ? "opacity-50" : ""}`}
													>
														<div
															className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
																value ? "translate-x-6" : "translate-x-0.5"
															} mt-0.5`}
														></div>
													</div>
												</label>
											</div>
										)
									)}
								</div>
							</div>

							{/* Privacy Settings */}
							<div className="bg-gray-50 rounded-lg p-4">
								<h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
									<Shield className="w-4 h-4 mr-2" />
									Privacy Settings
								</h3>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Profile Visibility
										</label>
										<select
											value={tempProfileData.privacy.profileVisibility}
											onChange={(e) =>
												handleInputChange(
													"privacy",
													"profileVisibility",
													e.target.value
												)
											}
											disabled={!isEditing}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
										>
											<option value="public">Public</option>
											<option value="private">Private</option>
											<option value="connections">Connections Only</option>
										</select>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Contact Information
										</label>
										<select
											value={tempProfileData.privacy.contactInfo}
											onChange={(e) =>
												handleInputChange(
													"privacy",
													"contactInfo",
													e.target.value
												)
											}
											disabled={!isEditing}
											className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
										>
											<option value="public">Public</option>
											<option value="private">Private</option>
											<option value="verified">Verified Contacts Only</option>
										</select>
									</div>
								</div>
							</div>

							{/* Security Settings */}
							<div className="bg-gray-50 rounded-lg p-4">
								<h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
									<Lock className="w-4 h-4 mr-2" />
									Security
								</h3>
								<div className="space-y-4">
									<button className="w-full text-left p-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-between">
										<span>Change Password</span>
										<div className="flex items-center">
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="text-gray-400 hover:text-gray-600"
											>
												{showPassword ? (
													<EyeOff className="w-4 h-4" />
												) : (
													<Eye className="w-4 h-4" />
												)}
											</button>
										</div>
									</button>
									<button className="w-full text-left p-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
										Two-Factor Authentication
									</button>
									<button className="w-full text-left p-3 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
										Login History
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default UserProfile;
