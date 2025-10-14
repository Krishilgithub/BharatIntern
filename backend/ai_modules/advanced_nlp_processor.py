"""Advanced NLP Processing Module with real ML/AI functionality"""
import numpy as np
import pandas as pd
import logging
import re
import json
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime

# Core NLP imports
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    print("Warning: spaCy not installed. Run: pip install spacy && python -m spacy download en_core_web_sm")
    SPACY_AVAILABLE = False
    spacy = None

# ML/AI imports
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    print("Warning: sentence-transformers not installed. Run: pip install sentence-transformers")
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    SentenceTransformer = None

try:
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity
    from sklearn.cluster import KMeans
    from sklearn.decomposition import PCA
    SKLEARN_AVAILABLE = True
except ImportError:
    print("Warning: scikit-learn not installed. Run: pip install scikit-learn")
    SKLEARN_AVAILABLE = False

logger = logging.getLogger(__name__)

class AdvancedNLPProcessor:
    """Advanced NLP processor with real ML/AI functionality"""
    
    def __init__(self):
        self.nlp = None
        self.sentence_model = None
        self.tfidf_vectorizer = None
        self.skills_classifier = None
        self.skills_database = None
        self.job_categories = None
        self.initialized = False
        
    async def initialize(self) -> bool:
        """Initialize all NLP models and databases"""
        try:
            logger.info("🚀 Initializing Advanced NLP Processor...")
            
            # Load spaCy model
            if SPACY_AVAILABLE:
                try:
                    self.nlp = spacy.load("en_core_web_sm")
                    logger.info("✅ SpaCy model loaded")
                except OSError:
                    logger.warning("⚠️ SpaCy model not found. Install with: python -m spacy download en_core_web_sm")
            
            # Load sentence transformer
            if SENTENCE_TRANSFORMERS_AVAILABLE:
                try:
                    self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
                    logger.info("✅ Sentence transformer loaded")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to load sentence transformer: {e}")
            
            # Initialize TF-IDF
            if SKLEARN_AVAILABLE:
                self.tfidf_vectorizer = TfidfVectorizer(
                    max_features=5000,
                    stop_words='english',
                    ngram_range=(1, 3),
                    min_df=1,
                    max_df=0.95
                )
                logger.info("✅ TF-IDF vectorizer initialized")
            
            # Load skills and categories databases
            self._load_skills_database()
            self._load_job_categories()
            
            self.initialized = True
            logger.info("🎉 Advanced NLP Processor initialized successfully!")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize NLP Processor: {e}")
            return False
    
    def _load_skills_database(self):
        """Load comprehensive skills database with categories"""
        self.skills_database = {
            'programming_languages': {
                'python': ['python', 'py', 'django', 'flask', 'fastapi', 'pandas', 'numpy', 'scipy', 'matplotlib'],
                'javascript': ['javascript', 'js', 'node.js', 'nodejs', 'react', 'vue', 'angular', 'express', 'next.js'],
                'java': ['java', 'spring', 'springboot', 'hibernate', 'maven', 'gradle', 'jsp', 'servlet'],
                'cpp': ['c++', 'cpp', 'c plus plus', 'stl', 'boost'],
                'csharp': ['c#', 'csharp', '.net', 'dotnet', 'asp.net', 'entity framework'],
                'go': ['golang', 'go', 'gin', 'gorilla'],
                'rust': ['rust', 'cargo'],
                'php': ['php', 'laravel', 'symfony', 'codeigniter'],
                'ruby': ['ruby', 'rails', 'ruby on rails', 'sinatra'],
                'swift': ['swift', 'ios', 'xcode'],
                'kotlin': ['kotlin', 'android'],
                'typescript': ['typescript', 'ts'],
                'scala': ['scala', 'akka', 'play'],
                'r': ['r', 'rstudio', 'shiny'],
                'matlab': ['matlab', 'simulink']
            },
            'databases': {
                'relational': ['mysql', 'postgresql', 'postgres', 'sqlite', 'oracle', 'sql server', 'mariadb'],
                'nosql': ['mongodb', 'cassandra', 'redis', 'elasticsearch', 'dynamodb', 'couchdb', 'neo4j'],
                'data_warehousing': ['snowflake', 'redshift', 'bigquery', 'databricks']
            },
            'cloud_platforms': {
                'aws': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'cloudfront', 'route53'],
                'azure': ['azure', 'microsoft azure', 'azure functions', 'cosmos db'],
                'gcp': ['gcp', 'google cloud', 'google cloud platform', 'compute engine', 'app engine'],
                'containerization': ['docker', 'containerization', 'kubernetes', 'k8s', 'helm', 'istio']
            },
            'ai_ml': {
                'machine_learning': ['machine learning', 'ml', 'scikit-learn', 'sklearn', 'xgboost', 'lightgbm'],
                'deep_learning': ['deep learning', 'neural networks', 'tensorflow', 'pytorch', 'keras', 'cnn', 'rnn', 'lstm'],
                'nlp': ['nlp', 'natural language processing', 'spacy', 'nltk', 'transformers', 'bert', 'gpt'],
                'computer_vision': ['computer vision', 'opencv', 'image processing', 'cv', 'yolo', 'rcnn']
            },
            'web_technologies': {
                'frontend': ['html', 'css', 'sass', 'less', 'bootstrap', 'tailwind', 'material-ui', 'chakra-ui'],
                'backend': ['api', 'rest', 'graphql', 'microservices', 'soap'],
                'frameworks': ['react', 'angular', 'vue', 'svelte', 'next.js', 'nuxt', 'gatsby']
            },
            'devops_tools': {
                'version_control': ['git', 'github', 'gitlab', 'bitbucket', 'svn'],
                'ci_cd': ['jenkins', 'github actions', 'gitlab ci', 'travis ci', 'circleci', 'bamboo'],
                'monitoring': ['prometheus', 'grafana', 'elk', 'splunk', 'datadog', 'new relic'],
                'testing': ['unit testing', 'integration testing', 'pytest', 'jest', 'selenium', 'cypress']
            },
            'data_science': {
                'visualization': ['matplotlib', 'seaborn', 'plotly', 'd3.js', 'tableau', 'power bi'],
                'analysis': ['pandas', 'numpy', 'scipy', 'statsmodels', 'jupyter'],
                'big_data': ['spark', 'hadoop', 'kafka', 'airflow', 'dask']
            }
        }
    
    def _load_job_categories(self):
        """Load job categories and their typical requirements"""
        self.job_categories = {
            'software_engineer': {
                'keywords': ['software engineer', 'developer', 'programmer', 'coding'],
                'required_skills': ['programming_languages', 'databases', 'version_control'],
                'preferred_skills': ['cloud_platforms', 'testing', 'ci_cd']
            },
            'data_scientist': {
                'keywords': ['data scientist', 'data analyst', 'machine learning engineer'],
                'required_skills': ['ai_ml', 'data_science', 'programming_languages'],
                'preferred_skills': ['cloud_platforms', 'big_data']
            },
            'frontend_developer': {
                'keywords': ['frontend', 'front-end', 'ui developer', 'web developer'],
                'required_skills': ['web_technologies', 'frontend'],
                'preferred_skills': ['testing', 'version_control']
            },
            'backend_developer': {
                'keywords': ['backend', 'back-end', 'server-side', 'api developer'],
                'required_skills': ['programming_languages', 'databases', 'backend'],
                'preferred_skills': ['cloud_platforms', 'microservices']
            },
            'devops_engineer': {
                'keywords': ['devops', 'site reliability', 'infrastructure', 'platform engineer'],
                'required_skills': ['devops_tools', 'cloud_platforms', 'containerization'],
                'preferred_skills': ['monitoring', 'ci_cd']
            }
        }
    
    def extract_contact_information(self, text: str) -> Dict[str, Optional[str]]:
        """Extract contact information using advanced regex patterns"""
        contact_info = {
            'email': None,
            'phone': None,
            'linkedin': None,
            'github': None,
            'website': None,
            'location': None
        }
        
        # Email extraction
        email_pattern = r'\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b'
        emails = re.findall(email_pattern, text)
        if emails:
            contact_info['email'] = emails[0]
        
        # Phone extraction (multiple formats)
        phone_patterns = [
            r'(\\+?\\d{1,3}[-\.\\s]?)?\\(?\\d{3}\\)?[-\.\\s]?\\d{3}[-\.\\s]?\\d{4}',
            r'(\\+?\\d{1,3}[-\.\\s]?)?\\d{10}',
            r'(\\+?\\d{1,3}[-\.\\s]?)?\\(?\\d{3}\\)?[-\.\\s]?\\d{3}[-\.\\s]?\\d{4}'
        ]
        
        for pattern in phone_patterns:
            phones = re.findall(pattern, text)
            if phones:
                contact_info['phone'] = phones[0] if isinstance(phones[0], str) else ''.join(phones[0])
                break
        
        # LinkedIn extraction
        linkedin_patterns = [
            r'linkedin\\.com/in/[\\w-]+',
            r'linkedin\\.com/pub/[\\w-]+',
            r'/in/[\\w-]+'
        ]
        
        for pattern in linkedin_patterns:
            linkedin = re.search(pattern, text, re.IGNORECASE)
            if linkedin:
                contact_info['linkedin'] = linkedin.group()
                break
        
        # GitHub extraction
        github_patterns = [
            r'github\\.com/[\\w-]+',
            r'github\\.io/[\\w-]+'
        ]
        
        for pattern in github_patterns:
            github = re.search(pattern, text, re.IGNORECASE)
            if github:
                contact_info['github'] = github.group()
                break
        
        # Website extraction
        website_pattern = r'https?://[\\w.-]+\\.[a-z]{2,}'
        websites = re.findall(website_pattern, text, re.IGNORECASE)
        if websites:
            # Filter out common non-personal websites
            personal_sites = [site for site in websites if not any(common in site.lower() 
                            for common in ['linkedin', 'github', 'facebook', 'twitter'])]
            if personal_sites:
                contact_info['website'] = personal_sites[0]
        
        return contact_info
    
    def extract_experience_details(self, text: str) -> Dict[str, Any]:
        """Extract detailed experience information"""
        experience_info = {
            'total_years': None,
            'positions': [],
            'companies': [],
            'technologies_used': []
        }
        
        # Extract years of experience
        exp_patterns = [
            r'(\\d+)\\+?\\s*years?\\s+(?:of\\s+)?experience',
            r'(\\d+)\\+?\\s*yrs?\\s+(?:of\\s+)?experience',
            r'experience\\s*:?\\s*(\\d+)\\+?\\s*years?',
            r'(\\d+)\\+?\\s*years?\\s+(?:in|of|as)',
            r'over\\s+(\\d+)\\s+years?'
        ]
        
        for pattern in exp_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                experience_info['total_years'] = int(match.group(1))
                break
        
        # Extract job titles (common patterns)
        title_patterns = [
            r'(senior|lead|principal|staff)\\s+(\\w+\\s+)*(?:engineer|developer|analyst|manager|architect)',
            r'(\\w+\\s+)*(?:engineer|developer|analyst|manager|architect|consultant|specialist)',
            r'(software|web|mobile|data|machine learning|ai)\\s+(engineer|developer)',
            r'(frontend|backend|full.?stack|devops)\\s+(engineer|developer)'
        ]
        
        for pattern in title_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                title = match.group().strip()
                if title not in experience_info['positions'] and len(title) > 3:
                    experience_info['positions'].append(title)
        
        # Extract company names (using NER if available)
        if self.nlp and SPACY_AVAILABLE:
            doc = self.nlp(text)
            for ent in doc.ents:
                if ent.label_ == 'ORG' and len(ent.text) > 2:
                    # Filter out common non-company words
                    if not any(word in ent.text.lower() for word in ['university', 'college', 'school', 'institute']):
                        experience_info['companies'].append(ent.text)
        
        return experience_info
    
    def extract_education_details(self, text: str) -> List[Dict[str, Any]]:
        """Extract detailed education information"""
        education = []
        
        # Degree patterns with more detail
        degree_patterns = [
            r'(bachelor\'?s?\\s*(?:of\\s*)?(?:science|arts|engineering|computer science|business|technology)?)(?:\\s+in\\s+([\\w\\s]+))?',
            r'(master\'?s?\\s*(?:of\\s*)?(?:science|arts|engineering|business|technology)?)(?:\\s+in\\s+([\\w\\s]+))?',
            r'(phd|ph\\.d|doctorate)(?:\\s+in\\s+([\\w\\s]+))?',
            r'(b\\.?s\\.?|b\\.?a\\.?|b\\.?e\\.?|b\\.?tech)(?:\\s+([\\w\\s]+))?',
            r'(m\\.?s\\.?|m\\.?a\\.?|m\\.?e\\.?|m\\.?tech)(?:\\s+([\\w\\s]+))?',
            r'(mba)(?:\\s+([\\w\\s]+))?'
        ]
        
        for pattern in degree_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                degree_info = {
                    'degree': match.group(1).strip(),
                    'field': match.group(2).strip() if match.group(2) else None,
                    'context': text[max(0, match.start()-100):match.end()+100].strip()
                }
                education.append(degree_info)
        
        # Extract GPA if mentioned
        gpa_pattern = r'gpa\\s*:?\\s*(\\d+\\.\\d+)(?:\\s*/\\s*(\\d+))?'
        gpa_matches = re.finditer(gpa_pattern, text, re.IGNORECASE)
        
        for i, match in enumerate(gpa_matches):
            if i < len(education):
                education[i]['gpa'] = match.group(1)
                if match.group(2):
                    education[i]['gpa_scale'] = match.group(2)
        
        return education
    
    def analyze_skills_with_ml(self, text: str) -> Dict[str, Any]:
        """Advanced skill analysis using ML techniques"""
        skills_analysis = {
            'categorized_skills': {},
            'skill_frequency': {},
            'skill_context': {},
            'proficiency_indicators': {},
            'certification_skills': []
        }
        
        text_lower = text.lower()
        
        # Extract skills by category
        for category, subcategories in self.skills_database.items():
            skills_analysis['categorized_skills'][category] = []
            
            for skill_group, variations in subcategories.items():
                found_variations = []
                contexts = []
                
                for variation in variations:
                    if variation.lower() in text_lower:
                        found_variations.append(variation)
                        
                        # Extract context around the skill
                        pattern = r'.{0,50}' + re.escape(variation) + r'.{0,50}'
                        context_matches = re.finditer(pattern, text, re.IGNORECASE)
                        for context_match in context_matches:
                            contexts.append(context_match.group().strip())
                
                if found_variations:
                    skill_info = {
                        'skill_group': skill_group,
                        'variations_found': found_variations,
                        'contexts': contexts,
                        'frequency': len(found_variations)
                    }
                    skills_analysis['categorized_skills'][category].append(skill_info)
                    skills_analysis['skill_frequency'][skill_group] = len(found_variations)
                    skills_analysis['skill_context'][skill_group] = contexts
        
        # Analyze proficiency indicators
        proficiency_patterns = {
            'expert': ['expert', 'advanced', 'proficient', 'mastery', 'extensive experience'],
            'intermediate': ['intermediate', 'working knowledge', 'familiar', 'experience with'],
            'beginner': ['basic', 'beginner', 'learning', 'exposure to', 'introduction to']
        }
        
        for skill_group in skills_analysis['skill_frequency'].keys():
            for level, indicators in proficiency_patterns.items():
                for context in skills_analysis['skill_context'].get(skill_group, []):
                    if any(indicator in context.lower() for indicator in indicators):
                        skills_analysis['proficiency_indicators'][skill_group] = level
                        break
        
        # Extract certifications
        cert_patterns = [
            r'certified\\s+([\\w\\s]+?)(?:certification|cert)',
            r'([\\w\\s]+?)\\s+certification',
            r'([\\w\\s]+?)\\s+certified'
        ]
        
        for pattern in cert_patterns:
            cert_matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in cert_matches:
                cert_name = match.group(1).strip()
                if len(cert_name) > 3 and cert_name not in skills_analysis['certification_skills']:
                    skills_analysis['certification_skills'].append(cert_name)
        
        # Remove empty categories
        skills_analysis['categorized_skills'] = {
            k: v for k, v in skills_analysis['categorized_skills'].items() if v
        }
        
        return skills_analysis
    
    def calculate_job_match_score(self, resume_text: str, job_description: str) -> Dict[str, Any]:
        """Calculate job match score using multiple ML techniques"""
        match_analysis = {
            'overall_score': 0.0,
            'skill_match_score': 0.0,
            'semantic_similarity': 0.0,
            'keyword_overlap': 0.0,
            'missing_skills': [],
            'matching_skills': [],
            'recommendations': []
        }
        
        try:
            # Semantic similarity using sentence transformers
            if self.sentence_model and SENTENCE_TRANSFORMERS_AVAILABLE:
                embeddings = self.sentence_model.encode([resume_text, job_description])
                match_analysis['semantic_similarity'] = float(
                    cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
                )
            
            # TF-IDF similarity
            if self.tfidf_vectorizer and SKLEARN_AVAILABLE:
                tfidf_matrix = self.tfidf_vectorizer.fit_transform([resume_text, job_description])
                tfidf_similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
                match_analysis['keyword_overlap'] = float(tfidf_similarity)
            
            # Skill-based matching
            resume_skills = self.analyze_skills_with_ml(resume_text)
            job_skills = self.analyze_skills_with_ml(job_description)
            
            # Find matching and missing skills
            resume_skill_groups = set()
            job_skill_groups = set()
            
            for category in resume_skills['categorized_skills']:
                for skill_info in resume_skills['categorized_skills'][category]:
                    resume_skill_groups.add(skill_info['skill_group'])
            
            for category in job_skills['categorized_skills']:
                for skill_info in job_skills['categorized_skills'][category]:
                    job_skill_groups.add(skill_info['skill_group'])
            
            match_analysis['matching_skills'] = list(resume_skill_groups.intersection(job_skill_groups))
            match_analysis['missing_skills'] = list(job_skill_groups - resume_skill_groups)
            
            # Calculate skill match score
            if job_skill_groups:
                match_analysis['skill_match_score'] = len(match_analysis['matching_skills']) / len(job_skill_groups)
            
            # Calculate overall score (weighted combination)
            weights = {
                'semantic_similarity': 0.4,
                'skill_match_score': 0.4,
                'keyword_overlap': 0.2
            }
            
            match_analysis['overall_score'] = (
                match_analysis['semantic_similarity'] * weights['semantic_similarity'] +
                match_analysis['skill_match_score'] * weights['skill_match_score'] +
                match_analysis['keyword_overlap'] * weights['keyword_overlap']
            )
            
            # Generate recommendations
            if match_analysis['missing_skills']:
                match_analysis['recommendations'].append(
                    f"Consider gaining experience with: {', '.join(match_analysis['missing_skills'][:5])}"
                )
            
            if match_analysis['overall_score'] < 0.6:
                match_analysis['recommendations'].append(
                    "Consider tailoring your resume to better match the job requirements"
                )
            
        except Exception as e:
            logger.error(f"Error calculating job match score: {e}")
        
        return match_analysis
    
    def generate_resume_insights(self, resume_text: str) -> Dict[str, Any]:
        """Generate comprehensive resume insights using ML"""
        insights = {
            'contact_info': self.extract_contact_information(resume_text),
            'experience': self.extract_experience_details(resume_text),
            'education': self.extract_education_details(resume_text),
            'skills_analysis': self.analyze_skills_with_ml(resume_text),
            'text_statistics': self._calculate_text_statistics(resume_text),
            'readability_score': self._calculate_readability_score(resume_text),
            'ats_compatibility': self._analyze_ats_compatibility(resume_text),
            'improvement_suggestions': []
        }
        
        # Generate improvement suggestions
        suggestions = self._generate_improvement_suggestions(insights)
        insights['improvement_suggestions'] = suggestions
        
        return insights
    
    def _calculate_text_statistics(self, text: str) -> Dict[str, int]:
        """Calculate basic text statistics"""
        return {
            'character_count': len(text),
            'word_count': len(text.split()),
            'sentence_count': len([s for s in text.split('.') if s.strip()]),
            'paragraph_count': len([p for p in text.split('\\n\\n') if p.strip()]),
            'line_count': len(text.split('\\n'))
        }
    
    def _calculate_readability_score(self, text: str) -> Dict[str, float]:
        """Calculate readability metrics"""
        if not self.nlp or not SPACY_AVAILABLE:
            return {'score': 0.0}
        
        try:
            doc = self.nlp(text)
            sentences = list(doc.sents)
            words = [token for token in doc if token.is_alpha and not token.is_stop]
            
            if not sentences or not words:
                return {'score': 0.0}
            
            avg_sentence_length = len(words) / len(sentences)
            avg_word_length = sum(len(token.text) for token in words) / len(words)
            
            # Simple readability score (higher is more complex)
            readability_score = (avg_sentence_length * 0.0588) + (avg_word_length * 0.296) - 15.8
            
            return {
                'score': max(0, min(100, readability_score)),
                'avg_sentence_length': avg_sentence_length,
                'avg_word_length': avg_word_length,
                'complexity': 'Low' if readability_score < 30 else 'Medium' if readability_score < 60 else 'High'
            }
        except Exception as e:
            logger.error(f"Error calculating readability: {e}")
            return {'score': 0.0}
    
    def _analyze_ats_compatibility(self, text: str) -> Dict[str, Any]:
        """Analyze ATS (Applicant Tracking System) compatibility"""
        ats_score = 100
        issues = []
        
        # Check for common ATS issues
        if len(re.findall(r'\\t', text)) > 10:
            ats_score -= 10
            issues.append("Excessive use of tabs - use spaces instead")
        
        if len(re.findall(r'[^\\w\\s.,;:()/-]', text)) > 20:
            ats_score -= 15
            issues.append("Special characters may cause parsing issues")
        
        # Check for standard sections
        standard_sections = ['experience', 'education', 'skills', 'contact']
        missing_sections = []
        
        for section in standard_sections:
            if section.lower() not in text.lower():
                missing_sections.append(section)
                ats_score -= 5
        
        if missing_sections:
            issues.append(f"Missing standard sections: {', '.join(missing_sections)}")
        
        # Check for contact information
        contact_info = self.extract_contact_information(text)
        if not contact_info['email']:
            ats_score -= 20
            issues.append("Email address not found")
        
        return {
            'score': max(0, ats_score),
            'issues': issues,
            'recommendations': [
                "Use standard section headings",
                "Include complete contact information",
                "Avoid excessive formatting",
                "Use standard fonts and formatting"
            ]
        }
    
    def _generate_improvement_suggestions(self, insights: Dict[str, Any]) -> List[str]:
        """Generate personalized improvement suggestions"""
        suggestions = []
        
        # Contact information suggestions
        contact_info = insights['contact_info']
        if not contact_info['email']:
            suggestions.append("Add a professional email address")
        if not contact_info['linkedin']:
            suggestions.append("Include your LinkedIn profile URL")
        if not contact_info['phone']:
            suggestions.append("Add your phone number")
        
        # Experience suggestions
        experience = insights['experience']
        if not experience['total_years']:
            suggestions.append("Clearly state your years of experience")
        if len(experience['positions']) < 2:
            suggestions.append("Include more specific job titles and positions")
        
        # Skills suggestions
        skills = insights['skills_analysis']
        if not skills['categorized_skills']:
            suggestions.append("Add a dedicated skills section with relevant technologies")
        
        skill_count = sum(len(skills_list) for skills_list in skills['categorized_skills'].values())
        if skill_count < 5:
            suggestions.append("Include more technical skills relevant to your field")
        
        # ATS compatibility suggestions
        ats = insights['ats_compatibility']
        if ats['score'] < 80:
            suggestions.extend(ats['recommendations'][:2])
        
        # Text length suggestions
        word_count = insights['text_statistics']['word_count']
        if word_count < 200:
            suggestions.append("Expand your resume - it seems too brief")
        elif word_count > 800:
            suggestions.append("Consider making your resume more concise")
        
        return suggestions[:10]  # Limit to top 10 suggestions
    
    def analyze_resume_complete(self, resume_text: str, job_description: str = "") -> Dict[str, Any]:
        """Complete resume analysis combining all NLP capabilities"""
        try:
            if not self.initialized:
                logger.warning("NLP Processor not initialized, using basic analysis")
                return {
                    "status": "fallback",
                    "basic_analysis": {
                        "contact": {"warning": "Advanced NLP not available"},
                        "skills": {"warning": "Advanced NLP not available"},
                        "experience": {"warning": "Advanced NLP not available"}
                    }
                }
            
            # Extract all components
            contact_info = self.extract_contact_information(resume_text)
            skills_analysis = self.analyze_skills_with_ml(resume_text)
            experience_details = self.extract_experience_details(resume_text)
            education_details = self.extract_education_details(resume_text)
            insights = self.generate_resume_insights(resume_text)
            
            # Job matching if job description provided
            job_match = None
            if job_description.strip():
                job_match = self.calculate_job_match_score(resume_text, job_description)
            
            return {
                "status": "success",
                "contact_information": contact_info,
                "skills_analysis": skills_analysis,
                "experience_details": experience_details,
                "education_details": education_details,
                "resume_insights": insights,
                "job_match_analysis": job_match,
                "analysis_timestamp": datetime.now().isoformat(),
                "nlp_version": "advanced_v1.0"
            }
        
        except Exception as e:
            logger.error(f"Complete analysis failed: {e}")
            return {
                "status": "error",
                "error": str(e),
                "fallback_data": {
                    "basic_extraction": True,
                    "error_timestamp": datetime.now().isoformat()
                }
            }

# Global instance
nlp_processor = AdvancedNLPProcessor()