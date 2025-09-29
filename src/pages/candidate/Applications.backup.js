import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  Download,
  Calendar,
  Building2,
  MapPin,
  Star,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Users,
  DollarSign,
  FileText,
  Bell,
  ExternalLink,
  RefreshCw,
  Sort,
  Grid,
  List
} from 'lucide-react';
import toast from 'react-hot-toast';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('appliedDate');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({});

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterAndSortApplications();
  }, [applications, filter, sortBy, searchTerm]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, this would come from API
      const mockApplications = [
      {
        id: 1,
        title: "Frontend Developer Intern",
        company: "WebTech Ltd",
        location: "Bangalore",
        status: "Shortlisted",
        appliedDate: "2024-01-15",
        matchScore: 92,
        skills: ["React", "JavaScript", "CSS", "HTML"],
        duration: "6 months",
        stipend: "₹15,000/month",
        description: "Work on modern web applications using React and modern frontend technologies.",
        requirements: ["Bachelor's in CS/IT", "Strong JavaScript skills", "React experience"],
        nextSteps: "Interview scheduled for February 20, 2024",
        timeline: [
          { status: "Applied", date: "2024-01-15", completed: true },
          { status: "Under Review", date: "2024-01-18", completed: true },
          { status: "Shortlisted", date: "2024-01-25", completed: true },
          { status: "Interview", date: "2024-02-20", completed: false },
          { status: "Final Decision", date: "2024-02-25", completed: false }
        ]
      },
      {
        id: 2,
        title: "Backend Developer Intern",
        company: "API Solutions",
        location: "Mumbai",
        status: "Applied",
        appliedDate: "2024-01-20",
        matchScore: 87,
        skills: ["Node.js", "Python", "MongoDB", "Express"],
        duration: "4 months",
        stipend: "₹12,000/month",
        description: "Build scalable backend services and APIs for web applications.",
        requirements: ["Backend development skills", "Database knowledge", "API design"],
        nextSteps: "Application under review",
        timeline: [
          { status: "Applied", date: "2024-01-20", completed: true },
          { status: "Under Review", date: "2024-01-22", completed: true },
          { status: "Shortlisted", date: "TBD", completed: false },
          { status: "Interview", date: "TBD", completed: false },
          { status: "Final Decision", date: "TBD", completed: false }
        ]
      },
      {
        id: 3,
        title: "Full Stack Intern",
        company: "DevCorp",
        location: "Delhi",
        status: "Rejected",
        appliedDate: "2024-01-10",
        matchScore: 78,
        skills: ["React", "Node.js", "PostgreSQL", "Docker"],
        duration: "5 months",
        stipend: "₹18,000/month",
        description: "Full-stack development role working on end-to-end web applications.",
        requirements: ["Full-stack experience", "Database skills", "DevOps knowledge"],
        nextSteps: "Application rejected due to insufficient experience",
        timeline: [
          { status: "Applied", date: "2024-01-10", completed: true },
          { status: "Under Review", date: "2024-01-12", completed: true },
          { status: "Rejected", date: "2024-01-18", completed: true }
        ]
      },
      {
        id: 4,
        title: "Data Science Intern",
        company: "DataViz Solutions",
        location: "Pune",
        status: "Interview",
        appliedDate: "2024-01-25",
        matchScore: 89,
        skills: ["Python", "Machine Learning", "SQL", "Pandas"],
        duration: "6 months",
        stipend: "₹20,000/month",
        description: "Work on machine learning projects and data analysis tasks.",
        requirements: ["Python proficiency", "ML knowledge", "Statistics background"],
        nextSteps: "Technical interview scheduled for February 15, 2024",
        timeline: [
          { status: "Applied", date: "2024-01-25", completed: true },
          { status: "Under Review", date: "2024-01-28", completed: true },
          { status: "Shortlisted", date: "2024-02-01", completed: true },
          { status: "Interview", date: "2024-02-15", completed: false },
          { status: "Final Decision", date: "2024-02-20", completed: false }
        ]
      },
      {
        id: 5,
        title: "UI/UX Design Intern",
        company: "DesignStudio",
        location: "Hyderabad",
        status: "Offer",
        appliedDate: "2024-01-05",
        matchScore: 85,
        skills: ["Figma", "Adobe XD", "User Research", "Prototyping"],
        duration: "3 months",
        stipend: "₹10,000/month",
        description: "Create user interfaces and user experiences for web and mobile apps.",
        requirements: ["Design portfolio", "Figma skills", "User-centered thinking"],
        nextSteps: "Offer letter sent. Please respond by February 10, 2024",
        timeline: [
          { status: "Applied", date: "2024-01-05", completed: true },
          { status: "Under Review", date: "2024-01-08", completed: true },
          { status: "Shortlisted", date: "2024-01-12", completed: true },
          { status: "Interview", date: "2024-01-20", completed: true },
          { status: "Offer", date: "2024-01-25", completed: true }
        ]
      }
    ];

    setApplications(mockApplications);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Applied': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Shortlisted': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Interview': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'Offer': return <Star className="w-5 h-5 text-purple-500" />;
      case 'Rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'text-blue-600 bg-blue-100';
      case 'Shortlisted': return 'text-green-600 bg-green-100';
      case 'Interview': return 'text-yellow-600 bg-yellow-100';
      case 'Offer': return 'text-purple-600 bg-purple-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status.toLowerCase() === filter.toLowerCase();
  });

  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (sortBy) {
      case 'appliedDate':
        return new Date(b.appliedDate) - new Date(a.appliedDate);
      case 'matchScore':
        return b.matchScore - a.matchScore;
      case 'company':
        return a.company.localeCompare(b.company);
      default:
        return 0;
    }
  });

  const statusCounts = {
    all: applications.length,
    applied: applications.filter(app => app.status === 'Applied').length,
    shortlisted: applications.filter(app => app.status === 'Shortlisted').length,
    interview: applications.filter(app => app.status === 'Interview').length,
    offer: applications.filter(app => app.status === 'Offer').length,
    rejected: applications.filter(app => app.status === 'Rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-2">
            Track the status of your internship applications and manage your opportunities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`card text-center hover:shadow-lg transition-shadow ${
                filter === status ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-600 capitalize">{status}</div>
            </button>
          ))}
        </div>

        {/* Filters and Sort */}
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">All Applications</option>
                <option value="applied">Applied</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
              >
                <option value="appliedDate">Applied Date</option>
                <option value="matchScore">Match Score</option>
                <option value="company">Company Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {sortedApplications.map((app) => (
            <div key={app.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{app.title}</h3>
                    <span className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${getStatusColor(app.status)}`}>
                      {getStatusIcon(app.status)}
                      <span>{app.status}</span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-4 h-4" />
                      <span>{app.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{app.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>Applied on {new Date(app.appliedDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{app.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-primary mb-1">{app.matchScore}%</div>
                  <div className="text-xs text-gray-500">Match Score</div>
                </div>
              </div>

              {/* Skills and Details */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Required:</h4>
                  <div className="flex flex-wrap gap-2">
                    {app.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Details:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Duration: {app.duration}</div>
                    <div>Stipend: {app.stipend}</div>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Next Steps:</h4>
                <p className="text-gray-600 text-sm">{app.nextSteps}</p>
              </div>

              {/* Timeline */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Application Timeline:</h4>
                <div className="flex items-center space-x-4 overflow-x-auto pb-2">
                  {app.timeline.map((step, index) => (
                    <div key={index} className="flex items-center space-x-2 min-w-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-sm font-medium ${
                          step.completed ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {step.status}
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.date !== 'TBD' ? new Date(step.date).toLocaleDateString() : 'TBD'}
                        </div>
                      </div>
                      {index < app.timeline.length - 1 && (
                        <div className={`w-8 h-0.5 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Application ID: #{app.id.toString().padStart(4, '0')}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="btn-secondary text-sm px-4 py-2">
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                  <button className="btn-secondary text-sm px-4 py-2">
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Applications */}
        {sortedApplications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You haven't applied to any internships yet. Start exploring opportunities!"
                : `No applications found with status "${filter}".`
              }
            </p>
            <a href="/candidate/recommendations" className="btn-primary">
              Browse Recommendations
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applications;
