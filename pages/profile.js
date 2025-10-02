import dynamic from "next/dynamic";
import ProtectedRoute from "../src/components/ProtectedRoute";

const UserProfile = dynamic(() => import("../src/pages/UserProfile"), {
  ssr: false,
});

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  );
}


