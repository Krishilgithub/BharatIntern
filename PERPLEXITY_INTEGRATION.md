# Perplexity AI Resume Analyzer Integration

## 🎯 Overview

This integration enables your BharatIntern platform to analyze resumes using **Perplexity AI's powerful language model** (`llama-3.1-sonar-large-128k-online`). When you click "Analyze Resume" on the website, it sends the resume to the backend, which uses Perplexity AI to provide comprehensive analysis with actionable insights.

## 📋 Features

- ✅ **Automatic Text Extraction** - Supports PDF, TXT, DOC, and DOCX files
- ✅ **Comprehensive Analysis** - Overall score, strengths, weaknesses, skills assessment
- ✅ **ATS Compatibility Check** - Analyzes resume compatibility with Applicant Tracking Systems
- ✅ **Career Suggestions** - Provides suitable job roles and industries
- ✅ **Actionable Recommendations** - Specific improvements to enhance the resume
- ✅ **Real-time Processing** - Fast analysis with visual feedback
- ✅ **Database Integration** - Saves analysis history for authenticated users

## 🔧 Setup Instructions

### 1. Environment Variables

The API key is already configured in `backend/.env`:

```env
PERPLEXITY_API_KEY=your-perplexity-api-key-here
```

### 2. Install Dependencies

```powershell
cd backend
pip install fastapi uvicorn PyPDF2 openai python-dotenv python-multipart
```

### 3. Start the Backend

**Option A: Using PowerShell Script (Recommended)**

```powershell
.\start-perplexity-backend.ps1
```

**Option B: Manual Start**

```powershell
cd backend
python perplexity_backend.py
```

### 4. Start the Frontend

In a separate terminal:

```powershell
npm run dev
```

## 🚀 Usage

### From the Website

1. **Navigate to Resume Analyzer** page as a candidate
2. **Upload your resume** (PDF, TXT, DOC, or DOCX)
3. **Click "Analyze Resume"** button
4. Wait for the analysis to complete (usually 10-30 seconds)
5. **View comprehensive results** including:
   - Overall Score (0-100)
   - Strengths and Weaknesses
   - Skills Analysis
   - ATS Compatibility Score
   - Career Suggestions
   - Actionable Recommendations

### API Endpoints

#### 1. Health Check

```
GET http://localhost:8000/health
```

#### 2. AI System Health

```
GET http://localhost:8000/ai/health
```

Returns status of all AI services (OpenAI, Gemini, Perplexity)

#### 3. Analyze Resume

```
POST http://localhost:8000/ai/analyze-resume-perplexity
Content-Type: multipart/form-data

Parameters:
- file: Resume file (required)
- target_role: Target job role (optional)
- target_industry: Target industry (optional)
```

#### 4. Career Suggestions

```
POST http://localhost:8000/ai/career-suggestions-perplexity
Content-Type: multipart/form-data

Parameters:
- file: Resume file (required)
- current_role: Current job role (optional)
- experience_years: Years of experience (optional)
```

## 📊 Response Format

### Perplexity Analysis Response

```json
{
	"success": true,
	"analysis_text": "**OVERALL SUMMARY**\\n...",
	"model": "llama-3.1-sonar-large-128k-online",
	"timestamp": "2025-10-16T12:00:00",
	"resume_length": 5432,
	"target_role": "Software Engineer",
	"target_industry": "Technology"
}
```

The frontend automatically parses this structured text into:

- Overall Score
- Summary
- Strengths (list)
- Weaknesses (list)
- Skills Assessment
- Experience Analysis
- Education Background
- ATS Compatibility
- Recommendations
- Career Suggestions

## 🔍 How It Works

### Backend Flow

1. **File Upload** - User uploads resume through frontend
2. **Text Extraction** - Backend extracts text from PDF/DOC/TXT files using PyPDF2
3. **Perplexity API Call** - Sends resume text with structured prompt to Perplexity AI
4. **Response Processing** - Receives comprehensive analysis in structured format
5. **JSON Response** - Returns analysis to frontend

### Frontend Flow

1. **File Selection** - User selects resume file
2. **API Health Check** - Checks which AI service is available (Perplexity preferred)
3. **Upload & Analyze** - Sends file to backend via FormData
4. **Parse Response** - Parses Perplexity's structured text response
5. **Display Results** - Shows analysis in interactive UI tabs
6. **Save to Database** - Stores analysis for authenticated users

## 🎨 Frontend Components

### Modified Files

