"""Simple test server to verify FastAPI functionality"""
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uvicorn

app = FastAPI(title="PM Internship Portal - ML Test Server", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class CodingProfileRequest(BaseModel):
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Enhanced ML/AI Backend Server is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Server is running without ML dependencies for now",
        "next_steps": "Will integrate advanced ML modules after resolving dependency conflicts"
    }

@app.post("/auth/login")
async def login(request: LoginRequest):
    """Mock authentication"""
    return {
        "success": True,
        "user": {
            "id": 1,
            "email": request.email,
            "name": "Test User",
            "role": request.role
        },
        "token": "mock_jwt_token_123"
    }

@app.post("/ai/analyze-resume-test")
async def analyze_resume_test(file: UploadFile = File(...)):
    """Test endpoint for resume analysis"""
    try:
        content = await file.read()
        text = content.decode('utf-8')
        
        return {
            "success": True,
            "message": "Resume analysis endpoint working",
            "filename": file.filename,
            "text_length": len(text),
            "text_preview": text[:200] + "..." if len(text) > 200 else text,
            "note": "Advanced ML analysis will be integrated after resolving dependencies"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/coding-profile-test")
async def coding_profile_test(request: CodingProfileRequest):
    """Test endpoint for coding profile analysis"""
    return {
        "success": True,
        "message": "Coding profile analysis endpoint working",
        "github_username": request.github_username,
        "leetcode_username": request.leetcode_username,
        "note": "Advanced scraping and analysis will be integrated after resolving dependencies"
    }

@app.get("/ai/ml-status")
async def ml_status():
    """Show current ML implementation status"""
    return {
        "status": "In Development",
        "message": "Advanced ML/AI modules created but have dependency conflicts",
        "created_modules": [
            "AdvancedNLPProcessor - spaCy, sentence-transformers, TF-IDF analysis",
            "AdvancedResumeAnalyzer - RandomForest, skill scoring, salary prediction", 
            "CodingProfileScraper - GitHub API, LeetCode scraping, activity analysis",
            "LangChainGeminiAnalyzer - LangChain integration, Gemini API"
        ],
        "dependencies_installed": [
            "sentence-transformers",
            "langchain", 
            "langchain-google-genai",
            "beautifulsoup4",
            "selenium",
            "spacy (with en_core_web_sm model)",
            "scikit-learn",
            "pandas",
            "numpy"
        ],
        "current_issue": "TensorFlow/JAX/ml_dtypes version conflicts",
        "next_steps": [
            "Resolve dependency conflicts",
            "Create isolated ML environment",
            "Integrate advanced modules with proper error handling",
            "Test end-to-end functionality"
        ],
        "architecture": "Modular design allows easy integration once dependencies are resolved"
    }

if __name__ == "__main__":
    print("🧪 Starting Test Server...")
    print("📝 Advanced ML modules are ready for integration")
    print("🔧 Resolving dependency conflicts before full deployment")
    uvicorn.run(app, host="0.0.0.0", port=8000)