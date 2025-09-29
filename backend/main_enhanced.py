"""Simple FastAPI startup without TensorFlow dependencies"""
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, date
import random
import json
import asyncio

# Import advanced analyzers (avoiding TensorFlow imports for now)
try:
    from ai_modules.advanced_nlp_processor import AdvancedNLPProcessor
    ADVANCED_NLP_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Advanced NLP not available: {e}")
    ADVANCED_NLP_AVAILABLE = False

try:
    from ai_modules.advanced_resume_analyzer import AdvancedResumeAnalyzer
    ADVANCED_RESUME_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Advanced Resume Analyzer not available: {e}")
    ADVANCED_RESUME_AVAILABLE = False

try:
    from ai_modules.coding_profile_scraper import CodingProfileScraper
    CODING_SCRAPER_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Coding Profile Scraper not available: {e}")
    CODING_SCRAPER_AVAILABLE = False

try:
    from ai_modules.langchain_gemini_analyzer import LangChainGeminiAnalyzer
    LANGCHAIN_AVAILABLE = True
except ImportError as e:
    print(f"Warning: LangChain Analyzer not available: {e}")
    LANGCHAIN_AVAILABLE = False

app = FastAPI(title="PM Internship Portal API - Enhanced ML Edition", version="2.0.0")

# Initialize advanced analyzers
nlp_processor = None
advanced_resume_analyzer = None
coding_scraper = None
langchain_analyzer = None

@app.on_event("startup")
async def startup_event():
    """Initialize available AI services on startup"""
    global nlp_processor, advanced_resume_analyzer, coding_scraper, langchain_analyzer
    
    print("🚀 Initializing Enhanced AI Services...")
    
    # Initialize advanced analyzers
    try:
        if ADVANCED_NLP_AVAILABLE:
            print("🔧 Initializing Advanced NLP Processor...")
            nlp_processor = AdvancedNLPProcessor()
            await nlp_processor.initialize()
            print("✅ Advanced NLP Processor initialized!")
        
        if ADVANCED_RESUME_AVAILABLE:
            print("📄 Initializing Advanced Resume Analyzer...")
            advanced_resume_analyzer = AdvancedResumeAnalyzer()
            print("✅ Advanced Resume Analyzer initialized!")
        
        if CODING_SCRAPER_AVAILABLE:
            print("💻 Initializing Coding Profile Scraper...")
            coding_scraper = CodingProfileScraper()
            print("✅ Coding Profile Scraper initialized!")
        
        if LANGCHAIN_AVAILABLE:
            print("🤖 Initializing LangChain Gemini Analyzer...")
            langchain_analyzer = LangChainGeminiAnalyzer()
            print("✅ LangChain Gemini Analyzer initialized!")
        
        print(f"📊 ML/AI Services Status:")
        print(f"  - Advanced NLP: {'✓' if nlp_processor else '✗'}")
        print(f"  - Advanced Resume Analyzer: {'✓' if advanced_resume_analyzer else '✗'}")
        print(f"  - Coding Profile Scraper: {'✓' if coding_scraper else '✗'}")
        print(f"  - LangChain Analyzer: {'✓' if langchain_analyzer else '✗'}")
        
    except Exception as e:
        print(f"⚠️ Warning: Could not initialize all advanced analyzers: {e}")
        print("📝 Some features may fall back to basic analysis")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str
    role: str

class CodingProfileRequest(BaseModel):
    github_username: Optional[str] = None
    leetcode_username: Optional[str] = None

# Core endpoints
@app.post("/auth/login")
async def login(request: LoginRequest):
    """Authenticate user"""
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

@app.get("/health")
async def health_check():
    """System health check"""
    return {
        "status": "healthy",
        "ml_services": {
            "advanced_nlp": nlp_processor is not None,
            "advanced_resume_analyzer": advanced_resume_analyzer is not None,
            "coding_scraper": coding_scraper is not None,
            "langchain_analyzer": langchain_analyzer is not None
        }
    }

# Enhanced AI endpoints
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
        
        # Fallback if no advanced analyzers available
        if not any([nlp_processor, advanced_resume_analyzer, langchain_analyzer]):
            results["basic_analysis"] = {
                "message": "Advanced analyzers not available",
                "filename": file.filename,
                "text_length": len(text),
                "fallback": True
            }
        
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
        
        # Fallback if no advanced scraper
        if not coding_scraper:
            results["fallback_analysis"] = {
                "message": "Advanced coding scraper not available",
                "github_username": request.github_username,
                "leetcode_username": request.leetcode_username,
                "fallback": True
            }
        
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

@app.get("/ai/demo-analysis")
async def demo_analysis():
    """Demo endpoint to show available ML/AI capabilities"""
    return {
        "success": True,
        "message": "Enhanced ML/AI Backend Demo",
        "available_services": {
            "advanced_nlp_processor": {
                "available": nlp_processor is not None,
                "features": [
                    "spaCy NLP with entity recognition",
                    "Sentence transformers for semantic analysis", 
                    "TF-IDF keyword extraction",
                    "Contact information parsing",
                    "Experience and education extraction",
                    "Skills analysis with ML algorithms",
                    "Job matching with similarity scoring"
                ] if nlp_processor else ["Service not available"]
            },
            "advanced_resume_analyzer": {
                "available": advanced_resume_analyzer is not None,
                "features": [
                    "RandomForest classifiers for skill importance",
                    "Experience level prediction",
                    "Salary estimation algorithms",
                    "Job category prediction",
                    "Comprehensive scoring system"
                ] if advanced_resume_analyzer else ["Service not available"]
            },
            "coding_profile_scraper": {
                "available": coding_scraper is not None,
                "features": [
                    "GitHub API integration",
                    "LeetCode profile scraping",
                    "HackerRank analysis",
                    "Activity scoring algorithms",
                    "Repository insights",
                    "Language analysis"
                ] if coding_scraper else ["Service not available"]
            },
            "langchain_analyzer": {
                "available": langchain_analyzer is not None,
                "features": [
                    "LangChain orchestration",
                    "Gemini API integration",
                    "Advanced LLM analysis",
                    "Interview question generation",
                    "Career roadmap suggestions",
                    "Structured output parsing"
                ] if langchain_analyzer else ["Service not available"]
            }
        },
        "implementation_status": "Real ML/AI using free/open-source tools",
        "architecture": "Modular design for future paid API integration"
    }

if __name__ == "__main__":
    print("🌟 Starting Enhanced ML/AI Backend Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)