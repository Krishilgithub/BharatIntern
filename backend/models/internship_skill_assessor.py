import os
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from llm_provider import get_chat_model
import json
import re
from typing import List, Dict, Any
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize LangChain model for skill assessment
print("🔄 Initializing LangChain model for skill assessment...")
model = get_chat_model()
parser = StrOutputParser()

if model:
    print("✅ LangChain model initialized for skill assessment")
else:
    print("❌ Failed to initialize LangChain model for skill assessment")

# Skill assessment template for internships
skill_assessment_template = """
You are an expert skill assessor for internship programs. Analyze the candidate's skills and provide a comprehensive evaluation for {internship_domain} internship.

Candidate Information:
- Resume/Profile: {candidate_info}
- Target Role: {internship_domain}
- Experience Level: Entry/Intern level

Assess the following skill categories:
1. **Technical Skills**: Programming languages, tools, frameworks relevant to {internship_domain}
2. **Soft Skills**: Communication, teamwork, problem-solving, adaptability
3. **Academic Background**: Relevant coursework, projects, GPA/grades
4. **Practical Experience**: Previous internships, projects, certifications
5. **Learning Potential**: Ability to learn new technologies and adapt

For each category, provide:
- Current Level (1-10 scale)
- Strengths identified
- Areas for improvement
- Specific recommendations

Overall Assessment:
- Internship Readiness Score (0-100)
- Best-fit internship roles
- Learning roadmap for improvement
- Estimated timeline to proficiency

Provide detailed, actionable feedback for career development.
"""

skill_assessment_prompt = PromptTemplate(
    input_variables=["candidate_info", "internship_domain"],
    template=skill_assessment_template
)

def assess_internship_skills(candidate_info: str, internship_domain: str = "Software Development") -> dict:
    """Assess candidate's skills for internship readiness using LangChain with HuggingFace"""
    print(f"🎯 Starting skill assessment for {internship_domain} internship")
    print(f"📄 Candidate info length: {len(candidate_info)} characters")
    
    try:
        if model:
            print(f"✅ Using LangChain model: {type(model).__name__}")
            print(f"🤖 Model details: {getattr(model, 'model_name', 'unknown')}")
            
            # Create LangChain chain
            chain = skill_assessment_prompt | model | parser
            
            # Prepare truncated input
            truncated_info = candidate_info[:2500] if len(candidate_info) > 2500 else candidate_info
            print(f"📝 Processing candidate info length: {len(truncated_info)} characters")
            
            print("🤖 Invoking LangChain model with HuggingFace for skill assessment...")
            print(f"🔍 Domain: {internship_domain}")
            print(f"🔍 Info preview: {truncated_info[:200]}...")
            
            # Generate assessment using LangChain
            response = chain.invoke({
                "candidate_info": truncated_info,
                "internship_domain": internship_domain
            })
            
            print(f"✅ LangChain model response received: {len(response)} characters")
            print(f"📊 Response preview: {response[:300]}...")
            
            # Parse the assessment
            parsed_assessment = parse_skill_assessment(response)
            print(f"📈 Assessment parsed with {len(parsed_assessment)} sections")
            
            result = {
                "success": True,
                "source": "langchain_huggingface", 
                "model_used": str(type(model).__name__),
                "model_name": getattr(model, 'model_name', 'unknown'),
                "domain": internship_domain,
                "input_length": len(candidate_info),
                "processed_length": len(truncated_info),
                "response_length": len(response),
                "assessment": parsed_assessment,
                "raw_response": response,
                "timestamp": datetime.now().isoformat()
            }
            
            print("✅ Skill assessment completed successfully using LangChain + HuggingFace")
            print(f"📋 Result summary: assessment for {internship_domain} with {len(parsed_assessment)} sections")
            return result
            
        else:
            print("⚠️ LangChain model not available, using fallback assessment")
            return generate_fallback_skill_assessment(candidate_info, internship_domain)
            
    except Exception as e:
        print(f"❌ Error in skill assessment: {e}")
        import traceback
        print(f"🔍 Full error traceback: {traceback.format_exc()}")
        print("🔄 Falling back to basic assessment")
        return generate_fallback_skill_assessment(candidate_info, internship_domain)

