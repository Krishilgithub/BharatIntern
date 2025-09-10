import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  Edit,
  Save,
  RotateCcw,
  AlertCircle,
  Users,
  Building2,
  MapPin,
  Calendar,
  Star,
  ChevronDown
} from 'lucide-react';

const AllocationReview = () => {
  const [allocations, setAllocations] = useState([]);
  const [filteredAllocations, setFilteredAllocations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    company: 'all',
    matchScore: 0
  });
  const [selectedAllocations, setSelectedAllocations] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockAllocations = [
      {
        id: 1,
        candidateName: "John Doe",
        candidateEmail: "john.doe@email.com",
        companyName: "TechCorp India",
        postingTitle: "Frontend Developer Intern",
        category: "General",
        matchScore: 95,
        status: "Approved",
        allocatedDate: "2024-02-15",
        startDate: "2024-03-01",
        duration: "6 months",
        stipend: "₹15,000/month",
        location: "Bangalore",
        skills: ["React", "JavaScript", "CSS", "HTML", "TypeScript"],
        experience: "2 years",
        education: "B.Tech Computer Science - IIT Delhi",
        notes: "Excellent technical skills and communication",
        auditTrail: [
          { action: "Allocated", user: "System", timestamp: "2024-02-15 10:30:00", details: "Auto-allocated based on matching algorithm" },
          { action: "Reviewed", user: "Admin User", timestamp: "2024-02-15 14:20:00", details: "Manual review completed" },
          { action: "Approved", user: "Admin User", timestamp: "2024-02-15 14:25:00", details: "Allocation approved for final processing" }
        ]
      },
      {
        id: 2,
        candidateName: "Jane Smith",
        candidateEmail: "jane.smith@email.com",
        companyName: "DataViz Solutions",
        postingTitle: "Backend Developer Intern",
        category: "OBC",
        matchScore: 88,
        status: "Pending Review",
        allocatedDate: "2024-02-18",
        startDate: "2024-03-01",
        duration: "4 months",
        stipend: "₹12,000/month",
        location: "Mumbai",
        skills: ["Node.js", "Python", "MongoDB", "Express", "Docker"],
        experience: "1.5 years",
        education: "B.Tech Information Technology - NIT Surat",
        notes: "Good problem-solving skills, needs improvement in system design",
        auditTrail: [
          { action: "Allocated", user: "System", timestamp: "2024-02-18 09:15:00", details: "Auto-allocated based on matching algorithm" },
          { action: "Flagged", user: "System", timestamp: "2024-02-18 09:16:00", details: "Flagged for manual review due to quota constraints" }
        ]
      },
      {
        id: 3,
        candidateName: "Mike Johnson",
        candidateEmail: "mike.johnson@email.com",
        companyName: "WebTech Ltd",
        postingTitle: "Frontend Developer Intern",
        category: "General",
        matchScore: 85,
        status: "Rejected",
        allocatedDate: "2024-02-20",
        startDate: "2024-03-01",
        duration: "6 months",
        stipend: "₹15,000/month",
        location: "Delhi",
        skills: ["React", "Vue.js", "JavaScript", "CSS", "Bootstrap"],
        experience: "1 year",
        education: "B.Tech Computer Science - VIT Vellore",
        notes: "Creative designer but limited backend knowledge",
        auditTrail: [
          { action: "Allocated", user: "System", timestamp: "2024-02-20 11:30:00", details: "Auto-allocated based on matching algorithm" },
          { action: "Reviewed", user: "Admin User", timestamp: "2024-02-20 15:45:00", details: "Manual review completed" },
          { action: "Rejected", user: "Admin User", timestamp: "2024-02-20 15:50:00", details: "Rejected due to insufficient technical skills" }
        ]
      },
      {
        id: 4,
        candidateName: "Sarah Wilson",
        candidateEmail: "sarah.wilson@email.com",
        companyName: "StartupXYZ",
        postingTitle: "Data Science Intern",
        category: "Women",
        matchScore: 90,
        status: "Approved",
        allocatedDate: "2024-02-16",
        startDate: "2024-03-01",
        duration: "6 months",
        stipend: "₹20,000/month",
        location: "Pune",
        skills: ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn"],
        experience: "2 years",
        education: "M.Tech Data Science - IISc Bangalore",
        notes: "Overqualified for the position but excellent fit",
        auditTrail: [
          { action: "Allocated", user: "System", timestamp: "2024-02-16 08:45:00", details: "Auto-allocated based on matching algorithm" },
          { action: "Reviewed", user: "Admin User", timestamp: "2024-02-16 12:30:00", details: "Manual review completed" },
          { action: "Approved", user: "Admin User", timestamp: "2024-02-16 12:35:00", details: "Allocation approved for final processing" }
        ]
      },
      {
        id: 5,
        candidateName: "David Brown",
        candidateEmail: "david.brown@email.com",
        companyName: "DesignStudio",
        postingTitle: "UI/UX Design Intern",
        category: "SC",
        matchScore: 87,
        status: "Pending Review",
        allocatedDate: "2024-02-22",
        startDate: "2024-03-01",
        duration: "3 months",
        stipend: "₹10,000/month",
        location: "Hyderabad",
        skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "Wireframing"],
        experience: "1 year",
        education: "B.Tech Computer Science - BITS Pilani",
        notes: "Strong design portfolio, good communication skills",
        auditTrail: [
          { action: "Allocated", user: "System", timestamp: "2024-02-22 13:20:00", details: "Auto-allocated based on matching algorithm" },
          { action: "Flagged", user: "System", timestamp: "2024-02-22 13:21:00", details: "Flagged for manual review due to quota constraints" }
        ]
      }
    ];

    setAllocations(mockAllocations);
    setFilteredAllocations(mockAllocations);
  }, []);

  useEffect(() => {
    let filtered = allocations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(allocation =>
        allocation.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.postingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        allocation.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(allocation => allocation.status === filters.status);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(allocation => allocation.category === filters.category);
    }

    // Company filter
    if (filters.company !== 'all') {
      filtered = filtered.filter(allocation => allocation.companyName === filters.company);
    }

    // Match score filter
    filtered = filtered.filter(allocation => allocation.matchScore >= filters.matchScore);

    setFilteredAllocations(filtered);
  }, [allocations, searchTerm, filters]);

  const handleStatusChange = (allocationId, newStatus) => {
    setAllocations(prev => 
      prev.map(allocation => 
        allocation.id === allocationId ? { ...allocation, status: newStatus } : allocation
      )
    );
  };

  const handleSelectAllocation = (allocationId) => {
    setSelectedAllocations(prev => 
      prev.includes(allocationId) 
        ? prev.filter(id => id !== allocationId)
        : [...prev, allocationId]
    );
  };

  const handleBulkAction = (action) => {
    selectedAllocations.forEach(allocationId => {
      handleStatusChange(allocationId, action);
    });
    setSelectedAllocations([]);
  };

  const handleEditAllocation = (allocation) => {
    setEditingAllocation(allocation);
    setPendingChanges({
      companyName: allocation.companyName,
      postingTitle: allocation.postingTitle,
      startDate: allocation.startDate,
      duration: allocation.duration,
      stipend: allocation.stipend,
      notes: allocation.notes
    });
  };

  const handleSaveChanges = () => {
    if (editingAllocation) {
      setAllocations(prev => 
        prev.map(allocation => 
          allocation.id === editingAllocation.id 
            ? { ...allocation, ...pendingChanges }
            : allocation
        )
      );
      setEditingAllocation(null);
      setPendingChanges({});
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'text-green-600 bg-green-100';
      case 'Pending Review': return 'text-yellow-600 bg-yellow-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      case 'Under Review': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Pending Review': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'Rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'Under Review': return <Eye className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const categories = [...new Set(allocations.map(a => a.category))];
  const companies = [...new Set(allocations.map(a => a.companyName))];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Allocation Review</h1>
          <p className="text-gray-600 mt-2">
            Review, approve, and manage candidate allocations to internship positions.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="card mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, company, or posting..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-4 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="input-field"
                  >
                    <option value="all">All Status</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="input-field"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Company Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <select
                    value={filters.company}
                    onChange={(e) => setFilters({...filters, company: e.target.value})}
                    className="input-field"
                  >
                    <option value="all">All Companies</option>
                    {companies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>

                {/* Match Score Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Match Score: {filters.matchScore}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.matchScore}
                    onChange={(e) => setFilters({...filters, matchScore: parseInt(e.target.value)})}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedAllocations.length > 0 && (
          <div className="card mb-6 bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-medium">
                {selectedAllocations.length} allocation(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('Approved')}
                  className="btn-accent text-sm px-4 py-2"
                >
                  Approve Selected
                </button>
                <button
                  onClick={() => handleBulkAction('Rejected')}
                  className="btn-secondary text-sm px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Reject Selected
                </button>
                <button
                  onClick={() => setSelectedAllocations([])}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAllocations.length} of {allocations.length} allocations
          </p>
        </div>

        {/* Allocations List */}
        <div className="space-y-6">
          {filteredAllocations.map((allocation) => (
            <div key={allocation.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedAllocations.includes(allocation.id)}
                    onChange={() => handleSelectAllocation(allocation.id)}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{allocation.candidateName}</h3>
                      <span className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${getStatusColor(allocation.status)}`}>
                        {getStatusIcon(allocation.status)}
                        <span>{allocation.status}</span>
                      </span>
                      <div className="text-2xl font-bold text-primary">{allocation.matchScore}%</div>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600 text-sm mb-3">
                      <div className="flex items-center space-x-1">
                        <Building2 className="w-4 h-4" />
                        <span>{allocation.companyName}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{allocation.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Allocated: {new Date(allocation.allocatedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{allocation.notes}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditAllocation(allocation)}
                    className="p-2 text-gray-400 hover:text-primary"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Allocation Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Allocation Details:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Posting: {allocation.postingTitle}</div>
                    <div>Start Date: {new Date(allocation.startDate).toLocaleDateString()}</div>
                    <div>Duration: {allocation.duration}</div>
                    <div>Stipend: {allocation.stipend}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Candidate Details:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Category: {allocation.category}</div>
                    <div>Experience: {allocation.experience}</div>
                    <div>Education: {allocation.education}</div>
                    <div>Email: {allocation.candidateEmail}</div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {allocation.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Allocation ID: #{allocation.id.toString().padStart(4, '0')}
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={allocation.status}
                    onChange={(e) => handleStatusChange(allocation.id, e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="Pending Review">Pending Review</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approve</option>
                    <option value="Rejected">Reject</option>
                  </select>
                  <button className="btn-primary text-sm px-4 py-2">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Allocations */}
        {filteredAllocations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No allocations found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find more allocations.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({status: 'all', category: 'all', company: 'all', matchScore: 0});
              }}
              className="btn-primary"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllocationReview;
