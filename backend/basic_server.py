"""
Basic backend server for BharatIntern project without heavy AI dependencies
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from datetime import datetime
from typing import Dict, Any, List
import json

# Import our custom HuggingFace NER analyzer
try:
    from resume_ner_analyzer import analyze_resume_with_ner
    NER_ANALYZER_AVAILABLE = True
    print("✅ HuggingFace NER Resume Analyzer loaded successfully")
except ImportError as e:
    print(f"❌ Failed to import HuggingFace NER analyzer: {e}")
    NER_ANALYZER_AVAILABLE = False

# Import file content extractor
try:
    from file_extractor import extract_resume_text
    FILE_EXTRACTOR_AVAILABLE = True
    print("✅ File Content Extractor loaded successfully")
except ImportError as e:
    print(f"❌ Failed to import File Content Extractor: {e}")
    FILE_EXTRACTOR_AVAILABLE = False

# Helper functions for analysis formatting
def generate_missing_skills(current_skills):
    """Generate missing skills suggestions based on current skills"""
    skill_names = [skill["name"].lower() for skill in current_skills]
    
    common_suggestions = [
        {"name": "TypeScript", "impact": "+20%", "reason": "High demand in modern web development"},
        {"name": "Docker", "impact": "+15%", "reason": "Essential for DevOps and deployment"},
        {"name": "AWS", "impact": "+25%", "reason": "Cloud computing skills are highly valued"},
        {"name": "React", "impact": "+18%", "reason": "Popular frontend framework"},
        {"name": "Node.js", "impact": "+16%", "reason": "Backend JavaScript development"},
        {"name": "Git", "impact": "+12%", "reason": "Version control is essential"}
    ]
    
    # Filter out skills already present
    missing = [skill for skill in common_suggestions if skill["name"].lower() not in skill_names]
    return missing[:3]  # Return top 3 missing skills

def generate_strengths(analysis):
    """Generate strengths based on analysis results"""
    strengths = []
    
    skills_count = len(analysis.get("skills", []))
    projects_count = len(analysis.get("projects", []))
    experience_years = analysis.get("experience", {}).get("total_years", 0)
    
    if skills_count > 5:
        strengths.append("Strong technical skill set")
    elif skills_count > 2:
        strengths.append("Good programming foundation")
    else:
        strengths.append("Developing technical skills")
    
    if projects_count > 2:
        strengths.append("Excellent project portfolio")
    elif projects_count > 0:
        strengths.append("Good project experience")
    else:
        strengths.append("Focus on building projects")
    
    if experience_years > 2:
        strengths.append("Experienced professional")
    elif experience_years > 0:
        strengths.append("Relevant experience")
    else:
        strengths.append("Entry level candidate")
    
    return strengths

app = FastAPI(title="BharatIntern API - Basic Version", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://bharatintern-app.onrender.com",
        "*"  # Allow all origins for testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock data
mock_users = [
    {
        "id": 1,
        "email": "candidate@demo.com",
        "name": "John Doe",
        "role": "candidate",
        "phone": "+91 98765 43210",
        "location": "Bangalore"
    },
    {
        "id": 2,
        "email": "company@demo.com",
        "name": "TechCorp India",
        "role": "company",
        "phone": "+91 98765 43211",
        "location": "Mumbai"
    },
    {
        "id": 3,
        "email": "admin@demo.com",
        "name": "Admin User",
        "role": "admin",
        "phone": "+91 98765 43212",
        "location": "Delhi"
    }
]

mock_internships = [
    {
        "id": 1,
        "title": "Frontend Developer Intern",
        "company": "TechCorp India",
        "location": "Bangalore",
        "duration": "6 months",
        "stipend": "₹15,000/month",
        "skills": ["React", "JavaScript", "CSS", "HTML", "TypeScript"],
        "requirements": ["Bachelor's in CS/IT", "Strong JavaScript skills", "React experience"],
        "category": "Software Development",
        "deadline": "2024-02-15",
        "description": "Work on modern web applications using React and modern frontend technologies."
    },
    {
        "id": 2,
        "title": "Data Science Intern",
        "company": "DataViz Solutions",
        "location": "Mumbai",
        "duration": "4 months",
        "stipend": "₹20,000/month",
        "skills": ["Python", "Machine Learning", "SQL", "Pandas", "Scikit-learn"],
        "requirements": ["Python proficiency", "ML knowledge", "Statistics background"],
        "category": "Data Science",
        "deadline": "2024-02-20",
        "description": "Work on real-world data science projects and build machine learning models."
    },
    {
        "id": 3,
        "title": "Backend Developer Intern",
        "company": "API Masters",
        "location": "Pune",
        "duration": "5 months",
        "stipend": "₹18,000/month",
        "skills": ["Node.js", "Express", "MongoDB", "REST APIs", "TypeScript"],
        "requirements": ["Node.js experience", "Database knowledge", "API development"],
        "category": "Backend Development",
        "deadline": "2024-03-01",
        "description": "Build scalable backend services and APIs."
    }
]

@app.get("/")
async def root():
    return {
        "message": "BharatIntern Backend API - Basic Version",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "BharatIntern Backend API",
        "version": "basic-1.0.0"
    }

# Authentication endpoints
@app.post("/auth/login")
async def login(credentials: Dict[str, Any]):
    email = credentials.get("email")
    role = credentials.get("role")
    
    # Mock authentication
    user = next((u for u in mock_users if u["email"] == email and u["role"] == role), None)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    return {"success": True, "user": user}

@app.post("/auth/signup")
async def signup(user_data: Dict[str, Any]):
    # Mock signup
    new_user = {
        "id": len(mock_users) + 1,
        "email": user_data.get("email"),
        "name": user_data.get("name"),
        "role": user_data.get("role"),
        "phone": user_data.get("phone"),
        "location": user_data.get("location")
    }
    mock_users.append(new_user)
    return {"success": True, "user": new_user}

# Resume analysis endpoint with HuggingFace NER model
@app.post("/resume/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    """Resume analysis using HuggingFace NER model"""
    try:
        # Read file content
        content = await file.read()
        
        # Extract text using file extractor if available
        if FILE_EXTRACTOR_AVAILABLE:
            text = extract_resume_text(content, file.filename)
            print(f"✅ Extracted text using file extractor from {file.filename}")
        else:
            text = content.decode('utf-8', errors='ignore')
            print(f"⚠️ Using fallback text extraction for {file.filename}")
        
        if NER_ANALYZER_AVAILABLE and text.strip():
            # Use HuggingFace NER model for analysis
            ner_analysis = analyze_resume_with_ner(text)
            
            # Convert enhanced NER analysis to frontend format
            ats_analysis = ner_analysis.get("ats_analysis", {})
            skill_analysis = ner_analysis.get("skill_analysis", {})
            
            analysis = {
                "extractedSkills": [
                    {
                        "name": skill["name"],
                        "confidence": int(skill["confidence"] * 100),
                        "category": skill["category"],
                        "mentions": skill.get("mentions", 1)
                    }
                    for skill in ner_analysis.get("skills", [])
                ],
                "missingSkills": generate_missing_skills(ner_analysis.get("skills", [])),
                "experience": {
                    "totalYears": ner_analysis.get("experience", {}).get("total_years", 0),
                    "relevantExperience": ner_analysis.get("experience", {}).get("total_years", 0) * 0.8,
                    "internships": 1,
                    "projects": len(ner_analysis.get("projects", [])),
                    "skillExperienceMapping": ner_analysis.get("experience", {}).get("skill_years_mapping", {})
                },
                "education": {
                    "degree": ner_analysis.get("education", {}).get("degrees", [""])[0] if ner_analysis.get("education", {}).get("degrees") else "",
                    "field": "Computer Science",
                    "institution": ner_analysis.get("education", {}).get("institutions", [""])[0] if ner_analysis.get("education", {}).get("institutions") else "",
                    "graduationYear": 2024
                },
                "contactInfo": ner_analysis.get("contact_info", {}),
                "certifications": ner_analysis.get("certifications", []),
                "projects": ner_analysis.get("projects", []),
                "strengths": generate_strengths(ner_analysis),
                "improvements": [imp["suggestion"] for imp in ner_analysis.get("improvement_suggestions", [])],
                "overallScore": ner_analysis.get("overall_score", 70),
                "atsCompatibility": {
                    "score": ats_analysis.get("overall_ats_score", 70),
                    "compatibility": ats_analysis.get("ats_compatibility", "Medium"),
                    "issues": ats_analysis.get("ats_issues", []),
                    "recommendations": ats_analysis.get("ats_recommendations", []),
                    "contentQuality": ats_analysis.get("content_quality_score", 0),
                    "contactScore": ats_analysis.get("contact_info_score", 0),
                    "experienceScore": ats_analysis.get("experience_score", 0),
                    "formatScore": ats_analysis.get("format_keywords_score", 0)
                },
                "skillAnalysis": {
                    "totalSkills": skill_analysis.get("total_skills", 0),
                    "categories": skill_analysis.get("categories", {}),
                    "topSkills": skill_analysis.get("top_skills", []),
                    "keywordDensity": ner_analysis.get("keyword_density", {})
                },
                "careerSuggestions": ner_analysis.get("career_recommendations", []),
                "recommendations": [rec["suggestion"] for rec in ner_analysis.get("improvement_suggestions", [])],
                "nerAnalysis": ner_analysis,  # Include raw NER analysis for debugging
                "analysisMethod": ner_analysis.get("analysis_method", "enhanced_rule_based"),
                "extractedContent": text,  # Include the actual extracted text
                "extractedContentPreview": text[:500] + "..." if len(text) > 500 else text
            }
        else:
            # Fallback to mock analysis
            analysis = {
                "extractedSkills": [
                    {"name": "JavaScript", "confidence": 95, "category": "Programming"},
                    {"name": "React", "confidence": 90, "category": "Frontend"},
                    {"name": "Python", "confidence": 80, "category": "Programming"}
                ],
                "missingSkills": [
                    {"name": "TypeScript", "impact": "+20%", "reason": "High demand in modern web development"}
                ],
                "experience": {"totalYears": 2, "relevantExperience": 1.5, "internships": 1, "projects": 3},
                "education": {"degree": "Bachelor of Technology", "field": "Computer Science"},
                "overallScore": 78,
                "analysisMethod": "fallback_mock"
            }
        
        return {
            "success": True,
            "filename": file.filename,
            "analysis": analysis
        }
        
    except Exception as e:
        print(f"Resume analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

# Internship analysis endpoint with HuggingFace NER model
@app.post("/internship/analyze-resume")
async def analyze_internship_resume(file: UploadFile = File(...)):
    """Internship resume analysis using HuggingFace NER model"""
    try:
        # Read file content
        content = await file.read()
        
        # Extract text using file extractor if available
        if FILE_EXTRACTOR_AVAILABLE:
            text = extract_resume_text(content, file.filename)
            print(f"✅ Extracted text using file extractor from {file.filename}")
        else:
            text = content.decode('utf-8', errors='ignore')
            print(f"⚠️ Using fallback text extraction for {file.filename}")
        
        if NER_ANALYZER_AVAILABLE and text.strip():
            # Use HuggingFace NER model for analysis
            ner_analysis = analyze_resume_with_ner(text)
            
            # Extract skills for internship matching
            skills_extracted = [skill["name"] for skill in ner_analysis.get("skills", [])]
            
            # Determine experience level
            total_years = ner_analysis.get("experience", {}).get("total_years", 0)
            if total_years == 0:
                experience_level = "Fresher"
            elif total_years <= 2:
                experience_level = "Junior"
            else:
                experience_level = "Mid-level"
            
            # Calculate internship readiness
            skill_count = len(skills_extracted)
            if skill_count >= 5:
                internship_readiness = "High"
            elif skill_count >= 3:
                internship_readiness = "Medium"
            else:
                internship_readiness = "Developing"
            
            # Recommend internship roles based on skills
            recommended_roles = []
            if any(skill.lower() in ["javascript", "react", "html", "css"] for skill in skills_extracted):
                recommended_roles.append("Frontend Developer")
            if any(skill.lower() in ["python", "java", "node.js", "express"] for skill in skills_extracted):
                recommended_roles.append("Backend Developer")
            if any(skill.lower() in ["mongodb", "mysql", "postgresql", "database"] for skill in skills_extracted):
                recommended_roles.append("Database Developer")
            if any(skill.lower() in ["machine learning", "data science", "pandas", "numpy"] for skill in skills_extracted):
                recommended_roles.append("Data Science Intern")
            
            if not recommended_roles:
                recommended_roles = ["Software Engineer", "Full Stack Developer"]
            
            # Match with available internships
            matched_internships = []
            for internship in mock_internships:
                match_score = 0
                reasons = []
                
                # Calculate match based on skills overlap
                internship_skills = [skill.lower() for skill in internship.get("skills", [])]
                candidate_skills = [skill.lower() for skill in skills_extracted]
                
                common_skills = set(internship_skills) & set(candidate_skills)
                if common_skills:
                    match_score = int((len(common_skills) / len(internship_skills)) * 100)
                    reasons.extend([f"{skill.title()} expertise" for skill in list(common_skills)[:3]])
                
                if match_score > 40:  # Only include if reasonable match
                    matched_internships.append({
                        "id": internship["id"],
                        "title": internship["title"],
                        "company": internship["company"],
                        "match_score": match_score,
                        "reasons": reasons or ["General programming skills", "Good potential"]
                    })
            
            # Sort by match score
            matched_internships.sort(key=lambda x: x["match_score"], reverse=True)
            
            result = {
                "success": True,
                "filename": file.filename,
                "analysis_type": "internship_ner",
                "timestamp": datetime.now().isoformat(),
                "result": {
                    "skills_extracted": skills_extracted,
                    "experience_level": experience_level,
                    "internship_readiness": internship_readiness,
                    "recommended_roles": recommended_roles,
                    "skill_gaps": ["TypeScript", "Docker", "Cloud Technologies"],  # Static for now
                    "overall_score": ner_analysis.get("overall_score", 70),
                    "feedback": f"Analysis shows {experience_level.lower()} level with {internship_readiness.lower()} internship readiness. Found {len(skills_extracted)} technical skills.",
                    "matched_internships": matched_internships[:5],  # Top 5 matches
                    "ner_analysis": ner_analysis,  # Full NER analysis
                    "contact_info": ner_analysis.get("contact_info", {}),
                    "education": ner_analysis.get("education", {}),
                    "certifications": ner_analysis.get("certifications", []),
                    "projects": ner_analysis.get("projects", []),
                    "analysis_method": ner_analysis.get("analysis_method", "huggingface_ner")
                }
            }
        else:
            # Fallback to mock analysis
            result = {
                "success": True,
                "filename": file.filename,
                "analysis_type": "internship_fallback",
                "timestamp": datetime.now().isoformat(),
                "result": {
                    "skills_extracted": ["JavaScript", "React", "Node.js", "Python"],
                    "experience_level": "Junior",
                    "internship_readiness": "Medium",
                    "recommended_roles": ["Frontend Developer", "Full Stack Developer"],
                    "skill_gaps": ["TypeScript", "Docker", "Cloud Technologies"],
                    "overall_score": 75,
                    "feedback": "Basic analysis completed. Upload a detailed resume for better insights.",
                    "matched_internships": mock_internships[:2],
                    "analysis_method": "fallback_mock"
                }
            }
        
        return JSONResponse(content=result)
        
    except Exception as e:
        print(f"Internship resume analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Internship resume analysis failed: {str(e)}")

# Get internship recommendations
@app.get("/recommendations")
async def get_recommendations(user_id: int = 1, limit: int = 10):
    """Get internship recommendations for a user"""
    # Return mock internships as recommendations
    recommendations = mock_internships[:limit]
    for i, rec in enumerate(recommendations):
        rec["matchScore"] = 95 - (i * 5)  # Decreasing match scores
    
    return recommendations

# Get user applications
@app.get("/applications")
async def get_applications(user_id: int = 1):
    """Get user's internship applications"""
    applications = [
        {
            "id": 1,
            "title": "Frontend Developer Intern",
            "company": "TechCorp India",
            "status": "Shortlisted",
            "appliedDate": "2024-01-15",
            "matchScore": 92
        },
        {
            "id": 2,
            "title": "Backend Developer Intern",
            "company": "API Masters", 
            "status": "Applied",
            "appliedDate": "2024-01-20",
            "matchScore": 87
        }
    ]
    return applications

