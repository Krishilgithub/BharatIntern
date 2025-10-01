from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal

class Candidate(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: Literal["Candidate"] = "Candidate"
    skills: List[str] = []
    preferences: dict = {}
    resume_url: Optional[str] = None
    quota_category: Optional[str] = None  # SC/ST/OBC/EWS/GEN/Women
    past_internships: int = 0
    is_active: bool = True
    manual_skills: List[str] = []
    gpa: Optional[float] = None

class Internship(BaseModel):
    id: str
    company_id: str
    title: str
    description: str
    requirements: List[str] = []
    location: str
    domain: str
    duration: str
    stipend: Optional[str] = None
    capacity: int
    eligibility: dict = {}
    quota: dict = {}  # {"SC": 2, "ST": 1, ...}
    is_active: bool = True

class Application(BaseModel):
    id: str
    candidate_id: str
    internship_id: str
    status: Literal["applied", "shortlisted", "allocated", "rejected"] = "applied"
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class Quota(BaseModel):
    category: str  # SC/ST/OBC/EWS/Women/GEN
    total: int
    filled: int

class ResumeAnalysisRequest(BaseModel):
    resume_url: Optional[str] = None
    manual_skills: Optional[List[str]] = None
    candidate_id: Optional[str] = None

class ResumeAnalysisResponse(BaseModel):
    skills: List[str]
    summary: str
    missing_fields: List[str] = []

class RecommendationRequest(BaseModel):
    candidate_id: str

class Recommendation(BaseModel):
    internship_id: str
    match_score: float
    reasoning: str
    skill_gap: List[str] = []
    quota_category: Optional[str] = None
    warnings: List[str] = []

class BatchAllocationRequest(BaseModel):
    admin_id: str
    run_simulation: bool = False

class BatchAllocationResult(BaseModel):
    allocations: List[dict]
    overfilled_quotas: List[str] = []
    blocked_candidates: List[str] = []
    warnings: List[str] = []
