import React, { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";
import { useDropzone } from "react-dropzone";
import { useAuth } from "../contexts/AuthContext";
import {
	Eye,
	EyeOff,
	User,
	Building2,
	Settings,
	Camera,
	Upload,
	FileText,
	CheckCircle,
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	Shield,
	Smartphone,
	GraduationCap,
	MapPin,
	Phone,
	Mail,
	Calendar,
	CreditCard,
	Users,
	Award,
	BookOpen,
	Briefcase,
	Globe,
	Star,
} from "lucide-react";
import toast from "react-hot-toast";

const Signup = () => {
	// Multi-step form state
	const [currentStep, setCurrentStep] = useState(1);
	const [completedSteps, setCompletedSteps] = useState([]);
	const totalSteps = 5;

	// Form data with enhanced fields
	const [formData, setFormData] = useState({
		// Basic Info (Step 1)
		role: "candidate",
		name: "",
		email: "",
		phone: "",
		dateOfBirth: "",
		gender: "",

		// Address & Location (Step 2)
		address: "",
		city: "",
		state: "",
		pincode: "",
		country: "India",

		// Educational/Professional Info (Step 3)
		// For Students
		collegeName: "",
		collegeCode: "", // AICTE code
		course: "",
		branch: "",
		semester: "",
		cgpa: "",
		passingYear: "",

		// For Companies
		companyName: "",
		companyType: "",
		industry: "",
		companySize: "",
		website: "",
		gstNumber: "",

		// Security & Verification (Step 4)
		password: "",
		confirmPassword: "",
		aadhaarNumber: "",
		otpMethod: "email", // email or sms

		// Documents & Profile (Step 5)
		profilePhoto: null,
		resume: null,
		aadhaarDocument: null,
		certificates: [],

		// Preferences
		preferredLocations: [],
		skills: [],
		interests: [],

		// Agreements
		agreedToTerms: false,
		agreedToPrivacy: false,
		allowMarketing: false,
	});

	// UI States
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [verificationStep, setVerificationStep] = useState("");
	const [otpCode, setOtpCode] = useState("");
	const [showWebcam, setShowWebcam] = useState(false);
	const [capturedImage, setCapturedImage] = useState(null);
	const [documentAnalysis, setDocumentAnalysis] = useState({});
	const [skillSuggestions, setSkillSuggestions] = useState([]);
	const [collegeVerified, setCollegeVerified] = useState(false);
	const [aadhaarVerified, setAadhaarVerified] = useState(false);

	// Refs
	const webcamRef = useRef(null);
	const fileInputRef = useRef(null);

	const { signup } = useAuth();
	const navigate = useNavigate();

	// Enhanced form handlers
	const handleChange = (e) => {
		const { name, value, type, checked, files } = e.target;
		if (type === "checkbox") {
			setFormData((prev) => ({ ...prev, [name]: checked }));
		} else if (type === "file") {
			setFormData((prev) => ({ ...prev, [name]: files[0] }));
			if (name === "resume" && files[0]) {
				analyzeDocument(files[0], "resume");
			}
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));

			// Trigger real-time validations
			if (name === "collegeCode" && value.length >= 6) {
				verifyAICTECode(value);
			} else if (name === "aadhaarNumber" && value.length === 12) {
				validateAadhaar(value);
			} else if (name === "email") {
				validateEmail(value);
			}
		}
	};

	// AICTE College Verification
	const verifyAICTECode = async (code) => {
		try {
			// Simulate AICTE API call
			const mockColleges = {
				AICTE123: { name: "IIT Delhi", verified: true },
				AICTE456: { name: "NIT Trichy", verified: true },
				AICTE789: { name: "BITS Pilani", verified: true },
			};

			setTimeout(() => {
				if (mockColleges[code]) {
					setCollegeVerified(true);
					setFormData((prev) => ({
						...prev,
						collegeName: mockColleges[code].name,
					}));
					toast.success(`College verified: ${mockColleges[code].name}`);
				} else {
					setCollegeVerified(false);
					toast.error("Invalid AICTE code. Please check and try again.");
				}
			}, 1000);
		} catch (error) {
			console.error("AICTE verification error:", error);
			toast.error("Unable to verify college code. Please try again.");
		}
	};

	// Aadhaar Validation
	const validateAadhaar = (number) => {
		// Basic Aadhaar validation (Verhoeff algorithm simulation)
		const isValid = /^[2-9]{1}[0-9]{11}$/.test(number);
		setAadhaarVerified(isValid);
		if (isValid) {
			toast.success("Aadhaar number format is valid");
		} else {
			toast.error("Invalid Aadhaar number format");
		}
	};

	// Email validation
	const validateEmail = (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	// Document Analysis (AI-powered)
	const analyzeDocument = async (file, type) => {
		if (!file) return;

		setLoading(true);
		try {
			// Simulate AI document analysis
			setTimeout(() => {
				if (type === "resume") {
					const mockAnalysis = {
						extractedSkills: [
							"JavaScript",
							"React",
							"Node.js",
							"Python",
							"SQL",
						],
						education: "B.Tech Computer Science",
						experience: "2 years",
						certifications: ["AWS Certified", "Google Analytics"],
					};

					setDocumentAnalysis((prev) => ({ ...prev, resume: mockAnalysis }));
					setSkillSuggestions(mockAnalysis.extractedSkills);
					setFormData((prev) => ({
						...prev,
						skills: [...prev.skills, ...mockAnalysis.extractedSkills],
					}));

					toast.success("Resume analyzed successfully! Skills extracted.");
				}
			}, 2000);
		} catch (error) {
			toast.error("Failed to analyze document. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Photo capture
	const capturePhoto = useCallback(() => {
		const imageSrc = webcamRef.current.getScreenshot();
		setCapturedImage(imageSrc);
		setFormData((prev) => ({ ...prev, profilePhoto: imageSrc }));
		setShowWebcam(false);
		toast.success("Photo captured successfully!");
	}, [webcamRef]);

	// File drop handlers
	const onDrop = useCallback((acceptedFiles, fileType) => {
		const file = acceptedFiles[0];
		if (file) {
			setFormData((prev) => ({ ...prev, [fileType]: file }));
			if (fileType === "resume") {
				analyzeDocument(file, "resume");
			}
			toast.success(`${fileType} uploaded successfully!`);
		}
	}, []);

	// OTP Verification
	const sendOTP = async () => {
		try {
			setVerificationStep("sending");
			// Simulate OTP sending
			setTimeout(() => {
				setVerificationStep("sent");
				toast.success(`OTP sent to your ${formData.otpMethod}`);
			}, 1500);
		} catch (error) {
			toast.error("Failed to send OTP. Please try again.");
			setVerificationStep("");
		}
	};

	const verifyOTP = async () => {
		try {
			if (otpCode === "123456") {
				// Mock OTP
				setVerificationStep("verified");
				toast.success("OTP verified successfully!");
				return true;
			} else {
				toast.error("Invalid OTP. Please try again.");
				return false;
			}
		} catch (error) {
			toast.error("OTP verification failed. Please try again.");
			return false;
		}
	};

	// Step Navigation
	const nextStep = (e) => {
		if (e) e.preventDefault();
		console.log("nextStep called, current step:", currentStep);
		if (validateCurrentStep()) {
			console.log("Validation passed, moving to next step");
			setCompletedSteps((prev) => [...prev, currentStep]);
			setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
		} else {
			console.log("Validation failed");
		}
	};

	const prevStep = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const goToStep = (step) => {
		if (completedSteps.includes(step - 1) || step <= currentStep) {
			setCurrentStep(step);
		}
	};

	// Step Validation
	const validateCurrentStep = () => {
		switch (currentStep) {
			case 1: // Basic Info
				if (
					!formData.role ||
					!formData.name ||
					!formData.email ||
					!formData.phone
				) {
					toast.error("Please fill all required fields");
					return false;
				}
				if (!validateEmail(formData.email)) {
					toast.error("Please enter a valid email address");
					return false;
				}
				return true;

			case 2: // Address
				if (
					!formData.address ||
					!formData.city ||
					!formData.state ||
					!formData.pincode
				) {
					toast.error("Please fill all address fields");
					return false;
				}
				return true;

			case 3: // Educational/Professional
				if (formData.role === "candidate") {
					if (!formData.collegeName || !formData.course || !formData.branch) {
						toast.error("Please fill all educational details");
						return false;
					}
					// Temporarily disable college verification for testing
					// if (!collegeVerified) {
					// 	toast.error("Please verify your college with a valid AICTE code");
					// 	return false;
					// }
				} else if (formData.role === "company") {
					if (
						!formData.companyName ||
						!formData.industry ||
						!formData.companySize
					) {
						toast.error("Please fill all company details");
						return false;
					}
				}
				return true;

			case 4: // Security
				if (!formData.password || !formData.confirmPassword) {
					toast.error("Please set a password");
					return false;
				}
				if (formData.password !== formData.confirmPassword) {
					toast.error("Passwords do not match");
					return false;
				}
				if (formData.password.length < 8) {
					toast.error("Password must be at least 8 characters long");
					return false;
				}
				// Temporarily disable OTP verification for testing
				// if (verificationStep !== "verified") {
				// 	toast.error("Please verify your email/phone with OTP");
				// 	return false;
				// }
				return true;

			case 5: // Documents & Final
				if (!formData.agreedToTerms || !formData.agreedToPrivacy) {
					toast.error("Please agree to Terms and Privacy Policy");
					return false;
				}
				return true;

			default:
				return true;
		}
	};

	// Final form submission
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateCurrentStep()) return;

		setLoading(true);

		try {
			const userData = {
				// Basic Info
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				role: formData.role,
				dateOfBirth: formData.dateOfBirth,
				gender: formData.gender,

				// Address
				address: formData.address,
				city: formData.city,
				state: formData.state,
				pincode: formData.pincode,
				country: formData.country,

				// Role-specific data
				...(formData.role === "candidate" && {
					collegeName: formData.collegeName,
					collegeCode: formData.collegeCode,
					course: formData.course,
					branch: formData.branch,
					semester: formData.semester,
					cgpa: formData.cgpa,
					passingYear: formData.passingYear,
					skills: formData.skills,
					interests: formData.interests,
				}),

				...(formData.role === "company" && {
					companyName: formData.companyName,
					companyType: formData.companyType,
					industry: formData.industry,
					companySize: formData.companySize,
					website: formData.website,
					gstNumber: formData.gstNumber,
				}),

				// Security
				password: formData.password,
				aadhaarNumber: formData.aadhaarNumber,

				// Documents (would be uploaded to cloud storage)
				profilePhoto: formData.profilePhoto,
				resume: formData.resume,

				// Preferences
				preferredLocations: formData.preferredLocations,
				allowMarketing: formData.allowMarketing,
			};

			const result = await signup(userData);
			toast.success(
				result.message ||
					"Account created successfully! Welcome to BharatIntern!"
			);

			// Navigate to appropriate dashboard
			const dashboardRoutes = {
				candidate: "/candidate/dashboard",
				company: "/company/dashboard",
				admin: "/admin/dashboard",
			};

			navigate(dashboardRoutes[formData.role] || "/login");
		} catch (error) {
			console.error("Signup error:", error);
			toast.error(error.message || "Signup failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Enhanced role options
	const roleOptions = [
		{
			value: "candidate",
			label: "Student/Graduate",
			description: "Looking for internship opportunities",
			icon: <GraduationCap className="w-6 h-6" />,
			color: "bg-blue-50 border-blue-200 text-blue-700",
		},
		{
			value: "company",
			label: "Company/Organization",
			description: "Offering internship positions",
			icon: <Building2 className="w-6 h-6" />,
			color: "bg-green-50 border-green-200 text-green-700",
		},
		{
			value: "institution",
			label: "Educational Institution",
			description: "Managing student placements",
			icon: <BookOpen className="w-6 h-6" />,
			color: "bg-purple-50 border-purple-200 text-purple-700",
		},
		{
			value: "admin",
			label: "Government Official",
			description: "Overseeing PM Internship Scheme",
			icon: <Shield className="w-6 h-6" />,
			color: "bg-orange-50 border-orange-200 text-orange-700",
		},
	];

	// Step configuration
	const steps = [
		{
			number: 1,
			title: "Basic Information",
			description: "Personal details and role selection",
			icon: <User className="w-5 h-5" />,
		},
		{
			number: 2,
			title: "Address & Location",
			description: "Contact information and address",
			icon: <MapPin className="w-5 h-5" />,
		},
		{
			number: 3,
			title: "Education/Professional",
			description: "Academic or company details",
			icon: <BookOpen className="w-5 h-5" />,
		},
		{
			number: 4,
			title: "Security & Verification",
			description: "Password and identity verification",
			icon: <Shield className="w-5 h-5" />,
		},
		{
			number: 5,
			title: "Documents & Profile",
			description: "Upload documents and complete profile",
			icon: <FileText className="w-5 h-5" />,
		},
	];

	// Progress Indicator Component
	const ProgressIndicator = () => (
		<div className="mb-8">
			<div className="flex items-center justify-between mb-4">
				{steps.map((step, index) => (
					<div key={step.number} className="flex flex-col items-center">
						<button
							onClick={() => goToStep(step.number)}
							disabled={
								!completedSteps.includes(step.number - 1) &&
								step.number > currentStep
							}
							className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
								step.number === currentStep
									? "bg-primary text-white scale-110"
									: completedSteps.includes(step.number)
									? "bg-green-500 text-white"
									: step.number < currentStep
									? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30"
									: "bg-gray-200 text-gray-400 cursor-not-allowed"
							}`}
						>
							{completedSteps.includes(step.number) ? (
								<CheckCircle className="w-5 h-5" />
							) : (
								step.icon
							)}
						</button>
						<div className="mt-2 text-center">
							<div
								className={`text-xs font-medium ${
									step.number === currentStep ? "text-primary" : "text-gray-500"
								}`}
							>
								{step.title}
							</div>
							<div className="text-xs text-gray-400 max-w-20 leading-tight">
								{step.description}
							</div>
						</div>
						{index < steps.length - 1 && (
							<div
								className={`absolute h-0.5 w-20 mt-5 ${
									completedSteps.includes(step.number)
										? "bg-green-500"
										: "bg-gray-200"
								}`}
								style={{ left: `${(index + 1) * 20}%` }}
							/>
						)}
					</div>
				))}
			</div>
			<div className="w-full bg-gray-200 rounded-full h-2">
				<div
					className="bg-primary h-2 rounded-full transition-all duration-500"
					style={{ width: `${(currentStep / totalSteps) * 100}%` }}
				/>
			</div>
		</div>
	);

	// Step 1: Basic Information Component
	const Step1BasicInfo = () => (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="space-y-6"
		>
			{/* Role Selection */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-4">
					I am registering as a
				</label>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{roleOptions.map((option) => (
						<label
							key={option.value}
							className={`relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
								formData.role === option.value
									? `${option.color} border-current shadow-md`
									: "border-gray-200 hover:border-gray-300 bg-white"
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
								className={`mr-4 p-2 rounded-lg ${
									formData.role === option.value ? "bg-white/20" : "bg-gray-100"
								}`}
							>
								{option.icon}
							</div>
							<div className="flex-1">
								<div className="font-semibold text-gray-900">
									{option.label}
								</div>
								<div className="text-sm text-gray-600">
									{option.description}
								</div>
							</div>
							{formData.role === option.value && (
								<CheckCircle className="w-5 h-5 text-current ml-2" />
							)}
						</label>
					))}
				</div>
			</div>

			{/* Basic Information */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label
						htmlFor="name"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						{formData.role === "company" ? "Company Name" : "Full Name"} *
					</label>
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

				<div>
					<label
						htmlFor="email"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Email Address *
					</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						value={formData.email}
						onChange={handleChange}
						className="input-field"
						placeholder="Enter your email address"
					/>
				</div>

				<div>
					<label
						htmlFor="phone"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Phone Number *
					</label>
					<input
						id="phone"
						name="phone"
						type="tel"
						required
						value={formData.phone}
						onChange={handleChange}
						className="input-field"
						placeholder="+91 9876543210"
					/>
				</div>

				<div>
					<label
						htmlFor="dateOfBirth"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Date of Birth
					</label>
					<input
						id="dateOfBirth"
						name="dateOfBirth"
						type="date"
						value={formData.dateOfBirth}
						onChange={handleChange}
						className="input-field"
					/>
				</div>
			</div>

			<div>
				<label
					htmlFor="gender"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					Gender
				</label>
				<select
					id="gender"
					name="gender"
					value={formData.gender}
					onChange={handleChange}
					className="input-field"
				>
					<option value="">Select Gender</option>
					<option value="male">Male</option>
					<option value="female">Female</option>
					<option value="other">Other</option>
					<option value="prefer-not-to-say">Prefer not to say</option>
				</select>
			</div>
		</motion.div>
	);

	// Step 2: Address & Location Component
	const Step2Address = () => (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="space-y-6"
		>
			<div className="text-center mb-6">
				<h3 className="text-xl font-semibold text-gray-900 mb-2">
					Address & Location
				</h3>
				<p className="text-gray-600">Please provide your contact information</p>
			</div>

			<div>
				<label
					htmlFor="address"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					Full Address *
				</label>
				<textarea
					id="address"
					name="address"
					rows={3}
					required
					value={formData.address}
					onChange={handleChange}
					className="input-field resize-none"
					placeholder="Enter your complete address"
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label
						htmlFor="city"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						City *
					</label>
					<input
						id="city"
						name="city"
						type="text"
						required
						value={formData.city}
						onChange={handleChange}
						className="input-field"
						placeholder="Enter your city"
					/>
				</div>

				<div>
					<label
						htmlFor="state"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						State *
					</label>
					<select
						id="state"
						name="state"
						required
						value={formData.state}
						onChange={handleChange}
						className="input-field"
					>
						<option value="">Select State</option>
						<option value="Andhra Pradesh">Andhra Pradesh</option>
						<option value="Arunachal Pradesh">Arunachal Pradesh</option>
						<option value="Assam">Assam</option>
						<option value="Bihar">Bihar</option>
						<option value="Chhattisgarh">Chhattisgarh</option>
						<option value="Delhi">Delhi</option>
						<option value="Goa">Goa</option>
						<option value="Gujarat">Gujarat</option>
						<option value="Haryana">Haryana</option>
						<option value="Himachal Pradesh">Himachal Pradesh</option>
						<option value="Jharkhand">Jharkhand</option>
						<option value="Karnataka">Karnataka</option>
						<option value="Kerala">Kerala</option>
						<option value="Madhya Pradesh">Madhya Pradesh</option>
						<option value="Maharashtra">Maharashtra</option>
						<option value="Manipur">Manipur</option>
						<option value="Meghalaya">Meghalaya</option>
						<option value="Mizoram">Mizoram</option>
						<option value="Nagaland">Nagaland</option>
						<option value="Odisha">Odisha</option>
						<option value="Punjab">Punjab</option>
						<option value="Rajasthan">Rajasthan</option>
						<option value="Sikkim">Sikkim</option>
						<option value="Tamil Nadu">Tamil Nadu</option>
						<option value="Telangana">Telangana</option>
						<option value="Tripura">Tripura</option>
						<option value="Uttar Pradesh">Uttar Pradesh</option>
						<option value="Uttarakhand">Uttarakhand</option>
						<option value="West Bengal">West Bengal</option>
					</select>
				</div>

				<div>
					<label
						htmlFor="pincode"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						PIN Code *
					</label>
					<input
						id="pincode"
						name="pincode"
						type="text"
						pattern="[0-9]{6}"
						required
						value={formData.pincode}
						onChange={handleChange}
						className="input-field"
						placeholder="123456"
						maxLength={6}
					/>
				</div>

				<div>
					<label
						htmlFor="country"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Country
					</label>
					<input
						id="country"
						name="country"
						type="text"
						value={formData.country}
						onChange={handleChange}
						className="input-field"
						readOnly
					/>
				</div>
			</div>
		</motion.div>
	);

	// Step 3: Educational/Professional Info Component
	const Step3Education = () => (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="space-y-6"
		>
			<div className="text-center mb-6">
				<h3 className="text-xl font-semibold text-gray-900 mb-2">
					{formData.role === "candidate"
						? "Educational Details"
						: "Professional Information"}
				</h3>
				<p className="text-gray-600">
					{formData.role === "candidate"
						? "Tell us about your academic background"
						: "Provide your organization details"}
				</p>
			</div>

			{formData.role === "candidate" && (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="collegeCode"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								AICTE College Code *
							</label>
							<div className="relative">
								<input
									id="collegeCode"
									name="collegeCode"
									type="text"
									required
									value={formData.collegeCode}
									onChange={handleChange}
									className="input-field pr-10"
									placeholder="Enter AICTE code"
								/>
								{collegeVerified && (
									<CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
								)}
							</div>
							{collegeVerified && (
								<p className="text-sm text-green-600 mt-1">
									✓ College verified
								</p>
							)}
						</div>

						<div>
							<label
								htmlFor="collegeName"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								College Name *
							</label>
							<input
								id="collegeName"
								name="collegeName"
								type="text"
								required
								value={formData.collegeName}
								onChange={handleChange}
								className="input-field"
								placeholder="Enter college name"
								readOnly={collegeVerified}
							/>
						</div>

						<div>
							<label
								htmlFor="course"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Course *
							</label>
							<select
								id="course"
								name="course"
								required
								value={formData.course}
								onChange={handleChange}
								className="input-field"
							>
								<option value="">Select Course</option>
								<option value="B.Tech">B.Tech</option>
								<option value="B.E">B.E</option>
								<option value="BCA">BCA</option>
								<option value="BSc">BSc</option>
								<option value="M.Tech">M.Tech</option>
								<option value="MCA">MCA</option>
								<option value="MSc">MSc</option>
								<option value="MBA">MBA</option>
								<option value="Other">Other</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="branch"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Branch/Specialization *
							</label>
							<input
								id="branch"
								name="branch"
								type="text"
								required
								value={formData.branch}
								onChange={handleChange}
								className="input-field"
								placeholder="e.g., Computer Science"
							/>
						</div>

						<div>
							<label
								htmlFor="semester"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Current Semester
							</label>
							<select
								id="semester"
								name="semester"
								value={formData.semester}
								onChange={handleChange}
								className="input-field"
							>
								<option value="">Select Semester</option>
								{[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
									<option key={sem} value={sem}>
										{sem}
									</option>
								))}
							</select>
						</div>

						<div>
							<label
								htmlFor="cgpa"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								CGPA/Percentage
							</label>
							<input
								id="cgpa"
								name="cgpa"
								type="text"
								value={formData.cgpa}
								onChange={handleChange}
								className="input-field"
								placeholder="e.g., 8.5 or 85%"
							/>
						</div>

						<div>
							<label
								htmlFor="passingYear"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Expected Passing Year
							</label>
							<select
								id="passingYear"
								name="passingYear"
								value={formData.passingYear}
								onChange={handleChange}
								className="input-field"
							>
								<option value="">Select Year</option>
								{Array.from(
									{ length: 6 },
									(_, i) => new Date().getFullYear() + i
								).map((year) => (
									<option key={year} value={year}>
										{year}
									</option>
								))}
							</select>
						</div>
					</div>
				</>
			)}

			{(formData.role === "company" || formData.role === "institution") && (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="companyName"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Organization Name *
							</label>
							<input
								id="companyName"
								name="companyName"
								type="text"
								required
								value={formData.companyName}
								onChange={handleChange}
								className="input-field"
								placeholder="Enter organization name"
							/>
						</div>

						<div>
							<label
								htmlFor="companyType"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Organization Type *
							</label>
							<select
								id="companyType"
								name="companyType"
								required
								value={formData.companyType}
								onChange={handleChange}
								className="input-field"
							>
								<option value="">Select Type</option>
								<option value="Private">Private Company</option>
								<option value="Public">Public Company</option>
								<option value="Government">Government</option>
								<option value="NGO">NGO</option>
								<option value="Startup">Startup</option>
								<option value="Educational">Educational Institution</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="industry"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Industry *
							</label>
							<select
								id="industry"
								name="industry"
								required
								value={formData.industry}
								onChange={handleChange}
								className="input-field"
							>
								<option value="">Select Industry</option>
								<option value="Technology">Technology</option>
								<option value="Finance">Finance</option>
								<option value="Healthcare">Healthcare</option>
								<option value="Education">Education</option>
								<option value="Manufacturing">Manufacturing</option>
								<option value="Retail">Retail</option>
								<option value="Consulting">Consulting</option>
								<option value="Media">Media & Entertainment</option>
								<option value="Government">Government</option>
								<option value="Other">Other</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="companySize"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Company Size *
							</label>
							<select
								id="companySize"
								name="companySize"
								required
								value={formData.companySize}
								onChange={handleChange}
								className="input-field"
							>
								<option value="">Select Size</option>
								<option value="1-10">1-10 employees</option>
								<option value="11-50">11-50 employees</option>
								<option value="51-200">51-200 employees</option>
								<option value="201-500">201-500 employees</option>
								<option value="501-1000">501-1000 employees</option>
								<option value="1000+">1000+ employees</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="website"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Website
							</label>
							<input
								id="website"
								name="website"
								type="url"
								value={formData.website}
								onChange={handleChange}
								className="input-field"
								placeholder="https://www.example.com"
							/>
						</div>

						<div>
							<label
								htmlFor="gstNumber"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								GST Number
							</label>
							<input
								id="gstNumber"
								name="gstNumber"
								type="text"
								value={formData.gstNumber}
								onChange={handleChange}
								className="input-field"
								placeholder="Enter GST number"
							/>
						</div>
					</div>
				</>
			)}
		</motion.div>
	);

	// Step 4: Security & Verification Component
	const Step4Security = () => (
		<motion.div
			initial={{ opacity: 0, x: 50 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -50 }}
			className="space-y-6"
		>
			<div className="text-center mb-6">
				<h3 className="text-xl font-semibold text-gray-900 mb-2">
					Security & Verification
				</h3>
				<p className="text-gray-600">
					Set up your password and verify your identity
				</p>
			</div>

			{/* Password Section */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div>
					<label
						htmlFor="password"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Password *
					</label>
					<div className="relative">
						<input
							id="password"
							name="password"
							type={showPassword ? "text" : "password"}
							required
							value={formData.password}
							onChange={handleChange}
							className="input-field pr-10"
							placeholder="Create a strong password"
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
					<div className="mt-2 text-xs text-gray-500">
						• At least 8 characters
						<br />
						• Include uppercase & lowercase
						<br />• Include numbers and symbols
					</div>
				</div>

				<div>
					<label
						htmlFor="confirmPassword"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Confirm Password *
					</label>
					<div className="relative">
						<input
							id="confirmPassword"
							name="confirmPassword"
							type={showConfirmPassword ? "text" : "password"}
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
			</div>

			{/* Aadhaar Verification */}
			<div>
				<label
					htmlFor="aadhaarNumber"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					Aadhaar Number (Optional for enhanced verification)
				</label>
				<div className="relative">
					<input
						id="aadhaarNumber"
						name="aadhaarNumber"
						type="text"
						pattern="[0-9]{12}"
						value={formData.aadhaarNumber}
						onChange={handleChange}
						className="input-field pr-10"
						placeholder="Enter 12-digit Aadhaar number"
						maxLength={12}
					/>
					{aadhaarVerified && (
						<CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
					)}
				</div>
			</div>

			{/* OTP Verification */}
			<div className="bg-gray-50 rounded-lg p-6">
				<h4 className="text-lg font-medium text-gray-900 mb-4">
					Email/Phone Verification
				</h4>

				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Verification Method
						</label>
						<div className="flex space-x-4">
							<label className="flex items-center">
								<input
									type="radio"
									name="otpMethod"
									value="email"
									checked={formData.otpMethod === "email"}
									onChange={handleChange}
									className="mr-2"
								/>
								<Mail className="w-4 h-4 mr-1" />
								Email
							</label>
							<label className="flex items-center">
								<input
									type="radio"
									name="otpMethod"
									value="sms"
									checked={formData.otpMethod === "sms"}
									onChange={handleChange}
									className="mr-2"
								/>
								<Smartphone className="w-4 h-4 mr-1" />
								SMS
							</label>
						</div>
					</div>

					{verificationStep !== "verified" && (
						<div className="flex space-x-3">
							<button
								type="button"
								onClick={sendOTP}
								disabled={
									verificationStep === "sending" ||
									!formData.email ||
									!formData.phone
								}
								className="btn-primary px-4 py-2 text-sm disabled:opacity-50"
							>
								{verificationStep === "sending" ? "Sending..." : "Send OTP"}
							</button>
						</div>
					)}

					{verificationStep === "sent" && (
						<div className="flex space-x-3">
							<input
								type="text"
								value={otpCode}
								onChange={(e) => setOtpCode(e.target.value)}
								placeholder="Enter OTP"
								className="input-field flex-1"
								maxLength={6}
							/>
							<button
								type="button"
								onClick={verifyOTP}
								className="btn-secondary px-4 py-2 text-sm"
							>
								Verify
							</button>
						</div>
					)}

					{verificationStep === "verified" && (
						<div className="flex items-center text-green-600">
							<CheckCircle className="w-5 h-5 mr-2" />
							<span>Verification completed successfully!</span>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);

	// Step 5: Documents & Profile Component
	const Step5Documents = () => {
		const { getRootProps: getResumeProps, getInputProps: getResumeInputProps } =
			useDropzone({
				onDrop: (files) => onDrop(files, "resume"),
				accept: {
					"application/pdf": [".pdf"],
					"application/msword": [".doc"],
					"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
						[".docx"],
				},
				maxFiles: 1,
			});

		return (
			<motion.div
				initial={{ opacity: 0, x: 50 }}
				animate={{ opacity: 1, x: 0 }}
				exit={{ opacity: 0, x: -50 }}
				className="space-y-6"
			>
				<div className="text-center mb-6">
					<h3 className="text-xl font-semibold text-gray-900 mb-2">
						Documents & Profile Setup
					</h3>
					<p className="text-gray-600">
						Complete your profile with photo and documents
					</p>
				</div>

				{/* Profile Photo */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-4">
						Profile Photo
					</label>
					<div className="flex items-center space-x-6">
						{capturedImage || formData.profilePhoto ? (
							<div className="relative">
								<img
									src={capturedImage || formData.profilePhoto}
									alt="Profile"
									className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
								/>
								<button
									type="button"
									onClick={() => {
										setCapturedImage(null);
										setFormData((prev) => ({ ...prev, profilePhoto: null }));
									}}
									className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
								>
									×
								</button>
							</div>
						) : (
							<div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
								<User className="w-8 h-8 text-gray-400" />
							</div>
						)}

						<div className="flex flex-col space-y-2">
							<button
								type="button"
								onClick={() => setShowWebcam(true)}
								className="flex items-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5"
							>
								<Camera className="w-4 h-4 mr-2" />
								Take Photo
							</button>
							<input
								type="file"
								ref={fileInputRef}
								accept="image/*"
								onChange={(e) => {
									if (e.target.files[0]) {
										const reader = new FileReader();
										reader.onload = (event) => {
											setFormData((prev) => ({
												...prev,
												profilePhoto: event.target.result,
											}));
										};
										reader.readAsDataURL(e.target.files[0]);
									}
								}}
								className="hidden"
							/>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
							>
								<Upload className="w-4 h-4 mr-2" />
								Upload Photo
							</button>
						</div>
					</div>
				</div>

				{/* Webcam Modal */}
				{showWebcam && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
							<div className="text-center mb-4">
								<h3 className="text-lg font-semibold">Take Your Photo</h3>
								<p className="text-gray-600">Position yourself in the frame</p>
							</div>
							<Webcam
								ref={webcamRef}
								screenshotFormat="image/jpeg"
								className="w-full rounded-lg mb-4"
							/>
							<div className="flex justify-between">
								<button
									type="button"
									onClick={() => setShowWebcam(false)}
									className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={capturePhoto}
									className="px-4 py-2 bg-primary text-white rounded-lg"
								>
									Capture
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Resume Upload */}
				{formData.role === "candidate" && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Resume/CV
						</label>
						<div
							{...getResumeProps()}
							className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
						>
							<input {...getResumeInputProps()} />
							<FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
							<p className="text-gray-600">
								{formData.resume
									? `Selected: ${formData.resume.name}`
									: "Drag & drop your resume here, or click to select"}
							</p>
							<p className="text-xs text-gray-500 mt-1">
								Supports PDF, DOC, DOCX (Max 5MB)
							</p>
						</div>

						{/* AI Analysis Results */}
						{documentAnalysis.resume && (
							<div className="mt-4 p-4 bg-green-50 rounded-lg">
								<h4 className="font-medium text-green-800 mb-2">
									✓ Resume Analysis Complete
								</h4>
								<div className="text-sm text-green-700">
									<p>
										Skills extracted:{" "}
										{documentAnalysis.resume.extractedSkills?.join(", ")}
									</p>
									<p>Education: {documentAnalysis.resume.education}</p>
									<p>Experience: {documentAnalysis.resume.experience}</p>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Skills (for candidates) */}
				{formData.role === "candidate" && (
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Skills & Interests
						</label>
						<div className="space-y-3">
							{skillSuggestions.length > 0 && (
								<div>
									<p className="text-sm text-gray-600 mb-2">
										Suggested skills from your resume:
									</p>
									<div className="flex flex-wrap gap-2">
										{skillSuggestions.map((skill, index) => (
											<span
												key={index}
												className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
											>
												{skill}
											</span>
										))}
									</div>
								</div>
							)}
							<textarea
								name="skills"
								value={formData.skills.join(", ")}
								onChange={(e) =>
									setFormData((prev) => ({
										...prev,
										skills: e.target.value
											.split(",")
											.map((s) => s.trim())
											.filter(Boolean),
									}))
								}
								className="input-field resize-none"
								rows={3}
								placeholder="Enter your skills separated by commas (e.g., JavaScript, React, Python)"
							/>
						</div>
					</div>
				)}

				{/* Terms and Agreements */}
				<div className="space-y-4 pt-4 border-t border-gray-200">
					<div className="flex items-start">
						<input
							id="agreedToTerms"
							name="agreedToTerms"
							type="checkbox"
							checked={formData.agreedToTerms}
							onChange={handleChange}
							className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
						/>
						<label
							htmlFor="agreedToTerms"
							className="ml-3 block text-sm text-gray-900"
						>
							I agree to the{" "}
							<button
								type="button"
								className="text-primary hover:underline"
								onClick={() => window.open("/terms", "_blank")}
							>
								Terms and Conditions
							</button>
							<span className="text-red-500"> *</span>
						</label>
					</div>

					<div className="flex items-start">
						<input
							id="agreedToPrivacy"
							name="agreedToPrivacy"
							type="checkbox"
							checked={formData.agreedToPrivacy}
							onChange={handleChange}
							className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
						/>
						<label
							htmlFor="agreedToPrivacy"
							className="ml-3 block text-sm text-gray-900"
						>
							I agree to the{" "}
							<button
								type="button"
								className="text-primary hover:underline"
								onClick={() => window.open("/privacy", "_blank")}
							>
								Privacy Policy
							</button>
							<span className="text-red-500"> *</span>
						</label>
					</div>

					<div className="flex items-start">
						<input
							id="allowMarketing"
							name="allowMarketing"
							type="checkbox"
							checked={formData.allowMarketing}
							onChange={handleChange}
							className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mt-1"
						/>
						<label
							htmlFor="allowMarketing"
							className="ml-3 block text-sm text-gray-900"
						>
							I would like to receive updates about new opportunities and
							features
						</label>
					</div>
				</div>
			</motion.div>
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						className="flex justify-center mb-4"
					>
						<div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
							<span className="text-white font-bold text-2xl">BI</span>
						</div>
					</motion.div>
					<motion.h1
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-3xl md:text-4xl font-bold text-gray-900 mb-2"
					>
						Join PM Internship Scheme
					</motion.h1>
					<motion.p
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className="text-lg text-gray-600 max-w-2xl mx-auto"
					>
						Create your account to access India's largest internship platform.
						Already have an account?{" "}
						<Link
							to="/login"
							className="font-medium text-primary hover:underline"
						>
							Sign in here
						</Link>
					</motion.p>
				</div>

				{/* Progress Indicator */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
					className="bg-white rounded-2xl shadow-xl p-8"
				>
					<ProgressIndicator />

					{/* Multi-step Form */}
					<div>
						<AnimatePresence mode="wait">
							{currentStep === 1 && <Step1BasicInfo key="step1" />}
							{currentStep === 2 && <Step2Address key="step2" />}
							{currentStep === 3 && <Step3Education key="step3" />}
							{currentStep === 4 && <Step4Security key="step4" />}
							{currentStep === 5 && <Step5Documents key="step5" />}
						</AnimatePresence>

						{/* Navigation Buttons */}
						<div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
							<button
								type="button"
								onClick={prevStep}
								disabled={currentStep === 1}
								className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
									currentStep === 1
										? "text-gray-400 cursor-not-allowed"
										: "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
								}`}
							>
								<ArrowLeft className="w-5 h-5 mr-2" />
								Previous
							</button>

							<div className="text-sm text-gray-500">
								Step {currentStep} of {totalSteps}
							</div>

							<button
								type="button"
								onClick={currentStep === totalSteps ? handleSubmit : nextStep}
								disabled={loading}
								className="flex items-center px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{loading ? (
									<>
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
										Processing...
									</>
								) : currentStep === totalSteps ? (
									<>
										<CheckCircle className="w-5 h-5 mr-2" />
										Complete Registration
									</>
								) : (
									<>
										Next
										<ArrowRight className="w-5 h-5 ml-2" />
									</>
								)}
							</button>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default Signup;
