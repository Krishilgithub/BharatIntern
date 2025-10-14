import os
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from llm_provider import get_chat_model

# Load environment variables
load_dotenv()

model = get_chat_model()

# Prompt template for domain-specific questions
domain_questions_template = """
You are an expert technical interviewer. Based on the resume content, generate {num_questions} domain-specific technical questions for {job_role} position.

Resume content: {resume_text}

Focus on:
1. Technologies mentioned in the resume
2. Projects and experience areas
3. Skills and certifications
4. Domain-specific knowledge
5. Real-world scenarios

Format each question as:
Q{number}. [Question text]
A) [Option A]
B) [Option B]
C) [Option C]
D) [Option D]
Correct Answer: [A/B/C/D]
Explanation: [Brief explanation]

Make questions relevant to the candidate's background and {job_role}.
"""

domain_questions_prompt = PromptTemplate(
    input_variables=["resume_text", "job_role", "num_questions"],
    template=domain_questions_template
)

def generate_domain_questions(resume_path: str, job_role: str = "Software Engineer", num_questions: int = 10, is_pdf: bool = True) -> dict:
    print(f"🔄 Generating {num_questions} domain-specific questions for {job_role}")
    
    try:
        # Extract resume text (simplified for fallback)
        resume_text = f"Resume for {job_role} position"
        
        if model:
            # Try AI generation first
            try:
                prompt = domain_questions_prompt.format(
                    resume_text=resume_text,
                    job_role=job_role,
                    num_questions=num_questions
                )
                result = model.invoke(prompt)
                
                print("✅ AI domain questions generated successfully!")
                
                return {
                    "questions": result.content,
                    "source": "openrouter_ai",
                    "job_role": job_role,
                    "resume_file": resume_path,
                    "num_questions": num_questions,
                    "status": "success"
                }
            except Exception as ai_error:
                print(f"❌ AI generation failed: {ai_error}")
                print("🔄 Falling back to predefined questions...")
        else:
            print("⚠️ No model available, using fallback questions...")
        
        # Fallback response when model is not available
        return {
                "questions": f"""
**Domain-Specific Assessment for {job_role}**

**Note**: Full AI-powered assessment not available due to missing HuggingFace API token.

**Sample Questions** (Generated without AI):
1. What is the primary purpose of Docker in software development?
   A) Code compilation B) Containerization C) Database management D) Version control
   Correct Answer: B
   Explanation: Docker provides containerization for consistent deployment environments.

2. Which HTTP method is typically used for creating new resources in a REST API?
   A) GET B) POST C) PUT D) DELETE
   Correct Answer: B
   Explanation: POST is used for creating new resources in RESTful APIs.

Please add HUGGINGFACEHUB_ACCESS_TOKEN_BACKUP environment variable for full AI-generated assessment.
                """,
                "job_role": job_role,
                "total_questions": num_questions,
                "status": "fallback"
            }
    except Exception as e:
        return {
            "error": f"Error generating domain questions: {str(e)}",
            "status": "error"
        }

if __name__ == "__main__":
    result = generate_domain_questions("./data/sample_resume.pdf", "Software Engineer", 5)
    print(result)