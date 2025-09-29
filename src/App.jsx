import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

// Public Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Contact from "./pages/Contact";
import UserProfile from "./pages/UserProfile";

// Candidate Pages
import CandidateDashboard from "./pages/candidate/Dashboard";
import ResumeAnalyzer from "./pages/candidate/ResumeAnalyzer";
import Recommendations from "./pages/candidate/Recommendations";
import Applications from "./pages/candidate/Applications";
import MicroAssessments from "./pages/candidate/MicroAssessments";
import LearningRoadmap from "./pages/candidate/LearningRoadmap";

// Company Pages
import CompanyDashboard from "./pages/company/Dashboard";
import CreatePosting from "./pages/company/CreatePosting";
import ShortlistReview from "./pages/company/ShortlistReview";
import ConfirmSelections from "./pages/company/ConfirmSelections";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import QuotaConfigurator from "./pages/admin/QuotaConfigurator";
import WhatIfSimulator from "./pages/admin/WhatIfSimulator";
import BatchMatching from "./pages/admin/BatchMatching";
import AllocationReview from "./pages/admin/AllocationReview";

function App() {
	return (
		<AuthProvider>
			<Router>
				<div className="min-h-screen bg-gray-50">
					<Navbar />
					<main>
						<Routes>
							{/* Public Routes */}
							<Route path="/" element={<LandingPage />} />
							<Route path="/login" element={<Login />} />
							<Route path="/signup" element={<Signup />} />
							<Route path="/about" element={<About />} />
							<Route path="/contact" element={<Contact />} />

							{/* Profile Route (Available to all authenticated users) */}
							<Route
								path="/profile"
								element={
									<ProtectedRoute>
										<UserProfile />
									</ProtectedRoute>
								}
							/>

							{/* Candidate Routes */}
							<Route
								path="/candidate/dashboard"
								element={
									<ProtectedRoute role="candidate">
										<CandidateDashboard />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/candidate/resume"
								element={
									<ProtectedRoute role="candidate">
										<ResumeAnalyzer />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/candidate/recommendations"
								element={
									<ProtectedRoute role="candidate">
										<Recommendations />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/candidate/applications"
								element={
									<ProtectedRoute role="candidate">
										<Applications />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/candidate/assessments"
								element={
									<ProtectedRoute role="candidate">
										<MicroAssessments />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/candidate/roadmap"
								element={
									<ProtectedRoute role="candidate">
										<LearningRoadmap />
									</ProtectedRoute>
								}
							/>

							{/* Company Routes */}
							<Route
								path="/company/dashboard"
								element={
									<ProtectedRoute role="company">
										<CompanyDashboard />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/company/create-posting"
								element={
									<ProtectedRoute role="company">
										<CreatePosting />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/company/shortlist-review"
								element={
									<ProtectedRoute role="company">
										<ShortlistReview />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/company/confirm-selections"
								element={
									<ProtectedRoute role="company">
										<ConfirmSelections />
									</ProtectedRoute>
								}
							/>

							{/* Admin Routes */}
							<Route
								path="/admin/dashboard"
								element={
									<ProtectedRoute role="admin">
										<AdminDashboard />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/admin/quota-configurator"
								element={
									<ProtectedRoute role="admin">
										<QuotaConfigurator />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/admin/whatif-simulator"
								element={
									<ProtectedRoute role="admin">
										<WhatIfSimulator />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/admin/batch-matching"
								element={
									<ProtectedRoute role="admin">
										<BatchMatching />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/admin/allocation-review"
								element={
									<ProtectedRoute role="admin">
										<AllocationReview />
									</ProtectedRoute>
								}
							/>
						</Routes>
					</main>
					<Toaster position="top-right" />
				</div>
			</Router>
		</AuthProvider>
	);
}

export default App;
