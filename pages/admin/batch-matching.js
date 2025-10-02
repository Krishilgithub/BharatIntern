import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const BatchMatching = dynamic(
  () => import("../../src/pages/admin/BatchMatching"),
  {
    ssr: false,
  }
);

export default function BatchMatchingPage() {
  return (
    <ProtectedRoute role="admin">
      <BatchMatching />
    </ProtectedRoute>
  );
}


