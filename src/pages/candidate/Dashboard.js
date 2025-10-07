import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Target,
  CheckCircle,
  Clock,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Brain,
  Mic,
  Code,
  BarChart3,
  Star,
  Award,
  User,
  Calendar,
  Bell,
  RefreshCw,
  ChevronRight,
  Trophy,
  Zap,
  Eye,
  Plus,
  Activity,
  ArrowUpRight,
  Filter,
  Download,
  Share,
  MapPin,
  Building2,
  DollarSign,
  Users,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profileCompletion, setProfileCompletion] = useState(75);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [skillProgress, setSkillProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Load all data with mock data to prevent hanging
      await Promise.all([
        loadRecommendations(),
        loadApplications(),
        loadStats(),
        loadRecentActivity(),
        loadSkillProgress(),
        loadNotifications(),
        loadUpcomingDeadlines(),
      ]);
      setLastUpdated(new Date());
      if (isRefresh) {
        toast.success("Dashboard refreshed successfully!");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadRecommendations = async () => {
    console.log('Loading recommendations with mock data');
    setRecommendations([
      {
        id: 1,
        title: "Software Development Intern",
        company: "TechCorp India",
        location: "Bangalore",
        duration: "6 months",
        matchScore: 95,
        skills: ["React", "Node.js", "JavaScript", "MongoDB"],
        deadline: "2024-02-15",
        stipend: "₹25,000/month",
        type: "Full-time",
        applicants: 1250,
        isNew: true,
      },
      {
        id: 2,
        title: "Data Science Intern",
        company: "DataViz Solutions",
        location: "Mumbai",
        duration: "4 months",
        matchScore: 88,
        skills: ["Python", "Machine Learning", "SQL", "Tableau"],
        deadline: "2024-02-20",
        stipend: "₹22,000/month",
        type: "Remote",
        applicants: 890,
        isNew: false,
      },
    ]);
  };

  const loadApplications = async () => {
    console.log('Loading applications with mock data');
    setApplications([
      {
        id: 1,
        title: "Frontend Developer Intern",
        company: "WebTech Solutions",
        status: "Applied",
        appliedDate: "2024-01-15",
        matchScore: 92,
        nextStep: "Technical Interview",
        interviewDate: "2024-02-05",
      },
      {
        id: 2,
        title: "Backend Developer Intern",
        company: "ServerCorp",
        status: "Interview Scheduled",
        appliedDate: "2024-01-10",
        matchScore: 85,
        nextStep: "HR Round",
        interviewDate: "2024-02-03",
      },
    ]);
  };

  const loadStats = async () => {
    console.log('Loading stats with mock data');
    setStats({
      totalApplications: 15,
      interviewsScheduled: 3,
      offersReceived: 1,
      profileViews: 245,
      matchRate: 78,
      responseRate: 65,
    });
  };

  const loadRecentActivity = async () => {
    console.log('Loading recent activity with mock data');
    setRecentActivity([
      {
        id: 1,
        type: 'application',
        title: 'Applied to Software Developer Intern',
        company: 'TechCorp',
        time: '2 hours ago',
        icon: 'briefcase',
      },
      {
        id: 2,
        type: 'interview',
        title: 'Interview scheduled',
        company: 'DataViz Solutions',
        time: '1 day ago',
        icon: 'calendar',
      },
    ]);
  };

  const loadSkillProgress = async () => {
    console.log('Loading skill progress with mock data');
    setSkillProgress([
      { skill: 'React', progress: 85, target: 90 },
      { skill: 'Node.js', progress: 70, target: 80 },
      { skill: 'Python', progress: 60, target: 75 },
    ]);
  };

  const loadNotifications = async () => {
    console.log('Loading notifications with mock data');
    setNotifications([
      {
        id: 1,
        title: 'New job recommendation',
        message: 'Check out this perfect match for you!',
        time: '1 hour ago',
        unread: true,
      },
    ]);
  };

  const loadUpcomingDeadlines = async () => {
    console.log('Loading upcoming deadlines with mock data');
    setUpcomingDeadlines([
      {
        id: 1,
        title: 'Frontend Developer Application',
        company: 'TechCorp',
        deadline: '2024-02-10',
        daysLeft: 5,
      },
    ]);
  };

  const handleRefresh = () => {
    loadDashboardData(true);
  };

  const handleQuickApply = async (jobId) => {
    try {
      toast.success("Application submitted successfully!");
      const newApplication = {
        id: Date.now(),
        title: recommendations.find((r) => r.id === jobId)?.title || "Unknown Job",
        company: recommendations.find((r) => r.id === jobId)?.company || "Unknown Company",
        status: "Applied",
        appliedDate: new Date().toISOString().split("T")[0],
        matchScore: recommendations.find((r) => r.id === jobId)?.matchScore || 0,
        nextStep: "Under Review",
        interviewDate: null,
      };
      setApplications((prev) => [newApplication, ...prev]);
      setRecommendations((prev) => prev.filter((r) => r.id !== jobId));
    } catch (error) {
      toast.error("Failed to submit application");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {user?.name || "Candidate"}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's your internship journey overview
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalApplications || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interviewsScheduled || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Offers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.offersReceived || 0}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border"
          >
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.profileViews || 0}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Completion */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
                <span className="text-sm text-gray-500">{profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${profileCompletion}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                Complete your profile to get better recommendations and increase your visibility.
              </p>
              <Link href="/profile" className="inline-flex items-center mt-4 text-primary hover:text-primary-dark">
                <span>Complete Profile</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
                <Link href="/candidate/recommendations" className="text-primary hover:text-primary-dark text-sm">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                        <p className="text-gray-600">{rec.company}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {rec.location}
                          </span>
                          <span>{rec.duration}</span>
                          <span>{rec.stipend}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{rec.matchScore}%</div>
                        <div className="text-xs text-gray-500">match</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {rec.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {rec.applicants} applicants
                      </span>
                      <button
                        onClick={() => handleQuickApply(rec.id)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                      >
                        Quick Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Activity className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-xs text-gray-500">{activity.company} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Upcoming Deadlines */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{deadline.title}</p>
                      <p className="text-xs text-gray-500">{deadline.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-orange-600">{deadline.daysLeft} days</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/candidate/resume-analyzer" className="p-4 border rounded-lg hover:shadow-md transition-shadow text-center">
                  <FileText className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <span className="text-sm font-medium">Analyze Resume</span>
                </Link>
                <Link href="/candidate/assessments" className="p-4 border rounded-lg hover:shadow-md transition-shadow text-center">
                  <Brain className="w-6 h-6 mx-auto mb-2 text-green-600" />
                  <span className="text-sm font-medium">Take Assessment</span>
                </Link>
                <Link href="/candidate/learning" className="p-4 border rounded-lg hover:shadow-md transition-shadow text-center">
                  <BookOpen className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <span className="text-sm font-medium">Learning Path</span>
                </Link>
                <Link href="/candidate/applications" className="p-4 border rounded-lg hover:shadow-md transition-shadow text-center">
                  <Target className="w-6 h-6 mx-auto mb-2 text-red-600" />
                  <span className="text-sm font-medium">View Applications</span>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;