import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  Calendar, 
  MapPin, 
  Clock,
  Send,
  Download,
  Eye,
  Star,
  AlertCircle
} from 'lucide-react';

const ConfirmSelections = () => {
  const [selections, setSelections] = useState([]);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [feedback, setFeedback] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockSelections = [
      {
        id: 1,
        candidateName: "John Doe",
        email: "john.doe@email.com",
        postingTitle: "Frontend Developer Intern",
        matchScore: 92,
        status: "Selected",
        interviewDate: "2024-02-15",
        interviewTime: "10:00 AM",
        interviewer: "Sarah Johnson",
        skills: ["React", "JavaScript", "CSS", "HTML", "TypeScript"],
        experience: "2 years",
        education: "B.Tech Computer Science - IIT Delhi",
        location: "Bangalore",
        stipend: "₹15,000/month",
        startDate: "2024-03-01",
        duration: "6 months",
        notes: "Excellent technical skills and communication. Strong portfolio.",
        feedback: ""
      },
      {
        id: 2,
        candidateName: "Jane Smith",
        email: "jane.smith@email.com",
        postingTitle: "Backend Developer Intern",
        matchScore: 88,
        status: "Selected",
        interviewDate: "2024-02-18",
        interviewTime: "2:00 PM",
        interviewer: "Mike Chen",
        skills: ["Node.js", "Python", "MongoDB", "Express", "Docker"],
        experience: "1.5 years",
        education: "B.Tech Information Technology - NIT Surat",
        location: "Mumbai",
        stipend: "₹12,000/month",
        startDate: "2024-03-01",
        duration: "4 months",
        notes: "Good problem-solving skills. Needs improvement in system design.",
        feedback: ""
      },
      {
        id: 3,
        candidateName: "Mike Johnson",
        email: "mike.johnson@email.com",
        postingTitle: "Frontend Developer Intern",
        matchScore: 85,
        status: "Pending Confirmation",
        interviewDate: "2024-02-20",
        interviewTime: "11:00 AM",
        interviewer: "Sarah Johnson",
        skills: ["React", "Vue.js", "JavaScript", "CSS", "Bootstrap"],
        experience: "1 year",
        education: "B.Tech Computer Science - VIT Vellore",
        location: "Delhi",
        stipend: "₹15,000/month",
        startDate: "2024-03-01",
        duration: "6 months",
        notes: "Creative designer with good frontend skills. Limited backend knowledge.",
        feedback: ""
      },
      {
        id: 4,
        candidateName: "Sarah Wilson",
        email: "sarah.wilson@email.com",
        postingTitle: "Data Science Intern",
        matchScore: 90,
        status: "Rejected",
        interviewDate: "2024-02-16",
        interviewTime: "3:00 PM",
        interviewer: "Dr. Rajesh Kumar",
        skills: ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn"],
        experience: "2 years",
        education: "M.Tech Data Science - IISc Bangalore",
        location: "Pune",
        stipend: "₹20,000/month",
        startDate: "2024-03-01",
        duration: "6 months",
        notes: "Overqualified for the position. Recommended for senior role.",
        feedback: ""
      }
    ];

    setSelections(mockSelections);
  }, []);

  const handleStatusChange = (candidateId, newStatus) => {
    setSelections(prev => 
      prev.map(selection => 
        selection.id === candidateId ? { ...selection, status: newStatus } : selection
      )
    );
  };

  const handleFeedbackChange = (candidateId, feedbackText) => {
    setFeedback(prev => ({
      ...prev,
      [candidateId]: feedbackText
    }));
  };

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const handleBulkAction = (action) => {
    selectedCandidates.forEach(candidateId => {
      handleStatusChange(candidateId, action);
    });
    setSelectedCandidates([]);
  };

  const sendOfferLetters = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      // Update status to "Offer Sent"
      selectedCandidates.forEach(candidateId => {
        handleStatusChange(candidateId, "Offer Sent");
      });
      setSelectedCandidates([]);
    }, 2000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Selected': return 'text-green-600 bg-green-100';
      case 'Pending Confirmation': return 'text-yellow-600 bg-yellow-100';
      case 'Offer Sent': return 'text-blue-600 bg-blue-100';
      case 'Rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Selected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Pending Confirmation': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'Offer Sent': return <Send className="w-5 h-5 text-blue-500" />;
      case 'Rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const selectedCandidatesData = selections.filter(s => selectedCandidates.includes(s.id));
  const selectedCount = selections.filter(s => s.status === 'Selected').length;
  const pendingCount = selections.filter(s => s.status === 'Pending Confirmation').length;
  const rejectedCount = selections.filter(s => s.status === 'Rejected').length;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Confirm Selections</h1>
          <p className="text-gray-600 mt-2">
            Review and confirm your final selections for internship positions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{selectedCount}</div>
            <div className="text-gray-600">Selected</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{pendingCount}</div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{rejectedCount}</div>
            <div className="text-gray-600">Rejected</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary mb-2">{selections.length}</div>
            <div className="text-gray-600">Total</div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCandidates.length > 0 && (
          <div className="card mb-6 bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-blue-900 font-medium">
                {selectedCandidates.length} candidate(s) selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={sendOfferLetters}
                  disabled={loading}
                  className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Offer Letters'}
                </button>
                <button
                  onClick={() => handleBulkAction('Rejected')}
                  className="btn-secondary text-sm px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Reject Selected
                </button>
                <button
                  onClick={() => setSelectedCandidates([])}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Candidates List */}
        <div className="space-y-6">
          {selections.map((candidate) => (
            <div key={candidate.id} className="card hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.includes(candidate.id)}
                    onChange={() => handleSelectCandidate(candidate.id)}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{candidate.candidateName}</h3>
                      <span className={`px-3 py-1 text-sm rounded-full flex items-center space-x-1 ${getStatusColor(candidate.status)}`}>
                        {getStatusIcon(candidate.status)}
                        <span>{candidate.status}</span>
                      </span>
                      <div className="text-2xl font-bold text-primary">{candidate.matchScore}%</div>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-600 text-sm mb-3">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{candidate.postingTitle}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{candidate.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Interview: {new Date(candidate.interviewDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-primary">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Interview Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Interview Details:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Date: {new Date(candidate.interviewDate).toLocaleDateString()}</div>
                    <div>Time: {candidate.interviewTime}</div>
                    <div>Interviewer: {candidate.interviewer}</div>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Offer Details:</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>Stipend: {candidate.stipend}</div>
                    <div>Duration: {candidate.duration}</div>
                    <div>Start Date: {new Date(candidate.startDate).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Skills:</h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Interview Notes:</h4>
                <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">{candidate.notes}</p>
              </div>

              {/* Feedback */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Additional Feedback:
                </label>
                <textarea
                  value={feedback[candidate.id] || ''}
                  onChange={(e) => handleFeedbackChange(candidate.id, e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Add any additional feedback or notes..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  Candidate ID: #{candidate.id.toString().padStart(4, '0')}
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={candidate.status}
                    onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                    className="input-field text-sm"
                  >
                    <option value="Pending Confirmation">Pending Confirmation</option>
                    <option value="Selected">Select</option>
                    <option value="Rejected">Reject</option>
                    <option value="Offer Sent">Offer Sent</option>
                  </select>
                  <button className="btn-primary text-sm px-4 py-2">
                    View Full Profile
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-8 card bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selection Summary</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Selected Candidates:</h4>
              <div className="space-y-2">
                {selections.filter(s => s.status === 'Selected').map(candidate => (
                  <div key={candidate.id} className="flex items-center justify-between p-2 bg-white rounded-lg">
                    <span className="text-sm text-gray-900">{candidate.candidateName}</span>
                    <span className="text-sm text-gray-600">{candidate.postingTitle}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Next Steps:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Send offer letters to selected candidates</li>
                <li>• Schedule onboarding sessions</li>
                <li>• Prepare internship documentation</li>
                <li>• Set up workspace and tools access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmSelections;
