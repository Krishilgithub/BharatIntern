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
from ai_modules.advanced_resume_analyzer import AdvancedResumeAnalyzer
from ai_modules.coding_profile_scraper import CodingProfileScraper
from ai_modules.langchain_gemini_analyzer import LangChainGeminiAnalyzer

app = FastAPI(title="PM Internship Portal API", version="1.0.0")

# Initialize advanced analyzers
nlp_processor = None
advanced_resume_analyzer = None
coding_scraper = None
langchain_analyzer = None

@app.on_event("startup")
async def startup_event():
    """Initialize AI services on startup"""
    global nlp_processor, advanced_resume_analyzer, coding_scraper, langchain_analyzer
    
    print("🚀 Initializing AI Services...")
    initialization_results = await initialize_ai_services()
    print(f"📊 AI Services Status: {initialization_results}")
    
    # Initialize advanced analyzers
    try:
        print("🔧 Initializing Advanced NLP Processor...")
        nlp_processor = AdvancedNLPProcessor()
        await nlp_processor.initialize()
        
        print("📄 Initializing Advanced Resume Analyzer...")
        advanced_resume_analyzer = AdvancedResumeAnalyzer()
        
        print("💻 Initializing Coding Profile Scraper...")
        coding_scraper = CodingProfileScraper()
        
        print("🤖 Initializing LangChain Gemini Analyzer...")
        langchain_analyzer = LangChainGeminiAnalyzer()
        
        print("✅ All advanced analyzers initialized successfully!")
        
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize advanced analyzers: {e}")
        print("📝 Falling back to basic analyzers")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
