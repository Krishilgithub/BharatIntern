from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, List, Dict, Any
from datetime import datetime
import tempfile
import os
import uvicorn

# Import model functions from consolidated modules
MODELS_AVAILABLE = True
IMPORT_ERRORS: List[str] = []

try:
    from models.internship_resume_analyzer import process_resume_file  # type: ignore
except Exception as e:
    MODELS_AVAILABLE = False
    IMPORT_ERRORS.append(f"internship_resume_analyzer: {e}")

try:
    from models.internship_technical_assessment import (  # type: ignore
        generate_internship_technical_assessment,
        evaluate_technical_assessment,
    )
except Exception as e:
    MODELS_AVAILABLE = False
    IMPORT_ERRORS.append(f"internship_technical_assessment: {e}")

try:
    from models.internship_skill_assessor import (  # type: ignore
        assess_internship_skills,
        create_learning_roadmap,
    )
except Exception as e:
    MODELS_AVAILABLE = False
    IMPORT_ERRORS.append(f"internship_skill_assessor: {e}")

try:
    from models.internship_matcher import InternshipMatcher  # type: ignore
except Exception as e:
    MODELS_AVAILABLE = False
    IMPORT_ERRORS.append(f"internship_matcher: {e}")

# Optional: mount placement_ai JSON routes if present
PLACEMENT_ROUTERS_OK = True
try:
    from placement_ai.routes.resume import router as placement_resume_router  # type: ignore
    from placement_ai.routes.recommendations import (  # type: ignore
        router as placement_reco_router,
    )
except Exception as e:
    PLACEMENT_ROUTERS_OK = False


app = FastAPI(title="BharatIntern API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.onrender.com",
        "https://*.vercel.app",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "BharatIntern Backend is running",
        "docs": "/docs",
        "health": "/health",
        "models_available": MODELS_AVAILABLE,
        "import_errors": IMPORT_ERRORS,
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_available": MODELS_AVAILABLE,
    }


