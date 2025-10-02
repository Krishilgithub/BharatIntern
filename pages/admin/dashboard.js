import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const AdminDashboard = dynamic(
  () => import("../../src/pages/admin/Dashboard"),
  {
    ssr: false,
  }
);

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute role="admin">
      <AdminDashboard />
    </ProtectedRoute>
  );
}


