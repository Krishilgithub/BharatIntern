#!/usr/bin/env python3
"""
Simple startup test for LangChain Matching Engine
Tests basic initialization and functionality
"""

import asyncio
import os
import sys
from typing import Dict, Any

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_modules.langchain_matching_engine import LangChainMatchingEngine

async def test_basic_functionality():
    """Test basic LangChain matching functionality"""
    print("🚀 Starting LangChain Matching Engine Basic Test...")
    
    # Check environment variables
    gemini_key = os.getenv('GEMINI_API_KEY')
    hf_token = os.getenv('HUGGINGFACE_API_TOKEN')
    
    print(f"🔑 Gemini API Key: {'✅ Set' if gemini_key else '❌ Not set'}")
    print(f"🔑 HuggingFace Token: {'✅ Set' if hf_token else '❌ Not set'}")
    
    if not gemini_key and not hf_token:
        print("⚠️  No API keys found. Please set GEMINI_API_KEY or HUGGINGFACE_API_TOKEN")
        print("   Example: export GEMINI_API_KEY=your_key_here")
        return False
    
    # Initialize engine
    print("\n🔧 Initializing LangChain Matching Engine...")
    engine = LangChainMatchingEngine()
    
    try:
        success = await engine.initialize()
        if success:
            print("✅ Engine initialized successfully!")
            
            # Get engine status
            status = engine.get_engine_status()
            print(f"📊 Engine Status: {status}")
            
            # Test with simple data
            print("\n🧪 Testing basic matching...")
            
            candidate = {
                "skills": ["Python", "JavaScript", "React"],
                "education": {"degree": "B.Tech", "field": "Computer Science"},
                "location": "Bangalore",
                "experience_years": 2.0
            }
            
            opportunity = {
                "required_skills": ["Python", "JavaScript", "React"],
                "industry": "Technology",
                "location": "Bangalore",
                "experience_level": "mid"
            }
            
            result = await engine.match_candidate_to_opportunity(candidate, opportunity)
            
            if result.get("success", False):
                print("✅ Matching test successful!")
                print(f"   Match Score: {result.get('match_score', 'N/A')}")
                print(f"   Fit Level: {result.get('fit_level', 'N/A')}")
                print(f"   API Type: {result.get('api_type', 'N/A')}")
                return True
            else:
                print(f"❌ Matching test failed: {result.get('error', 'Unknown error')}")
                return False
                
        else:
            print("❌ Failed to initialize engine")
            return False
            
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False

async def main():
    """Main test function"""
    try:
        success = await test_basic_functionality()
        if success:
            print("\n🎉 LangChain Matching Engine is working correctly!")
            print("📝 You can now use the REST API endpoints:")
            print("   - POST /langchain/match")
            print("   - POST /langchain/batch-match")
            print("   - GET /langchain/status")
            print("   - GET /langchain/sample-data")
            print("   - POST /langchain/test-match")
        else:
            print("\n❌ LangChain Matching Engine test failed")
            print("📝 Please check your API keys and network connectivity")
            
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
