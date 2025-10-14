"""Matching Engine Module for candidate-job matching"""
from typing import List, Dict, Any, Optional
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from .base_model import BaseAIModel
from .nlp_processor import NLPProcessor
from .resume_analyzer import ResumeAnalyzer

class MatchingEngine(BaseAIModel):
    """Intelligent matching engine for candidates and job positions"""
    
    def __init__(self):
        super().__init__("Matching_Engine")
        self.nlp_processor = None
        self.resume_analyzer = None
        self.job_weights = self._initialize_job_weights()
        
    async def initialize(self) -> bool:
        """Initialize the matching engine"""
        try:
            self.logger.info("Initializing Matching Engine...")
            
            # Initialize NLP processor
            self.nlp_processor = NLPProcessor()
            await self.nlp_processor.initialize()
            
            # Initialize resume analyzer
            self.resume_analyzer = ResumeAnalyzer()
            await self.resume_analyzer.initialize()
            
            self.is_initialized = True
            self.logger.info("Matching Engine initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize Matching Engine: {e}")
            return False
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate matching input data"""
        if not isinstance(input_data, dict):
            return False
        
        required_keys = ["candidates", "jobs"]
        if not all(key in input_data for key in required_keys):
            return False
        
        if not isinstance(input_data["candidates"], list) or not isinstance(input_data["jobs"], list):
            return False
        
        return True
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process matching between candidates and jobs"""
        if not self.validate_input(input_data):
            return {"error": "Invalid input data"}
        
        try:
            candidates = input_data["candidates"]
            jobs = input_data["jobs"]
            
            # Generate matches
            matches = await self.match_candidates_to_jobs(candidates, jobs)
            
            # Calculate match statistics
            stats = self._calculate_match_statistics(matches)
            
            return {
                "matches": matches,
                "statistics": stats,
                "total_candidates": len(candidates),
                "total_jobs": len(jobs)
            }
            
        except Exception as e:
            self.logger.error(f"Error in matching process: {e}")
            return {"error": str(e)}
    
    async def match_candidates_to_jobs(self, candidates: List[Dict], jobs: List[Dict]) -> List[Dict]:
        """Match candidates to jobs using AI-powered similarity"""
        matches = []
        
        try:
            for candidate in candidates:
                candidate_matches = await self._find_matches_for_candidate(candidate, jobs)
                
                matches.append({
                    "candidate_id": candidate.get("id"),
                    "candidate_name": candidate.get("name"),
                    "candidate_profile": await self._create_candidate_profile(candidate),
                    "job_matches": candidate_matches[:10]  # Top 10 matches
                })
            
            return matches
            
        except Exception as e:
            self.logger.error(f"Error matching candidates to jobs: {e}")
            return []
    
    async def _find_matches_for_candidate(self, candidate: Dict, jobs: List[Dict]) -> List[Dict]:
        """Find best job matches for a specific candidate"""
        candidate_text = await self._create_candidate_text(candidate)
        candidate_embedding = await self.nlp_processor.get_text_embeddings(candidate_text)
        
        job_matches = []
        
        for job in jobs:
            job_text = await self._create_job_text(job)
            job_embedding = await self.nlp_processor.get_text_embeddings(job_text)
            
            # Calculate base similarity
            similarity = await self._calculate_semantic_similarity(
                candidate_embedding, job_embedding
            )
            
            # Calculate weighted match score
            match_score = await self._calculate_weighted_match_score(
                candidate, job, similarity
            )
            
            # Get detailed match breakdown
            match_breakdown = await self._analyze_match_breakdown(candidate, job)
            
            job_matches.append({
                "job_id": job.get("id"),
                "job_title": job.get("title"),
                "company": job.get("company"),
                "location": job.get("location"),
                "semantic_similarity": float(similarity),
                "weighted_score": float(match_score),
                "match_percentage": min(100, int(match_score * 100)),
                "match_breakdown": match_breakdown,
                "recommendation_reason": await self._generate_match_reason(candidate, job, match_score)
            })
        
        # Sort by weighted score
        job_matches.sort(key=lambda x: x["weighted_score"], reverse=True)
        
        return job_matches
    
    async def _create_candidate_text(self, candidate: Dict) -> str:
        """Create searchable text representation of candidate"""
        text_parts = []
        
        # Add skills
        if "skills" in candidate:
            if isinstance(candidate["skills"], list):
                text_parts.append(" ".join(candidate["skills"]))
            elif isinstance(candidate["skills"], str):
                text_parts.append(candidate["skills"])
        
        # Add experience
        if "experience" in candidate:
            text_parts.append(str(candidate["experience"]))
        
        # Add education
        if "education" in candidate:
            text_parts.append(str(candidate["education"]))
        
        # Add resume text if available
        if "resume_text" in candidate:
            text_parts.append(candidate["resume_text"])
        
        # Add any additional fields
        for key, value in candidate.items():
            if key not in ["id", "name", "email", "phone"] and isinstance(value, str):
                text_parts.append(value)
        
        return " ".join(text_parts)
    
    async def _create_job_text(self, job: Dict) -> str:
        """Create searchable text representation of job"""
        text_parts = []
        
        # Add job title
        if "title" in job:
            text_parts.append(job["title"])
        
        # Add description
        if "description" in job:
            text_parts.append(job["description"])
        
        # Add requirements
        if "requirements" in job:
            if isinstance(job["requirements"], list):
                text_parts.append(" ".join(job["requirements"]))
            else:
                text_parts.append(str(job["requirements"]))
        
        # Add skills
        if "required_skills" in job:
            if isinstance(job["required_skills"], list):
                text_parts.append(" ".join(job["required_skills"]))
            else:
                text_parts.append(str(job["required_skills"]))
        
        # Add company info
        if "company_description" in job:
            text_parts.append(job["company_description"])
        
        return " ".join(text_parts)
    
    async def _calculate_semantic_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        """Calculate semantic similarity between embeddings"""
        try:
            if not embedding1 or not embedding2:
                return 0.0
            
            emb1 = np.array(embedding1).reshape(1, -1)
            emb2 = np.array(embedding2).reshape(1, -1)
            
            similarity = cosine_similarity(emb1, emb2)[0][0]
            return max(0.0, min(1.0, float(similarity)))  # Clamp between 0 and 1
            
        except Exception as e:
            self.logger.error(f"Error calculating similarity: {e}")
            return 0.0
    
    async def _calculate_weighted_match_score(self, candidate: Dict, job: Dict, base_similarity: float) -> float:
        """Calculate weighted match score considering multiple factors"""
        try:
            # Start with semantic similarity (40% weight)
            score = base_similarity * 0.4
            
            # Skills match (30% weight)
            skills_match = await self._calculate_skills_match(candidate, job)
            score += skills_match * 0.3
            
            # Experience match (20% weight)
            experience_match = await self._calculate_experience_match(candidate, job)
            score += experience_match * 0.2
            
            # Location preference (5% weight)
            location_match = await self._calculate_location_match(candidate, job)
            score += location_match * 0.05
            
            # Salary expectation (5% weight)
            salary_match = await self._calculate_salary_match(candidate, job)
            score += salary_match * 0.05
            
            return max(0.0, min(1.0, score))  # Clamp between 0 and 1
            
        except Exception as e:
            self.logger.error(f"Error calculating weighted score: {e}")
            return base_similarity
    
    async def _calculate_skills_match(self, candidate: Dict, job: Dict) -> float:
        """Calculate skills match percentage"""
        try:
            candidate_skills = set()
            job_skills = set()
            
            # Extract candidate skills
            if "skills" in candidate:
                if isinstance(candidate["skills"], list):
                    candidate_skills.update([s.lower().strip() for s in candidate["skills"]])
                elif isinstance(candidate["skills"], str):
                    candidate_skills.update([s.lower().strip() for s in candidate["skills"].split(",")])
            
            # Extract job skills
            if "required_skills" in job:
                if isinstance(job["required_skills"], list):
                    job_skills.update([s.lower().strip() for s in job["required_skills"]])
                elif isinstance(job["required_skills"], str):
                    job_skills.update([s.lower().strip() for s in job["required_skills"].split(",")])
            
            if not job_skills:
                return 0.5  # Neutral score if no skills specified
            
            # Calculate Jaccard similarity
            intersection = len(candidate_skills.intersection(job_skills))
            union = len(candidate_skills.union(job_skills))
            
            return intersection / union if union > 0 else 0.0
            
        except Exception as e:
            self.logger.error(f"Error calculating skills match: {e}")
            return 0.0
    
    async def _calculate_experience_match(self, candidate: Dict, job: Dict) -> float:
        """Calculate experience level match"""
        try:
            candidate_exp = candidate.get("years_of_experience", 0)
            required_exp = job.get("required_experience", 0)
            
            if required_exp == 0:
                return 1.0  # No experience requirement
            
            if candidate_exp >= required_exp:
                # Over-qualified check (slight penalty for being too overqualified)
                if candidate_exp > required_exp * 2:
                    return 0.8
                return 1.0
            else:
                # Under-qualified
                return candidate_exp / required_exp
            
        except Exception as e:
            self.logger.error(f"Error calculating experience match: {e}")
            return 0.5
    
    async def _calculate_location_match(self, candidate: Dict, job: Dict) -> float:
        """Calculate location preference match"""
        try:
            candidate_location = candidate.get("location", "").lower()
            job_location = job.get("location", "").lower()
            
            # Remote work preference
            if "remote" in job_location or job.get("remote_friendly", False):
                return 1.0
            
            if not candidate_location or not job_location:
                return 0.5  # Neutral if location not specified
            
            # Simple city/state match
            if candidate_location in job_location or job_location in candidate_location:
                return 1.0
            
            # Check for same state (simplified)
            candidate_parts = candidate_location.split(",")
            job_parts = job_location.split(",")
            
            if len(candidate_parts) > 1 and len(job_parts) > 1:
                if candidate_parts[-1].strip() == job_parts[-1].strip():
                    return 0.7  # Same state
            
            return 0.3  # Different locations
            
        except Exception as e:
            self.logger.error(f"Error calculating location match: {e}")
            return 0.5
    
    async def _calculate_salary_match(self, candidate: Dict, job: Dict) -> float:
        """Calculate salary expectation match"""
        try:
            candidate_salary = candidate.get("salary_expectation", 0)
            job_salary = job.get("salary_range", {}).get("max", 0)
            
            if candidate_salary == 0 or job_salary == 0:
                return 1.0  # No salary constraint
            
            if candidate_salary <= job_salary:
                return 1.0
            else:
                # Candidate expects more than offered
                return job_salary / candidate_salary
            
        except Exception as e:
            self.logger.error(f"Error calculating salary match: {e}")
            return 1.0
    
    async def _analyze_match_breakdown(self, candidate: Dict, job: Dict) -> Dict[str, Any]:
        """Provide detailed breakdown of match factors"""
        try:
            skills_match = await self._calculate_skills_match(candidate, job)
            experience_match = await self._calculate_experience_match(candidate, job)
            location_match = await self._calculate_location_match(candidate, job)
            salary_match = await self._calculate_salary_match(candidate, job)
            
            return {
                "skills_match": round(skills_match * 100, 1),
                "experience_match": round(experience_match * 100, 1),
                "location_match": round(location_match * 100, 1),
                "salary_match": round(salary_match * 100, 1),
                "strengths": self._identify_match_strengths(candidate, job),
                "concerns": self._identify_match_concerns(candidate, job)
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing match breakdown: {e}")
            return {}
    
    def _identify_match_strengths(self, candidate: Dict, job: Dict) -> List[str]:
        """Identify matching strengths"""
        strengths = []
        
        # Check for skill overlaps
        candidate_skills = set()
        if "skills" in candidate and isinstance(candidate["skills"], list):
            candidate_skills = set([s.lower().strip() for s in candidate["skills"]])
        
        job_skills = set()
        if "required_skills" in job and isinstance(job["required_skills"], list):
            job_skills = set([s.lower().strip() for s in job["required_skills"]])
        
        common_skills = candidate_skills.intersection(job_skills)
        if common_skills:
            strengths.append(f"Strong match in skills: {', '.join(list(common_skills)[:3])}")
        
        # Check experience level
        candidate_exp = candidate.get("years_of_experience", 0)
        required_exp = job.get("required_experience", 0)
        
        if candidate_exp >= required_exp:
            strengths.append("Meets experience requirements")
        
        return strengths
    
    def _identify_match_concerns(self, candidate: Dict, job: Dict) -> List[str]:
        """Identify potential concerns"""
        concerns = []
        
        # Check experience gap
        candidate_exp = candidate.get("years_of_experience", 0)
        required_exp = job.get("required_experience", 0)
        
        if candidate_exp < required_exp:
            gap = required_exp - candidate_exp
            concerns.append(f"Experience gap: {gap} years short of requirement")
        
        # Check salary expectations
        candidate_salary = candidate.get("salary_expectation", 0)
        job_salary = job.get("salary_range", {}).get("max", 0)
        
        if candidate_salary > job_salary and candidate_salary != 0 and job_salary != 0:
            concerns.append("Salary expectation exceeds offered range")
        
        return concerns
    
    async def _generate_match_reason(self, candidate: Dict, job: Dict, match_score: float) -> str:
        """Generate human-readable match reasoning"""
        try:
            if match_score >= 0.8:
                return "Excellent match with strong alignment in skills and experience"
            elif match_score >= 0.6:
                return "Good match with some relevant skills and experience"
            elif match_score >= 0.4:
                return "Moderate match with potential for growth"
            else:
                return "Limited match, may require significant training"
                
        except Exception as e:
            self.logger.error(f"Error generating match reason: {e}")
            return "Match analysis unavailable"
    
    async def _create_candidate_profile(self, candidate: Dict) -> Dict[str, Any]:
        """Create candidate profile summary"""
        try:
            # If resume text is available, analyze it
            if "resume_text" in candidate and self.resume_analyzer:
                resume_analysis = await self.resume_analyzer.process(candidate["resume_text"])
                return {
                    "skills_summary": resume_analysis.get("skills", {}),
                    "experience_summary": resume_analysis.get("experience", []),
                    "education_summary": resume_analysis.get("education", []),
                    "resume_score": resume_analysis.get("score", {})
                }
            
            # Otherwise, create basic profile
            return {
                "skills": candidate.get("skills", []),
                "experience_years": candidate.get("years_of_experience", 0),
                "location": candidate.get("location", "Not specified"),
                "salary_expectation": candidate.get("salary_expectation", "Not specified")
            }
            
        except Exception as e:
            self.logger.error(f"Error creating candidate profile: {e}")
            return {}
    
    def _calculate_match_statistics(self, matches: List[Dict]) -> Dict[str, Any]:
        """Calculate overall matching statistics"""
        try:
            if not matches:
                return {}
            
            all_scores = []
            for match in matches:
                job_matches = match.get("job_matches", [])
                scores = [jm.get("weighted_score", 0) for jm in job_matches]
                all_scores.extend(scores)
            
            if not all_scores:
                return {}
            
            return {
                "average_match_score": round(np.mean(all_scores), 3),
                "max_match_score": round(np.max(all_scores), 3),
                "min_match_score": round(np.min(all_scores), 3),
                "total_matches_generated": len(all_scores),
                "high_quality_matches": sum(1 for score in all_scores if score >= 0.7),
                "match_distribution": {
                    "excellent (>80%)": sum(1 for score in all_scores if score >= 0.8),
                    "good (60-80%)": sum(1 for score in all_scores if 0.6 <= score < 0.8),
                    "moderate (40-60%)": sum(1 for score in all_scores if 0.4 <= score < 0.6),
                    "low (<40%)": sum(1 for score in all_scores if score < 0.4)
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error calculating match statistics: {e}")
            return {}
    
    def _initialize_job_weights(self) -> Dict[str, float]:
        """Initialize job matching weights"""
        return {
            "semantic_similarity": 0.4,
            "skills_match": 0.3,
            "experience_match": 0.2,
            "location_match": 0.05,
            "salary_match": 0.05
        }