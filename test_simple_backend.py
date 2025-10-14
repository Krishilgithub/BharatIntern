import requests
import json

def test_simple_backend():
    """Test the simple backend"""
    print("🧪 Testing Simple Backend")
    print("=" * 30)
    
    try:
        # Test health endpoint
        print("🏥 Testing health endpoint...")
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            health = response.json()
            print("✅ Health Response:")
            for key, value in health.items():
                print(f"   {key}: {value}")
            
            # Test resume analysis with a text file
            print("\n📄 Testing resume analysis...")
            
            # Create a test resume text file
            test_resume = """John Doe
Computer Science Student
Email: john.doe@email.com
Phone: (555) 123-4567

EDUCATION:
Bachelor of Technology in Computer Science
XYZ University, 2024
CGPA: 8.5/10.0

SKILLS:
- Programming Languages: Python, Java, JavaScript
- Web Technologies: HTML, CSS, React, Node.js
- Databases: MySQL, MongoDB
- Tools: Git, Docker, VS Code

PROJECTS:
1. E-commerce Website
   - Built using React and Node.js
   - Implemented user authentication and payment gateway

2. Data Analysis Dashboard
   - Created interactive visualizations using Python
   - Technologies: Python, Pandas, Matplotlib

EXPERIENCE:
Software Development Intern
ABC Company (Summer 2023)
- Developed web applications using React
- Collaborated with team of 5 developers
"""
            
            # Save test resume to file
            with open("test_resume.txt", "w", encoding="utf-8") as f:
                f.write(test_resume)
            
            # Test file upload
            with open("test_resume.txt", "rb") as f:
                files = {"file": ("test_resume.txt", f, "text/plain")}
                response = requests.post("http://localhost:8000/internship/analyze-resume", files=files, timeout=30)
            
            print(f"Analysis Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Analysis Response:")
                print(f"   Success: {result.get('success', False)}")
                print(f"   Filename: {result.get('filename', 'N/A')}")
                print(f"   Analysis Type: {result.get('analysis_type', 'N/A')}")
                
                # Show analysis details
                analysis_result = result.get('result', {})
                if analysis_result.get('success', False):
                    analysis = analysis_result.get('analysis', {})
                    print(f"   Overall Score: {analysis.get('overall_score', 'N/A')}")
                    print(f"   Technical Skills: {analysis.get('technical_skills', [])}")
                    print(f"   Has Education: {analysis.get('has_education', False)}")
                    print(f"   Has Experience: {analysis.get('has_experience', False)}")
                else:
                    print(f"   Error: {analysis_result.get('error', 'Unknown error')}")
            else:
                print(f"❌ Analysis failed: {response.text}")
            
            # Cleanup
            import os
            if os.path.exists("test_resume.txt"):
                os.remove("test_resume.txt")
            
        else:
            print(f"❌ Health check failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_simple_backend()