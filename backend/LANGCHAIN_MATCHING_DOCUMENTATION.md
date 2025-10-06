# LangChain Matching Engine Documentation

## Overview

The LangChain Matching Engine is a comprehensive AI-powered system that matches candidates to opportunities using free LLM APIs (Google Gemini and HuggingFace). It provides structured matching results with detailed explanations, fit levels, and actionable recommendations.

## Features

- **Free LLM Integration**: Uses Google Gemini API (free tier) and HuggingFace Inference API
- **Structured Data Models**: Pydantic models for robust data validation
- **Comprehensive Matching**: Analyzes skills, experience, location, and soft skills
- **Structured Output**: JSON responses with match scores, explanations, and recommendations
- **Error Handling**: Robust error handling with fallback mechanisms
- **REST API**: Complete REST API with CORS support
- **Batch Processing**: Support for matching multiple candidates to multiple opportunities
- **Testing Suite**: Comprehensive test suite with edge case coverage

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    LangChain Matching Engine                │
├─────────────────────────────────────────────────────────────┤
│  Input Layer                                                │
│  ├── Candidate Data (Pydantic Model)                       │
│  └── Opportunity Data (Pydantic Model)                     │
├─────────────────────────────────────────────────────────────┤
│  Validation Layer                                           │
│  ├── Data Type Validation                                  │
│  ├── Required Field Validation                             │
│  └── Business Rule Validation                              │
├─────────────────────────────────────────────────────────────┤
│  LLM Integration Layer                                      │
│  ├── Google Gemini API (Primary)                           │
│  ├── HuggingFace Inference API (Fallback)                  │
│  └── Local HuggingFace Model (Final Fallback)              │
├─────────────────────────────────────────────────────────────┤
│  Processing Layer                                           │
│  ├── LangChain Prompt Templates                            │
│  ├── Structured Output Parsing                             │
│  └── Fallback Parsing Logic                                │
├─────────────────────────────────────────────────────────────┤
│  Output Layer                                               │
│  ├── Matching Results (Pydantic Model)                     │
│  ├── Error Responses                                       │
│  └── Metadata & Timestamps                                 │
└─────────────────────────────────────────────────────────────┘
```

## Installation & Setup

### Prerequisites

```bash
pip install langchain langchain-google-genai transformers requests pydantic
```

### Environment Variables

Create a `.env` file or set these environment variables:

```bash
# Google Gemini API (Primary)
GEMINI_API_KEY=your_gemini_api_key_here

# HuggingFace API Token (Fallback)
HUGGINGFACE_API_TOKEN=your_huggingface_token_here

# Optional: Skip heavy initialization for faster startup
SKIP_HEAVY_INIT=1
```

### Getting API Keys

#### Google Gemini API

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Free tier includes generous usage limits

#### HuggingFace API Token

1. Visit [HuggingFace](https://huggingface.co/settings/tokens)
2. Create a new token
3. Free tier available for inference API

## Data Models

### Candidate Model

```python
class Candidate(BaseModel):
    skills: List[str]                           # Required: Technical and soft skills
    education: Dict[str, Any]                   # Required: Education background
    location: str                               # Required: Current/preferred location
    experience_years: float = 0                 # Professional experience in years
    coding_profiles: Optional[Dict[str, str]]   # GitHub, LeetCode usernames
    soft_skill_scores: Optional[Dict[str, float]] # Soft skill assessments (0-1)
    projects: Optional[List[Dict[str, Any]]]    # Project portfolio
    certifications: Optional[List[str]]         # Professional certifications
    languages: Optional[List[str]]              # Programming languages
    resume_text: Optional[str]                  # Full resume text
