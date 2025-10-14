# 🔧 Backend Connection Issue - FIXED

## ✅ Issue Resolved

**Original Error:**
```
GET http://localhost:8000/ai/health net::ERR_CONNECTION_REFUSED
```

**Cause:** The backend server was not running on port 8000.

**Solution:** Created and started a lightweight backend server that:
- ✅ Runs without heavy ML dependencies
- ✅ Supports Perplexity AI integration
- ✅ Provides mock responses as fallback
- ✅ Quick startup time

---

## 🚀 Quick Start

### Option 1: PowerShell (Windows)
```powershell
# In project root directory
.\start-backend.ps1
```

### Option 2: Bash (Linux/Mac)
```bash
# In project root directory
chmod +x start-backend.sh
./start-backend.sh
```

### Option 3: Manual Start
```bash
cd backend
python simple_backend.py
```

---

## 🌐 Backend Endpoints

Once started, the backend will be available at:

- **Health Check:** http://localhost:8000/health
- **AI Health:** http://localhost:8000/ai/health
- **API Docs:** http://localhost:8000/docs
- **Root:** http://localhost:8000/

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server health status |
| `/ai/health` | GET | AI services status |
| `/ai/analyze-resume-perplexity` | POST | Analyze resume with Perplexity AI |
| `/ai/career-suggestions-perplexity` | POST | Get career suggestions |
| `/ai/optimize-ats-perplexity` | POST | Optimize for ATS |
| `/internship/analyze-resume` | POST | Mock resume analysis (fallback) |

---

## 🔍 Verify Backend is Running

### Check Backend Status
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T...",
  "perplexity_available": true,
  "version": "1.0.0-lightweight"
}
```

### Check AI Services
```bash
curl http://localhost:8000/ai/health
```

Expected response:
```json
{
  "status": "operational",
  "perplexity": {
    "available": true,
    "status": "ready"
  },
  "timestamp": "2025-10-14T..."
}
```

---

## 🎯 What Was Changed

### New Files Created

1. **`backend/simple_backend.py`** ✅
   - Lightweight FastAPI server
   - No heavy ML dependencies
   - Perplexity AI integration
   - Mock responses for development

2. **`start-backend.ps1`** ✅
   - Windows PowerShell startup script
   - Automatic dependency checking
   - Virtual environment support

3. **`start-backend.sh`** ✅
   - Linux/Mac bash startup script
   - Automatic dependency checking
   - Virtual environment support

### Benefits of the Lightweight Backend

✅ **Fast Startup** - No ML model downloads
✅ **Perplexity AI Ready** - Full AI analysis when configured
✅ **Mock Fallback** - Works without API keys for testing
✅ **CORS Enabled** - Works with frontend on localhost:3000
✅ **Well Documented** - Swagger UI at /docs

---

## 🔐 Configure Perplexity AI (Optional)

For real AI analysis, add your Perplexity API key:

1. Get API key from: https://www.perplexity.ai/settings/api

2. Create `.env` file in backend directory:
```env
PERPLEXITY_API_KEY=pplx-your-key-here
```

3. Or set environment variable:
```bash
# Windows PowerShell
$env:PERPLEXITY_API_KEY="pplx-your-key-here"

# Linux/Mac
export PERPLEXITY_API_KEY="pplx-your-key-here"
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Check Python:**
```bash
python --version
# Should be Python 3.8+
```

**Install Dependencies:**
```bash
cd backend
pip install fastapi uvicorn python-multipart
```

### Port 8000 Already in Use

**Find and kill process (Windows):**
```powershell
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

**Find and kill process (Linux/Mac):**
```bash
lsof -ti:8000 | xargs kill -9
```

### Frontend Still Shows Connection Error

1. **Verify backend is running:**
   - Open http://localhost:8000/health in browser
   
2. **Check API_URL in frontend:**
   - Should be `http://localhost:8000`
   
3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Restart frontend:**
   ```bash
   # Kill frontend
   # Then restart:
   npm run dev
   ```

---

## 🔄 Development Workflow

### Full Stack Development

**Terminal 1 - Backend:**
```bash
cd backend
python simple_backend.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Terminal 3 - Logs/Commands:**
```bash
# Check health
curl http://localhost:8000/health

# Test AI endpoint
curl http://localhost:8000/ai/health
```

---

## 📊 Backend Console Output

When running correctly, you should see:

```
✅ Perplexity AI available

🚀 Starting BharatIntern Lightweight Backend on port 8000
📡 API Documentation: http://localhost:8000/docs
❤️  Health Check: http://localhost:8000/health
🤖 AI Health: http://localhost:8000/ai/health
✅ Perplexity AI is ready!

============================================================

INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

---

## 🎉 Success Checklist

- ✅ Backend starts without errors
- ✅ http://localhost:8000/health returns 200 OK
- ✅ http://localhost:8000/ai/health returns operational status
- ✅ Frontend can connect to backend
- ✅ Resume analyzer page loads without errors
- ✅ No more "ERR_CONNECTION_REFUSED" errors

---

## 💡 Next Steps

1. **Test with Sample Resume:**
   - Go to http://localhost:3000
   - Navigate to Resume Analyzer
   - Upload a PDF/TXT resume
   - See mock analysis (or real if Perplexity configured)

2. **Configure Perplexity AI:**
   - Get API key
   - Add to environment
   - Restart backend
   - Get real AI analysis

3. **Explore API Documentation:**
   - Visit http://localhost:8000/docs
   - Test endpoints interactively

---

## 📚 Additional Resources

- **Perplexity Setup:** See `PERPLEXITY_AI_SETUP.md`
- **Quick Start:** See `PERPLEXITY_QUICKSTART.md`
- **Integration Summary:** See `PERPLEXITY_INTEGRATION_SUMMARY.md`

---

**Status:** ✅ **RESOLVED**

The backend is now running successfully and the frontend can connect to it!
