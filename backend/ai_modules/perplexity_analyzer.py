"""
Perplexity AI Resume Analyzer
Python backend service for resume analysis using Perplexity AI
"""

import os
import json
import requests
from typing import Dict, List, Optional, Any
from datetime import datetime


class PerplexityResumeAnalyzer:
    """Resume analyzer using Perplexity AI API"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the Perplexity AI analyzer
        
        Args:
            api_key: Perplexity API key (defaults to env variable)
        """
        self.api_key = api_key or os.getenv("PERPLEXITY_API_KEY")
        if not self.api_key:
            raise ValueError("Perplexity API key not provided")
        
        self.api_url = "https://api.perplexity.ai/chat/completions"
        self.default_model = "llama-3.1-sonar-large-128k-online"
        
    def analyze_resume(
        self, 
        resume_text: str, 
        target_role: Optional[str] = None,
        target_industry: Optional[str] = None,
        model: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze resume using Perplexity AI
        
        Args:
            resume_text: Extracted resume text
            target_role: Optional target role for analysis
            target_industry: Optional target industry
            model: AI model to use (default: llama-3.1-sonar-large-128k-online)
            
        Returns:
            Comprehensive resume analysis
        """
        prompt = self._build_analysis_prompt(resume_text, target_role, target_industry)
        
        try:
            response = requests.post(
                self.api_url,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                },
                json={
                    "model": model or self.default_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an expert HR professional and resume analyst with years of experience in talent acquisition and career development. Provide detailed, actionable feedback in valid JSON format only."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 4000,
                    "top_p": 0.9,
                    "stream": False
                },
                timeout=60
            )
            
            response.raise_for_status()
            data = response.json()
            
            analysis_text = data["choices"][0]["message"]["content"]
            return self._parse_analysis_response(analysis_text, resume_text)
            
        except requests.exceptions.RequestException as e:
            print(f"Perplexity API error: {e}")
            raise Exception(f"Failed to analyze resume: {str(e)}")
        except Exception as e:
            print(f"Analysis error: {e}")
            raise
    
    def _build_analysis_prompt(
        self, 
        resume_text: str, 
        target_role: Optional[str] = None,
        target_industry: Optional[str] = None
    ) -> str:
        """Build comprehensive analysis prompt"""
        
        target_context = ""
        if target_role:
            target_context += f"\nTARGET ROLE: {target_role}"
        if target_industry:
            target_context += f"\nTARGET INDUSTRY: {target_industry}"
        
        return f"""Analyze this resume comprehensively and provide a detailed JSON response with the following structure:

RESUME TEXT:
{resume_text}
{target_context}

Please analyze and return ONLY a valid JSON object (no markdown, no code blocks) with these exact fields:

{{
  "overallScore": (number 0-100),
  "summary": "Brief 2-3 sentence summary of the candidate",
  "strengths": ["strength 1", "strength 2", "..."],
  "weaknesses": ["weakness 1", "weakness 2", "..."],
  
  "extractedSkills": [
    {{
      "name": "skill name",
      "category": "Technical|Soft|Business|Language",
      "level": "Beginner|Intermediate|Advanced|Expert",
      "confidence": (number 0-100),
      "years": (number, estimated years of experience)
    }}
  ],
  
  "experience": {{
    "totalYears": (number),
    "roles": [
      {{
        "title": "job title",
        "company": "company name",
        "duration": "duration",
        "highlights": ["achievement 1", "achievement 2"]
      }}
    ]
  }},
  
  "education": [
    {{
      "degree": "degree name",
      "institution": "university/college",
      "year": "graduation year",
      "gpa": "GPA if mentioned"
    }}
  ],
  
  "improvements": [
    {{
      "type": "Content|Formatting|Skills|Experience",
      "section": "section name",
      "priority": "High|Medium|Low",
      "original": "current text (if applicable)",
      "suggested": "suggested improvement",
      "reason": "why this improvement is needed"
    }}
  ],
  
  "atsCompatibility": {{
    "score": (number 0-100),
    "parsing_success": true,
    "format_issues": ["issue 1", "issue 2"],
    "keyword_optimization": (number 0-100),
    "recommendations": ["recommendation 1", "recommendation 2"]
  }},
  
  "careerSuggestions": [
    {{
      "title": "job title",
      "industry": "industry name",
      "match_score": (number 0-100),
      "required_skills": ["skill 1", "skill 2"],
      "salary_range": "estimated salary range",
      "growth_potential": "High|Medium|Low",
      "reasoning": "why this role fits"
    }}
  ],
  
  "skillGaps": [
    {{
      "skill": "skill name",
      "importance": "Critical|High|Medium|Low",
      "current_level": "None|Beginner|Intermediate",
      "required_level": "Intermediate|Advanced|Expert",
      "learning_resources": ["resource 1", "resource 2"],
      "estimated_time": "time to acquire"
    }}
  ],
  
  "industryBenchmark": {{
    "industry": "primary industry",
    "percentile": (number 0-100),
    "comparison": "how candidate compares to industry standards",
    "marketTrends": ["trend 1", "trend 2"]
  }},
  
  "contactInfo": {{
    "email": "email if found",
    "phone": "phone if found",
    "linkedin": "linkedin if found",
    "github": "github if found",
    "portfolio": "portfolio if found"
  }},
  
  "keywords": ["keyword1", "keyword2", "..."],
  "readabilityScore": (number 0-100),
  "formattingScore": (number 0-100),
  "impactScore": (number 0-100)
}}

CRITICAL: Return ONLY the JSON object, no additional text, no markdown formatting, no code blocks."""
    
    def _parse_analysis_response(self, analysis_text: str, original_text: str) -> Dict[str, Any]:
        """Parse and validate analysis response"""
        try:
            # Clean the response
            cleaned = analysis_text.strip()
            
            # Remove markdown code blocks if present
            if cleaned.startswith("```"):
                lines = cleaned.split("\n")
                cleaned = "\n".join(lines[1:-1])
            
            # Remove 'json' prefix if present
            if cleaned.startswith("json"):
                cleaned = cleaned[4:].strip()
            
            # Find JSON object
            start_idx = cleaned.find("{")
            end_idx = cleaned.rfind("}")
            
            if start_idx != -1 and end_idx != -1:
                json_str = cleaned[start_idx:end_idx + 1]
                parsed = json.loads(json_str)
            else:
                parsed = json.loads(cleaned)
            
            # Ensure all required fields with defaults
            result = {
                "overallScore": parsed.get("overallScore", 0),
                "summary": parsed.get("summary", "No summary available"),
                "strengths": parsed.get("strengths", []),
                "weaknesses": parsed.get("weaknesses", []),
                "extractedSkills": parsed.get("extractedSkills", []),
                "experience": parsed.get("experience", {"totalYears": 0, "roles": []}),
                "education": parsed.get("education", []),
                "improvements": parsed.get("improvements", []),
                "atsCompatibility": parsed.get("atsCompatibility", {
                    "score": 0,
                    "parsing_success": True,
                    "format_issues": [],
                    "keyword_optimization": 0,
                    "recommendations": []
                }),
                "careerSuggestions": parsed.get("careerSuggestions", []),
                "skillGaps": parsed.get("skillGaps", []),
                "industryBenchmark": parsed.get("industryBenchmark"),
                "contactInfo": parsed.get("contactInfo", {}),
                "keywords": parsed.get("keywords", []),
                "readabilityScore": parsed.get("readabilityScore", 0),
                "formattingScore": parsed.get("formattingScore", 0),
                "impactScore": parsed.get("impactScore", 0),
                "extractedText": original_text,
                "analyzedAt": datetime.now().isoformat(),
                "aiProvider": "Perplexity AI"
            }
            
            return result
            
        except json.JSONDecodeError as e:
            print(f"JSON parsing error: {e}")
            print(f"Raw response: {analysis_text[:500]}...")
            raise Exception(f"Failed to parse AI response: {str(e)}")
        except Exception as e:
            print(f"Parsing error: {e}")
            raise
    
    def get_career_suggestions(
        self, 
        resume_text: str, 
        preferences: Optional[Dict] = None
    ) -> List[Dict[str, Any]]:
        """Get career path suggestions based on resume"""
        
        preferences_text = json.dumps(preferences or {}, indent=2)
        
        prompt = f"""Based on this resume, suggest 5-7 career paths with current market trends:

RESUME:
{resume_text}

PREFERENCES:
{preferences_text}

Return ONLY a JSON array of career suggestions with: title, industry, match_score, required_skills, salary_range, growth_potential, reasoning, current_demand, future_outlook"""
        
        try:
            response = requests.post(
                self.api_url,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                },
                json={
                    "model": self.default_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a career counselor with real-time market knowledge. Provide data-driven career suggestions in JSON format."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.8,
                    "max_tokens": 3000
                },
                timeout=60
            )
            
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Extract JSON array
            start_idx = content.find("[")
            end_idx = content.rfind("]")
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx + 1]
                return json.loads(json_str)
            
            return []
            
        except Exception as e:
            print(f"Career suggestions error: {e}")
            return []
    
    def optimize_for_ats(
        self, 
        resume_text: str, 
        job_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Optimize resume for ATS systems"""
        
        job_context = f"\n\nJOB DESCRIPTION:\n{job_description}" if job_description else ""
        
        prompt = f"""Analyze this resume for ATS compatibility and provide optimization suggestions:

RESUME:
{resume_text}
{job_context}

Return ONLY a JSON object with:
{{
  "ats_score": (0-100),
  "issues": ["issue 1", "issue 2"],
  "missing_keywords": ["keyword 1", "keyword 2"],
  "suggestions": [{{"type": "type", "current": "text", "optimized": "text", "reason": "why"}}],
  "formatting_tips": ["tip 1", "tip 2"],
  "keyword_density": {{"keyword": percentage}}
}}"""
        
        try:
            response = requests.post(
                self.api_url,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {self.api_key}"
                },
                json={
                    "model": self.default_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are an ATS optimization expert. Provide specific, actionable advice in JSON format."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.6,
                    "max_tokens": 2500
                },
                timeout=60
            )
            
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            
            # Extract JSON object
            start_idx = content.find("{")
            end_idx = content.rfind("}")
            
            if start_idx != -1 and end_idx != -1:
                json_str = content[start_idx:end_idx + 1]
                return json.loads(json_str)
            
            return {}
            
        except Exception as e:
            print(f"ATS optimization error: {e}")
            return {}


# Convenience function for quick analysis
def analyze_resume_with_perplexity(
    resume_text: str,
    api_key: Optional[str] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Quick function to analyze resume with Perplexity AI
    
    Args:
        resume_text: Extracted resume text
        api_key: Optional API key (uses env if not provided)
        **kwargs: Additional arguments for analysis
        
    Returns:
        Analysis results
    """
    analyzer = PerplexityResumeAnalyzer(api_key)
    return analyzer.analyze_resume(resume_text, **kwargs)


if __name__ == "__main__":
    # Example usage
    sample_resume = """
    John Doe
    Software Engineer
    
    Experience:
    - Senior Developer at Tech Corp (2020-Present)
    - Full Stack Developer at StartUp Inc (2018-2020)
    
    Skills: Python, JavaScript, React, Node.js, AWS, Docker
    
    Education: BS Computer Science, MIT, 2018
    """
    
    try:
        analyzer = PerplexityResumeAnalyzer()
        result = analyzer.analyze_resume(
            sample_resume,
            target_role="Senior Software Engineer",
            target_industry="Technology"
        )
        
        print(json.dumps(result, indent=2))
    except Exception as e:
        print(f"Error: {e}")
