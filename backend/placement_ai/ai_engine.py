from typing import List, Dict, Any
from .models import Candidate, Internship, Application, Recommendation
import re

# Dummy NLP-based skill extraction from resume text (replace with real model in prod)
def extract_skills_from_resume(resume_text: str) -> List[str]:
    keywords = ["python", "java", "react", "sql", "ml", "data", "node", "cloud", "api", "typescript", "tailwind", "nlp"]
    found = set()
    for k in keywords:
        if re.search(rf"\\b{k}\\b", resume_text, re.IGNORECASE):
            found.add(k.capitalize())
    return list(found) if found else ["General Programming"]

def analyze_resume(resume_url: str = None, manual_skills: List[str] = None, candidate: Dict = None) -> Dict:
    # In prod, download and parse PDF/docx, here just simulate
    if manual_skills:
        skills = manual_skills
        summary = "Skills entered manually."
        missing = []
    elif resume_url:
        # Simulate resume parsing
        skills = extract_skills_from_resume(resume_url)
        summary = f"Extracted skills from resume: {', '.join(skills)}"
        missing = []
    elif candidate:
        skills = candidate.get("skills", [])
        summary = "Used candidate profile skills."
        missing = ["resume_url"]
    else:
        skills = []
        summary = "No data provided."
        missing = ["resume_url", "manual_skills"]
    return {"skills": skills, "summary": summary, "missing_fields": missing}

def match_candidate_to_internships(candidate: Dict, internships: List[Dict], quotas: Dict[str, int], applications: List[Dict]) -> List[Recommendation]:
    # AI matching logic: skill overlap, preferences, quota, past internships, etc.
    recs = []
    for i in internships:
        score = 0.0
        reasoning = []
        skill_gap = []
        warnings = []
        # Skill match
        c_skills = set(candidate.get("skills", []))
        i_reqs = set(i.get("requirements", []))
        overlap = c_skills & i_reqs
        if i_reqs:
            skill_score = len(overlap) / len(i_reqs)
        else:
            skill_score = 0.5  # fallback if no requirements
        score += 0.5 * skill_score
        if not overlap:
            skill_gap = list(i_reqs - c_skills)
            reasoning.append("No direct skill match; suggested for learning roadmap.")
        else:
            reasoning.append(f"Skill overlap: {', '.join(overlap)}")
        # Preferences
        prefs = candidate.get("preferences", {})
        if prefs.get("location") and prefs["location"] == i.get("location"):
            score += 0.2
            reasoning.append("Location preference matched.")
        if prefs.get("domain") and prefs["domain"] == i.get("domain"):
            score += 0.1
            reasoning.append("Domain preference matched.")
        # Quota
        quota_cat = candidate.get("quota_category")
        if quota_cat and i.get("quota", {}).get(quota_cat, 0) > 0:
            score += 0.1
            reasoning.append(f"Quota slot available for {quota_cat}.")
        elif quota_cat:
            warnings.append(f"Quota for {quota_cat} filled.")
        # Past internships
        if candidate.get("past_internships", 0) >= 2:
            score = 0
            warnings.append("Candidate has already participated in 2 internships. Blocked.")
        # Capacity
        if i.get("capacity", 0) <= 0:
            warnings.append("Internship capacity full.")
        recs.append(Recommendation(
            internship_id=i["id"],
            match_score=round(score, 2),
            reasoning="; ".join(reasoning),
            skill_gap=skill_gap,
            quota_category=quota_cat,
            warnings=warnings
        ))
    # Sort by score, break ties by GPA or random
    recs.sort(key=lambda r: -r.match_score)
    return recs
