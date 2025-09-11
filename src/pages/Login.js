import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, User, Building2, Settings } from "lucide-react";
import toast from "react-hot-toast";

const Login = () => {
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		role: "candidate",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			await login(formData.email, formData.password, formData.role);
			toast.success("Login successful!");

			// Navigate to appropriate dashboard
			const dashboardPath =
				formData.role === "candidate"
					? "/candidate/dashboard"
					: formData.role === "company"
					? "/company/dashboard"
					: "/admin/dashboard";
			navigate(dashboardPath);
		} catch (error) {
			console.error("Login error:", error);
			toast.error(
				error.response?.data?.detail || "Login failed. Please try again."
			);
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
						<span className="text-white font-bold text-xl">BI</span>
					</div>
				</div>
				<h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
					Sign in to your account
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					Or{" "}
					<Link
						to="/signup"
						className="font-medium text-primary hover:text-blue-700"
					>
						create a new account
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
									autoComplete="current-password"
									required
									value={formData.password}
									onChange={handleChange}
									className="input-field pr-10"
									placeholder="Enter your password"
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

						{/* Remember me & Forgot password */}
						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
								/>
								<label
									htmlFor="remember-me"
									className="ml-2 block text-sm text-gray-900"
								>
									Remember me
								</label>
							</div>

							<div className="text-sm">
								<button
									type="button"
									className="font-medium text-primary hover:text-blue-700 underline bg-transparent border-none cursor-pointer"
									onClick={() => {
										/* TODO: Implement forgot password */
									}}
								>
									Forgot your password?
								</button>
							</div>
						</div>

						{/* Submit button */}
						<div>
							<button
								type="submit"
								disabled={loading}
								className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? "Signing in..." : "Sign in"}
							</button>
						</div>
					</form>

					{/* Demo credentials */}
					<div className="mt-6 p-4 bg-gray-50 rounded-lg">
						<h3 className="text-sm font-medium text-gray-900 mb-2">
							Demo Credentials:
						</h3>
						<div className="text-xs text-gray-600 space-y-1">
							<div>
								<strong>Candidate:</strong> candidate@demo.com / password123
							</div>
							<div>
								<strong>Company:</strong> company@demo.com / password123
							</div>
							<div>
								<strong>Admin:</strong> admin@demo.com / password123
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
