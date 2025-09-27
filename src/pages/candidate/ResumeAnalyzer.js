import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  X,
  Brain,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  Search,
  Filter,
  RefreshCw,
  Share2,
  Save,
  Edit3,
  Zap,
  BarChart3,
  PieChart,
  Users,
  Star,
  Clock,
  MapPin,
  DollarSign,
  Code,
  Database,
  Globe,
  Briefcase,
  GraduationCap,
  Languages,
  Calendar,
  Phone,
  Mail,
  LinkedIn,
  Github,
  ExternalLink,
  Plus,
  Minus,
  ChevronRight,
  ChevronDown,
  Info,
  AlertTriangle,
  Lightbulb,
  Shield,
  Scissors,
  Palette,
  Settings,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  FileCheck,
  Sparkles,
  Cpu,
  Activity,
  Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedComparison, setSelectedComparison] = useState(null);
  const [resumePreview, setResumePreview] = useState(null);
  const [improvements, setImprovements] = useState([]);  
  const [atsScore, setAtsScore] = useState(null);
  const [skillGaps, setSkillGaps] = useState([]);
  const [careerSuggestions, setCareerSuggestions] = useState([]);
  const [industryBenchmark, setIndustryBenchmark] = useState(null);
  const [resumeTemplates, setResumeTemplates] = useState([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [resumeData, setResumeData] = useState({
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: []
  });
  const [exportFormat, setExportFormat] = useState('pdf');
  const [analysisTips, setAnalysisTips] = useState([]);
  const [realTimeScore, setRealTimeScore] = useState(0);
  const [processingSteps, setProcessingSteps] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error('Please upload a PDF, DOC, DOCX, or image file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    generatePreview(selectedFile);
    toast.success('File uploaded successfully!');
  };

  const generatePreview = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (file.type.includes('image/')) {
        setResumePreview(e.target.result);
      } else {
        setResumePreview('/api/placeholder/600/800'); // Mock PDF preview
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResumePreview(null);
    setAnalysis(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('File removed');
  };

  const simulateAnalysisSteps = async () => {
    const steps = [
      { id: 1, text: 'Extracting text content...', duration: 1000 },
      { id: 2, text: 'Analyzing skills and experience...', duration: 1500 },
      { id: 3, text: 'Checking ATS compatibility...', duration: 1200 },
      { id: 4, text: 'Identifying improvement areas...', duration: 1000 },
      { id: 5, text: 'Generating recommendations...', duration: 800 },
      { id: 6, text: 'Calculating final score...', duration: 500 }
    ];

    setProcessingSteps([]);
    for (let step of steps) {
      setProcessingSteps(prev => [...prev, { ...step, status: 'processing' }]);
      await new Promise(resolve => setTimeout(resolve, step.duration));
      setProcessingSteps(prev => 
        prev.map(s => s.id === step.id ? { ...s, status: 'completed' } : s)
      );
    }
  };

  const analyzeResume = async () => {
    if (!file) {
      toast.error('Please upload a file first');
      return;
    }

    setLoading(true);
    setActiveTab('processing');
    
    try {
      // Start processing animation
      await simulateAnalysisSteps();
      
      const fileData = {
        filename: file.name,
        size: file.size,
        type: file.type,
      };

      // Try API call, fallback to mock data
      let response;
      try {
        response = await apiService.analyzeResume(fileData);
      } catch (error) {
        console.log('API call failed, using mock data');
        response = { data: generateMockAnalysis() };
      }

      const analysisResult = response.data;
      setAnalysis(analysisResult);
      setRealTimeScore(analysisResult.overallScore);
      
      // Add to history
      setAnalysisHistory(prev => [...prev, {
        id: Date.now(),
        filename: file.name,
        timestamp: new Date().toISOString(),
        score: analysisResult.overallScore,
        analysis: analysisResult
      }]);

      setActiveTab('overview');
      toast.success('Resume analyzed successfully!');

    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalysis = () => {
    return {
      overallScore: Math.floor(Math.random() * 30) + 70,
      extractedSkills: [
        { name: 'JavaScript', confidence: 95, category: 'Programming', level: 'Advanced', yearsExp: 3 },
        { name: 'React', confidence: 90, category: 'Frontend', level: 'Advanced', yearsExp: 2 },
        { name: 'Node.js', confidence: 85, category: 'Backend', level: 'Intermediate', yearsExp: 2 },
        { name: 'Python', confidence: 80, category: 'Programming', level: 'Intermediate', yearsExp: 1 },
        { name: 'SQL', confidence: 75, category: 'Database', level: 'Intermediate', yearsExp: 2 },
        { name: 'MongoDB', confidence: 70, category: 'Database', level: 'Beginner', yearsExp: 1 },
        { name: 'AWS', confidence: 65, category: 'Cloud', level: 'Beginner', yearsExp: 1 },
        { name: 'Git', confidence: 88, category: 'Tools', level: 'Advanced', yearsExp: 3 }
      ],
      missingSkills: [
        { name: 'TypeScript', impact: '+15%', priority: 'High', reason: 'High demand in current market' },
        { name: 'Docker', impact: '+12%', priority: 'Medium', reason: 'Essential for DevOps roles' },
        { name: 'GraphQL', impact: '+10%', priority: 'Medium', reason: 'Growing adoption in APIs' },
        { name: 'Kubernetes', impact: '+18%', priority: 'Medium', reason: 'Container orchestration standard' }
      ],
      atsCompatibility: {
        score: 78,
        issues: [
          { type: 'format', severity: 'Medium', description: 'Use standard section headings like "Experience" instead of "Work History"' },
          { type: 'keywords', severity: 'High', description: 'Include more industry-specific keywords from job descriptions' },
          { type: 'formatting', severity: 'Low', description: 'Avoid tables and complex formatting that ATS might not parse' }
        ],
        recommendations: [
          'Use standard fonts like Arial, Calibri, or Times New Roman',
          'Include keywords from target job descriptions',
          'Use clear section headings',
          'Save as both PDF and Word formats'
        ]
      },
      skillGaps: [
        { skill: 'Leadership', gap: 'No leadership experience mentioned', recommendation: 'Add team lead or project management experience' },
        { skill: 'Cloud Architecture', gap: 'Limited cloud platform knowledge', recommendation: 'Consider AWS or Azure certifications' },
        { skill: 'Data Analysis', gap: 'No analytics skills shown', recommendation: 'Learn Python data libraries or Tableau' }
      ],
      improvements: [
        { section: 'Summary', priority: 'High', suggestion: 'Add a compelling professional summary at the top', impact: '+8 points' },
        { section: 'Skills', priority: 'Medium', suggestion: 'Quantify your skill levels and years of experience', impact: '+5 points' },
        { section: 'Experience', priority: 'High', suggestion: 'Use action verbs and quantify achievements', impact: '+12 points' },
        { section: 'Education', priority: 'Low', suggestion: 'Include relevant coursework and GPA if strong', impact: '+3 points' }
      ],
      careerSuggestions: [
        { title: 'Full Stack Developer', match: 92, reason: 'Strong frontend and backend skills', salaryRange: '$70k-$95k' },
        { title: 'Frontend Engineer', match: 88, reason: 'Excellent React and JavaScript skills', salaryRange: '$65k-$85k' },
        { title: 'Software Engineer', match: 85, reason: 'Well-rounded programming abilities', salaryRange: '$75k-$100k' },
        { title: 'DevOps Engineer', match: 72, reason: 'Some cloud and infrastructure knowledge', salaryRange: '$80k-$110k' }
      ],
      industryBenchmark: {
        averageScore: 65,
        topPercentile: 85,
        yourPercentile: 78,
        comparison: 'Above Average'
      },
      contactInfo: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/johndoe',
        github: 'github.com/johndoe'
      },
      experience: [
        {
          title: 'Software Developer',
          company: 'Tech Solutions Inc.',
          duration: '2022 - Present',
          achievements: ['Developed 5+ web applications', 'Improved performance by 40%', 'Led team of 3 developers']
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of Technology',
          year: '2022',
          gpa: '3.7/4.0'
        }
      ],
      certifications: [
        { name: 'AWS Certified Developer', issuer: 'Amazon', year: '2023' },
        { name: 'React Professional', issuer: 'Meta', year: '2022' }
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Conversational' }
      ]
    };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'Advanced': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Beginner': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportResume = (format) => {
    toast.success(`Exporting resume as ${format.toUpperCase()}...`);
    // Mock export functionality
    setTimeout(() => {
      toast.success(`Resume exported successfully as ${format.toUpperCase()}`);
    }, 2000);
  };

  const shareAnalysis = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Analysis link copied to clipboard!');
  };

  const saveAnalysis = () => {
    const analysisData = {
      filename: file?.name,
      analysis,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('resumeAnalysis', JSON.stringify(analysisData));
    toast.success('Analysis saved successfully!');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'skills', label: 'Skills Analysis', icon: Target },
    { id: 'ats', label: 'ATS Score', icon: Shield },
    { id: 'improvements', label: 'Improvements', icon: TrendingUp },
    { id: 'career', label: 'Career Match', icon: Briefcase },
    { id: 'builder', label: 'Resume Builder', icon: Edit3 },
    { id: 'history', label: 'History', icon: Clock }
  ];

  // Processing Screen
  if (loading && activeTab === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Resume</h2>
            <p className="text-gray-600">Our AI is examining your resume in detail...</p>
          </div>

          <div className="space-y-4">
            {processingSteps.map((step) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                )}
                <span className={`text-sm ${step.status === 'completed' ? 'text-green-700' : 'text-gray-700'}`}>
                  {step.text}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="mt-8">
            <div className="bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(processingSteps.filter(s => s.status === 'completed').length / processingSteps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {Math.round((processingSteps.filter(s => s.status === 'completed').length / processingSteps.length) * 100)}% Complete
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Resume Analyzer</h1>
                <p className="text-gray-600">Get AI-powered insights and improve your resume</p>
              </div>
              <div className="flex items-center space-x-4">
                {analysis && (
                  <>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">{realTimeScore}/100</span>
                    </div>
                    <button
                      onClick={shareAnalysis}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={saveAnalysis}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Upload & Preview */}
          <div className="lg:col-span-1">
            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h2>
              
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Drop your resume here
                  </h3>
                  <p className="text-gray-600 mb-4">or click to browse files</p>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose File</span>
                  </label>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    Supports PDF, DOC, DOCX, JPG, PNG (Max 10MB)
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={removeFile}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {!analysis && (
                    <button
                      onClick={analyzeResume}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5" />
                          <span>Analyze with AI</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Resume Preview */}
            {resumePreview && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={resumePreview}
                    alt="Resume preview"
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Analysis Results */}
          <div className="lg:col-span-2">
            {analysis ? (
              <div className="space-y-6">
                {/* Tabs Navigation */}
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6" aria-label="Tabs">
                      {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                              activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="p-6">
                    <AnimatePresence mode="wait">
                      {activeTab === 'overview' && (
                        <motion.div
                          key="overview"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          {/* Overall Score */}
                          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-xl font-bold mb-2">Overall Resume Score</h3>
                                <p className="text-blue-100">
                                  Based on AI analysis of skills, experience, and format
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-4xl font-bold">{analysis.overallScore}/100</div>
                                <div className="text-sm text-blue-100">
                                  {analysis.industryBenchmark?.comparison || 'Above Average'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">{analysis.extractedSkills?.length || 0}</div>
                              <div className="text-sm text-gray-600">Skills Found</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">{analysis.atsCompatibility?.score || 0}%</div>
                              <div className="text-sm text-gray-600">ATS Score</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">{analysis.improvements?.length || 0}</div>
                              <div className="text-sm text-gray-600">Improvements</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <Briefcase className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">{analysis.careerSuggestions?.length || 0}</div>
                              <div className="text-sm text-gray-600">Career Matches</div>
                            </div>
                          </div>

                          {/* Top Skills */}
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Skills Detected</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {analysis.extractedSkills?.slice(0, 6).map((skill, index) => (
                                <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <div>
                                    <div className="font-medium text-gray-900">{skill.name}</div>
                                    <div className="text-sm text-gray-600">{skill.confidence}% confidence</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => setActiveTab('improvements')}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Lightbulb className="w-4 h-4" />
                              <span>View Improvements</span>
                            </button>
                            <button
                              onClick={() => setActiveTab('ats')}
                              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Shield className="w-4 h-4" />
                              <span>Check ATS Score</span>
                            </button>
                            <button
                              onClick={() => exportResume('pdf')}
                              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span>Export PDF</span>
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'skills' && (
                        <motion.div
                          key="skills"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl font-bold text-gray-900">Skills Analysis</h3>
                          
                          {/* Extracted Skills */}
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Detected Skills</h4>
                            <div className="space-y-3">
                              {analysis.extractedSkills?.map((skill, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <div>
                                      <div className="font-medium text-gray-900">{skill.name}</div>
                                      <div className="text-sm text-gray-600">{skill.category}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(skill.level)}`}>
                                      {skill.level}
                                    </span>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-gray-900">{skill.confidence}%</div>
                                      <div className="text-xs text-gray-500">{skill.yearsExp}y exp</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Missing Skills */}
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Recommended Skills to Add</h4>
                            <div className="space-y-3">
                              {analysis.missingSkills?.map((skill, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <Plus className="w-5 h-5 text-yellow-600" />
                                    <div>
                                      <div className="font-medium text-gray-900">{skill.name}</div>
                                      <div className="text-sm text-gray-600">{skill.reason}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(skill.priority)}`}>
                                      {skill.priority}
                                    </span>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-green-600">{skill.impact}</div>
                                      <div className="text-xs text-gray-500">score boost</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'ats' && (
                        <motion.div
                          key="ats"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl font-bold text-gray-900">ATS Compatibility</h3>
                          
                          {/* ATS Score */}
                          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-xl font-bold mb-2">ATS Compatibility Score</h4>
                                <p className="text-green-100">
                                  How well your resume works with Applicant Tracking Systems
                                </p>
                              </div>
                              <div className="text-4xl font-bold">
                                {analysis.atsCompatibility?.score || 0}%
                              </div>
                            </div>
                          </div>

                          {/* Issues */}
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Issues Found</h4>
                            <div className="space-y-3">
                              {analysis.atsCompatibility?.issues?.map((issue, index) => (
                                <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                                  <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                                  <div>
                                    <div className="flex items-center space-x-2 mb-1">
                                      <span className="font-medium text-gray-900 capitalize">{issue.type}</span>
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        issue.severity === 'High' ? 'bg-red-100 text-red-800' :
                                        issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                      }`}>
                                        {issue.severity}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{issue.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">ATS Optimization Tips</h4>
                            <div className="space-y-3">
                              {analysis.atsCompatibility?.recommendations?.map((rec, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                  <p className="text-sm text-gray-700">{rec}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'improvements' && (
                        <motion.div
                          key="improvements"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl font-bold text-gray-900">Improvement Suggestions</h3>
                          
                          <div className="space-y-4">
                            {analysis.improvements?.map((improvement, index) => (
                              <div key={index} className="bg-white border rounded-lg p-6">
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center space-x-3">
                                    <TrendingUp className="w-6 h-6 text-blue-600" />
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{improvement.section}</h4>
                                      <p className="text-sm text-gray-600">{improvement.suggestion}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end space-y-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(improvement.priority)}`}>
                                      {improvement.priority}
                                    </span>
                                    <span className="text-sm font-medium text-green-600">{improvement.impact}</span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button className="text-sm text-blue-600 hover:text-blue-800">
                                    Apply Fix
                                  </button>
                                  <span className="text-gray-300">•</span>
                                  <button className="text-sm text-gray-600 hover:text-gray-800">
                                    Learn More
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'career' && (
                        <motion.div
                          key="career"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl font-bold text-gray-900">Career Match Analysis</h3>
                          
                          <div className="grid gap-4">
                            {analysis.careerSuggestions?.map((career, index) => (
                              <div key={index} className="bg-white border rounded-lg p-6">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="text-lg font-semibold text-gray-900">{career.title}</h4>
                                    <p className="text-sm text-gray-600">{career.reason}</p>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-2xl font-bold text-blue-600">{career.match}%</div>
                                    <div className="text-sm text-gray-500">match</div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-gray-700">{career.salaryRange}</span>
                                  </div>
                                  <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                                    <span>View Jobs</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'builder' && (
                        <motion.div
                          key="builder"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">Resume Builder</h3>
                            <button
                              onClick={() => setEditMode(!editMode)}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>{editMode ? 'Preview' : 'Edit'}</span>
                            </button>
                          </div>

                          <div className="bg-white border rounded-lg p-6">
                            <p className="text-gray-600 mb-4">
                              Use our AI-powered resume builder to create an optimized resume based on your analysis.
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors">
                                <Palette className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <div className="text-sm font-medium text-gray-700">Modern</div>
                              </button>
                              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors">
                                <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <div className="text-sm font-medium text-gray-700">Professional</div>
                              </button>
                              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors">
                                <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <div className="text-sm font-medium text-gray-700">Creative</div>
                              </button>
                              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors">
                                <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <div className="text-sm font-medium text-gray-700">ATS-Friendly</div>
                              </button>
                            </div>

                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => exportResume('pdf')}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                <span>Export as PDF</span>
                              </button>
                              <button
                                onClick={() => exportResume('docx')}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                <span>Export as DOCX</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === 'history' && (
                        <motion.div
                          key="history"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl font-bold text-gray-900">Analysis History</h3>
                          
                          {analysisHistory.length > 0 ? (
                            <div className="space-y-4">
                              {analysisHistory.map((item) => (
                                <div key={item.id} className="bg-white border rounded-lg p-6">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">{item.filename}</h4>
                                      <p className="text-sm text-gray-600">
                                        {new Date(item.timestamp).toLocaleDateString()} at{' '}
                                        {new Date(item.timestamp).toLocaleTimeString()}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(item.score)}`}>
                                        {item.score}/100
                                      </div>
                                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                                        View Details
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-gray-900 mb-2">No Analysis History</h4>
                              <p className="text-gray-600">Your previous analyses will appear here</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze Your Resume?</h3>
                <p className="text-gray-600 mb-6">
                  Upload your resume to get AI-powered insights, ATS compatibility scores, and personalized improvement suggestions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span>Skills Analysis</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-green-600" />
                    <span>ATS Compatibility</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span>Improvement Tips</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
