import os
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain.schema import HumanMessage, SystemMessage
from dotenv import load_dotenv
import re
from llm_provider import get_chat_model
from datetime import datetime

# Add imports for file handling
import PyPDF2
import docx
from typing import Optional
import json

# Load environment variables
load_dotenv()

# Initialize LangChain model and parser
print("🔄 Initializing LangChain model for internship resume analysis...")
model = get_chat_model()
parser = StrOutputParser()

if model:
    print("✅ LangChain model initialized successfully")
else:
    print("❌ Failed to initialize LangChain model - will use fallback")

# Prompt template for internship resume analysis
internship_resume_template = """
You are an expert HR analyst specializing in internship applications. Analyze this resume for internship opportunities and provide:

1. **Overall Score** (0-100): Based on academic background, skills, projects, and internship readiness
2. **Academic Analysis**: GPA, relevant coursework, achievements
3. **Skills Assessment**: Technical and soft skills evaluation
4. **Project Analysis**: Quality and relevance of projects
5. **Experience Evaluation**: Previous internships, part-time work, volunteer experience
6. **Internship Readiness**: How prepared they are for professional internships
7. **Improvement Areas**: Specific suggestions for stronger applications
8. **Recommended Roles**: Types of internships that would be a good fit

Resume Text: {resume_text}

Provide detailed analysis with specific scores and actionable feedback for internship seekers.
"""

internship_resume_prompt = PromptTemplate(
    input_variables=["resume_text"],
    template=internship_resume_template
)

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
        return ""

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        doc = docx.Document(file_path)
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        print(f"Error extracting text from DOCX: {e}")
        return ""

def extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            text = file.read()
        return text
    except Exception as e:
        print(f"Error extracting text from TXT: {e}")
        return ""

def extract_resume_text(file_path: str) -> Optional[str]:
    """Extract text from resume file (PDF, DOCX, or TXT)"""
    try:
        ext = os.path.splitext(file_path)[1].lower()
        print(f"📄 Extracting text from {ext} file: {file_path}")
        
        if ext == ".pdf":
            return extract_text_from_pdf(file_path)
        elif ext in [".docx", ".doc"]:
            return extract_text_from_docx(file_path)
        elif ext == ".txt":
            return extract_text_from_txt(file_path)
        else:
            print(f"❌ Unsupported file format: {ext}")
            print("💡 Supported formats: PDF, DOCX, DOC, TXT")
            return None
    except Exception as e:
        print(f"❌ Error extracting resume text: {e}")
        return None

def analyze_internship_resume(resume_text: str) -> dict:
    """Analyze resume specifically for internship applications using LangChain with HuggingFace"""
    print("🎯 Starting internship resume analysis using LangChain with HuggingFace")
    print(f"📄 Resume text length: {len(resume_text)} characters")
    
    try:
        if model and resume_text.strip():
            print(f"✅ Using LangChain model: {type(model).__name__}")
            print(f"🤖 Model details: {getattr(model, 'model_name', 'unknown')}")
            
            # Create LangChain chain with proper prompt formatting
            chain = internship_resume_prompt | model | parser
            
            # Prepare input with proper truncation
            truncated_text = resume_text[:3000] if len(resume_text) > 3000 else resume_text
            print(f"📝 Processing text length: {len(truncated_text)} characters")
            
            # Generate analysis using LangChain
            print("🤖 Invoking LangChain model with HuggingFace...")
            print(f"🔍 Text preview: {truncated_text[:200]}...")
            
            response = chain.invoke({
                "resume_text": truncated_text
            })
            
            print(f"✅ LangChain model response received: {len(response)} characters")
            print(f"📊 Response preview: {response[:300]}...")
            
            # Parse the response
            analysis = parse_resume_analysis(response)
            print(f"📈 Parsed analysis with {len(analysis)} sections")
            
            result = {
                "success": True,
                "source": "langchain_huggingface",
                "model_used": str(type(model).__name__),
                "model_name": getattr(model, 'model_name', 'unknown'),
                "input_length": len(resume_text),
                "processed_length": len(truncated_text),
                "response_length": len(response),
                "analysis": analysis,
                "raw_response": response,
                "timestamp": datetime.now().isoformat()
            }
            
            print("✅ Internship resume analysis completed successfully using LangChain + HuggingFace")
            print(f"📋 Result summary: {len(result)} fields in response")
            return result
            
        else:
            print("⚠️ LangChain model not available, using fallback analysis")
            return fallback_resume_analysis(resume_text)
            
    except Exception as e:
        print(f"❌ Error in LangChain resume analysis: {e}")
        import traceback
        print(f"🔍 Full error traceback: {traceback.format_exc()}")
        print("🔄 Falling back to basic analysis")
        return fallback_resume_analysis(resume_text)

