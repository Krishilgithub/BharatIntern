import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const Recommendations = dynamic(
  () => import("../../src/pages/candidate/Recommendations"),
  {
    ssr: false,
  }
);

export default function RecommendationsPage() {
  return (
    <ProtectedRoute role="candidate">
      <Recommendations />
    </ProtectedRoute>
  );
}