```

### Opportunity Model

```python
class Opportunity(BaseModel):
    required_skills: List[str]                  # Required: Technical skills needed
    industry: str                               # Required: Industry/domain
    location: str                               # Required: Job location
    experience_level: Optional[str] = "entry"   # entry, mid, senior, expert
    job_title: Optional[str]                    # Job title or role
    company_size: Optional[str]                 # startup, mid, enterprise
    remote_friendly: bool = False               # Remote work allowed
    salary_range: Optional[Dict[str, int]]      # Min/max salary
    benefits: Optional[List[str]]               # Benefits offered
    description: Optional[str]                  # Detailed job description
    preferences: Optional[Dict[str, Any]]       # Additional preferences
```

### Matching Result Model

```python
class MatchingResult(BaseModel):
    match_score: float                          # Match score (0-100)
    explanation: str                            # Detailed explanation
    fit_level: FitLevel                         # strong fit, good fit, moderate fit, weak fit, poor fit
    skill_alignment: Dict[str, Any]             # Detailed skill analysis
    strengths: List[str]                        # Key matching strengths
    concerns: List[str]                         # Potential concerns
    recommendations: List[str]                  # Improvement recommendations
    confidence_score: float                     # Confidence in assessment (0-1)
```

## API Endpoints

### 1. Single Candidate Matching

**Endpoint**: `POST /langchain/match`

**Request Body**:

```json
{
  "candidate": {
    "skills": ["Python", "JavaScript", "React"],
    "education": { "degree": "B.Tech", "field": "Computer Science" },
    "location": "Bangalore",
    "experience_years": 2.5,
    "coding_profiles": { "github": "username", "leetcode": "username" },
    "soft_skill_scores": { "communication": 0.8, "leadership": 0.7 },
    "projects": [{ "name": "Project 1", "description": "..." }],
    "certifications": ["AWS Certified"],
    "languages": ["Python", "JavaScript"],
    "resume_text": "Full resume text..."
  },
  "opportunity": {
    "required_skills": ["Python", "Machine Learning", "Data Analysis"],
    "industry": "Technology",
    "location": "Bangalore",
    "experience_level": "mid",
    "job_title": "Data Scientist",
    "company_size": "startup",
    "remote_friendly": true,
    "salary_range": { "min": 600000, "max": 1200000 },
    "benefits": ["Health Insurance", "Learning Budget"],
    "description": "Looking for a data scientist..."
  }
}
```

**Response**:

```json
{
  "success": true,
  "match_score": 85.5,
  "explanation": "Strong match with excellent skill alignment...",
  "fit_level": "strong fit",
  "skill_alignment": {
    "matched_skills": ["Python", "JavaScript"],
    "missing_skills": ["Machine Learning"],
    "match_percentage": 66.7
  },
  "strengths": [
    "Strong technical foundation in Python and JavaScript",
    "Good communication and teamwork skills",
    "Relevant project experience"
  ],
  "concerns": [
    "Missing Machine Learning experience",
    "Limited data analysis background"
  ],
  "recommendations": [
    "Consider learning Machine Learning fundamentals",
    "Highlight any data analysis projects",
    "Emphasize transferable skills from current projects"
  ],
  "confidence_score": 0.87,
  "timestamp": "2024-01-15T10:30:00Z",
  "api_type": "gemini"
}
```

### 2. Batch Matching

**Endpoint**: `POST /langchain/batch-match`

**Request Body**:

```json
{
  "candidates": [
    {
      "skills": ["Python", "JavaScript"],
      "education": { "degree": "B.Tech" },
      "location": "Bangalore",
      "experience_years": 2
    }
  ],
  "opportunities": [
    {
      "required_skills": ["Python", "Machine Learning"],
      "industry": "Technology",
      "location": "Bangalore",
      "experience_level": "mid"
    }
  ]
}
```

**Response**:

```json
{
    "success": true,
    "results": [
        {
            "candidate": {...},
            "matches": [
                {
                    "match_score": 85.5,
                    "explanation": "...",
                    "fit_level": "strong fit",
                    ...
                }
            ],
            "total_matches": 1
        }
    ],
    "total_candidates": 1,
    "total_opportunities": 1,
    "total_matches": 1,
    "timestamp": "2024-01-15T10:30:00Z"
}
```

### 3. Engine Status

**Endpoint**: `GET /langchain/status`

**Response**:

```json
{
  "success": true,
  "status": "available",
  "engine_status": {
    "initialized": true,
    "api_type": "gemini",
    "gemini_available": true,
    "huggingface_available": false,
    "langchain_available": true,
    "pydantic_available": true
  }
}
```

### 4. Sample Data

**Endpoint**: `GET /langchain/sample-data`

**Response**:

```json
{
    "success": true,
    "sample_candidates": [...],
    "sample_opportunities": [...],
    "usage_instructions": {
        "single_match": "Use POST /langchain/match with candidate and opportunity data",
        "batch_match": "Use POST /langchain/batch-match with arrays of candidates and opportunities",
        "test_match": "Use POST /langchain/test-match to test with predefined sample data"
    }
}
```

### 5. Test Matching

**Endpoint**: `POST /langchain/test-match`

**Response**: Same as single matching but with predefined test data.

## Usage Examples

### Python Client Example

```python
import requests
import json

