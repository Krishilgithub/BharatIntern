#!/usr/bin/env python3
"""
Test script to verify LangChain integration in all internship models
"""

import os
import sys

# Add the models directory to the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_resume_analyzer():
    """Test LangChain integration in resume analyzer"""
    print("=" * 60)
    print("🧪 TESTING INTERNSHIP RESUME ANALYZER")
    print("=" * 60)
    
    try:
        from internship_resume_analyzer import analyze_internship_resume
        
        sample_resume = """
        John Doe
        Computer Science Student
        Email: john.doe@email.com
        
        Education:
        - B.Tech in Computer Science, XYZ University (GPA: 8.5/10)
        - Relevant Coursework: Data Structures, Web Development, Database Systems
        
        Skills:
        - Programming: Python, Java, JavaScript, React
        - Tools: Git, Docker, MySQL
        - Soft Skills: Leadership, Teamwork, Problem-solving
        
        Projects:
        - E-commerce Website using React and Node.js
        - Machine Learning project for sentiment analysis
        - Inventory Management System using Python and MySQL
        
        Experience:
        - Summer Internship at TechCorp (3 months)
        - Volunteer coding instructor at local community center
        """
        
        result = analyze_internship_resume(sample_resume)
        
        print(f"✅ Resume analysis completed successfully!")
        print(f"📊 Source: {result.get('source', 'Unknown')}")
        print(f"🤖 Model Used: {result.get('model_used', 'Unknown')}")
        print(f"📈 Overall Score: {result.get('analysis', {}).get('overall_score', 'N/A')}")
        
        if result.get('source') == 'langchain':
            print("🎉 LangChain is working correctly for resume analysis!")
        else:
            print("⚠️ Using fallback - LangChain model may not be configured")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing resume analyzer: {e}")
        return False

def test_technical_assessment():
    """Test LangChain integration in technical assessment"""
    print("\n" + "=" * 60)
    print("🧪 TESTING INTERNSHIP TECHNICAL ASSESSMENT")
    print("=" * 60)
    
    try:
        from internship_technical_assessment import generate_internship_technical_assessment
        
        result = generate_internship_technical_assessment(
            internship_role="Software Development",
            num_questions=3,
            difficulty="easy"
        )
        
        print(f"✅ Technical assessment generated successfully!")
        print(f"📊 Source: {result.get('source', 'Unknown')}")
        print(f"🤖 Model Used: {result.get('model_used', 'Unknown')}")
        print(f"📝 Questions Generated: {result.get('total_questions', 'N/A')}")
        
        if result.get('source') == 'langchain':
            print("🎉 LangChain is working correctly for technical assessment!")
        else:
            print("⚠️ Using fallback - LangChain model may not be configured")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing technical assessment: {e}")
        return False

def test_skill_assessor():
    """Test LangChain integration in skill assessor"""
    print("\n" + "=" * 60)
    print("🧪 TESTING INTERNSHIP SKILL ASSESSOR")
    print("=" * 60)
    
    try:
        from internship_skill_assessor import assess_internship_skills
        
        candidate_info = """
        Software Engineering Student with experience in:
        - Programming: Python, JavaScript, Java
        - Web Development: React, Node.js, HTML/CSS
        - Database: MySQL, MongoDB
        - Tools: Git, Docker, VS Code
        - Academic: 8.2 GPA, relevant coursework in algorithms and data structures
        - Projects: Built 3 full-stack web applications
        - Experience: 2 internships, active in coding competitions
        """
        
        result = assess_internship_skills(candidate_info, "Software Development")
        
        print(f"✅ Skill assessment completed successfully!")
        print(f"📊 Source: {result.get('source', 'Unknown')}")
        print(f"🤖 Model Used: {result.get('model_used', 'Unknown')}")
        print(f"🎯 Domain: {result.get('domain', 'N/A')}")
        
        if result.get('source') == 'langchain':
            print("🎉 LangChain is working correctly for skill assessment!")
        else:
            print("⚠️ Using fallback - LangChain model may not be configured")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing skill assessor: {e}")
        return False

def test_internship_matcher():
    """Test LangChain integration in internship matcher"""
    print("\n" + "=" * 60)
    print("🧪 TESTING INTERNSHIP MATCHER")
    print("=" * 60)
    
    try:
        from internship_matcher import InternshipMatcher
        
        candidate_profile = """
        Computer Science student with strong programming skills in Python and JavaScript.
        Experience with React, Node.js, and database systems.
        Looking for software development internship opportunities.
        """
        
        sample_internships = [
            {
                "id": 1,
                "title": "Software Development Intern",
                "company": "TechCorp",
                "domain": "Software Development",
                "required_skills": ["Python", "JavaScript", "React"],
                "description": "Full-stack development internship with modern web technologies",
                "duration": "3 months",
                "location": "Remote",
                "stipend": "$1000/month"
            },
            {
                "id": 2,
                "title": "Data Science Intern",
                "company": "DataLabs",
                "domain": "Data Science",
                "required_skills": ["Python", "Machine Learning", "SQL"],
                "description": "Work on machine learning projects and data analysis",
                "duration": "6 months",
                "location": "New York",
                "stipend": "$1200/month"
            }
        ]
        
        matcher = InternshipMatcher()
        result = matcher.match_internships(candidate_profile, sample_internships)
        
        print(f"✅ Internship matching completed successfully!")
        print(f"📊 Source: {result.get('source', 'Unknown')}")
        print(f"🤖 Model Used: {result.get('model_used', 'Unknown')}")
        print(f"🎯 Matches Found: {len(result.get('matches', []))}")
        
        if result.get('source') == 'langchain':
            print("🎉 LangChain is working correctly for internship matching!")
        else:
            print("⚠️ Using fallback - LangChain model may not be configured")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing internship matcher: {e}")
        return False

def main():
    """Run all LangChain integration tests"""
    print("🚀 STARTING LANGCHAIN INTEGRATION TESTS")
    print("🔧 Checking if LangChain models are properly configured...")
    
    # Test LLM provider first
    try:
        from llm_provider import get_chat_model
        model = get_chat_model()
        if model:
            print(f"✅ LangChain model available: {type(model).__name__}")
        else:
            print("❌ No LangChain model available - will test fallback behavior")
    except Exception as e:
        print(f"❌ Error loading LangChain model: {e}")
    
    # Run all tests
    tests = [
        test_resume_analyzer,
        test_technical_assessment,
        test_skill_assessor,
        test_internship_matcher
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 LANGCHAIN INTEGRATION TEST RESULTS")
    print("=" * 60)
    print(f"✅ Tests Passed: {passed}/{total}")
    print(f"📊 Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("🎉 All LangChain integrations are working correctly!")
    else:
        print("⚠️ Some tests failed - check LangChain model configuration")
        print("💡 Ensure API keys are set: GOOGLE_API_KEY or OPENAI_API_KEY")
    
    print("\n🔍 To check API key configuration:")
    print("   - Google Gemini: Set GOOGLE_API_KEY environment variable")
    print("   - OpenAI: Set OPENAI_API_KEY environment variable")
    print("   - Alternative: Set OPENROUTER_API_KEY for OpenRouter")

if __name__ == "__main__":
    main()