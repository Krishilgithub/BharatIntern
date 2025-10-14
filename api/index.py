from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date
import random
import json
import re

# Simplified AI services for serverless deployment
class SimpleAIServices:
    """Simplified AI services for serverless deployment"""
    
    async def analyze_resume(self, text: str) -> Dict[str, Any]:
        """Simplified resume analysis"""
        # Extract basic info using regex
        skills = self.extract_basic_skills(text)
        entities = self.extract_basic_entities(text)
        
        return {
            "entities": entities,
            "skills": skills,
            "summary": text[:200] + "..." if len(text) > 200 else text,
            "confidence": 0.85
        }
    
    def extract_basic_skills(self, text: str) -> List[str]:
        """Extract skills using pattern matching"""
        tech_skills = [
            "python", "java", "javascript", "react", "angular", "vue", "node.js",
            "machine learning", "deep learning", "tensorflow", "pytorch", "sklearn",
            "sql", "mongodb", "postgresql", "docker", "kubernetes", "aws", "azure",
            "git", "linux", "html", "css", "bootstrap", "tailwind", "express",
            "django", "flask", "spring", "hibernate", "rest api", "graphql"
        ]
        
        text_lower = text.lower()
        found_skills = [skill for skill in tech_skills if skill in text_lower]
        return found_skills
        
    def extract_basic_entities(self, text: str) -> List[tuple]:
        """Extract basic entities using pattern matching"""
        entities = []
        
        # Extract emails
        emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        for email in emails:
            entities.append((email, "EMAIL"))
            
        # Extract phone numbers
        phones = re.findall(r'\b\d{10}\b|\b\d{3}-\d{3}-\d{4}\b', text)
        for phone in phones:
            entities.append((phone, "PHONE"))
            
        return entities

ai_services = SimpleAIServices()

app = FastAPI(title="PM Internship Portal API", version="1.0.0")

# CORS middleware - Updated for Vercel deployment
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your Vercel domain
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
    email: str
    password: str
    name: str
    role: str
    phone: Optional[str] = None
    location: Optional[str] = None

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

class ResumeAnalysis(BaseModel):
    extractedSkills: List[dict]
    missingSkills: List[dict]
    experience: dict
    education: dict
    strengths: List[str]
    improvements: List[str]
    overallScore: int
    recommendations: List[str]

class Application(BaseModel):
    id: int
    candidateId: int
    postingId: int
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
            "company": "TechCorp India",
            "status": "Under Review",
            "appliedDate": "2024-01-15",
            "deadline": "2024-02-15",
            "matchScore": 92,
            "location": "Bangalore"
        },
        {
            "id": 2,
            "title": "Data Science Intern",
            "company": "DataViz Solutions",
            "status": "Shortlisted",
            "appliedDate": "2024-01-18",
            "deadline": "2024-02-20",
            "matchScore": 88,
            "location": "Mumbai"
        }
    ]
    return applications

# Postings endpoints
@app.get("/postings")
async def get_postings():
    return mock_postings

@app.post("/postings")
async def create_posting(posting: InternshipPosting):
    posting.id = len(mock_postings) + 1
    mock_postings.append(posting)
    return {"success": True, "posting": posting}

# Company shortlist endpoint
@app.get("/company/shortlist")
async def get_shortlist(company_id: int):
    # Mock shortlist data
    shortlist = [
        {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "+91 98765 43210",
            "matchScore": 92,
            "skills": ["React", "JavaScript", "TypeScript", "Node.js"],
            "experience": "2 years",
            "education": "B.Tech Computer Science - IIT Delhi",
            "resumeUrl": "/resumes/john-doe.pdf",
            "status": "Pending Review"
        }
    ]
    return shortlist

# Admin endpoints
@app.get("/admin/dashboard-stats")
async def get_admin_stats():
    return {
        "totalCandidates": 1250,
        "totalCompanies": 185,
        "totalPostings": 320,
        "totalApplications": 4580,
        "matchingRate": 78.5,
        "quotaCompliance": 92.8
    }

@app.post("/admin/run-matching")
async def run_matching():
    # Mock matching algorithm
    result = MatchingResult(
        totalCandidates=1250,
        totalCompanies=185,
        totalPostings=320,
        totalMatches=981,
        matchRate=78.5,
        avgMatchScore=84.2,
        quotaCompliance=92.8,
        processingTime="2.3s",
        iterations=15,
        converged=True
    )
    return result

