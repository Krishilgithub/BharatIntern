import os
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
from llm_provider import get_chat_model, get_embedding_model
import json
import re
from typing import List, Dict, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize LangChain models for internship matching
print("🔄 Initializing LangChain models for internship matching...")
model = get_chat_model()
parser = StrOutputParser()
embedding_model = get_embedding_model()

if model:
    print("✅ LangChain chat model initialized for internship matching")
else:
    print("❌ Failed to initialize LangChain chat model for internship matching")

if embedding_model:
    print("✅ Embedding model initialized for similarity matching")
else:
    print("❌ Failed to initialize embedding model - will use TF-IDF fallback")

# Internship matching template
internship_matching_template = """
You are an expert internship matching specialist. Match the candidate profile with suitable internship opportunities.

Candidate Profile:
{candidate_profile}

Available Internships:
{internship_listings}

Analyze and provide:
1. **Top 3 Best Matches**: Rank by compatibility score (0-100)
2. **Match Reasoning**: Why each internship is a good fit
3. **Skill Gap Analysis**: What skills candidate needs to develop
4. **Preparation Recommendations**: How to strengthen application
5. **Alternative Suggestions**: Other relevant internship types

For each match, provide:
- Internship Title and Company
- Compatibility Score (0-100)
- Key Matching Factors
- Required Skills vs Candidate Skills
- Application Tips

Focus on realistic matches for internship-level positions.
"""

internship_matching_prompt = PromptTemplate(
    input_variables=["candidate_profile", "internship_listings"],
    template=internship_matching_template
)

