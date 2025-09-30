from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import os
import tempfile

app = FastAPI(title="Simple Internship API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    job_description: str = ""

# Import simple internship analyzer
try:
    from models.simple_internship_analyzer import analyze_internship_resume, process_resume_file
    print("✅ Successfully imported simple internship analyzer")
    INTERNSHIP_MODELS_AVAILABLE = True
except ImportError as e:
    print(f"❌ Failed to import simple internship analyzer: {e}")
    INTERNSHIP_MODELS_AVAILABLE = False

@app.get("/")
async def root():
    return {"message": "Simple Internship Portal API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "internship_models_available": INTERNSHIP_MODELS_AVAILABLE,
        "simple_analyzer": True,
        "complex_analyzer": False
    }

@app.post("/internship/analyze-resume")
async def analyze_internship_resume_endpoint(file: UploadFile = File(...)):
    """Analyze resume specifically for internship opportunities"""
    try:
        if not INTERNSHIP_MODELS_AVAILABLE:
            raise HTTPException(status_code=503, detail="Internship analysis service unavailable")
        
        print(f"📄 Received file: {file.filename}")
        print(f"📋 Content type: {file.content_type}")
        
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx', '.doc', '.txt')):
            raise HTTPException(status_code=400, detail="Only PDF, DOCX, DOC, and TXT files are supported")
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        print(f"📁 Temporary file created: {temp_file_path}")
        
        try:
            # Process the resume for internships
            result = process_resume_file(temp_file_path)
            
            print(f"✅ Processing complete: {result.get('success', False)}")
            
            return JSONResponse(content={
                "success": True,
                "filename": file.filename,
                "analysis_type": "internship",
                "result": result
            })
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                print(f"🧹 Cleaned up temporary file: {temp_file_path}")
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in analyze_internship_resume_endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internship resume analysis failed: {str(e)}")

@app.post("/analyze_internship_resume")
async def analyze_internship_resume_json_endpoint(request: ResumeAnalysisRequest):
    """Analyze resume text for internship opportunities (JSON endpoint)"""
    try:
        if not INTERNSHIP_MODELS_AVAILABLE:
            raise HTTPException(status_code=503, detail="Internship analysis service unavailable")
        
        print(f"📄 Received resume text: {len(request.resume_text)} characters")
        print(f"📋 Job description: {len(request.job_description)} characters")
        
        # Analyze the resume
        result = analyze_internship_resume(request.resume_text)
        
        print(f"✅ Analysis complete: {result.get('success', False)}")
        
        return JSONResponse(content=result)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in analyze_internship_resume_json_endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Internship resume analysis failed: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting Simple Internship API Server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)