1. **`src/pages/candidate/ResumeAnalyzer.js`**

   - Added `parsePerplexityAnalysis()` function
   - Updated `transformBackendAnalysis()` to handle Perplexity responses
   - Modified `analyzeResume()` to prioritize Perplexity when available
   - Added toast notifications for Perplexity status

2. **`src/services/api.js`**

   - Already has `analyzeResumeWithPerplexity()` method

3. **`backend/perplexity_backend.py`**
   - New FastAPI server dedicated to Perplexity integration
   - Handles file upload, text extraction, and API calls
   - Returns structured analysis results

## 💡 Analysis Sections

### 1. Overall Summary

Brief 2-3 sentence overview of the candidate's profile

### 2. Strengths

Key strengths and standout qualities (4-6 items)

### 3. Areas for Improvement

Weaknesses or gaps to address (3-5 items)

### 4. Skills Assessment

- Technical Skills evaluation
- Soft Skills evaluation
- Industry Knowledge assessment

### 5. Experience Analysis

- Work Experience Quality
- Relevance to Target Role
- Career Progression assessment

### 6. Education Background

Assessment of educational qualifications and relevance

### 7. Formatting & Presentation

- Structure evaluation
- Clarity assessment
- Professional Appearance rating

### 8. ATS Compatibility Score

- Score out of 10
- Analysis of ATS readiness
- Specific recommendations

### 9. Key Recommendations

5-7 specific actionable suggestions for improvement

### 10. Overall Rating

- Score out of 10 (converted to 0-100 scale)
- Justification for the score

### 11. Career Suggestions

- Suitable Roles (3-5 job titles)
- Industries to Target (2-3 industries)
- Next Career Steps

## 🔐 Security Notes

- ✅ API key stored in environment variables (not in code)
- ✅ CORS properly configured for localhost:3000
- ✅ Temporary files cleaned up after processing
- ✅ File type validation (PDF, DOC, DOCX, TXT only)
- ⚠️ **Important**: Do not commit `.env` file with API keys to Git

## 🐛 Troubleshooting

### Backend Won't Start

**Problem**: Port 8000 already in use

```
Solution:
netstat -ano | findstr :8000
taskkill /F /PID <PID>
```

**Problem**: Missing dependencies

```
Solution:
pip install -r requirements.txt
```

**Problem**: API key not found

```
Solution:
Check that backend/.env exists with PERPLEXITY_API_KEY
```

### Frontend Issues

**Problem**: "Perplexity API not configured"

```
Solution:
1. Check backend/.env has API key
2. Restart backend server
3. Check http://localhost:8000/ai/health shows perplexity.available: true
```

**Problem**: Analysis returns empty results

```
Solution:
1. Check resume file is valid PDF/TXT/DOC
2. Check backend logs for errors
3. Verify API key is valid and has credits
```

### API Issues

**Problem**: 503 Service Unavailable

```
Cause: Perplexity API not configured or backend not running
Solution: Start backend and verify API key
```

**Problem**: 500 Internal Server Error

```
Cause: Error during text extraction or API call
Solution: Check backend console logs for detailed error
```

## 📈 Performance

- **Average Analysis Time**: 10-30 seconds
- **File Size Limit**: Recommended < 5MB
- **Text Length Limit**: 15,000 characters (automatically truncated)
- **Concurrent Requests**: Handled via FastAPI async

## 🔄 Future Enhancements

- [ ] Batch resume analysis
- [ ] Resume comparison feature
- [ ] Industry-specific analysis templates
- [ ] Resume version tracking
- [ ] Export analysis as PDF report
- [ ] Multi-language resume support
- [ ] Resume builder integration

## 📞 Support

For issues or questions:

1. Check backend console logs
2. Check browser console for frontend errors
3. Verify API key validity at https://www.perplexity.ai/
4. Check that backend is running on port 8000

## 🎉 Success Indicators

When everything is working:

- ✅ Backend starts with "✅ Perplexity AI available"
- ✅ Frontend shows green indicator for Perplexity
- ✅ Toast shows "🚀 Using Perplexity AI for premium analysis!"
- ✅ Analysis completes in 10-30 seconds
- ✅ Results display in all tabs (Overview, Skills, ATS, etc.)
- ✅ Analysis saved to database for logged-in users

---

**Integration Date**: October 16, 2025  
**Status**: ✅ Fully Integrated and Ready to Use  
**AI Model**: llama-3.1-sonar-large-128k-online
