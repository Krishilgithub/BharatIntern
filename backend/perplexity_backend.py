"""
Perplexity AI Resume Analyzer Backend
Integrates with frontend Resume Analyzer component
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import tempfile
import os
from datetime import datetime
from typing import Optional
import PyPDF2
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="BharatIntern Perplexity API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get API key from environment
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
PERPLEXITY_AVAILABLE = bool(PERPLEXITY_API_KEY)

print("=" * 60)
print("🚀 BharatIntern Perplexity Resume Analyzer Backend")
print("=" * 60)
if PERPLEXITY_AVAILABLE:
    print("✅ Perplexity API Key loaded successfully")
else:
    print("❌ Perplexity API Key not found in environment")
print("=" * 60)


def read_resume_from_file(file_path: str) -> str:
    """Extract text from resume file (PDF, TXT, etc.)"""
    try:
        # Check if it's a PDF file
        if file_path.lower().endswith('.pdf'):
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        else:
            # Handle text files
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    return file.read()
            except UnicodeDecodeError:
                # Try with different encoding if utf-8 fails
                with open(file_path, 'r', encoding='latin-1') as file:
                    return file.read()
    except Exception as e:
        raise Exception(f"Error reading file: {str(e)}")


def analyze_resume_with_perplexity(resume_text: str, target_role: str = None, target_industry: str = None) -> dict:
    """Analyze resume using Perplexity AI"""
    
    if not PERPLEXITY_API_KEY:
        raise Exception("Perplexity API key not configured")
    
    # Truncate if too long (keep first 15000 chars to stay within token limit)
    if len(resume_text) > 15000:
        print("⚠️  Resume is long. Truncating to fit model limits...")
        resume_text = resume_text[:15000] + "\n\n[Resume truncated due to length]"
    
    # Initialize Perplexity client
    client = OpenAI(
        api_key=PERPLEXITY_API_KEY,
        base_url="https://api.perplexity.ai"
    )
    
    # Build context for the analysis
    context = ""
    if target_role:
        context += f"\nTarget Role: {target_role}"
    if target_industry:
        context += f"\nTarget Industry: {target_industry}"
    
    # Create comprehensive analysis prompt
    prompt = f"""
Analyze the following resume in detail and provide a comprehensive professional assessment.
{context}

Please provide your analysis in the following structured format:

**OVERALL SUMMARY**
Provide a 2-3 sentence overview of the candidate's profile, highlighting their key strengths and career focus.

**STRENGTHS** (List 4-6 key strengths)
• [Strength 1]
• [Strength 2]
...

**AREAS FOR IMPROVEMENT** (List 3-5 weaknesses or gaps)
• [Area 1]
• [Area 2]
...

**SKILLS ASSESSMENT**
Technical Skills: [Assessment]
Soft Skills: [Assessment]
Industry Knowledge: [Assessment]

**EXPERIENCE ANALYSIS**
Work Experience Quality: [Assessment]
Relevance to Target Role: [Assessment]
Career Progression: [Assessment]

**EDUCATION BACKGROUND**
[Assessment of educational qualifications and their relevance]

**FORMATTING & PRESENTATION**
Structure: [Assessment]
Clarity: [Assessment]
Professional Appearance: [Assessment]

**ATS COMPATIBILITY SCORE**
Score: [X/10]
Analysis: [Brief explanation of ATS readiness]

**KEY RECOMMENDATIONS** (List 5-7 specific actionable suggestions)
1. [Recommendation 1]
2. [Recommendation 2]
...

**OVERALL RATING**
Score: [X/10]
Justification: [Brief explanation of the score]

**CAREER SUGGESTIONS**
Suitable Roles: [List 3-5 job roles that match this profile]
Industries to Target: [List 2-3 industries]
Next Career Steps: [Suggestions for career growth]

Resume Content:
{resume_text}

