"""LangChain Integration with Gemini API for Advanced Resume Analysis"""
import logging
import os
from typing import Dict, List, Any, Optional
from datetime import datetime
import json

# LangChain imports
try:
    from langchain.llms import GooglePalm
    from langchain.chat_models import ChatGooglePalm
    from langchain.schema import HumanMessage, SystemMessage
    from langchain.prompts import PromptTemplate
    from langchain.chains import LLMChain, SequentialChain
    from langchain.output_parsers import PydanticOutputParser, OutputFixingParser
    from langchain.memory import ConversationBufferMemory
    LANGCHAIN_AVAILABLE = True
except ImportError:
    print("Warning: LangChain not available. Install with: pip install langchain langchain-google-genai")
    LANGCHAIN_AVAILABLE = False

# Google Generative AI
try:
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
    GOOGLE_AI_AVAILABLE = True
except ImportError:
    print("Warning: Google Generative AI not available. Install with: pip install google-generativeai")
    GOOGLE_AI_AVAILABLE = False

# Pydantic for structured outputs
try:
    from pydantic import BaseModel, Field
    PYDANTIC_AVAILABLE = True
except ImportError:
    print("Warning: Pydantic not available. Install with: pip install pydantic")
    PYDANTIC_AVAILABLE = False

logger = logging.getLogger(__name__)

class ResumeAnalysisOutput(BaseModel):
    """Structured output for resume analysis"""
    overall_score: float = Field(description="Overall resume score from 0-100")
    technical_skills: List[str] = Field(description="List of technical skills identified")
    experience_level: str = Field(description="Experience level: Entry, Mid, Senior, Expert")
    career_suggestions: List[str] = Field(description="Career advancement suggestions")
    improvement_areas: List[str] = Field(description="Areas for resume improvement")
    job_market_fit: str = Field(description="How well the resume fits current job market")
    salary_range: Dict[str, int] = Field(description="Estimated salary range")

class InterviewQuestionsOutput(BaseModel):
    """Structured output for interview questions"""
    technical_questions: List[str] = Field(description="Technical interview questions")
    behavioral_questions: List[str] = Field(description="Behavioral interview questions")
    situational_questions: List[str] = Field(description="Situational interview questions")
    difficulty_level: str = Field(description="Overall difficulty level")

