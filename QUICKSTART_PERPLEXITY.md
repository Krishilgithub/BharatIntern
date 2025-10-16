# 🚀 Quick Start Guide - Perplexity AI Resume Analyzer

## ✅ Setup Complete!

Your Perplexity AI integration is now fully configured and ready to use.

## 📝 What Was Done

### 1. Backend Integration ✅

- Created `backend/perplexity_backend.py` - Dedicated FastAPI server for Perplexity AI
- Added file upload and text extraction (PDF, TXT, DOC, DOCX)
- Integrated Perplexity API with structured prompts
- Added comprehensive error handling and logging

### 2. Frontend Integration ✅

- Updated `src/pages/candidate/ResumeAnalyzer.js`
- Added `parsePerplexityAnalysis()` function to parse AI responses
- Modified `transformBackendAnalysis()` to handle Perplexity format
- Updated `analyzeResume()` to prioritize Perplexity AI
- Added toast notifications for Perplexity status

### 3. Environment Configuration ✅

- API Key configured in `backend/.env`:
  ```
  PERPLEXITY_API_KEY=your-perplexity-api-key-here
  ```

### 4. Documentation ✅

- `PERPLEXITY_INTEGRATION.md` - Complete integration guide
- `start-perplexity-backend.ps1` - PowerShell startup script

## 🎯 How to Use

### Step 1: Start the Backend (Terminal 1)

**Option A: Using PowerShell Script**

```powershell
.\start-perplexity-backend.ps1
```

**Option B: Manual Start**

```powershell
cd backend
python perplexity_backend.py
```

You should see:

```
✅ Perplexity API Key loaded successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Start the Frontend (Terminal 2)

```powershell
npm run dev
```

### Step 3: Use the Resume Analyzer

1. Open your browser and navigate to `http://localhost:3000`
2. Login as a candidate
3. Go to **Resume Analyzer** page
4. Upload your resume (PDF, TXT, DOC, or DOCX)
5. Click **"Analyze Resume"** button
6. Wait 10-30 seconds for analysis
7. View comprehensive results!

## 🎨 What You'll See

### Toast Notifications

- "Initializing AI analysis..."
- "🚀 Using Perplexity AI for premium analysis!"
- "✅ Analysis complete!"

### Analysis Results

The interface will show comprehensive analysis in multiple tabs:

**📊 Overview Tab**

- Overall Score (0-100)
- Summary
- Key Strengths
- Areas for Improvement

**🎯 Skills Tab**

- Extracted Skills
- Skill Categories
- Missing Skills Suggestions

**✅ ATS Score Tab**

- ATS Compatibility Score
- Strengths and Weaknesses
- Recommendations

**💼 Career Match Tab**

- Suitable Job Roles
- Target Industries
- Next Career Steps

**📈 Improvements Tab**

- Prioritized Recommendations
- Impact Assessment
- Action Items

## 🔍 Testing the Integration

### Test 1: Health Check

```powershell
curl http://localhost:8000/health
```

Expected Response:

```json
{
	"status": "healthy",
	"perplexity_available": true
}
```

### Test 2: AI Health Check

```powershell
curl http://localhost:8000/ai/health
```

Expected Response:

```json
{
	"status": "operational",
	"perplexity": {
		"available": true,
		"status": "ready"
	},
	"recommended": "perplexity"
}
```

### Test 3: Analyze a Resume

Use the web interface to upload and analyze a resume.

## 📊 Expected Analysis Output

Perplexity AI will provide:

1. **Overall Summary** - Professional profile overview
2. **Strengths** (4-6 items) - Key strong points
3. **Weaknesses** (3-5 items) - Areas needing improvement
4. **Skills Assessment** - Technical & soft skills evaluation
5. **Experience Analysis** - Work history quality and relevance
6. **Education Background** - Academic qualifications assessment
7. **Formatting** - Resume structure and presentation
8. **ATS Compatibility** - Score and optimization tips
9. **Recommendations** (5-7 items) - Specific actionable suggestions
10. **Overall Rating** - Score out of 10 with justification
11. **Career Suggestions** - Job roles, industries, next steps

## 🎯 Key Features

✅ **Smart AI Selection** - Frontend automatically uses Perplexity if available  
✅ **Real-time Status** - Green/red indicators show AI service status  
✅ **Fallback System** - Falls back to other analyzers if needed  
✅ **Database Integration** - Saves analysis history for users  
✅ **File Support** - PDF, TXT, DOC, DOCX formats  
✅ **Fast Processing** - 10-30 second analysis time  
✅ **Detailed Insights** - Comprehensive 11-section analysis  
✅ **Career Guidance** - Job role and industry suggestions

## 🐛 Troubleshooting

### Backend Not Starting?

**Issue**: Port 8000 already in use

```powershell
netstat -ano | findstr :8000
taskkill /F /PID <process_id>
```

**Issue**: Missing packages

```powershell
pip install fastapi uvicorn PyPDF2 openai python-dotenv python-multipart
```

### Frontend Not Showing Perplexity?

1. Check backend is running: `http://localhost:8000/health`
2. Check AI health: `http://localhost:8000/ai/health`
3. Refresh browser (Ctrl+R or F5)
4. Check browser console for errors

### Analysis Failing?

1. Check file format (PDF, TXT, DOC, DOCX)
2. Check file size (< 5MB recommended)
3. Check backend logs for errors
4. Verify API key is valid

## 📈 Success Indicators

When working correctly, you should see:

**Backend Console:**

```
✅ Perplexity API Key loaded successfully
INFO: Uvicorn running on http://0.0.0.0:8000
```

**Frontend:**

- Toast: "🚀 Using Perplexity AI for premium analysis!"
- Green dot next to "Perplexity" in API status
- Analysis completes in 10-30 seconds
- All tabs populated with data

**Analysis Results:**

- Overall score displayed (0-100)
- Multiple sections with content
- Recommendations listed
- Career suggestions shown

## 🎉 You're All Set!

Your BharatIntern platform now has enterprise-grade AI resume analysis powered by Perplexity AI!

### Next Steps:

1. ✅ Start both backend and frontend
2. ✅ Upload a test resume
3. ✅ Verify analysis works correctly
4. ✅ Share with your team/users

### Need Help?

- Check `PERPLEXITY_INTEGRATION.md` for detailed documentation
- Review backend console logs for errors
- Check browser console for frontend issues

---

**Status**: ✅ Ready to Use  
**Backend**: http://localhost:8000  
**Frontend**: http://localhost:3000  
**Docs**: http://localhost:8000/docs  
**AI Model**: llama-3.1-sonar-large-128k-online
