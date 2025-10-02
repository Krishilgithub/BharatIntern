import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const CandidateDashboard = dynamic(
  () => import("../../src/pages/candidate/Dashboard"),
  {
    ssr: false,
  }
);

export default function CandidateDashboardPage() {
  return (
    <ProtectedRoute role="candidate">
      <CandidateDashboard />
    </ProtectedRoute>
  );
}


