import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const ConfirmSelections = dynamic(
  () => import("../../src/pages/company/ConfirmSelections"),
  {
    ssr: false,
  }
);

export default function ConfirmSelectionsPage() {
  return (
    <ProtectedRoute role="company">
      <ConfirmSelections />
    </ProtectedRoute>
  );
}


