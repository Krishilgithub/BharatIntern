"""
Simple internship resume analyzer without LangChain dependencies
"""
import os
import re
from datetime import datetime
from typing import Dict, Any, Optional
import PyPDF2
import docx
import traceback

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting PDF: {e}")
        return ""

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error extracting DOCX: {e}")
        return ""

def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except UnicodeDecodeError:
        try:
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read().strip()
        except Exception as e:
            print(f"Error extracting TXT: {e}")
            return ""
    except Exception as e:
        print(f"Error extracting TXT: {e}")
        return ""

def extract_resume_text(file_path: str) -> str:
    """Extract text from various file formats"""
    print(f"📄 Extracting text from: {file_path}")
    
    if not os.path.exists(file_path):
        print(f"❌ File does not exist: {file_path}")
        return ""
    
    file_size = os.path.getsize(file_path)
    print(f"📏 File size: {file_size} bytes")
    
    if file_size == 0:
        print("❌ File is empty")
        return ""
    
    file_ext = os.path.splitext(file_path)[1].lower()
    print(f"📋 File extension: {file_ext}")
    
    try:
        if file_ext == '.pdf':
            text = extract_text_from_pdf(file_path)
        elif file_ext in ['.docx', '.doc']:
            text = extract_text_from_docx(file_path)
        elif file_ext == '.txt':
            text = extract_text_from_txt(file_path)
        else:
            print(f"❌ Unsupported file format: {file_ext}")
            return ""
        
        print(f"✅ Successfully extracted {len(text)} characters")
        return text
        
    except Exception as e:
        print(f"❌ Error during text extraction: {e}")
        print(f"🔍 Full error traceback: {traceback.format_exc()}")
        return ""

def analyze_internship_resume(resume_text: str) -> Dict[str, Any]:
    """Analyze resume for internship opportunities using simple text analysis"""
    print(f"🎯 Starting simple internship resume analysis")
    print(f"📄 Resume text length: {len(resume_text)} characters")
    
    try:
        if not resume_text or len(resume_text.strip()) < 50:
            return {
                "success": False,
                "error": "Resume text is too short or empty",
                "source": "simple_analyzer"
            }
        
        # Simple analysis based on keywords and patterns
        analysis = perform_simple_analysis(resume_text)
        
        result = {
            "success": True,
            "source": "simple_analyzer",
            "model_used": "keyword_based",
            "input_length": len(resume_text),
            "analysis": analysis,
            "timestamp": datetime.now().isoformat()
        }
        
        print("✅ Simple internship resume analysis completed")
        return result
        
    except Exception as e:
        print(f"❌ Error in simple resume analysis: {e}")
        print(f"🔍 Full error traceback: {traceback.format_exc()}")
        return {
            "success": False,
            "error": str(e),
            "source": "simple_analyzer"
        }

