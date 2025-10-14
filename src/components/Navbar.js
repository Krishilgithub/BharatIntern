import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { Menu, X, User, LogOut, Briefcase, Settings } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "candidate":
        return <User className="w-5 h-5" />;
      case "company":
        return <Briefcase className="w-5 h-5" />;
      case "admin":
        return <Settings className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleDashboard = (role) => {
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

  const isActive = (path) => router.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">BI</span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              BharatIntern
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  href={getRoleDashboard(user.role)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(getRoleDashboard(user.role))
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {getRoleIcon(user.role)}
                  <span>Dashboard</span>
                </Link>

                {user.role === "candidate" && (
                  <>
                    <Link
                      href="/candidate/recommendations"
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isActive("/candidate/recommendations")
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Recommendations
                    </Link>
                    <Link
                      href="/candidate/applications"
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isActive("/candidate/applications")
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Applications
                    </Link>
                  </>
                )}

                {user.role === "company" && (
                  <>
                    <Link
                      href="/company/create-posting"
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isActive("/company/create-posting")
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Create Posting
                    </Link>
                    <Link
                      href="/company/shortlist-review"
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isActive("/company/shortlist-review")
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Shortlist Review
                    </Link>
                  </>
                )}

                {user.role === "admin" && (
                  <>
                    <Link
                      href="/admin/quota-configurator"
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isActive("/admin/quota-configurator")
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Quota Config
                    </Link>
                    <Link
                      href="/admin/whatif-simulator"
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        isActive("/admin/whatif-simulator")
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      Simulator
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-gray-700">
                    {getRoleIcon(user.role)}
                    <span className="font-medium">{user.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    document.getElementById("about-section")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    document.getElementById("contact-section")?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Contact
                </button>
                <Link href="/login" className="btn-secondary">
                  Login
                </Link>
                <Link href="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Link
                    href={getRoleDashboard(user.role)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {getRoleIcon(user.role)}
                    <span>Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      document.getElementById("about-section")?.scrollIntoView({
                        behavior: "smooth",
                      });
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded-lg hover:bg-gray-100 text-left w-full"
                  >
                    About
                  </button>
                  <button
                    onClick={() => {
                      document
                        .getElementById("contact-section")
                        ?.scrollIntoView({
                          behavior: "smooth",
                        });
                      setIsMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded-lg hover:bg-gray-100 text-left w-full"
                  >
                    Contact
                  </button>
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-2 rounded-lg hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
