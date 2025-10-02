import dynamic from "next/dynamic";
import ProtectedRoute from "../../src/components/ProtectedRoute";

const WhatIfSimulator = dynamic(
  () => import("../../src/pages/admin/WhatIfSimulator"),
  {
    ssr: false,
  }
);

export default function WhatIfSimulatorPage() {
  return (
    <ProtectedRoute role="admin">
      <WhatIfSimulator />
    </ProtectedRoute>
  );
}


