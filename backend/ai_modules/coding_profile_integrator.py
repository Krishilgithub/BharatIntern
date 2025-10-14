"""Coding Profile Integration Module for GitHub, LeetCode, etc."""
import requests
import asyncio
from typing import Dict, Any, Optional
from .base_model import BaseAIModel

class CodingProfileIntegrator(BaseAIModel):
    """Integration with coding platforms like GitHub and LeetCode"""
    
    def __init__(self):
        super().__init__("Coding_Profile_Integrator")
        
    async def initialize(self) -> bool:
        """Initialize the coding profile integrator"""
        try:
            self.logger.info("Initializing Coding Profile Integrator...")
            self.is_initialized = True
            self.logger.info("Coding Profile Integrator initialized successfully")
            return True
        except Exception as e:
            self.logger.error(f"Failed to initialize Coding Profile Integrator: {e}")
            return False
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate profile integration input"""
        if not isinstance(input_data, dict):
            return False
        return "github_username" in input_data or "leetcode_username" in input_data
    
    async def process(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process coding profile integration"""
        if not self.validate_input(input_data):
            return {"error": "Invalid input data"}
        
        try:
            profile_data = {}
            
            # GitHub integration
            if "github_username" in input_data:
                github_data = await self._fetch_github_profile(input_data["github_username"])
                profile_data["github"] = github_data
            
            # LeetCode integration
            if "leetcode_username" in input_data:
                leetcode_data = await self._fetch_leetcode_profile(input_data["leetcode_username"])
                profile_data["leetcode"] = leetcode_data
            
            # Calculate overall coding score
            profile_data["coding_score"] = self._calculate_coding_score(profile_data)
            
            return profile_data
            
        except Exception as e:
            self.logger.error(f"Error processing coding profiles: {e}")
            return {"error": str(e)}
    
    async def _fetch_github_profile(self, username: str) -> Dict[str, Any]:
        """Fetch GitHub profile data"""
        try:
            # GitHub API calls
            user_url = f"https://api.github.com/users/{username}"
            repos_url = f"https://api.github.com/users/{username}/repos"
            
            user_response = requests.get(user_url)
            repos_response = requests.get(repos_url)
            
            if user_response.status_code == 200 and repos_response.status_code == 200:
                user_data = user_response.json()
                repos_data = repos_response.json()
                
                return {
                    "profile": user_data,
                    "repositories": repos_data[:10],
                    "stats": {
                        "total_repos": user_data.get("public_repos", 0),
                        "followers": user_data.get("followers", 0),
                        "following": user_data.get("following", 0)
                    },
                    "languages": self._extract_languages(repos_data)
                }
            else:
                return {"error": "GitHub profile not found"}
                
        except Exception as e:
            self.logger.error(f"Error fetching GitHub profile: {e}")
            return {"error": str(e)}
    
    async def _fetch_leetcode_profile(self, username: str) -> Dict[str, Any]:
        """Mock LeetCode profile data (API not public)"""
        return {
            "username": username,
            "problems_solved": 150,
            "easy_solved": 75,
            "medium_solved": 60,
            "hard_solved": 15,
            "acceptance_rate": 68.5,
            "ranking": 25000
        }
    
    def _extract_languages(self, repos: list) -> Dict[str, int]:
        """Extract programming languages from repositories"""
        languages = {}
        for repo in repos:
            if repo.get("language"):
                lang = repo["language"]
                languages[lang] = languages.get(lang, 0) + 1
        return languages
    
    def _calculate_coding_score(self, profile_data: Dict) -> int:
        """Calculate overall coding skill score"""
        score = 0
        
        # GitHub scoring
        github = profile_data.get("github", {})
        if github and "stats" in github:
            stats = github["stats"]
            score += min(20, stats.get("total_repos", 0) * 2)
            score += min(10, stats.get("followers", 0) // 10)
            score += len(github.get("languages", {})) * 2
        
        # LeetCode scoring
        leetcode = profile_data.get("leetcode", {})
        if leetcode:
            score += min(30, leetcode.get("problems_solved", 0) // 5)
            score += leetcode.get("hard_solved", 0) * 2
        
        return min(100, score)