def parse_skill_assessment(response: str) -> dict:
    """Parse LLM response into structured skill assessment"""
    try:
        assessment = {
            "technical_skills": extract_skill_section(response, "Technical Skills"),
            "soft_skills": extract_skill_section(response, "Soft Skills"),
            "academic_background": extract_skill_section(response, "Academic Background"),
            "practical_experience": extract_skill_section(response, "Practical Experience"),
            "learning_potential": extract_skill_section(response, "Learning Potential"),
            "overall_score": extract_overall_score(response),
            "readiness_level": extract_readiness_level(response),
            "recommendations": extract_recommendations(response)
        }
        
        return assessment
    except Exception as e:
        print(f"Error parsing skill assessment: {e}")
        return {"raw_analysis": response}

def extract_skill_section(text: str, section_name: str) -> dict:
    """Extract specific skill section from assessment"""
    try:
        # Look for section header and extract content
        pattern = rf'{section_name}[:\s]*([^#]*?)(?=\d+\.\s*\*\*|\*\*[A-Za-z]|\n\n|$)'
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        
        if match:
            section_text = match.group(1).strip()
            
            # Extract level score if present
            level_match = re.search(r'level[:\s]*(\d+)', section_text, re.IGNORECASE)
            level = int(level_match.group(1)) if level_match else 5
            
            return {
                "content": section_text,
                "level": level,
                "strengths": extract_bullet_points(section_text, "strength"),
                "improvements": extract_bullet_points(section_text, "improvement|area")
            }
        
        return {"content": "Not assessed", "level": 5}
    except:
        return {"content": "Not assessed", "level": 5}

def extract_bullet_points(text: str, keyword: str) -> list:
    """Extract bullet points related to specific keywords"""
    try:
        lines = text.split('\n')
        points = []
        
        for line in lines:
            if any(word in line.lower() for word in keyword.split('|')):
                # Clean bullet points
                clean_line = re.sub(r'^[-*•]\s*', '', line.strip())
                if clean_line:
                    points.append(clean_line)
        
        return points[:3]  # Return top 3 points
    except:
        return []

