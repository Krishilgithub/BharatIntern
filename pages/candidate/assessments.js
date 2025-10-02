import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const MicroAssessments = dynamic(
  () => import("../../src/pages/candidate/MicroAssessments"),
  {
    ssr: false,
  }
);

export default function AssessmentsPage() {
  return (
    <ProtectedRoute role="candidate">
      <MicroAssessments />
    </ProtectedRoute>
  );
}


