"""Base abstract class for all AI models"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import asyncio
from .config import config

class BaseAIModel(ABC):
    """Abstract base class for all AI models"""
    
    def __init__(self, model_name: str):
        self.model_name = model_name
        self.config = config
        self.logger = config.logger
        self.is_initialized = False
        
    @abstractmethod
    async def initialize(self) -> bool:
        """Initialize the model"""
        pass
    
    @abstractmethod
    async def process(self, input_data: Any) -> Dict[str, Any]:
        """Process input data"""
        pass
    
    @abstractmethod
    def validate_input(self, input_data: Any) -> bool:
        """Validate input data"""
        pass
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model information"""
        return {
            "model_name": self.model_name,
            "is_initialized": self.is_initialized,
            "config": self.config.__dict__
        }
    
    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on the model"""
        try:
            if not self.is_initialized:
                await self.initialize()
            
            return {
                "status": "healthy",
                "model_name": self.model_name,
                "initialized": self.is_initialized
            }
        except Exception as e:
            self.logger.error(f"Health check failed for {self.model_name}: {e}")
            return {
                "status": "unhealthy",
                "model_name": self.model_name,
                "error": str(e)
            }