# Single matching example
def match_candidate_to_opportunity(candidate_data, opportunity_data):
    url = "http://localhost:8000/langchain/match"

    payload = {
        "candidate": candidate_data,
        "opportunity": opportunity_data
    }

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"API call failed: {response.status_code} - {response.text}")

# Example usage
candidate = {
    "skills": ["Python", "JavaScript", "React"],
    "education": {"degree": "B.Tech", "field": "Computer Science"},
    "location": "Bangalore",
    "experience_years": 2.5
}

opportunity = {
    "required_skills": ["Python", "Machine Learning"],
    "industry": "Technology",
    "location": "Bangalore",
    "experience_level": "mid"
}

result = match_candidate_to_opportunity(candidate, opportunity)
print(f"Match Score: {result['match_score']}%")
print(f"Fit Level: {result['fit_level']}")
```

### JavaScript/Node.js Example

```javascript
const axios = require("axios");

async function matchCandidateToOpportunity(candidateData, opportunityData) {
  try {
    const response = await axios.post("http://localhost:8000/langchain/match", {
      candidate: candidateData,
      opportunity: opportunityData,
    });

    return response.data;
  } catch (error) {
    throw new Error(
      `API call failed: ${error.response?.status} - ${error.response?.data}`
    );
  }
}

// Example usage
const candidate = {
  skills: ["Python", "JavaScript", "React"],
  education: { degree: "B.Tech", field: "Computer Science" },
  location: "Bangalore",
  experience_years: 2.5,
};

const opportunity = {
  required_skills: ["Python", "Machine Learning"],
  industry: "Technology",
  location: "Bangalore",
  experience_level: "mid",
};

matchCandidateToOpportunity(candidate, opportunity)
  .then((result) => {
    console.log(`Match Score: ${result.match_score}%`);
    console.log(`Fit Level: ${result.fit_level}`);
  })
  .catch((error) => console.error(error));
```

## Error Handling

### Common Error Responses

#### 400 Bad Request

```json
{
  "detail": "Candidate data is required"
}
```

#### 503 Service Unavailable

```json
{
  "detail": "LangChain matching engine not available. Please ensure LLM API keys are configured."
}
```

#### 500 Internal Server Error

```json
{
  "detail": "Matching analysis failed: API quota exceeded"
}
```

### Error Handling Best Practices

1. **Always check response status**: Verify `success` field in response
2. **Handle API quotas**: Monitor API usage and implement retry logic
3. **Validate input data**: Ensure required fields are present
4. **Use fallback mechanisms**: The system automatically falls back to different LLM providers
5. **Monitor confidence scores**: Lower confidence scores may indicate parsing issues

## Testing

### Running Tests

```bash
# Run comprehensive test suite
python test_langchain_matching.py

