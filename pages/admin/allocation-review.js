import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const AllocationReview = dynamic(
  () => import("../../src/pages/admin/AllocationReview"),
  {
    ssr: false,
  }
);

export default function AllocationReviewPage() {
  return (
    <ProtectedRoute role="admin">
      <AllocationReview />
    </ProtectedRoute>
  );
}


