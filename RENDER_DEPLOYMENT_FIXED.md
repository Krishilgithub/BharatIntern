# 🚀 Render Deployment Fix Guide

## Issues Fixed

### Backend Issues:

1. **Port Binding Error**: Fixed by using proper port binding in main-production.py
2. **TensorFlow/CUDA Errors**: Removed heavy ML dependencies for production
3. **Memory Issues**: Optimized requirements for free tier deployment

### Frontend Issues:

1. **Build Failure**: Fixed Next.js configuration for static export
2. **Dependency Conflicts**: Resolved package.json issues
3. **Static Export**: Configured for proper static site deployment

## 🛠️ Deployment Steps

### Step 1: Backend Deployment

1. **Create a new Web Service on Render:**

   - Name: `bharatintern-backend`
   - Environment: `Python 3`
   - Region: `Oregon (US West)`
   - Plan: `Free`

2. **Configure Build Settings:**

   ```yaml
   Build Command: cd backend && pip install --upgrade pip && pip install -r requirements-production.txt
   Start Command: cd backend && python main-production.py
   ```

3. **Environment Variables:**

   ```
   PYTHON_VERSION=3.11.0
   PORT=10000
   HOST=0.0.0.0
   NODE_ENV=production
   ```

4. **Deploy the backend first** and note the URL (e.g., `https://bharatintern-backend.onrender.com`)

### Step 2: Frontend Deployment

1. **Create a new Static Site on Render:**

   - Name: `bharatintern-frontend`
   - Environment: `Static Site`
   - Region: `Oregon (US West)`
   - Plan: `Free`

2. **Configure Build Settings:**

   ```yaml
   Build Command: npm install && npm run build
   Publish Directory: build
   ```

3. **Environment Variables:**

   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://bharatintern-backend.onrender.com
   ```

4. **Deploy the frontend** using the updated configuration

## 📁 Files Created/Modified

### New Files:

- `backend/requirements-production.txt` - Lightweight production dependencies
- `backend/main-production.py` - Production-optimized FastAPI app
- `next.config.production.js` - Production Next.js config
- `package.production.json` - Production package.json
- `render-backend.yaml` - Backend service config
- `render-frontend.yaml` - Frontend service config
- `deploy-render.bat` - Windows deployment script
- `deploy-render.sh` - Linux/Mac deployment script

### Modified Files:

- `next.config.js` - Updated for static export
- `package.json` - Added export scripts
- `render-services.yaml` - Fixed service configurations

## 🔧 Key Changes Made

### Backend Optimizations:

1. **Removed Heavy Dependencies:**

   - TensorFlow (too heavy for free tier)
   - PyTorch (too heavy for free tier)
   - OpenCV (not needed for core functionality)
   - Selenium (not needed for API)

2. **Kept Essential Dependencies:**

   - FastAPI and Uvicorn
   - Basic ML libraries (scikit-learn, pandas)
   - Google Generative AI
   - Database connectors

3. **Fixed Port Binding:**
   - Proper host and port configuration
   - Environment variable handling

### Frontend Optimizations:

1. **Static Export Configuration:**

   - Changed from `standalone` to `export`
   - Added proper webpack fallbacks
   - Disabled server-side features

2. **Build Process:**
   - Added static export scripts
   - Fixed dependency issues
   - Optimized for production

## 🚨 Important Notes

1. **Deploy Backend First**: The frontend needs the backend URL for API calls
2. **Update CORS**: After backend deployment, update CORS settings with actual frontend URL
3. **Environment Variables**: Make sure all environment variables are set correctly
4. **Free Tier Limitations**: The optimized version works within Render's free tier limits

## 🔍 Troubleshooting

### If Backend Still Fails:

1. Check the logs for specific error messages
2. Ensure all dependencies are in requirements-production.txt
3. Verify Python version compatibility

### If Frontend Still Fails:

1. Check build logs for compilation errors
2. Ensure all dependencies are compatible
3. Verify Next.js configuration

### Common Issues:

1. **Port Binding**: Make sure the app binds to `0.0.0.0` and uses `$PORT`
2. **Memory Issues**: The production version uses minimal memory
3. **Build Timeouts**: The optimized version builds faster

## 📞 Support

If you encounter issues:

1. Check Render's deployment logs
2. Verify all environment variables
3. Ensure all files are properly committed to your repository
4. Test locally with the production configurations

## ✅ Success Indicators

- Backend: Health check at `/health` returns 200
- Frontend: Static site loads without errors
- API calls from frontend to backend work correctly
- No port binding or memory errors in logs