# Test specific functionality
python -m pytest test_langchain_matching.py::TestLangChainMatchingEngine::test_valid_matching -v
```

### Test Coverage

The test suite covers:

- ✅ Engine initialization
- ✅ Valid candidate-opportunity matching
- ✅ Edge cases (empty data, extreme matches)
- ✅ Batch matching functionality
- ✅ API endpoint testing
- ✅ Error handling scenarios
- ✅ Data validation
- ✅ Fallback mechanisms

### Sample Test Data

The system includes comprehensive sample data for testing:

- **Candidates**: Entry-level, mid-level, senior-level profiles
- **Opportunities**: Various industries and experience levels
- **Edge Cases**: Empty skills, mismatched profiles, etc.

## Configuration

### LLM Provider Priority

1. **Google Gemini** (Primary)

   - Free tier with generous limits
   - High-quality structured outputs
   - Fast response times

2. **HuggingFace Inference API** (Fallback)

   - Free tier available
   - Good for basic matching
   - Slower response times

3. **Local HuggingFace Model** (Final Fallback)
   - No API costs
   - Requires local compute resources
   - Basic functionality only

### Performance Tuning

```python
# Adjust temperature for more/less creative responses
llm = ChatGoogleGenerativeAI(
    model="gemini-pro",
    temperature=0.3,  # Lower = more consistent, Higher = more creative
    max_output_tokens=2048  # Adjust based on needs
)

# Batch size limits
MAX_CANDIDATES_PER_BATCH = 10
MAX_OPPORTUNITIES_PER_BATCH = 10
```

## Monitoring & Analytics

### Health Checks

```bash
# Check engine status
curl http://localhost:8000/langchain/status

# Test basic functionality
curl -X POST http://localhost:8000/langchain/test-match
```

### Metrics to Monitor

- API response times
- Match score distributions
- Error rates by endpoint
- LLM provider usage
- Batch processing performance

### Logging

The system provides comprehensive logging:

- Initialization status
- API calls and responses
- Error conditions
- Performance metrics

## Security Considerations

1. **API Key Management**: Store API keys securely, never in code
2. **Input Validation**: All inputs are validated using Pydantic models
3. **Rate Limiting**: Implement rate limiting for production use
4. **CORS Configuration**: Properly configured for cross-origin requests
5. **Error Information**: Avoid exposing sensitive information in error messages

## Troubleshooting

### Common Issues

#### Engine Not Initializing

```
❌ LangChain matching engine not available
```

**Solution**: Check API keys and network connectivity

#### Poor Match Quality

```
⚠️ Low match scores across all candidates
```

**Solution**: Verify input data quality and LLM provider status

#### API Timeouts

```
❌ Request timeout after 30 seconds
```

**Solution**: Check LLM provider status and network connectivity

#### Structured Output Parsing Errors

```
❌ Failed to parse structured output
```

**Solution**: System automatically falls back to basic parsing

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Contributing

### Code Structure

```
backend/ai_modules/
├── langchain_matching_engine.py    # Main engine implementation
├── __init__.py                     # Module initialization
└── ...

backend/
├── main.py                         # FastAPI application with endpoints
├── test_langchain_matching.py     # Comprehensive test suite
└── LANGCHAIN_MATCHING_DOCUMENTATION.md  # This documentation
```

### Adding New Features

1. **New LLM Provider**: Add to `_initialize_*` methods
2. **New Data Fields**: Update Pydantic models
3. **New Endpoints**: Add to `main.py`
4. **New Tests**: Add to test suite

### Code Style

- Follow PEP 8 guidelines
- Use type hints throughout
- Comprehensive docstrings
- Error handling for all external calls

## License

This implementation is part of the BharatIntern project and follows the project's licensing terms.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review test results
3. Check API endpoint status
4. Verify environment configuration

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: BharatIntern Development Team
