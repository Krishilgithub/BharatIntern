"use client";

import MicroAssessments from "../../../src/pages/candidate/MicroAssessments";
import Navbar from "../../../src/components/Navbar";
import ProtectedRoute from "../../../src/components/ProtectedRoute";

export default function AssessmentsPage() {
	return (
		<ProtectedRoute allowedRoles={["candidate"]}>
			<Navbar />
			<MicroAssessments />
		</ProtectedRoute>
	);
}
