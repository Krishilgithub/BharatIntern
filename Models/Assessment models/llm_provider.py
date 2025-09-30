import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables from current directory first, then from parent directories
load_dotenv()
load_dotenv('.env')
load_dotenv('../../.env')

# Debug: Print current working directory and check for .env files
print(f"Current working directory: {os.getcwd()}")
print(f"Local .env exists: {os.path.exists('.env')}")
print(f"Root .env exists: {os.path.exists('../../.env')}")

# Try importing LangChain OpenAI
try:
    from langchain_openai import ChatOpenAI
    print("✅ LangChain OpenAI imported successfully")
except ImportError as e:
    print(f"❌ LangChain OpenAI import failed: {e}")
    ChatOpenAI = None

def get_chat_model() -> Optional[object]:
    """
    Get OpenRouter chat model for question generation.
    Returns None if API key is not available.
    """
    # OpenRouter API key
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
    print(f"API key found: {openrouter_api_key is not None}")
    if openrouter_api_key:
        print(f"API key preview: {openrouter_api_key[:15]}...")
    
    if openrouter_api_key and ChatOpenAI is not None:
        try:
            model = ChatOpenAI(
                api_key=openrouter_api_key,
                base_url="https://openrouter.ai/api/v1",
                model="microsoft/phi-3-mini-128k-instruct",
                temperature=0.7,
                max_tokens=2000,
            )
            print("✅ OpenRouter model initialized successfully")
            return model
        except Exception as e:
            print(f"❌ OpenRouter initialization failed: {e}")
            return None
    
    print("❌ No OpenRouter API key found or ChatOpenAI not available")
    return None

if __name__ == "__main__":
    model = get_chat_model()
    if model:
        print("🎉 Model is ready!")
        # Test a simple call
        try:
            response = model.invoke("Say 'Hello World' in exactly 2 words.")
            print(f"Test response: {response}")
        except Exception as e:
            print(f"Test call failed: {e}")
    else:
        print("❌ Model initialization failed!")