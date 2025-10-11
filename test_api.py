import requests
import json

# Test the resume analyzer API
def test_resume_analyzer():
    url = "http://localhost:5000/internship/analyze-resume"
    
    # Read the test resume file
    with open("test_resume.txt", "r", encoding="utf-8") as file:
        resume_content = file.read()
    
    # Create a file-like object for the API
    files = {
        'file': ('test_resume.txt', resume_content, 'text/plain')
    }
    
    try:
        print("🚀 Testing Resume Analyzer API...")
        print(f"📡 Making POST request to: {url}")
        
        response = requests.post(url, files=files, timeout=30)
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Analysis successful!")
            print("📋 Response structure:")
            print(json.dumps(result, indent=2)[:1000] + "..." if len(json.dumps(result, indent=2)) > 1000 else json.dumps(result, indent=2))
            
            # Extract key information
            if 'analysis' in result:
                analysis = result['analysis']
                print(f"\n🎯 Overall Score: {analysis.get('overall_score', 'N/A')}")
                print(f"🤖 Model Used: {result.get('model_used', 'N/A')}")
                print(f"🔍 Source: {result.get('source', 'N/A')}")
                print(f"📄 Input Length: {result.get('input_length', 'N/A')} characters")
                
                # Show raw response preview
                if 'raw_response' in result:
                    print(f"\n📝 AI Response Preview:")
                    print(result['raw_response'][:500] + "..." if len(result['raw_response']) > 500 else result['raw_response'])
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Error testing API: {e}")

if __name__ == "__main__":
    test_resume_analyzer()