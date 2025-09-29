"use client";

import LearningRoadmap from "../../../src/pages/candidate/LearningRoadmap";
import Navbar from "../../../src/components/Navbar";
import ProtectedRoute from "../../../src/components/ProtectedRoute";

export default function LearningPage() {
	return (
		<ProtectedRoute allowedRoles={["candidate"]}>
			<Navbar />
			<LearningRoadmap />
		</ProtectedRoute>
	);
}
