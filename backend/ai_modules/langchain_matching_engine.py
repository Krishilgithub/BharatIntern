"""
LangChain-based Matching Engine for Candidate-Opportunity Matching
Implements a comprehensive matching system using free LLM APIs (Gemini/HuggingFace)
"""

import os
import logging
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from enum import Enum

# LangChain imports
try:
    from langchain.chains import LLMChain
    from langchain.prompts import PromptTemplate
    from langchain.output_parsers import PydanticOutputParser
    from langchain.llms import HuggingFacePipeline
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain.schema import OutputParserException
    LANGCHAIN_AVAILABLE = True
except ImportError:
    print("Warning: LangChain not available. Install with: pip install langchain langchain-google-genai")
    LANGCHAIN_AVAILABLE = False

# HuggingFace imports for free inference API
try:
    import requests
    from transformers import pipeline
    HUGGINGFACE_AVAILABLE = True
except ImportError:
    print("Warning: HuggingFace not available. Install with: pip install transformers requests")
    HUGGINGFACE_AVAILABLE = False

# Pydantic for structured data validation
try:
    from pydantic import BaseModel, Field, validator
    PYDANTIC_AVAILABLE = True
except ImportError:
    print("Warning: Pydantic not available. Install with: pip install pydantic")
    PYDANTIC_AVAILABLE = False

logger = logging.getLogger(__name__)

class FitLevel(str, Enum):
    """Enumeration for match fit levels"""
    STRONG_FIT = "strong fit"
    GOOD_FIT = "good fit"
    MODERATE_FIT = "moderate fit"
    WEAK_FIT = "weak fit"
    POOR_FIT = "poor fit"

class Candidate(BaseModel):
    """Structured candidate data model"""
    skills: List[str] = Field(description="List of technical and soft skills")
    education: Dict[str, Any] = Field(description="Education background information")
    location: str = Field(description="Current location or preferred location")
    coding_profiles: Optional[Dict[str, str]] = Field(
        default=None, 
        description="Coding profiles like GitHub, LeetCode usernames"
    )
    soft_skill_scores: Optional[Dict[str, float]] = Field(
        default=None,
        description="Soft skill assessment scores (0-1)"
    )
    experience_years: float = Field(default=0, description="Years of professional experience")
    projects: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        description="List of projects with descriptions and technologies"
    )
    certifications: Optional[List[str]] = Field(
        default=None,
        description="List of certifications"
    )
    languages: Optional[List[str]] = Field(
        default=None,
        description="Programming languages proficiency"
    )
    resume_text: Optional[str] = Field(
        default=None,
        description="Full resume text for comprehensive analysis"
    )
    
    @validator('skills')
    def skills_not_empty(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Skills list cannot be empty')
        return v
    
    @validator('soft_skill_scores')
    def validate_soft_skill_scores(cls, v):
        if v is not None:
            for skill, score in v.items():
                if not 0 <= score <= 1:
                    raise ValueError(f'Soft skill score for {skill} must be between 0 and 1')
        return v

class Opportunity(BaseModel):
    """Structured opportunity data model"""
    required_skills: List[str] = Field(description="Required technical skills")
    industry: str = Field(description="Industry or domain")
    location: str = Field(description="Job location")
    preferences: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional preferences and requirements"
    )
    experience_level: Optional[str] = Field(
        default="entry",
        description="Required experience level (entry, mid, senior, expert)"
    )
    job_title: Optional[str] = Field(
        default=None,
        description="Job title or role"
    )
    company_size: Optional[str] = Field(
        default=None,
        description="Company size category"
    )
    remote_friendly: bool = Field(default=False, description="Whether remote work is allowed")
    salary_range: Optional[Dict[str, int]] = Field(
        default=None,
        description="Salary range with min and max values"
    )
    benefits: Optional[List[str]] = Field(
        default=None,
        description="List of benefits offered"
    )
    description: Optional[str] = Field(
        default=None,
        description="Detailed job description"
    )
    
    @validator('required_skills')
    def required_skills_not_empty(cls, v):
        if not v or len(v) == 0:
            raise ValueError('Required skills list cannot be empty')
        return v

class MatchingResult(BaseModel):
    """Structured output for matching results"""
    match_score: float = Field(
        description="Match score from 0-100",
        ge=0,
        le=100
    )
    explanation: str = Field(
        description="Detailed explanation of the match",
        min_length=50
    )
    fit_level: FitLevel = Field(
        description="Overall fit level assessment"
    )
    skill_alignment: Dict[str, Any] = Field(
        description="Detailed skill alignment analysis"
    )
    strengths: List[str] = Field(
        description="Key matching strengths"
    )
    concerns: List[str] = Field(
        description="Potential concerns or gaps"
    )
    recommendations: List[str] = Field(
        description="Recommendations for improvement"
    )
    confidence_score: float = Field(
        description="Confidence in the matching assessment (0-1)",
        ge=0,
        le=1
    )