def categorize_skill(skill: str) -> str:
    """Categorize a skill into appropriate category"""
    programming = ['python', 'java', 'javascript', 'c++', 'c#', 'typescript', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin']
    web = ['html', 'css', 'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask']
    database = ['mysql', 'postgresql', 'mongodb', 'sqlite', 'redis', 'oracle', 'nosql']
    devops = ['docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp', 'linux']
    
    if skill.lower() in programming:
        return "Programming Languages"
    elif skill.lower() in web:
        return "Web Development"
    elif skill.lower() in database:
        return "Database"
    elif skill.lower() in devops:
        return "DevOps & Cloud"
    else:
        return "General"

def calculate_ats_score(text: str) -> int:
    """Calculate ATS compatibility score"""
    score = 70  # Base score
    text_lower = text.lower()
    
    # Check for standard sections
    sections = ['experience', 'education', 'skills', 'projects', 'contact']
    for section in sections:
        if section in text_lower:
            score += 5
    
    # Check for contact information
    if '@' in text:  # Email
        score += 5
    if any(char.isdigit() for char in text):  # Phone number
        score += 5
    
    return min(100, score)

def extract_contact_info(text: str) -> Dict[str, str]:
    """Extract contact information from resume text"""
    import re
    
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    phone_match = re.search(r'\b(?:\+?1[-\s]?)?(?:\(?[0-9]{3}\)?[-\s]?[0-9]{3}[-\s]?[0-9]{4})\b', text)
    
    return {
        "email": email_match.group() if email_match else "",
        "phone": phone_match.group() if phone_match else ""
    }

def generate_missing_skills(languages: list, frameworks: list) -> list:
    """Generate missing skills recommendations"""
    all_found = languages + frameworks
    suggestions = []
    
    if 'javascript' in all_found and 'typescript' not in all_found:
        suggestions.append({"name": "TypeScript", "impact": "+15%", "priority": "High", "reason": "Strong typing for JavaScript development"})
    
    if 'react' in all_found and 'node.js' not in all_found:
        suggestions.append({"name": "Node.js", "impact": "+12%", "priority": "Medium", "reason": "Full-stack JavaScript development"})
    
    if not any(db in all_found for db in ['mysql', 'mongodb', 'postgresql']):
        suggestions.append({"name": "Database Skills", "impact": "+18%", "priority": "High", "reason": "Essential for backend development"})
    
    if 'docker' not in all_found:
        suggestions.append({"name": "Docker", "impact": "+10%", "priority": "Medium", "reason": "Containerization is industry standard"})
    
    return suggestions[:4]  # Limit to top 4

def generate_ats_issues(text: str) -> list:
    """Generate ATS compatibility issues"""
    issues = []
    text_lower = text.lower()
    
    if 'experience' not in text_lower and 'work' not in text_lower:
        issues.append({"type": "structure", "severity": "Medium", "description": "Add clear 'Experience' or 'Work History' section"})
    
    if '@' not in text:
        issues.append({"type": "contact", "severity": "High", "description": "Include email address for contact"})
    
    if len([c for c in text if c.isdigit()]) < 10:
        issues.append({"type": "contact", "severity": "Medium", "description": "Include phone number for contact"})
    
    return issues

def generate_ats_recommendations(text: str) -> list:
    """Generate ATS recommendations"""
    return [
        "Use standard section headings like 'Experience', 'Education', 'Skills'",
        "Include relevant keywords from job descriptions",
        "Use a clean, simple format without complex graphics",
        "Save resume in multiple formats (PDF, DOCX)"
    ]

def perform_simple_analysis(text: str) -> Dict[str, Any]:
    """Perform comprehensive keyword-based analysis"""
    text_lower = text.lower()
    
    # Enhanced technical skills detection
    programming_languages = ['python', 'java', 'javascript', 'c++', 'c#', 'react', 'node.js', 'html', 'css', 'typescript', 'angular', 'vue', 'php', 'ruby', 'go', 'rust', 'swift', 'kotlin']
    databases = ['mysql', 'postgresql', 'mongodb', 'sqlite', 'redis', 'oracle', 'nosql']
    frameworks = ['django', 'flask', 'spring', 'express', 'laravel', 'rails', 'asp.net']
    tools = ['git', 'docker', 'kubernetes', 'jenkins', 'aws', 'azure', 'gcp', 'linux', 'jira']
    
    found_languages = [lang for lang in programming_languages if lang in text_lower]
    found_databases = [db for db in databases if db in text_lower]
    found_frameworks = [fw for fw in frameworks if fw in text_lower]
    found_tools = [tool for tool in tools if tool in text_lower]
    
    all_skills = found_languages + found_databases + found_frameworks + found_tools
    
    # Education analysis
    education_keywords = ['bachelor', 'b.tech', 'b.sc', 'master', 'm.tech', 'phd', 'computer science', 'engineering', 'gpa', 'cgpa', 'university', 'college', 'degree']
    education_found = any(keyword in text_lower for keyword in education_keywords)
    
    # Experience analysis
    experience_keywords = ['intern', 'project', 'developed', 'built', 'created', 'implemented', 'worked', 'experience', 'years', 'months']
    experience_found = any(keyword in text_lower for keyword in experience_keywords)
    
    # Project analysis
    project_keywords = ['project', 'developed', 'built', 'created', 'designed', 'implemented', 'portfolio', 'github']
    project_found = any(keyword in text_lower for keyword in project_keywords)
    
    # Calculate comprehensive scores
    skills_score = min(len(all_skills) * 8 + 20, 100)
    education_score = 90 if education_found else 65
    experience_score = 85 if experience_found else 55
    project_score = 80 if project_found else 60
    overall_score = int((skills_score + education_score + experience_score + project_score) / 4)
    
    # ATS Compatibility Analysis
    ats_score = calculate_ats_score(text)
    
    # Extract contact information
    contact_info = extract_contact_info(text)
    
    # Generate skill objects with confidence scores
    extracted_skills = []
    for skill in all_skills:
        skill_confidence = min(90, 70 + (text_lower.count(skill) * 5))
        extracted_skills.append({
            "name": skill.title(),
            "confidence": skill_confidence,
            "category": categorize_skill(skill),
            "level": "Intermediate" if skill_confidence > 80 else "Beginner",
            "yearsExp": min(5, max(1, text_lower.count(skill)))
        })
    
    # Missing skills analysis
    missing_skills = generate_missing_skills(found_languages, found_frameworks)
    
    return {
        "overallScore": overall_score,
        "extractedSkills": extracted_skills,
        "missingSkills": missing_skills,
        "atsCompatibility": {
            "score": ats_score,
            "issues": generate_ats_issues(text),
            "recommendations": generate_ats_recommendations(text)
        },
        "contactInfo": contact_info,
        "technicalSkills": all_skills,
        "hasEducation": education_found,
        "hasExperience": experience_found,
        "hasProjects": project_found,
        "skills_score": skills_score,
        "education_score": education_score,
        "experience_score": experience_score,
        "project_score": project_score
    }

def process_resume_file(file_path: str) -> Dict[str, Any]:
    """Process uploaded resume file and return analysis"""
    print(f"🎯 Processing resume file: {file_path}")
    
    try:
        # Extract text from file
        resume_text = extract_resume_text(file_path)
        
        if not resume_text:
            return {
                "success": False,
                "error": "Could not extract text from resume file"
            }
        
        print(f"✅ Text extracted successfully: {len(resume_text)} characters")
        
        # Analyze the resume
        analysis = analyze_internship_resume(resume_text)
        
        return analysis
        
    except Exception as e:
        print(f"❌ Error processing resume file: {e}")
        print(f"🔍 Full error traceback: {traceback.format_exc()}")
        return {
            "success": False,
            "error": str(e)
        }

# Test function
if __name__ == "__main__":
    # Test with sample resume text
    sample_text = """
    John Doe
    Computer Science Student
    Email: john.doe@email.com
    
    Education:
    B.Tech in Computer Science, XYZ University
    CGPA: 8.5/10.0
    
    Skills:
    - Programming Languages: Python, Java, JavaScript
    - Web Technologies: HTML, CSS, React, Node.js
    - Databases: MySQL, MongoDB
    
    Projects:
    1. E-commerce Website - Built using React and Node.js
    2. Data Analysis Dashboard - Created using Python
    
    Experience:
    Software Development Intern at ABC Company
    """
    
    print("🧪 Testing simple resume analysis...")
    result = analyze_internship_resume(sample_text)
    print(f"📊 Analysis result: {result}")