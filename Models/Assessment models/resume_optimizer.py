import os
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from typing import Optional
from dotenv import load_dotenv
import pdfplumber   #type: ignore
import docx #type: ignore
from llm_provider import get_chat_model

# Load environment variables
load_dotenv()

model = get_chat_model()

# Output parser
parser = StrOutputParser()

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        with pdfplumber.open(file_path) as pdf:
            text = "\n".join(page.extract_text() or '' for page in pdf.pages)
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

def extract_resume_text(file_path: str) -> Optional[str]:
    """Extract text from resume file (PDF or DOCX)"""
    try:
        ext = os.path.splitext(file_path)[1].lower()
        if ext == ".pdf":
            return extract_text_from_pdf(file_path)
        elif ext == ".docx":
            return extract_text_from_docx(file_path)
        elif ext == ".doc":
            # For .doc files, we'll try to extract as much as possible
            return extract_text_from_docx(file_path)
        else:
            print(f"Unsupported file format: {ext}")
            return None
    except Exception as e:
        print(f"Error extracting resume text: {e}")
        return None

# Prompt template for resume analysis
resume_analysis_template = """
You are a senior career coach and resume optimization expert with 15+ years of experience helping professionals land jobs at top companies. Analyze the following resume comprehensively:

Resume Content: {resume_text}
Target Role: {job_role}

Provide a detailed, professional analysis following this EXACT format:

## 📊 RESUME ANALYSIS REPORT

### 🔍 KEY COMPONENTS EXTRACTED
**Profile Overview:**
- Current Status: [Student/Professional/Career Changer]
- Education Level: [Degree, Institution, GPA if strong]
- Years of Experience: [Entry-level/X years]
- Core Expertise: [Primary technical/professional focus]

**Education:**
[List educational background with key details]

**Technical Skills:**
[Categorize skills by proficiency level]

**Projects/Experience:**
[List major projects or work experience with impact]

**Achievements:**
[Notable accomplishments, awards, certifications]

### ✅ STRENGTHS ANALYSIS
[Provide 4-6 specific strengths with detailed explanations of why they're valuable for the target role]

### ⚠️ AREAS FOR IMPROVEMENT
[Identify 4-6 specific weaknesses with clear explanations of why they limit effectiveness]

### 🚀 OPTIMIZATION RECOMMENDATIONS

**PRIORITY 1 - IMMEDIATE ACTIONS:**
1. **Professional Summary**: [Specific guidance on crafting a compelling summary]
2. **Keywords Integration**: [Industry-specific keywords to add for ATS optimization]
3. **Quantifiable Results**: [How to add metrics and measurable achievements]

**PRIORITY 2 - CONTENT ENHANCEMENTS:**
4. **Project Descriptions**: [How to improve project narratives with STAR method]
5. **Skills Organization**: [Better categorization and presentation of technical skills]
6. **Format Optimization**: [Layout and structure improvements]

**PRIORITY 3 - STRATEGIC ADDITIONS:**
7. **Missing Elements**: [What sections or content should be added]
8. **Industry Alignment**: [How to better align with {job_role} requirements]
9. **Competitive Edge**: [Unique value propositions to highlight]

### 📈 ATS OPTIMIZATION SCORE: [X/10]
**Keyword Density**: [Rating with explanation]
**Format Compatibility**: [Rating with explanation]
**Content Relevance**: [Rating with explanation]

### 🎯 NEXT STEPS
[3-5 specific, actionable next steps prioritized by impact]

---
*This analysis is tailored specifically for {job_role} positions. Implementing these recommendations should significantly improve your resume's effectiveness and interview callback rate.*
"""

resume_analysis_prompt = PromptTemplate(
    input_variables=["resume_text", "job_role"],
    template=resume_analysis_template
)

# Function to analyze resume
def analyze_resume(file_path: str, job_role: str = "Software Engineer") -> str:
    print(f"🔄 Analyzing resume for {job_role} position")
    
    try:
        resume_text = extract_resume_text(file_path)
        
        if not resume_text or not resume_text.strip():
            return f"Error: Could not extract text from the uploaded resume. Please ensure the file is not corrupted and is in PDF or DOCX format."
        
        if model:
            # Try AI analysis first
            try:
                prompt = resume_analysis_prompt.format(
                    resume_text=resume_text,
                    job_role=job_role
                )
                result = model.invoke(prompt)
                
                print("✅ AI resume analysis completed successfully!")
                
                return result.content
            except Exception as ai_error:
                print(f"❌ AI analysis failed: {ai_error}")
                print("🔄 Falling back to basic analysis...")
        else:
            print("⚠️ No model available, using basic analysis...")
        
        # Fallback response when model is not available
        word_count = len(resume_text.split())
        char_count = len(resume_text)
        
        return f"""
## 📊 RESUME ANALYSIS REPORT (Basic Analysis)

### 🔍 DOCUMENT PROCESSING SUMMARY
- **File Format**: Successfully processed
- **Content Extracted**: {char_count:,} characters, {word_count:,} words
- **Analysis Status**: Basic structural analysis (AI enhancement unavailable)

### 📄 CONTENT PREVIEW
```
{resume_text[:500]}{"..." if len(resume_text) > 500 else ""}
```

### ✅ BASIC EVALUATION FOR {job_role.upper()}

**Document Structure:**
- Resume content was successfully extracted and is readable
- Text length suggests {['comprehensive' if word_count > 200 else 'concise'][0]} resume format
- Content appears to be well-structured for analysis

**Recommended Next Steps:**
1. **Enable AI Analysis**: Configure OpenRouter API key for detailed analysis
2. **Manual Review**: Review content for {job_role}-specific keywords
3. **Format Check**: Ensure proper section headers and bullet points
4. **Quantify Achievements**: Add specific metrics and numbers to accomplishments
5. **Keywords Optimization**: Include industry-relevant terminology

### 🎯 UPGRADE TO FULL ANALYSIS
For comprehensive resume optimization including:
- ✅ Detailed strengths and weaknesses analysis
- ✅ ATS optimization scoring
- ✅ Industry-specific recommendations
- ✅ Competitive positioning advice
- ✅ Priority-based improvement plan

Please contact support to enable AI-powered analysis.

---
*Basic analysis completed. Resume content extracted successfully and ready for detailed review.*
        """
    except Exception as e:
        return f"Error analyzing resume: {str(e)} 😵"

# Example usage
if __name__ == "__main__":
    pdf_path = "./data/Krishil Agrawal Resume - ML.pdf"
    result = analyze_resume(pdf_path, "Machine Learning Engineer")
    print(result)