@app.get("/admin/allocations")
async def get_allocations():
    # Mock allocation data
    allocations = [
        {
            "id": 1,
            "candidateName": "John Doe",
            "candidateEmail": "john@example.com",
            "companyName": "TechCorp India",
            "position": "Frontend Developer Intern",
            "matchScore": 92,
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

    ]
    return allocations

# AI/ML Endpoints

@app.post("/ai/analyze-resume")
async def analyze_resume_ai(resume_text: str = Form(...)):
    """Analyze resume using AI/ML pipeline"""
    try:
        analysis = await ai_services.analyze_resume(resume_text)
        return {
            "success": True,
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/coding-profile")
async def get_coding_profile(github_username: str = Form(...), leetcode_username: str = Form(None)):
    """Get coding profile analysis"""
    try:
        # Mock GitHub API call
        github_data = {
            "username": github_username,
            "public_repos": random.randint(5, 50),
            "followers": random.randint(1, 100),
            "languages": ["JavaScript", "Python", "Java", "TypeScript"],
            "top_repos": [
                {"name": "awesome-project", "stars": random.randint(1, 20), "language": "JavaScript"},
                {"name": "ml-model", "stars": random.randint(1, 15), "language": "Python"}
            ]
        }
        
        # Mock LeetCode data
        leetcode_data = {
            "username": leetcode_username or "demo_user",
            "problems_solved": random.randint(50, 300),
            "easy_solved": random.randint(20, 100),
            "medium_solved": random.randint(15, 80),
            "hard_solved": random.randint(0, 20),
            "acceptance_rate": round(random.uniform(0.4, 0.9), 2)
        }
        
        # Calculate skill score
        skill_score = min(100, (
            github_data["public_repos"] * 2 +
            github_data["followers"] +
            leetcode_data["problems_solved"] // 3 +
            leetcode_data["hard_solved"] * 3
        ))
        
        return {
            "success": True,
            "profile": {
                "github": github_data,
                "leetcode": leetcode_data,
                "overall_skill_score": skill_score,
                "level": "Intermediate" if skill_score > 60 else "Beginner" if skill_score > 30 else "Advanced"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/skill-prediction")
async def predict_skills(candidate_id: int = Form(...), current_skills: str = Form(...)):
    """Predict skill development for candidate"""
    try:
        skills_list = current_skills.split(",")
        
        predictions = {
            "candidate_id": candidate_id,
            "current_skills": skills_list,
            "predicted_skills": [
                {"skill": "Advanced React", "probability": 0.87, "timeline": "3 months"},
                {"skill": "Node.js", "probability": 0.72, "timeline": "4 months"},
                {"skill": "Docker", "probability": 0.65, "timeline": "6 months"},
                {"skill": "System Design", "probability": 0.58, "timeline": "8 months"}
            ],
            "skill_gaps": [
                {"skill": "System Design", "importance": "high", "learning_path": "Online courses + practice"},
                {"skill": "Database Design", "importance": "medium", "learning_path": "Hands-on projects"},
                {"skill": "DevOps", "importance": "medium", "learning_path": "Docker + Kubernetes tutorials"}
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

@app.post("/ai/job-recommendations")
async def get_job_recommendations(candidate_id: int = Form(...), skills: str = Form(...), experience: int = Form(...)):
    """Get AI-powered job recommendations"""
    try:
        skills_list = skills.split(",")
        
        recommendations = {
            "candidate_id": candidate_id,
            "personalized_jobs": [
                {
                    "job_id": 1,
                    "title": "React Developer Intern",
                    "company": "TechStart Inc",
                    "match_score": 0.92,
                    "reasons": ["Strong React skills", "Good portfolio projects", "Location match"],
                    "growth_potential": "high",
                    "stipend": "₹18,000/month",
                    "location": "Bangalore"
                },
                {
                    "job_id": 2,
                    "title": "Full Stack Intern",
                    "company": "InnovateNow",
                    "match_score": 0.86,
                    "reasons": ["Full stack experience", "Recent projects", "Learning attitude"],
                    "growth_potential": "medium",
                    "stipend": "₹15,000/month",
                    "location": "Hyderabad"
                },
                {
                    "job_id": 3,
                    "title": "Frontend Developer",
                    "company": "WebCorp Solutions",
                    "match_score": 0.81,
                    "reasons": ["UI/UX skills", "JavaScript proficiency", "Team collaboration"],
                    "growth_potential": "medium",
                    "stipend": "₹12,000/month",
                    "location": "Pune"
                }
            ],
            "skill_development_suggestions": [
                {
                    "skill": "TypeScript",
                    "priority": "high",
                    "reason": "High demand in matching job market",
                    "resources": ["Official TypeScript docs", "Frontend Masters course"]
                },
                {
                    "skill": "System Design",
                    "priority": "medium",
                    "reason": "Career advancement requirement",
                    "resources": ["System Design Primer", "LeetCode System Design"]
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

@app.get("/ai/analytics")
async def get_ai_analytics(timeframe: str = "30d"):
    """Get AI/ML analytics and reporting data"""
    try:
        analytics = {
            "matching_metrics": {
                "total_matches": 1250,
                "successful_placements": 185,
                "average_match_score": 0.78,
                "match_accuracy": 0.82
            },
            "assessment_metrics": {
                "total_assessments": 890,
                "average_score": 7.2,
                "completion_rate": 0.89,
                "voice_assessments": 340
            },
            "skill_trends": {
                "most_demanded": ["Python", "React", "Machine Learning", "AWS", "Docker"],
                "emerging_skills": ["Kubernetes", "GraphQL", "Rust", "WebAssembly"],
                "skill_gap_analysis": {
                    "high_demand_low_supply": ["Machine Learning", "DevOps"],
                    "oversupplied": ["Basic Web Development"]
                }
            },
            "fraud_detection_stats": {
                "profiles_analyzed": 2100,
                "anomalies_detected": 42,
                "false_positive_rate": 0.03,
                "bias_incidents": 8
            },
            "performance_metrics": {
                "api_response_time": "145ms",
                "model_accuracy": 0.87,
                "system_uptime": 0.998,
                "daily_active_users": 1450
            }
        }
        return {"success": True, "analytics": analytics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# For Vercel deployment
from mangum import Mangum

# Vercel serverless function handler
handler = Mangum(app)
