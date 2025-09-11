@echo off
echo 🚀 Starting PM Internship Portal Development Server...

REM Check if node_modules exists
if not exist "node_modules" (
  echo 📦 Installing dependencies...
  npm install
)

REM Start the development server
echo 🌐 Starting React development server...
npm start
