@echo off
REM Render Deployment Script for BharatIntern (Windows)
echo 🚀 Starting Render deployment process...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo 📦 Preparing production build...

REM Create production configurations
echo 🔧 Setting up production configurations...

REM Copy production configs
copy next.config.production.js next.config.js
copy package.production.json package.json

REM Install dependencies
echo 📥 Installing dependencies...
npm install

REM Build the project
echo 🏗️ Building the project...
npm run build

echo ✅ Frontend build completed successfully!

REM Backend preparation
echo 🐍 Preparing backend for deployment...
cd backend

REM Copy production requirements
copy requirements-production.txt requirements.txt
copy main-production.py main.py

echo ✅ Backend preparation completed!

echo 🎉 Deployment preparation completed!
echo 📋 Next steps:
echo 1. Deploy backend using render-backend.yaml
echo 2. Deploy frontend using render-frontend.yaml
echo 3. Update CORS settings with actual URLs

pause
