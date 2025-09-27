"use client";

import Applications from "../../../src/pages/candidate/Applications";
import Navbar from "../../../src/components/Navbar";
import ProtectedRoute from "../../../src/components/ProtectedRoute";

export default function ApplicationsPage() {
	return (
		<ProtectedRoute allowedRoles={["candidate"]}>
			<Navbar />
			<Applications />
		</ProtectedRoute>
	);
}
