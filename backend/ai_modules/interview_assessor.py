"""Interview Assessment Module with Gemini AI integration"""
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from .base_model import BaseAIModel
from .nlp_processor import NLPProcessor

class InterviewAssessor(BaseAIModel):
    """AI-powered interview assessment using Gemini"""
    
    def __init__(self):
        super().__init__("Interview_Assessor")
        self.gemini_model = None
        self.nlp_processor = None
        
    async def initialize(self) -> bool:
        """Initialize the interview assessor"""
        try:
            self.logger.info("Initializing Interview Assessor...")
            
            # Configure Gemini
            genai.configure(api_key=self.config.GEMINI_API_KEY)
            self.gemini_model = genai.GenerativeModel('gemini-pro')
            
            # Initialize NLP processor
            self.nlp_processor = NLPProcessor()
            await self.nlp_processor.initialize()
            
            self.is_initialized = True
            self.logger.info("Interview Assessor initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize Interview Assessor: {e}")
            return False
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate interview input data"""
        if not isinstance(input_data, dict):
            return False
        return "transcript" in input_data or "audio_file" in input_data
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process interview assessment"""
        if not self.validate_input(input_data):
            return {"error": "Invalid input data"}
        
        try:
            # Get transcript
            transcript = input_data.get("transcript", "")
            if not transcript and "audio_file" in input_data:
                transcript = await self._transcribe_audio(input_data["audio_file"])
            
            # Analyze with Gemini
            assessment = await self._analyze_interview(transcript, input_data.get("questions", []))
            
            # Add NLP analysis
            nlp_analysis = await self.nlp_processor.process(transcript)
            
            return {
                "transcript": transcript,
                "ai_assessment": assessment,
                "nlp_analysis": nlp_analysis,
                "overall_score": assessment.get("overall_score", 0),
                "recommendations": assessment.get("recommendations", [])
            }
            
        except Exception as e:
            self.logger.error(f"Error processing interview: {e}")
            return {"error": str(e)}
    
    async def _transcribe_audio(self, audio_file: str) -> str:
        """Mock audio transcription - integrate with actual service"""
        return "Sample transcribed interview content."
    
    async def _analyze_interview(self, transcript: str, questions: List[str]) -> Dict[str, Any]:
        """Analyze interview using Gemini AI"""
        try:
            prompt = f"""
            Analyze this interview transcript and provide a comprehensive assessment:
            
            Questions: {', '.join(questions) if questions else 'General interview'}
            Transcript: {transcript}
            
            Provide assessment in this JSON format:
            {{
                "overall_score": <0-100>,
                "technical_competency": <0-10>,
                "communication_skills": <0-10>,
                "problem_solving": <0-10>,
                "cultural_fit": <0-10>,
                "strengths": ["strength1", "strength2"],
                "areas_for_improvement": ["area1", "area2"],
                "recommendations": ["rec1", "rec2"],
                "key_insights": "detailed analysis"
            }}
            """
            
            response = self.gemini_model.generate_content(prompt)
            
            # Mock response for demo
            return {
                "overall_score": 78,
                "technical_competency": 7,
                "communication_skills": 8,
                "problem_solving": 7,
                "cultural_fit": 8,
                "strengths": ["Clear communication", "Good technical knowledge"],
                "areas_for_improvement": ["More specific examples", "System design skills"],
                "recommendations": ["Practice coding examples", "Study system design"],
                "key_insights": "Candidate shows strong potential with good fundamentals."
            }
            
        except Exception as e:
            self.logger.error(f"Error with Gemini analysis: {e}")
            return {"error": str(e)}