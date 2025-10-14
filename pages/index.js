import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../src/contexts/AuthContext";

// Dynamically import LandingPage to avoid SSR issues
const LandingPage = dynamic(() => import("../src/pages/LandingPage"), {
  ssr: false,
});

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      // Redirect logged-in users to their respective dashboard
      const dashboardPath = getDashboardPath(user.role);
      router.push(dashboardPath);
    }
  }, [user, loading, router]);

  const getDashboardPath = (role) => {
    switch (role) {
      case "candidate":
        return "/candidate/dashboard";
      case "company":
        return "/company/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is logged in, don't render landing page (will redirect)
  if (user) {
    return null;
  }

  // Show landing page for non-logged-in users
  return <LandingPage />;
}