# ========== Resume Analysis (File upload) ==========
@app.post("/internship/analyze-resume")
async def analyze_internship_resume(file: UploadFile = File(...)):
    if not MODELS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Models unavailable")

    # Validate extension
    if not file.filename.lower().endswith((".pdf", ".doc", ".docx", ".txt")):
        raise HTTPException(status_code=400, detail="Only PDF/DOC/DOCX/TXT supported")

    # Persist temp file and analyze
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        result = process_resume_file(tmp_path)
        return {
            "success": True,
            "filename": file.filename,
            "analysis": result,
            "analysis_type": "internship",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {e}")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


# ========== Technical Assessment ==========
@app.post("/internship/technical-assessment")
async def technical_assessment(
    internship_role: str = Form("Software Development"),
    num_questions: int = Form(10),
    difficulty: str = Form("moderate"),
):
    if not MODELS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Models unavailable")
    try:
        questions = generate_internship_technical_assessment(
            internship_role, num_questions, difficulty
        )
        return {"success": True, "role": internship_role, "questions": questions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment generation failed: {e}")


@app.post("/internship/evaluate-assessment")
async def evaluate_assessment(payload: Dict[str, Any]):
    if not MODELS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Models unavailable")
    try:
        user_answers = payload.get("user_answers", [])
        correct_answers = payload.get("correct_answers", [])
        result = evaluate_technical_assessment(user_answers, correct_answers)
        return {"success": True, "evaluation": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment evaluation failed: {e}")


# ========== Skill Assessment / Learning Roadmap ==========
@app.post("/internship/skill-assessment")
async def skill_assessment(
    candidate_info: str = Form(""), internship_domain: str = Form("Software Development")
):
    if not MODELS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Models unavailable")
    try:
        result = assess_internship_skills(candidate_info, internship_domain)
        return {"success": True, "assessment": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill assessment failed: {e}")


@app.post("/internship/learning-roadmap")
async def learning_roadmap(payload: Dict[str, Any]):
    if not MODELS_AVAILABLE:
        raise HTTPException(status_code=503, detail="Models unavailable")
    try:
        assessment_data = payload.get("assessment_data", {})
        domain = payload.get("domain", "Software Development")
        roadmap = create_learning_roadmap(assessment_data, domain)
        return {"success": True, "roadmap": roadmap}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Learning roadmap failed: {e}")


# ========== Matching ==========
matcher_instance = None
try:
    matcher_instance = InternshipMatcher()  # type: ignore
except Exception:
    matcher_instance = None


@app.post("/internship/match")
async def match_internships(payload: Dict[str, Any]):
    if not MODELS_AVAILABLE or matcher_instance is None:
        raise HTTPException(status_code=503, detail="Matcher unavailable")
    try:
        candidate_profile = payload.get("candidate_profile", {})
        internship_listings = payload.get("internship_listings")
        result = matcher_instance.match_candidates([candidate_profile], internship_listings or [])
        return {"success": True, "matches": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Matching failed: {e}")


@app.get("/internship/domains")
def internship_domains():
    return {
        "domains": [
            "Software Development",
            "Data Science",
            "Web Development",
            "Mobile Development",
            "UI/UX Design",
            "Digital Marketing",
            "Content Writing",
            "Business Development",
        ]
    }


# ========== Mount optional placement_ai routers ==========
if PLACEMENT_ROUTERS_OK:
    app.include_router(placement_resume_router, prefix="/placement")
    app.include_router(placement_reco_router, prefix="/placement")


def create_app():
    return app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run("main:create_app", host="0.0.0.0", port=port, factory=True)

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, date
import random
import json
import asyncio
import os
from ai_modules.ai_orchestrator import (
    ai_orchestrator,
    initialize_ai_services,
    analyze_resume,
    match_candidates_to_jobs,
    assess_interview,
    get_system_health,
    get_analytics_report
)
from ai_modules.advanced_nlp_processor import AdvancedNLPProcessor
from ai_modules.coding_profile_scraper import CodingProfileScraper
from ai_modules.langchain_gemini_analyzer import LangChainGeminiAnalyzer
import logging
from ai_modules.langchain_matching_engine import (
    LangChainMatchingEngine,
    Candidate,
    Opportunity,
    MatchingResult,
    langchain_matching_engine
)

# Set up logger
logger = logging.getLogger(__name__)

app = FastAPI(title="PM Internship Portal API", version="1.0.0")

# Initialize advanced analyzers
nlp_processor = None
advanced_resume_analyzer = None
coding_scraper = None
langchain_analyzer = None
langchain_matching = None

@app.on_event("startup")
async def startup_event():
    """Fast startup on Render: skip heavy initialization unless explicitly enabled.
    Set SKIP_HEAVY_INIT=0 to enable full initialization.
    """
    if os.environ.get("SKIP_HEAVY_INIT", "1") == "1":
        print("⏭️  SKIP_HEAVY_INIT is enabled; skipping heavy AI initializations.")
        return

    async def _init_heavy():
        global nlp_processor, advanced_resume_analyzer, coding_scraper, langchain_analyzer, langchain_matching
        try:
            print("🚀 Initializing AI Services...")
            initialization_results = await initialize_ai_services()
            print(f"📊 AI Services Status: {initialization_results}")

            print("🔧 Initializing Advanced NLP Processor...")
            nlp_processor = AdvancedNLPProcessor()
            await nlp_processor.initialize()

            print("📄 Initializing Advanced Resume Analyzer...")
            advanced_resume_analyzer = AdvancedResumeAnalyzer()

            print("💻 Initializing Coding Profile Scraper...")
            coding_scraper = CodingProfileScraper()

            print("🤖 Initializing LangChain Gemini Analyzer...")
            langchain_analyzer = LangChainGeminiAnalyzer()

            print("🎯 Initializing LangChain Matching Engine...")
            langchain_matching = LangChainMatchingEngine()
            await langchain_matching.initialize()

            print("✅ All advanced analyzers initialized successfully!")
        except Exception as e:
            print(f"⚠️ Warning: Could not initialize advanced analyzers: {e}")
            print("📝 Falling back to basic analyzers")

    # Run heavy init in background so server can bind the port immediately
    import asyncio as _asyncio
    _asyncio.create_task(_init_heavy())

# CORS middleware - Updated for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://bharatintern-frontend.onrender.com",
        "https://*.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint for Render
@app.get("/health")
async def health_check():
    """Health check endpoint for deployment monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "BharatIntern Backend API",
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "BharatIntern API is running!",
        "docs": "/docs",
        "health": "/health"
    }

# Pydantic models
class User(BaseModel):
    id: int
    email: str
    name: str
    role: str
    phone: Optional[str] = None
    location: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str
    phone: str
    location: str
    companyName: Optional[str] = None

class ResumeAnalysis(BaseModel):
    extractedSkills: List[dict]
    missingSkills: List[dict]
    experience: dict
    education: dict
    strengths: List[str]
    improvements: List[str]
    overallScore: int

# AI/ML Models
class AIResumeAnalysis(BaseModel):
    entities: List[tuple]
    skills: List[str]
    embeddings: List[float]
    summary: str

class JobMatchRequest(BaseModel):
    candidate_profiles: List[Dict[str, Any]]
    job_descriptions: List[Dict[str, Any]]

class VoiceAssessmentRequest(BaseModel):
    questions: List[str]

class CodingProfileRequest(BaseModel):
    github_username: str
    leetcode_username: Optional[str] = None

class FraudDetectionRequest(BaseModel):
    candidate_data: List[Dict[str, Any]]

class SkillPredictionRequest(BaseModel):
    candidate_id: int
    current_skills: List[str]
    experience: int
    projects: List[Dict[str, Any]]

class AIRecommendationRequest(BaseModel):
    candidate_id: int
    preferences: Dict[str, Any]
    skills: List[str]
    experience: int
    recommendations: List[str]

class InternshipPosting(BaseModel):
    id: int
    title: str
    company: str
    location: str
    duration: str
    stipend: str
    skills: List[str]
    requirements: List[str]
    benefits: List[str]
    category: str
    deadline: str
    maxApplications: int
    isRemote: bool
    experienceLevel: str
    description: str

class Application(BaseModel):
    id: int
    candidateName: str
    candidateEmail: str
    postingTitle: str
    postingId: int
    matchScore: int
    status: str
    appliedDate: str
    skills: List[str]
    experience: str
    education: str
    location: str
    coverLetter: str

class QuotaData(BaseModel):
    general: dict
    obc: dict
    sc: dict
    st: dict
    ews: dict
    women: dict

class MatchingResult(BaseModel):
    totalCandidates: int
    totalCompanies: int
    totalPostings: int
    totalMatches: int
    matchRate: float
    avgMatchScore: float
    quotaCompliance: float
    processingTime: str
    iterations: int
    converged: bool

# Mock data
mock_users = [
    User(id=1, email="candidate@demo.com", name="John Doe", role="candidate", phone="+91 98765 43210", location="Bangalore"),
    User(id=2, email="company@demo.com", name="TechCorp India", role="company", phone="+91 98765 43211", location="Mumbai"),
    User(id=3, email="admin@demo.com", name="Admin User", role="admin", phone="+91 98765 43212", location="Delhi")
]

mock_postings = [
    InternshipPosting(
        id=1,
        title="Frontend Developer Intern",
        company="TechCorp India",
        location="Bangalore",
        duration="6 months",
        stipend="₹15,000/month",
        skills=["React", "JavaScript", "CSS", "HTML", "TypeScript"],
        requirements=["Bachelor's in CS/IT", "Strong JavaScript skills", "React experience"],
        benefits=["Mentorship", "Stipend", "Certificate", "Job opportunity"],
        category="Software Development",
        deadline="2024-02-15",
        maxApplications=100,
        isRemote=False,
        experienceLevel="Intermediate",
        description="Work on modern web applications using React and modern frontend technologies."
    ),
    InternshipPosting(
        id=2,
        title="Data Science Intern",
        company="DataViz Solutions",
        location="Mumbai",
        duration="4 months",
        stipend="₹20,000/month",
        skills=["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn"],
        requirements=["Python proficiency", "ML knowledge", "Statistics background"],
        benefits=["Learning resources", "Stipend", "Certificate"],
        category="Data Science",
        deadline="2024-02-20",
        maxApplications=50,
        isRemote=False,
        experienceLevel="Intermediate",
        description="Work on real-world data science projects and build machine learning models."
    )
]

# API Routes
@app.get("/")
async def root():
    return {"message": "PM Internship Portal API", "version": "1.0.0"}

# Authentication endpoints
@app.post("/auth/login")
async def login(request: LoginRequest):
    # Mock authentication
    user = next((u for u in mock_users if u.email == request.email and u.role == request.role), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"success": True, "user": user}

@app.post("/auth/signup")
async def signup(request: SignupRequest):
    # Mock signup
    new_user = User(
        id=len(mock_users) + 1,
        email=request.email,
        name=request.name,
        role=request.role,
        phone=request.phone,
        location=request.location
    )
    mock_users.append(new_user)
    return {"success": True, "user": new_user}

# Resume analysis endpoint
@app.post("/resume/analyze")
async def analyze_resume(file_data: dict):
    # Mock resume analysis
    analysis = ResumeAnalysis(
        extractedSkills=[
            {"name": "JavaScript", "confidence": 95, "category": "Programming"},
            {"name": "React", "confidence": 90, "category": "Frontend"},
            {"name": "Node.js", "confidence": 85, "category": "Backend"},
            {"name": "Python", "confidence": 80, "category": "Programming"},
            {"name": "SQL", "confidence": 75, "category": "Database"}
        ],
        missingSkills=[
            {"name": "TypeScript", "impact": "+20%", "reason": "High demand in modern web development"},
            {"name": "Docker", "impact": "+15%", "reason": "Essential for DevOps and deployment"},
            {"name": "AWS", "impact": "+25%", "reason": "Cloud computing skills are highly valued"}
        ],
        experience={
            "totalYears": 2,
            "relevantExperience": 1.5,
            "internships": 1,
            "projects": 3
        },
        education={
            "degree": "Bachelor of Technology",
            "field": "Computer Science",
            "institution": "Indian Institute of Technology",
            "graduationYear": 2024
        },
        strengths=[
            "Strong programming foundation",
            "Good project experience",
            "Relevant internship background"
        ],
        improvements=[
            "Add more specific technical skills",
            "Include quantifiable achievements",
            "Highlight leadership experience"
        ],
        overallScore=78,
        recommendations=[
            "Consider learning TypeScript to improve your frontend skills",
            "Add Docker and containerization to your skill set",
            "Include specific metrics in your project descriptions"
        ]
    )
    return analysis

# Recommendations endpoint
@app.get("/recommendations")
async def get_recommendations(user_id: int, limit: int = 10):
    # Mock recommendations
    recommendations = []
    for i in range(limit):
        recommendations.append({
            "id": i + 1,
            "title": f"Internship Position {i + 1}",
            "company": f"Company {i + 1}",
            "location": random.choice(["Bangalore", "Mumbai", "Delhi", "Pune", "Hyderabad"]),
            "duration": random.choice(["3 months", "4 months", "6 months"]),
            "matchScore": random.randint(70, 95),
            "skills": random.sample(["React", "Python", "JavaScript", "Node.js", "MongoDB", "AWS"], 3),
            "deadline": "2024-02-15",
            "description": f"Great opportunity for {random.choice(['frontend', 'backend', 'full-stack', 'data science'])} development"
        })
    return recommendations

# Applications endpoint
@app.get("/applications")
async def get_applications(user_id: int):
    # Mock applications
    applications = [
        {
            "id": 1,
            "title": "Frontend Developer Intern",
            "company": "WebTech Ltd",
            "status": "Shortlisted",
            "appliedDate": "2024-01-15",
            "matchScore": 92
        },
        {
            "id": 2,
            "title": "Backend Developer Intern",
            "company": "API Solutions",
            "status": "Applied",
            "appliedDate": "2024-01-20",
            "matchScore": 87
        }
    ]
    return applications

# Company endpoints
@app.get("/company/postings")
async def get_company_postings(company_id: int):
    return mock_postings

@app.post("/company/postings")
async def create_posting(posting: InternshipPosting):
    # Mock create posting
    posting.id = len(mock_postings) + 1
    mock_postings.append(posting)
    return {"success": True, "posting": posting}

@app.get("/company/applications")
async def get_company_applications(company_id: int):
    # Mock applications for company
    applications = [
        {
            "id": 1,
            "candidateName": "John Doe",
            "candidateEmail": "john.doe@email.com",
            "postingTitle": "Frontend Developer Intern",
            "matchScore": 92,
            "status": "Shortlisted",
            "appliedDate": "2024-01-20",
            "skills": ["React", "JavaScript", "CSS", "HTML"],
            "experience": "2 years",
            "education": "B.Tech Computer Science - IIT Delhi",
            "location": "Bangalore",
            "coverLetter": "I am passionate about frontend development..."
        }
    ]
    return applications

# Admin endpoints
@app.get("/admin/quotas")
async def get_quota_data():
    quota_data = QuotaData(
        general={"target": 40, "current": 28, "percentage": 70},
        obc={"target": 27, "current": 18, "percentage": 67},
        sc={"target": 15, "current": 12, "percentage": 80},
        st={"target": 7.5, "current": 4, "percentage": 53},
        ews={"target": 10, "current": 6, "percentage": 60},
        women={"target": 30, "current": 22, "percentage": 73}
    )
    return quota_data

@app.post("/admin/quotas")
async def update_quota_data(quota_data: QuotaData):
    # Mock update quotas
    return {"success": True, "message": "Quota data updated successfully"}

@app.post("/admin/match")
async def run_batch_matching():
    # Mock batch matching
    result = MatchingResult(
        totalCandidates=1250,
        totalCompanies=45,
        totalPostings=78,
        totalMatches=342,
        matchRate=27.4,
        avgMatchScore=82.3,
        quotaCompliance=94.2,
        processingTime="2.3 minutes",
        iterations=47,
        converged=True
    )
    return result

@app.get("/admin/allocations")
async def get_allocations():
    # Mock allocations
    allocations = [
        {
            "id": 1,
            "candidateName": "John Doe",
            "candidateEmail": "john.doe@email.com",
            "companyName": "TechCorp India",
            "postingTitle": "Frontend Developer Intern",
            "category": "General",
            "matchScore": 95,
            "status": "Approved",
            "allocatedDate": "2024-02-15",
            "startDate": "2024-03-01",
            "duration": "6 months",
            "stipend": "₹15,000/month",
            "location": "Bangalore",
            "skills": ["React", "JavaScript", "CSS", "HTML", "TypeScript"],
            "experience": "2 years",
            "education": "B.Tech Computer Science - IIT Delhi",
            "notes": "Excellent technical skills and communication"
        }
    ]
    return allocations

# AI/ML Endpoints

@app.post("/ai/analyze-resume")
async def analyze_resume_ai(file: UploadFile = File(...)):
    """Analyze resume using AI/ML pipeline"""
    try:
        # Read file content
        content = await file.read()
        text = content.decode('utf-8')
        
        # Analyze with AI services - create proper file_data structure
        file_data = {
            "text": text,
            "filename": file.filename,
            "content_type": file.content_type
        }
        analysis = await analyze_resume(file_data)
        
        return {
            "success": True,
            "analysis": analysis,
            "filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/analyze-resume-advanced")
async def analyze_resume_advanced(file: UploadFile = File(...)):
    """Enhanced resume analysis using advanced ML/NLP pipeline"""
    try:
        # Read file content
        content = await file.read()
        text = content.decode('utf-8')
        
        results = {}
        
        # Use advanced NLP processor if available
        if nlp_processor:
            try:
                nlp_results = nlp_processor.analyze_resume_complete(text)
                results["nlp_analysis"] = nlp_results
            except Exception as e:
                print(f"NLP Analysis error: {e}")
                results["nlp_analysis"] = {"error": str(e)}
        
        # Use advanced resume analyzer if available
        if advanced_resume_analyzer:
            try:
                resume_analysis = advanced_resume_analyzer.analyze_resume_comprehensive(text)
                results["resume_analysis"] = resume_analysis
            except Exception as e:
                print(f"Resume Analysis error: {e}")
                results["resume_analysis"] = {"error": str(e)}
        
        # Use LangChain analyzer if available
        if langchain_analyzer:
            try:
                langchain_results = await langchain_analyzer.analyze_resume_with_llm(text)
                results["langchain_analysis"] = langchain_results
            except Exception as e:
                print(f"LangChain Analysis error: {e}")
                results["langchain_analysis"] = {"error": str(e)}
        
        # Fallback to basic analysis if no advanced analyzers available
        if not any([nlp_processor, advanced_resume_analyzer, langchain_analyzer]):
            file_data = {
                "text": text,
                "filename": file.filename,
                "content_type": file.content_type
            }
            basic_analysis = await analyze_resume(file_data)
            results["basic_analysis"] = basic_analysis
        
        return {
            "success": True,
            "analysis": results,
            "filename": file.filename,
            "analyzers_used": {
                "nlp_processor": nlp_processor is not None,
                "advanced_resume_analyzer": advanced_resume_analyzer is not None,
                "langchain_analyzer": langchain_analyzer is not None
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced analysis failed: {str(e)}")

@app.post("/ai/match-jobs")
async def match_jobs_ai(request: JobMatchRequest):
    """Match candidates to jobs using AI"""
    try:
        matches = await match_candidates_to_jobs(
            request.candidate_profiles,
            request.job_descriptions
        )
        return {"success": True, "matches": matches}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/voice-assessment")
async def voice_assessment(
    questions: str = Form(...),
    audio_file: UploadFile = File(...)
):
    """Assess voice interview using AI"""
    try:
        # Save audio file temporarily
        audio_path = f"/tmp/{audio_file.filename}"
        with open(audio_path, "wb") as buffer:
            content = await audio_file.read()
            buffer.write(content)
        
        questions_list = json.loads(questions)
        assessment = await assess_interview("Sample transcription", questions_list)
        
        return {"success": True, "assessment": assessment}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/coding-profile")
async def integrate_coding_profile(request: CodingProfileRequest):
    """Integrate coding profiles from GitHub, LeetCode"""
    try:
        # Handle optional parameters
        github_username = request.github_username or ""
        leetcode_username = request.leetcode_username or ""
        
        profile_data = await ai_orchestrator.integrate_coding_profiles_complete(
            github_username,
            leetcode_username
        )
        return {"success": True, "profile": profile_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/coding-profile-advanced")
async def analyze_coding_profile_advanced(request: CodingProfileRequest):
    """Advanced coding profile analysis using ML scraping"""
    try:
        results = {}
        
        # Use advanced coding scraper if available
        if coding_scraper:
            try:
                # Analyze GitHub profile
                if request.github_username:
                    github_analysis = await coding_scraper.scrape_github_profile(request.github_username)
                    results["github_analysis"] = github_analysis
                
                # Analyze LeetCode profile
                if request.leetcode_username:
                    leetcode_analysis = await coding_scraper.scrape_leetcode_profile(request.leetcode_username)
                    results["leetcode_analysis"] = leetcode_analysis
                
                # Generate comprehensive coding summary
                if request.github_username or request.leetcode_username:
                    coding_summary = coding_scraper._calculate_coding_summary(results)
                    results["coding_summary"] = coding_summary
                    
                    # Generate insights
                    insights = coding_scraper.generate_coding_insights(results)
                    results["insights"] = insights
                    
            except Exception as e:
                print(f"Advanced coding analysis error: {e}")
                results["advanced_analysis"] = {"error": str(e)}
        
        # Fallback to basic analysis if no advanced scraper
        if not coding_scraper:
            github_username = request.github_username or ""
            leetcode_username = request.leetcode_username or ""
            
            fallback_data = await ai_orchestrator.integrate_coding_profiles_complete(
                github_username,
                leetcode_username
            )
            results["fallback_analysis"] = fallback_data
        
        return {
            "success": True,
            "analysis": results,
            "profiles_analyzed": {
                "github": bool(request.github_username),
                "leetcode": bool(request.leetcode_username)
            },
            "advanced_scraper_used": coding_scraper is not None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Advanced coding profile analysis failed: {str(e)}")

@app.post("/ai/fraud-detection")
async def detect_fraud_bias(request: FraudDetectionRequest):
    """Detect fraud and bias in candidate data"""
    try:
        analysis = await ai_orchestrator.detect_fraud_and_bias_complete(request.candidate_data)
        return {"success": True, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/ai/analytics")
async def get_ai_analytics(timeframe: str = "30d"):
    """Get AI/ML analytics and reporting data"""
    try:
        analytics = await get_analytics_report(timeframe)
        return {"success": True, "analytics": analytics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/skill-prediction")
async def predict_skills(request: SkillPredictionRequest):
    """Predict skill development for candidate"""
    try:
        # Mock skill prediction
        predictions = {
            "candidate_id": request.candidate_id,
            "current_skills": request.current_skills,
            "predicted_skills": [
                {"skill": "Advanced React", "probability": 0.87, "timeline": "3 months"},
                {"skill": "Node.js", "probability": 0.72, "timeline": "4 months"},
                {"skill": "Docker", "probability": 0.65, "timeline": "6 months"}
            ],
            "skill_gaps": [
                {"skill": "System Design", "importance": "high", "learning_path": "Online courses + practice"},
                {"skill": "Database Design", "importance": "medium", "learning_path": "Hands-on projects"}
            ],
            "career_progression": {
                "current_level": "Junior Developer",
                "next_level": "Mid-level Developer",
                "timeline": "8-12 months",
                "key_skills_needed": ["System Design", "Advanced React", "Team Collaboration"]
            }
        }
        return {"success": True, "predictions": predictions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/recommendations")
async def get_ai_recommendations(request: AIRecommendationRequest):
    """Get AI-powered job recommendations"""
    try:
        # Mock recommendations
        recommendations = {
            "candidate_id": request.candidate_id,
            "personalized_jobs": [
                {
                    "job_id": 1,
                    "title": "React Developer",
                    "company": "TechStart Inc",
                    "match_score": 0.92,
                    "reasons": ["Strong React skills", "Good portfolio projects", "Location match"],
                    "growth_potential": "high"
                },
                {
                    "job_id": 2,
                    "title": "Full Stack Intern",
                    "company": "InnovateNow",
                    "match_score": 0.86,
                    "reasons": ["Full stack experience", "Recent projects", "Learning attitude"],
                    "growth_potential": "medium"
                }
            ],
            "skill_development_suggestions": [
                {
                    "skill": "TypeScript",
                    "priority": "high",
                    "reason": "High demand in matching job market",
                    "resources": ["Official TypeScript docs", "Frontend Masters course"]
                }
            ],
            "learning_roadmap": {
                "short_term": ["Complete TypeScript basics", "Build a TypeScript project"],
                "medium_term": ["Learn advanced React patterns", "System design fundamentals"],
                "long_term": ["Microservices architecture", "Team leadership skills"]
            }
        }
        return {"success": True, "recommendations": recommendations}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Import internship models - try complex analyzer first, fallback to simple
try:
    from models.internship_resume_analyzer import analyze_internship_resume, process_resume_file
    print("✅ Successfully imported complex internship models with LangChain")
    INTERNSHIP_MODELS_AVAILABLE = True
    USE_SIMPLE_ANALYZER = False
except ImportError as e:
    print(f"⚠️ Failed to import complex internship models: {e}")
    print("🔄 Falling back to simple internship analyzer...")
    try:
        from models.simple_internship_analyzer import analyze_internship_resume, process_resume_file
        print("✅ Successfully imported simple internship analyzer")
        INTERNSHIP_MODELS_AVAILABLE = True
        USE_SIMPLE_ANALYZER = True
    except ImportError as e2:
        print(f"❌ Failed to import simple internship analyzer: {e2}")
        INTERNSHIP_MODELS_AVAILABLE = False
        USE_SIMPLE_ANALYZER = False

# Try to import other internship modules
try:
    from models.internship_technical_assessment import generate_internship_technical_assessment, evaluate_technical_assessment
    from models.internship_skill_assessor import assess_internship_skills, create_learning_roadmap
    from models.internship_matcher import InternshipMatcher, create_sample_internships
    # Initialize internship matcher
    internship_matcher = InternshipMatcher()
except ImportError as e:
    print(f"⚠️ Some internship modules unavailable: {e}")
    internship_matcher = None

# Internship-specific endpoints
@app.post("/internship/analyze-resume")
async def analyze_internship_resume_endpoint(file: UploadFile = File(...)):
    """Analyze resume specifically for internship opportunities"""
    try:
        if not INTERNSHIP_MODELS_AVAILABLE:
            raise HTTPException(status_code=503, detail="Internship analysis service unavailable")
        
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx', '.doc', '.txt')):
            raise HTTPException(status_code=400, detail="Only PDF, DOCX, DOC, and TXT files are supported")
        
        # Save uploaded file temporarily
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Process the resume for internships
            result = process_resume_file(temp_file_path)
            
            return JSONResponse(content={
                "success": True,
                "filename": file.filename,
                "analysis_type": "internship",
                "result": result
            })
            
        finally:
            # Clean up temporary file
            import os
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internship resume analysis failed: {str(e)}")

@app.post("/internship/technical-assessment")
async def create_internship_technical_assessment(
    internship_role: str = Form("Software Development"),
    num_questions: int = Form(10),
    difficulty: str = Form("moderate")
):
    """Generate technical assessment questions for internship roles"""
    try:
        if not INTERNSHIP_MODELS_AVAILABLE:
            raise HTTPException(status_code=503, detail="Technical assessment service unavailable")
        
        # Validate inputs
        if num_questions < 1 or num_questions > 20:
            raise HTTPException(status_code=400, detail="Number of questions must be between 1 and 20")
        
        if difficulty not in ["easy", "moderate", "hard"]:
            raise HTTPException(status_code=400, detail="Difficulty must be 'easy', 'moderate', or 'hard'")
        
        # Generate assessment
        result = generate_internship_technical_assessment(
            internship_role=internship_role,
            num_questions=num_questions,
            difficulty=difficulty
        )
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Technical assessment generation failed: {str(e)}")

@app.post("/internship/evaluate-assessment")
async def evaluate_internship_assessment(request: Request):
    """Evaluate user's technical assessment answers"""
    try:
        if not INTERNSHIP_MODELS_AVAILABLE:
            raise HTTPException(status_code=503, detail="Assessment evaluation service unavailable")
        
        data = await request.json()
        user_answers = data.get("user_answers", {})
        correct_answers = data.get("correct_answers", [])
        
        # Evaluate answers
        result = evaluate_technical_assessment(user_answers, correct_answers)
        
        return JSONResponse(content={
            "success": True,
            "evaluation": result
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assessment evaluation failed: {str(e)}")

@app.post("/internship/skill-assessment")
async def create_internship_skill_assessment(
    candidate_info: str = Form(...),
    internship_domain: str = Form("Software Development")
):
    """Assess candidate's skills for internship readiness"""
    try:
        if not INTERNSHIP_MODELS_AVAILABLE:
            raise HTTPException(status_code=503, detail="Skill assessment service unavailable")
        
        # Perform skill assessment
        result = assess_internship_skills(candidate_info, internship_domain)
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill assessment failed: {str(e)}")

@app.post("/internship/match")
async def match_candidate_to_internships(request: Request):
    """Match candidate with suitable internship opportunities"""
    try:
        if not INTERNSHIP_MODELS_AVAILABLE or not internship_matcher:
            raise HTTPException(status_code=503, detail="Internship matching service unavailable")
        
        data = await request.json()
        candidate_profile = data.get("candidate_profile", "")
        internship_listings = data.get("internship_listings")
        
        if not candidate_profile:
            raise HTTPException(status_code=400, detail="Candidate profile is required")
        
        # Use provided listings or sample data
        if not internship_listings:
            internship_listings = create_sample_internships()
        
        # Perform matching
        result = internship_matcher.match_internships(candidate_profile, internship_listings)
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internship matching failed: {str(e)}")

@app.post("/internship/learning-roadmap")
async def generate_internship_learning_roadmap(request: Request):
    """Generate personalized learning roadmap based on skill assessment"""
    try:
        if not INTERNSHIP_MODELS_AVAILABLE:
            raise HTTPException(status_code=503, detail="Learning roadmap service unavailable")
        
        data = await request.json()
        assessment_data = data.get("assessment_data", {})
        domain = data.get("domain", "Software Development")
        
        # Generate roadmap
        roadmap = create_learning_roadmap(assessment_data, domain)
        
        return JSONResponse(content={
            "success": True,
            "roadmap": roadmap
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Learning roadmap generation failed: {str(e)}")

@app.get("/internship/domains")
async def get_internship_domains():
    """Get available internship domains"""
    domains = [
        "Software Development",
        "Data Science", 
        "Web Development",
        "Mobile Development",
        "UI/UX Design",
        "Digital Marketing",
        "Content Writing",
        "Business Development",
        "Human Resources",
        "Finance"
    ]
    
    return JSONResponse(content={
        "success": True,
        "domains": domains
    })

@app.get("/internship/sample-data")
async def get_sample_internship_data():
    """Get sample internship data for testing"""
    try:
        if not INTERNSHIP_MODELS_AVAILABLE:
            return JSONResponse(content={"success": False, "error": "Service unavailable"})
        
        sample_internships = create_sample_internships()
        
        return JSONResponse(content={
            "success": True,
            "internships": sample_internships
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========== LangChain Matching Engine Endpoints ==========

@app.post("/langchain/match")
async def langchain_match_candidate_to_opportunity(request: Request):
    """
    Match a candidate to an opportunity using LangChain and free LLM APIs
    
    Expected payload:
    {
        "candidate": {
            "skills": ["Python", "JavaScript", "React"],
            "education": {"degree": "B.Tech", "field": "Computer Science"},
            "location": "Bangalore",
            "experience_years": 2.5,
            "coding_profiles": {"github": "username", "leetcode": "username"},
            "soft_skill_scores": {"communication": 0.8, "leadership": 0.7},
            "projects": [{"name": "Project 1", "description": "..."}],
            "certifications": ["AWS Certified"],
            "languages": ["Python", "JavaScript"],
            "resume_text": "Full resume text..."
        },
        "opportunity": {
            "required_skills": ["Python", "Machine Learning", "Data Analysis"],
            "industry": "Technology",
            "location": "Bangalore",
            "experience_level": "mid",
            "job_title": "Data Scientist",
            "company_size": "startup",
            "remote_friendly": true,
            "salary_range": {"min": 600000, "max": 1200000},
            "benefits": ["Health Insurance", "Learning Budget"],
            "description": "Looking for a data scientist..."
        }
    }
    """
    try:
        if not langchain_matching or not langchain_matching.initialized:
            raise HTTPException(
                status_code=503, 
                detail="LangChain matching engine not available. Please ensure LLM API keys are configured."
            )
        
        # Parse request data
        data = await request.json()
        
        if not data:
            raise HTTPException(status_code=400, detail="Request body is required")
        
        candidate_data = data.get("candidate")
        opportunity_data = data.get("opportunity")
        
        if not candidate_data:
            raise HTTPException(status_code=400, detail="Candidate data is required")
        
        if not opportunity_data:
            raise HTTPException(status_code=400, detail="Opportunity data is required")
        
        # Perform matching
        result = await langchain_matching.match_candidate_to_opportunity(
            candidate_data, 
            opportunity_data
        )
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=500, 
                detail=f"Matching failed: {result.get('error', 'Unknown error')}"
            )
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LangChain matching endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/langchain/batch-match")
async def langchain_batch_match(request: Request):
    """
    Batch match multiple candidates to multiple opportunities using LangChain
    
    Expected payload:
    {
        "candidates": [
            {
                "skills": ["Python", "JavaScript"],
                "education": {"degree": "B.Tech"},
                "location": "Bangalore",
                "experience_years": 2
            }
        ],
        "opportunities": [
            {
                "required_skills": ["Python", "Machine Learning"],
                "industry": "Technology",
                "location": "Bangalore",
                "experience_level": "mid"
            }
        ]
    }
    """
    try:
        if not langchain_matching or not langchain_matching.initialized:
            raise HTTPException(
                status_code=503, 
                detail="LangChain matching engine not available"
            )
        
        # Parse request data
        data = await request.json()
        
        if not data:
            raise HTTPException(status_code=400, detail="Request body is required")
        
        candidates = data.get("candidates", [])
        opportunities = data.get("opportunities", [])
        
        if not candidates:
            raise HTTPException(status_code=400, detail="Candidates list is required")
        
        if not opportunities:
            raise HTTPException(status_code=400, detail="Opportunities list is required")
        
        if len(candidates) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 candidates allowed per batch")
        
        if len(opportunities) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 opportunities allowed per batch")
        
        # Perform batch matching
        result = await langchain_matching.batch_match_candidates(candidates, opportunities)
        
        if not result.get("success", False):
            raise HTTPException(
                status_code=500, 
                detail=f"Batch matching failed: {result.get('error', 'Unknown error')}"
            )
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LangChain batch matching endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/langchain/status")
async def get_langchain_matching_status():
    """Get LangChain matching engine status and configuration"""
    try:
        if not langchain_matching:
            return JSONResponse(content={
                "success": False,
                "error": "LangChain matching engine not initialized",
                "status": "unavailable"
            })
        
        status = langchain_matching.get_engine_status()
        
        return JSONResponse(content={
            "success": True,
            "status": "available" if status["initialized"] else "unavailable",
            "engine_status": status
        })
        
    except Exception as e:
        logger.error(f"LangChain status endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/langchain/test-match")
async def test_langchain_matching():
    """Test endpoint with sample data to verify LangChain matching functionality"""
    try:
        if not langchain_matching or not langchain_matching.initialized:
            raise HTTPException(
                status_code=503, 
                detail="LangChain matching engine not available"
            )
        
        # Sample test data
        sample_candidate = {
            "skills": ["Python", "JavaScript", "React", "Node.js", "MongoDB"],
            "education": {
                "degree": "Bachelor of Technology",
                "field": "Computer Science",
                "institution": "IIT Delhi",
                "graduation_year": 2023
            },
            "location": "Bangalore",
            "experience_years": 1.5,
            "coding_profiles": {
                "github": "johndoe",
                "leetcode": "johndoe_coder"
            },
            "soft_skill_scores": {
                "communication": 0.8,
                "leadership": 0.6,
                "teamwork": 0.9,
                "problem_solving": 0.85
            },
            "projects": [
                {
                    "name": "E-commerce Platform",
                    "description": "Full-stack e-commerce application with React and Node.js",
                    "technologies": ["React", "Node.js", "MongoDB", "Express"]
                },
                {
                    "name": "Task Management App",
                    "description": "Collaborative task management tool",
                    "technologies": ["React", "Python", "PostgreSQL"]
                }
            ],
            "certifications": ["AWS Cloud Practitioner", "Google Analytics Certified"],
            "languages": ["Python", "JavaScript", "TypeScript", "SQL"],
            "resume_text": "Experienced software developer with 1.5 years of experience in full-stack development..."
        }
        
        sample_opportunity = {
            "required_skills": ["Python", "JavaScript", "React", "Node.js", "MongoDB"],
            "industry": "Technology",
            "location": "Bangalore",
            "experience_level": "mid",
            "job_title": "Full Stack Developer",
            "company_size": "startup",
            "remote_friendly": True,
            "salary_range": {"min": 800000, "max": 1500000},
            "benefits": ["Health Insurance", "Learning Budget", "Flexible Hours"],
            "description": "We are looking for a talented Full Stack Developer to join our growing team...",
            "preferences": {
                "startup_experience": "preferred",
                "remote_work": "allowed",
                "team_collaboration": "essential"
            }
        }
        
        # Perform test matching
        result = await langchain_matching.match_candidate_to_opportunity(
            sample_candidate, 
            sample_opportunity
        )
        
        return JSONResponse(content={
            "success": True,
            "message": "Test matching completed successfully",
            "test_data": {
                "candidate": sample_candidate,
                "opportunity": sample_opportunity
            },
            "matching_result": result
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LangChain test matching endpoint error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/langchain/sample-data")
async def get_langchain_sample_data():
    """Get sample candidate and opportunity data for testing the LangChain matching engine"""
    sample_candidates = [
        {
            "skills": ["Python", "JavaScript", "React", "Node.js", "MongoDB"],
            "education": {
                "degree": "Bachelor of Technology",
                "field": "Computer Science",
                "institution": "IIT Delhi",
                "graduation_year": 2023
            },
            "location": "Bangalore",
            "experience_years": 1.5,
            "coding_profiles": {
                "github": "johndoe",
                "leetcode": "johndoe_coder"
            },
            "soft_skill_scores": {
                "communication": 0.8,
                "leadership": 0.6,
                "teamwork": 0.9,
                "problem_solving": 0.85
            },
            "projects": [
                {
                    "name": "E-commerce Platform",
                    "description": "Full-stack e-commerce application",
                    "technologies": ["React", "Node.js", "MongoDB"]
                }
            ],
            "certifications": ["AWS Cloud Practitioner"],
            "languages": ["Python", "JavaScript", "TypeScript"],
            "resume_text": "Experienced software developer with 1.5 years of experience..."
        },
        {
            "skills": ["Java", "Spring Boot", "MySQL", "Docker", "Kubernetes"],
            "education": {
                "degree": "Master of Technology",
                "field": "Software Engineering",
                "institution": "IIIT Bangalore",
                "graduation_year": 2022
            },
            "location": "Mumbai",
            "experience_years": 2.5,
            "coding_profiles": {
                "github": "janedoe",
                "leetcode": "janedoe_dev"
            },
            "soft_skill_scores": {
                "communication": 0.9,
                "leadership": 0.8,
                "teamwork": 0.85,
                "problem_solving": 0.9
            },
            "projects": [
                {
                    "name": "Microservices Architecture",
                    "description": "Scalable microservices system",
                    "technologies": ["Java", "Spring Boot", "Docker"]
                }
            ],
            "certifications": ["Oracle Java Certified", "Kubernetes Administrator"],
            "languages": ["Java", "Python", "Go"],
            "resume_text": "Senior software engineer with expertise in Java and microservices..."
        }
    ]
    
    sample_opportunities = [
        {
            "required_skills": ["Python", "JavaScript", "React", "Node.js"],
            "industry": "Technology",
            "location": "Bangalore",
            "experience_level": "mid",
            "job_title": "Full Stack Developer",
            "company_size": "startup",
            "remote_friendly": True,
            "salary_range": {"min": 800000, "max": 1500000},
            "benefits": ["Health Insurance", "Learning Budget"],
            "description": "Looking for a talented Full Stack Developer...",
            "preferences": {
                "startup_experience": "preferred",
                "remote_work": "allowed"
            }
        },
        {
            "required_skills": ["Java", "Spring Boot", "Microservices", "Docker"],
            "industry": "Fintech",
            "location": "Mumbai",
            "experience_level": "senior",
            "job_title": "Senior Backend Engineer",
            "company_size": "enterprise",
            "remote_friendly": False,
            "salary_range": {"min": 1200000, "max": 2000000},
            "benefits": ["Health Insurance", "Stock Options", "Gym Membership"],
            "description": "Seeking a Senior Backend Engineer with microservices experience...",
            "preferences": {
                "fintech_experience": "preferred",
                "team_leadership": "required"
            }
        },
        {
            "required_skills": ["Python", "Machine Learning", "TensorFlow", "SQL"],
            "industry": "AI/ML",
            "location": "Remote",
            "experience_level": "entry",
            "job_title": "Machine Learning Engineer",
            "company_size": "startup",
            "remote_friendly": True,
            "salary_range": {"min": 600000, "max": 1000000},
            "benefits": ["Health Insurance", "Research Time"],
            "description": "Entry-level ML Engineer position for recent graduates...",
            "preferences": {
                "research_background": "preferred",
                "remote_work": "required"
            }
        }
    ]
    
    return JSONResponse(content={
        "success": True,
        "sample_candidates": sample_candidates,
        "sample_opportunities": sample_opportunities,
        "usage_instructions": {
            "single_match": "Use POST /langchain/match with candidate and opportunity data",
            "batch_match": "Use POST /langchain/batch-match with arrays of candidates and opportunities",
            "test_match": "Use POST /langchain/test-match to test with predefined sample data"
        }
    })

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "internship_models_available": INTERNSHIP_MODELS_AVAILABLE if 'INTERNSHIP_MODELS_AVAILABLE' in globals() else False
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
