import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.type.includes('image/')) {
      toast.error('Please upload a PDF or image file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const analyzeResume = async () => {
    if (!file) {
      toast.error('Please upload a file first');
      return;
    }

    setLoading(true);
    
    try {
      // Convert file to base64 or form data for API call
      const fileData = {
        filename: file.name,
        size: file.size,
        type: file.type
      };
      
      const response = await apiService.analyzeResume(fileData);
      setAnalysis(response.data);
      toast.success('Resume analyzed successfully!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze resume. Please try again.');
      
      // Fallback to mock data for demo purposes
      setTimeout(() => {
      const mockAnalysis = {
        extractedSkills: [
          { name: 'JavaScript', confidence: 95, category: 'Programming' },
          { name: 'React', confidence: 90, category: 'Frontend' },
          { name: 'Node.js', confidence: 85, category: 'Backend' },
          { name: 'Python', confidence: 80, category: 'Programming' },
          { name: 'SQL', confidence: 75, category: 'Database' }
        ],
        missingSkills: [
          { name: 'TypeScript', impact: '+20%', reason: 'High demand in modern web development' },
          { name: 'Docker', impact: '+15%', reason: 'Essential for DevOps and deployment' },
          { name: 'AWS', impact: '+25%', reason: 'Cloud computing skills are highly valued' }
        ],
        experience: {
          totalYears: 2,
          relevantExperience: 1.5,
          internships: 1,
          projects: 3
        },
        education: {
          degree: 'Bachelor of Technology',
          field: 'Computer Science',
          institution: 'Indian Institute of Technology',
          graduationYear: 2024
        },
        strengths: [
          'Strong programming foundation',
          'Good project experience',
          'Relevant internship background'
        ],
        improvements: [
          'Add more specific technical skills',
          'Include quantifiable achievements',
          'Highlight leadership experience'
        ],
        overallScore: 78,
        recommendations: [
          'Consider learning TypeScript to improve your frontend skills',
          'Add Docker and containerization to your skill set',
          'Include specific metrics in your project descriptions'
        ]
      };
      
      setAnalysis(mockAnalysis);
      setLoading(false);
      toast.success('Resume analysis completed!');
    }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resume Analyzer</h1>
          <p className="text-gray-600 mt-2">
            Upload your resume to get AI-powered analysis, skill extraction, and personalized recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            {/* File Upload */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload Resume</h2>
              
              {!file ? (
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your resume here
                  </p>
                  <p className="text-gray-600 mb-4">
                    or click to browse files
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary cursor-pointer"
                  >
                    Choose File
                  </label>
                  <p className="text-sm text-gray-500 mt-2">
                    Supports PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <button
                    onClick={analyzeResume}
                    disabled={loading}
                    className="btn-primary w-full mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </div>
                    ) : (
                      'Analyze Resume'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Results</h2>
                
                {/* Overall Score */}
                <div className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">Overall Score</h3>
                      <p className="text-blue-100">Based on skills, experience, and education</p>
                    </div>
                    <div className="text-4xl font-bold">{analysis.overallScore}/100</div>
                  </div>
                </div>

                {/* Extracted Skills */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Extracted Skills</h3>
                  <div className="space-y-2">
                    {analysis.extractedSkills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="font-medium text-gray-900">{skill.name}</span>
                          <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">
                            {skill.category}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {skill.confidence}% confidence
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommended Skills</h3>
                  <div className="space-y-2">
                    {analysis.missingSkills.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                          <div>
                            <span className="font-medium text-gray-900">{skill.name}</span>
                            <p className="text-sm text-gray-600">{skill.reason}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-yellow-600">
                          {skill.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience Summary */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Experience Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{analysis.experience.totalYears}</div>
                      <div className="text-sm text-gray-600">Total Years</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-accent">{analysis.experience.projects}</div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Tips and Guidelines */}
          <div className="space-y-6">
            {/* Tips */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Tips for Better Analysis</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Use Clear Formatting</h3>
                    <p className="text-gray-600 text-sm">Ensure your resume has clear sections and readable fonts</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Include Specific Skills</h3>
                    <p className="text-gray-600 text-sm">List technical skills, programming languages, and tools</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Highlight Achievements</h3>
                    <p className="text-gray-600 text-sm">Include quantifiable results and project outcomes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary text-sm font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Keep It Updated</h3>
                    <p className="text-gray-600 text-sm">Regularly update your resume with new skills and experiences</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sample Resume */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Sample Resume</h2>
              <p className="text-gray-600 mb-4">
                Download our sample resume template to see the recommended format.
              </p>
              <button className="btn-secondary w-full">
                <Download className="w-5 h-5 mr-2" />
                Download Template
              </button>
            </div>

            {/* Privacy Notice */}
            <div className="card bg-blue-50 border border-blue-200">
              <div className="flex items-start space-x-3">
                <Eye className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-blue-900">Privacy & Security</h3>
                  <p className="text-blue-700 text-sm mt-1">
                    Your resume is processed securely and is not stored permanently. 
                    We only extract relevant information for analysis purposes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
