"""Configuration settings for AI modules"""
import os
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AIConfig:
    """Configuration class for AI services"""
    
    def __init__(self):
        # API Keys
        self.GEMINI_API_KEY = "AIzaSyB3mqrW7eJ8AMyBkXCve05_E9lp9ivM_Jo"
        self.HUGGINGFACE_API_KEY = "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"
        
        # Model configurations
        self.BERT_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
        self.SPACY_MODEL = "en_core_web_sm"
        
        # TF-IDF settings
        self.TFIDF_CONFIG = {
            "max_features": 1000,
            "stop_words": "english",
            "ngram_range": (1, 2)
        }
        
        # Fraud detection settings
        self.FRAUD_DETECTION_CONFIG = {
            "contamination": 0.1,
            "random_state": 42
        }
        
        # Logging
        self.logger = logger
    
    def validate_config(self) -> bool:
        """Validate configuration settings"""
        if not self.GEMINI_API_KEY or len(self.GEMINI_API_KEY) < 20:
            self.logger.warning("Gemini API key not properly configured")
            return False
        
        if not self.HUGGINGFACE_API_KEY or len(self.HUGGINGFACE_API_KEY) < 20:
            self.logger.warning("HuggingFace API key not properly configured")
            return False
            
        return True

# Global configuration instance
config = AIConfig()