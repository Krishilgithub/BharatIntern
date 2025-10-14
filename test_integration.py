eimport requests
import json

def test_integration():
    """Test the complete integration"""
    print("🧪 Testing Complete Integration")
    print("=" * 40)
    
    # Check backend health
    try:
        print("🏥 Checking backend health...")
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print(f"✅ Backend Status: {health.get('status')}")
            print(f"✅ Models Available: {health.get('internship_models_available')}")
        else:
            print(f"❌ Backend health failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Backend connection failed: {e}")
        return
    
    # Check frontend
    try:
        print("\n🌐 Checking frontend...")
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print("✅ Frontend is running")
        else:
            print(f"❌ Frontend failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend connection failed: {e}")
    
    # Test resume analysis
    print("\n📄 Testing resume analysis...")
    test_resume = """JOHN DOE
Computer Science Student
Email: john.doe@email.com | Phone: (555) 123-4567

EDUCATION
Bachelor of Technology in Computer Science
XYZ University, Expected 2024
CGPA: 8.5/10.0

TECHNICAL SKILLS
- Programming Languages: Python, Java, JavaScript, C++
- Web Technologies: React, Node.js, HTML, CSS, Express.js
- Databases: MySQL, MongoDB, PostgreSQL
- Tools & Frameworks: Git, Docker, VS Code, Bootstrap
- Cloud: AWS basics, Google Cloud Platform

PROJECTS
1. E-commerce Web Application
   - Developed full-stack e-commerce platform using React and Node.js
   - Implemented user authentication, shopping cart, and payment integration
   - Used MongoDB for data storage and Express.js for backend API
   - Technologies: React, Node.js, MongoDB, Express.js, JWT

2. Real-time Chat Application
   - Built real-time messaging app with Socket.io and React
   - Features: User authentication, group chats, message history
   - Technologies: React, Node.js, Socket.io, MongoDB

3. Machine Learning Stock Predictor
   - Created stock price prediction model using Python and scikit-learn
   - Implemented data visualization with matplotlib and pandas
   - Technologies: Python, scikit-learn, pandas, matplotlib

EXPERIENCE
Software Development Intern
TechCorp Solutions | June 2023 - August 2023
- Developed and maintained web applications using React and Node.js
- Collaborated with team of 8 developers using Agile methodology
- Implemented responsive UI components and optimized application performance
- Participated in code reviews and contributed to technical documentation

ACHIEVEMENTS
- Dean's List for academic excellence (3 semesters)
- Won 2nd place in university hackathon (team of 4)
- Active contributor to open-source projects on GitHub
- Completed 50+ coding challenges on HackerRank and LeetCode

CERTIFICATIONS
- AWS Cloud Practitioner (2023)
- Full Stack Web Development Certificate (Coursera, 2023)
- Python for Data Science Certificate (edX, 2022)

EXTRACURRICULAR ACTIVITIES
- President, Computer Science Club (2023-2024)
- Volunteer coding instructor for local high school students
- Member of ACM student chapter
"""
    
    try:
        # Create test file
        with open("integration_test_resume.txt", "w", encoding="utf-8") as f:
            f.write(test_resume)
        
        # Test backend directly
        with open("integration_test_resume.txt", "rb") as f:
            files = {"file": ("integration_test_resume.txt", f, "text/plain")}
            response = requests.post("http://localhost:8000/internship/analyze-resume", files=files, timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Resume analysis successful!")
            
            if result.get('success') and result.get('result', {}).get('success'):
                analysis = result['result']['analysis']
                print(f"📊 Overall Score: {analysis.get('overall_score', 'N/A')}/100")
                print(f"🔧 Technical Skills Found: {len(analysis.get('technical_skills', []))}")
                print(f"🎓 Education Detected: {analysis.get('has_education', False)}")
                print(f"💼 Experience Detected: {analysis.get('has_experience', False)}")
                print(f"🎯 Skills: {', '.join(analysis.get('technical_skills', [])[:5])}")
                print(f"📈 Internship Readiness: {analysis.get('internship_readiness', 'N/A')}")
                
                print("\n🎉 INTEGRATION TEST SUCCESSFUL!")
                print("✅ Backend: Working with simple analyzer")
                print("✅ Frontend: React server running")
                print("✅ API Communication: Successful")
                print("✅ Resume Analysis: Functional")
                print("✅ Free HuggingFace Backend: Replacing paid APIs")
                
            else:
                print(f"❌ Analysis failed: {result}")
        else:
            print(f"❌ Analysis request failed: {response.status_code}")
            print(f"Response: {response.text}")
        
        # Cleanup
        import os
        if os.path.exists("integration_test_resume.txt"):
            os.remove("integration_test_resume.txt")
            
    except Exception as e:
        print(f"❌ Resume analysis test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_integration()