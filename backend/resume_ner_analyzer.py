"""
Resume NER Analyzer using HuggingFace resume-ner-bert-v2 model
Lightweight implementation for resume entity extraction
"""

import re
import json
from typing import Dict, List, Any, Optional
import requests
from datetime import datetime

class ResumeNERAnalyzer:
    """
    Resume analyzer using HuggingFace resume-ner-bert-v2 model
    Falls back to rule-based extraction if model is unavailable
    """
    
    def __init__(self):
        self.model_name = "yashpwr/resume-ner-bert-v2"
        self.hf_api_url = f"https://api-inference.huggingface.co/models/{self.model_name}"
        self.headers = {}
        
        # Initialize with HuggingFace API key if available
        hf_token = self._get_hf_token()
        if hf_token:
            self.headers["Authorization"] = f"Bearer {hf_token}"
    
    def _get_hf_token(self) -> Optional[str]:
        """Get HuggingFace token from environment or return None"""
        import os
        return os.environ.get("NEXT_PUBLIC_HUGGING_FACE_API_KEY") or os.environ.get("HUGGING_FACE_API_KEY")
    
    def analyze_resume_text(self, text: str) -> Dict[str, Any]:
        """
        Analyze resume text using NER model
        
        Args:
            text: Resume text content
            
        Returns:
            Dictionary containing extracted entities and analysis
        """
        try:
            # Try HuggingFace API first
            entities = self._extract_entities_hf_api(text)
            if entities:
                analysis = self._process_entities(entities, text)
                analysis["analysis_method"] = "huggingface_api"
                return analysis
        except Exception as e:
            print(f"HuggingFace API failed: {e}")
        
        # Fallback to rule-based extraction
        print("Falling back to rule-based analysis...")
        analysis = self._rule_based_analysis(text)
        analysis["analysis_method"] = "rule_based"
        return analysis
    
    def _extract_entities_hf_api(self, text: str) -> List[Dict[str, Any]]:
        """Extract entities using HuggingFace Inference API"""
        try:
            # Truncate text if too long for API
            max_length = 5000
            if len(text) > max_length:
                text = text[:max_length]
            
            payload = {"inputs": text}
            response = requests.post(
                self.hf_api_url,
                headers=self.headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"HF API error: {response.status_code} - {response.text}")
                return []
                
        except Exception as e:
            print(f"Error calling HuggingFace API: {e}")
            return []
    
    def _process_entities(self, entities: List[Dict[str, Any]], text: str) -> Dict[str, Any]:
        """Process NER entities into structured resume analysis"""
        
        # Group entities by type
        entity_groups = {}
        for entity in entities:
            entity_type = entity.get("entity_group", entity.get("label", "UNKNOWN"))
            if entity_type not in entity_groups:
                entity_groups[entity_type] = []
            
            entity_groups[entity_type].append({
                "text": entity.get("word", ""),
                "confidence": entity.get("score", 0.0),
                "start": entity.get("start", 0),
                "end": entity.get("end", 0)
            })
        
        # Extract structured information
        analysis = {
            "entities": entity_groups,
            "skills": self._extract_skills_from_entities(entity_groups),
            "experience": self._extract_experience_from_entities(entity_groups, text),
            "education": self._extract_education_from_entities(entity_groups, text),
            "contact_info": self._extract_contact_from_entities(entity_groups, text),
            "certifications": self._extract_certifications_from_entities(entity_groups, text),
            "projects": self._extract_projects_from_entities(entity_groups, text),
            "overall_score": self._calculate_overall_score(entity_groups, text),
            "analysis_timestamp": datetime.now().isoformat(),
            "entity_count": len(entities),
            "confidence_avg": sum(e.get("score", 0) for e in entities) / len(entities) if entities else 0
        }
        
        return analysis
    
    def _extract_skills_from_entities(self, entities: Dict[str, List]) -> List[Dict[str, Any]]:
        """Extract skills from NER entities"""
        skills = []
        
        # Look for skill-related entity types
        skill_types = ["Skills", "SKILLS", "Skill", "SKILL", "Technology", "TECHNOLOGY"]
        
        for skill_type in skill_types:
            if skill_type in entities:
                for skill_entity in entities[skill_type]:
                    skills.append({
                        "name": skill_entity["text"].strip(),
                        "confidence": skill_entity["confidence"],
                        "category": "Technical"
                    })
        
        # Add rule-based skill extraction as backup
        if not skills:
            skills = self._extract_skills_rule_based(entities.get("O", []))
        
        return skills
    
    def _extract_experience_from_entities(self, entities: Dict[str, List], text: str) -> Dict[str, Any]:
        """Extract experience information from entities"""
        
        # Look for work experience entities
        experience_types = ["Experience", "EXPERIENCE", "Work", "WORK", "Job", "JOB", "Companies", "COMPANIES"]
        
        experience = {
            "total_years": 0,
            "positions": [],
            "companies": [],
            "keywords": []
        }
        
        for exp_type in experience_types:
            if exp_type in entities:
                for exp_entity in entities[exp_type]:
                    experience["keywords"].append(exp_entity["text"])
        
        # Rule-based experience extraction
        years_match = re.findall(r'(\d+)\s*(?:years?|yrs?)', text.lower())
        if years_match:
            experience["total_years"] = max(int(year) for year in years_match)
        
        return experience
    
    def _extract_education_from_entities(self, entities: Dict[str, List], text: str) -> Dict[str, Any]:
        """Extract education information from entities"""
        
        education_types = ["Education", "EDUCATION", "Degree", "DEGREE", "University", "UNIVERSITY", "College", "COLLEGE"]
        
        education = {
            "degrees": [],
            "institutions": [],
            "fields": [],
            "graduation_years": []
        }
        
        for edu_type in education_types:
            if edu_type in entities:
                for edu_entity in entities[edu_type]:
                    text_lower = edu_entity["text"].lower()
                    
                    if any(degree in text_lower for degree in ["bachelor", "master", "phd", "b.tech", "m.tech", "bca", "mca"]):
                        education["degrees"].append(edu_entity["text"])
                    elif any(inst in text_lower for inst in ["university", "college", "institute", "iit", "nit"]):
                        education["institutions"].append(edu_entity["text"])
        
        return education
    
    def _extract_contact_from_entities(self, entities: Dict[str, List], text: str) -> Dict[str, Any]:
        """Extract contact information from entities"""
        
        contact_types = ["Name", "NAME", "Email", "EMAIL", "Phone", "PHONE", "Location", "LOCATION"]
        
        contact = {
            "name": "",
            "email": "",
            "phone": "",
            "location": ""
        }
        
        # Email regex
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        if email_match:
            contact["email"] = email_match.group()
        
        # Phone regex
        phone_match = re.search(r'[\+]?[1-9]?[0-9]{7,15}', text)
        if phone_match:
            contact["phone"] = phone_match.group()
        
        return contact
    
    def _extract_certifications_from_entities(self, entities: Dict[str, List], text: str) -> List[str]:
        """Extract certifications from entities"""
        cert_types = ["Certification", "CERTIFICATION", "Certificate", "CERTIFICATE"]
        
        certifications = []
        for cert_type in cert_types:
            if cert_type in entities:
                for cert_entity in entities[cert_type]:
                    certifications.append(cert_entity["text"])
        
        return certifications
    
    def _extract_projects_from_entities(self, entities: Dict[str, List], text: str) -> List[str]:
        """Extract projects from entities"""
        project_types = ["Project", "PROJECT", "Projects", "PROJECTS"]
        
        projects = []
        for proj_type in project_types:
            if proj_type in entities:
                for proj_entity in entities[proj_type]:
                    projects.append(proj_entity["text"])
        
        return projects
    
    def _calculate_overall_score(self, entities: Dict[str, List], text: str) -> int:
        """Calculate overall resume score based on extracted entities"""
        score = 50  # Base score
        
        # Add points for different sections
        if "Skills" in entities or "SKILLS" in entities:
            score += 15
        
        if "Experience" in entities or "EXPERIENCE" in entities:
            score += 20
        
        if "Education" in entities or "EDUCATION" in entities:
            score += 10
        
        if len(text) > 1000:  # Substantial content
            score += 5
        
        return min(score, 100)
    
    def _rule_based_analysis(self, text: str) -> Dict[str, Any]:
        """Enhanced rule-based analysis with comprehensive ATS scoring and analysis functions"""
        
        # Comprehensive technical skills database with categories
        skill_categories = {
            "Programming Languages": ["Python", "JavaScript", "Java", "TypeScript", "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin", "Scala", "R"],
            "Web Development": ["React", "Angular", "Vue.js", "Node.js", "Express", "Django", "Flask", "Spring Boot", "Laravel", "Ruby on Rails"],
            "Frontend Technologies": ["HTML", "CSS", "SCSS", "SASS", "Bootstrap", "Tailwind", "jQuery", "Webpack", "Vite"],
            "Backend Technologies": ["Node.js", "Express", "Django", "Flask", "Spring", "ASP.NET", "FastAPI", "GraphQL", "REST API"],
            "Databases": ["MySQL", "PostgreSQL", "MongoDB", "Redis", "SQLite", "Oracle", "SQL Server", "DynamoDB", "Cassandra"],
            "Cloud & DevOps": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Jenkins", "CI/CD", "Terraform", "Ansible"],
            "Mobile Development": ["React Native", "Flutter", "Swift", "Kotlin", "Xamarin", "Ionic"],
            "Data & AI": ["Machine Learning", "Data Science", "TensorFlow", "PyTorch", "Pandas", "NumPy", "Scikit-learn", "Jupyter"],
            "Tools & Platforms": ["Git", "GitHub", "GitLab", "Jira", "Slack", "VS Code", "IntelliJ", "Linux", "Windows", "macOS"]
        }
        
        all_skills = []
        for category, skills in skill_categories.items():
            all_skills.extend([(skill, category) for skill in skills])
        
        # Extract skills with categories and confidence scoring
        found_skills = []
        text_lower = text.lower()
        for skill, category in all_skills:
            if skill.lower() in text_lower:
                # Calculate confidence based on context
                skill_mentions = len(re.findall(r'\b' + re.escape(skill.lower()) + r'\b', text_lower))
                confidence = min(0.6 + (skill_mentions * 0.1), 1.0)
                
                found_skills.append({
                    "name": skill,
                    "confidence": confidence,
                    "category": category,
                    "mentions": skill_mentions
                })
        
        # Extract experience years with better patterns
        years_patterns = [
            r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)',
            r'(\d+)\+?\s*(?:years?|yrs?)',
            r'(?:experience|exp)[:\s]+(\d+)\s*(?:years?|yrs?)',
        ]
        
        years_found = []
        for pattern in years_patterns:
            matches = re.findall(pattern, text_lower)
            years_found.extend([int(year) for year in matches])
        
        total_years = max(years_found) if years_found else 0
        
        # Extract contact info with better regex
        email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        phone_patterns = [
            r'[\+]?[1-9]?[0-9]{7,15}',
            r'\(\d{3}\)\s?\d{3}-?\d{4}',
            r'\d{3}[-.]?\d{3}[-.]?\d{4}'
        ]
        
        phone_match = None
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                break
        
        # Extract name (usually first line or after common headers)
        name_patterns = [
            r'(?:^|\n)([A-Z][a-z]+\s+[A-Z][a-z]+)',  # First Name Last Name
            r'(?:name[:\s]+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # After "Name:"
        ]
        
        name_match = None
        for pattern in name_patterns:
            name_match = re.search(pattern, text, re.MULTILINE | re.IGNORECASE)
            if name_match:
                break
        
        # Extract education
        education_keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college', 'institute']
        education_lines = []
        for line in text.split('\n'):
            if any(keyword in line.lower() for keyword in education_keywords):
                education_lines.append(line.strip())
        
        # Extract companies/positions
        job_keywords = ['developer', 'engineer', 'manager', 'analyst', 'designer', 'consultant']
        experience_lines = []
        for line in text.split('\n'):
            if any(keyword in line.lower() for keyword in job_keywords):
                experience_lines.append(line.strip())
        
        # Extract project keywords
        project_patterns = [
            r'(?:project[s]?[:\s]+)([^\n]+)',
            r'(?:built|developed|created|designed)\s+([^\n,.]+)',
        ]
        
        projects = []
        for pattern in project_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            projects.extend([match.strip() for match in matches[:3]])  # Limit to first 3
        
        # Comprehensive ATS Scoring System
        ats_scores = self._calculate_ats_scores(text, found_skills, total_years, email_match, phone_match, education_lines, projects)
        
        # Calculate overall score
        base_score = ats_scores["overall_ats_score"]
        
        # Generate comprehensive analysis with ATS functionality
        analysis = {
            "entities": {},
            "skills": found_skills,
            "experience": {
                "total_years": total_years,
                "positions": experience_lines[:3],  # Top 3 positions
                "companies": [],
                "keywords": job_keywords,
                "skill_years_mapping": self._estimate_skill_experience(found_skills, total_years)
            },
            "education": {
                "degrees": education_lines[:2],  # Top 2 education entries
                "institutions": [],
                "fields": [],
                "graduation_years": []
            },
            "contact_info": {
                "name": name_match.group(1) if name_match else "Candidate",
                "email": email_match.group() if email_match else "",
                "phone": phone_match.group() if phone_match else "",
                "location": self._extract_location(text)
            },
            "certifications": self._extract_certifications(text),
            "projects": projects,
            "overall_score": min(base_score, 100),
            "ats_analysis": ats_scores,
            "skill_analysis": self._analyze_skills_comprehensively(found_skills),
            "career_recommendations": self._generate_career_recommendations(found_skills, total_years),
            "improvement_suggestions": self._generate_improvement_suggestions(text, found_skills, ats_scores),
            "keyword_density": self._calculate_keyword_density(text, found_skills),
            "analysis_timestamp": datetime.now().isoformat(),
            "entity_count": len(found_skills) + len(projects) + len(education_lines),
            "confidence_avg": sum([skill["confidence"] for skill in found_skills]) / len(found_skills) if found_skills else 0.5,
            "extracted_content_preview": text[:500] + "..." if len(text) > 500 else text
        }
        
        return analysis
    
    def _extract_skills_rule_based(self, other_entities: List) -> List[Dict[str, Any]]:
        """Rule-based skill extraction from other entities"""
        tech_skills = [
            "Python", "JavaScript", "Java", "React", "Node.js", "HTML", "CSS",
            "MongoDB", "MySQL", "PostgreSQL", "Docker", "Kubernetes", "AWS"
        ]
        
        found_skills = []
        for entity in other_entities:
            text = entity.get("text", "")
            for skill in tech_skills:
                if skill.lower() in text.lower():
                    found_skills.append({
                        "name": skill,
                        "confidence": entity.get("confidence", 0.7),
                        "category": "Technical"
                    })
        
        return found_skills
    
    def _calculate_ats_scores(self, text: str, skills: List, years: int, email: bool, phone: bool, education: List, projects: List) -> Dict[str, Any]:
        """Calculate comprehensive ATS scores"""
        scores = {}
        
        # Content Quality Score (40 points)
        content_score = 0
        if len(text) > 500: content_score += 10
        if len(text) > 1000: content_score += 5
        if len(skills) >= 5: content_score += 10
        if len(skills) >= 10: content_score += 5
        if projects: content_score += len(projects) * 2
        if education: content_score += 10
        
        # Contact Information Score (20 points)
        contact_score = 0
        if email: contact_score += 10
        if phone: contact_score += 10
        
        # Experience Score (25 points)
        exp_score = 0
        if years > 0: exp_score += min(years * 3, 15)
        if years >= 5: exp_score += 5
        if years >= 10: exp_score += 5
        
        # Format & Keywords Score (15 points)
        format_score = 0
        if re.search(r'\b(experience|education|skills|projects)\b', text.lower()): format_score += 5
        if re.search(r'\b(bachelor|master|phd|degree)\b', text.lower()): format_score += 5
        if len(re.findall(r'\d+', text)) >= 5: format_score += 5  # Numbers indicate metrics
        
        total_ats = content_score + contact_score + exp_score + format_score
        
        return {
            "overall_ats_score": min(total_ats, 100),
            "content_quality_score": content_score,
            "contact_info_score": contact_score,
            "experience_score": exp_score,
            "format_keywords_score": format_score,
            "ats_compatibility": "High" if total_ats >= 80 else "Medium" if total_ats >= 60 else "Low",
            "ats_issues": self._identify_ats_issues(text, email, phone, skills, education),
            "ats_recommendations": self._generate_ats_recommendations(text, skills, years)
        }
    
    def _identify_ats_issues(self, text: str, email: bool, phone: bool, skills: List, education: List) -> List[str]:
        """Identify ATS compatibility issues"""
        issues = []
        
        if not email: issues.append("Missing email address")
        if not phone: issues.append("Missing phone number")
        if len(skills) < 5: issues.append("Too few technical skills listed")
        if len(text) < 500: issues.append("Resume content too brief")
        if not education: issues.append("No clear education section")
        if not re.search(r'\d+', text): issues.append("Missing quantifiable achievements")
        
        return issues
    
    def _generate_ats_recommendations(self, text: str, skills: List, years: int) -> List[str]:
        """Generate ATS improvement recommendations"""
        recommendations = []
        
        if len(skills) < 10: recommendations.append("Add more relevant technical skills")
        if years < 2: recommendations.append("Highlight any internships or project experience")
        if not re.search(r'\d+%', text): recommendations.append("Include percentage improvements in achievements")
        recommendations.append("Use standard section headers (Experience, Education, Skills)")
        recommendations.append("Include action verbs (developed, implemented, optimized)")
        
        return recommendations
    
    def _estimate_skill_experience(self, skills: List, total_years: int) -> Dict[str, int]:
        """Estimate years of experience for each skill"""
        skill_years = {}
        for skill in skills:
            # Estimate based on confidence and total experience
            estimated_years = int(skill["confidence"] * total_years) if total_years > 0 else 1
            skill_years[skill["name"]] = max(estimated_years, 1)
        return skill_years
    
    def _extract_location(self, text: str) -> str:
        """Extract location information"""
        location_patterns = [
            r'(?:address|location)[:\s]*([^\n]+)',
            r'([A-Z][a-z]+,\s*[A-Z]{2})',  # City, State
            r'([A-Z][a-z]+\s*,\s*[A-Z][a-z]+)'  # City, Country
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""
    
    def _extract_certifications(self, text: str) -> List[str]:
        """Extract certifications"""
        cert_keywords = ['certified', 'certification', 'certificate', 'aws', 'azure', 'google cloud', 'cissp', 'comptia']
        certs = []
        
        for line in text.split('\n'):
            if any(keyword in line.lower() for keyword in cert_keywords):
                certs.append(line.strip())
        
        return certs[:5]  # Limit to 5 certifications
    
    def _analyze_skills_comprehensively(self, skills: List) -> Dict[str, Any]:
        """Comprehensive skill analysis"""
        if not skills:
            return {"total_skills": 0, "categories": {}, "top_skills": []}
        
        # Group by category
        categories = {}
        for skill in skills:
            cat = skill["category"]
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(skill)
        
        # Find top skills by confidence
        top_skills = sorted(skills, key=lambda x: x["confidence"], reverse=True)[:10]
        
        return {
            "total_skills": len(skills),
            "categories": {cat: len(skills_list) for cat, skills_list in categories.items()},
            "top_skills": [{"name": s["name"], "confidence": s["confidence"]} for s in top_skills],
            "skill_distribution": categories
        }
    
    def _generate_career_recommendations(self, skills: List, years: int) -> List[Dict[str, Any]]:
        """Generate career recommendations based on skills"""
        recommendations = []
        
        skill_names = [s["name"].lower() for s in skills]
        
        # Define career paths based on skills
        career_paths = {
            "Full Stack Developer": ["javascript", "react", "node.js", "python", "html", "css"],
            "Data Scientist": ["python", "machine learning", "pandas", "tensorflow", "r"],
            "DevOps Engineer": ["docker", "kubernetes", "aws", "jenkins", "ci/cd"],
            "Frontend Developer": ["react", "angular", "vue.js", "html", "css", "javascript"],
            "Backend Developer": ["node.js", "python", "java", "django", "express"],
            "Mobile Developer": ["react native", "flutter", "swift", "kotlin"],
            "Cloud Engineer": ["aws", "azure", "gcp", "terraform", "docker"]
        }
        
        for career, required_skills in career_paths.items():
            match_count = sum(1 for skill in required_skills if skill in skill_names)
            match_percentage = (match_count / len(required_skills)) * 100
            
            if match_percentage >= 40:  # At least 40% match
                recommendations.append({
                    "title": career,
                    "match_percentage": int(match_percentage),
                    "salary_range": self._estimate_salary_range(career, years),
                    "growth_potential": "High" if match_percentage >= 70 else "Medium"
                })
        
        return sorted(recommendations, key=lambda x: x["match_percentage"], reverse=True)[:5]
    
    def _estimate_salary_range(self, career: str, years: int) -> str:
        """Estimate salary range based on career and experience"""
        base_salaries = {
            "Full Stack Developer": 70000,
            "Data Scientist": 85000,
            "DevOps Engineer": 90000,
            "Frontend Developer": 65000,
            "Backend Developer": 75000,
            "Mobile Developer": 80000,
            "Cloud Engineer": 95000
        }
        
        base = base_salaries.get(career, 70000)
        adjusted = base + (years * 8000)  # $8k per year of experience
        
        return f"${adjusted:,} - ${adjusted + 20000:,}"
    
    def _generate_improvement_suggestions(self, text: str, skills: List, ats_scores: Dict) -> List[Dict[str, str]]:
        """Generate improvement suggestions"""
        suggestions = []
        
        if ats_scores["overall_ats_score"] < 80:
            suggestions.append({
                "category": "ATS Optimization",
                "suggestion": "Improve ATS compatibility by adding more relevant keywords",
                "priority": "High"
            })
        
        if len(skills) < 8:
            suggestions.append({
                "category": "Skills",
                "suggestion": "Add more technical skills relevant to your field",
                "priority": "High"
            })
        
        if not re.search(r'\d+%|\d+x|increased|improved|reduced', text):
            suggestions.append({
                "category": "Achievements",
                "suggestion": "Include quantifiable achievements with numbers and percentages",
                "priority": "High"
            })
        
        suggestions.append({
            "category": "Format",
            "suggestion": "Use action verbs to start bullet points (Developed, Implemented, Led)",
            "priority": "Medium"
        })
        
        return suggestions
    
    def _calculate_keyword_density(self, text: str, skills: List) -> Dict[str, float]:
        """Calculate keyword density for ATS optimization"""
        word_count = len(text.split())
        keyword_density = {}
        
        for skill in skills:
            skill_count = len(re.findall(r'\b' + re.escape(skill["name"].lower()) + r'\b', text.lower()))
            density = (skill_count / word_count) * 100 if word_count > 0 else 0
            keyword_density[skill["name"]] = round(density, 2)
        
        return keyword_density

def analyze_resume_with_ner(text: str) -> Dict[str, Any]:
    """
    Main function to analyze resume using NER model
    
    Args:
        text: Resume text content
        
    Returns:
        Dictionary containing resume analysis
    """
    analyzer = ResumeNERAnalyzer()
    return analyzer.analyze_resume_text(text)

# Test function
if __name__ == "__main__":
    sample_text = """
    John Doe
    Software Engineer
    john.doe@email.com
    +1-234-567-8900
    
    Experience:
    - 3 years as Python Developer at TechCorp
    - Built web applications using React and Node.js
    - Worked with MongoDB and PostgreSQL databases
    
    Skills: Python, JavaScript, React, Node.js, MongoDB, Docker, AWS
    
    Education:
    Bachelor of Technology in Computer Science
    Indian Institute of Technology, Delhi (2020)
    
    Projects:
    - E-commerce Platform using MERN stack
    - Machine Learning model for price prediction
    """
    
    result = analyze_resume_with_ner(sample_text)
    print(json.dumps(result, indent=2))