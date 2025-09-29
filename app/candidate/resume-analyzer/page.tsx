"use client";

import ResumeAnalyzer from "../../../src/pages/candidate/ResumeAnalyzer";
import Navbar from "../../../src/components/Navbar";
import ProtectedRoute from "../../../src/components/ProtectedRoute";

export default function ResumeAnalyzerPage() {
	return (
		<ProtectedRoute allowedRoles={["candidate"]}>
			<Navbar />
			<ResumeAnalyzer />
		</ProtectedRoute>
	);
}
