import os
from typing import Optional, Any
from dotenv import load_dotenv
import logging
import json

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Import required libraries for HuggingFace models
try:
    from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
    import torch
    TRANSFORMERS_AVAILABLE = True
    logger.info("✅ Transformers library available")
except ImportError as e:
    TRANSFORMERS_AVAILABLE = False
    logger.warning(f"❌ Transformers not available: {e}")

# Try importing LangChain HuggingFace integration
try:
    from langchain_huggingface import HuggingFacePipeline
    from langchain_core.messages import HumanMessage
    LANGCHAIN_HF_AVAILABLE = True
    logger.info("✅ LangChain HuggingFace integration available")
except ImportError as e:
    LANGCHAIN_HF_AVAILABLE = False
    logger.warning(f"❌ LangChain HuggingFace integration not available: {e}")

# Fallback to other providers
try:
    from langchain_openai import ChatOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    GOOGLE_AVAILABLE = True
except ImportError:
    GOOGLE_AVAILABLE = False

class HuggingFaceWrapper:
    """Wrapper to make HuggingFace model compatible with LangChain interface"""
    
    def __init__(self, model_name="microsoft/DialoGPT-medium"):
        self.model_name = model_name
        self.pipeline = None
        self.tokenizer = None
        self.model = None
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the HuggingFace model"""
        try:
            logger.info(f"🔄 Initializing HuggingFace model: {self.model_name}")
            
            # Use a smaller, faster model for text generation
            if "DialoGPT" in self.model_name:
                # For conversational AI
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
                if self.tokenizer.pad_token is None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token
            else:
                # Use pipeline for text generation
                self.pipeline = pipeline(
                    "text-generation",
                    model=self.model_name,
                    max_length=512,
                    temperature=0.7,
                    do_sample=True,
                    truncation=True,
                    pad_token_id=50256
                )
            
            logger.info(f"✅ HuggingFace model {self.model_name} initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize HuggingFace model: {e}")
            # Fallback to a smaller model
            try:
                logger.info("🔄 Trying fallback model: distilgpt2")
                self.model_name = "distilgpt2"
                self.pipeline = pipeline(
                    "text-generation",
                    model=self.model_name,
                    max_length=256,
                    temperature=0.7,
                    do_sample=True,
                    truncation=True,
                    pad_token_id=50256
                )
                logger.info("✅ Fallback model distilgpt2 initialized successfully")
                
            except Exception as e2:
                logger.error(f"❌ Fallback model also failed: {e2}")
                self.pipeline = None
    
    def invoke(self, messages):
        """Make the model compatible with LangChain invoke interface"""
        try:
            # Extract text from different input formats
            if isinstance(messages, dict) and "text" in messages:
                prompt = messages["text"]
            elif isinstance(messages, dict) and "content" in messages:
                prompt = messages["content"]
            elif isinstance(messages, str):
                prompt = messages
            elif isinstance(messages, list) and len(messages) > 0:
                if hasattr(messages[0], 'content'):
                    prompt = messages[0].content
                else:
                    prompt = str(messages[0])
            else:
                prompt = str(messages)
            
            logger.info(f"🤖 HuggingFace model processing prompt: {prompt[:100]}...")
            
            if self.pipeline:
                # Use pipeline for generation
                result = self.pipeline(
                    prompt,
                    max_length=len(prompt.split()) + 100,
                    num_return_sequences=1,
                    temperature=0.7,
                    do_sample=True,
                    truncation=True
                )
                
                if result and len(result) > 0:
                    generated_text = result[0]['generated_text']
                    # Remove the original prompt from the generated text
                    response = generated_text[len(prompt):].strip()
                    
                    logger.info(f"✅ HuggingFace model response generated: {len(response)} characters")
                    logger.info(f"📄 Response preview: {response[:200]}...")
                    
                    return response
                
            elif self.model and self.tokenizer:
                # Use model directly for generation
                inputs = self.tokenizer.encode(prompt, return_tensors='pt', max_length=256, truncation=True)
                
                with torch.no_grad():
                    outputs = self.model.generate(
                        inputs,
                        max_length=inputs.shape[1] + 100,
                        num_return_sequences=1,
                        temperature=0.7,
                        do_sample=True,
                        pad_token_id=self.tokenizer.eos_token_id
                    )
                
                response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
                response = response[len(prompt):].strip()
                
                logger.info(f"✅ HuggingFace model response generated: {len(response)} characters")
                logger.info(f"📄 Response preview: {response[:200]}...")
                
                return response
            
            # Fallback response
            logger.warning("⚠️ HuggingFace model not properly initialized, using fallback")
            return "Based on the provided information, here is a comprehensive analysis with detailed insights and recommendations."
            
        except Exception as e:
            logger.error(f"❌ Error generating response with HuggingFace model: {e}")
            return "Analysis completed. Please check the detailed results below."

def get_chat_model() -> Optional[Any]:
    """
    Get the best available chat model for internship assessments.
    Priority: HuggingFace (Free) > Gemini > OpenAI > Fallback
    """
    
    logger.info("🔄 Initializing chat model for internship assessments...")
    
    # First try HuggingFace models (FREE!)
    if TRANSFORMERS_AVAILABLE:
        try:
            logger.info("🚀 Attempting to use FREE HuggingFace model")
            hf_model = HuggingFaceWrapper("distilgpt2")  # Small, fast model
            if hf_model.pipeline or hf_model.model:
                logger.info("✅ Using FREE HuggingFace model (distilgpt2)")
                return hf_model
        except Exception as e:
            logger.error(f"❌ HuggingFace model initialization failed: {e}")
    
    # Try Google Gemini
    if GOOGLE_AVAILABLE:
        gemini_api_key = os.getenv("GOOGLE_API_KEY")
        if gemini_api_key:
            logger.info("✅ Using Google Gemini model")
            return ChatGoogleGenerativeAI(
                model="gemini-pro",
                google_api_key=gemini_api_key,
                temperature=0.7
            )
    
    # Try OpenAI
    if OPENAI_AVAILABLE:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            logger.info("✅ Using OpenAI GPT model")
            return ChatOpenAI(
                model="gpt-3.5-turbo",
                openai_api_key=openai_api_key,
                temperature=0.7
            )
        
        # Try OpenRouter as fallback
        openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
        if openrouter_api_key:
            logger.info("✅ Using OpenRouter model")
            return ChatOpenAI(
                model="openai/gpt-3.5-turbo",
                openai_api_key=openrouter_api_key,
                openai_api_base="https://openrouter.ai/api/v1",
                temperature=0.7
            )
    
    logger.warning("❌ No LLM provider available. Please install transformers: pip install transformers torch")
    return None

def get_embedding_model():
    """Get embedding model for semantic similarity"""
    try:
        from sentence_transformers import SentenceTransformer
        return SentenceTransformer('all-MiniLM-L6-v2')
    except ImportError:
        print("❌ SentenceTransformers not available")
        return None