import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { 
	Eye, EyeOff, User, Building2, Settings, 
	Shield, Smartphone, Mail, Key, 
	Fingerprint, QrCode, ArrowLeft,
	CheckCircle, AlertTriangle, Clock
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
	// Authentication States
	const [currentStep, setCurrentStep] = useState('login'); // login, mfa, security-questions
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		role: "candidate",
	});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	// MFA States
	const [mfaData, setMfaData] = useState({
		otpMethod: 'sms', // sms, email, app
		otp: '',
		biometricEnabled: false,
		securityQuestions: []
	});
	const [otpTimer, setOtpTimer] = useState(0);
	const [canResendOtp, setCanResendOtp] = useState(false);

	// Password Recovery States
	const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
	const [recoveryStep, setRecoveryStep] = useState('email'); // email, security-questions, reset

	const { login, resetPassword, signInWithGoogle } = useAuth();
	const navigate = useNavigate();

	// Timer for OTP
	useEffect(() => {
		let interval;
		if (otpTimer > 0) {
			interval = setInterval(() => {
				setOtpTimer(prev => {
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
			const authResult = await login(formData.email, formData.password, formData.role);
			
			// Check if MFA is required
			if (authResult.requiresMFA) {
				setCurrentStep('mfa');
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
			await new Promise(resolve => setTimeout(resolve, 1000));
			
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
			await new Promise(resolve => setTimeout(resolve, 1000));
			
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
			await new Promise(resolve => setTimeout(resolve, 2000));
			
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
		navigate(dashboardPath);
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
			setRecoveryStep('security-questions');
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
			description: "Send code to your mobile number"
		},
		{
			value: "email",
			label: "Email",
			icon: <Mail className="w-5 h-5" />,
			description: "Send code to your email address"
		},
		{
			value: "app",
			label: "Authenticator App",
			icon: <QrCode className="w-5 h-5" />,
			description: "Use your authenticator app"
		}
	];

	const securityQuestions = [
		"What was the name of your first pet?",
		"In which city were you born?",
		"What is your mother's maiden name?",
		"What was your first school's name?",
		"What is your favorite book?"
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
						href="/signup"
						className="font-medium text-primary hover:text-blue-700"
					>
						create a new account
					</Link>
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{/* Google Sign In Button */}
					<div className="mb-6">
						<button
							type="button"
							onClick={() => signInWithGoogle(formData.role)}
							disabled={loading}
							className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
						>
							<img
								src="https://www.google.com/favicon.ico"
								alt="Google"
								className="w-5 h-5 mr-2"
							/>
							Sign in with Google
						</button>
					</div>

					<div className="relative mb-6">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white text-gray-500">Or continue with</span>
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
										className={`relative flex flex-col items-center p-3 border rounded-lg cursor-pointer transition-colors ${formData.role === option.value
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
											className={`mb-2 ${formData.role === option.value
													? "text-primary"
													: "text-gray-400"
												}`}
										>
											{option.icon}
										</div>
										<span
											className={`text-sm font-medium ${formData.role === option.value
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
									onClick={async () => {
										if (!formData.email) {
											toast.error("Please enter your email address first");
											return;
										}

										try {
											await resetPassword(formData.email);
											toast.success("Password reset email sent! Check your inbox.");
										} catch (error) {
											toast.error(error.message || "Failed to send reset email");
										}
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

				</div>
			</div>
		</div>
	);
};

export default Login;
