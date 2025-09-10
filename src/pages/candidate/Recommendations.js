import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Building2, 
  Star, 
  Bookmark, 
  ExternalLink,
  ChevronDown,
  X
} from 'lucide-react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    duration: '',
    skills: [],
    matchScore: 0
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('matchScore');

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockRecommendations = [
      {
        id: 1,
        title: "Software Development Intern",
        company: "TechCorp India",
        location: "Bangalore",
        duration: "6 months",
        matchScore: 95,
        skills: ["React", "Node.js", "JavaScript", "MongoDB", "Express"],
        deadline: "2024-02-15",
        description: "Join our dynamic team to work on cutting-edge web applications using modern technologies.",
        requirements: ["Bachelor's in CS/IT", "Strong JavaScript skills", "Experience with React"],
        benefits: ["Mentorship", "Stipend", "Certificate", "Job opportunity"],
        applied: false,
        bookmarked: false
      },
      {
        id: 2,
        title: "Data Science Intern",
        company: "DataViz Solutions",
        location: "Mumbai",
        duration: "4 months",
        matchScore: 88,
        skills: ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn"],
        deadline: "2024-02-20",
        description: "Work on real-world data science projects and build machine learning models.",
        requirements: ["Python proficiency", "Statistics knowledge", "SQL experience"],
        benefits: ["Learning resources", "Stipend", "Certificate"],
        applied: false,
        bookmarked: false
      },
      {
        id: 3,
        title: "Product Management Intern",
        company: "StartupXYZ",
        location: "Delhi",
        duration: "3 months",
        matchScore: 82,
        skills: ["Product Strategy", "Analytics", "User Research", "Figma"],
        deadline: "2024-02-25",
        description: "Learn product management fundamentals and work on real product features.",
        requirements: ["Analytical thinking", "Communication skills", "Basic design knowledge"],
        benefits: ["Mentorship", "Stipend", "Certificate"],
        applied: false,
        bookmarked: false
      },
      {
        id: 4,
        title: "Full Stack Developer Intern",
        company: "WebTech Ltd",
        location: "Pune",
        duration: "5 months",
        matchScore: 90,
        skills: ["React", "Node.js", "PostgreSQL", "Docker", "AWS"],
        deadline: "2024-02-18",
        description: "Build end-to-end web applications and learn modern development practices.",
        requirements: ["Full-stack knowledge", "Database experience", "Cloud basics"],
        benefits: ["Mentorship", "Stipend", "Certificate", "Job opportunity"],
        applied: false,
        bookmarked: false
      },
      {
        id: 5,
        title: "UI/UX Design Intern",
        company: "DesignStudio",
        location: "Hyderabad",
        duration: "4 months",
        matchScore: 75,
        skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "Wireframing"],
        deadline: "2024-03-01",
        description: "Create beautiful and functional user interfaces for web and mobile applications.",
        requirements: ["Design portfolio", "Figma proficiency", "User-centered thinking"],
        benefits: ["Design tools", "Stipend", "Certificate"],
        applied: false,
        bookmarked: false
      },
      {
        id: 6,
        title: "DevOps Intern",
        company: "CloudOps Inc",
        location: "Chennai",
        duration: "6 months",
        matchScore: 85,
        skills: ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"],
        deadline: "2024-02-22",
        description: "Learn modern DevOps practices and cloud infrastructure management.",
        requirements: ["Linux knowledge", "Scripting skills", "Cloud interest"],
        benefits: ["Certification", "Stipend", "Certificate"],
        applied: false,
        bookmarked: false
      }
    ];

    setRecommendations(mockRecommendations);
    setFilteredRecommendations(mockRecommendations);
  }, []);

  useEffect(() => {
    let filtered = recommendations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(rec =>
        rec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(rec => rec.location === filters.location);
    }

    // Duration filter
    if (filters.duration) {
      filtered = filtered.filter(rec => rec.duration === filters.duration);
    }

    // Skills filter
    if (filters.skills.length > 0) {
      filtered = filtered.filter(rec =>
        filters.skills.some(skill => rec.skills.includes(skill))
      );
    }

    // Match score filter
    filtered = filtered.filter(rec => rec.matchScore >= filters.matchScore);

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return b.matchScore - a.matchScore;
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'company':
          return a.company.localeCompare(b.company);
        default:
          return 0;
      }
    });

    setFilteredRecommendations(filtered);
  }, [recommendations, searchTerm, filters, sortBy]);

  const handleApply = (recId) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recId ? { ...rec, applied: true } : rec
      )
    );
  };

  const handleBookmark = (recId) => {
    setRecommendations(prev => 
      prev.map(rec => 
        rec.id === recId ? { ...rec, bookmarked: !rec.bookmarked } : rec
      )
    );
  };

  const locations = [...new Set(recommendations.map(rec => rec.location))];
  const durations = [...new Set(recommendations.map(rec => rec.duration))];
  const allSkills = [...new Set(recommendations.flatMap(rec => rec.skills))];

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Recommendations</h1>
          <p className="text-gray-600 mt-2">
            Discover personalized internship opportunities that match your skills and interests.
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
                placeholder="Search by title, company, or skills..."
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

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="matchScore">Sort by Match Score</option>
              <option value="deadline">Sort by Deadline</option>
              <option value="company">Sort by Company</option>
            </select>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                    className="input-field"
                  >
                    <option value="">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Duration Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    value={filters.duration}
                    onChange={(e) => setFilters({...filters, duration: e.target.value})}
                    className="input-field"
                  >
                    <option value="">All Durations</option>
                    {durations.map(duration => (
                      <option key={duration} value={duration}>{duration}</option>
                    ))}
                  </select>
                </div>

                {/* Skills Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <div className="relative">
                    <select
                      multiple
                      value={filters.skills}
                      onChange={(e) => setFilters({...filters, skills: Array.from(e.target.selectedOptions, option => option.value)})}
                      className="input-field h-20"
                    >
                      {allSkills.map(skill => (
                        <option key={skill} value={skill}>{skill}</option>
                      ))}
                    </select>
                  </div>
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

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setFilters({location: '', duration: '', skills: [], matchScore: 0})}
                  className="text-primary hover:text-blue-700 font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredRecommendations.length} of {recommendations.length} recommendations
          </p>
        </div>

        {/* Recommendations Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredRecommendations.map((rec) => (
            <div key={rec.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{rec.title}</h3>
                  <div className="flex items-center space-x-4 text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Building2 className="w-4 h-4" />
                      <span>{rec.company}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{rec.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{rec.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBookmark(rec.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      rec.bookmarked 
                        ? 'text-yellow-500 bg-yellow-100' 
                        : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${rec.bookmarked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 mb-4">{rec.description}</p>

              {/* Skills */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Required Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {rec.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Benefits:</h4>
                <div className="flex flex-wrap gap-2">
                  {rec.benefits.map((benefit, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>

              {/* Match Score and Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${getMatchScoreColor(rec.matchScore).split(' ')[0]}`}>
                      {rec.matchScore}%
                    </div>
                    <div className="text-xs text-gray-500">Match Score</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Apply by {new Date(rec.deadline).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="btn-secondary text-sm px-4 py-2">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Details
                  </button>
                  <button
                    onClick={() => handleApply(rec.id)}
                    disabled={rec.applied}
                    className={`btn-primary text-sm px-4 py-2 ${
                      rec.applied 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : ''
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {rec.applied ? 'Applied' : 'Apply Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recommendations found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or filters to find more opportunities.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({location: '', duration: '', skills: [], matchScore: 0});
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

export default Recommendations;