# Get all internships
@app.get("/internships")
async def get_internships():
    """Get all available internships"""
    return mock_internships

# Apply for internship
@app.post("/internships/{internship_id}/apply")
async def apply_for_internship(internship_id: int, application_data: Dict[str, Any]):
    """Apply for an internship"""
    internship = next((i for i in mock_internships if i["id"] == internship_id), None)
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    
    return {
        "success": True,
        "message": f"Successfully applied for {internship['title']}",
        "application_id": internship_id * 100 + 1
    }

# Company endpoints
@app.get("/company/postings")
async def get_company_postings(company_id: int = 1):
    """Get postings for a company"""
    return mock_internships

@app.post("/company/postings")
async def create_posting(posting_data: Dict[str, Any]):
    """Create a new internship posting"""
    new_posting = {
        "id": len(mock_internships) + 1,
        **posting_data
    }
    mock_internships.append(new_posting)
    return {"success": True, "posting": new_posting}

# Admin endpoints
@app.get("/admin/stats")
async def get_admin_stats():
    """Get admin dashboard statistics"""
    return {
        "total_candidates": len([u for u in mock_users if u["role"] == "candidate"]),
        "total_companies": len([u for u in mock_users if u["role"] == "company"]),
        "total_internships": len(mock_internships),
        "total_applications": 15,
        "placement_rate": 78.5
    }

# Technical assessment endpoint (mock)
@app.post("/internship/technical-assessment")
async def create_technical_assessment(
    internship_role: str = Form("Software Development"),
    num_questions: int = Form(10),
    difficulty: str = Form("moderate")
):
    """Generate mock technical assessment questions"""
    questions = []
    
    for i in range(num_questions):
        questions.append({
            "id": i + 1,
            "question": f"Sample {difficulty} question {i + 1} for {internship_role}",
            "type": "multiple_choice",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "Option A",
            "explanation": f"This is the explanation for question {i + 1}"
        })
    
    return {
        "success": True,
        "role": internship_role,
        "difficulty": difficulty,
        "questions": questions
    }

# Skill assessment endpoint (mock) 
@app.post("/internship/skill-assessment")
async def create_skill_assessment(
    candidate_info: str = Form(...),
    internship_domain: str = Form("Software Development")
):
    """Mock skill assessment"""
    assessment = {
        "domain": internship_domain,
        "overall_score": 75,
        "skill_breakdown": {
            "technical_skills": 80,
            "problem_solving": 70,
            "communication": 75,
            "teamwork": 85
        },
        "strengths": ["Good technical foundation", "Strong problem-solving skills"],
        "areas_for_improvement": ["Advanced algorithms", "System design"],
        "learning_recommendations": [
            "Complete data structures course",
            "Practice system design problems",
            "Work on communication skills"
        ]
    }
    
    return {"success": True, "assessment": assessment}