def parse_resume_analysis(response: str) -> dict:
    """Parse the LLM response into structured data"""
    try:
        # Extract overall score
        score_match = re.search(r'Overall Score.*?(\d+)', response, re.IGNORECASE)
        overall_score = int(score_match.group(1)) if score_match else 75
        
        # Extract sections
        sections = {
            "overall_score": overall_score,
            "academic_analysis": extract_section(response, "Academic Analysis"),
            "skills_assessment": extract_section(response, "Skills Assessment"),
            "project_analysis": extract_section(response, "Project Analysis"),
            "experience_evaluation": extract_section(response, "Experience Evaluation"),
            "internship_readiness": extract_section(response, "Internship Readiness"),
            "improvement_areas": extract_section(response, "Improvement Areas"),
            "recommended_roles": extract_section(response, "Recommended Roles")
        }
        
        return sections
    except Exception as e:
        print(f"Error parsing analysis: {e}")
        return {"overall_score": 75, "analysis": response}

def extract_section(text: str, section_name: str) -> str:
    """Extract specific section from analysis"""
    try:
        pattern = rf'{section_name}[:\s]*([^0-9]+?)(?=\d+\.|$|\n\n|\*\*)'
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        return match.group(1).strip() if match else "Analysis not available"
    except:
        return "Analysis not available"

def fallback_resume_analysis(resume_text: str) -> dict:
    """Provide basic analysis when LangChain/LLM is unavailable"""
    print("⚠️ Using fallback analysis - LangChain model not available")
    
    # Simple keyword-based analysis
    technical_keywords = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'git', 'aws', 'docker', 'html', 'css', 'c++', 'c#', 'golang', 'rust']
    soft_skills = ['leadership', 'teamwork', 'communication', 'problem-solving', 'creative', 'analytical', 'adaptable']
    academic_keywords = ['gpa', 'cgpa', 'grade', 'university', 'college', 'degree', 'bachelor', 'master']
    
    tech_score = sum(1 for keyword in technical_keywords if keyword.lower() in resume_text.lower())
    soft_score = sum(1 for skill in soft_skills if skill.lower() in resume_text.lower())
    academic_score = sum(1 for keyword in academic_keywords if keyword.lower() in resume_text.lower())
    
    has_projects = any(word in resume_text.lower() for word in ['project', 'github', 'portfolio', 'built', 'developed', 'created'])
    has_experience = any(word in resume_text.lower() for word in ['intern', 'experience', 'work', 'volunteer', 'job'])
    has_education = any(word in resume_text.lower() for word in ['university', 'college', 'school', 'education'])
    
    # Calculate overall score with better logic
    base_score = 50
    tech_bonus = min(tech_score * 4, 25)
    soft_bonus = min(soft_score * 2, 10)
    project_bonus = 15 if has_projects else 0
    exp_bonus = 10 if has_experience else 0
    edu_bonus = 10 if has_education else 0
    
    overall_score = min(base_score + tech_bonus + soft_bonus + project_bonus + exp_bonus + edu_bonus, 100)
    
    return {
        "success": True,
        "source": "fallback",
        "model_used": "keyword_analysis",
        "analysis": {
            "overall_score": overall_score,
            "academic_analysis": f"Found {academic_score} academic indicators. " + ("Has education background." if has_education else "Limited education info."),
            "skills_assessment": f"Technical skills: {tech_score} found. Soft skills: {soft_score} found.",
            "project_analysis": "Has relevant projects." if has_projects else "Limited project information.",
            "experience_evaluation": "Has work/internship experience." if has_experience else "No significant experience found.",
            "internship_readiness": f"Readiness score: {overall_score}%. " + ("Good candidate" if overall_score >= 70 else "Needs improvement"),
            "improvement_areas": "Consider adding more technical projects, relevant coursework, and internship experience.",
            "recommended_roles": "Entry-level internships in software development, data analysis, or technical support roles."
        },
        "note": "This is a basic keyword-based analysis. For detailed AI-powered insights, please ensure LangChain model is properly configured."
    }

def process_resume_file(file_path: str) -> dict:
    """Process uploaded resume file and return analysis"""
    try:
        # Extract text from file
        resume_text = extract_resume_text(file_path)
        
        if not resume_text:
            return {
                "success": False,
                "error": "Could not extract text from resume file"
            }
        
        # Analyze the resume
        analysis = analyze_internship_resume(resume_text)
        
        return analysis
    except Exception as e:
        print(f"Error processing resume file: {e}")
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
    
    Education:
    - B.Tech in Computer Science, XYZ University (GPA: 8.5/10)
    - Relevant Coursework: Data Structures, Algorithms, Web Development
    
    Skills:
    - Programming: Python, Java, JavaScript, React
    - Tools: Git, Docker, AWS
    - Soft Skills: Leadership, Teamwork, Problem-solving
    
    Projects:
    - E-commerce Website using React and Node.js
    - Machine Learning project for sentiment analysis
    
    Experience:
    - Summer Intern at ABC Company (2 months)
    - Volunteer at local NGO
    """
    
    result = analyze_internship_resume(sample_text)
    print(json.dumps(result, indent=2))