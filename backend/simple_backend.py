"""
Simple Backend Server for BharatIntern
This is a lightweight version that works without heavy ML dependencies
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional, Dict, Any
from datetime import datetime
import tempfile
import os
import uvicorn

app = FastAPI(title="BharatIntern API - Lightweight", version="1.0.0")

# CORS Configuration
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

# Check for Perplexity AI
PERPLEXITY_AVAILABLE = False
perplexity_analyzer = None

try:
    from ai_modules.perplexity_analyzer import PerplexityResumeAnalyzer
    PERPLEXITY_AVAILABLE = True
    print("✅ Perplexity AI available")
except Exception as e:
    print(f"⚠️  Perplexity AI not available: {e}")


@app.get("/")
def root():
    return {
        "message": "BharatIntern Lightweight Backend",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
        "perplexity_available": PERPLEXITY_AVAILABLE
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "perplexity_available": PERPLEXITY_AVAILABLE,
        "version": "1.0.0-lightweight"
    }


@app.get("/ai/health")
def ai_health():
    """AI system health check"""
    return {
        "status": "operational",
        "openai": {
            "available": False,  # OpenAI not configured in simple backend
            "status": "not_configured"
        },
        "gemini": {
            "available": False,  # Gemini not configured in simple backend
            "status": "not_configured"
        },
        "perplexity": {
            "available": PERPLEXITY_AVAILABLE,
            "status": "ready" if PERPLEXITY_AVAILABLE else "not_configured"
        },
        "recommended": "perplexity" if PERPLEXITY_AVAILABLE else "mock",
        "timestamp": datetime.now().isoformat()
    }


# ========== Perplexity AI Endpoints ==========

@app.post("/ai/analyze-resume-perplexity")
async def analyze_resume_perplexity(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    target_industry: Optional[str] = Form(None),
):
    """Analyze resume using Perplexity AI"""
    global perplexity_analyzer
    
    if not PERPLEXITY_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="Perplexity AI not configured. Please set PERPLEXITY_API_KEY environment variable."
        )
    
    # Initialize analyzer if needed
    if perplexity_analyzer is None:
        try:
            perplexity_analyzer = PerplexityResumeAnalyzer()
        except ValueError as e:
            raise HTTPException(status_code=503, detail=str(e))
    
    # Validate file type
    if not file.filename.lower().endswith((".pdf", ".doc", ".docx", ".txt")):
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOC, DOCX, and TXT files are supported"
        )
    
    # Save temp file
    with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name
    
    try:
        # Extract text from file
        resume_text = await extract_text_from_file(tmp_path, file.filename)
        
        # Analyze with Perplexity AI
        analysis = perplexity_analyzer.analyze_resume(
            resume_text,
            target_role=target_role,
            target_industry=target_industry
        )
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "analysis": analysis,
            "ai_provider": "Perplexity AI"
        })
        
    except Exception as e:
        print(f"❌ Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
    finally:
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)


@app.post("/ai/career-suggestions-perplexity")
async def career_suggestions_perplexity(payload: Dict[str, Any]):
    """Get career suggestions using Perplexity AI"""
    global perplexity_analyzer
    
    if not PERPLEXITY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Perplexity AI not configured")
    
    if perplexity_analyzer is None:
        try:
            perplexity_analyzer = PerplexityResumeAnalyzer()
        except ValueError as e:
            raise HTTPException(status_code=503, detail=str(e))
    
    try:
        resume_text = payload.get("resume_text", "")
        preferences = payload.get("preferences", {})
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="resume_text is required")
        
        suggestions = perplexity_analyzer.get_career_suggestions(resume_text, preferences)
        
        return JSONResponse(content={
            "success": True,
            "suggestions": suggestions,
            "ai_provider": "Perplexity AI"
        })
        
    except Exception as e:
        print(f"❌ Career suggestions error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get suggestions: {str(e)}")


@app.post("/ai/optimize-ats-perplexity")
async def optimize_ats_perplexity(payload: Dict[str, Any]):
    """Optimize resume for ATS using Perplexity AI"""
    global perplexity_analyzer
    
    if not PERPLEXITY_AVAILABLE:
        raise HTTPException(status_code=503, detail="Perplexity AI not configured")
    
    if perplexity_analyzer is None:
        try:
            perplexity_analyzer = PerplexityResumeAnalyzer()
        except ValueError as e:
            raise HTTPException(status_code=503, detail=str(e))
    
    try:
        resume_text = payload.get("resume_text", "")
        job_description = payload.get("job_description", "")
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="resume_text is required")
        
        optimization = perplexity_analyzer.optimize_for_ats(resume_text, job_description)
        
        return JSONResponse(content={
            "success": True,
            "optimization": optimization,
            "ai_provider": "Perplexity AI"
        })
        
    except Exception as e:
        print(f"❌ ATS optimization error: {e}")
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


async def extract_text_from_file(file_path: str, filename: str) -> str:
    """Extract text from various file formats"""
    try:
        if filename.lower().endswith(".pdf"):
            try:
                import PyPDF2
                with open(file_path, "rb") as f:
                    reader = PyPDF2.PdfReader(f)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
                    return text.strip()
            except ImportError:
                raise Exception("PyPDF2 not installed. Install with: pip install PyPDF2")
                
        elif filename.lower().endswith((".doc", ".docx")):
            try:
                import docx
                doc = docx.Document(file_path)
                text = "\n".join([para.text for para in doc.paragraphs])
                return text.strip()
            except ImportError:
                raise Exception("python-docx not installed. Install with: pip install python-docx")
            
        elif filename.lower().endswith(".txt"):
            with open(file_path, "r", encoding="utf-8") as f:
                return f.read().strip()
                
        else:
            raise ValueError(f"Unsupported file format: {filename}")
            
    except Exception as e:
        print(f"❌ Text extraction error: {e}")
        raise Exception(f"Failed to extract text from {filename}: {str(e)}")


# Mock resume analysis endpoint for fallback
@app.post("/internship/analyze-resume")
async def analyze_internship_resume_mock(file: UploadFile = File(...)):
    """Mock resume analysis endpoint"""
    return JSONResponse(content={
        "success": True,
        "filename": file.filename,
        "analysis": {
            "overallScore": 75,
            "summary": "This is a mock analysis. Configure Perplexity AI for real analysis.",
            "extractedSkills": [
                {"name": "Python", "category": "Technical", "level": "Intermediate", "confidence": 80},
                {"name": "JavaScript", "category": "Technical", "level": "Intermediate", "confidence": 75}
            ],
            "improvements": [
                {
                    "type": "Content",
                    "section": "Experience",
                    "priority": "High",
                    "suggested": "Add more quantifiable achievements",
                    "reason": "Numbers and metrics make impact clearer"
                }
            ],
            "atsCompatibility": {
                "score": 70,
                "parsing_success": True,
                "format_issues": [],
                "keyword_optimization": 65,
                "recommendations": ["Use standard section headings", "Add more industry keywords"]
            }
        },
        "analysis_type": "mock"
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"\n🚀 Starting BharatIntern Lightweight Backend on port {port}")
    print(f"📡 API Documentation: http://localhost:{port}/docs")
    print(f"❤️  Health Check: http://localhost:{port}/health")
    print(f"🤖 AI Health: http://localhost:{port}/ai/health")
    
    if PERPLEXITY_AVAILABLE:
        print("✅ Perplexity AI is ready!")
    else:
        print("⚠️  Perplexity AI not configured - using mock responses")
    
    print(f"\n{'='*60}\n")
    
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
