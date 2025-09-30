from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import tempfile
import logging
from typing import List, Dict, Any, Optional
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import our internship models
IMPORTS_SUCCESSFUL = True
IMPORT_ERRORS = []

try:
    from internship_resume_analyzer import analyze_internship_resume, process_resume_file
    from internship_technical_assessment import generate_internship_technical_assessment, evaluate_technical_assessment
    from internship_skill_assessor import assess_internship_skills, create_learning_roadmap
    from internship_matcher import InternshipMatcher, create_sample_internships
    logger.info("✅ Successfully imported all internship models")
except ImportError as e:
    logger.error(f"❌ Failed to import internship models: {e}")
    IMPORTS_SUCCESSFUL = False
    IMPORT_ERRORS.append(f"internship_models: {e}")

app = FastAPI(
    title="Bharat Intern Portal API",
    description="AI-powered internship matching and assessment platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://*.vercel.app",
        "*"  # Allow all origins for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize internship matcher
internship_matcher = InternshipMatcher() if IMPORTS_SUCCESSFUL else None

@app.get("/")
async def root():
    """API root endpoint with system status"""
    return {
        "message": "Bharat Intern Portal API",
        "version": "1.0.0",
        "status": "healthy" if IMPORTS_SUCCESSFUL else "degraded",
        "available_endpoints": [
            "/analyze-resume",
            "/technical-assessment", 
            "/skill-assessment",
            "/match-internships",
            "/learning-roadmap",
            "/health"
        ],
        "import_errors": IMPORT_ERRORS if not IMPORTS_SUCCESSFUL else None
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy" if IMPORTS_SUCCESSFUL else "degraded",
        "imports_successful": IMPORTS_SUCCESSFUL,
        "errors": IMPORT_ERRORS
    }

@app.post("/analyze-resume")
async def analyze_resume(
    file: UploadFile = File(...),
    analysis_type: str = Form("internship")
):
    """
    Analyze uploaded resume for internship suitability
    """
    try:
        if not IMPORTS_SUCCESSFUL:
            raise HTTPException(status_code=503, detail="Resume analysis service unavailable")
        
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
            raise HTTPException(status_code=400, detail="Only PDF and DOCX files are supported")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Process the resume
            result = process_resume_file(temp_file_path)
            
            return JSONResponse(content={
                "success": True,
                "filename": file.filename,
                "analysis_type": analysis_type,
                "result": result
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in resume analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Resume analysis failed: {str(e)}")

@app.post("/technical-assessment")
async def create_technical_assessment(
    internship_role: str = Form("Software Development"),
    num_questions: int = Form(10),
    difficulty: str = Form("moderate")
):
    """
    Generate technical assessment questions for internship roles
    """
    try:
        if not IMPORTS_SUCCESSFUL:
            raise HTTPException(status_code=503, detail="Technical assessment service unavailable")
        
        # Validate inputs
        if num_questions < 1 or num_questions > 50:
            raise HTTPException(status_code=400, detail="Number of questions must be between 1 and 50")
        
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
        logger.error(f"Error in technical assessment generation: {e}")
        raise HTTPException(status_code=500, detail=f"Technical assessment generation failed: {str(e)}")

@app.post("/evaluate-assessment")
async def evaluate_assessment_answers(
    user_answers: Dict[str, str],
    correct_answers: List[Dict]
):
    """
    Evaluate user's technical assessment answers
    """
    try:
        if not IMPORTS_SUCCESSFUL:
            raise HTTPException(status_code=503, detail="Assessment evaluation service unavailable")
        
        # Evaluate answers
        result = evaluate_technical_assessment(user_answers, correct_answers)
        
        return JSONResponse(content={
            "success": True,
            "evaluation": result
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in assessment evaluation: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment evaluation failed: {str(e)}")

@app.post("/skill-assessment")
async def create_skill_assessment(
    candidate_info: str = Form(...),
    internship_domain: str = Form("Software Development")
):
    """
    Assess candidate's skills for internship readiness
    """
    try:
        if not IMPORTS_SUCCESSFUL:
            raise HTTPException(status_code=503, detail="Skill assessment service unavailable")
        
        # Perform skill assessment
        result = assess_internship_skills(candidate_info, internship_domain)
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in skill assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Skill assessment failed: {str(e)}")

@app.post("/match-internships")
async def match_candidate_internships(
    candidate_profile: str = Form(...),
    internship_listings: Optional[str] = Form(None)
):
    """
    Match candidate with suitable internship opportunities
    """
    try:
        if not IMPORTS_SUCCESSFUL or not internship_matcher:
            raise HTTPException(status_code=503, detail="Internship matching service unavailable")
        
        # Parse internship listings or use sample data
        if internship_listings:
            try:
                listings = json.loads(internship_listings)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid JSON format for internship listings")
        else:
            # Use sample internships
            listings = create_sample_internships()
        
        # Perform matching
        result = internship_matcher.match_internships(candidate_profile, listings)
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in internship matching: {e}")
        raise HTTPException(status_code=500, detail=f"Internship matching failed: {str(e)}")

@app.post("/learning-roadmap")
async def generate_learning_roadmap(
    assessment_data: Dict = None,
    domain: str = Form("Software Development")
):
    """
    Generate personalized learning roadmap based on skill assessment
    """
    try:
        if not IMPORTS_SUCCESSFUL:
            raise HTTPException(status_code=503, detail="Learning roadmap service unavailable")
        
        # Generate roadmap
        roadmap = create_learning_roadmap(assessment_data or {}, domain)
        
        return JSONResponse(content={
            "success": True,
            "roadmap": roadmap
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating learning roadmap: {e}")
        raise HTTPException(status_code=500, detail=f"Learning roadmap generation failed: {str(e)}")

@app.get("/internship-domains")
async def get_internship_domains():
    """
    Get available internship domains
    """
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

@app.get("/sample-internships")
async def get_sample_internships():
    """
    Get sample internship listings for testing
    """
    try:
        if not IMPORTS_SUCCESSFUL:
            return JSONResponse(content={"success": False, "error": "Service unavailable"})
        
        sample_internships = create_sample_internships()
        
        return JSONResponse(content={
            "success": True,
            "internships": sample_internships
        })
        
    except Exception as e:
        logger.error(f"Error getting sample internships: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting Bharat Intern Portal API Server...")
    print(f"📊 Imports successful: {IMPORTS_SUCCESSFUL}")
    if IMPORT_ERRORS:
        print(f"⚠️ Import errors: {IMPORT_ERRORS}")
    
    uvicorn.run(
        "models_api:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )