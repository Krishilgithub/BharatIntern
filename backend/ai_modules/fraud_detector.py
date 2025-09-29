"""Fraud Detection and Bias Analysis Module"""
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Any
from .base_model import BaseAIModel

class FraudDetector(BaseAIModel):
    """AI-powered fraud detection and bias analysis"""
    
    def __init__(self):
        super().__init__("Fraud_Detector")
        self.fraud_detector = None
        self.scaler = None
        
    async def initialize(self) -> bool:
        """Initialize fraud detection models"""
        try:
            self.logger.info("Initializing Fraud Detector...")
            
            self.fraud_detector = IsolationForest(**self.config.FRAUD_DETECTION_CONFIG)
            self.scaler = StandardScaler()
            
            self.is_initialized = True
            self.logger.info("Fraud Detector initialized successfully")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to initialize Fraud Detector: {e}")
            return False
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate fraud detection input"""
        return isinstance(input_data, list) and len(input_data) > 0
    
    async def process(self, input_data: List[Dict]) -> Dict[str, Any]:
        """Process fraud detection and bias analysis"""
        if not self.validate_input(input_data):
            return {"error": "Invalid input data"}
        
        try:
            # Extract features
            features = self._extract_features(input_data)
            
            # Fraud detection
            fraud_results = await self._detect_fraud(features)
            
            # Bias analysis
            bias_results = await self._analyze_bias(input_data)
            
            return {
                "fraud_detection": fraud_results,
                "bias_analysis": bias_results,
                "recommendations": self._generate_fairness_recommendations(bias_results)
            }
            
        except Exception as e:
            self.logger.error(f"Error in fraud detection: {e}")
            return {"error": str(e)}
    
    def _extract_features(self, candidates: List[Dict]) -> np.ndarray:
        """Extract numerical features for fraud detection"""
        features = []
        for candidate in candidates:
            feature_vector = [
                candidate.get("years_of_experience", 0),
                len(candidate.get("skills", [])),
                candidate.get("education_score", 0),
                candidate.get("github_repos", 0),
                candidate.get("response_time_seconds", 0)
            ]
            features.append(feature_vector)
        return np.array(features)
    
    async def _detect_fraud(self, features: np.ndarray) -> Dict[str, Any]:
        """Detect fraudulent profiles"""
        try:
            if len(features) == 0:
                return {"error": "No features to analyze"}
            
            # Scale features
            features_scaled = self.scaler.fit_transform(features)
            
            # Detect anomalies
            predictions = self.fraud_detector.fit_predict(features_scaled)
            
            anomalies = np.sum(predictions == -1)
            total = len(predictions)
            
            return {
                "total_candidates": total,
                "anomalies_detected": int(anomalies),
                "anomaly_rate": float(anomalies / total) if total > 0 else 0.0,
                "anomaly_indices": np.where(predictions == -1)[0].tolist()
            }
            
        except Exception as e:
            self.logger.error(f"Error detecting fraud: {e}")
            return {"error": str(e)}
    
    async def _analyze_bias(self, candidates: List[Dict]) -> Dict[str, Any]:
        """Analyze potential bias in candidate data"""
        try:
            analysis = {
                "gender_distribution": {},
                "location_distribution": {},
                "education_distribution": {},
                "age_distribution": {}
            }
            
            for candidate in candidates:
                # Gender analysis
                gender = candidate.get("gender", "unknown")
                analysis["gender_distribution"][gender] = analysis["gender_distribution"].get(gender, 0) + 1
                
                # Location analysis
                location = candidate.get("location", "unknown")
                analysis["location_distribution"][location] = analysis["location_distribution"].get(location, 0) + 1
                
                # Education analysis
                education = candidate.get("education_level", "unknown")
                analysis["education_distribution"][education] = analysis["education_distribution"].get(education, 0) + 1
            
            return analysis
            
        except Exception as e:
            self.logger.error(f"Error analyzing bias: {e}")
            return {}
    
    def _generate_fairness_recommendations(self, bias_analysis: Dict) -> List[str]:
        """Generate fairness recommendations"""
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
            recommendations.append("Consider expanding geographical reach")
        
        return recommendations