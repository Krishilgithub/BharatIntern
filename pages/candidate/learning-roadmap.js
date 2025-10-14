import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const LearningRoadmap = dynamic(
  () => import("../../src/pages/candidate/LearningRoadmap"),
  {
    ssr: false,
  }
);

export default function LearningRoadmapPage() {
  return (
    <ProtectedRoute role="candidate">
      <LearningRoadmap />
    </ProtectedRoute>
  );
}