class LangChainMatchingEngine:
    """Advanced matching engine using LangChain and free LLM APIs"""
    
    def __init__(self):
        self.llm = None
        self.matching_chain = None
        self.parser = None
        self.initialized = False
        self.api_type = None  # 'gemini' or 'huggingface'
        
        # API configurations
        self.gemini_api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_AI_API_KEY')
        self.huggingface_api_token = os.getenv('HUGGINGFACE_API_TOKEN')
        
        logger.info("🚀 Initializing LangChain Matching Engine...")
    
    async def initialize(self) -> bool:
        """Initialize the matching engine with available LLM"""
        try:
            if not LANGCHAIN_AVAILABLE or not PYDANTIC_AVAILABLE:
                logger.error("Required dependencies not available")
                return False
            
            # Try Gemini first (free tier available)
            if self.gemini_api_key and await self._initialize_gemini():
                self.api_type = 'gemini'
                logger.info("✅ Initialized with Google Gemini API")
                return True
            
            # Fallback to HuggingFace Inference API
            elif self.huggingface_api_token and await self._initialize_huggingface():
                self.api_type = 'huggingface'
                logger.info("✅ Initialized with HuggingFace Inference API")
                return True
            
            # Final fallback to local HuggingFace model
            elif await self._initialize_local_huggingface():
                self.api_type = 'local_huggingface'
                logger.info("✅ Initialized with local HuggingFace model")
                return True
            
            else:
                logger.error("❌ No LLM provider available")
                return False
                
        except Exception as e:
            logger.error(f"❌ Failed to initialize matching engine: {e}")
            return False
    
    async def _initialize_gemini(self) -> bool:
        """Initialize Google Gemini API"""
        try:
            self.llm = ChatGoogleGenerativeAI(
                model="gemini-pro",
                google_api_key=self.gemini_api_key,
                temperature=0.3,
                max_output_tokens=2048
            )
            
            await self._create_matching_chain()
            self.initialized = True
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize Gemini: {e}")
            return False
    
    async def _initialize_huggingface(self) -> bool:
        """Initialize HuggingFace Inference API"""
        try:
            # For HuggingFace, we'll use a text generation model
            model_name = "microsoft/DialoGPT-medium"  # Free model
            self.llm = HuggingFacePipeline.from_model_id(
                model_id=model_name,
                task="text-generation",
                model_kwargs={"temperature": 0.7, "max_length": 512}
            )
            
            await self._create_matching_chain()
            self.initialized = True
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize HuggingFace: {e}")
            return False
    
    async def _initialize_local_huggingface(self) -> bool:
        """Initialize local HuggingFace model as final fallback"""
        try:
            if not HUGGINGFACE_AVAILABLE:
                return False
                
            # Use a lightweight model for local inference
            model_name = "distilbert-base-uncased"
            pipe = pipeline(
                "text-classification",
                model=model_name,
                return_all_scores=True
            )
            
            self.llm = HuggingFacePipeline(pipeline=pipe)
            await self._create_matching_chain()
            self.initialized = True
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize local HuggingFace: {e}")
            return False
    
    async def _create_matching_chain(self):
        """Create the LangChain matching chain"""
        try:
            # Define the output parser for structured results
            self.parser = PydanticOutputParser(pydantic_object=MatchingResult)
            
            # Create comprehensive prompt template
            prompt_template = PromptTemplate(
                input_variables=[
                    "candidate_data", "opportunity_data", "format_instructions"
                ],
                template="""
You are an expert AI matching specialist with deep knowledge of candidate-opportunity matching, 
industry requirements, and career development. Your task is to provide a comprehensive matching 
analysis between a candidate and an opportunity.

CANDIDATE PROFILE:
{candidate_data}

OPPORTUNITY REQUIREMENTS:
{opportunity_data}

Please analyze the match and provide a detailed assessment considering:

1. **SKILL ALIGNMENT**: 
   - Compare candidate skills with required skills
   - Identify skill gaps and strengths
   - Assess skill depth and relevance

2. **EXPERIENCE MATCH**:
   - Evaluate experience level alignment
   - Consider career progression potential
   - Assess learning curve requirements

3. **CULTURAL & SOFT SKILLS FIT**:
   - Analyze soft skill alignment
   - Consider communication and teamwork abilities
   - Evaluate leadership potential

4. **LOCATION & PREFERENCES**:
   - Assess location compatibility
   - Consider remote work preferences
   - Evaluate work-life balance factors

5. **CAREER GROWTH POTENTIAL**:
   - Identify learning opportunities
   - Assess advancement possibilities
   - Consider skill development potential

6. **OVERALL ASSESSMENT**:
   - Calculate a precise match score (0-100)
   - Determine fit level (strong fit, good fit, moderate fit, weak fit, poor fit)
   - Provide confidence in assessment (0-1)

Provide specific, actionable insights and recommendations.

{format_instructions}

IMPORTANT: 
- Be objective and fair in your assessment
- Consider both immediate fit and long-term potential
- Provide constructive feedback for improvement
- Ensure match_score is a number between 0-100
- Ensure confidence_score is a number between 0-1
- Choose fit_level from: strong fit, good fit, moderate fit, weak fit, poor fit
"""
            )
            
            # Create the LLM chain
            self.matching_chain = LLMChain(
                llm=self.llm,
                prompt=prompt_template,
                verbose=True
            )
            
            logger.info("✅ Matching chain created successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to create matching chain: {e}")
            raise
    
    async def match_candidate_to_opportunity(
        self, 
        candidate: Union[Candidate, Dict[str, Any]], 
        opportunity: Union[Opportunity, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Match a candidate to an opportunity using LangChain
        
        Args:
            candidate: Candidate data (Candidate model or dict)
            opportunity: Opportunity data (Opportunity model or dict)
            
        Returns:
            Dict containing matching results with error handling
        """
        if not self.initialized:
            return {
                "error": "Matching engine not initialized",
                "success": False
            }
        
        try:
            # Validate and convert input data
            candidate_data = await self._validate_candidate_data(candidate)
            opportunity_data = await self._validate_opportunity_data(opportunity)
            
            if candidate_data.get("error"):
                return candidate_data
            if opportunity_data.get("error"):
                return opportunity_data
            
            logger.info("🔍 Starting LangChain matching analysis...")
            
            # Prepare data for the chain
            candidate_json = json.dumps(candidate_data, indent=2)
            opportunity_json = json.dumps(opportunity_data, indent=2)
            format_instructions = self.parser.get_format_instructions()
            
            # Run the matching chain
            if self.api_type == 'gemini':
                result = await self.matching_chain.arun(
                    candidate_data=candidate_json,
                    opportunity_data=opportunity_json,
                    format_instructions=format_instructions
                )
            else:
                result = self.matching_chain.run(
                    candidate_data=candidate_json,
                    opportunity_data=opportunity_json,
                    format_instructions=format_instructions
                )
            
            # Parse the structured output
            try:
                parsed_result = self.parser.parse(result)
                
                # Convert to dict and add metadata
                matching_result = parsed_result.dict()
                matching_result.update({
                    "timestamp": datetime.now().isoformat(),
                    "api_type": self.api_type,
                    "success": True,
                    "raw_output": result
                })
                
                logger.info("✅ LangChain matching completed successfully")
                return matching_result
                
            except OutputParserException as e:
                logger.warning(f"Failed to parse structured output: {e}")
                # Fallback to basic parsing
                return await self._fallback_parse_result(result, candidate_data, opportunity_data)
                
        except Exception as e:
            logger.error(f"❌ Matching failed: {e}")
            return {
                "error": f"Matching analysis failed: {str(e)}",
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
    
    async def _validate_candidate_data(self, candidate: Union[Candidate, Dict[str, Any]]) -> Dict[str, Any]:
        """Validate and normalize candidate data"""
        try:
            if isinstance(candidate, dict):
                # Convert dict to Candidate model for validation
                candidate_model = Candidate(**candidate)
                return candidate_model.dict()
            elif isinstance(candidate, Candidate):
                return candidate.dict()
            else:
                return {"error": "Invalid candidate data format"}
                
        except Exception as e:
            return {"error": f"Candidate validation failed: {str(e)}"}
    
    async def _validate_opportunity_data(self, opportunity: Union[Opportunity, Dict[str, Any]]) -> Dict[str, Any]:
        """Validate and normalize opportunity data"""
        try:
            if isinstance(opportunity, dict):
                # Convert dict to Opportunity model for validation
                opportunity_model = Opportunity(**opportunity)
                return opportunity_model.dict()
            elif isinstance(opportunity, Opportunity):
                return opportunity.dict()
            else:
                return {"error": "Invalid opportunity data format"}
                
        except Exception as e:
            return {"error": f"Opportunity validation failed: {str(e)}"}
    
    async def _fallback_parse_result(
        self, 
        raw_result: str, 
        candidate_data: Dict[str, Any], 
        opportunity_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Fallback parsing when structured output fails"""
        try:
            # Basic parsing logic for when LLM doesn't return structured output
            lines = raw_result.split('\n')
            
            # Extract match score
            match_score = 75.0  # Default
            for line in lines:
                if 'score' in line.lower() and any(char.isdigit() for char in line):
                    import re
                    scores = re.findall(r'\d+', line)
                    if scores:
                        match_score = min(100, max(0, float(scores[0])))
                        break
            
            # Determine fit level based on score
            if match_score >= 85:
                fit_level = FitLevel.STRONG_FIT
            elif match_score >= 70:
                fit_level = FitLevel.GOOD_FIT
            elif match_score >= 55:
                fit_level = FitLevel.MODERATE_FIT
            elif match_score >= 40:
                fit_level = FitLevel.WEAK_FIT
            else:
                fit_level = FitLevel.POOR_FIT
            
            # Extract explanation (use raw result as explanation)
            explanation = raw_result[:500] + "..." if len(raw_result) > 500 else raw_result
            
            # Basic skill alignment analysis
            candidate_skills = set(candidate_data.get('skills', []))
            required_skills = set(opportunity_data.get('required_skills', []))
            common_skills = candidate_skills.intersection(required_skills)
            
            skill_alignment = {
                "matched_skills": list(common_skills),
                "missing_skills": list(required_skills - candidate_skills),
                "extra_skills": list(candidate_skills - required_skills),
                "match_percentage": len(common_skills) / len(required_skills) * 100 if required_skills else 0
            }
            
            return {
                "match_score": match_score,
                "explanation": explanation,
                "fit_level": fit_level.value,
                "skill_alignment": skill_alignment,
                "strengths": [f"Strong in: {', '.join(list(common_skills)[:3])}"] if common_skills else ["Good foundational skills"],
                "concerns": [f"Missing: {', '.join(list(required_skills - candidate_skills)[:3])}"] if required_skills - candidate_skills else ["No major concerns identified"],
                "recommendations": ["Consider learning missing skills", "Highlight relevant experience"],
                "confidence_score": 0.7,  # Default confidence
                "timestamp": datetime.now().isoformat(),
                "api_type": self.api_type,
                "success": True,
                "fallback_parsing": True,
                "raw_output": raw_result
            }
            
        except Exception as e:
            logger.error(f"Fallback parsing failed: {e}")
            return {
                "error": f"Failed to parse matching result: {str(e)}",
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
    
    async def batch_match_candidates(
        self, 
        candidates: List[Union[Candidate, Dict[str, Any]]], 
        opportunities: List[Union[Opportunity, Dict[str, Any]]]
    ) -> Dict[str, Any]:
        """Match multiple candidates to multiple opportunities"""
        try:
            if not self.initialized:
                return {"error": "Matching engine not initialized", "success": False}
            
            results = []
            total_matches = 0
            
            for candidate in candidates:
                candidate_results = []
                
                for opportunity in opportunities:
                    match_result = await self.match_candidate_to_opportunity(candidate, opportunity)
                    
                    if match_result.get("success", False):
                        total_matches += 1
                        candidate_results.append(match_result)
                    else:
                        logger.warning(f"Failed to match candidate to opportunity: {match_result.get('error')}")
                
                results.append({
                    "candidate": candidate,
                    "matches": candidate_results,
                    "total_matches": len(candidate_results)
                })
            
            return {
                "success": True,
                "results": results,
                "total_candidates": len(candidates),
                "total_opportunities": len(opportunities),
                "total_matches": total_matches,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Batch matching failed: {e}")
            return {
                "error": f"Batch matching failed: {str(e)}",
                "success": False,
                "timestamp": datetime.now().isoformat()
            }
    
    def get_engine_status(self) -> Dict[str, Any]:
        """Get current engine status and configuration"""
        return {
            "initialized": self.initialized,
            "api_type": self.api_type,
            "gemini_available": bool(self.gemini_api_key),
            "huggingface_available": bool(self.huggingface_api_token),
            "langchain_available": LANGCHAIN_AVAILABLE,
            "pydantic_available": PYDANTIC_AVAILABLE,
            "timestamp": datetime.now().isoformat()
        }

# Global instance
langchain_matching_engine = LangChainMatchingEngine()
