import requests
import json

def test_huggingface_backend():
    """Test the HuggingFace backend integration"""
    
    print("🚀 Testing HuggingFace Backend Integration")
    print("=" * 50)
    
    # Test 1: Health check
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            health = response.json()
            print("✅ Backend Health Check:")
            print(f"   Status: {health.get('status', 'unknown')}")
            print(f"   Models Available: {health.get('internship_models_available', 'unknown')}")
            print(f"   Version: {health.get('version', 'unknown')}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False
    
    # Test 2: Resume analysis
    print("\n🔍 Testing Resume Analysis with HuggingFace...")
    
    sample_resume = """
    John Smith
    Software Developer
    Email: john@email.com | Phone: (555) 123-4567
    
    EXPERIENCE
    - 2 years as Junior Developer at Tech Corp
    - Built web applications using React and Node.js
    - Worked with databases and API development
    
    EDUCATION
    - Bachelor's in Computer Science
    - Relevant coursework: Data Structures, Algorithms, Web Development
    
    SKILLS
    - Programming: JavaScript, Python, Java
    - Web: React, HTML, CSS, Node.js
    - Database: MySQL, MongoDB
    - Tools: Git, VS Code
    """
    
    try:
        # Create a test file
        files = {
            'file': ('test_resume.txt', sample_resume, 'text/plain')
        }
        
        response = requests.post(
            "http://localhost:8000/internship/analyze-resume",
            files=files,
            timeout=30
        )
        
        print(f"📊 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Resume Analysis Success!")
            print(f"   Success: {result.get('success', False)}")
            print(f"   Filename: {result.get('filename', 'unknown')}")
            print(f"   Analysis Type: {result.get('analysis_type', 'unknown')}")
            
            # Show analysis result preview
            analysis_result = result.get('result', {})
            if isinstance(analysis_result, dict):
                print(f"   Model Used: {analysis_result.get('model_used', 'unknown')}")
                print(f"   Source: {analysis_result.get('source', 'unknown')}")
                analysis = analysis_result.get('analysis', '')
                if isinstance(analysis, str):
                    print(f"   Analysis Preview: {analysis[:200]}...")
                else:
                    print(f"   Analysis: {str(analysis)[:200]}...")
            else:
                print(f"   Result: {str(analysis_result)[:200]}...")
                
            print("\n🎯 Full Response Structure:")
            print(json.dumps(result, indent=2)[:1000] + "..." if len(json.dumps(result, indent=2)) > 1000 else json.dumps(result, indent=2))
            
            return True
        else:
            print(f"❌ Resume analysis failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Resume analysis error: {e}")
        return False

if __name__ == "__main__":
    success = test_huggingface_backend()
    if success:
        print("\n🎉 HuggingFace Backend Integration Test PASSED!")
        print("✅ The backend is ready to replace paid APIs")
    else:
        print("\n❌ HuggingFace Backend Integration Test FAILED!")
        print("💡 Please check the backend logs for issues")