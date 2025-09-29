"use client";

import CandidateDashboard from "../../../src/pages/candidate/Dashboard";
import Navbar from "../../../src/components/Navbar";
import ProtectedRoute from "../../../src/components/ProtectedRoute";

export default function CandidateDashboardPage() {
	return (
		<ProtectedRoute allowedRoles={["candidate"]}>
			<Navbar />
			<CandidateDashboard />
		</ProtectedRoute>
	);
}
