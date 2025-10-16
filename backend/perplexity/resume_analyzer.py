from openai import OpenAI
import os
from pathlib import Path
import PyPDF2

def read_resume(file_path):
    """Read resume from file"""
    # Check if it's a PDF file
    if file_path.lower().endswith('.pdf'):
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            raise Exception(f"Error reading PDF: {e}")
    else:
        # Handle text files
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except UnicodeDecodeError:
            # Try with different encoding if utf-8 fails
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read()

def analyze_resume(resume_text, api_key):
    """Analyze resume using Perplexity AI"""
    
    # Truncate if too long (keep first 15000 chars to stay within token limit)
    if len(resume_text) > 15000:
        print("⚠️  Resume is long. Truncating to fit model limits...")
        resume_text = resume_text[:15000] + "\n\n[Resume truncated due to length]"
    
    # Initialize Perplexity client
    client = OpenAI(
        api_key=api_key,
        base_url="https://api.perplexity.ai"
    )
    
    # Create analysis prompt
    prompt = f"""
    Analyze the following resume in detail and provide:
    
    1. **Overall Summary**: Brief overview of the candidate's profile
    2. **Strengths**: Key strengths and standout qualities
    3. **Weaknesses**: Areas that need improvement
    4. **Skills Assessment**: Evaluation of technical and soft skills
    5. **Experience Analysis**: Quality and relevance of work experience
    6. **Education Background**: Assessment of educational qualifications
    7. **Formatting & Presentation**: How well the resume is structured
    8. **ATS Compatibility**: Whether it's optimized for Applicant Tracking Systems
    9. **Recommendations**: Specific suggestions for improvement
    10. **Overall Score**: Rate the resume out of 10
    
    Resume Content:
    {resume_text}
    
    Provide a comprehensive, professional analysis.
    """
    
    # Make API call
    response = client.chat.completions.create(
        model="sonar-pro",  # Perplexity's model
        messages=[
            {
                "role": "system",
                "content": "You are an expert HR professional and resume analyst with years of experience in recruiting and talent acquisition."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.7,
        max_tokens=2000
    )
    
    return response.choices[0].message.content

def main():
    print("=" * 60)
    print("         RESUME ANALYZER USING PERPLEXITY AI")
    print("=" * 60)
    print()
    
    # Get API key
    api_key = os.getenv("PERPLEXITY_API_KEY")
    if not api_key:
        api_key = input("Enter your Perplexity API Key: ").strip()
        if not api_key:
            print("Error: API key is required!")
            return
    
    # Get resume file path
    resume_path = input("Enter the path to your resume file (PDF, TXT, MD, etc.): ").strip()
    resume_path = resume_path.strip('"').strip("'")  # Remove quotes if present
    
    if not os.path.exists(resume_path):
        print(f"Error: File not found at {resume_path}")
        return
    
    print("\n📄 Reading resume...")
    try:
        resume_content = read_resume(resume_path)
        print(f"✓ Resume loaded ({len(resume_content)} characters)")
    except Exception as e:
        print(f"Error reading file: {e}")
        return
    
    print("\n🔍 Analyzing resume with Perplexity AI...")
    print("This may take a moment...\n")
    
    try:
        analysis = analyze_resume(resume_content, api_key)
        
        print("=" * 60)
        print("              RESUME ANALYSIS REPORT")
        print("=" * 60)
        print()
        print(analysis)
        print()
        print("=" * 60)
        
        # Option to save report
        save = input("\nWould you like to save this analysis to a file? (y/n): ").strip().lower()
        if save == 'y':
            output_path = resume_path.rsplit('.', 1)[0] + "_analysis.txt"
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write("RESUME ANALYSIS REPORT\n")
                f.write("=" * 60 + "\n\n")
                f.write(analysis)
            print(f"✓ Analysis saved to: {output_path}")
        
    except Exception as e:
        print(f"Error during analysis: {e}")
        print("\nPlease check:")
        print("1. Your API key is valid")
        print("2. You have sufficient API credits")
        print("3. Your internet connection is stable")

if __name__ == "__main__":
    main()
