import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const QuotaConfigurator = dynamic(
  () => import("../../src/pages/admin/QuotaConfigurator"),
  {
    ssr: false,
  }
);

export default function QuotaConfiguratorPage() {
  return (
    <ProtectedRoute role="admin">
      <QuotaConfigurator />
    </ProtectedRoute>
  );
}


