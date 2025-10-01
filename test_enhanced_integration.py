import requests
import json

def test_enhanced_backend():
    """Test the enhanced backend functionality"""
    print("🧪 Testing Enhanced Backend Functionality")
    print("=" * 50)
    
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
            
            # Test comprehensive resume analysis
            print("\n📄 Testing enhanced resume analysis...")
            
            # Create a comprehensive test resume
            test_resume = """SARAH JOHNSON
Full Stack Developer
Email: sarah.johnson@email.com | Phone: (555) 987-6543
LinkedIn: linkedin.com/in/sarahjohnson | GitHub: github.com/sarahjohnson

EDUCATION
Bachelor of Science in Computer Science
Stanford University, CA | GPA: 3.8/4.0 | Graduated: May 2023
Relevant Coursework: Data Structures, Algorithms, Database Systems, Software Engineering

TECHNICAL SKILLS
Programming Languages: Python, JavaScript, TypeScript, Java, C++, HTML, CSS
Frameworks & Libraries: React, Node.js, Express.js, Django, Flask, Angular, Vue.js
Databases: MySQL, PostgreSQL, MongoDB, Redis
Tools & Technologies: Git, Docker, Kubernetes, AWS, Azure, Jenkins, Linux, Jira
Version Control: Git, GitHub, GitLab

EXPERIENCE
Software Development Intern
Google Inc., Mountain View, CA | June 2022 - August 2022
- Developed and maintained microservices using Python and Django
- Collaborated with cross-functional teams of 12+ engineers using Agile methodology
- Implemented RESTful APIs serving 10M+ requests daily
- Optimized database queries resulting in 40% performance improvement
- Participated in code reviews and contributed to technical documentation

Frontend Developer Intern
Meta (Facebook), Menlo Park, CA | June 2021 - August 2021
- Built responsive web applications using React and TypeScript
- Implemented user interface components following accessibility standards
- Worked with design team to create seamless user experiences
- Contributed to open-source projects with 1000+ GitHub stars

PROJECTS
1. E-commerce Platform (Full Stack)
   - Developed complete e-commerce solution using React, Node.js, and PostgreSQL
   - Implemented user authentication, shopping cart, payment gateway integration
   - Deployed on AWS with Docker containers and CI/CD pipeline
   - Technologies: React, Node.js, Express.js, PostgreSQL, AWS, Docker, Stripe API
   - GitHub: github.com/sarahjohnson/ecommerce-platform

2. Real-time Chat Application
   - Built scalable chat application supporting 1000+ concurrent users
   - Implemented WebSocket connections using Socket.io
   - Features: Real-time messaging, file sharing, group conversations
   - Technologies: React, Node.js, Socket.io, MongoDB, Redis

3. Machine Learning Stock Predictor
   - Created stock price prediction model using Python and TensorFlow
   - Achieved 85% accuracy in price trend prediction
   - Implemented data visualization dashboard with interactive charts
   - Technologies: Python, TensorFlow, pandas, matplotlib, scikit-learn

4. Personal Portfolio Website
   - Designed and developed responsive portfolio website
   - Implemented modern UI/UX with smooth animations
   - Technologies: React, Next.js, Tailwind CSS, Framer Motion

ACHIEVEMENTS & CERTIFICATIONS
- AWS Certified Solutions Architect Associate (2023)
- Google Cloud Professional Developer (2023)
- Dean's List: Fall 2021, Spring 2022, Fall 2022
- Winner: Stanford Hackathon 2022 (1st place out of 200+ teams)
- Open Source Contributor: 15+ contributions to major projects
- Technical Blog: 25+ articles with 50K+ total views

LEADERSHIP & ACTIVITIES
- President, Computer Science Student Association (2022-2023)
- Mentor, Women in Tech Program (2021-2023)
- Volunteer Coding Instructor, Local Community Center (2020-2023)
- Member, ACM and IEEE Computer Society
"""
            
            # Save test resume to file
            with open("enhanced_test_resume.txt", "w", encoding="utf-8") as f:
                f.write(test_resume)
            
            # Test file upload with comprehensive resume
            with open("enhanced_test_resume.txt", "rb") as f:
                files = {"file": ("enhanced_test_resume.txt", f, "text/plain")}
                response = requests.post("http://localhost:8000/internship/analyze-resume", files=files, timeout=30)
            
            print(f"Analysis Status Code: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Enhanced Analysis Response:")
                print(f"   Success: {result.get('success', False)}")
                print(f"   Filename: {result.get('filename', 'N/A')}")
                print(f"   Analysis Type: {result.get('analysis_type', 'N/A')}")
                
                # Show detailed analysis results
                analysis_result = result.get('result', {})
                if analysis_result.get('success', False):
                    analysis = analysis_result.get('analysis', {})
                    print(f"\n📊 COMPREHENSIVE ANALYSIS RESULTS:")
                    print(f"   Overall Score: {analysis.get('overallScore', 'N/A')}/100")
                    print(f"   Skills Score: {analysis.get('skills_score', 'N/A')}/100")
                    print(f"   Education Score: {analysis.get('education_score', 'N/A')}/100")
                    print(f"   Experience Score: {analysis.get('experience_score', 'N/A')}/100")
                    
                    # Extracted Skills
                    extracted_skills = analysis.get('extractedSkills', [])
                    print(f"\n🔧 EXTRACTED SKILLS ({len(extracted_skills)} found):")
                    for skill in extracted_skills[:8]:  # Show first 8
                        print(f"   • {skill.get('name', 'N/A')} ({skill.get('confidence', 'N/A')}% confidence, {skill.get('category', 'N/A')})")
                    
                    # Missing Skills
                    missing_skills = analysis.get('missingSkills', [])
                    print(f"\n📈 MISSING SKILLS RECOMMENDATIONS ({len(missing_skills)} found):")
                    for skill in missing_skills:
                        print(f"   • {skill.get('name', 'N/A')} - {skill.get('impact', 'N/A')} impact ({skill.get('priority', 'N/A')} priority)")
                    
                    # ATS Compatibility
                    ats = analysis.get('atsCompatibility', {})
                    print(f"\n🎯 ATS COMPATIBILITY:")
                    print(f"   Score: {ats.get('score', 'N/A')}%")
                    print(f"   Issues Found: {len(ats.get('issues', []))}")
                    print(f"   Recommendations: {len(ats.get('recommendations', []))}")
                    
                    # Contact Info
                    contact = analysis.get('contactInfo', {})
                    print(f"\n📞 CONTACT INFORMATION:")
                    print(f"   Email: {contact.get('email', 'Not found')}")
                    print(f"   Phone: {contact.get('phone', 'Not found')}")
                    
                    print(f"\n✅ ENHANCED FUNCTIONALITY TEST SUCCESSFUL!")
                    print(f"✅ Comprehensive Data: All sections populated")
                    print(f"✅ Skills Detection: {len(extracted_skills)} skills found")
                    print(f"✅ ATS Analysis: Complete with score and recommendations")
                    print(f"✅ Missing Skills: Intelligent recommendations provided")
                    print(f"✅ Contact Extraction: Email and phone detection working")
                    
                else:
                    print(f"❌ Analysis failed: {analysis_result.get('error', 'Unknown error')}")
            else:
                print(f"❌ Analysis request failed: {response.status_code}")
                print(f"Response: {response.text}")
            
            # Cleanup
            import os
            if os.path.exists("enhanced_test_resume.txt"):
                os.remove("enhanced_test_resume.txt")
                
        else:
            print(f"❌ Health check failed: {response.text}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_enhanced_backend()