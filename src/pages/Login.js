"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import {
	Eye,
	EyeOff,
	User,
	Building2,
	Settings,
	Shield,
	Smartphone,
	Mail,
	Key,
	Fingerprint,
	QrCode,
	ArrowLeft,
	CheckCircle,
	AlertTriangle,
	Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
	// Authentication States
	const [currentStep, setCurrentStep] = useState("login"); // login, mfa, security-questions
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		role: "candidate",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	// MFA States
	const [mfaData, setMfaData] = useState({
		otpMethod: "sms", // sms, email, app
		otp: "",
		biometricEnabled: false,
		securityQuestions: [],
	});
	const [otpTimer, setOtpTimer] = useState(0);
	const [canResendOtp, setCanResendOtp] = useState(false);

	// Password Recovery States
	const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
	const [recoveryStep, setRecoveryStep] = useState("email"); // email, security-questions, reset

	const { login, resetPassword, signInWithGoogle } = useAuth();
	const router = useRouter();

	// Timer for OTP
	useEffect(() => {
		let interval;
		if (otpTimer > 0) {
			interval = setInterval(() => {
				setOtpTimer((prev) => {
					if (prev <= 1) {
						setCanResendOtp(true);
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}
		return () => clearInterval(interval);
	}, [otpTimer]);

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	// Enhanced login with MFA
	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			// First authentication step
			const authResult = await login(
				formData.email,
				formData.password,
				formData.role
			);

			// Check if MFA is required
			if (authResult?.requiresMFA) {
				setCurrentStep("mfa");
				await sendMFACode();
				toast.success("Login successful! Please complete verification.");
			} else {
				// Direct login success
				toast.success("Login successful!");
				navigateToDashboard();
			}
		} catch (error) {
			console.error("Login error:", error);
			toast.error(error.message || "Login failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// MFA Functions
	const sendMFACode = async () => {
		try {
			setLoading(true);
			// Simulate MFA code sending
			await new Promise((resolve) => setTimeout(resolve, 1000));

			setOtpTimer(60);
			setCanResendOtp(false);
			toast.success(`Verification code sent via ${mfaData.otpMethod}`);
		} catch (error) {
			toast.error("Failed to send verification code");
		} finally {
			setLoading(false);
		}
	};

	const verifyMFA = async () => {
		if (!mfaData.otp || mfaData.otp.length !== 6) {
			toast.error("Please enter a valid 6-digit code");
			return;
		}

		try {
			setLoading(true);
			// Simulate MFA verification
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success("Verification successful!");
			navigateToDashboard();
		} catch (error) {
			toast.error("Invalid verification code");
		} finally {
			setLoading(false);
		}
	};

	const handleBiometricAuth = async () => {
		try {
			setLoading(true);
			// Simulate biometric authentication
			await new Promise((resolve) => setTimeout(resolve, 2000));

			toast.success("Biometric authentication successful!");
			navigateToDashboard();
		} catch (error) {
			toast.error("Biometric authentication failed");
		} finally {
			setLoading(false);
		}
	};

	const navigateToDashboard = () => {
		const dashboardPath =
			formData.role === "candidate"
				? "/candidate/dashboard"
				: formData.role === "company"
				? "/company/dashboard"
				: "/admin/dashboard";
		router.push(dashboardPath);
	};

	// Social Login
	const handleGoogleLogin = async () => {
		try {
			setLoading(true);
			await signInWithGoogle();
			toast.success("Google login successful!");
			navigateToDashboard();
		} catch (error) {
			toast.error("Google login failed");
		} finally {
			setLoading(false);
		}
	};

	// Password Recovery
	const handleForgotPassword = async () => {
		if (!formData.email) {
			toast.error("Please enter your email address");
			return;
		}

		try {
			setLoading(true);
			await resetPassword(formData.email);
			setForgotPasswordMode(true);
			setRecoveryStep("security-questions");
			toast.success("Password reset instructions sent to your email");
		} catch (error) {
			toast.error("Failed to send password reset email");
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

	const mfaOptions = [
		{
			value: "sms",
			label: "SMS",
			icon: <Smartphone className="w-5 h-5" />,
			description: "Send code to your mobile number",
		},
		{
			value: "email",
			label: "Email",
			icon: <Mail className="w-5 h-5" />,
			description: "Send code to your email address",
		},
		{
			value: "app",
			label: "Authenticator App",
			icon: <QrCode className="w-5 h-5" />,
			description: "Use your authenticator app",
		},
	];

	const securityQuestions = [
		"What was the name of your first pet?",
		"In which city were you born?",
		"What is your mother's maiden name?",
		"What was your first school's name?",
		"What is your favorite book?",
	];

	// Render different steps based on authentication flow
	const renderLoginStep = () => (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="space-y-6"
		>
			{/* Social Login Options */}
			<div className="space-y-3">
				<button
					type="button"
					onClick={handleGoogleLogin}
					disabled={loading}
					className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
				>
					<img
						src="https://www.google.com/favicon.ico"
						alt="Google"
						className="w-5 h-5 mr-3"
					/>
					Continue with Google
				</button>
			</div>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-gray-300"></div>
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="px-2 bg-white text-gray-500">
						Or continue with email
					</span>
				</div>
			</div>

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
								className={`relative flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
									formData.role === option.value
										? "border-primary bg-primary/5 ring-2 ring-primary/20"
										: "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
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
								{option.icon}
								<span className="mt-1 text-xs font-medium text-gray-700">
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
							className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
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
							className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-all"
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

				{/* Remember me and Forgot password */}
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
							className="font-medium text-primary hover:text-blue-700"
							onClick={handleForgotPassword}
						>
							Forgot password?
						</button>
					</div>
				</div>

				{/* Submit Button */}
				<div>
					<button
						type="submit"
						disabled={loading}
						className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{loading ? (
							<div className="flex items-center">
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Signing in...
							</div>
						) : (
							"Sign in"
						)}
					</button>
				</div>
			</form>
		</motion.div>
	);

	const renderMFAStep = () => (
		<motion.div
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			className="space-y-6"
		>
			{/* Back Button */}
			<button
				onClick={() => setCurrentStep("login")}
				className="flex items-center text-sm text-gray-600 hover:text-gray-900"
			>
				<ArrowLeft className="w-4 h-4 mr-1" />
				Back to login
			</button>

			<div className="text-center">
				<Shield className="mx-auto h-12 w-12 text-primary" />
				<h3 className="mt-4 text-lg font-semibold text-gray-900">
					Two-Factor Authentication
				</h3>
				<p className="mt-2 text-sm text-gray-600">
					Choose your preferred verification method
				</p>
			</div>

			{/* MFA Method Selection */}
			<div className="space-y-3">
				{mfaOptions.map((option) => (
					<label
						key={option.value}
						className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
							mfaData.otpMethod === option.value
								? "border-primary bg-primary/5 ring-2 ring-primary/20"
								: "border-gray-300 hover:border-gray-400"
						}`}
					>
						<input
							type="radio"
							name="otpMethod"
							value={option.value}
							checked={mfaData.otpMethod === option.value}
							onChange={(e) =>
								setMfaData({ ...mfaData, otpMethod: e.target.value })
							}
							className="sr-only"
						/>
						{option.icon}
						<div className="ml-3">
							<div className="text-sm font-medium text-gray-900">
								{option.label}
							</div>
							<div className="text-xs text-gray-500">{option.description}</div>
						</div>
					</label>
				))}
			</div>

			{/* Biometric Option */}
			<div className="border-t pt-4">
				<button
					onClick={handleBiometricAuth}
					disabled={loading}
					className="w-full flex items-center justify-center p-4 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
				>
					<Fingerprint className="w-6 h-6 text-gray-500 mr-3" />
					<div className="text-left">
						<div className="text-sm font-medium text-gray-900">
							Biometric Authentication
						</div>
						<div className="text-xs text-gray-500">
							Use fingerprint or face recognition
						</div>
					</div>
				</button>
			</div>

			{/* OTP Input Section */}
			{otpTimer > 0 && (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					className="space-y-4"
				>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Verification Code
						</label>
						<input
							type="text"
							value={mfaData.otp}
							onChange={(e) =>
								setMfaData({
									...mfaData,
									otp: e.target.value.replace(/\D/g, "").slice(0, 6),
								})
							}
							placeholder="Enter 6-digit code"
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
							maxLength={6}
						/>
					</div>

					<div className="flex items-center justify-between text-sm">
						<div className="flex items-center text-gray-600">
							<Clock className="w-4 h-4 mr-1" />
							{Math.floor(otpTimer / 60)}:
							{(otpTimer % 60).toString().padStart(2, "0")}
						</div>
						{canResendOtp && (
							<button
								onClick={sendMFACode}
								className="text-primary hover:text-blue-700 font-medium"
							>
								Resend code
							</button>
						)}
					</div>

					<button
						onClick={verifyMFA}
						disabled={loading || mfaData.otp.length !== 6}
						className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{loading ? "Verifying..." : "Verify Code"}
					</button>
				</motion.div>
			)}

			{/* Send Code Button */}
			{otpTimer === 0 && (
				<button
					onClick={sendMFACode}
					disabled={loading}
					className="w-full py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					{loading
						? "Sending..."
						: `Send code via ${mfaData.otpMethod.toUpperCase()}`}
				</button>
			)}
		</motion.div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="flex justify-center">
					<div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
						<span className="text-white font-bold text-xl">BI</span>
					</div>
				</div>

				<div className="mt-6 text-center">
					<h2 className="text-3xl font-bold text-gray-900">
						{currentStep === "login"
							? "Welcome back!"
							: "Secure Authentication"}
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						{currentStep === "login" ? (
							<>
								Don't have an account?{" "}
								<Link
									href="/signup"
									className="font-medium text-primary hover:text-blue-700"
								>
									Sign up here
								</Link>
							</>
						) : (
							"Complete verification to access your account"
						)}
					</p>
				</div>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow-xl sm:rounded-xl sm:px-10 border border-gray-200">
					<AnimatePresence mode="wait">
						{currentStep === "login" && (
							<motion.div key="login">{renderLoginStep()}</motion.div>
						)}
						{currentStep === "mfa" && (
							<motion.div key="mfa">{renderMFAStep()}</motion.div>
						)}
					</AnimatePresence>
				</div>

				{/* Security Badge */}
				<div className="mt-6 text-center">
					<div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
						<CheckCircle className="w-3 h-3 mr-1" />
						256-bit SSL encryption
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
