# BharatIntern - Render Deployment Guide

## 🚀 Quick Deploy to Render

This project is now ready for deployment on Render. Follow these steps:

### Prerequisites

1. GitHub repository with the project code
2. Render account (free tier available)

### Deployment Steps

#### Step 1: Deploy Backend (FastAPI)

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:

   - **Name**: `bharatintern-backend`
   - **Environment**: `Python`
   - **Region**: `Oregon (US West)`
   - **Branch**: `master`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables:

   ```
   PYTHON_VERSION=3.11.0
   PORT=10000
   HOST=0.0.0.0
   ```

6. Click "Create Web Service"

#### Step 2: Deploy Frontend (Next.js)

1. Create another Web Service
2. Configure:

   - **Name**: `bharatintern-frontend`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)`
   - **Branch**: `master`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

3. Add Environment Variables:

   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://bharatintern-backend.onrender.com
   PORT=10000
   ```

4. Click "Create Web Service"

### 📋 Files Created for Deployment

✅ **render-services.yaml** - Render configuration file
✅ **build-render.sh** - Build script for deployment
✅ **RENDER_DEPLOYMENT.md** - Deployment documentation
✅ **.env.production.example** - Production environment template
✅ **Updated package.json** - Added deployment scripts
✅ **Updated next.config.js** - Production configuration
✅ **Updated backend/main.py** - Added health checks and CORS

### 🔧 Key Features Added

1. **Health Check Endpoints**:

   - Backend: `/health`
   - Frontend: Root path health monitoring

2. **Production CORS Configuration**:

   - Allows Render domains
   - Secure cross-origin requests

3. **Environment-based Configuration**:

   - Dynamic port assignment
   - Production API URLs
   - Environment variable support

4. **Build Optimization**:
   - Next.js production build
   - Python dependency caching
   - Optimized Docker-like setup

### 🌐 Expected URLs After Deployment

- **Frontend**: https://bharatintern-frontend.onrender.com
- **Backend API**: https://bharatintern-backend.onrender.com
- **API Docs**: https://bharatintern-backend.onrender.com/docs

### ⚡ Free Tier Limitations

- Services sleep after 15 minutes of inactivity
- Cold start may take 10-30 seconds
- 750 hours/month usage limit
- Consider upgrading for production use

### 🔐 Optional: Add Database (PostgreSQL)

If you need a database:

1. Go to Render Dashboard
2. Click "New +" → "PostgreSQL"
3. Configure and connect to your services

### 📞 Support

If you encounter issues:

1. Check Render logs in the dashboard
2. Verify environment variables
3. Ensure GitHub repository is accessible
4. Check service status on Render

## Next Steps After Deployment

1. Test all endpoints
2. Configure custom domain (optional)
3. Set up monitoring
4. Add SSL certificates (automatic on Render)
5. Configure CD/CI for auto-deployments

Happy Deploying! 🎉
