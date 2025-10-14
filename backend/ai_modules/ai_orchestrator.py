"""Main AI Service Orchestrator - coordinates all AI modules"""
from typing import Dict, Any, List, Optional
import asyncio
from .config import config
from .nlp_processor import NLPProcessor
from .resume_analyzer import ResumeAnalyzer
from .matching_engine import MatchingEngine
from .interview_assessor import InterviewAssessor
from .coding_profile_integrator import CodingProfileIntegrator
from .fraud_detector import FraudDetector
from .analytics_engine import AnalyticsEngine

class AIServiceOrchestrator:
    """
    Main orchestrator class that coordinates all AI modules
    This is the single entry point for all AI operations
    """
    
    def __init__(self):
        self.config = config
        self.logger = config.logger
        
        # Initialize all AI modules
        self.nlp_processor = NLPProcessor()
        self.resume_analyzer = ResumeAnalyzer()
        self.matching_engine = MatchingEngine()
        self.interview_assessor = InterviewAssessor()
        self.coding_profile_integrator = CodingProfileIntegrator()
        self.fraud_detector = FraudDetector()
        self.analytics_engine = AnalyticsEngine()
        
        self.modules = {
            "nlp_processor": self.nlp_processor,
            "resume_analyzer": self.resume_analyzer,
            "matching_engine": self.matching_engine,
            "interview_assessor": self.interview_assessor,
            "coding_profile_integrator": self.coding_profile_integrator,
            "fraud_detector": self.fraud_detector,
            "analytics_engine": self.analytics_engine
        }
        
        self.is_initialized = False
    
    async def initialize_all_modules(self) -> Dict[str, bool]:
        """Initialize all AI modules"""
        self.logger.info("🚀 Initializing AI Service Orchestrator...")
        
        # Validate configuration first
        if not self.config.validate_config():
            self.logger.error("❌ Configuration validation failed")
            return {"error": "Invalid configuration"}
        
        initialization_results = {}
        
        # Initialize modules in parallel for better performance
        tasks = []
        for module_name, module in self.modules.items():
            tasks.append(self._initialize_module(module_name, module))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        for i, (module_name, _) in enumerate(self.modules.items()):
            if isinstance(results[i], Exception):
                initialization_results[module_name] = False
                self.logger.error(f"❌ Failed to initialize {module_name}: {results[i]}")
            else:
                initialization_results[module_name] = results[i]
                status = "✅" if results[i] else "❌"
                self.logger.info(f"{status} {module_name}: {'Initialized' if results[i] else 'Failed'}")
        
        # Check if core modules are initialized
        core_modules = ["nlp_processor", "resume_analyzer", "matching_engine"]
        core_initialized = all(initialization_results.get(module, False) for module in core_modules)
        
        self.is_initialized = core_initialized
        
        if self.is_initialized:
            self.logger.info("🎉 AI Service Orchestrator initialized successfully!")
        else:
            self.logger.error("⚠️ AI Service Orchestrator partially initialized - some core modules failed")
        
        return initialization_results
    
    async def _initialize_module(self, module_name: str, module) -> bool:
        """Initialize a single module"""
        try:
            return await module.initialize()
        except Exception as e:
            self.logger.error(f"Error initializing {module_name}: {e}")
            return False
    
    # =============================================================================
    # HIGH-LEVEL API METHODS (Easy to use from FastAPI)
    # =============================================================================
    
    async def analyze_resume_complete(self, resume_text: str) -> Dict[str, Any]:
        """
        Complete resume analysis pipeline
        Returns: comprehensive resume analysis with skills, experience, score, etc.
        """
        try:
            if not self.resume_analyzer.is_initialized:
                await self.resume_analyzer.initialize()
            
            return await self.resume_analyzer.process(resume_text)
            
        except Exception as e:
            self.logger.error(f"Error in complete resume analysis: {e}")
            return {"error": str(e)}
    
    async def match_candidates_to_jobs_complete(self, candidates: List[Dict], jobs: List[Dict]) -> Dict[str, Any]:
        """
        Complete candidate-job matching pipeline
        Returns: detailed matching results with scores and recommendations
        """
        try:
            if not self.matching_engine.is_initialized:
                await self.matching_engine.initialize()
            
            input_data = {"candidates": candidates, "jobs": jobs}
            return await self.matching_engine.process(input_data)
            
        except Exception as e:
            self.logger.error(f"Error in complete matching: {e}")
            return {"error": str(e)}
    
    async def assess_interview_complete(self, transcript: str, questions: List[str] = None) -> Dict[str, Any]:
        """
        Complete interview assessment pipeline
        Returns: comprehensive interview analysis with scores and recommendations
        """
        try:
            if not self.interview_assessor.is_initialized:
                await self.interview_assessor.initialize()
            
            input_data = {"transcript": transcript, "questions": questions or []}
            return await self.interview_assessor.process(input_data)
            
        except Exception as e:
            self.logger.error(f"Error in interview assessment: {e}")
            return {"error": str(e)}
    
    async def integrate_coding_profiles_complete(self, github_username: str = None, leetcode_username: str = None) -> Dict[str, Any]:
        """
        Complete coding profile integration
        Returns: comprehensive coding profile analysis with scores
        """
        try:
            if not self.coding_profile_integrator.is_initialized:
                await self.coding_profile_integrator.initialize()
            
            input_data = {}
            if github_username:
                input_data["github_username"] = github_username
            if leetcode_username:
                input_data["leetcode_username"] = leetcode_username
            
            return await self.coding_profile_integrator.process(input_data)
            
        except Exception as e:
            self.logger.error(f"Error in coding profile integration: {e}")
            return {"error": str(e)}
    
    async def detect_fraud_and_bias_complete(self, candidates: List[Dict]) -> Dict[str, Any]:
        """
        Complete fraud detection and bias analysis
        Returns: fraud detection results and bias analysis with recommendations
        """
        try:
            if not self.fraud_detector.is_initialized:
                await self.fraud_detector.initialize()
            
            return await self.fraud_detector.process(candidates)
            
        except Exception as e:
            self.logger.error(f"Error in fraud detection: {e}")
            return {"error": str(e)}
    
    async def generate_analytics_report_complete(self, timeframe: str = "30d") -> Dict[str, Any]:
        """
        Generate complete analytics report
        Returns: comprehensive analytics with metrics and insights
        """
        try:
            if not self.analytics_engine.is_initialized:
                await self.analytics_engine.initialize()
            
            input_data = {"timeframe": timeframe}
            return await self.analytics_engine.process(input_data)
            
        except Exception as e:
            self.logger.error(f"Error generating analytics: {e}")
            return {"error": str(e)}
    
    # =============================================================================
    # DIRECT MODULE ACCESS (For advanced users)
    # =============================================================================
    
    def get_module(self, module_name: str):
        """Get direct access to a specific module"""
        return self.modules.get(module_name)
    
    def get_nlp_processor(self) -> NLPProcessor:
        """Get NLP processor module"""
        return self.nlp_processor
    
    def get_resume_analyzer(self) -> ResumeAnalyzer:
        """Get resume analyzer module"""
        return self.resume_analyzer
    
    def get_matching_engine(self) -> MatchingEngine:
        """Get matching engine module"""
        return self.matching_engine
    
    def get_interview_assessor(self) -> InterviewAssessor:
        """Get interview assessor module"""
        return self.interview_assessor
    
    def get_coding_profile_integrator(self) -> CodingProfileIntegrator:
        """Get coding profile integrator module"""
        return self.coding_profile_integrator
    
    def get_fraud_detector(self) -> FraudDetector:
        """Get fraud detector module"""
        return self.fraud_detector
    
    def get_analytics_engine(self) -> AnalyticsEngine:
        """Get analytics engine module"""
        return self.analytics_engine
    
    # =============================================================================
    # HEALTH CHECK AND STATUS
    # =============================================================================
    
    async def health_check(self) -> Dict[str, Any]:
        """Comprehensive health check of all modules"""
        health_status = {
            "orchestrator_status": "healthy" if self.is_initialized else "unhealthy",
            "modules": {},
            "overall_health": True
        }
        
        # Check each module
        for module_name, module in self.modules.items():
            try:
                module_health = await module.health_check()
                health_status["modules"][module_name] = module_health
                
                if module_health.get("status") != "healthy":
                    health_status["overall_health"] = False
                    
            except Exception as e:
                health_status["modules"][module_name] = {
                    "status": "error",
                    "error": str(e)
                }
                health_status["overall_health"] = False
        
        health_status["overall_status"] = "healthy" if health_status["overall_health"] else "degraded"
        
        return health_status
    
    def get_system_info(self) -> Dict[str, Any]:
        """Get comprehensive system information"""
        return {
            "orchestrator_initialized": self.is_initialized,
            "total_modules": len(self.modules),
            "initialized_modules": sum(1 for module in self.modules.values() if module.is_initialized),
            "module_status": {
                name: {
                    "initialized": module.is_initialized,
                    "model_name": module.model_name
                }
                for name, module in self.modules.items()
            },
            "configuration": {
                "gemini_api_configured": bool(self.config.GEMINI_API_KEY),
                "huggingface_api_configured": bool(self.config.HUGGINGFACE_API_KEY),
                "bert_model": self.config.BERT_MODEL_NAME,
                "spacy_model": self.config.SPACY_MODEL
            }
        }

# =============================================================================
# GLOBAL INSTANCE - Easy import for FastAPI
# =============================================================================

# Create global instance that can be imported and used
ai_orchestrator = AIServiceOrchestrator()

# Convenience functions for easy import
async def initialize_ai_services():
    """Initialize all AI services - call this on startup"""
    return await ai_orchestrator.initialize_all_modules()

async def analyze_resume(resume_text: str):
    """Quick resume analysis"""
    return await ai_orchestrator.analyze_resume_complete(resume_text)

async def match_candidates_to_jobs(candidates: List[Dict], jobs: List[Dict]):
    """Quick candidate-job matching"""
    return await ai_orchestrator.match_candidates_to_jobs_complete(candidates, jobs)

async def assess_interview(transcript: str, questions: List[str] = None):
    """Quick interview assessment"""
    return await ai_orchestrator.assess_interview_complete(transcript, questions)

async def get_system_health():
    """Quick health check"""
    return await ai_orchestrator.health_check()

async def get_analytics_report(timeframe: str = "30d"):
    """Quick analytics report"""
    return await ai_orchestrator.generate_analytics_report_complete(timeframe)