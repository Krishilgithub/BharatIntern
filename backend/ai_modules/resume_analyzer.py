"""Resume Analysis Module with Advanced ML/AI capabilities"""
import re
import logging
from typing import Dict, List, Any, Optional
from .base_model import BaseAIModel

# Import advanced analyzer
try:
    from .advanced_resume_analyzer import resume_analyzer as advanced_analyzer
    ADVANCED_ANALYZER_AVAILABLE = True
except ImportError:
    print("Warning: Advanced resume analyzer not available")
    ADVANCED_ANALYZER_AVAILABLE = False
    advanced_analyzer = None

logger = logging.getLogger(__name__)

class ResumeAnalyzer(BaseAIModel):
    """AI model for comprehensive resume analysis with ML/AI capabilities"""
    
    def __init__(self):
        super().__init__("Resume_Analyzer")
        self.skill_database = self._initialize_skill_database()
        self.nlp_processor = None
        self.advanced_analyzer = advanced_analyzer
    
    async def initialize(self) -> bool:
        """Initialize the resume analyzer with advanced ML capabilities"""
        try:
            self.logger.info("🚀 Initializing Resume Analyzer...")
            
            # Initialize advanced analyzer if available
            if ADVANCED_ANALYZER_AVAILABLE and self.advanced_analyzer:
                await self.advanced_analyzer.initialize()
                self.logger.info("✅ Advanced ML Resume Analyzer loaded")
            else:
                self.logger.warning("⚠️ Using basic resume analyzer - ML features unavailable")
            
            # Initialize basic NLP processor as fallback
            try:
                from .nlp_processor import NLPProcessor
                self.nlp_processor = NLPProcessor()
                await self.nlp_processor.initialize()
                self.logger.info("✅ Basic NLP processor loaded")
            except Exception as e:
                self.logger.warning(f"⚠️ Basic NLP processor failed to load: {e}")
            
            self.is_initialized = True
            self.logger.info("🎉 Resume Analyzer initialized successfully!")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to initialize Resume Analyzer: {e}")
            return False
    
    def validate_input(self, input_data: Any) -> bool:
        """Validate resume input data"""
        if not isinstance(input_data, str):
            return False
        if len(input_data.strip()) < 10:  # Minimum length check
            return False
        return True

    async def process(self, resume_text: str, job_description: str = None) -> Dict[str, Any]:
        """Process resume with advanced ML analysis"""
        if not self.validate_input(resume_text):
            return {"error": "Invalid resume data", "analysis_type": "error"}
        
        try:
            # Use advanced analyzer if available
            if ADVANCED_ANALYZER_AVAILABLE and self.advanced_analyzer and self.advanced_analyzer.initialized:
                self.logger.info("🔍 Using advanced ML analysis...")
                return self.advanced_analyzer.analyze_resume_comprehensive(resume_text, job_description)
            
            # Fallback to basic analysis
            self.logger.info("📋 Using basic resume analysis...")
            result = await self._basic_analysis(resume_text)
            return result
            
        except Exception as e:
            self.logger.error(f"❌ Resume analysis failed: {e}")
            return {
                "error": str(e),
                "analysis_type": "error",
                "fallback_data": await self._emergency_fallback(resume_text)
            }
    
    async def _basic_analysis(self, resume_text: str) -> Dict[str, Any]:
        """Basic resume analysis without advanced ML"""
        try:
            result = {
                "timestamp": "2024-01-01T00:00:00",
                "analysis_type": "basic",
                "overall_score": 75,
                "personal_info": await self.extract_personal_info(resume_text),
                "skills": await self.extract_skills(resume_text),
                "experience": await self.extract_experience(resume_text),
                "education": await self.extract_education(resume_text),
                "projects": await self.extract_projects(resume_text),
                "certifications": await self.extract_certifications(resume_text),
                "summary": await self.generate_resume_summary(resume_text),
                "score": await self.calculate_resume_score(resume_text),
                "recommendations": await self.generate_recommendations(resume_text)
            }
            
            return result
            
        except Exception as e:
            self.logger.error(f"Error processing resume: {e}")
            return {"error": str(e)}
    
    async def extract_personal_info(self, resume_text: str) -> Dict[str, Any]:
        """Extract personal information from resume"""
        try:
            personal_info = {}
            
            # Extract email
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, resume_text)
            personal_info["email"] = emails[0] if emails else None
            
            # Extract phone numbers
            phone_pattern = r'\b(?:\+?1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b'
            phones = re.findall(phone_pattern, resume_text)
            personal_info["phone"] = phones[0] if phones else None
            
            # Extract LinkedIn
            linkedin_pattern = r'linkedin\.com/in/([A-Za-z0-9-]+)'
            linkedin_matches = re.findall(linkedin_pattern, resume_text, re.IGNORECASE)
            personal_info["linkedin"] = linkedin_matches[0] if linkedin_matches else None
            
            # Extract GitHub
            github_pattern = r'github\.com/([A-Za-z0-9-]+)'
            github_matches = re.findall(github_pattern, resume_text, re.IGNORECASE)
            personal_info["github"] = github_matches[0] if github_matches else None
            
            # Use NLP to extract name (first few words, typically)
            if self.nlp_processor and hasattr(self.nlp_processor, 'nlp') and self.nlp_processor.nlp:
                doc = self.nlp_processor.nlp(resume_text[:500])  # First 500 chars
                person_entities = [ent.text for ent in doc.ents if ent.label_ == "PERSON"]
                personal_info["name"] = person_entities[0] if person_entities else None
            
            return personal_info
            
        except Exception as e:
            self.logger.error(f"Error extracting personal info: {e}")
            return {}
    
    async def extract_skills(self, resume_text: str) -> Dict[str, List[str]]:
        """Extract skills categorized by type"""
        try:
            skills = {
                "programming_languages": [],
                "frameworks": [],
                "databases": [],
                "tools": [],
                "cloud_platforms": [],
                "soft_skills": []
            }
            
            resume_lower = resume_text.lower()
            
            # Check each skill category
            for category, skill_list in self.skill_database.items():
                for skill in skill_list:
                    if skill.lower() in resume_lower:
                        skills[category].append(skill)
            
            # Remove duplicates
            for category in skills:
                skills[category] = list(set(skills[category]))
            
            return skills
            
        except Exception as e:
            self.logger.error(f"Error extracting skills: {e}")
            return {}
    
    async def extract_experience(self, resume_text: str) -> List[Dict[str, Any]]:
        """Extract work experience information"""
        try:
            experiences = []
            
            # Look for experience section
            experience_patterns = [
                r'(experience|work history|employment|professional experience)([\s\S]*?)(?=education|skills|projects|certifications|$)',
                r'(\d{4}[-\s]\d{4}|\d{1,2}/\d{4}[-\s]\d{1,2}/\d{4})([\s\S]*?)(?=\d{4}[-\s]\d{4}|\d{1,2}/\d{4}|education|skills|$)'
            ]
            
            for pattern in experience_patterns:
                matches = re.findall(pattern, resume_text, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    if isinstance(match, tuple):
                        experience_text = match[1] if len(match) > 1 else match[0]
                    else:
                        experience_text = match
                    
                    # Extract job titles, companies, and dates
                    job_info = await self._parse_experience_entry(experience_text)
                    if job_info:
                        experiences.append(job_info)
            
            return experiences[:5]  # Limit to 5 most recent
            
        except Exception as e:
            self.logger.error(f"Error extracting experience: {e}")
            return []
    
    async def _parse_experience_entry(self, experience_text: str) -> Optional[Dict[str, Any]]:
        """Parse individual experience entry"""
        try:
            # This is a simplified parser - in production, you'd use more sophisticated NLP
            lines = [line.strip() for line in experience_text.split('\n') if line.strip()]
            
            if not lines:
                return None
            
            job_info = {
                "title": lines[0] if lines else None,
                "company": lines[1] if len(lines) > 1 else None,
                "duration": None,
                "description": ' '.join(lines[2:]) if len(lines) > 2 else None,
                "technologies": []
            }
            
            # Extract technologies mentioned
            text_lower = experience_text.lower()
            for category, skills in self.skill_database.items():
                for skill in skills:
                    if skill.lower() in text_lower:
                        job_info["technologies"].append(skill)
            
            return job_info
            
        except Exception as e:
            self.logger.error(f"Error parsing experience entry: {e}")
            return None
    
    async def extract_education(self, resume_text: str) -> List[Dict[str, Any]]:
        """Extract education information"""
        try:
            education = []
            
            # Common degree patterns
            degree_patterns = [
                r'(bachelor|master|phd|doctorate|associate|diploma)\s+(of|in|degree)?\s*([\w\s,]+)',
                r'(b\.?[as]|m\.?[as]|ph\.?d|doctorate)\s*([\w\s,]+)',
                r'(undergraduate|graduate)\s+(degree|program)\s+in\s+([\w\s,]+)'
            ]
            
            for pattern in degree_patterns:
                matches = re.findall(pattern, resume_text, re.IGNORECASE)
                for match in matches:
                    if isinstance(match, tuple) and len(match) >= 2:
                        education.append({
                            "degree": match[0],
                            "field": match[2] if len(match) > 2 else match[1],
                            "institution": None,  # Would need more sophisticated parsing
                            "year": None
                        })
            
            return education
            
        except Exception as e:
            self.logger.error(f"Error extracting education: {e}")
            return []
    
    async def extract_projects(self, resume_text: str) -> List[Dict[str, Any]]:
        """Extract project information"""
        try:
            projects = []
            
            # Look for project section
            project_pattern = r'(projects?|portfolio)([\s\S]*?)(?=experience|education|skills|certifications|$)'
            matches = re.findall(project_pattern, resume_text, re.IGNORECASE)
            
            for match in matches:
                project_text = match[1] if isinstance(match, tuple) else match
                # Simple project extraction - would need more sophisticated parsing
                project_lines = [line.strip() for line in project_text.split('\n') if line.strip()]
                
                current_project = None
                for line in project_lines:
                    if len(line) > 10 and not line.startswith('-') and not line.startswith('•'):
                        if current_project:
                            projects.append(current_project)
                        current_project = {
                            "title": line,
                            "description": "",
                            "technologies": []
                        }
                    elif current_project:
                        current_project["description"] += " " + line
                
                if current_project:
                    projects.append(current_project)
            
            return projects[:5]  # Limit to 5 projects
            
        except Exception as e:
            self.logger.error(f"Error extracting projects: {e}")
            return []
    
    async def extract_certifications(self, resume_text: str) -> List[str]:
        """Extract certifications"""
        try:
            certifications = []
            
            # Common certification patterns
            cert_keywords = [
                "certified", "certification", "certificate", "aws", "azure", "google cloud",
                "cissp", "cisa", "cism", "pmp", "scrum master", "agile", "itil"
            ]
            
            for keyword in cert_keywords:
                if keyword.lower() in resume_text.lower():
                    # Extract surrounding context
                    pattern = rf'.{{0,50}}{re.escape(keyword)}.{{0,50}}'
                    matches = re.findall(pattern, resume_text, re.IGNORECASE)
                    certifications.extend(matches)
            
            return list(set(certifications))  # Remove duplicates
            
        except Exception as e:
            self.logger.error(f"Error extracting certifications: {e}")
            return []
    
    async def generate_resume_summary(self, resume_text: str) -> str:
        """Generate a summary of the resume"""
        try:
            if self.nlp_processor and hasattr(self.nlp_processor, 'get_text_statistics'):
                stats = await self.nlp_processor.get_text_statistics(resume_text)
                skills = await self.extract_skills(resume_text)
                
                total_skills = sum(len(skill_list) for skill_list in skills.values())
                
                return f"Resume contains {stats.get('word_count', 0)} words, " \
                       f"{total_skills} identified skills across " \
                       f"{len([k for k, v in skills.items() if v])} categories."
            
            return "Resume processed successfully."
            
        except Exception as e:
            self.logger.error(f"Error generating summary: {e}")
            return "Error generating summary."
    
    async def calculate_resume_score(self, resume_text: str) -> Dict[str, Any]:
        """Calculate a comprehensive resume score"""
        try:
            score = {
                "overall_score": 0,
                "categories": {
                    "completeness": 0,
                    "skills_diversity": 0,
                    "experience_quality": 0,
                    "formatting": 0
                }
            }
            
            # Completeness score (0-25)
            personal_info = await self.extract_personal_info(resume_text)
            completeness = sum(1 for v in personal_info.values() if v is not None)
            score["categories"]["completeness"] = min(25, completeness * 5)
            
            # Skills diversity (0-25)
            skills = await self.extract_skills(resume_text)
            total_skills = sum(len(skill_list) for skill_list in skills.values())
            categories_with_skills = len([k for k, v in skills.items() if v])
            score["categories"]["skills_diversity"] = min(25, total_skills * 2 + categories_with_skills * 3)
            
            # Experience quality (0-25)
            experience = await self.extract_experience(resume_text)
            score["categories"]["experience_quality"] = min(25, len(experience) * 8)
            
            # Formatting score (0-25) - basic check
            word_count = len(resume_text.split())
            if 200 <= word_count <= 800:
                score["categories"]["formatting"] = 25
            elif 100 <= word_count <= 1200:
                score["categories"]["formatting"] = 15
            else:
                score["categories"]["formatting"] = 5
            
            # Calculate overall score
            score["overall_score"] = sum(score["categories"].values())
            
            return score
            
        except Exception as e:
            self.logger.error(f"Error calculating resume score: {e}")
            return {"overall_score": 0, "categories": {}}
    
    async def generate_recommendations(self, resume_text: str) -> List[str]:
        """Generate improvement recommendations"""
        try:
            recommendations = []
            
            # Check personal info
            personal_info = await self.extract_personal_info(resume_text)
            if not personal_info.get("email"):
                recommendations.append("Add a professional email address")
            if not personal_info.get("phone"):
                recommendations.append("Include a contact phone number")
            if not personal_info.get("linkedin"):
                recommendations.append("Add LinkedIn profile for better networking")
            
            # Check skills
            skills = await self.extract_skills(resume_text)
            total_skills = sum(len(skill_list) for skill_list in skills.values())
            if total_skills < 5:
                recommendations.append("Add more relevant technical skills")
            
            # Check experience
            experience = await self.extract_experience(resume_text)
            if len(experience) == 0:
                recommendations.append("Include work experience or internships")
            
            # Check length
            word_count = len(resume_text.split())
            if word_count < 200:
                recommendations.append("Expand resume content - add more details about experience and projects")
            elif word_count > 1000:
                recommendations.append("Consider condensing resume content - aim for 1-2 pages")
            
            return recommendations
            
        except Exception as e:
            self.logger.error(f"Error generating recommendations: {e}")
            return []
    
    def _initialize_skill_database(self) -> Dict[str, List[str]]:
        """Initialize comprehensive skill database"""
        return {
            "programming_languages": [
                "Python", "Java", "JavaScript", "TypeScript", "C++", "C#", "Go", "Rust",
                "PHP", "Ruby", "Swift", "Kotlin", "Scala", "R", "MATLAB", "Julia"
            ],
            "frameworks": [
                "React", "Angular", "Vue.js", "Django", "Flask", "FastAPI", "Spring Boot",
                "Express.js", "Node.js", "Laravel", "Ruby on Rails", "ASP.NET", "Flutter",
                "React Native", "Ionic", "Bootstrap", "Tailwind CSS"
            ],
            "databases": [
                "MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle",
                "SQL Server", "Cassandra", "Neo4j", "DynamoDB", "Firebase"
            ],
            "tools": [
                "Git", "Docker", "Kubernetes", "Jenkins", "Terraform", "Ansible",
                "Webpack", "Vite", "Babel", "ESLint", "Prettier", "Jest", "Cypress",
                "Selenium", "Postman", "Figma", "Adobe Creative Suite"
            ],
            "cloud_platforms": [
                "AWS", "Azure", "Google Cloud", "Heroku", "Vercel", "Netlify",
                "DigitalOcean", "Linode", "CloudFlare"
            ],
            "soft_skills": [
                "Leadership", "Communication", "Problem Solving", "Team Work",
                "Project Management", "Critical Thinking", "Adaptability",
                "Time Management", "Creativity", "Analytical Skills"
            ]
        }