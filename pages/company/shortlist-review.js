import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const ShortlistReview = dynamic(
  () => import("../../src/pages/company/ShortlistReview"),
  {
    ssr: false,
  }
);

export default function ShortlistReviewPage() {
  return (
    <ProtectedRoute role="company">
      <ShortlistReview />
    </ProtectedRoute>
  );
}


