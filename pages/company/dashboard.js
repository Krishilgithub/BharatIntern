import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const CompanyDashboard = dynamic(
  () => import("../../src/pages/company/Dashboard"),
  {
    ssr: false,
  }
);

export default function CompanyDashboardPage() {
  return (
    <ProtectedRoute role="company">
      <CompanyDashboard />
    </ProtectedRoute>
  );
}


