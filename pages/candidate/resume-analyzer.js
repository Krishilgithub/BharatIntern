import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const ResumeAnalyzer = dynamic(
  () => import("../../src/pages/candidate/ResumeAnalyzer"),
  {
    ssr: false,
  }
);

export default function ResumeAnalyzerPage() {
  return (
    <ProtectedRoute role="candidate">
      <ResumeAnalyzer />
    </ProtectedRoute>
  );
}


