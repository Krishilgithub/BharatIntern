import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const InternshipAssessment = dynamic(
  () => import("../../src/pages/candidate/InternshipAssessment"),
  {
    ssr: false,
  }
);

export default function InternshipAssessmentPage() {
  return (
    <ProtectedRoute role="candidate">
      <InternshipAssessment />
    </ProtectedRoute>
  );
}