# Get internship domains
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
        "Business Development"
    ]
    
    return {"success": True, "domains": domains}

# Advanced AI Resume Analysis Endpoint (for frontend compatibility)
@app.post("/ai/analyze-resume-advanced")
async def analyze_resume_advanced(file: UploadFile = File(...)):
    """Advanced resume analysis endpoint that matches frontend expectations"""
    try:
        # Read file content
        content = await file.read()
        
        # Extract text using file extractor if available
        if FILE_EXTRACTOR_AVAILABLE:
            text = extract_resume_text(content, file.filename)
            print(f"✅ Extracted text using file extractor from {file.filename}")
        else:
            text = content.decode('utf-8', errors='ignore')
            print(f"⚠️ Using fallback text extraction for {file.filename}")
        
        if NER_ANALYZER_AVAILABLE and text.strip():
            # Use HuggingFace NER model for analysis
            ner_analysis = analyze_resume_with_ner(text)
            
            # Convert to expected format for frontend
            analysis = {
                "extractedSkills": [
                    {
                        "name": skill["name"],
                        "confidence": int(skill["confidence"] * 100),
                        "category": skill["category"]
                    }
                    for skill in ner_analysis.get("skills", [])
                ],
                "personalInfo": ner_analysis.get("contact_info", {}),
                "experience": ner_analysis.get("experience", {}),
                "education": ner_analysis.get("education", {}),
                "projects": ner_analysis.get("projects", []),
                "certifications": ner_analysis.get("certifications", []),
                "summary": f"Resume analysis completed using {ner_analysis.get('analysis_method', 'advanced')} method",
                "overallScore": ner_analysis.get("overall_score", 70),
                "improvements": [
                    "Add more specific technical skills",
                    "Include quantifiable achievements", 
                    "Highlight leadership experience"
                ],
                "careerSuggestions": [
                    {"title": "Software Engineer", "match": 85, "growth": "High"},
                    {"title": "Full Stack Developer", "match": 80, "growth": "High"}
                ],
                "atsCompatibility": {
                    "score": ner_analysis.get("overall_score", 70),
                    "issues": ["Use standard section headings", "Add more keywords"],
                    "recommendations": ["Include relevant technical skills", "Use bullet points"]
                },
                "nerAnalysis": ner_analysis,  # Include raw NER analysis for debugging
                "analysisMethod": ner_analysis.get("analysis_method", "unknown")
            }
        else:
            # Fallback to enhanced mock analysis with extracted text content
            analysis = {
                "extractedSkills": [
                    {"name": "JavaScript", "confidence": 95, "category": "Programming"},
                    {"name": "React", "confidence": 90, "category": "Frontend"},
                    {"name": "Python", "confidence": 80, "category": "Programming"}
                ],
                "personalInfo": {
                    "name": "Resume Candidate",
                    "email": "candidate@example.com",
                    "phone": "+1-234-567-8900"
                },
                "experience": {"totalYears": 2, "relevantExperience": 1.5},
                "education": {"degree": "Bachelor of Technology", "field": "Computer Science"},
                "overallScore": 78,
                "summary": f"Basic analysis completed for {file.filename}. Upload detailed resume for better insights.",
                "analysisMethod": "fallback_enhanced",
                "extractedContent": text,  # Include the actual extracted text
                "extractedContentPreview": text[:500] + "..." if len(text) > 500 else text
            }
        
        return {
            "success": True,
            "filename": file.filename,
            "analysis": analysis
        }
        
    except Exception as e:
        print(f"Advanced resume analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Advanced resume analysis failed: {str(e)}")

