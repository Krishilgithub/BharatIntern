#!/bin/bash

# BharatIntern Deployment Script for Render
echo "🚀 BharatIntern - Automated Deployment Setup"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "🔧 Building project..."

# Build frontend
echo "Building Next.js frontend..."
npm run build

echo "✅ Project ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to https://dashboard.render.com"
echo "3. Follow the DEPLOYMENT_GUIDE.md instructions"
echo ""
echo "Files created for deployment:"
echo "- render-services.yaml"
echo "- DEPLOYMENT_GUIDE.md" 
echo "- .env.production.example"
echo "- build-render.sh"
echo ""
echo "Happy deploying! 🎉"