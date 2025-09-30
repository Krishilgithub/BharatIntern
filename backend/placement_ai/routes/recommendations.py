from fastapi import APIRouter, HTTPException
from ..models import RecommendationRequest, Recommendation
from ..db import get_candidate_by_id, get_internships, get_applications_by_candidate
from ..ai_engine import match_candidate_to_internships

router = APIRouter()

@router.post("/recommendations", response_model=list[Recommendation])
def get_recommendations(req: RecommendationRequest):
    candidate = get_candidate_by_id(req.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found.")
    internships = get_internships()
    applications = get_applications_by_candidate(req.candidate_id)
    quotas = {i["quota_category"]: i["quota"] for i in internships if "quota" in i}
    recs = match_candidate_to_internships(candidate, internships, quotas, applications)
    if not recs:
        # Suggest learning roadmap or closest industry
        return [Recommendation(
            internship_id="",
            match_score=0.0,
            reasoning="No direct matches found. Suggest upskilling in trending domains.",
            skill_gap=["Python", "React", "SQL"],
            warnings=["No direct match"]
        )]
    return recs
