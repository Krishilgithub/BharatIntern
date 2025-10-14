import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle, 
  Play, 
  Award, 
  RefreshCw,
  Trophy,
  Target,
  TrendingUp,
  BookOpen,
  Code,
  Database,
  Brain,
  Zap,
  Star,
  ChevronRight,
  ChevronLeft,
  Timer,
  AlertCircle,
  CheckCircle2,
  XCircle,
  BarChart3,
  PieChart,
  Medal,
  Users,
  Calendar,
  Filter,
  Search,
  Download,
  Share2,
  Bookmark,
  Flag,
  Lightbulb,
  Shield,
  Gauge,
  Activity,
  Hash,
  Eye,
  ThumbsUp,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  Pause,
  SkipForward,
  HelpCircle,
  RotateCcw,
  Volume2
} from 'lucide-react';
import toast from 'react-hot-toast';

const MicroAssessments = () => {
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [userStats, setUserStats] = useState({});
  const [achievements, setAchievements] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadAssessments();
    loadUserStats();
    loadAchievements();
    loadLeaderboard();
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            finishAssessment();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft, isPaused]);

  useEffect(() => {
    filterAssessments();
  }, [assessments, filter, searchTerm, selectedDifficulty, selectedCategory, sortBy]);

  const loadAssessments = async () => {
    setLoading(true);
    try {
      // Enhanced mock data with comprehensive features
      const mockAssessments = [
        {
          id: 1,
          title: "JavaScript Fundamentals",
          description: "Master the core concepts of JavaScript including variables, functions, scope, closures, and ES6+ features.",
          duration: 30,
          questions: 25,
          difficulty: "Beginner",
          skills: ["JavaScript", "ES6", "DOM", "Async Programming", "Functions"],
          category: "Programming",
          attempts: 2,
          bestScore: 85,
          averageScore: 78,
          isCompleted: true,
          completionRate: 92,
          rating: 4.7,
          reviews: 234,
          prerequisites: [],
          estimatedTime: "30-40 minutes",
          certificateAvailable: true,
          tags: ["frontend", "web-development", "programming"],
          level: 1,
          xpReward: 100,
          thumbnail: "/api/placeholder/300/200",
          instructor: "Sarah Johnson",
          lastUpdated: "2024-01-15",
          topics: [
            "Variables and Data Types",
            "Functions and Scope",
            "Objects and Arrays",
            "ES6 Features",
            "DOM Manipulation"
          ],
          sampleQuestions: [
            "What is the difference between let, const, and var?",
            "How do closures work in JavaScript?",
            "What are arrow functions and when to use them?"
          ]
        },
        {
          id: 2,
          title: "React Development Mastery",
          description: "Comprehensive assessment covering React components, hooks, state management, performance optimization, and modern patterns.",
          duration: 45,
          questions: 30,
          difficulty: "Intermediate",
          skills: ["React", "JSX", "Hooks", "State Management", "Props", "Context API"],
          category: "Frontend",
          attempts: 3,
          bestScore: 91,
          averageScore: 87,
          isCompleted: true,
          completionRate: 88,
          rating: 4.8,
          reviews: 189,
          prerequisites: ["JavaScript Fundamentals"],
          estimatedTime: "45-60 minutes",
          certificateAvailable: true,
          tags: ["react", "frontend", "component-library"],
          level: 2,
          xpReward: 150,
          thumbnail: "/api/placeholder/300/200",
          instructor: "Alex Chen",
          lastUpdated: "2024-01-20",
          topics: [
            "Component Architecture",
            "React Hooks",
            "State Management",
            "Performance Optimization",
            "Testing React Apps"
          ],
          sampleQuestions: [
            "When would you use useCallback vs useMemo?",
            "How do you prevent unnecessary re-renders?",
            "What are the rules of hooks?"
          ]
        },
        {
          id: 3,
          title: "Data Structures & Algorithms",
          description: "Deep dive into fundamental data structures and algorithmic problem-solving techniques essential for technical interviews.",
          duration: 60,
          questions: 35,
          difficulty: "Advanced",
          skills: ["Arrays", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Sorting"],
          category: "Computer Science",
          attempts: 1,
          bestScore: 73,
          averageScore: 73,
          isCompleted: true,
          completionRate: 65,
          rating: 4.9,
          reviews: 312,
          prerequisites: ["Programming Fundamentals"],
          estimatedTime: "60-90 minutes",
          certificateAvailable: true,
          tags: ["algorithms", "data-structures", "interview-prep"],
          level: 3,
          xpReward: 200,
          thumbnail: "/api/placeholder/300/200",
          instructor: "Dr. Michael Rodriguez",
          lastUpdated: "2024-01-18",
          topics: [
            "Array and String Algorithms",
            "Linked List Operations",
            "Tree Traversals",
            "Graph Algorithms",
            "Dynamic Programming"
          ],
          sampleQuestions: [
            "Implement a function to reverse a linked list",
            "Find the longest common subsequence",
            "Design an algorithm for breadth-first search"
          ]
        },
        {
          id: 4,
          title: "Python Programming Excellence",
          description: "Comprehensive Python assessment covering syntax, OOP, libraries, data manipulation, and best practices.",
          duration: 40,
          questions: 28,
          difficulty: "Intermediate",
          skills: ["Python", "OOP", "Libraries", "Data Analysis", "Functions", "Decorators"],
          category: "Programming",
          attempts: 0,
          bestScore: 0,
          averageScore: 0,
          isCompleted: false,
          completionRate: 75,
          rating: 4.6,
          reviews: 156,
          prerequisites: ["Programming Fundamentals"],
          estimatedTime: "40-50 minutes",
          certificateAvailable: true,
          tags: ["python", "programming", "data-science"],
          level: 2,
          xpReward: 125,
          thumbnail: "/api/placeholder/300/200",
          instructor: "Emily Watson",
          lastUpdated: "2024-01-22",
          topics: [
            "Python Syntax and Idioms",
            "Object-Oriented Programming",
            "Popular Libraries",
            "Error Handling",
            "File Operations"
          ],
          sampleQuestions: [
            "How do decorators work in Python?",
            "What is the difference between @staticmethod and @classmethod?",
            "How do you handle exceptions properly?"
          ]
        },
        {
          id: 5,
          title: "SQL Database Mastery",
          description: "Advanced SQL assessment covering complex queries, optimization, indexing, and database design principles.",
          duration: 35,
          questions: 22,
          difficulty: "Intermediate",
          skills: ["SQL", "Joins", "Subqueries", "Indexing", "Normalization", "Performance"],
          category: "Database",
          attempts: 2,
          bestScore: 89,
          averageScore: 84,
          isCompleted: true,
          completionRate: 82,
          rating: 4.5,
          reviews: 201,
          prerequisites: ["Database Fundamentals"],
          estimatedTime: "35-45 minutes",
          certificateAvailable: true,
          tags: ["sql", "database", "data-analysis"],
          level: 2,
          xpReward: 130,
          thumbnail: "/api/placeholder/300/200",
          instructor: "Robert Kim",
          lastUpdated: "2024-01-25",
          topics: [
            "Complex Joins",
            "Subqueries and CTEs",
            "Window Functions",
            "Query Optimization",
            "Database Design"
          ],
          sampleQuestions: [
            "Write a query to find the second highest salary",
            "Optimize a slow-running query",
            "Design a normalized database schema"
          ]
        },
        {
          id: 6,
          title: "System Design Fundamentals",
          description: "Learn system design principles, scalability patterns, and architectural decisions for large-scale applications.",
          duration: 50,
          questions: 20,
          difficulty: "Advanced",
          skills: ["System Design", "Scalability", "Load Balancing", "Caching", "Microservices", "APIs"],
          category: "System Design",
          attempts: 0,
          bestScore: 0,
          averageScore: 0,
          isCompleted: false,
          completionRate: 58,
          rating: 4.8,
          reviews: 98,
          prerequisites: ["Software Architecture", "Database Design"],
          estimatedTime: "50-70 minutes",
          certificateAvailable: true,
          tags: ["system-design", "architecture", "scalability"],
          level: 4,
          xpReward: 250,
          thumbnail: "/api/placeholder/300/200",
          instructor: "Jennifer Liu",
          lastUpdated: "2024-01-28",
          topics: [
            "Scalability Principles",
            "Database Scaling",
            "Caching Strategies",
            "Load Balancing",
            "Microservices Architecture"
          ],
          sampleQuestions: [
            "Design a URL shortening service like bit.ly",
            "How would you scale a chat application?",
            "Design a notification system for millions of users"
          ]
        },
        {
          id: 7,
          title: "Machine Learning Basics",
          description: "Introduction to machine learning concepts, algorithms, and practical implementation techniques.",
          duration: 55,
          questions: 32,
          difficulty: "Intermediate",
          skills: ["Machine Learning", "Python", "Statistics", "Data Preprocessing", "Model Evaluation"],
          category: "Data Science",
          attempts: 1,
          bestScore: 76,
          averageScore: 76,
          isCompleted: true,
          completionRate: 68,
          rating: 4.4,
          reviews: 145,
          prerequisites: ["Python Programming", "Statistics"],
          estimatedTime: "55-70 minutes",
          certificateAvailable: true,
          tags: ["machine-learning", "ai", "data-science"],
          level: 3,
          xpReward: 180,
          thumbnail: "/api/placeholder/300/200",
          instructor: "Dr. Priya Sharma",
          lastUpdated: "2024-01-30",
          topics: [
            "Supervised Learning",
            "Unsupervised Learning",
            "Model Selection",
            "Feature Engineering",
            "Model Evaluation Metrics"
          ],
          sampleQuestions: [
            "What is the difference between precision and recall?",
            "When would you use cross-validation?",
            "How do you handle overfitting?"
          ]
        },
        {
          id: 8,
          title: "Cybersecurity Fundamentals",
          description: "Essential cybersecurity concepts, threat analysis, and security best practices for modern applications.",
          duration: 42,
          questions: 26,
          difficulty: "Intermediate",
          skills: ["Security", "Encryption", "Authentication", "OWASP", "Network Security"],
          category: "Security",
          attempts: 0,
          bestScore: 0,
          averageScore: 0,
          isCompleted: false,
          completionRate: 71,
          rating: 4.7,
          reviews: 87,
          prerequisites: ["Networking Basics"],
          estimatedTime: "42-55 minutes",
          certificateAvailable: true,
          tags: ["security", "cybersecurity", "encryption"],
          level: 2,
          xpReward: 140,
          thumbnail: "/api/placeholder/300/200",
          instructor: "Mark Thompson",
          lastUpdated: "2024-02-01",
          topics: [
            "Common Vulnerabilities",
            "Authentication Methods",
            "Encryption Techniques",
            "Network Security",
            "Secure Coding Practices"
          ],
          sampleQuestions: [
            "What is SQL injection and how to prevent it?",
            "Explain the difference between symmetric and asymmetric encryption",
            "How does OAuth 2.0 work?"
          ]
        }
      ];

      setAssessments(mockAssessments);
    } catch (error) {
      console.error("Error loading assessments:", error);
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = () => {
    setUserStats({
      totalAssessments: 8,
      completed: 5,
      totalAttempts: 9,
      averageScore: 81,
      totalXP: 685,
      currentLevel: 3,
      streak: 7,
      badges: 12,
      timeSpent: 420, // minutes
      rank: 15,
      percentile: 88
    });
  };

  const loadAchievements = () => {
    setAchievements([
      { id: 1, title: "First Assessment", description: "Complete your first assessment", unlocked: true, icon: "🎯" },
      { id: 2, title: "JavaScript Master", description: "Score 90+ in JavaScript assessment", unlocked: false, icon: "🚀" },
      { id: 3, title: "Speed Demon", description: "Complete an assessment in under 20 minutes", unlocked: true, icon: "⚡" },
      { id: 4, title: "Perfect Score", description: "Achieve 100% in any assessment", unlocked: false, icon: "🏆" },
      { id: 5, title: "Streak Master", description: "Complete 7 assessments in a row", unlocked: true, icon: "🔥" },
    ]);
  };

  const loadLeaderboard = () => {
    setLeaderboard([
      { rank: 1, name: "Alex Johnson", score: 94, assessments: 12, xp: 2340 },
      { rank: 2, name: "Sarah Chen", score: 92, assessments: 10, xp: 2180 },
      { rank: 3, name: "Mike Rodriguez", score: 90, assessments: 15, xp: 2150 },
      { rank: 4, name: "You", score: 81, assessments: 5, xp: 685 },
      { rank: 5, name: "Emma Wilson", score: 88, assessments: 8, xp: 1840 },
    ]);
  };

  const filterAssessments = useCallback(() => {
    let filtered = assessments;

    // Filter by completion status
    if (filter === 'completed') {
      filtered = filtered.filter(a => a.isCompleted);
    } else if (filter === 'not-started') {
      filtered = filtered.filter(a => a.attempts === 0);
    } else if (filter === 'in-progress') {
      filtered = filtered.filter(a => a.attempts > 0 && !a.isCompleted);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(a => a.difficulty.toLowerCase() === selectedDifficulty);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        a.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort assessments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'duration':
          return a.duration - b.duration;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.lastUpdated) - new Date(a.lastUpdated);
        case 'level':
          return a.level - b.level;
        default:
          return 0;
      }
    });

    setFilteredAssessments(filtered);
  }, [assessments, filter, searchTerm, selectedDifficulty, selectedCategory, sortBy]);

  const startAssessment = (assessment) => {
    setCurrentAssessment(assessment);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeLeft(assessment.duration * 60);
    setShowResults(false);
    setIsTimerRunning(true);
    setIsPaused(false);
    setShowHint(false);
    toast.success(`Started ${assessment.title}`);
  };

  const submitAnswer = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < currentAssessment.questions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowHint(false);
    } else {
      finishAssessment();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowHint(false);
    }
  };

  const pauseAssessment = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? 'Assessment resumed' : 'Assessment paused');
  };

  const finishAssessment = () => {
    setIsTimerRunning(false);
    
    // Calculate score based on answers and time
    const answeredQuestions = Object.keys(answers).length;
    const baseScore = Math.floor(Math.random() * 40) + 60;
    const timeBonus = timeLeft > 300 ? 5 : 0; // Bonus for finishing with time remaining
    const completionBonus = answeredQuestions === currentAssessment.questions ? 5 : 0;
    
    const finalScore = Math.min(100, baseScore + timeBonus + completionBonus);
    
    // Update assessment with new attempt
    setAssessments(prev =>
      prev.map(assessment =>
        assessment.id === currentAssessment.id
          ? {
              ...assessment,
              attempts: assessment.attempts + 1,
              bestScore: Math.max(assessment.bestScore, finalScore),
              averageScore: assessment.attempts > 0 
                ? Math.round(((assessment.averageScore * assessment.attempts) + finalScore) / (assessment.attempts + 1))
                : finalScore,
              isCompleted: true
            }
          : assessment
      )
    );

    // Update user stats
    setUserStats(prev => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      completed: prev.completed + (currentAssessment.attempts === 0 ? 1 : 0),
      totalXP: prev.totalXP + currentAssessment.xpReward,
      averageScore: Math.round(((prev.averageScore * prev.totalAttempts) + finalScore) / (prev.totalAttempts + 1))
    }));

    setShowResults(true);
    toast.success(`Assessment completed! Score: ${finalScore}%`);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'Advanced':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Programming':
        return <Code className="w-5 h-5" />;
      case 'Frontend':
        return <BookOpen className="w-5 h-5" />;
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'System Design':
        return <Brain className="w-5 h-5" />;
      case 'Data Science':
        return <BarChart3 className="w-5 h-5" />;
      case 'Security':
        return <Shield className="w-5 h-5" />;
      case 'Computer Science':
        return <Zap className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    if (score >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const mockQuestions = [
    {
      id: 1,
      question: "What is the correct way to declare a variable in JavaScript ES6+?",
      code: `// Which of these is the preferred way to declare a variable 
// that won't be reassigned?`,
      options: [
        "var name = 'John';",
        "let name = 'John';", 
        "const name = 'John';",
        "variable name = 'John';"
      ],
      correct: 2,
      explanation: "const is used for variables that won't be reassigned, providing better code clarity and preventing accidental reassignment.",
      hint: "Think about immutability and best practices in modern JavaScript.",
      difficulty: "Easy",
      topic: "Variables and Constants"
    },
    {
      id: 2,
      question: "Which array method should you use to add an element to the end of an array?",
      code: `const fruits = ['apple', 'banana'];
// Add 'orange' to the end of the array`,
      options: [
        "fruits.push('orange');",
        "fruits.append('orange');",
        "fruits.add('orange');",
        "fruits.insert('orange');"
      ],
      correct: 0,
      explanation: "push() is the correct method to add elements to the end of an array. It modifies the original array and returns the new length.",
      hint: "This method 'pushes' elements onto the end of an array.",
      difficulty: "Easy",
      topic: "Array Methods"
    }
  ];

  // Assessment Taking Interface
  if (currentAssessment && !showResults) {
    const currentQuestionData = mockQuestions[currentQuestion] || mockQuestions[0];
    const progress = ((currentQuestion + 1) / currentAssessment.questions) * 100;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Assessment Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setCurrentAssessment(null);
                      setIsTimerRunning(false);
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      {currentAssessment.title}
                    </h1>
                    <p className="text-sm text-gray-600">
                      Question {currentQuestion + 1} of {currentAssessment.questions}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Timer */}
                  <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${
                    timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <Timer className="w-4 h-4" />
                    <span className="font-mono font-medium">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  
                  {/* Pause Button */}
                  <button
                    onClick={pauseAssessment}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  </button>
                  
                  {/* Finish Button */}
                  <button
                    onClick={finishAssessment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Finish
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pause Overlay */}
        <AnimatePresence>
          {isPaused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-white rounded-xl p-8 text-center max-w-md mx-4"
              >
                <Pause className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Assessment Paused</h2>
                <p className="text-gray-600 mb-6">
                  Your progress has been saved. Click resume to continue.
                </p>
                <button
                  onClick={pauseAssessment}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Resume Assessment
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border p-8"
          >
            {/* Question Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {currentQuestionData.topic}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    currentQuestionData.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                    currentQuestionData.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {currentQuestionData.difficulty}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {currentQuestionData.question}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Show hint"
                >
                  <Lightbulb className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Flag className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Code Block */}
            {currentQuestionData.code && (
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg mb-6 font-mono text-sm">
                <pre>{currentQuestionData.code}</pre>
              </div>
            )}

            {/* Hint */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-start space-x-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">Hint</h4>
                      <p className="text-yellow-700">{currentQuestionData.hint}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestionData.options.map((option, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => submitAnswer(currentQuestion, index)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    answers[currentQuestion] === index
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === index
                        ? 'border-blue-500 bg-blue-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion] === index && (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                    </div>
                    <code className="font-mono text-sm">{option}</code>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-2">
                {Array.from({ length: Math.min(currentAssessment.questions, 10) }).map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === currentQuestion
                        ? 'bg-blue-600'
                        : answers[index] !== undefined
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
                {currentAssessment.questions > 10 && (
                  <span className="text-gray-400 text-sm">...</span>
                )}
              </div>

              <button
                onClick={nextQuestion}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>{currentQuestion === currentAssessment.questions - 1 ? 'Finish' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (showResults && currentAssessment) {
    const score = Math.floor(Math.random() * 40) + 60;
    const timeSpent = (currentAssessment.duration * 60) - timeLeft;
    const answeredQuestions = Object.keys(answers).length;

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-8 text-center"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award className="w-12 h-12 text-green-500" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Assessment Complete!
          </h1>
          
          <div className="text-6xl font-bold text-blue-600 mb-2">{score}%</div>
          <p className="text-xl text-gray-600 mb-8">
            Excellent work on completing the assessment!
          </p>

          {/* Detailed Results */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{score}%</div>
              <div className="text-sm text-gray-600">Your Score</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{answeredQuestions}</div>
              <div className="text-sm text-gray-600">Questions Answered</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{Math.floor(timeSpent / 60)}</div>
              <div className="text-sm text-gray-600">Minutes Spent</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">+{currentAssessment.xpReward}</div>
              <div className="text-sm text-gray-600">XP Earned</div>
            </div>
          </div>

          {/* Performance Analysis */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-4">Performance Analysis</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-800">Overall Performance</span>
                <span className="font-medium text-blue-900">
                  {score >= 90 ? 'Excellent' : score >= 80 ? 'Good' : score >= 70 ? 'Average' : 'Needs Improvement'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-800">Compared to Average</span>
                <span className="font-medium text-blue-900">
                  {score > currentAssessment.averageScore ? '↑ Above Average' : '↓ Below Average'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-800">Completion Rate</span>
                <span className="font-medium text-blue-900">
                  {Math.round((answeredQuestions / currentAssessment.questions) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentAssessment(null);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Assessments
            </button>
            <button
              onClick={() => startAssessment(currentAssessment)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2 inline" />
              Retake Assessment
            </button>
            <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4 mr-2 inline" />
              Download Certificate
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assessments...</p>
        </div>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Micro Assessments</h1>
                <p className="text-gray-600">Test your skills and track your progress</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <Trophy className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">{userStats.totalXP} XP</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 bg-purple-50 rounded-lg">
                  <Medal className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-purple-900">Level {userStats.currentLevel}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-sm border text-center"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.totalAssessments}</div>
            <div className="text-sm text-gray-600">Available</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-sm border text-center"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-sm border text-center"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.totalAttempts}</div>
            <div className="text-sm text-gray-600">Total Attempts</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-sm border text-center"
          >
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.averageScore}%</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-sm border text-center"
          >
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Zap className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{userStats.streak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white rounded-xl p-6 shadow-sm border text-center"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Hash className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">#{userStats.rank}</div>
            <div className="text-sm text-gray-600">Global Rank</div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assessments by title, skills, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="not-started">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="programming">Programming</option>
                <option value="frontend">Frontend</option>
                <option value="database">Database</option>
                <option value="system design">System Design</option>
                <option value="data science">Data Science</option>
                <option value="security">Security</option>
                <option value="computer science">Computer Science</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="difficulty">Sort by Difficulty</option>
                <option value="duration">Sort by Duration</option>
                <option value="rating">Sort by Rating</option>
                <option value="recent">Recently Updated</option>
                <option value="level">Sort by Level</option>
              </select>
            </div>
          </div>
        </div>

        {/* Assessments Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredAssessments.map((assessment, index) => (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300"
              >
                {/* Assessment Image/Icon */}
                <div className="relative">
                  <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl flex items-center justify-center">
                    {getCategoryIcon(assessment.category)}
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(assessment.difficulty)}`}>
                        {assessment.difficulty}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <div className="flex items-center space-x-1 text-white">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{assessment.rating}</span>
                        <span className="text-sm opacity-75">({assessment.reviews})</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {assessment.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {assessment.description}
                      </p>
                    </div>
                    <div className="ml-3">
                      {assessment.isCompleted && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">{assessment.instructor}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{assessment.questions}</div>
                      <div className="text-xs text-gray-600">Questions</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{assessment.duration}m</div>
                      <div className="text-xs text-gray-600">Duration</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">+{assessment.xpReward}</div>
                      <div className="text-xs text-gray-600">XP</div>
                    </div>
                  </div>

                  {/* Progress/Score */}
                  {assessment.bestScore > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Best Score</span>
                        <span className={`text-sm font-semibold px-2 py-1 rounded ${getScoreColor(assessment.bestScore)}`}>
                          {assessment.bestScore}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${assessment.bestScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {assessment.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {assessment.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{assessment.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{assessment.completionRate}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <RefreshCw className="w-4 h-4" />
                        <span>{assessment.attempts}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => startAssessment(assessment)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      <span>{assessment.attempts > 0 ? 'Retake' : 'Start'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAssessments.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or search terms to find assessments.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MicroAssessments;
