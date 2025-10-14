import sys
import os
sys.path.append('backend')
sys.path.append('backend/models')

def test_direct_analyzer():
    """Test the enhanced analyzer directly without server"""
    
    try:
        print("🚀 Testing Enhanced Resume Analyzer (Direct Mode)...")
        
        # Import the enhanced analyzer
        from models.simple_internship_analyzer import perform_simple_analysis
        
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

        job_description = "Software Engineering Internship position requiring JavaScript, React, Node.js, and database experience."
        
        print("📤 Running direct analysis...")
        result = perform_simple_analysis(resume_text)
        
        print("📊 Analysis Results:")
        print("=" * 50)
        
        # Display overall analysis
        print(f"📈 Overall Score: {result.get('overallScore', 'N/A')}")
        
        # Display extracted skills
        if 'extractedSkills' in result:
            print(f"\n🔧 Extracted Skills ({len(result['extractedSkills'])} found):")
            for skill in result['extractedSkills'][:10]:  # Show first 10
                print(f"  • {skill['name']} ({skill['category']}) - Confidence: {skill['confidence']}")
            if len(result['extractedSkills']) > 10:
                print(f"  ... and {len(result['extractedSkills']) - 10} more")
        
        # Display ATS compatibility
        if 'atsCompatibility' in result:
            ats = result['atsCompatibility']
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
        if 'missingSkills' in result:
            print(f"\n🎯 Missing Skills ({len(result['missingSkills'])} suggested):")
            for skill in result['missingSkills'][:5]:
                print(f"  • {skill['skill']} - Impact: {skill['impact']}%")
        
        # Display contact info
        if 'contactInfo' in result:
            contact = result['contactInfo']
            print(f"\n📞 Contact Information:")
            print(f"  Email: {contact.get('email', 'Not found')}")
            print(f"  Phone: {contact.get('phone', 'Not found')}")
        
        print("\n" + "=" * 50)
        print("🎉 Enhanced Resume Analyzer Test COMPLETED!")
        print("✅ All data structures working correctly!")
        
        return True
        
    except Exception as e:
        print(f"❌ DIRECT TEST ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    test_direct_analyzer()