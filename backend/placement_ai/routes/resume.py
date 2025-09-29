from fastapi import APIRouter, HTTPException, Depends
from ..models import ResumeAnalysisRequest, ResumeAnalysisResponse
from ..db import get_candidate_by_id
from ..ai_engine import analyze_resume

router = APIRouter()

@router.post("/resume/analyze", response_model=ResumeAnalysisResponse)
def analyze_resume_endpoint(req: ResumeAnalysisRequest):
    candidate = get_candidate_by_id(req.candidate_id) if req.candidate_id else None
    result = analyze_resume(req.resume_url, req.manual_skills, candidate)
    if not result["skills"]:
        raise HTTPException(status_code=422, detail="No skills found in resume or manual entry.")
    return result
