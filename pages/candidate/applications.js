import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const Applications = dynamic(
  () => import("../../src/pages/candidate/Applications"),
  {
    ssr: false,
  }
);

export default function ApplicationsPage() {
  return (
    <ProtectedRoute role="candidate">
      <Applications />
    </ProtectedRoute>
  );
}