class InternshipMatcher:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
    def match_internships(self, candidate_profile: str, internship_listings: List[Dict]) -> dict:
        """Match candidate with suitable internships using LangChain"""
        print("🔄 Matching candidate with internships using LangChain")
        
        try:
            # Prepare data for matching
            formatted_listings = self._format_listings_for_llm(internship_listings)
            
            # Try LangChain-based matching first
            if model:
                print("✅ Using LangChain model for intelligent matching")
                llm_result = self._langchain_based_matching(candidate_profile, formatted_listings)
                if llm_result["success"]:
                    return llm_result
            
            print("⚠️ LangChain model not available, using algorithmic matching") 
            # Fallback to algorithmic matching
            return self._algorithmic_matching(candidate_profile, internship_listings)
            
        except Exception as e:
            print(f"❌ Error in LangChain matching: {e}")
            print("🔄 Falling back to algorithmic matching")
            return self._algorithmic_matching(candidate_profile, internship_listings)
    
    def _format_listings_for_llm(self, listings: List[Dict]) -> str:
        """Format internship listings for LLM input"""
        formatted = []
        
        for i, listing in enumerate(listings, 1):
            formatted_listing = f"""
Internship {i}:
- Title: {listing.get('title', 'N/A')}
- Company: {listing.get('company', 'N/A')}
- Domain: {listing.get('domain', 'N/A')}
- Required Skills: {', '.join(listing.get('required_skills', []))}
- Description: {listing.get('description', 'N/A')[:200]}...
- Duration: {listing.get('duration', 'N/A')}
- Location: {listing.get('location', 'N/A')}
- Stipend: {listing.get('stipend', 'N/A')}
"""
            formatted.append(formatted_listing)
        
        return '\n'.join(formatted)
    
    def _langchain_based_matching(self, candidate_profile: str, formatted_listings: str) -> dict:
        """Use LangChain with HuggingFace for intelligent internship matching"""
        try:
            print(f"🎯 Starting LangChain-based matching with HuggingFace")
            print(f"📄 Candidate profile length: {len(candidate_profile)} characters")
            print(f"📋 Listings length: {len(formatted_listings)} characters")
            print(f"🤖 Using model: {type(model).__name__}")
            print(f"🔍 Model details: {getattr(model, 'model_name', 'unknown')}")
            
            # Create LangChain chain
            chain = internship_matching_prompt | model | parser
            
            # Prepare truncated inputs
            truncated_profile = candidate_profile[:1500] if len(candidate_profile) > 1500 else candidate_profile
            truncated_listings = formatted_listings[:2500] if len(formatted_listings) > 2500 else formatted_listings
            
            print(f"📝 Processing profile length: {len(truncated_profile)} characters")
            print(f"📝 Processing listings length: {len(truncated_listings)} characters")
            print(f"🔍 Profile preview: {truncated_profile[:200]}...")
            
            print("🤖 Invoking LangChain model with HuggingFace for internship matching...")
            
            # Generate matches using LangChain
            response = chain.invoke({
                "candidate_profile": truncated_profile,
                "internship_listings": truncated_listings
            })
            
            print(f"✅ LangChain model response received: {len(response)} characters")
            print(f"📊 Response preview: {response[:400]}...")
            
            # Parse LangChain response
            matches = self._parse_llm_matches(response)
            print(f"📈 Successfully parsed {len(matches)} matches from response")
            
            result = {
                "success": True,
                "source": "langchain_huggingface",
                "model_used": str(type(model).__name__),
                "model_name": getattr(model, 'model_name', 'unknown'),
                "input_profile_length": len(candidate_profile),
                "input_listings_length": len(formatted_listings),
                "processed_profile_length": len(truncated_profile),
                "processed_listings_length": len(truncated_listings),
                "response_length": len(response),
                "matches_found": len(matches),
                "matches": matches,
                "raw_response": response,
                "matching_method": "LangChain + HuggingFace",
                "timestamp": datetime.now().isoformat()
            }
            
            print("✅ LangChain-based matching completed successfully with HuggingFace")
            print(f"📋 Result summary: {len(matches)} matches found using LangChain + HuggingFace")
            return result
            
        except Exception as e:
            print(f"❌ Error in LangChain matching: {e}")
            import traceback
            print(f"🔍 Full error traceback: {traceback.format_exc()}")
            return {"success": False}
    
    def _algorithmic_matching(self, candidate_profile: str, internship_listings: List[Dict]) -> dict:
        """Algorithmic matching using TF-IDF and cosine similarity"""
        print("⚠️ Using algorithmic matching - LangChain model not available")
        
        try:
            # Prepare texts for vectorization
            candidate_text = self._prepare_candidate_text(candidate_profile)
            internship_texts = [self._prepare_internship_text(listing) for listing in internship_listings]
            
            # Combine all texts
            all_texts = [candidate_text] + internship_texts
            
            # Vectorize
            tfidf_matrix = self.vectorizer.fit_transform(all_texts)
            
            # Calculate similarities
            candidate_vector = tfidf_matrix[0:1]
            internship_vectors = tfidf_matrix[1:]
            
            similarities = cosine_similarity(candidate_vector, internship_vectors)[0]
            
            # Create matches with scores
            matches = []
            for i, (listing, similarity) in enumerate(zip(internship_listings, similarities)):
                score = int(similarity * 100)
                
                match = {
                    "internship_id": listing.get('id', i),
                    "title": listing.get('title', 'N/A'),
                    "company": listing.get('company', 'N/A'),
                    "domain": listing.get('domain', 'N/A'),
                    "compatibility_score": score,
                    "matching_factors": self._identify_matching_factors(candidate_profile, listing),
                    "skill_gaps": self._identify_skill_gaps(candidate_profile, listing),
                    "application_tips": self._generate_application_tips(listing)
                }
                matches.append(match)
            
            # Sort by compatibility score
            matches.sort(key=lambda x: x['compatibility_score'], reverse=True)
            
            return {
                "success": True,
                "source": "algorithmic",
                "model_used": "tfidf_cosine_similarity",
                "matches": matches[:5],  # Top 5 matches
                "matching_method": "Algorithmic",
                "total_internships_analyzed": len(internship_listings),
                "note": "This is algorithmic matching. For AI-powered insights, please ensure LangChain model is properly configured."
            }
            
        except Exception as e:
            print(f"Error in algorithmic matching: {e}")
            return self._generate_fallback_matches(internship_listings)
    
    def _prepare_candidate_text(self, profile: str) -> str:
        """Prepare candidate profile text for matching"""
        # Extract key information and create searchable text
        return profile.lower()
    
    def _prepare_internship_text(self, listing: Dict) -> str:
        """Prepare internship listing text for matching"""
        text_parts = [
            listing.get('title', ''),
            listing.get('domain', ''),
            listing.get('description', ''),
            ' '.join(listing.get('required_skills', [])),
            listing.get('company', '')
        ]
        return ' '.join(filter(None, text_parts)).lower()
    
    def _identify_matching_factors(self, candidate_profile: str, listing: Dict) -> List[str]:
        """Identify factors that make this a good match"""
        factors = []
        
        profile_lower = candidate_profile.lower()
        required_skills = listing.get('required_skills', [])
        
        # Check skill matches
        matching_skills = [skill for skill in required_skills if skill.lower() in profile_lower]
        if matching_skills:
            factors.append(f"Skills match: {', '.join(matching_skills)}")
        
        # Check domain match
        domain = listing.get('domain', '').lower()
        if domain in profile_lower:
            factors.append(f"Domain alignment: {domain}")
        
        # Check experience level
        if any(word in profile_lower for word in ['beginner', 'student', 'learning']):
            factors.append("Suitable for entry-level candidates")
        
        return factors or ["Basic compatibility based on profile analysis"]
    
    def _identify_skill_gaps(self, candidate_profile: str, listing: Dict) -> List[str]:
        """Identify skills candidate needs to develop"""
        gaps = []
        
        profile_lower = candidate_profile.lower()
        required_skills = listing.get('required_skills', [])
        
        missing_skills = [skill for skill in required_skills if skill.lower() not in profile_lower]
        
        return missing_skills[:3]  # Top 3 missing skills
    
    def _generate_application_tips(self, listing: Dict) -> List[str]:
        """Generate application tips for the internship"""
        tips = [
            "Tailor your resume to highlight relevant skills",
            "Research the company and mention specific projects or values",
            "Prepare examples of relevant coursework or projects"
        ]
        
        domain = listing.get('domain', '').lower()
        
        if 'software' in domain or 'tech' in domain:
            tips.append("Include links to your GitHub portfolio and coding projects")
        elif 'design' in domain:
            tips.append("Prepare a strong portfolio showcasing your design work")
        elif 'data' in domain:
            tips.append("Highlight any data analysis projects or statistical coursework")
        
        return tips
    
    def _parse_llm_matches(self, response: str) -> List[Dict]:
        """Parse LLM response into structured matches"""
        matches = []
        
        try:
            # Split response by match numbers or sections
            sections = re.split(r'(?:Match|Internship)\s*\d+', response, flags=re.IGNORECASE)
            
            for i, section in enumerate(sections[1:], 1):  # Skip first empty section
                try:
                    match = self._extract_match_info(section, i)
                    if match:
                        matches.append(match)
                except Exception as e:
                    print(f"Error parsing match {i}: {e}")
                    continue
            
            return matches[:5]  # Top 5 matches
            
        except Exception as e:
            print(f"Error parsing LLM matches: {e}")
            return []
    
    def _extract_match_info(self, section: str, match_id: int) -> Dict:
        """Extract match information from LLM response section"""
        try:
            # Extract compatibility score
            score_match = re.search(r'score[:\s]*(\d+)', section, re.IGNORECASE)
            score = int(score_match.group(1)) if score_match else 75
            
            # Extract title
            title_match = re.search(r'title[:\s]*([^\n]+)', section, re.IGNORECASE)
            title = title_match.group(1).strip() if title_match else f"Internship {match_id}"
            
            # Extract company
            company_match = re.search(r'company[:\s]*([^\n]+)', section, re.IGNORECASE)
            company = company_match.group(1).strip() if company_match else "Company"
            
            return {
                "internship_id": match_id,
                "title": title,
                "company": company,
                "compatibility_score": score,
                "raw_analysis": section.strip()
            }
            
        except Exception as e:
            print(f"Error extracting match info: {e}")
            return None
    
    def _generate_fallback_matches(self, internship_listings: List[Dict]) -> dict:
        """Generate basic matches when all else fails"""
        matches = []
        
        for i, listing in enumerate(internship_listings[:3]):
            match = {
                "internship_id": listing.get('id', i),
                "title": listing.get('title', 'Internship Opportunity'),
                "company": listing.get('company', 'Company'),
                "domain": listing.get('domain', 'General'),
                "compatibility_score": 70 - (i * 5),  # Decreasing scores
                "matching_factors": ["Profile analysis match"],
                "skill_gaps": listing.get('required_skills', [])[:2],
                "application_tips": [
                    "Review job requirements carefully",
                    "Highlight relevant experience and skills",
                    "Show enthusiasm for learning"
                ]
            }
            matches.append(match)
        
        return {
            "success": True,
            "matches": matches,
            "matching_method": "Fallback",
            "note": "Basic matching applied - detailed analysis may be limited"
        }

