import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const CreatePosting = dynamic(
  () => import("../../src/pages/company/CreatePosting"),
  {
    ssr: false,
  }
);

export default function CreatePostingPage() {
  return (
    <ProtectedRoute role="company">
      <CreatePosting />
    </ProtectedRoute>
  );
}


