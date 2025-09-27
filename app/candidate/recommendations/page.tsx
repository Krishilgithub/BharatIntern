"use client";

import Recommendations from "../../../src/pages/candidate/Recommendations";
import Navbar from "../../../src/components/Navbar";
import ProtectedRoute from "../../../src/components/ProtectedRoute";

export default function RecommendationsPage() {
	return (
		<ProtectedRoute allowedRoles={["candidate"]}>
			<Navbar />
			<Recommendations />
		</ProtectedRoute>
	);
}
