import requests
import json

def test_backend_connection():
    """Test if the backend server is running and responsive"""
    try:
        print("🔄 Testing backend connection...")
        response = requests.get("http://localhost:8000/health", timeout=5)
        
        if response.status_code == 200:
            print("✅ Backend is running and responsive!")
            health_data = response.json()
            print(f"📊 Health status: {json.dumps(health_data, indent=2)}")
            return True
        else:
            print(f"❌ Backend returned status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend. Is the server running?")
        print("💡 Start the backend with: cd backend && python main.py")
        return False
    except Exception as e:
        print(f"❌ Error testing backend: {e}")
        return False

def test_resume_analysis_endpoint():
    """Test the resume analysis endpoint with sample data"""
    try:
        print("\n🔄 Testing resume analysis endpoint...")
        
        # Create a simple test file
        test_content = "John Doe\nSoftware Developer\nSkills: Python, JavaScript, React\nEducation: Computer Science"
        
        # Create a mock file for testing
        files = {
            'file': ('test_resume.txt', test_content, 'text/plain')
        }
        
        response = requests.post(
            "http://localhost:8000/internship/analyze-resume", 
            files=files,
            timeout=30
        )
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Resume analysis endpoint working!")
            print(f"🔍 Response preview: {json.dumps(result, indent=2)[:500]}...")
            return True
        else:
            print(f"❌ Resume analysis failed with status: {response.status_code}")
            print(f"📄 Response text: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing resume analysis: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting backend integration tests...\n")
    
    # Test 1: Basic connection
    backend_ok = test_backend_connection()
    
    if backend_ok:
        # Test 2: Resume analysis endpoint
        test_resume_analysis_endpoint()
    else:
        print("\n💡 Please start the backend server first:")
        print("   cd backend")
        print("   python main.py")
    
    print("\n🏁 Test complete!")