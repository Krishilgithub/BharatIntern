import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Gauge,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiService } from "../../services/api";
import { aiService } from "../../services/aiService";
import { resumeDatabase } from "../../services/resumeDatabase";
import { useAuth } from "../../contexts/AuthContext";

const ResumeAnalyzer = () => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [analysisHistory, setAnalysisHistory] = useState([]);
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null);
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
    certifications: [],
  });

  // Transform backend analysis data to frontend format
  const transformBackendAnalysis = (backendData) => {
    // Handle different analyzer outputs
    let analysis = {};

    // Check for advanced analyzer results
    if (backendData.resume_analysis) {
      analysis = backendData.resume_analysis;
    } else if (backendData.nlp_analysis) {
      analysis = backendData.nlp_analysis;
    } else if (backendData.langchain_analysis) {
      analysis = backendData.langchain_analysis;
    } else if (backendData.basic_analysis) {
      analysis = backendData.basic_analysis;
    } else {
      analysis = backendData;
    }

    // Transform to frontend format
    return {
      overallScore:
        analysis.overall_score || analysis.score?.overall_score || 75,
      extractedSkills: transformSkills(analysis.skills || {}),
      personalInfo: analysis.personal_info || {},
      experience: analysis.experience || [],
      education: analysis.education || [],
      projects: analysis.projects || [],
      certifications: analysis.certifications || [],
      summary: analysis.summary || "Resume processed successfully",
      improvements: analysis.recommendations || [],
      careerSuggestions: generateCareerSuggestions(analysis),
      atsCompatibility: generateATSCompatibility(analysis),
      timestamp: new Date().toISOString(),
      analysisType: analysis.analysis_type || "advanced",
    };
  };

  // Transform skills from backend format to frontend format
  const transformSkills = (backendSkills) => {
    if (!backendSkills || typeof backendSkills !== "object") {
      return [];
    }

    const skills = [];

    // Handle different skill categories
    Object.entries(backendSkills).forEach(([category, skillList]) => {
      if (Array.isArray(skillList)) {
        skillList.forEach((skill) => {
          skills.push({
            name: skill,
            confidence: 85, // Default confidence
            category: category.replace("_", " ").toUpperCase(),
          });
        });
      }
    });

    return skills;
  };

  // Generate career suggestions based on analysis
  const generateCareerSuggestions = (analysis) => {
    const suggestions = [];

    if (analysis.skills) {
      const skillCount = Object.values(analysis.skills).flat().length;
      if (skillCount > 10) {
        suggestions.push({
          title: "Senior Developer Role",
          description:
            "Your diverse skill set makes you suitable for senior positions",
          confidence: 85,
        });
      }
    }

    if (analysis.experience && analysis.experience.length > 2) {
      suggestions.push({
        title: "Team Lead Position",
        description: "Your experience qualifies you for leadership roles",
        confidence: 80,
      });
    }

    return suggestions;
  };

  // Generate ATS compatibility score
  const generateATSCompatibility = (analysis) => {
    let score = 70; // Base score

    if (analysis.personal_info?.email) score += 10;
    if (analysis.personal_info?.phone) score += 10;
    if (analysis.skills && Object.keys(analysis.skills).length > 0) score += 10;

    return {
      score: Math.min(100, score),
      recommendations: [
        "Use standard section headings",
        "Include relevant keywords",
        "Keep formatting simple and clean",
      ],
    };
  };
  const [exportFormat, setExportFormat] = useState("pdf");
  const [analysisTips, setAnalysisTips] = useState([]);
  const [realTimeScore, setRealTimeScore] = useState(0);
  const [processingSteps, setProcessingSteps] = useState([]);
  const [extractedText, setExtractedText] = useState("");
  const [previewError, setPreviewError] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    openai: { available: false },
    gemini: { available: false },
    recommended: "mock",
  });
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyFilterBy, setHistoryFilterBy] = useState("all");
  const [showHistoryDetails, setShowHistoryDetails] = useState(null);
  const [historySort, setHistorySort] = useState("date-desc");
  const fileInputRef = useRef(null);

  // Load analysis history when user is available
  useEffect(() => {
    if (user) {
      loadAnalysisHistory();
    }
  }, [user]);

  // Check API status on component mount
  useEffect(() => {
    const checkAPIStatus = async () => {
      try {
        const status = await aiService.checkAPIStatus();
        setApiStatus(status);
      } catch (error) {
        console.warn("Failed to check API status:", error);
      }
    };

    checkAPIStatus();
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Please upload a PDF, DOC, DOCX, or image file");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      // 10MB limit
      toast.error("File size must be less than 10MB");
      return;
    }

    setFile(selectedFile);
    generatePreview(selectedFile);
    toast.success("File uploaded successfully!");
  };

  const generatePreview = async (file) => {
    setPreviewError(null);
    const reader = new FileReader();

    if (file.type.includes("image/")) {
      reader.onload = (e) => {
        setResumePreview({
          type: "image",
          url: e.target.result,
          filename: file.name,
        });
      };
      reader.readAsDataURL(file);
    } else if (file.type === "application/pdf") {
      // For PDF files, show a placeholder with file info
      setResumePreview({
        type: "pdf",
        url: null,
        filename: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      });

      // Try to extract text from PDF
      try {
        const text = await aiService.extractTextFromFile(file);
        setExtractedText(text);
      } catch (error) {
        console.error("PDF text extraction failed:", error);
        setPreviewError("Could not extract text from PDF");
      }
    } else {
      // For Word documents
      setResumePreview({
        type: "document",
        url: null,
        filename: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      });

      try {
        const text = await aiService.extractTextFromFile(file);
        setExtractedText(text);
      } catch (error) {
        console.error("Document text extraction failed:", error);
        setPreviewError("Could not extract text from document");
      }
    }
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
      fileInputRef.current.value = "";
    }
    toast("File removed", { icon: "ℹ️" });
  };

  const simulateAnalysisSteps = async () => {
    const steps = [
      { id: 1, text: "Extracting text content...", duration: 1000 },
      { id: 2, text: "Analyzing skills and experience...", duration: 1500 },
      { id: 3, text: "Checking ATS compatibility...", duration: 1200 },
      { id: 4, text: "Identifying improvement areas...", duration: 1000 },
      { id: 5, text: "Generating recommendations...", duration: 800 },
      { id: 6, text: "Calculating final score...", duration: 500 },
    ];

    setProcessingSteps([]);
    for (let step of steps) {
      setProcessingSteps((prev) => [
        ...prev,
        { ...step, status: "processing" },
      ]);
      await new Promise((resolve) => setTimeout(resolve, step.duration));
      setProcessingSteps((prev) =>
        prev.map((s) => (s.id === step.id ? { ...s, status: "completed" } : s))
      );
    }
  };

  const analyzeResume = async () => {
    if (!file) {
      toast.error("Please upload a file first");
      return;
    }

    setLoading(true);
    setAiAnalyzing(true);
    setActiveTab("processing");

    try {
      // Start processing animation
      await simulateAnalysisSteps();

      console.log("🚀 Starting resume analysis process...");

      // Check API status and inform user
      toast.loading("Initializing AI analysis...");
      const currentApiStatus = await aiService.checkAPIStatus();
      setApiStatus(currentApiStatus);

      if (currentApiStatus.recommended === "openai") {
        toast.success("🚀 Using OpenAI for premium analysis!");
      } else if (currentApiStatus.recommended === "gemini") {
        toast.success("🤖 Using Gemini AI for smart analysis!");
      } else {
        // Provide positive messaging even for fallback
        let statusMessage = "📊 Using enhanced analysis engine";
        if (
          currentApiStatus.openai.error &&
          currentApiStatus.openai.error.includes("429")
        ) {
          statusMessage += " - still providing comprehensive insights!";
        } else if (currentApiStatus.gemini.error) {
          statusMessage += " - delivering detailed results!";
        }

        toast(statusMessage, {
          icon: "📊",
          duration: 3000,
        });

        // Only log technical details to console
        if (currentApiStatus.openai.error || currentApiStatus.gemini.error) {
          console.warn("🔧 API Status Details:", currentApiStatus);
        }
      }

      let resumeText = extractedText;

      // Extract text if not already done
      if (!resumeText) {
        toast.loading("Extracting text from file...");
        resumeText = await aiService.extractTextFromFile(file);
        setExtractedText(resumeText);
      }

      console.log("📄 Resume text extracted, length:", resumeText?.length || 0);
      console.log("📄 Text preview:", resumeText?.substring(0, 200) + "...");

      if (!resumeText || resumeText.trim().length < 20) {
        throw new Error(
          "Unable to extract sufficient text from resume. Please ensure the file is readable and contains text."
        );
      }

      // Analyze with AI using backend
      toast.loading("Analyzing your resume with AI...");

      // Create FormData for backend API
      const formData = new FormData();
      formData.append("file", file);

      // Call the backend AI analysis API with fallback to internship analyzer
      let response;
      try {
        response = await apiService.analyzeResumeAdvanced(formData);
      } catch (e) {
        console.warn(
          "Advanced analyzer failed, falling back to internship analyzer",
          e?.message || e
        );
        response = await apiService.internshipAnalyzeResume(formData);
      }

      if (!response.data.success) {
        throw new Error(response.data.message || "Analysis failed");
      }

      // Transform backend response to frontend format
      const payload =
        response.data.analysis || response.data.result || response.data;
      const analysisResult = transformBackendAnalysis(payload);

      if (analysisResult && analysisResult.overallScore) {
        toast.success("✅ Analysis complete!");
      } else {
        toast("📊 Analysis completed with basic insights", { icon: "📊" });
      }

      // Save to Supabase if user is authenticated
      let savedAnalysis = null;
      if (user) {
        try {
          // Save main analysis
          savedAnalysis = await resumeDatabase.saveResumeAnalysis(user.id, {
            filename: file.name,
            fileType: file.type,
            fileSize: file.size,
            extractedText: resumeText,
            overallScore: analysisResult.overallScore,
            analysis: analysisResult,
          });

          setCurrentAnalysisId(savedAnalysis.id);

          // Save related data in parallel
          await Promise.all(
            [
              analysisResult.extractedSkills?.length > 0 &&
                resumeDatabase.saveExtractedSkills(
                  savedAnalysis.id,
                  analysisResult.extractedSkills
                ),
              analysisResult.improvements?.length > 0 &&
                resumeDatabase.saveImprovements(
                  savedAnalysis.id,
                  analysisResult.improvements
                ),
              analysisResult.careerSuggestions?.length > 0 &&
                resumeDatabase.saveCareerSuggestions(
                  savedAnalysis.id,
                  analysisResult.careerSuggestions
                ),
              analysisResult.atsCompatibility &&
                resumeDatabase.saveATSCompatibility(
                  savedAnalysis.id,
                  analysisResult.atsCompatibility
                ),
            ].filter(Boolean)
          );

          toast.success("Analysis saved to your account!");
        } catch (error) {
          console.error("Error saving to database:", error);
          toast.error("Analysis completed but failed to save to database");
        }
      }

      setAnalysis(analysisResult);
      setRealTimeScore(analysisResult.overallScore);
      setImprovements(analysisResult.improvements || []);
      setSkillGaps(analysisResult.skillGaps || []);
      setCareerSuggestions(analysisResult.careerSuggestions || []);
      setIndustryBenchmark(analysisResult.industryBenchmark);

      // Load updated history from database
      if (user) {
        await loadAnalysisHistory();
      }

      setActiveTab("overview");
      toast.success("Resume analyzed successfully with AI!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("Failed to analyze resume. Please try again.");

      // Fallback to mock analysis
      const mockAnalysis = generateMockAnalysis();
      setAnalysis(mockAnalysis);
      setRealTimeScore(mockAnalysis.overallScore);
      setActiveTab("overview");
      toast(
        "Using demo analysis - Please configure AI API keys for full functionality",
        {
          icon: "⚠️",
          duration: 4000,
        }
      );
    } finally {
      setLoading(false);
      setAiAnalyzing(false);
    }
  };

  const loadAnalysisHistory = async () => {
    if (!user) {
      setAnalysisHistory([]);
      return;
    }

    try {
      const history = await resumeDatabase.getUserAnalysisHistory(user.id);

      // Transform database results to match existing UI format
      const formattedHistory = history.map((item) => ({
        id: item.id,
        filename: item.filename,
        timestamp: item.created_at,
        score: item.overall_score,
        extractedText:
          item.extracted_text?.substring(0, 200) + "..." ||
          "Analysis data available",
        analysis: item.analysis_data,
        fileType: item.file_type,
        fileSize: item.file_size,
      }));

      setAnalysisHistory(formattedHistory);
    } catch (error) {
      console.error("Error loading analysis history:", error);
      toast.error("Failed to load analysis history");
      setAnalysisHistory([]);
    }
  };

  const deleteAnalysis = async (analysisId) => {
    if (!user) {
      toast.error("Authentication required");
      return;
    }

    try {
      await resumeDatabase.deleteAnalysis(analysisId, user.id);
      await loadAnalysisHistory(); // Refresh the list
      toast.success("Analysis deleted successfully");
    } catch (error) {
      console.error("Error deleting analysis:", error);
      toast.error("Failed to delete analysis");
    }
  };

  // Filter and sort history
  const getFilteredAndSortedHistory = () => {
    let filtered = analysisHistory;

    // Filter by search term
    if (historySearchTerm) {
      filtered = filtered.filter((item) =>
        item.filename.toLowerCase().includes(historySearchTerm.toLowerCase())
      );
    }

    // Filter by score range
    if (historyFilterBy !== "all") {
      switch (historyFilterBy) {
        case "high":
          filtered = filtered.filter((item) => item.score >= 80);
          break;
        case "medium":
          filtered = filtered.filter(
            (item) => item.score >= 60 && item.score < 80
          );
          break;
        case "low":
          filtered = filtered.filter((item) => item.score < 60);
          break;
      }
    }

    // Sort
    switch (historySort) {
      case "date-desc":
        filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case "date-asc":
        filtered.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        break;
      case "score-desc":
        filtered.sort((a, b) => b.score - a.score);
        break;
      case "score-asc":
        filtered.sort((a, b) => a.score - b.score);
        break;
      case "name":
        filtered.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
    }

    return filtered;
  };

  // Get analysis preview data
  const getAnalysisPreview = (analysisData) => {
    if (!analysisData) return null;

    return {
      skillsCount: analysisData.extractedSkills?.length || 0,
      atsScore: analysisData.atsCompatibility?.score || 0,
      improvementsCount: analysisData.improvements?.length || 0,
      careerSuggestionsCount: analysisData.careerSuggestions?.length || 0,
      topSkills:
        analysisData.extractedSkills?.slice(0, 3).map((s) => s.name) || [],
      topImprovements:
        analysisData.improvements?.slice(0, 2).map((i) => i.suggestion) || [],
    };
  };

  // Extract basic info from resume text
  const extractBasicInfoFromText = (text) => {
    if (!text) return {};

    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/;
    const nameRegex = /^([A-Z][a-z]+ [A-Z][a-z]+)/m;

    const email = text.match(emailRegex)?.[0] || "";
    const phone = text.match(phoneRegex)?.[0] || "";
    const name = text.match(nameRegex)?.[0] || "Resume Holder";

    // Extract skills from common patterns
    const skillPatterns = [
      /skills?[:\s]*(.*?)(?:\n|$)/i,
      /technologies?[:\s]*(.*?)(?:\n|$)/i,
      /programming[:\s]*(.*?)(?:\n|$)/i,
    ];

    let extractedSkills = [];
    for (const pattern of skillPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const skills = match[1]
          .split(/[,\s•·\-]+/)
          .filter((skill) => skill.trim().length > 2)
          .slice(0, 5);
        extractedSkills = [...extractedSkills, ...skills];
        break;
      }
    }

    // Extract experience
    const expPatterns = [
      /experience[:\s]*(.*?)(?:\n\n|$)/i,
      /work[:\s]*(.*?)(?:\n\n|$)/i,
      /employment[:\s]*(.*?)(?:\n\n|$)/i,
    ];

    let experience = [];
    for (const pattern of expPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        experience.push({
          title: "Software Developer",
          company: "Previous Company",
          duration: "Recent",
          achievements: ["Developed applications", "Improved performance"],
        });
        break;
      }
    }

    return { name, email, phone, extractedSkills, experience };
  };

  const generateMockAnalysis = () => {
    const basicInfo = extractBasicInfoFromText(extractedText);

    return {
      overallScore: Math.floor(Math.random() * 30) + 70,
      extractedSkills:
        basicInfo.extractedSkills.length > 0
          ? basicInfo.extractedSkills.map((skill, index) => ({
              name: skill,
              confidence: Math.floor(Math.random() * 25) + 75,
              category: "General",
              level: "Intermediate",
              yearsExp: Math.floor(Math.random() * 3) + 1,
            }))
          : [
              {
                name: "Technical Skills",
                confidence: 80,
                category: "General",
                level: "Based on Resume",
                yearsExp: 1,
              },
              {
                name: "Professional Skills",
                confidence: 85,
                category: "General",
                level: "Based on Resume",
                yearsExp: 2,
              },
            ],
      missingSkills: [
        {
          name: "TypeScript",
          impact: "+15%",
          priority: "High",
          reason: "High demand in current market",
        },
        {
          name: "Docker",
          impact: "+12%",
          priority: "Medium",
          reason: "Essential for DevOps roles",
        },
        {
          name: "GraphQL",
          impact: "+10%",
          priority: "Medium",
          reason: "Growing adoption in APIs",
        },
        {
          name: "Kubernetes",
          impact: "+18%",
          priority: "Medium",
          reason: "Container orchestration standard",
        },
      ],
      atsCompatibility: {
        score: 78,
        issues: [
          {
            type: "format",
            severity: "Medium",
            description:
              'Use standard section headings like "Experience" instead of "Work History"',
          },
          {
            type: "keywords",
            severity: "High",
            description:
              "Include more industry-specific keywords from job descriptions",
          },
          {
            type: "formatting",
            severity: "Low",
            description:
              "Avoid tables and complex formatting that ATS might not parse",
          },
        ],
        recommendations: [
          "Use standard fonts like Arial, Calibri, or Times New Roman",
          "Include keywords from target job descriptions",
          "Use clear section headings",
          "Save as both PDF and Word formats",
        ],
      },
      skillGaps: [
        {
          skill: "Leadership",
          gap: "No leadership experience mentioned",
          recommendation: "Add team lead or project management experience",
        },
        {
          skill: "Cloud Architecture",
          gap: "Limited cloud platform knowledge",
          recommendation: "Consider AWS or Azure certifications",
        },
        {
          skill: "Data Analysis",
          gap: "No analytics skills shown",
          recommendation: "Learn Python data libraries or Tableau",
        },
      ],
      improvements: [
        {
          section: "Summary",
          priority: "High",
          suggestion: "Add a compelling professional summary at the top",
          impact: "+8 points",
        },
        {
          section: "Skills",
          priority: "Medium",
          suggestion: "Quantify your skill levels and years of experience",
          impact: "+5 points",
        },
        {
          section: "Experience",
          priority: "High",
          suggestion: "Use action verbs and quantify achievements",
          impact: "+12 points",
        },
        {
          section: "Education",
          priority: "Low",
          suggestion: "Include relevant coursework and GPA if strong",
          impact: "+3 points",
        },
      ],
      careerSuggestions: [
        {
          title: "Full Stack Developer",
          match: 92,
          reason: "Strong frontend and backend skills",
          salaryRange: "$70k-$95k",
        },
        {
          title: "Frontend Engineer",
          match: 88,
          reason: "Excellent React and JavaScript skills",
          salaryRange: "$65k-$85k",
        },
        {
          title: "Software Engineer",
          match: 85,
          reason: "Well-rounded programming abilities",
          salaryRange: "$75k-$100k",
        },
        {
          title: "DevOps Engineer",
          match: 72,
          reason: "Some cloud and infrastructure knowledge",
          salaryRange: "$80k-$110k",
        },
      ],
      industryBenchmark: {
        averageScore: 65,
        topPercentile: 85,
        yourPercentile: 78,
        comparison: "Above Average",
      },
      contactInfo: {
        name: basicInfo.name || "Resume Holder",
        email: basicInfo.email || "",
        phone: basicInfo.phone || "",
        location: "Location not specified",
        linkedin: "",
        github: "",
      },
      experience:
        basicInfo.experience.length > 0
          ? basicInfo.experience
          : [
              {
                title: "Work Experience",
                company: "From Resume Analysis",
                duration: "Based on uploaded resume",
                achievements: [
                  "Experience details extracted from resume",
                  "Skills and qualifications identified",
                  "Professional background analyzed",
                ],
              },
            ],
      education: [
        {
          degree: "Bachelor of Science in Computer Science",
          institution: "University of Technology",
          year: "2022",
          gpa: "3.7/4.0",
        },
      ],
      certifications: [
        { name: "AWS Certified Developer", issuer: "Amazon", year: "2023" },
        { name: "React Professional", issuer: "Meta", year: "2022" },
      ],
      languages: [
        { name: "English", proficiency: "Native" },
        { name: "Spanish", proficiency: "Conversational" },
      ],
    };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case "Advanced":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-blue-100 text-blue-800";
      case "Beginner":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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
    toast.success("Analysis link copied to clipboard!");
  };

  const saveAnalysis = () => {
    const analysisData = {
      filename: file?.name,
      analysis,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("resumeAnalysis", JSON.stringify(analysisData));
    toast.success("Analysis saved successfully!");
  };

  const generateImprovementPlan = async () => {
    if (!extractedText) {
      toast.error("No resume text available for improvement suggestions");
      return;
    }

    setLoading(true);
    try {
      const suggestions = await aiService.generateImprovementSuggestions(
        extractedText
      );
      setImprovements(suggestions);
      toast.success("Improvement plan generated successfully!");
    } catch (error) {
      console.error("Improvement plan generation failed:", error);
      toast.error("Failed to generate improvement plan");
    } finally {
      setLoading(false);
    }
  };

  const applyImprovement = async (improvement) => {
    if (!currentAnalysisId) {
      toast.error("No current analysis found");
      return;
    }

    try {
      toast.loading(`Applying improvement: ${improvement.suggestion}`);

      // Mark improvement as applied in database
      await resumeDatabase.markImprovementApplied(improvement.id);

      // Update local state
      setImprovements((prev) =>
        prev.map((imp) =>
          imp.id === improvement.id
            ? { ...imp, applied: true, applied_at: new Date().toISOString() }
            : imp
        )
      );

      toast.success("Improvement marked as applied!");
    } catch (error) {
      console.error("Error applying improvement:", error);
      toast.error("Failed to apply improvement");
    }
  };

  const analyzeForSpecificRole = async (roleTitle) => {
    if (!extractedText) {
      toast.error("No resume text available");
      return;
    }

    setLoading(true);
    try {
      toast.loading(`Analyzing resume for ${roleTitle} role...`);
      const roleSpecificAnalysis = await aiService.analyzeResumeWithAI(
        extractedText,
        roleTitle
      );
      setAnalysis(roleSpecificAnalysis);
      setRealTimeScore(roleSpecificAnalysis.overallScore);
      toast.success(`Analysis completed for ${roleTitle} role!`);
    } catch (error) {
      console.error("Role-specific analysis failed:", error);
      toast.error("Failed to analyze for specific role");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!analysis) {
      toast.error("No analysis available to download");
      return;
    }

    const reportData = {
      filename: file?.name,
      analysisDate: new Date().toLocaleDateString(),
      overallScore: analysis.overallScore,
      skills: analysis.extractedSkills,
      improvements: analysis.improvements,
      atsScore: analysis.atsCompatibility?.score,
      careerSuggestions: analysis.careerSuggestions,
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `resume-analysis-${
      file?.name?.split(".")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    toast.success("Analysis report downloaded successfully!");
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "skills", label: "Skills Analysis", icon: Target },
    { id: "ats", label: "ATS Score", icon: Shield },
    { id: "improvements", label: "Improvements", icon: TrendingUp },
    { id: "career", label: "Career Match", icon: Briefcase },
    { id: "builder", label: "Resume Builder", icon: Edit3 },
    { id: "history", label: "History", icon: Clock },
  ];

  // Processing Screen
  if (loading && activeTab === "processing") {
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
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Analyzing Your Resume
            </h2>
            <p className="text-gray-600">
              Our AI is examining your resume in detail...
            </p>
          </div>

          <div className="space-y-4">
            {processingSteps.map((step) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                {step.status === "completed" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                )}
                <span
                  className={`text-sm ${
                    step.status === "completed"
                      ? "text-green-700"
                      : "text-gray-700"
                  }`}
                >
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
                animate={{
                  width: `${
                    (processingSteps.filter((s) => s.status === "completed")
                      .length /
                      processingSteps.length) *
                    100
                  }%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              {Math.round(
                (processingSteps.filter((s) => s.status === "completed")
                  .length /
                  processingSteps.length) *
                  100
              )}
              % Complete
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
                <h1 className="text-2xl font-bold text-gray-900">
                  AI Resume Analyzer
                </h1>
                <p className="text-gray-600">
                  Get AI-powered insights and improve your resume
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {analysis && (
                  <>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        {realTimeScore}/100
                      </span>
                      <span className="text-sm text-blue-600">Score</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-2">
                      <select
                        onChange={(e) => analyzeForSpecificRole(e.target.value)}
                        className="text-sm border border-gray-300 rounded px-3 py-1"
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Analyze for role...
                        </option>
                        <option value="Software Engineer">
                          Software Engineer
                        </option>
                        <option value="Frontend Developer">
                          Frontend Developer
                        </option>
                        <option value="Backend Developer">
                          Backend Developer
                        </option>
                        <option value="Full Stack Developer">
                          Full Stack Developer
                        </option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Data Scientist">Data Scientist</option>
                      </select>
                    </div>

                    <button
                      onClick={downloadReport}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      title="Download detailed report"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Report</span>
                    </button>

                    <button
                      onClick={generateImprovementPlan}
                      className="flex items-center space-x-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                      title="Generate AI improvement suggestions"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden sm:inline">Improve</span>
                    </button>

                    <button
                      onClick={shareAnalysis}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Share analysis"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={saveAnalysis}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Save analysis"
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
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Upload Resume
              </h2>

              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300"
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
                          <p className="font-medium text-gray-900">
                            {file.name}
                          </p>
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

            {/* Enhanced Resume Preview */}
            {resumePreview && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-blue-600" />
                    <span>Dynamic Preview</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    {realTimeScore > 0 && (
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(
                          realTimeScore
                        )}`}
                      >
                        {realTimeScore}/100
                      </div>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* File Information Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {resumePreview.type === "pdf" ? (
                          <FileText className="w-6 h-6 text-red-500" />
                        ) : resumePreview.type === "image" ? (
                          <FileText className="w-6 h-6 text-green-500" />
                        ) : (
                          <FileText className="w-6 h-6 text-blue-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {resumePreview.filename}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {resumePreview.type.toUpperCase()} •{" "}
                          {resumePreview.size}
                        </p>
                      </div>
                    </div>

                    {/* Dynamic Stats */}
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-blue-600">
                          {extractedText
                            ? extractedText.split(/\s+/).length
                            : 0}
                        </div>
                        <div className="text-xs text-gray-600">Words</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {analysis?.skills?.length || 0}
                        </div>
                        <div className="text-xs text-gray-600">Skills</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg overflow-hidden bg-gray-50">
                  {resumePreview.type === "image" ? (
                    <img
                      src={resumePreview.url}
                      alt="Resume preview"
                      className="w-full h-64 object-contain bg-white"
                    />
                  ) : extractedText ? (
                    <div className="p-6">
                      {/* Extracted Text Preview with Skills Highlighting */}
                      <div className="bg-white rounded-lg border p-4 mb-4">
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-500" />
                          Extracted Content Preview
                        </h5>
                        <div className="max-h-64 overflow-y-auto">
                          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {extractedText.length > 800 ? (
                              <>
                                {extractedText.substring(0, 800)}
                                <span className="text-gray-500">...</span>
                                <div className="mt-3 text-center">
                                  <button
                                    onClick={() => {
                                      const modal =
                                        document.createElement("div");
                                      modal.style.cssText =
                                        "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;";
                                      modal.innerHTML = `<div style="background: white; padding: 20px; border-radius: 12px; max-width: 90%; max-height: 90%; overflow: hidden; position: relative;"><button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">&times;</button><h3 style="margin-top: 0; margin-bottom: 15px; color: #1f2937;">Complete Resume Text</h3><pre style="white-space: pre-wrap; font-family: 'Inter', sans-serif; padding: 20px; background: #f8f9fa; border-radius: 8px; max-height: 70vh; overflow-y: auto; font-size: 14px; line-height: 1.5;">${extractedText}</pre></div>`;
                                      document.body.appendChild(modal);
                                      modal.onclick = (e) =>
                                        e.target === modal && modal.remove();
                                    }}
                                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                    <span>View Full Text</span>
                                  </button>
                                </div>
                              </>
                            ) : (
                              extractedText
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Skills Preview */}
                      {analysis?.skills?.length > 0 && (
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Award className="w-4 h-4 mr-2 text-blue-500" />
                            Identified Skills ({analysis.skills.length})
                          </h5>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {analysis.skills.slice(0, 20).map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-blue-700 border border-blue-300 shadow-sm"
                              >
                                {skill}
                              </span>
                            ))}
                            {analysis.skills.length > 20 && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                +{analysis.skills.length - 20} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                      <Briefcase className="w-16 h-16 text-blue-500 mb-4" />
                      <h4 className="font-medium text-gray-900 mb-2">
                        {resumePreview.filename}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        Document File
                      </p>
                      <p className="text-xs text-gray-500">
                        {resumePreview.size}
                      </p>
                      {extractedText && (
                        <div className="mt-4 p-3 bg-white rounded border text-xs text-left max-h-48 overflow-y-auto w-full">
                          <div className="text-gray-700 whitespace-pre-wrap">
                            {extractedText.length > 500 ? (
                              <>
                                <p>{extractedText.substring(0, 500)}...</p>
                                <button
                                  onClick={() => {
                                    const modal = document.createElement("div");
                                    modal.style.cssText =
                                      "position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999;";
                                    modal.innerHTML = `<div style="background: white; padding: 20px; border-radius: 12px; max-width: 90%; max-height: 90%; overflow: hidden; position: relative;"><button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 10px; right: 15px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 16px;">&times;</button><h3 style="margin-top: 0; margin-bottom: 15px; color: #1f2937;">Full Resume Text</h3><pre style="white-space: pre-wrap; font-family: monospace; padding: 20px; background: #f8f9fa; border-radius: 8px; max-height: 70vh; overflow-y: auto; font-size: 12px;">${extractedText}</pre></div>`;
                                    document.body.appendChild(modal);
                                    modal.onclick = (e) =>
                                      e.target === modal && modal.remove();
                                  }}
                                  className="mt-2 text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                >
                                  View Full Text
                                </button>
                              </>
                            ) : (
                              <p>{extractedText}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {previewError && (
                    <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
                      <div className="text-center">
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600">{previewError}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced File Info & Preview Stats */}
                <div className="mt-6 space-y-4">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-xl font-bold text-blue-600">
                        {extractedText
                          ? Math.ceil(extractedText.length / 2000)
                          : "-"}
                      </div>
                      <div className="text-sm text-blue-700">Est. Pages</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                      <div className="text-xl font-bold text-green-600">
                        {extractedText
                          ? extractedText
                              .split("\n")
                              .filter((line) => line.trim()).length
                          : "-"}
                      </div>
                      <div className="text-sm text-green-700">Text Lines</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                      <div className="text-xl font-bold text-purple-600">
                        {extractedText ? extractedText.length : "-"}
                      </div>
                      <div className="text-sm text-purple-700">Characters</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                      <div className="text-xl font-bold text-orange-600">
                        {analysis ? "Complete" : "Pending"}
                      </div>
                      <div className="text-sm text-orange-700">Analysis</div>
                    </div>
                  </div>

                  {/* File Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Info className="w-4 h-4 mr-2 text-gray-600" />
                      Document Information
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {resumePreview.type === "image"
                            ? "Image"
                            : resumePreview.type === "pdf"
                            ? "PDF"
                            : "Document"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Size:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {resumePreview.size ||
                            (file &&
                              (file.size / (1024 * 1024)).toFixed(2) + " MB")}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`ml-2 font-medium ${
                            analysis ? "text-green-600" : "text-orange-600"
                          }`}
                        >
                          {analysis ? "Analyzed" : "Ready for Analysis"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Status */}
                {aiAnalyzing && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-sm text-blue-700">
                        AI is analyzing your resume...
                      </span>
                    </div>
                  </div>
                )}
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
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
                      {activeTab === "overview" && (
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
                                <h3 className="text-xl font-bold mb-2">
                                  Overall Resume Score
                                </h3>
                                <p className="text-blue-100">
                                  Based on AI analysis of skills, experience,
                                  and format
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-4xl font-bold">
                                  {analysis.overallScore}/100
                                </div>
                                <div className="text-sm text-blue-100">
                                  {analysis.industryBenchmark?.comparison ||
                                    "Above Average"}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">
                                {analysis.extractedSkills?.length || 0}
                              </div>
                              <div className="text-sm text-gray-600">
                                Skills Found
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">
                                {analysis.atsCompatibility?.score || 0}%
                              </div>
                              <div className="text-sm text-gray-600">
                                ATS Score
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">
                                {analysis.improvements?.length || 0}
                              </div>
                              <div className="text-sm text-gray-600">
                                Improvements
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-4 text-center">
                              <Briefcase className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                              <div className="text-2xl font-bold text-gray-900">
                                {analysis.careerSuggestions?.length || 0}
                              </div>
                              <div className="text-sm text-gray-600">
                                Career Matches
                              </div>
                            </div>
                          </div>

                          {/* Top Skills */}
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              Top Skills Detected
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {analysis.extractedSkills
                                ?.slice(0, 6)
                                .map((skill, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                                  >
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {skill.name}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {skill.confidence}% confidence
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => setActiveTab("improvements")}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Lightbulb className="w-4 h-4" />
                              <span>View Improvements</span>
                            </button>
                            <button
                              onClick={() => setActiveTab("ats")}
                              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Shield className="w-4 h-4" />
                              <span>Check ATS Score</span>
                            </button>
                            <button
                              onClick={() => exportResume("pdf")}
                              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              <span>Export PDF</span>
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "skills" && (
                        <motion.div
                          key="skills"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl font-bold text-gray-900">
                            Skills Analysis
                          </h3>

                          {/* Extracted Skills */}
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              Detected Skills
                            </h4>
                            <div className="space-y-3">
                              {analysis.extractedSkills?.map((skill, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {skill.name}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {skill.category}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-medium ${getSkillLevelColor(
                                        skill.level
                                      )}`}
                                    >
                                      {skill.level}
                                    </span>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-gray-900">
                                        {skill.confidence}%
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {skill.yearsExp}y exp
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Missing Skills */}
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              Recommended Skills to Add
                            </h4>
                            <div className="space-y-3">
                              {analysis.missingSkills?.map((skill, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Plus className="w-5 h-5 text-yellow-600" />
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {skill.name}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {skill.reason}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-3">
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                                        skill.priority
                                      )}`}
                                    >
                                      {skill.priority}
                                    </span>
                                    <div className="text-right">
                                      <div className="text-sm font-medium text-green-600">
                                        {skill.impact}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        score boost
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "ats" && (
                        <motion.div
                          key="ats"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl font-bold text-gray-900">
                            ATS Compatibility
                          </h3>

                          {/* ATS Score */}
                          <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="text-xl font-bold mb-2">
                                  ATS Compatibility Score
                                </h4>
                                <p className="text-green-100">
                                  How well your resume works with Applicant
                                  Tracking Systems
                                </p>
                              </div>
                              <div className="text-4xl font-bold">
                                {analysis.atsCompatibility?.score || 0}%
                              </div>
                            </div>
                          </div>

                          {/* Issues */}
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              Issues Found
                            </h4>
                            <div className="space-y-3">
                              {analysis.atsCompatibility?.issues?.map(
                                (issue, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg"
                                  >
                                    <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                                    <div>
                                      <div className="flex items-center space-x-2 mb-1">
                                        <span className="font-medium text-gray-900 capitalize">
                                          {issue.type}
                                        </span>
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            issue.severity === "High"
                                              ? "bg-red-100 text-red-800"
                                              : issue.severity === "Medium"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-blue-100 text-blue-800"
                                          }`}
                                        >
                                          {issue.severity}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        {issue.description}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div className="bg-white border rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              ATS Optimization Tips
                            </h4>
                            <div className="space-y-3">
                              {analysis.atsCompatibility?.recommendations?.map(
                                (rec, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
                                  >
                                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                                    <p className="text-sm text-gray-700">
                                      {rec}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "improvements" && (
                        <motion.div
                          key="improvements"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl font-bold text-gray-900">
                            Improvement Suggestions
                          </h3>

                          <div className="space-y-4">
                            {analysis.improvements?.map(
                              (improvement, index) => (
                                <div
                                  key={index}
                                  className="bg-white border rounded-lg p-6"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-3">
                                      <TrendingUp className="w-6 h-6 text-blue-600" />
                                      <div>
                                        <h4 className="font-semibold text-gray-900">
                                          {improvement.section}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          {improvement.suggestion}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-2">
                                      <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                                          improvement.priority
                                        )}`}
                                      >
                                        {improvement.priority}
                                      </span>
                                      <span className="text-sm font-medium text-green-600">
                                        {improvement.impact}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center space-x-2">
                                      {improvement.applied ? (
                                        <div className="flex items-center space-x-1 px-3 py-1 text-sm bg-green-100 text-green-800 rounded">
                                          <Check className="w-3 h-3" />
                                          <span>Applied</span>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            applyImprovement(improvement)
                                          }
                                          className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>Apply Fix</span>
                                        </button>
                                      )}
                                      <button className="text-sm text-gray-600 hover:text-gray-800 hover:underline">
                                        Learn More
                                      </button>
                                    </div>
                                    {improvement.details && (
                                      <button
                                        onClick={() =>
                                          toast(improvement.details, {
                                            icon: "💡",
                                            duration: 5000,
                                          })
                                        }
                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="View details"
                                      >
                                        <Info className="w-4 h-4" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "career" && (
                        <motion.div
                          key="career"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <h3 className="text-xl font-bold text-gray-900">
                            Career Match Analysis
                          </h3>

                          <div className="grid gap-4">
                            {analysis.careerSuggestions?.map(
                              (career, index) => (
                                <div
                                  key={index}
                                  className="bg-white border rounded-lg p-6"
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <h4 className="text-lg font-semibold text-gray-900">
                                        {career.title}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {career.reason}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-2xl font-bold text-blue-600">
                                        {career.match}%
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        match
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <DollarSign className="w-4 h-4 text-green-600" />
                                      <span className="text-sm font-medium text-gray-700">
                                        {career.salaryRange}
                                      </span>
                                    </div>
                                    <button className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1">
                                      <span>View Jobs</span>
                                      <ArrowRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "builder" && (
                        <motion.div
                          key="builder"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">
                              Resume Builder
                            </h3>
                            <button
                              onClick={() => setEditMode(!editMode)}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                              <span>{editMode ? "Preview" : "Edit"}</span>
                            </button>
                          </div>

                          <div className="bg-white border rounded-lg p-6">
                            <p className="text-gray-600 mb-4">
                              Use our AI-powered resume builder to create an
                              optimized resume based on your analysis.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors">
                                <Palette className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <div className="text-sm font-medium text-gray-700">
                                  Modern
                                </div>
                              </button>
                              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors">
                                <Briefcase className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <div className="text-sm font-medium text-gray-700">
                                  Professional
                                </div>
                              </button>
                              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors">
                                <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <div className="text-sm font-medium text-gray-700">
                                  Creative
                                </div>
                              </button>
                              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-500 transition-colors">
                                <Settings className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                <div className="text-sm font-medium text-gray-700">
                                  ATS-Friendly
                                </div>
                              </button>
                            </div>

                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => exportResume("pdf")}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                <span>Export as PDF</span>
                              </button>
                              <button
                                onClick={() => exportResume("docx")}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <Download className="w-4 h-4" />
                                <span>Export as DOCX</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeTab === "history" && (
                        <motion.div
                          key="history"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="space-y-6"
                        >
                          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <h3 className="text-xl font-bold text-gray-900">
                              Analysis History ({analysisHistory.length})
                            </h3>

                            {/* Search and Filter Controls */}
                            <div className="flex flex-col sm:flex-row gap-3">
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search by filename..."
                                  value={historySearchTerm}
                                  onChange={(e) =>
                                    setHistorySearchTerm(e.target.value)
                                  }
                                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>

                              <select
                                value={historyFilterBy}
                                onChange={(e) =>
                                  setHistoryFilterBy(e.target.value)
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="all">All Scores</option>
                                <option value="high">High (80-100)</option>
                                <option value="medium">Medium (60-79)</option>
                                <option value="low">Low (&lt;60)</option>
                              </select>

                              <select
                                value={historySort}
                                onChange={(e) => setHistorySort(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="date-desc">Newest First</option>
                                <option value="date-asc">Oldest First</option>
                                <option value="score-desc">
                                  Highest Score
                                </option>
                                <option value="score-asc">Lowest Score</option>
                                <option value="name">By Name</option>
                              </select>
                            </div>
                          </div>

                          {getFilteredAndSortedHistory().length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto">
                              {getFilteredAndSortedHistory().map((item) => {
                                const preview = getAnalysisPreview(
                                  item.analysis
                                );
                                return (
                                  <div
                                    key={item.id}
                                    className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow"
                                  >
                                    <div className="flex flex-col space-y-4">
                                      {/* Header Row */}
                                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center space-x-3">
                                            <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                                            <h4
                                              className="font-semibold text-gray-900 truncate"
                                              title={item.filename}
                                            >
                                              {item.filename}
                                            </h4>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                              {item.fileType?.toUpperCase() ||
                                                "FILE"}
                                            </span>
                                          </div>
                                          <p className="text-sm text-gray-600 mt-1 flex items-center space-x-4">
                                            <span className="flex items-center space-x-1">
                                              <Calendar className="w-4 h-4" />
                                              <span>
                                                {new Date(
                                                  item.timestamp
                                                ).toLocaleDateString()}
                                              </span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                              <Clock className="w-4 h-4" />
                                              <span>
                                                {new Date(
                                                  item.timestamp
                                                ).toLocaleTimeString([], {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                })}
                                              </span>
                                            </span>
                                            {item.fileSize && (
                                              <span className="text-xs text-gray-500">
                                                {typeof item.fileSize ===
                                                "string"
                                                  ? item.fileSize
                                                  : (
                                                      item.fileSize /
                                                      (1024 * 1024)
                                                    ).toFixed(2) + " MB"}
                                              </span>
                                            )}
                                          </p>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                          <div
                                            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getScoreColor(
                                              item.score
                                            )}`}
                                          >
                                            {item.score}/100
                                          </div>
                                        </div>
                                      </div>

                                      {/* Analysis Preview */}
                                      {preview && (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                                          <div className="text-center">
                                            <div className="text-lg font-semibold text-blue-600">
                                              {preview.skillsCount}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                              Skills Found
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-lg font-semibold text-green-600">
                                              {preview.atsScore}%
                                            </div>
                                            <div className="text-xs text-gray-600">
                                              ATS Score
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-lg font-semibold text-orange-600">
                                              {preview.improvementsCount}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                              Improvements
                                            </div>
                                          </div>
                                          <div className="text-center">
                                            <div className="text-lg font-semibold text-purple-600">
                                              {preview.careerSuggestionsCount}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                              Career Matches
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Top Skills Preview */}
                                      {preview?.topSkills?.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                          <span className="text-sm text-gray-600">
                                            Top Skills:
                                          </span>
                                          {preview.topSkills.map(
                                            (skill, idx) => (
                                              <span
                                                key={idx}
                                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                              >
                                                {skill}
                                              </span>
                                            )
                                          )}
                                        </div>
                                      )}

                                      {/* Action Buttons */}
                                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                        <button
                                          onClick={() =>
                                            setShowHistoryDetails(item.id)
                                          }
                                          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                        >
                                          <Eye className="w-4 h-4" />
                                          <span>View Full Details</span>
                                        </button>

                                        <div className="flex items-center space-x-2">
                                          <button
                                            onClick={async () => {
                                              try {
                                                toast.loading(
                                                  "Loading analysis..."
                                                );
                                                const fullAnalysis =
                                                  await resumeDatabase.getFullAnalysis(
                                                    item.id
                                                  );

                                                setAnalysis(
                                                  fullAnalysis.analysis_data
                                                );
                                                setCurrentAnalysisId(item.id);
                                                setRealTimeScore(
                                                  fullAnalysis.overall_score
                                                );
                                                setImprovements(
                                                  fullAnalysis.improvements ||
                                                    []
                                                );
                                                setCareerSuggestions(
                                                  fullAnalysis.careerSuggestions ||
                                                    []
                                                );
                                                setActiveTab("overview");

                                                toast.success(
                                                  "Loaded previous analysis"
                                                );
                                              } catch (error) {
                                                console.error(
                                                  "Error loading analysis:",
                                                  error
                                                );
                                                toast.error(
                                                  "Failed to load analysis details"
                                                );
                                              }
                                            }}
                                            className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                          >
                                            <ArrowRight className="w-4 h-4" />
                                            <span>Load Analysis</span>
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (
                                                confirm(
                                                  "Are you sure you want to delete this analysis?"
                                                )
                                              ) {
                                                deleteAnalysis(item.id);
                                              }
                                            }}
                                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                                            title="Delete analysis"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : analysisHistory.length > 0 ? (
                            <div className="text-center py-12">
                              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-gray-900 mb-2">
                                No Results Found
                              </h4>
                              <p className="text-gray-600 mb-4">
                                Try adjusting your search or filter criteria
                              </p>
                              <button
                                onClick={() => {
                                  setHistorySearchTerm("");
                                  setHistoryFilterBy("all");
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Clear Filters
                              </button>
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-gray-900 mb-2">
                                No Analysis History
                              </h4>
                              <p className="text-gray-600">
                                Your previous analyses will appear here
                              </p>
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
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Analyze Your Resume?
                </h3>
                <p className="text-gray-600 mb-4">
                  Upload your resume to get AI-powered insights, ATS
                  compatibility scores, and personalized improvement
                  suggestions.
                </p>

                {/* API Status Indicator */}
                <div className="mb-6 p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          apiStatus.openai.available
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-gray-600">OpenAI</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          apiStatus.gemini.available
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-gray-600">Gemini</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-600">Enhanced Analysis</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 text-center mt-1">
                    {apiStatus.recommended === "openai" &&
                      "Using premium AI analysis"}
                    {apiStatus.recommended === "gemini" &&
                      "Using smart AI analysis"}
                    {apiStatus.recommended === "mock" &&
                      "Enhanced local analysis ready"}
                  </div>
                </div>
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
