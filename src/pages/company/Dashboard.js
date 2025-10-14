import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Users,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Building2,
  Briefcase,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Star,
  Filter,
  Search,
  BarChart3,
  Bell,
  User,
  Target,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const CompanyDashboard = () => {
  const [postings, setPostings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockPostings = [
      {
        id: 1,
        title: "Frontend Developer Intern",
        location: "Bangalore",
        duration: "6 months",
        stipend: "₹15,000/month",
        status: "Active",
        applicationsCount: 45,
        shortlistedCount: 12,
        postedDate: "2024-01-15",
        deadline: "2024-02-15",
        skills: ["React", "JavaScript", "CSS", "HTML"],
      },
      {
        id: 2,
        title: "Backend Developer Intern",
        location: "Mumbai",
        duration: "4 months",
        stipend: "₹12,000/month",
        status: "Active",
        applicationsCount: 32,
        shortlistedCount: 8,
        postedDate: "2024-01-20",
        deadline: "2024-02-20",
        skills: ["Node.js", "Python", "MongoDB", "Express"],
      },
      {
        id: 3,
        title: "Data Science Intern",
        location: "Pune",
        duration: "6 months",
        stipend: "₹20,000/month",
        status: "Closed",
        applicationsCount: 28,
        shortlistedCount: 6,
        postedDate: "2024-01-10",
        deadline: "2024-02-10",
        skills: ["Python", "Machine Learning", "SQL", "Pandas"],
      },
    ];

    const mockApplications = [
      {
        id: 1,
        candidateName: "John Doe",
        email: "john.doe@email.com",
        postingTitle: "Frontend Developer Intern",
        matchScore: 92,
        status: "Shortlisted",
        appliedDate: "2024-01-20",
        skills: ["React", "JavaScript", "CSS", "HTML", "TypeScript"],
        experience: "2 years",
        education: "B.Tech Computer Science",
      },
      {
        id: 2,
        candidateName: "Jane Smith",
        email: "jane.smith@email.com",
        postingTitle: "Backend Developer Intern",
        matchScore: 88,
        status: "Under Review",
        appliedDate: "2024-01-22",
        skills: ["Node.js", "Python", "MongoDB", "Express", "Docker"],
        experience: "1.5 years",
        education: "B.Tech Information Technology",
      },
      {
        id: 3,
        candidateName: "Mike Johnson",
        email: "mike.johnson@email.com",
        postingTitle: "Frontend Developer Intern",
        matchScore: 85,
        status: "Interview Scheduled",
        appliedDate: "2024-01-18",
        skills: ["React", "Vue.js", "JavaScript", "CSS", "Bootstrap"],
        experience: "1 year",
        education: "B.Tech Computer Science",
      },
    ];

    setPostings(mockPostings);
    setApplications(mockApplications);
    setStats({
      totalPostings: mockPostings.length,
      activePostings: mockPostings.filter((p) => p.status === "Active").length,
      totalApplications: mockApplications.length,
      shortlistedCandidates: mockApplications.filter(
        (a) => a.status === "Shortlisted"
      ).length,
      avgMatchScore: Math.round(
        mockApplications.reduce((acc, app) => acc + app.matchScore, 0) /
          mockApplications.length
      ),
    });
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-600 bg-green-100";
      case "Closed":
        return "text-red-600 bg-red-100";
      case "Draft":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case "Shortlisted":
        return "text-green-600 bg-green-100";
      case "Under Review":
        return "text-blue-600 bg-blue-100";
      case "Interview Scheduled":
        return "text-yellow-600 bg-yellow-100";
      case "Rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Company Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your internship postings and review applications.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <User className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="relative">
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600" />
                </button>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  3
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
          <div className="card text-center">
            <div className="flex items-center justify-center mb-3">
              <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats.totalPostings}
            </div>
            <div className="text-gray-600 text-sm">Total Postings</div>
          </div>
          <div className="card text-center">
            <div className="flex items-center justify-center mb-3">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {stats.activePostings}
            </div>
            <div className="text-gray-600 text-sm">Active Postings</div>
          </div>
          <div className="card text-center">
            <div className="flex items-center justify-center mb-3">
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {stats.totalApplications}
            </div>
            <div className="text-gray-600 text-sm">Applications</div>
          </div>
          <div className="card text-center">
            <div className="flex items-center justify-center mb-3">
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats.shortlistedCandidates}
            </div>
            <div className="text-gray-600 text-sm">Shortlisted</div>
          </div>
          <div className="card text-center">
            <div className="flex items-center justify-center mb-3">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {stats.avgMatchScore}%
            </div>
            <div className="text-gray-600 text-sm">Avg Match</div>
          </div>
        </div>

        {/* Company Tools Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hiring Management Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Link
              href="/company/create-posting"
              className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Create Job Posting
              </h3>
              <p className="text-sm text-gray-600">
                Post new internship opportunities
              </p>
            </Link>

            <Link
              href="/company/shortlist-review"
              className="group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-4">
                <UserCheck className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Review Applications
              </h3>
              <p className="text-sm text-gray-600">
                AI-powered candidate screening
              </p>
            </Link>

            <Link
              href="/company/confirm-selections"
              className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Confirm Selections
              </h3>
              <p className="text-sm text-gray-600">Finalize hiring decisions</p>
            </Link>

            <div className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200 hover:shadow-md transition-all duration-300 cursor-pointer">
              <div className="flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-orange-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-sm text-gray-600">
                Hiring metrics and insights
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/company/create-posting"
                  className="card hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Plus className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Create New Posting
                      </h3>
                      <p className="text-sm text-gray-600">
                        Post a new internship opportunity
                      </p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/company/shortlist"
                  className="card hover:shadow-lg transition-shadow duration-300 group"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Users className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Review Applications
                      </h3>
                      <p className="text-sm text-gray-600">
                        Shortlist and review candidates
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Postings */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Postings
                </h2>
                <Link
                  href="/company/create-posting"
                  className="text-primary hover:text-blue-700 font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {postings.slice(0, 3).map((posting) => (
                  <div
                    key={posting.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {posting.title}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                              posting.status
                            )}`}
                          >
                            {posting.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-600 text-sm mb-3">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{posting.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{posting.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              Deadline:{" "}
                              {new Date(posting.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {posting.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {posting.applicationsCount} applications
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="w-4 h-4" />
                            <span>{posting.shortlistedCount} shortlisted</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button className="p-2 text-gray-400 hover:text-primary">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-primary">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Applications */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Recent Applications
                </h3>
                <Link
                  href="/company/shortlist"
                  className="text-primary hover:text-blue-700 text-sm"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {app.candidateName}
                      </p>
                      <p className="text-gray-600 text-xs">
                        {app.postingTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getApplicationStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {app.matchScore}% match
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">
                Performance Metrics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Avg. Match Score</span>
                  <span className="font-semibold text-gray-900">
                    {stats.avgMatchScore}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Conversion Rate</span>
                  <span className="font-semibold text-gray-900">
                    {stats.totalApplications > 0
                      ? Math.round(
                          (stats.shortlistedCandidates /
                            stats.totalApplications) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold text-gray-900">2.3 days</span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="card bg-blue-50 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">
                Tips for Better Results
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Write clear, detailed job descriptions</li>
                <li>• Include specific skill requirements</li>
                <li>• Set competitive stipend ranges</li>
                <li>• Respond to applications quickly</li>
                <li>• Provide feedback to candidates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