class LangChainGeminiAnalyzer:
    """Advanced resume analyzer using LangChain and Gemini API"""
    
    def __init__(self):
        self.llm = None
        self.chat_model = None
        self.memory = None
        self.analysis_chain = None
        self.question_chain = None
        self.initialized = False
        
        # Get API key from environment
        self.api_key = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_AI_API_KEY')
        
        # Safety settings for Gemini
        self.safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }
        
    async def initialize(self) -> bool:
        """Initialize LangChain with Gemini"""
        try:
            if not LANGCHAIN_AVAILABLE or not GOOGLE_AI_AVAILABLE:
                logger.warning("LangChain or Google AI not available")
                return False
            
            if not self.api_key:
                logger.warning("Gemini API key not found in environment variables")
                return False
            
            logger.info("🚀 Initializing LangChain Gemini Analyzer...")
            
            # Configure Google AI
            genai.configure(api_key=self.api_key)
            
            # Initialize LangChain chat model
            self.chat_model = ChatGooglePalm(
                google_api_key=self.api_key,
                model_name="models/chat-bison-001",
                temperature=0.3,
                max_output_tokens=2048
            )
            
            # Initialize memory
            self.memory = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True
            )
            
            # Create analysis chains
            self._create_analysis_chains()
            
            self.initialized = True
            logger.info("✅ LangChain Gemini Analyzer initialized successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize LangChain Gemini Analyzer: {e}")
            return False
    
    def _create_analysis_chains(self):
        \"\"\"Create LangChain analysis chains\"\"\"
        try:
            # Resume Analysis Chain
            analysis_prompt = PromptTemplate(
                input_variables=["resume_text", "job_description"],
                template=\"\"\"
You are an expert AI resume analyst and career counselor with deep knowledge of current job markets, hiring trends, and industry requirements.

RESUME TO ANALYZE:
{resume_text}

JOB CONTEXT (if provided):
{job_description}

Please provide a comprehensive analysis of this resume with the following structure:

1. OVERALL ASSESSMENT:
- Overall score (0-100) based on completeness, relevance, and market appeal
- Key strengths and unique selling points
- Critical weaknesses that need immediate attention

2. TECHNICAL SKILLS ANALYSIS:
- List all technical skills mentioned
- Assess skill relevance to current market trends
- Identify missing skills for the candidate's career level
- Rate technical skill diversity and depth

3. EXPERIENCE EVALUATION:
- Classify experience level (Entry/Mid/Senior/Expert)
- Analyze career progression and growth trajectory
- Evaluate job responsibilities and achievements
- Assess industry relevance and transferable skills

4. CAREER GUIDANCE:
- Suggest 3-5 specific career advancement opportunities
- Recommend target job titles and roles
- Identify industries where candidate would excel
- Suggest networking and professional development strategies

5. RESUME IMPROVEMENT RECOMMENDATIONS:
- Specific formatting and structure improvements
- Content additions or modifications needed
- ATS optimization suggestions
- Keywords and phrases to include

6. MARKET FIT ANALYSIS:
- How well does this resume fit current job market demands?
- What industries/roles are most suitable?
- Competitive positioning against peers
- Salary range estimation based on skills and experience

7. ACTIONABLE NEXT STEPS:
- Top 3 immediate actions to improve employability
- Skill development priorities
- Experience gaps to fill
- Professional branding suggestions

Please provide detailed, actionable insights that will genuinely help this candidate improve their career prospects.
\"\"\"
            )
            
            # Interview Questions Chain
            questions_prompt = PromptTemplate(
                input_variables=["resume_text", "job_role", "experience_level"],
                template=\"\"\"
You are an expert technical interviewer and hiring manager with experience across multiple industries.

CANDIDATE RESUME:
{resume_text}

TARGET JOB ROLE: {job_role}
EXPERIENCE LEVEL: {experience_level}

Generate a comprehensive set of interview questions tailored to this candidate's background and the target role:

1. TECHNICAL QUESTIONS (8-10 questions):
- Core technical concepts relevant to their skills
- Problem-solving scenarios
- Architecture and design questions
- Code review and debugging scenarios
- Best practices and methodology questions

2. BEHAVIORAL QUESTIONS (6-8 questions):
- Leadership and teamwork scenarios
- Conflict resolution situations
- Project management experiences  
- Learning and adaptation stories
- Career motivation and goals

3. SITUATIONAL QUESTIONS (5-7 questions):
- Hypothetical workplace challenges
- Decision-making under pressure
- Resource constraints scenarios
- Stakeholder management situations
- Innovation and improvement opportunities

4. DIFFICULTY CALIBRATION:
- Classify overall difficulty level (Entry/Intermediate/Advanced/Expert)
- Provide question difficulty distribution
- Suggest follow-up questions for deeper assessment

Focus on questions that will effectively evaluate:
- Technical competency at the appropriate level
- Cultural fit and soft skills
- Problem-solving approach and critical thinking
- Growth potential and learning agility
- Specific experiences mentioned in their resume

Make questions specific, relevant, and challenging but fair for their experience level.
\"\"\"
            )
            
            # Create chains
            self.analysis_chain = LLMChain(
                llm=self.chat_model,
                prompt=analysis_prompt,
                memory=self.memory,
                verbose=True
            )
            
            self.question_chain = LLMChain(
                llm=self.chat_model,
                prompt=questions_prompt,
                verbose=True
            )
            
            logger.info("✅ Analysis chains created successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to create analysis chains: {e}")
    
    async def analyze_resume_with_llm(self, resume_text: str, job_description: str = "") -> Dict[str, Any]:
        \"\"\"Analyze resume using LangChain and Gemini\"\"\"
        if not self.initialized:
            return {"error": "LangChain Gemini Analyzer not initialized"}
        
        try:
            logger.info("🔍 Starting LLM-powered resume analysis...")
            
            # Run analysis chain
            analysis_result = await self.analysis_chain.arun(
                resume_text=resume_text,
                job_description=job_description or "General analysis - no specific job description provided"
            )
            
            # Parse and structure the result
            structured_analysis = self._parse_analysis_result(analysis_result)
            
            # Add metadata
            structured_analysis.update({
                "timestamp": datetime.now().isoformat(),
                "analysis_type": "langchain_gemini",
                "model_used": "chat-bison-001",
                "job_context_provided": bool(job_description),
                "raw_analysis": analysis_result
            })
            
            logger.info("✅ LLM analysis completed successfully")
            return structured_analysis
            
        except Exception as e:
            logger.error(f"❌ LLM analysis failed: {e}")
            return {
                "error": str(e),
                "analysis_type": "llm_error",
                "fallback_message": "LLM analysis failed, please try again or use alternative analysis"
            }
    
    async def generate_interview_questions(self, resume_text: str, job_role: str = "Software Engineer", 
                                         experience_level: str = "Mid-Level") -> Dict[str, Any]:
        \"\"\"Generate interview questions using LLM\"\"\"
        if not self.initialized:
            return {"error": "LangChain Gemini Analyzer not initialized"}
        
        try:
            logger.info("❓ Generating interview questions with LLM...")
            
            # Run question generation chain
            questions_result = await self.question_chain.arun(
                resume_text=resume_text,
                job_role=job_role,
                experience_level=experience_level
            )
            
            # Parse and structure the result
            structured_questions = self._parse_questions_result(questions_result)
            
            # Add metadata
            structured_questions.update({
                "timestamp": datetime.now().isoformat(),
                "generation_type": "langchain_gemini",
                "target_role": job_role,
                "target_level": experience_level,
                "raw_questions": questions_result
            })
            
            logger.info("✅ Interview questions generated successfully")
            return structured_questions
            
        except Exception as e:
            logger.error(f"❌ Question generation failed: {e}")
            return {
                "error": str(e),
                "fallback_questions": self._get_fallback_questions(job_role, experience_level)
            }
    
    def _parse_analysis_result(self, analysis_text: str) -> Dict[str, Any]:
        \"\"\"Parse LLM analysis result into structured format\"\"\"
        try:
            # Initialize structured result
            structured = {
                "overall_score": 75,  # Default
                "technical_skills": [],
                "experience_level": "Mid-Level",
                "career_suggestions": [],
                "improvement_areas": [],
                "job_market_fit": "Good",
                "salary_range": {"min": 60000, "max": 90000},
                "key_strengths": [],
                "critical_weaknesses": [],
                "next_steps": []
            }
            
            # Simple parsing - in production, would use more sophisticated NLP
            lines = analysis_text.split('\\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Detect sections
                if "OVERALL ASSESSMENT" in line.upper():
                    current_section = "overall"
                elif "TECHNICAL SKILLS" in line.upper():
                    current_section = "technical"
                elif "EXPERIENCE EVALUATION" in line.upper():
                    current_section = "experience"
                elif "CAREER GUIDANCE" in line.upper():
                    current_section = "career"
                elif "IMPROVEMENT RECOMMENDATIONS" in line.upper():
                    current_section = "improvement"
                elif "MARKET FIT" in line.upper():
                    current_section = "market"
                elif "NEXT STEPS" in line.upper():
                    current_section = "next_steps"
                
                # Extract score
                if "score" in line.lower() and any(char.isdigit() for char in line):
                    import re
                    scores = re.findall(r'\\d+', line)
                    if scores:
                        structured["overall_score"] = min(100, max(0, int(scores[0])))
                
                # Extract experience level
                if any(level in line.upper() for level in ["ENTRY", "MID", "SENIOR", "EXPERT"]):
                    if "ENTRY" in line.upper():
                        structured["experience_level"] = "Entry-Level"
                    elif "SENIOR" in line.upper():
                        structured["experience_level"] = "Senior"
                    elif "EXPERT" in line.upper():
                        structured["experience_level"] = "Expert"
                    else:
                        structured["experience_level"] = "Mid-Level"
                
                # Extract bullet points and suggestions
                if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                    clean_line = line[1:].strip()
                    if current_section == "technical" and clean_line:
                        structured["technical_skills"].append(clean_line)
                    elif current_section == "career" and clean_line:
                        structured["career_suggestions"].append(clean_line)
                    elif current_section == "improvement" and clean_line:
                        structured["improvement_areas"].append(clean_line)
                    elif current_section == "next_steps" and clean_line:
                        structured["next_steps"].append(clean_line)
            
            return structured
            
        except Exception as e:
            logger.error(f"Error parsing analysis result: {e}")
            return {
                "error": "Failed to parse analysis",
                "raw_text": analysis_text
            }
    
    def _parse_questions_result(self, questions_text: str) -> Dict[str, Any]:
        \"\"\"Parse LLM questions result into structured format\"\"\"
        try:
            structured = {
                "technical_questions": [],
                "behavioral_questions": [],
                "situational_questions": [],
                "difficulty_level": "Intermediate"
            }
            
            lines = questions_text.split('\\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Detect sections
                if "TECHNICAL QUESTIONS" in line.upper():
                    current_section = "technical"
                elif "BEHAVIORAL QUESTIONS" in line.upper():
                    current_section = "behavioral"
                elif "SITUATIONAL QUESTIONS" in line.upper():
                    current_section = "situational"
                elif "DIFFICULTY" in line.upper():
                    current_section = "difficulty"
                
                # Extract questions
                if line.startswith('-') or line.startswith('•') or line.startswith('*'):
                    clean_line = line[1:].strip()
                    if current_section == "technical" and clean_line:
                        structured["technical_questions"].append(clean_line)
                    elif current_section == "behavioral" and clean_line:
                        structured["behavioral_questions"].append(clean_line)
                    elif current_section == "situational" and clean_line:
                        structured["situational_questions"].append(clean_line)
                
                # Extract difficulty
                if current_section == "difficulty":
                    if any(level in line.upper() for level in ["ENTRY", "INTERMEDIATE", "ADVANCED", "EXPERT"]):
                        if "ENTRY" in line.upper():
                            structured["difficulty_level"] = "Entry"
                        elif "ADVANCED" in line.upper():
                            structured["difficulty_level"] = "Advanced"
                        elif "EXPERT" in line.upper():
                            structured["difficulty_level"] = "Expert"
                        else:
                            structured["difficulty_level"] = "Intermediate"
            
            return structured
            
        except Exception as e:
            logger.error(f"Error parsing questions result: {e}")
            return {
                "error": "Failed to parse questions",
                "raw_text": questions_text
            }
    
    def _get_fallback_questions(self, job_role: str, experience_level: str) -> Dict[str, List[str]]:
        \"\"\"Provide fallback questions when LLM fails\"\"\"
        return {
            "technical_questions": [
                f"Describe your experience with the main technologies used in {job_role} roles",
                "Walk me through how you would approach solving a complex technical problem",
                "What are some best practices you follow in your development work?",
                "How do you stay updated with new technologies and industry trends?"
            ],
            "behavioral_questions": [
                "Tell me about a challenging project you worked on and how you overcame obstacles",
                "Describe a time when you had to work with a difficult team member",
                "How do you prioritize tasks when working on multiple projects?",
                "Give an example of when you had to learn something new quickly"
            ],
            "situational_questions": [
                "How would you handle a situation where you disagree with your manager's technical decision?",
                "What would you do if you discovered a critical bug just before a major release?",
                "How would you approach mentoring a junior developer on your team?",
                "Describe how you would handle tight deadlines with limited resources"
            ]
        }
    
    async def generate_career_roadmap(self, resume_text: str, target_role: str = "") -> Dict[str, Any]:
        \"\"\"Generate personalized career roadmap\"\"\"
        if not self.initialized:
            return {"error": "LangChain Gemini Analyzer not initialized"}
        
        try:
            roadmap_prompt = f\"\"\"
Based on this resume, create a detailed 12-month career development roadmap:

RESUME:
{resume_text}

TARGET ROLE (if specified): {target_role}

Provide a month-by-month plan including:
1. Skills to develop each quarter
2. Projects to work on
3. Certifications to pursue  
4. Networking opportunities
5. Experience gaps to fill
6. Specific milestones and goals

Make it actionable and realistic for their current level.
\"\"\"
            
            roadmap_result = await self.chat_model.apredict(roadmap_prompt)
            
            return {
                "roadmap": roadmap_result,
                "timestamp": datetime.now().isoformat(),
                "target_role": target_role,
                "type": "12_month_career_roadmap"
            }
            
        except Exception as e:
            logger.error(f"Career roadmap generation failed: {e}")
            return {"error": str(e)}

# Global instance
langchain_analyzer = LangChainGeminiAnalyzer()