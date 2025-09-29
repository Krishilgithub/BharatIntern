"""Coding Profile Scraper for GitHub, LeetCode, HackerRank, etc."""
import asyncio
import logging
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import re
import json

# Web scraping imports
try:
    from bs4 import BeautifulSoup
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    SCRAPING_AVAILABLE = True
except ImportError:
    print("Warning: Web scraping libraries not available. Install with: pip install beautifulsoup4 selenium")
    SCRAPING_AVAILABLE = False
    BeautifulSoup = None

logger = logging.getLogger(__name__)

class CodingProfileScraper:
    """Scraper for coding profiles and platforms"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.driver = None
        
        # GitHub API configuration (public repos only)
        self.github_api_base = "https://api.github.com"
        
        # Platform patterns for profile extraction
        self.profile_patterns = {
            'github': r'github\.com/([a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38})',
            'leetcode': r'leetcode\.com/([a-zA-Z0-9_-]+)',
            'hackerrank': r'hackerrank\.com/([a-zA-Z0-9_-]+)',
            'codeforces': r'codeforces\.com/profile/([a-zA-Z0-9_-]+)',
            'codechef': r'codechef\.com/users/([a-zA-Z0-9_-]+)',
            'linkedin': r'linkedin\.com/in/([a-zA-Z0-9_-]+)'
        }
    
    def initialize_selenium(self):
        """Initialize Selenium WebDriver for dynamic content"""
        if not SCRAPING_AVAILABLE:
            return False
        
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            
            self.driver = webdriver.Chrome(options=chrome_options)
            return True
        except Exception as e:
            logger.warning(f"Failed to initialize Selenium: {e}")
            return False
    
    def extract_profiles_from_resume(self, resume_text: str) -> Dict[str, str]:
        """Extract coding platform profiles from resume text"""
        profiles = {}
        
        for platform, pattern in self.profile_patterns.items():
            matches = re.findall(pattern, resume_text, re.IGNORECASE)
            if matches:
                profiles[platform] = matches[0]  # Take first match
        
        return profiles
    
    async def scrape_github_profile(self, username: str) -> Dict[str, Any]:
        """Scrape GitHub profile using public API"""
        profile_data = {
            'platform': 'github',
            'username': username,
            'profile_url': f'https://github.com/{username}',
            'stats': {},
            'languages': {},
            'repositories': [],
            'activity_score': 0,
            'error': None
        }
        
        try:
            # Get user profile
            user_response = self.session.get(f'{self.github_api_base}/users/{username}')
            if user_response.status_code == 200:
                user_data = user_response.json()
                
                profile_data['stats'] = {
                    'public_repos': user_data.get('public_repos', 0),
                    'followers': user_data.get('followers', 0),
                    'following': user_data.get('following', 0),
                    'created_at': user_data.get('created_at'),
                    'updated_at': user_data.get('updated_at'),
                    'name': user_data.get('name'),
                    'bio': user_data.get('bio'),
                    'location': user_data.get('location'),
                    'blog': user_data.get('blog'),
                    'company': user_data.get('company')
                }
                
                # Get repositories
                repos_response = self.session.get(f'{self.github_api_base}/users/{username}/repos?sort=updated&per_page=30')
                if repos_response.status_code == 200:
                    repos_data = repos_response.json()
                    
                    languages = {}
                    total_stars = 0
                    total_forks = 0
                    
                    for repo in repos_data:
                        repo_info = {
                            'name': repo.get('name'),
                            'language': repo.get('language'),
                            'stars': repo.get('stargazers_count', 0),
                            'forks': repo.get('forks_count', 0),
                            'size': repo.get('size', 0),
                            'updated_at': repo.get('updated_at'),
                            'description': repo.get('description')
                        }
                        profile_data['repositories'].append(repo_info)
                        
                        # Count languages
                        if repo.get('language'):
                            languages[repo['language']] = languages.get(repo['language'], 0) + 1
                        
                        total_stars += repo.get('stargazers_count', 0)
                        total_forks += repo.get('forks_count', 0)
                    
                    profile_data['languages'] = languages
                    profile_data['stats']['total_stars'] = total_stars
                    profile_data['stats']['total_forks'] = total_forks
                    
                    # Calculate activity score
                    profile_data['activity_score'] = self._calculate_github_activity_score(profile_data)
            
            else:
                profile_data['error'] = f"GitHub API error: {user_response.status_code}"
        
        except Exception as e:
            logger.error(f"Error scraping GitHub profile {username}: {e}")
            profile_data['error'] = str(e)
        
        return profile_data
    
    def _calculate_github_activity_score(self, profile_data: Dict[str, Any]) -> float:
        """Calculate GitHub activity score based on various metrics"""
        try:
            stats = profile_data['stats']
            
            # Base score from repositories
            repo_score = min(50, stats.get('public_repos', 0) * 2)
            
            # Stars and forks score
            popularity_score = min(30, (stats.get('total_stars', 0) + stats.get('total_forks', 0)) * 0.5)
            
            # Followers score
            followers_score = min(10, stats.get('followers', 0) * 0.5)
            
            # Language diversity score
            language_count = len(profile_data.get('languages', {}))
            diversity_score = min(10, language_count * 2)
            
            total_score = repo_score + popularity_score + followers_score + diversity_score
            return min(100, total_score)
            
        except Exception as e:
            logger.error(f"Error calculating GitHub activity score: {e}")
            return 0
    
    async def scrape_leetcode_profile(self, username: str) -> Dict[str, Any]:
        """Scrape LeetCode profile (basic version without API)"""
        profile_data = {
            'platform': 'leetcode',
            'username': username,
            'profile_url': f'https://leetcode.com/{username}/',
            'stats': {},
            'activity_score': 0,
            'error': None
        }
        
        try:
            if not SCRAPING_AVAILABLE:
                profile_data['error'] = "Web scraping libraries not available"
                return profile_data
            
            # LeetCode requires more complex scraping - simplified version
            response = self.session.get(f'https://leetcode.com/{username}/')
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Try to extract basic stats (this is simplified - real implementation would be more complex)
                profile_data['stats'] = {
                    'status': 'profile_exists',
                    'note': 'LeetCode scraping requires advanced techniques - showing basic validation only'
                }
                profile_data['activity_score'] = 50  # Default score for existing profile
            else:
                profile_data['error'] = f"Profile not found or private: {response.status_code}"
        
        except Exception as e:
            logger.error(f"Error scraping LeetCode profile {username}: {e}")
            profile_data['error'] = str(e)
        
        return profile_data
    
    async def scrape_hackerrank_profile(self, username: str) -> Dict[str, Any]:
        """Scrape HackerRank profile"""
        profile_data = {
            'platform': 'hackerrank',
            'username': username,
            'profile_url': f'https://hackerrank.com/{username}',
            'stats': {},
            'activity_score': 0,
            'error': None
        }
        
        try:
            if not SCRAPING_AVAILABLE:
                profile_data['error'] = "Web scraping libraries not available"
                return profile_data
            
            # HackerRank basic validation
            response = self.session.get(f'https://hackerrank.com/{username}')
            
            if response.status_code == 200:
                profile_data['stats'] = {
                    'status': 'profile_exists',
                    'note': 'HackerRank scraping requires advanced techniques - showing basic validation only'
                }
                profile_data['activity_score'] = 40  # Default score
            else:
                profile_data['error'] = f"Profile not accessible: {response.status_code}"
        
        except Exception as e:
            logger.error(f"Error scraping HackerRank profile {username}: {e}")
            profile_data['error'] = str(e)
        
        return profile_data
    
    async def scrape_all_profiles(self, profiles: Dict[str, str]) -> Dict[str, Any]:
        """Scrape all detected coding profiles"""
        results = {
            'profiles_found': len(profiles),
            'profiles_data': {},
            'summary': {
                'total_activity_score': 0,
                'platforms_active': 0,
                'top_languages': {},
                'total_repositories': 0,
                'coding_activity_level': 'Unknown'
            }
        }
        
        # Scrape each platform
        for platform, username in profiles.items():
            if platform == 'github':
                results['profiles_data'][platform] = await self.scrape_github_profile(username)
            elif platform == 'leetcode':
                results['profiles_data'][platform] = await self.scrape_leetcode_profile(username)
            elif platform == 'hackerrank':
                results['profiles_data'][platform] = await self.scrape_hackerrank_profile(username)
            else:
                # For other platforms, just store the username
                results['profiles_data'][platform] = {
                    'platform': platform,
                    'username': username,
                    'profile_url': f'https://{platform}.com/{username}',
                    'note': 'Profile detected but scraping not implemented'
                }
        
        # Calculate summary
        results['summary'] = self._calculate_coding_summary(results['profiles_data'])
        
        return results
    
    def _calculate_coding_summary(self, profiles_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate overall coding activity summary"""
        summary = {
            'total_activity_score': 0,
            'platforms_active': 0,
            'top_languages': {},
            'total_repositories': 0,
            'coding_activity_level': 'Beginner'
        }
        
        try:
            total_score = 0
            active_platforms = 0
            all_languages = {}
            total_repos = 0
            
            for platform, data in profiles_data.items():
                if not data.get('error'):
                    active_platforms += 1
                    score = data.get('activity_score', 0)
                    total_score += score
                    
                    # Aggregate languages
                    if 'languages' in data:
                        for lang, count in data['languages'].items():
                            all_languages[lang] = all_languages.get(lang, 0) + count
                    
                    # Count repositories
                    if 'repositories' in data:
                        total_repos += len(data['repositories'])
                    elif 'stats' in data and 'public_repos' in data['stats']:
                        total_repos += data['stats']['public_repos']
            
            summary['total_activity_score'] = total_score
            summary['platforms_active'] = active_platforms
            summary['total_repositories'] = total_repos
            
            # Top languages
            if all_languages:
                sorted_languages = sorted(all_languages.items(), key=lambda x: x[1], reverse=True)
                summary['top_languages'] = dict(sorted_languages[:5])
            
            # Activity level classification
            if total_score >= 200:
                summary['coding_activity_level'] = 'Expert'
            elif total_score >= 100:
                summary['coding_activity_level'] = 'Advanced'
            elif total_score >= 50:
                summary['coding_activity_level'] = 'Intermediate'
            elif total_score > 0:
                summary['coding_activity_level'] = 'Beginner'
            
        except Exception as e:
            logger.error(f"Error calculating coding summary: {e}")
        
        return summary
    
    def generate_coding_insights(self, profiles_data: Dict[str, Any]) -> List[str]:
        """Generate insights about coding activity"""
        insights = []
        summary = profiles_data.get('summary', {})
        
        try:
            # Activity level insight
            activity_level = summary.get('coding_activity_level', 'Unknown')
            score = summary.get('total_activity_score', 0)
            insights.append(f"Coding Activity Level: {activity_level} (Score: {score})")
            
            # Platform presence
            platforms_active = summary.get('platforms_active', 0)
            if platforms_active > 2:
                insights.append(f"Active on {platforms_active} coding platforms - shows good engagement")
            elif platforms_active > 0:
                insights.append(f"Present on {platforms_active} coding platform(s)")
            
            # Repository count
            total_repos = summary.get('total_repositories', 0)
            if total_repos > 20:
                insights.append(f"Highly active with {total_repos} public repositories")
            elif total_repos > 5:
                insights.append(f"Good project portfolio with {total_repos} repositories")
            elif total_repos > 0:
                insights.append(f"Has {total_repos} public repositories")
            
            # Language diversity
            top_languages = summary.get('top_languages', {})
            if len(top_languages) > 3:
                insights.append(f"Multi-lingual programmer: {', '.join(list(top_languages.keys())[:3])}")
            elif top_languages:
                main_lang = list(top_languages.keys())[0]
                insights.append(f"Primary programming language: {main_lang}")
            
            # GitHub specific insights
            github_data = profiles_data.get('profiles_data', {}).get('github')
            if github_data and not github_data.get('error'):
                stats = github_data.get('stats', {})
                if stats.get('total_stars', 0) > 10:
                    insights.append(f"Repository popularity: {stats['total_stars']} total stars")
                if stats.get('followers', 0) > 20:
                    insights.append(f"Strong community presence: {stats['followers']} followers")
            
        except Exception as e:
            logger.error(f"Error generating coding insights: {e}")
            insights.append("Unable to generate detailed insights")
        
        return insights
    
    def cleanup(self):
        """Cleanup resources"""
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
        
        if self.session:
            try:
                self.session.close()
            except:
                pass

# Global instance
coding_scraper = CodingProfileScraper()