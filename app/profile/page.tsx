"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../src/contexts/AuthContext";
import { motion } from "framer-motion";
import {
	User,
	Mail,
	Phone,
	MapPin,
	Calendar,
	BookOpen,
	Award,
	Upload,
	Edit,
	Save,
	X,
} from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
	const { user } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [profileData, setProfileData] = useState({
		name: "",
		email: "",
		phone: "",
		location: "",
		dateOfBirth: "",
		bio: "",
		education: "",
		skills: [] as string[],
		experience: "",
		portfolio: "",
		linkedIn: "",
		github: "",
	});

	useEffect(() => {
		// Load user profile data
		if (user) {
			setProfileData({
				name: user.name || "",
				email: user.email || "",
				phone: user.phone || "",
				location: user.location || "",
				dateOfBirth: user.dateOfBirth || "",
				bio: user.bio || "",
				education: user.education || "",
				skills: user.skills || [],
				experience: user.experience || "",
				portfolio: user.portfolio || "",
				linkedIn: user.linkedIn || "",
				github: user.github || "",
			});
		}
	}, [user]);

	const handleSave = async () => {
		try {
			// Here you would typically save to your backend/Supabase
			// For now, we'll just show a success message
			toast.success("Profile updated successfully!");
			setIsEditing(false);
		} catch (error) {
			toast.error("Failed to update profile");
		}
	};

	const handleSkillAdd = (skill: string) => {
		if (skill && !profileData.skills.includes(skill)) {
			setProfileData({
				...profileData,
				skills: [...profileData.skills, skill],
			});
		}
	};

	const handleSkillRemove = (skillToRemove: string) => {
		setProfileData({
			...profileData,
			skills: profileData.skills.filter((skill) => skill !== skillToRemove),
		});
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-sm mb-6">
					<div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
						<h1 className="text-2xl font-bold text-gray-900">Profile</h1>
						<div className="flex space-x-3">
							{isEditing ? (
								<>
									<button
										onClick={handleSave}
										className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
									>
										<Save className="w-4 h-4 mr-2" />
										Save Changes
									</button>
									<button
										onClick={() => setIsEditing(false)}
										className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
									>
										<X className="w-4 h-4 mr-2" />
										Cancel
									</button>
								</>
							) : (
								<button
									onClick={() => setIsEditing(true)}
									className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
								>
									<Edit className="w-4 h-4 mr-2" />
									Edit Profile
								</button>
							)}
						</div>
					</div>

					{/* Profile Content */}
					<div className="p-6">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
							{/* Profile Picture & Basic Info */}
							<div className="lg:col-span-1">
								<div className="text-center">
									<div className="relative inline-block">
										<div className="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
											<User className="w-16 h-16 text-white" />
										</div>
										{isEditing && (
											<button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-shadow">
												<Upload className="w-4 h-4 text-gray-600" />
											</button>
										)}
									</div>
									{isEditing ? (
										<input
											type="text"
											value={profileData.name}
											onChange={(e) =>
												setProfileData({ ...profileData, name: e.target.value })
											}
											className="text-center text-xl font-semibold text-gray-900 w-full border rounded-md px-3 py-2"
											placeholder="Your Name"
										/>
									) : (
										<h2 className="text-xl font-semibold text-gray-900">
											{profileData.name || "Your Name"}
										</h2>
									)}
									<p className="text-gray-600 mt-1">
										{user?.role || "Candidate"}
									</p>
								</div>
							</div>

							{/* Detailed Information */}
							<div className="lg:col-span-2 space-y-6">
								{/* Contact Information */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4">
										Contact Information
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="flex items-center space-x-3">
											<Mail className="w-5 h-5 text-gray-400" />
											{isEditing ? (
												<input
													type="email"
													value={profileData.email}
													onChange={(e) =>
														setProfileData({
															...profileData,
															email: e.target.value,
														})
													}
													className="flex-1 border rounded-md px-3 py-2"
													placeholder="Email"
												/>
											) : (
												<span className="text-gray-700">
													{profileData.email || "Not provided"}
												</span>
											)}
										</div>
										<div className="flex items-center space-x-3">
											<Phone className="w-5 h-5 text-gray-400" />
											{isEditing ? (
												<input
													type="tel"
													value={profileData.phone}
													onChange={(e) =>
														setProfileData({
															...profileData,
															phone: e.target.value,
														})
													}
													className="flex-1 border rounded-md px-3 py-2"
													placeholder="Phone"
												/>
											) : (
												<span className="text-gray-700">
													{profileData.phone || "Not provided"}
												</span>
											)}
										</div>
										<div className="flex items-center space-x-3">
											<MapPin className="w-5 h-5 text-gray-400" />
											{isEditing ? (
												<input
													type="text"
													value={profileData.location}
													onChange={(e) =>
														setProfileData({
															...profileData,
															location: e.target.value,
														})
													}
													className="flex-1 border rounded-md px-3 py-2"
													placeholder="Location"
												/>
											) : (
												<span className="text-gray-700">
													{profileData.location || "Not provided"}
												</span>
											)}
										</div>
										<div className="flex items-center space-x-3">
											<Calendar className="w-5 h-5 text-gray-400" />
											{isEditing ? (
												<input
													type="date"
													value={profileData.dateOfBirth}
													onChange={(e) =>
														setProfileData({
															...profileData,
															dateOfBirth: e.target.value,
														})
													}
													className="flex-1 border rounded-md px-3 py-2"
												/>
											) : (
												<span className="text-gray-700">
													{profileData.dateOfBirth || "Not provided"}
												</span>
											)}
										</div>
									</div>
								</div>

								{/* Bio */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4">
										About Me
									</h3>
									{isEditing ? (
										<textarea
											value={profileData.bio}
											onChange={(e) =>
												setProfileData({ ...profileData, bio: e.target.value })
											}
											rows={4}
											className="w-full border rounded-md px-3 py-2"
											placeholder="Tell us about yourself..."
										/>
									) : (
										<p className="text-gray-700">
											{profileData.bio || "No bio provided yet."}
										</p>
									)}
								</div>

								{/* Skills */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4">
										Skills
									</h3>
									<div className="flex flex-wrap gap-2 mb-3">
										{profileData.skills.map((skill, index) => (
											<span
												key={index}
												className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
											>
												{skill}
												{isEditing && (
													<button
														onClick={() => handleSkillRemove(skill)}
														className="ml-2 text-blue-600 hover:text-blue-800"
													>
														<X className="w-3 h-3" />
													</button>
												)}
											</span>
										))}
									</div>
									{isEditing && (
										<input
											type="text"
											placeholder="Add a skill and press Enter"
											className="w-full border rounded-md px-3 py-2"
											onKeyPress={(e) => {
												if (e.key === "Enter") {
													const target = e.target as HTMLInputElement;
													handleSkillAdd(target.value.trim());
													target.value = "";
												}
											}}
										/>
									)}
								</div>

								{/* Education */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4">
										Education
									</h3>
									{isEditing ? (
										<textarea
											value={profileData.education}
											onChange={(e) =>
												setProfileData({
													...profileData,
													education: e.target.value,
												})
											}
											rows={3}
											className="w-full border rounded-md px-3 py-2"
											placeholder="Your educational background..."
										/>
									) : (
										<p className="text-gray-700">
											{profileData.education ||
												"No education details provided."}
										</p>
									)}
								</div>

								{/* Links */}
								<div>
									<h3 className="text-lg font-semibold text-gray-900 mb-4">
										Links
									</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Portfolio
											</label>
											{isEditing ? (
												<input
													type="url"
													value={profileData.portfolio}
													onChange={(e) =>
														setProfileData({
															...profileData,
															portfolio: e.target.value,
														})
													}
													className="w-full border rounded-md px-3 py-2"
													placeholder="https://yourportfolio.com"
												/>
											) : (
												<p className="text-gray-700">
													{profileData.portfolio ? (
														<a
															href={profileData.portfolio}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-600 hover:underline"
														>
															{profileData.portfolio}
														</a>
													) : (
														"Not provided"
													)}
												</p>
											)}
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												LinkedIn
											</label>
											{isEditing ? (
												<input
													type="url"
													value={profileData.linkedIn}
													onChange={(e) =>
														setProfileData({
															...profileData,
															linkedIn: e.target.value,
														})
													}
													className="w-full border rounded-md px-3 py-2"
													placeholder="https://linkedin.com/in/yourprofile"
												/>
											) : (
												<p className="text-gray-700">
													{profileData.linkedIn ? (
														<a
															href={profileData.linkedIn}
															target="_blank"
															rel="noopener noreferrer"
															className="text-blue-600 hover:underline"
														>
															{profileData.linkedIn}
														</a>
													) : (
														"Not provided"
													)}
												</p>
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
