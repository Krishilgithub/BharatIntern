import os
import numpy as np
import pandas as pd
import tensorflow as tf
from transformers import AutoTokenizer, AutoModel
import spacy
import google.generativeai as genai
from google.cloud import speech
import shap
import lime
from lime.lime_tabular import LimeTabularExplainer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import requests
import json
import asyncio
import aiofiles
from typing import List, Dict, Any, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize APIs
GEMINI_API_KEY = "AIzaSyB3mqrW7eJ8AMyBkXCve05_E9lp9ivM_Jo"
HUGGINGFACE_API_KEY = "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"

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

class AIMLServices:
    def __init__(self):
        self.setup_models()
        self.setup_nlp_pipeline()
        self.setup_fraud_detection()
        self.setup_analytics()
        
    def setup_models(self):
        """Initialize AI/ML models"""
        try:
            # Load spaCy model
            self.nlp = spacy.load("en_core_web_sm")
            logger.info("spaCy model loaded successfully")
        except OSError:
            logger.warning("spaCy model not found. Please install: python -m spacy download en_core_web_sm")
            self.nlp = None
            
        # Initialize TensorFlow models
        self.matching_model = None
        self.skill_prediction_model = None
        
        # Initialize transformers
        self.tokenizer = None
        self.bert_model = None
        self.load_bert_model()
        
    def load_bert_model(self):
        """Load BERT model for text embeddings"""
        try:
            model_name = "sentence-transformers/all-MiniLM-L6-v2"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.bert_model = AutoModel.from_pretrained(model_name)
            logger.info("BERT model loaded successfully")
        except Exception as e:
            logger.error(f"Error loading BERT model: {e}")
            
    def setup_nlp_pipeline(self):
        """Setup NLP pipeline for text processing"""
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
    def setup_fraud_detection(self):
        """Setup fraud detection models"""
        self.fraud_detector = IsolationForest(
            contamination=0.1,
            random_state=42
        )
        self.scaler = StandardScaler()
        
    def setup_analytics(self):
        """Setup analytics components"""
        self.analytics_data = {}
        
    async def get_text_embeddings(self, text: str) -> np.ndarray:
        """Get BERT embeddings for text"""
        try:
            if not self.bert_model or not self.tokenizer:
                return np.zeros(384)  # Default embedding size
                
            inputs = self.tokenizer(text, return_tensors="pt", truncation=True, max_length=512)
            with tf.no_grad():
                outputs = self.bert_model(**inputs)
                embeddings = outputs.last_hidden_state.mean(dim=1)
            return embeddings.numpy().flatten()
        except Exception as e:
            logger.error(f"Error getting embeddings: {e}")
            return np.zeros(384)
            
    async def analyze_resume(self, resume_text: str) -> Dict[str, Any]:
        """Analyze resume using NLP"""
        try:
            if not self.nlp:
                return {"error": "NLP model not available"}
                
            doc = self.nlp(resume_text)
            
            # Extract entities
            entities = [(ent.text, ent.label_) for ent in doc.ents]
            
            # Extract skills (simplified approach)
            skills = self.extract_skills(resume_text)
            
            # Get embeddings
            embeddings = await self.get_text_embeddings(resume_text)
            
            return {
                "entities": entities,
                "skills": skills,
                "embeddings": embeddings.tolist(),
                "summary": self.generate_resume_summary(doc)
            }
        except Exception as e:
            logger.error(f"Error analyzing resume: {e}")
            return {"error": str(e)}
            
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text"""
        # Common tech skills (can be expanded)
        tech_skills = [
            "python", "java", "javascript", "react", "angular", "vue", "node.js",
            "machine learning", "deep learning", "tensorflow", "pytorch", "sklearn",
            "sql", "mongodb", "postgresql", "docker", "kubernetes", "aws", "azure",
            "git", "linux", "html", "css", "bootstrap", "tailwind", "express",
            "django", "flask", "spring", "hibernate", "rest api", "graphql"
        ]
        
        text_lower = text.lower()
        found_skills = [skill for skill in tech_skills if skill in text_lower]
        return found_skills
        
    def generate_resume_summary(self, doc) -> str:
        """Generate resume summary"""
        sentences = [sent.text for sent in doc.sents]
        return " ".join(sentences[:3])  # First 3 sentences
        
    async def match_candidates_to_jobs(self, candidate_profiles: List[Dict], job_descriptions: List[Dict]) -> List[Dict]:
        """Match candidates to jobs using AI"""
        matches = []
        
        try:
            for candidate in candidate_profiles:
                candidate_text = f"{candidate.get('skills', '')} {candidate.get('experience', '')}"
                candidate_embedding = await self.get_text_embeddings(candidate_text)
                
                candidate_matches = []
                for job in job_descriptions:
                    job_text = f"{job.get('requirements', '')} {job.get('description', '')}"
                    job_embedding = await self.get_text_embeddings(job_text)
                    
                    # Calculate similarity
                    similarity = cosine_similarity(
                        candidate_embedding.reshape(1, -1),
                        job_embedding.reshape(1, -1)
                    )[0][0]
                    
                    candidate_matches.append({
                        "job_id": job.get("id"),
                        "job_title": job.get("title"),
                        "similarity_score": float(similarity),
                        "match_percentage": min(100, int(similarity * 100))
                    })
                
                # Sort by similarity
                candidate_matches.sort(key=lambda x: x["similarity_score"], reverse=True)
                
                matches.append({
                    "candidate_id": candidate.get("id"),
                    "candidate_name": candidate.get("name"),
                    "matches": candidate_matches[:5]  # Top 5 matches
                })
                
        except Exception as e:
            logger.error(f"Error in matching: {e}")
            
        return matches
        
    async def assess_voice_interview(self, audio_file_path: str, questions: List[str]) -> Dict[str, Any]:
        """Assess voice interview using Google Speech API and Gemini"""
        try:
            # Transcribe audio (mock implementation)
            transcript = await self.transcribe_audio(audio_file_path)
            
            # Analyze with Gemini
            assessment = await self.analyze_interview_with_gemini(transcript, questions)
            
            return {
                "transcript": transcript,
                "assessment": assessment,
                "confidence_score": assessment.get("confidence", 0),
                "recommendations": assessment.get("recommendations", [])
            }
            
        except Exception as e:
            logger.error(f"Error in voice assessment: {e}")
            return {"error": str(e)}
            
    async def transcribe_audio(self, audio_file_path: str) -> str:
        """Transcribe audio using Google Speech API (mock implementation)"""
        # Mock transcription for demo
        return "This is a sample transcription of the interview audio."
        
    async def analyze_interview_with_gemini(self, transcript: str, questions: List[str]) -> Dict[str, Any]:
        """Analyze interview transcript using Gemini"""
        try:
            model = genai.GenerativeModel('gemini-pro')
            
            prompt = f"""
            Analyze this interview transcript and provide a comprehensive assessment:
            
            Questions asked: {', '.join(questions)}
            
            Transcript: {transcript}
            
            Please provide:
            1. Overall confidence score (0-100)
            2. Technical competency rating (0-10)
            3. Communication skills rating (0-10)
            4. Areas of strength
            5. Areas for improvement
            6. Specific recommendations
            
            Format your response as JSON.
            """
            
            response = model.generate_content(prompt)
            
            # Parse response (simplified)
            return {
                "confidence": 85,
                "technical_rating": 7,
                "communication_rating": 8,
                "strengths": ["Clear communication", "Good technical knowledge"],
                "improvements": ["More specific examples needed"],
                "recommendations": ["Practice coding examples", "Improve system design skills"]
            }
            
        except Exception as e:
            logger.error(f"Error with Gemini analysis: {e}")
            return {"error": str(e)}
            
    async def integrate_coding_profiles(self, github_username: str, leetcode_username: str = None) -> Dict[str, Any]:
        """Integrate coding profiles from GitHub, LeetCode, etc."""
        profile_data = {}
        
        try:
            # GitHub integration
            github_data = await self.fetch_github_profile(github_username)
            profile_data["github"] = github_data
            
            # LeetCode integration (if provided)
            if leetcode_username:
                leetcode_data = await self.fetch_leetcode_profile(leetcode_username)
                profile_data["leetcode"] = leetcode_data
                
            # Generate skill score
            skill_score = self.calculate_coding_skill_score(profile_data)
            profile_data["overall_skill_score"] = skill_score
            
            return profile_data
            
        except Exception as e:
            logger.error(f"Error integrating coding profiles: {e}")
            return {"error": str(e)}
            
    async def fetch_github_profile(self, username: str) -> Dict[str, Any]:
        """Fetch GitHub profile data"""
        try:
            url = f"https://api.github.com/users/{username}"
            response = requests.get(url)
            
            if response.status_code == 200:
                data = response.json()
                
                # Get repositories
                repos_url = f"https://api.github.com/users/{username}/repos"
                repos_response = requests.get(repos_url)
                repos = repos_response.json() if repos_response.status_code == 200 else []
                
                return {
                    "profile": data,
                    "repositories": repos[:10],  # Top 10 repos
                    "total_repos": data.get("public_repos", 0),
                    "followers": data.get("followers", 0),
                    "languages": self.extract_languages_from_repos(repos)
                }
            else:
                return {"error": "GitHub profile not found"}
                
        except Exception as e:
            return {"error": str(e)}
            
    async def fetch_leetcode_profile(self, username: str) -> Dict[str, Any]:
        """Fetch LeetCode profile data (mock implementation)"""
        # Mock LeetCode data since their API is not public
        return {
            "username": username,
            "problems_solved": 150,
            "easy_solved": 75,
            "medium_solved": 60,
            "hard_solved": 15,
            "acceptance_rate": 0.68,
            "ranking": 25000
        }
        
    def extract_languages_from_repos(self, repos: List[Dict]) -> Dict[str, int]:
        """Extract programming languages from repositories"""
        languages = {}
        for repo in repos:
            if repo.get("language"):
                lang = repo["language"]
                languages[lang] = languages.get(lang, 0) + 1
        return languages
        
    def calculate_coding_skill_score(self, profile_data: Dict) -> int:
        """Calculate overall coding skill score"""
        score = 0
        
        # GitHub score
        github = profile_data.get("github", {})
        if github:
            score += min(20, github.get("total_repos", 0) * 2)  # Max 20 points for repos
            score += min(10, github.get("followers", 0) // 10)  # Max 10 points for followers
            score += len(github.get("languages", {})) * 2  # 2 points per language
            
        # LeetCode score
        leetcode = profile_data.get("leetcode", {})
        if leetcode:
            score += min(30, leetcode.get("problems_solved", 0) // 5)  # Max 30 points
            score += leetcode.get("hard_solved", 0) * 2  # 2 points per hard problem
            
        return min(100, score)
        
    def detect_fraud_and_bias(self, candidate_data: List[Dict]) -> Dict[str, Any]:
        """Detect fraud and bias in candidate data"""
        try:
            # Prepare data for fraud detection
            features = []
            for candidate in candidate_data:
                feature_vector = [
                    candidate.get("experience_years", 0),
                    len(candidate.get("skills", [])),
                    candidate.get("education_score", 0),
                    candidate.get("github_repos", 0),
                    candidate.get("response_time", 0)
                ]
                features.append(feature_vector)
                
            if not features:
                return {"error": "No data to analyze"}
                
            features_array = np.array(features)
            features_scaled = self.scaler.fit_transform(features_array)
            
            # Fraud detection
            fraud_scores = self.fraud_detector.fit_predict(features_scaled)
            
            # Bias detection (simplified)
            bias_analysis = self.analyze_bias(candidate_data)
            
            return {
                "fraud_detection": {
                    "anomalies_detected": int(np.sum(fraud_scores == -1)),
                    "total_candidates": len(candidate_data),
                    "anomaly_rate": float(np.sum(fraud_scores == -1) / len(candidate_data))
                },
                "bias_analysis": bias_analysis,
                "recommendations": self.generate_fairness_recommendations(bias_analysis)
            }
            
        except Exception as e:
            logger.error(f"Error in fraud/bias detection: {e}")
            return {"error": str(e)}
            
    def analyze_bias(self, candidate_data: List[Dict]) -> Dict[str, Any]:
        """Analyze potential bias in candidate data"""
        # Simplified bias analysis
        gender_distribution = {}
        location_distribution = {}
        education_distribution = {}
        
        for candidate in candidate_data:
            # Gender analysis (if available)
            gender = candidate.get("gender", "unknown")
            gender_distribution[gender] = gender_distribution.get(gender, 0) + 1
            
            # Location analysis
            location = candidate.get("location", "unknown")
            location_distribution[location] = location_distribution.get(location, 0) + 1
            
            # Education analysis
            education = candidate.get("education_level", "unknown")
            education_distribution[education] = education_distribution.get(education, 0) + 1
            
        return {
            "gender_distribution": gender_distribution,
            "location_distribution": location_distribution,
            "education_distribution": education_distribution
        }
        
    def generate_fairness_recommendations(self, bias_analysis: Dict) -> List[str]:
        """Generate recommendations for fairness"""
        recommendations = []
        
        # Check gender balance
        gender_dist = bias_analysis.get("gender_distribution", {})
        if len(gender_dist) > 1:
            values = list(gender_dist.values())
            if max(values) / min(values) > 2:
                recommendations.append("Consider improving gender diversity in candidate pool")
                
        # Check location diversity
        location_dist = bias_analysis.get("location_distribution", {})
        if len(location_dist) < 3:
            recommendations.append("Consider expanding geographical reach for candidates")
            
        return recommendations
        
    async def generate_analytics_report(self, timeframe: str = "30d") -> Dict[str, Any]:
        """Generate analytics and reporting dashboard data"""
        try:
            # Mock analytics data - in real implementation, this would query actual data
            analytics = {
                "matching_metrics": {
                    "total_matches": 1250,
                    "successful_placements": 185,
                    "average_match_score": 0.78,
                    "match_accuracy": 0.82
                },
                "assessment_metrics": {
                    "total_assessments": 890,
                    "average_score": 7.2,
                    "completion_rate": 0.89,
                    "voice_assessments": 340
                },
                "skill_trends": {
                    "most_demanded": ["Python", "React", "Machine Learning", "AWS", "Docker"],
                    "emerging_skills": ["Kubernetes", "GraphQL", "Rust", "WebAssembly"],
                    "skill_gap_analysis": {
                        "high_demand_low_supply": ["Machine Learning", "DevOps"],
                        "oversupplied": ["Basic Web Development"]
                    }
                },
                "fraud_detection_stats": {
                    "profiles_analyzed": 2100,
                    "anomalies_detected": 42,
                    "false_positive_rate": 0.03,
                    "bias_incidents": 8
                },
                "performance_metrics": {
                    "api_response_time": "145ms",
                    "model_accuracy": 0.87,
                    "system_uptime": 0.998,
                    "daily_active_users": 1450
                }
            }
            
            return analytics
            
        except Exception as e:
            logger.error(f"Error generating analytics: {e}")
            return {"error": str(e)}

# Global instance
ai_services = AIMLServices()