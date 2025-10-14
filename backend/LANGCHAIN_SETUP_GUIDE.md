# LangChain Matching Engine - Quick Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set Up API Keys

Create a `.env` file in the backend directory:

```bash
# Google Gemini API (Recommended - Free tier)
GEMINI_API_KEY=your_gemini_api_key_here

# HuggingFace API Token (Fallback)
HUGGINGFACE_API_TOKEN=your_huggingface_token_here
```

**Get Free API Keys:**

- **Gemini**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) (Free tier available)
- **HuggingFace**: Visit [HuggingFace Tokens](https://huggingface.co/settings/tokens) (Free tier available)

### 3. Test the Setup

```bash
# Test basic functionality
python test_langchain_startup.py

# Run comprehensive tests
python test_langchain_matching.py
```

### 4. Start the Server

```bash
# Start the FastAPI server
python main.py

# Or with uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 📡 API Usage

### Test the API is Working

```bash
# Check engine status
curl http://localhost:8000/langchain/status

# Get sample data
curl http://localhost:8000/langchain/sample-data

# Test with predefined data
curl -X POST http://localhost:8000/langchain/test-match
```

### Match a Candidate to an Opportunity

```bash
curl -X POST http://localhost:8000/langchain/match \
  -H "Content-Type: application/json" \
  -d '{
    "candidate": {
      "skills": ["Python", "JavaScript", "React"],
      "education": {"degree": "B.Tech", "field": "Computer Science"},
      "location": "Bangalore",
      "experience_years": 2.0
    },
    "opportunity": {
      "required_skills": ["Python", "JavaScript", "React"],
      "industry": "Technology",
      "location": "Bangalore",
      "experience_level": "mid"
    }
  }'
```

## 🔧 Configuration Options

### Environment Variables

```bash
# API Keys (at least one required)
GEMINI_API_KEY=your_key_here
HUGGINGFACE_API_TOKEN=your_token_here

# Optional: Skip heavy initialization for faster startup
SKIP_HEAVY_INIT=1

# Server configuration
PORT=8000
```

### LLM Provider Priority

1. **Google Gemini** (Primary) - Best quality, free tier
2. **HuggingFace Inference API** (Fallback) - Good alternative
3. **Local HuggingFace Model** (Final fallback) - No API costs

## 📊 Expected Output

A successful match returns:

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
    "Good communication and teamwork skills"
  ],
  "concerns": ["Missing Machine Learning experience"],
  "recommendations": [
    "Consider learning Machine Learning fundamentals",
    "Highlight any data analysis projects"
  ],
  "confidence_score": 0.87,
  "timestamp": "2024-01-15T10:30:00Z",
  "api_type": "gemini"
}
```

## 🧪 Testing

### Run All Tests

```bash
python test_langchain_matching.py
```

### Test Specific Functionality

```bash
# Test basic initialization
python test_langchain_startup.py

# Test API endpoints (server must be running)
python -c "
import requests
response = requests.get('http://localhost:8000/langchain/status')
print(response.json())
"
```

## 🚨 Troubleshooting

### Common Issues

#### 1. "LangChain matching engine not available"

```bash
# Check API keys are set
echo $GEMINI_API_KEY
echo $HUGGINGFACE_API_TOKEN

# Restart server after setting keys
python main.py
```

#### 2. "Failed to initialize engine"

```bash
# Check network connectivity
curl -I https://generativelanguage.googleapis.com

# Try with HuggingFace instead
export GEMINI_API_KEY=""
export HUGGINGFACE_API_TOKEN="your_token"
python main.py
```

#### 3. "Request timeout"

```bash
# Check LLM provider status
curl http://localhost:8000/langchain/status

# The system will automatically fallback to alternative providers
```

#### 4. Import errors

```bash
# Install missing dependencies
pip install langchain langchain-google-genai transformers pydantic

# Check Python path
python -c "import sys; print(sys.path)"
```

## 📈 Performance Tips

### For Production Use

1. **Enable caching**: The system automatically caches LLM responses
2. **Batch processing**: Use `/langchain/batch-match` for multiple candidates
3. **Monitor API usage**: Check provider quotas regularly
4. **Use appropriate batch sizes**: Max 10 candidates/opportunities per batch

### For Development

1. **Use SKIP_HEAVY_INIT=1**: Faster startup during development
2. **Test with sample data**: Use `/langchain/test-match` for quick testing
3. **Monitor logs**: Check console output for initialization status

## 🔗 Integration Examples

### Frontend Integration (JavaScript)

```javascript
async function matchCandidate(candidateData, opportunityData) {
  const response = await fetch("/langchain/match", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      candidate: candidateData,
      opportunity: opportunityData,
    }),
  });

  const result = await response.json();

  if (result.success) {
    console.log(`Match Score: ${result.match_score}%`);
    console.log(`Fit Level: ${result.fit_level}`);
    return result;
  } else {
    throw new Error(result.error);
  }
}
```

### Python Client Integration

```python
import requests

def match_candidate_to_opportunity(candidate, opportunity):
    url = "http://localhost:8000/langchain/match"

    response = requests.post(url, json={
        "candidate": candidate,
        "opportunity": opportunity
    })

    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"API call failed: {response.text}")

# Usage
candidate = {
    "skills": ["Python", "JavaScript"],
    "education": {"degree": "B.Tech"},
    "location": "Bangalore",
    "experience_years": 2.0
}

opportunity = {
    "required_skills": ["Python", "Machine Learning"],
    "industry": "Technology",
    "location": "Bangalore",
    "experience_level": "mid"
}

result = match_candidate_to_opportunity(candidate, opportunity)
print(f"Match Score: {result['match_score']}%")
```

## 📚 Additional Resources

- **Full Documentation**: `LANGCHAIN_MATCHING_DOCUMENTATION.md`
- **API Reference**: Visit `http://localhost:8000/docs` when server is running
- **Sample Data**: Use `GET /langchain/sample-data` for test data
- **Status Check**: Use `GET /langchain/status` for system health

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run the test suite: `python test_langchain_matching.py`
3. Verify API keys and network connectivity
4. Check server logs for detailed error messages
5. Review the comprehensive documentation

---

**Ready to start matching candidates to opportunities with AI! 🎯**

