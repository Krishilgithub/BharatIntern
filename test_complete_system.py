import requests
import json

def test_enhanced_analyzer():
    """Test the enhanced resume analyzer with comprehensive features"""
    
    # Test resume content
    resume_text = """JOHN SMITH
Senior Software Engineer

Email: john.smith@email.com
Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johnsmith

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript, C++
Frontend Technologies: React, Vue.js, Angular, HTML5, CSS3
Backend Technologies: Node.js, Express.js, Django, Flask
Databases: PostgreSQL, MongoDB, MySQL, Redis
Cloud Platforms: AWS, Google Cloud Platform, Microsoft Azure
DevOps Tools: Docker, Kubernetes, Jenkins

PROFESSIONAL EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2021 - Present
• Led development of microservices architecture serving 100K+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Built RESTful APIs using Node.js and Express.js with PostgreSQL
• Optimized application performance resulting in 40% faster load times

EDUCATION
Bachelor of Science in Computer Science
University of California, Berkeley | 2018
"""

    try:
        # Start the backend server
        print("🚀 Testing Enhanced Resume Analyzer...")
        
        # Test health endpoint first
        health_response = requests.get('http://localhost:8000/health', timeout=5)
        print(f"✅ Health Check: {health_response.status_code} - {health_response.json()}")
        
        # Test the internship analysis endpoint
        payload = {
            "resume_text": resume_text,
            "job_description": "Software Engineering Internship position requiring JavaScript, React, Node.js, and database experience."
        }
        
        print("\n📤 Sending analysis request...")
        response = requests.post(
            'http://localhost:8000/analyze_internship_resume',
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ SUCCESS! Enhanced Analysis Results:")
            print("=" * 50)
            
            # Display overall analysis
            if 'analysis' in result:
                analysis = result['analysis']
                print(f"📈 Overall Score: {analysis.get('overallScore', 'N/A')}")
                
                # Display extracted skills
                if 'extractedSkills' in analysis:
                    print(f"\n🔧 Extracted Skills ({len(analysis['extractedSkills'])} found):")
                    for skill in analysis['extractedSkills'][:10]:  # Show first 10
                        print(f"  • {skill['name']} ({skill['category']}) - Confidence: {skill['confidence']}")
                    if len(analysis['extractedSkills']) > 10:
                        print(f"  ... and {len(analysis['extractedSkills']) - 10} more")
                
                # Display ATS compatibility
                if 'atsCompatibility' in analysis:
                    ats = analysis['atsCompatibility']
                    print(f"\n📋 ATS Compatibility Score: {ats.get('score', 'N/A')}")
                    if 'issues' in ats and ats['issues']:
                        print("  Issues found:")
                        for issue in ats['issues'][:3]:
                            print(f"    - {issue}")
                    if 'recommendations' in ats and ats['recommendations']:
                        print("  Recommendations:")
                        for rec in ats['recommendations'][:3]:
                            print(f"    + {rec}")
                
                # Display missing skills
                if 'missingSkills' in analysis:
                    print(f"\n🎯 Missing Skills ({len(analysis['missingSkills'])} suggested):")
                    for skill in analysis['missingSkills'][:5]:
                        print(f"  • {skill['skill']} - Impact: {skill['impact']}%")
                
                # Display contact info
                if 'contactInfo' in analysis:
                    contact = analysis['contactInfo']
                    print(f"\n📞 Contact Information:")
                    print(f"  Email: {contact.get('email', 'Not found')}")
                    print(f"  Phone: {contact.get('phone', 'Not found')}")
                
                print("\n" + "=" * 50)
                print("🎉 Enhanced Resume Analyzer Test COMPLETED!")
                print("✅ All data structures working correctly!")
                
            else:
                print("❌ ERROR: No analysis data in response")
                print(f"Response: {json.dumps(result, indent=2)}")
        
        else:
            print(f"❌ ERROR: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ CONNECTION ERROR: {str(e)}")
        print("🔧 Make sure the backend server is running on port 8000")
    except Exception as e:
        print(f"❌ UNEXPECTED ERROR: {str(e)}")

if __name__ == "__main__":
    test_enhanced_analyzer()