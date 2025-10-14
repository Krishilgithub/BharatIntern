"""
Simple backend server for testing HuggingFace integration without TensorFlow dependencies
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import tempfile
import os
from datetime import datetime

# Import our internship models
try:
    import sys
    sys.path.append('models')
    from models.internship_resume_analyzer import analyze_internship_resume, process_resume_file
    INTERNSHIP_MODELS_AVAILABLE = True
    print("✅ Internship models imported successfully")
except ImportError as e:
    print(f"❌ Failed to import internship models: {e}")
    INTERNSHIP_MODELS_AVAILABLE = False

app = FastAPI(title="BharatIntern API - Test Version", version="1.0.0")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "BharatIntern Backend API - Test Version", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "internship_models_available": INTERNSHIP_MODELS_AVAILABLE,
        "version": "test-1.0.0"
    }

@app.post("/internship/analyze-resume")
async def analyze_internship_resume_endpoint(file: UploadFile = File(...)):
    """Analyze resume specifically for internship opportunities"""
    try:
        print(f"🎯 Received resume analysis request for file: {file.filename}")
        
        if not INTERNSHIP_MODELS_AVAILABLE:
            print("❌ Internship models not available")
            raise HTTPException(status_code=503, detail="Internship analysis service unavailable")
        
        # Validate file type
        filename = file.filename or "unknown_file.txt"
        if not filename.lower().endswith(('.pdf', '.docx', '.doc', '.txt')):
            raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT files are supported")
        
        print(f"📄 File details: {filename}, content-type: {file.content_type}")
        
        # Save uploaded file temporarily
        file_ext = os.path.splitext(filename)[1] or '.txt'
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        print(f"💾 Saved file temporarily at: {temp_file_path}")
        
        try:
            # Process the resume for internships
            print("🔄 Processing resume file...")
            result = process_resume_file(temp_file_path)
            print(f"✅ Resume processing completed: {type(result)}")
            
            response_data = {
                "success": True,
                "filename": file.filename,
                "analysis_type": "internship",
                "timestamp": datetime.now().isoformat(),
                "result": result
            }
            
            print(f"📊 Sending response: {len(str(response_data))} characters")
            return JSONResponse(content=response_data)
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                print(f"🗑️ Cleaned up temporary file: {temp_file_path}")
                
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in resume analysis: {e}")
        import traceback
        print(f"🔍 Full traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Internship resume analysis failed: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting BharatIntern Backend Test Server...")
    print("📡 Server will be available at: http://localhost:8000")
    print("📋 Available endpoints:")
    print("  - GET  /health")
    print("  - POST /internship/analyze-resume")
    
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000, 
        reload=False,
        log_level="info"
    )