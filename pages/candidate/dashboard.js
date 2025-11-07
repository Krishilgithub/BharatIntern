import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";
import ErrorBoundary from "../../src/components/ErrorBoundary";

const CandidateDashboard = dynamic(
	() => import("../../src/pages/candidate/Dashboard"),
	{
		ssr: false,
		loading: () => (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading dashboard...</p>
				</div>
			</div>
		),
	}
);

export default function DashboardPage() {
	return (
		<ErrorBoundary>
			<ProtectedRoute role="candidate">
				<CandidateDashboard />
			</ProtectedRoute>
		</ErrorBoundary>
	);
}