Provide a detailed, professional, and constructive analysis.
"""
    
    try:
        # Make API call to Perplexity
        response = client.chat.completions.create(
            model="sonar-pro",  # Updated to correct Perplexity model name
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert HR professional and resume analyst with over 15 years of experience in recruiting, talent acquisition, and career counseling. You provide detailed, actionable, and constructive feedback."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=3000
        )
        
        analysis_text = response.choices[0].message.content
        
        # Parse the response into structured format
        result = {
            "success": True,
            "analysis_text": analysis_text,
            "model": "sonar-pro",
            "timestamp": datetime.now().isoformat(),
            "resume_length": len(resume_text),
            "target_role": target_role,
            "target_industry": target_industry
        }
        
        return result
        
    except Exception as e:
        raise Exception(f"Perplexity API Error: {str(e)}")


@app.get("/")
async def root():
    return {
        "message": "BharatIntern Perplexity Resume Analyzer API",
        "status": "running",
        "perplexity_available": PERPLEXITY_AVAILABLE
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "perplexity_available": PERPLEXITY_AVAILABLE,
        "version": "1.0.0"
    }


@app.get("/ai/health")
async def ai_health():
    """AI system health check"""
    return {
        "status": "operational",
        "openai": {
            "available": False,
            "status": "not_configured"
        },
        "gemini": {
            "available": False,
            "status": "not_configured"
        },
        "perplexity": {
            "available": PERPLEXITY_AVAILABLE,
            "status": "ready" if PERPLEXITY_AVAILABLE else "not_configured"
        },
        "recommended": "perplexity" if PERPLEXITY_AVAILABLE else "mock",
        "timestamp": datetime.now().isoformat()
    }


@app.post("/ai/analyze-resume-perplexity")
async def analyze_resume_endpoint(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    target_industry: Optional[str] = Form(None)
):
    """
    Analyze resume using Perplexity AI
    This endpoint is called from the frontend Resume Analyzer
    """
    try:
        print(f"\n{'='*60}")
        print(f"📄 Resume Analysis Request Received")
        print(f"{'='*60}")
        print(f"File: {file.filename}")
        print(f"Target Role: {target_role or 'Not specified'}")
        print(f"Target Industry: {target_industry or 'Not specified'}")
        
        if not PERPLEXITY_AVAILABLE:
            raise HTTPException(
                status_code=503,
                detail="Perplexity API is not configured. Please set PERPLEXITY_API_KEY environment variable."
            )
        
        # Validate file type
        filename = file.filename or "unknown_file.txt"
        if not filename.lower().endswith(('.pdf', '.txt', '.doc', '.docx')):
            raise HTTPException(
                status_code=400,
                detail="Only PDF, TXT, DOC, and DOCX files are supported"
            )
        
        # Save uploaded file temporarily
        file_ext = os.path.splitext(filename)[1] or '.txt'
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        print(f"💾 File saved temporarily: {temp_file_path}")
        
        try:
            # Extract text from resume
            print("📝 Extracting text from resume...")
            resume_text = read_resume_from_file(temp_file_path)
            print(f"✅ Text extracted: {len(resume_text)} characters")
            
            # Analyze with Perplexity
            print("🤖 Analyzing with Perplexity AI...")
            analysis_result = analyze_resume_with_perplexity(
                resume_text=resume_text,
                target_role=target_role,
                target_industry=target_industry
            )
            
            print("✅ Analysis completed successfully")
            print(f"{'='*60}\n")
            
            return JSONResponse(content=analysis_result)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ai/career-suggestions-perplexity")
async def career_suggestions_endpoint(
    file: UploadFile = File(...),
    current_role: Optional[str] = Form(None),
    experience_years: Optional[int] = Form(None)
):
    """Get career suggestions using Perplexity AI"""
    try:
        print(f"\n📊 Career Suggestions Request")
        
        if not PERPLEXITY_AVAILABLE:
            raise HTTPException(status_code=503, detail="Perplexity API not configured")
        
        # Extract resume text
        filename = file.filename or "unknown_file.txt"
        file_ext = os.path.splitext(filename)[1] or '.txt'
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            resume_text = read_resume_from_file(temp_file_path)
            
            # Create career suggestions prompt
            client = OpenAI(
                api_key=PERPLEXITY_API_KEY,
                base_url="https://api.perplexity.ai"
            )
            
            context = f"\nCurrent Role: {current_role}" if current_role else ""
            context += f"\nYears of Experience: {experience_years}" if experience_years else ""
            
            prompt = f"""
Based on the following resume, provide detailed career suggestions:
{context}

Resume:
{resume_text[:10000]}

Please provide:
1. **Next Career Steps**: Immediate career moves (2-3 options)
2. **Long-term Career Path**: 5-year career trajectory
3. **Skills to Develop**: Top 5 skills to acquire
4. **Industries to Explore**: Best-fit industries
5. **Salary Expectations**: Expected salary range for next role
6. **Networking Advice**: Where to focus networking efforts