def extract_overall_score(text: str) -> int:
    """Extract overall readiness score"""
    try:
        # Look for score patterns
        patterns = [
            r'readiness score[:\s]*(\d+)',
            r'overall[:\s]*(\d+)',
            r'score[:\s]*(\d+)'
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return int(match.group(1))
        
        return 75  # Default score
    except:
        return 75

def extract_readiness_level(text: str) -> str:
    """Extract readiness level description"""
    levels = ['excellent', 'good', 'fair', 'needs improvement', 'ready', 'prepared']
    
    for level in levels:
        if level in text.lower():
            return level.title()
    
    return "Good"

def extract_recommendations(text: str) -> list:
    """Extract recommendation points"""
    try:
        # Look for recommendation section
        rec_match = re.search(r'recommend[^.]*([^#]*?)(?=\*\*|$)', text, re.IGNORECASE | re.DOTALL)
        
        if rec_match:
            rec_text = rec_match.group(1)
            lines = rec_text.split('\n')
            
            recommendations = []
            for line in lines:
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                    clean_rec = re.sub(r'^[-*•]\s*', '', line)
                    if clean_rec:
                        recommendations.append(clean_rec)
            
            return recommendations[:5]  # Top 5 recommendations
        
        return ["Focus on building more practical projects", "Strengthen technical fundamentals"]
    except:
        return ["Continue learning and building projects"]

def generate_fallback_skill_assessment(candidate_info: str, domain: str) -> dict:
    """Generate basic skill assessment when LangChain/LLM is unavailable"""
    print("⚠️ Using fallback skill assessment - LangChain model not available")
    
    # Simple keyword-based assessment
    technical_keywords = {
        "Software Development": ['python', 'java', 'javascript', 'react', 'node', 'sql', 'git'],
        "Data Science": ['python', 'r', 'sql', 'machine learning', 'pandas', 'numpy', 'matplotlib'],
        "Web Development": ['html', 'css', 'javascript', 'react', 'angular', 'vue', 'bootstrap'],
        "Mobile Development": ['android', 'ios', 'react native', 'flutter', 'swift', 'kotlin']
    }
    
    soft_skills = ['leadership', 'teamwork', 'communication', 'problem-solving', 'creative']
    academic_indicators = ['gpa', 'grade', 'university', 'college', 'coursework', 'project']
    
    domain_keywords = technical_keywords.get(domain, technical_keywords["Software Development"])
    
    # Count matches
    text_lower = candidate_info.lower()
    tech_matches = sum(1 for keyword in domain_keywords if keyword in text_lower)
    soft_matches = sum(1 for skill in soft_skills if skill in text_lower)
    academic_matches = sum(1 for indicator in academic_indicators if indicator in text_lower)
    
    # Calculate scores
    tech_score = min(int((tech_matches / len(domain_keywords)) * 10), 10)
    soft_score = min(int((soft_matches / len(soft_skills)) * 10), 10)
    academic_score = min(int((academic_matches / len(academic_indicators)) * 10), 10)
    
    overall_score = int((tech_score + soft_score + academic_score) / 3 * 10)
    
    # Determine readiness level
    if overall_score >= 80:
        readiness = "Excellent - Ready for advanced internships"
    elif overall_score >= 60:
        readiness = "Good - Suitable for most internships"
    elif overall_score >= 40:
        readiness = "Fair - Entry-level internships recommended"
    else:
        readiness = "Needs Improvement - Focus on skill building"
    
    return {
        "success": True,
        "source": "fallback",
        "model_used": "keyword_analysis",
        "domain": domain,
        "assessment": {
            "technical_skills": {"level": tech_score, "matches": tech_matches},
            "soft_skills": {"level": soft_score, "matches": soft_matches},
            "academic_background": {"level": academic_score, "matches": academic_matches},
            "overall_score": overall_score,
            "readiness_level": readiness,
            "recommendations": [
                f"Strengthen {domain.lower()} technical skills",
                "Build more practical projects",
                "Develop communication and teamwork skills",
                "Create a portfolio showcasing your work"
            ]
        },
        "note": "This is a basic keyword-based assessment. For detailed AI-powered insights, please ensure LangChain model is properly configured."
    }

def create_learning_roadmap(assessment: dict, domain: str) -> dict:
    """Create personalized learning roadmap based on assessment"""
    
    roadmap_templates = {
        "Software Development": {
            "Phase 1 (Weeks 1-4)": [
                "Master programming fundamentals in chosen language",
                "Learn version control with Git and GitHub",
                "Complete basic data structures and algorithms",
                "Build 2-3 simple projects"
            ],
            "Phase 2 (Weeks 5-8)": [
                "Learn web development basics (HTML, CSS, JavaScript)",
                "Study database fundamentals and SQL",
                "Practice coding problems daily",
                "Start contributing to open source projects"
            ],
            "Phase 3 (Weeks 9-12)": [
                "Learn a web framework (React, Django, etc.)",
                "Build a full-stack project",
                "Practice system design basics",
                "Prepare for technical interviews"
            ]
        },
        "Data Science": {
            "Phase 1 (Weeks 1-4)": [
                "Master Python for data analysis",
                "Learn pandas, numpy, and matplotlib",
                "Study statistics and probability",
                "Complete basic data visualization projects"
            ],
            "Phase 2 (Weeks 5-8)": [
                "Learn machine learning fundamentals",
                "Study SQL for data querying",
                "Practice with real datasets",
                "Build data analysis portfolio"
            ]
        }
    }
    
    domain_roadmap = roadmap_templates.get(domain, roadmap_templates["Software Development"])
    
    return {
        "domain": domain,
        "estimated_duration": "12 weeks",
        "phases": domain_roadmap,
        "resources": [
            "Online courses (Coursera, edX, Udemy)",
            "Practice platforms (LeetCode, HackerRank)",
            "Documentation and tutorials",
            "Open source projects for contribution"
        ]
    }

# Test function
if __name__ == "__main__":
    sample_info = """
    Computer Science student with knowledge of Python, Java, and basic web development.
    Completed coursework in data structures and algorithms. 
    Built a simple e-commerce website project.
    Good communication skills and teamwork experience.
    """
    
    result = assess_internship_skills(sample_info, "Software Development")
    print(json.dumps(result, indent=2))