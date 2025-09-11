import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, User, Building2, Settings } from "lucide-react";
import toast from "react-hot-toast";

const Signup = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "candidate",
		companyName: "",
		phone: "",
		location: "",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [agreedToTerms, setAgreedToTerms] = useState(false);

	const { signup } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (!agreedToTerms) {
			toast.error("Please agree to the terms and conditions");
			return;
		}

		setLoading(true);

		try {
			const userData = {
				name: formData.name,
				email: formData.email,
				password: formData.password,
				role: formData.role,
				...(formData.role === "company" && {
					companyName: formData.companyName,
				}),
				phone: formData.phone,
				location: formData.location,
			};

			const result = await signup(userData);
			if (result.success) {
				toast.success("Account created successfully!");
				// Navigate to appropriate dashboard
				const dashboardPath =
					formData.role === "candidate"
						? "/candidate/dashboard"
						: formData.role === "company"
						? "/company/dashboard"
						: "/admin/dashboard";
				navigate(dashboardPath);
			}
		} catch (error) {
			toast.error("Signup failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const roleOptions = [
		{
			value: "candidate",
			label: "Candidate",
			icon: <User className="w-5 h-5" />,
		},
		{
			value: "company",
			label: "Company",
			icon: <Building2 className="w-5 h-5" />,
		},
		{
			value: "admin",
			label: "Administrator",
			icon: <Settings className="w-5 h-5" />,
		},
	];

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="flex justify-center">
					<div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
						<span className="text-white font-bold text-xl">PM</span>
					</div>
				</div>
				<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
					Create your account
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Or{" "}
					<Link
						to="/login"
						className="font-medium text-primary hover:text-blue-700"
					>
						sign in to your existing account
					</Link>
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					<form className="space-y-6" onSubmit={handleSubmit}>
						{/* Role Selection */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								I am a
							</label>
							<div className="grid grid-cols-3 gap-3">
								{roleOptions.map((option) => (
									<label
										key={option.value}
										className={`relative flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${
											formData.role === option.value
												? "border-primary bg-primary/5"
												: "border-gray-300 hover:border-gray-400"
										}`}
									>
										<input
											type="radio"
											name="role"
											value={option.value}
											checked={formData.role === option.value}
											onChange={handleChange}
											className="sr-only"
										/>
										<div
											className={`mb-2 ${
												formData.role === option.value
													? "text-primary"
													: "text-gray-400"
											}`}
										>
											{option.icon}
										</div>
										<span
											className={`text-sm font-medium ${
												formData.role === option.value
													? "text-primary"
													: "text-gray-700"
											}`}
										>
											{option.label}
										</span>
									</label>
								))}
							</div>
						</div>

						{/* Name */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700"
							>
								{formData.role === "company" ? "Company Name" : "Full Name"}
							</label>
							<div className="mt-1">
								<input
									id="name"
									name="name"
									type="text"
									required
									value={formData.name}
									onChange={handleChange}
									className="input-field"
									placeholder={
										formData.role === "company"
											? "Enter company name"
											: "Enter your full name"
									}
								/>
							</div>
						</div>

						{/* Email */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email address
							</label>
							<div className="mt-1">
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									required
									value={formData.email}
									onChange={handleChange}
									className="input-field"
									placeholder="Enter your email"
								/>
							</div>
						</div>

						{/* Phone */}
						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-gray-700"
							>
								Phone Number
							</label>
							<div className="mt-1">
								<input
									id="phone"
									name="phone"
									type="tel"
									required
									value={formData.phone}
									onChange={handleChange}
									className="input-field"
									placeholder="Enter your phone number"
								/>
							</div>
						</div>

						{/* Location */}
						<div>
							<label
								htmlFor="location"
								className="block text-sm font-medium text-gray-700"
							>
								Location
							</label>
							<div className="mt-1">
								<input
									id="location"
									name="location"
									type="text"
									required
									value={formData.location}
									onChange={handleChange}
									className="input-field"
									placeholder="Enter your location"
								/>
							</div>
						</div>

						{/* Password */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<div className="mt-1 relative">
								<input
									id="password"
									name="password"
									type={showPassword ? "text" : "password"}
									autoComplete="new-password"
									required
									value={formData.password}
									onChange={handleChange}
									className="input-field pr-10"
									placeholder="Create a password"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() => setShowPassword(!showPassword)}
								>
									{showPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						{/* Confirm Password */}
						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700"
							>
								Confirm Password
							</label>
							<div className="mt-1 relative">
								<input
									id="confirmPassword"
									name="confirmPassword"
									type={showConfirmPassword ? "text" : "password"}
									autoComplete="new-password"
									required
									value={formData.confirmPassword}
									onChange={handleChange}
									className="input-field pr-10"
									placeholder="Confirm your password"
								/>
								<button
									type="button"
									className="absolute inset-y-0 right-0 pr-3 flex items-center"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								>
									{showConfirmPassword ? (
										<EyeOff className="h-5 w-5 text-gray-400" />
									) : (
										<Eye className="h-5 w-5 text-gray-400" />
									)}
								</button>
							</div>
						</div>

						{/* Terms and Conditions */}
						<div className="flex items-center">
							<input
								id="terms"
								name="terms"
								type="checkbox"
								checked={agreedToTerms}
								onChange={(e) => setAgreedToTerms(e.target.checked)}
								className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
							/>
							<label
								htmlFor="terms"
								className="ml-2 block text-sm text-gray-900"
							>
								I agree to the{" "}
								<a href="#" className="text-primary hover:text-blue-700">
									Terms and Conditions
								</a>{" "}
								and{" "}
								<a href="#" className="text-primary hover:text-blue-700">
									Privacy Policy
								</a>
							</label>
						</div>

						{/* Submit button */}
						<div>
							<button
								type="submit"
								disabled={loading || !agreedToTerms}
								className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Creating account..." : "Create account"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default Signup;