Be specific and actionable.
"""
            
            response = client.chat.completions.create(
                model="sonar-pro",
                messages=[
                    {"role": "system", "content": "You are a career counselor and professional coach."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            return JSONResponse(content={
                "success": True,
                "suggestions": response.choices[0].message.content,
                "timestamp": datetime.now().isoformat()
            })
            
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/recommendations")
async def get_recommendations(user_id: str, limit: int = 10):
    """
    Get job recommendations for a user
    Returns mock recommendations since this is a resume analyzer backend
    """
    print(f"📊 Recommendations request for user: {user_id}, limit: {limit}")
    
    # Return mock recommendations
    return JSONResponse(content={
        "success": True,
        "recommendations": [
            {
                "id": 1,
                "title": "Software Engineer - AI/ML",
                "company": "Tech Corp",
                "location": "Remote",
                "salary": "$90k-$130k",
                "match_score": 92,
                "description": "Work on cutting-edge AI applications",
                "required_skills": ["Python", "Machine Learning", "TensorFlow"],
                "posted_date": "2024-10-15"
            },
            {
                "id": 2,
                "title": "Full Stack Developer",
                "company": "StartUp Inc",
                "location": "San Francisco, CA",
                "salary": "$85k-$120k",
                "match_score": 88,
                "description": "Build scalable web applications",
                "required_skills": ["React", "Node.js", "PostgreSQL"],
                "posted_date": "2024-10-14"
            },
            {
                "id": 3,
                "title": "Frontend Engineer",
                "company": "Design Studio",
                "location": "New York, NY",
                "salary": "$80k-$115k",
                "match_score": 85,
                "description": "Create beautiful user interfaces",
                "required_skills": ["React", "TypeScript", "CSS"],
                "posted_date": "2024-10-13"
            },
            {
                "id": 4,
                "title": "Backend Developer",
                "company": "Cloud Services",
                "location": "Remote",
                "salary": "$95k-$135k",
                "match_score": 82,
                "description": "Build robust backend systems",
                "required_skills": ["Python", "FastAPI", "AWS"],
                "posted_date": "2024-10-12"
            },
            {
                "id": 5,
                "title": "DevOps Engineer",
                "company": "Infrastructure Co",
                "location": "Austin, TX",
                "salary": "$100k-$140k",
                "match_score": 80,
                "description": "Manage cloud infrastructure",
                "required_skills": ["Docker", "Kubernetes", "AWS"],
                "posted_date": "2024-10-11"
            }
        ][:limit],
        "total": 5,
        "user_id": user_id
    })


@app.get("/applications")
async def get_applications(user_id: str):
    """
    Get job applications for a user
    Returns mock applications since this is a resume analyzer backend
    """
    print(f"📝 Applications request for user: {user_id}")
    
    # Return mock applications
    return JSONResponse(content={
        "success": True,
        "applications": [
            {
                "id": 1,
                "job_title": "Senior Software Engineer",
                "company": "Tech Giants Inc",
                "status": "Interview Scheduled",
                "applied_date": "2024-10-10",
                "last_updated": "2024-10-15",
                "interview_date": "2024-10-20",
                "notes": "First round technical interview"
            },
            {
                "id": 2,
                "job_title": "Full Stack Developer",
                "company": "StartUp Ventures",
                "status": "Under Review",
                "applied_date": "2024-10-08",
                "last_updated": "2024-10-12",
                "interview_date": None,
                "notes": "Application submitted"
            },
            {
                "id": 3,
                "job_title": "Frontend Engineer",
                "company": "Design Labs",
                "status": "Rejected",
                "applied_date": "2024-10-05",
                "last_updated": "2024-10-10",
                "interview_date": None,
                "notes": "Position filled"
            },
            {
                "id": 4,
                "job_title": "Backend Developer",
                "company": "Cloud Systems",
                "status": "Offer Received",
                "applied_date": "2024-09-28",
                "last_updated": "2024-10-14",
                "interview_date": "2024-10-05",
                "notes": "Offer pending review"
            }
        ],
        "total": 4,
        "user_id": user_id,
        "summary": {
            "total_applications": 4,
            "under_review": 1,
            "interview_scheduled": 1,
            "offers_received": 1,
            "rejected": 1
        }
    })


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"\n🌐 Starting server on http://localhost:{port}")
    print(f"📚 API Documentation: http://localhost:{port}/docs")
    print(f"❤️  Health Check: http://localhost:{port}/health")
    print(f"🤖 AI Health: http://localhost:{port}/ai/health\n")
    
    uvicorn.run(app, host="0.0.0.0", port=port)
