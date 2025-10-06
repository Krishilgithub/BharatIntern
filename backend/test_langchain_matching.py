"""
Comprehensive Test Suite for LangChain Matching Engine
Tests all functionality including edge cases and error handling
"""

import asyncio
import json
import os
import sys
from typing import Dict, Any, List
import pytest
import requests
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_modules.langchain_matching_engine import (
    LangChainMatchingEngine,
    Candidate,
    Opportunity,
    MatchingResult,
    FitLevel
)

class TestLangChainMatchingEngine:
    """Test suite for LangChain matching engine"""
    
    def __init__(self):
        self.engine = None
        self.base_url = "http://localhost:8000"  # Adjust if needed
        self.test_results = []
    
    async def setup_engine(self):
        """Initialize the matching engine for testing"""
        try:
            self.engine = LangChainMatchingEngine()
            success = await self.engine.initialize()
            if success:
                print("✅ LangChain Matching Engine initialized successfully")
                return True
            else:
                print("❌ Failed to initialize LangChain Matching Engine")
                return False
        except Exception as e:
            print(f"❌ Error initializing engine: {e}")
            return False
    
    def create_sample_candidate(self, variant: str = "default") -> Dict[str, Any]:
        """Create sample candidate data for testing"""
        candidates = {
            "default": {
                "skills": ["Python", "JavaScript", "React", "Node.js", "MongoDB"],
                "education": {
                    "degree": "Bachelor of Technology",
                    "field": "Computer Science",
                    "institution": "IIT Delhi",
                    "graduation_year": 2023
                },
                "location": "Bangalore",
                "experience_years": 1.5,
                "coding_profiles": {
                    "github": "johndoe",
                    "leetcode": "johndoe_coder"
                },
                "soft_skill_scores": {
                    "communication": 0.8,
                    "leadership": 0.6,
                    "teamwork": 0.9,
                    "problem_solving": 0.85
                },
                "projects": [
                    {
                        "name": "E-commerce Platform",
                        "description": "Full-stack e-commerce application with React and Node.js",
                        "technologies": ["React", "Node.js", "MongoDB", "Express"]
                    }
                ],
                "certifications": ["AWS Cloud Practitioner"],
                "languages": ["Python", "JavaScript", "TypeScript"],
                "resume_text": "Experienced software developer with 1.5 years of experience..."
            },
            "senior": {
                "skills": ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes", "AWS"],
                "education": {
                    "degree": "Master of Technology",
                    "field": "Software Engineering",
                    "institution": "IIIT Bangalore",
                    "graduation_year": 2020
                },
                "location": "Mumbai",
                "experience_years": 5.0,
                "coding_profiles": {
                    "github": "seniordev",
                    "leetcode": "senior_coder"
                },
                "soft_skill_scores": {
                    "communication": 0.9,
                    "leadership": 0.8,
                    "teamwork": 0.85,
                    "problem_solving": 0.9
                },
                "projects": [
                    {
                        "name": "Enterprise Microservices Platform",
                        "description": "Scalable microservices architecture for enterprise",
                        "technologies": ["Java", "Spring Boot", "Docker", "Kubernetes"]
                    }
                ],
                "certifications": ["Oracle Java Certified", "AWS Solutions Architect"],
                "languages": ["Java", "Python", "Go", "TypeScript"],
                "resume_text": "Senior software engineer with 5 years of experience in enterprise development..."
            },
            "entry": {
                "skills": ["Python", "SQL", "Git"],
                "education": {
                    "degree": "Bachelor of Engineering",
                    "field": "Computer Science",
                    "institution": "Local University",
                    "graduation_year": 2024
                },
                "location": "Delhi",
                "experience_years": 0.5,
                "coding_profiles": {
                    "github": "newbie",
                    "leetcode": "newbie_coder"
                },
                "soft_skill_scores": {
                    "communication": 0.7,
                    "leadership": 0.4,
                    "teamwork": 0.8,
                    "problem_solving": 0.6
                },
                "projects": [
                    {
                        "name": "Student Management System",
                        "description": "Basic CRUD application for student records",
                        "technologies": ["Python", "SQLite", "Flask"]
                    }
                ],
                "certifications": [],
                "languages": ["Python", "SQL"],
                "resume_text": "Recent graduate with passion for software development..."
            },
            "empty_skills": {
                "skills": [],  # This should trigger validation error
                "education": {"degree": "B.Tech"},
                "location": "Test City",
                "experience_years": 1.0
            }
        }
        
        return candidates.get(variant, candidates["default"])
    
    def create_sample_opportunity(self, variant: str = "default") -> Dict[str, Any]:
        """Create sample opportunity data for testing"""
        opportunities = {
            "default": {
                "required_skills": ["Python", "JavaScript", "React", "Node.js"],
                "industry": "Technology",
                "location": "Bangalore",
                "experience_level": "mid",
                "job_title": "Full Stack Developer",
                "company_size": "startup",
                "remote_friendly": True,
                "salary_range": {"min": 800000, "max": 1500000},
                "benefits": ["Health Insurance", "Learning Budget"],
                "description": "Looking for a talented Full Stack Developer to join our growing team...",
                "preferences": {
                    "startup_experience": "preferred",
                    "remote_work": "allowed"
                }
            },
            "senior": {
                "required_skills": ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"],
                "industry": "Fintech",
                "location": "Mumbai",
                "experience_level": "senior",
                "job_title": "Senior Backend Engineer",
                "company_size": "enterprise",
                "remote_friendly": False,
                "salary_range": {"min": 1200000, "max": 2000000},
                "benefits": ["Health Insurance", "Stock Options", "Gym Membership"],
                "description": "Seeking a Senior Backend Engineer with microservices experience...",
                "preferences": {
                    "fintech_experience": "preferred",
                    "team_leadership": "required"
                }
            },
            "entry": {
                "required_skills": ["Python", "Machine Learning", "TensorFlow", "SQL"],
                "industry": "AI/ML",
                "location": "Remote",
                "experience_level": "entry",
                "job_title": "Machine Learning Engineer",
                "company_size": "startup",
                "remote_friendly": True,
                "salary_range": {"min": 600000, "max": 1000000},
                "benefits": ["Health Insurance", "Research Time"],
                "description": "Entry-level ML Engineer position for recent graduates...",
                "preferences": {
                    "research_background": "preferred",
                    "remote_work": "required"
                }
            },
            "empty_skills": {
                "required_skills": [],  # This should trigger validation error
                "industry": "Technology",
                "location": "Test City",
                "experience_level": "mid"
            }
        }
        
        return opportunities.get(variant, opportunities["default"])
    
    async def test_engine_initialization(self):
        """Test engine initialization"""
        print("\n🧪 Testing Engine Initialization...")
        
        try:
            success = await self.setup_engine()
            if success:
                status = self.engine.get_engine_status()
                print(f"✅ Engine Status: {status}")
                self.test_results.append({"test": "initialization", "status": "PASS", "details": status})
                return True
            else:
                print("❌ Engine initialization failed")
                self.test_results.append({"test": "initialization", "status": "FAIL", "details": "Failed to initialize"})
                return False
        except Exception as e:
            print(f"❌ Initialization test failed: {e}")
            self.test_results.append({"test": "initialization", "status": "FAIL", "details": str(e)})
            return False
    
    async def test_valid_matching(self):
        """Test valid candidate-opportunity matching"""
        print("\n🧪 Testing Valid Matching...")
        
        try:
            candidate = self.create_sample_candidate("default")
            opportunity = self.create_sample_opportunity("default")
            
            result = await self.engine.match_candidate_to_opportunity(candidate, opportunity)
            
            if result.get("success", False):
                print(f"✅ Matching successful!")
                print(f"   Match Score: {result.get('match_score', 'N/A')}")
                print(f"   Fit Level: {result.get('fit_level', 'N/A')}")
                print(f"   Confidence: {result.get('confidence_score', 'N/A')}")
                
                # Validate required fields
                required_fields = ["match_score", "explanation", "fit_level", "strengths", "concerns"]
                missing_fields = [field for field in required_fields if field not in result]
                
                if not missing_fields:
                    self.test_results.append({"test": "valid_matching", "status": "PASS", "details": result})
                    return True
                else:
                    print(f"❌ Missing required fields: {missing_fields}")
                    self.test_results.append({"test": "valid_matching", "status": "FAIL", "details": f"Missing fields: {missing_fields}"})
                    return False
            else:
                print(f"❌ Matching failed: {result.get('error', 'Unknown error')}")
                self.test_results.append({"test": "valid_matching", "status": "FAIL", "details": result.get('error', 'Unknown error')})
                return False
                
        except Exception as e:
            print(f"❌ Valid matching test failed: {e}")
            self.test_results.append({"test": "valid_matching", "status": "FAIL", "details": str(e)})
            return False
    
    async def test_edge_cases(self):
        """Test edge cases and error handling"""
        print("\n🧪 Testing Edge Cases...")
        
        edge_case_tests = []
        
        # Test 1: Empty skills (should fail validation)
        try:
            candidate = self.create_sample_candidate("empty_skills")
            opportunity = self.create_sample_opportunity("default")
            
            result = await self.engine.match_candidate_to_opportunity(candidate, opportunity)
            
            if not result.get("success", False) and "error" in result:
                print("✅ Empty skills validation working correctly")
                edge_case_tests.append({"test": "empty_skills", "status": "PASS"})
            else:
                print("❌ Empty skills validation failed")
                edge_case_tests.append({"test": "empty_skills", "status": "FAIL"})
                
        except Exception as e:
            print(f"❌ Empty skills test failed: {e}")
            edge_case_tests.append({"test": "empty_skills", "status": "FAIL", "details": str(e)})
        
        # Test 2: Very high match (perfect alignment)
        try:
            candidate = self.create_sample_candidate("senior")
            opportunity = self.create_sample_opportunity("senior")
            
            result = await self.engine.match_candidate_to_opportunity(candidate, opportunity)
            
            if result.get("success", False):
                match_score = result.get("match_score", 0)
                if match_score >= 80:
                    print(f"✅ High match scenario working: {match_score}%")
                    edge_case_tests.append({"test": "high_match", "status": "PASS", "score": match_score})
                else:
                    print(f"⚠️ High match score lower than expected: {match_score}%")
                    edge_case_tests.append({"test": "high_match", "status": "PARTIAL", "score": match_score})
            else:
                print("❌ High match test failed")
                edge_case_tests.append({"test": "high_match", "status": "FAIL"})
                
        except Exception as e:
            print(f"❌ High match test failed: {e}")
            edge_case_tests.append({"test": "high_match", "status": "FAIL", "details": str(e)})
        
        # Test 3: Very low match (poor alignment)
        try:
            candidate = self.create_sample_candidate("entry")
            opportunity = self.create_sample_opportunity("senior")
            
            result = await self.engine.match_candidate_to_opportunity(candidate, opportunity)
            
            if result.get("success", False):
                match_score = result.get("match_score", 0)
                fit_level = result.get("fit_level", "")
                
                if match_score < 60 and fit_level in ["weak fit", "poor fit"]:
                    print(f"✅ Low match scenario working: {match_score}% ({fit_level})")
                    edge_case_tests.append({"test": "low_match", "status": "PASS", "score": match_score, "fit_level": fit_level})
                else:
                    print(f"⚠️ Low match scenario unexpected: {match_score}% ({fit_level})")
                    edge_case_tests.append({"test": "low_match", "status": "PARTIAL", "score": match_score, "fit_level": fit_level})
            else:
                print("❌ Low match test failed")
                edge_case_tests.append({"test": "low_match", "status": "FAIL"})
                
        except Exception as e:
            print(f"❌ Low match test failed: {e}")
            edge_case_tests.append({"test": "low_match", "status": "FAIL", "details": str(e)})
        
        self.test_results.append({"test": "edge_cases", "status": "COMPLETED", "details": edge_case_tests})
        return edge_case_tests
    
    async def test_batch_matching(self):
        """Test batch matching functionality"""
        print("\n🧪 Testing Batch Matching...")
        
        try:
            candidates = [
                self.create_sample_candidate("default"),
                self.create_sample_candidate("senior"),
                self.create_sample_candidate("entry")
            ]
            
            opportunities = [
                self.create_sample_opportunity("default"),
                self.create_sample_opportunity("senior"),
                self.create_sample_opportunity("entry")
            ]
            
            result = await self.engine.batch_match_candidates(candidates, opportunities)
            
            if result.get("success", False):
                total_matches = result.get("total_matches", 0)
                expected_matches = len(candidates) * len(opportunities)
                
                print(f"✅ Batch matching successful!")
                print(f"   Total matches: {total_matches}/{expected_matches}")
                print(f"   Candidates: {len(candidates)}")
                print(f"   Opportunities: {len(opportunities)}")
                
                self.test_results.append({"test": "batch_matching", "status": "PASS", "details": result})
                return True
            else:
                print(f"❌ Batch matching failed: {result.get('error', 'Unknown error')}")
                self.test_results.append({"test": "batch_matching", "status": "FAIL", "details": result.get('error', 'Unknown error')})
                return False
                
        except Exception as e:
            print(f"❌ Batch matching test failed: {e}")
            self.test_results.append({"test": "batch_matching", "status": "FAIL", "details": str(e)})
            return False
    
    async def test_api_endpoints(self):
        """Test REST API endpoints"""
        print("\n🧪 Testing API Endpoints...")
        
        api_tests = []
        
        # Test 1: Status endpoint
        try:
            response = requests.get(f"{self.base_url}/langchain/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print("✅ Status endpoint working")
                api_tests.append({"test": "status_endpoint", "status": "PASS", "data": data})
            else:
                print(f"❌ Status endpoint failed: {response.status_code}")
                api_tests.append({"test": "status_endpoint", "status": "FAIL", "status_code": response.status_code})
        except Exception as e:
            print(f"❌ Status endpoint test failed: {e}")
            api_tests.append({"test": "status_endpoint", "status": "FAIL", "details": str(e)})
        
        # Test 2: Sample data endpoint
        try:
            response = requests.get(f"{self.base_url}/langchain/sample-data", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get("success", False) and "sample_candidates" in data:
                    print("✅ Sample data endpoint working")
                    api_tests.append({"test": "sample_data_endpoint", "status": "PASS"})
                else:
                    print("❌ Sample data endpoint returned invalid data")
                    api_tests.append({"test": "sample_data_endpoint", "status": "FAIL", "details": "Invalid response structure"})
            else:
                print(f"❌ Sample data endpoint failed: {response.status_code}")
                api_tests.append({"test": "sample_data_endpoint", "status": "FAIL", "status_code": response.status_code})
        except Exception as e:
            print(f"❌ Sample data endpoint test failed: {e}")
            api_tests.append({"test": "sample_data_endpoint", "status": "FAIL", "details": str(e)})
        
        # Test 3: Test match endpoint
        try:
            response = requests.post(f"{self.base_url}/langchain/test-match", timeout=30)
            if response.status_code == 200:
                data = response.json()
                if data.get("success", False) and "matching_result" in data:
                    print("✅ Test match endpoint working")
                    api_tests.append({"test": "test_match_endpoint", "status": "PASS"})
                else:
                    print("❌ Test match endpoint returned invalid data")
                    api_tests.append({"test": "test_match_endpoint", "status": "FAIL", "details": "Invalid response structure"})
            else:
                print(f"❌ Test match endpoint failed: {response.status_code}")
                api_tests.append({"test": "test_match_endpoint", "status": "FAIL", "status_code": response.status_code})
        except Exception as e:
            print(f"❌ Test match endpoint test failed: {e}")
            api_tests.append({"test": "test_match_endpoint", "status": "FAIL", "details": str(e)})
        
        self.test_results.append({"test": "api_endpoints", "status": "COMPLETED", "details": api_tests})
        return api_tests
    
    def print_test_summary(self):
        """Print comprehensive test summary"""
        print("\n" + "="*80)
        print("🧪 LANGCHAIN MATCHING ENGINE TEST SUMMARY")
        print("="*80)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["status"] == "PASS")
        failed_tests = sum(1 for result in self.test_results if result["status"] == "FAIL")
        completed_tests = sum(1 for result in self.test_results if result["status"] == "COMPLETED")
        
        print(f"📊 Total Test Categories: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📋 Completed: {completed_tests}")
        
        print(f"\n📈 Success Rate: {(passed_tests + completed_tests) / total_tests * 100:.1f}%")
        
        print("\n📝 Detailed Results:")
        for i, result in enumerate(self.test_results, 1):
            status_emoji = "✅" if result["status"] == "PASS" else "❌" if result["status"] == "FAIL" else "📋"
            print(f"   {i}. {status_emoji} {result['test']}: {result['status']}")
            if "details" in result:
                if isinstance(result["details"], dict):
                    print(f"      Details: {json.dumps(result['details'], indent=6)[:200]}...")
                else:
                    print(f"      Details: {str(result['details'])[:100]}...")
        
        print("\n" + "="*80)
        
        # Save results to file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"test_results_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump({
                "timestamp": datetime.now().isoformat(),
                "summary": {
                    "total_tests": total_tests,
                    "passed": passed_tests,
                    "failed": failed_tests,
                    "completed": completed_tests,
                    "success_rate": (passed_tests + completed_tests) / total_tests * 100
                },
                "results": self.test_results
            }, f, indent=2)
        
        print(f"💾 Test results saved to: {filename}")
    
    async def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting LangChain Matching Engine Test Suite...")
        print(f"⏰ Test started at: {datetime.now().isoformat()}")
        
        # Run all tests
        await self.test_engine_initialization()
        await self.test_valid_matching()
        await self.test_edge_cases()
        await self.test_batch_matching()
        await self.test_api_endpoints()
        
        # Print summary
        self.print_test_summary()

async def main():
    """Main test runner"""
    tester = TestLangChainMatchingEngine()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())
