from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal

class ResumeAnalysisRequest(BaseModel):
    resume_text: str
    candidate_id: str

class ResumeAnalysisResponse(BaseModel):
    skills: List[str]
    education: List[str]
    experience: List[str]
    summary: str
    missing_fields: List[str]

class RecommendationRequest(BaseModel):
    candidate_id: str
    preferences: Optional[dict] = None

class Recommendation(BaseModel):
    internship_id: str
    match_score: float
    tier: Literal["Strong", "Moderate", "Weak"]
    reasoning: str
    highlighted_skills: List[str]
    quota_status: str
    learning_roadmap: Optional[List[str]] = None

class ApplicationRequest(BaseModel):
    candidate_id: str
    internship_id: str

class ApplicationResponse(BaseModel):
    status: str
    message: str

class InternshipPosting(BaseModel):
    company_id: str
    title: str
    description: str
    requirements: List[str]
    quota: dict
    capacity: int
    eligibility: str
    location: str
    stipend: Optional[str]
    duration: str

class AdminMatchRequest(BaseModel):
    trigger: bool

class QuotaUpdateRequest(BaseModel):
    quota: dict

class AllocationResponse(BaseModel):
    allocations: List[dict]
    overfilled_quotas: List[str]
    blocked_candidates: List[str]
