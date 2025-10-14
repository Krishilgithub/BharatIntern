@echo off
echo 🚀 BharatIntern - Automated Deployment Setup
echo =============================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...

REM Install frontend dependencies
echo Installing frontend dependencies...
call npm install

REM Install backend dependencies
echo Installing backend dependencies...
cd backend
call pip install -r requirements.txt
cd ..

echo 🔧 Building project...

REM Build frontend
echo Building Next.js frontend...
call npm run build

echo ✅ Project ready for deployment!
echo.
echo Next steps:
echo 1. Push your code to GitHub
echo 2. Go to https://dashboard.render.com
echo 3. Follow the DEPLOYMENT_GUIDE.md instructions
echo.
echo Files created for deployment:
echo - render-services.yaml
echo - DEPLOYMENT_GUIDE.md
echo - .env.production.example
echo - build-render.sh
echo.
echo Happy deploying! 🎉
pause