def create_sample_internships() -> List[Dict]:
    """Create sample internship listings for testing"""
    return [
        {
            "id": 1,
            "title": "Software Development Intern",
            "company": "TechCorp Inc.",
            "domain": "Software Development",
            "required_skills": ["Python", "JavaScript", "Git", "SQL"],
            "description": "Join our development team to work on web applications using modern technologies.",
            "duration": "3 months",
            "location": "Remote",
            "stipend": "₹15,000/month"
        },
        {
            "id": 2,
            "title": "Data Science Intern",
            "company": "DataAnalytics Ltd.",
            "domain": "Data Science",
            "required_skills": ["Python", "Machine Learning", "Pandas", "SQL"],
            "description": "Work with our data science team on predictive analytics projects.",
            "duration": "6 months",
            "location": "Bangalore",
            "stipend": "₹20,000/month"
        },
        {
            "id": 3,
            "title": "UI/UX Design Intern",
            "company": "Creative Studio",
            "domain": "Design",
            "required_skills": ["Figma", "Adobe XD", "Prototyping", "User Research"],
            "description": "Design user interfaces for mobile and web applications.",
            "duration": "4 months",
            "location": "Mumbai",
            "stipend": "₹12,000/month"
        }
    ]

# Test function
if __name__ == "__main__":
    matcher = InternshipMatcher()
    
    sample_profile = """
    Computer Science student with strong Python and JavaScript skills.
    Experience with React and Node.js. Built several web development projects.
    Familiar with Git and basic database concepts. Looking for software development internship.
    Good problem-solving skills and eager to learn new technologies.
    """
    
    sample_internships = create_sample_internships()
    
    result = matcher.match_internships(sample_profile, sample_internships)
    print(json.dumps(result, indent=2))