# HuggingFace NER Model Test Endpoint
@app.post("/test/ner-model")
async def test_ner_model(text_input: Dict[str, str]):
    """Test endpoint for HuggingFace NER model"""
    try:
        if not NER_ANALYZER_AVAILABLE:
            return {"error": "NER analyzer not available", "available": False}
        
        text = text_input.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="Text input required")
        
        analysis = analyze_resume_with_ner(text)
        
        return {
            "success": True,
            "analysis": analysis,
            "model_info": {
                "model_name": "yashpwr/resume-ner-bert-v2",
                "analysis_method": analysis.get("analysis_method", "unknown"),
                "entity_count": analysis.get("entity_count", 0),
                "confidence_avg": analysis.get("confidence_avg", 0)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"NER model test failed: {str(e)}")

@app.get("/api/model-status")
async def get_model_status():
    """Get status of available AI models and services"""
    return {
        "ner_analyzer": NER_ANALYZER_AVAILABLE,
        "file_extractor": FILE_EXTRACTOR_AVAILABLE,
        "huggingface_model": "yashpwr/resume-ner-bert-v2",
        "supported_file_types": ["PDF", "DOCX", "DOC", "TXT"] if FILE_EXTRACTOR_AVAILABLE else ["TXT"],
        "api_endpoints": [
            "/resume/analyze - Resume analysis with NER",
            "/internship/analyze-resume - Internship-focused analysis", 
            "/test/ner-model - Test NER model directly",
            "/api/model-status - Check model availability"
        ]
    }

if __name__ == "__main__":
    print("🚀 Starting BharatIntern Backend API - Enhanced with HuggingFace NER & File Processing")
    print("📡 Server will be available at: http://localhost:8000")
    print("📋 API Documentation: http://localhost:8000/docs")
    print(f"🤖 NER Model Available: {NER_ANALYZER_AVAILABLE}")
    print(f"📄 File Extractor Available: {FILE_EXTRACTOR_AVAILABLE}")
    if FILE_EXTRACTOR_AVAILABLE:
        print("✅ Supported file types: PDF, DOCX, DOC, TXT")
    else:
        print("⚠️ Only TXT files supported (fallback mode)")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=False,
        log_level="info"
    )