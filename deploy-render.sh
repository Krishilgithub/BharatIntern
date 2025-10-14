#!/bin/bash

# Render Deployment Script for BharatIntern
echo "🚀 Starting Render deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Preparing production build..."

# Create production configurations
echo "🔧 Setting up production configurations..."

# Copy production configs
cp next.config.production.js next.config.js
cp package.production.json package.json

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Build the project
echo "🏗️ Building the project..."
npm run build

echo "✅ Frontend build completed successfully!"

# Backend preparation
echo "🐍 Preparing backend for deployment..."
cd backend

# Copy production requirements
cp requirements-production.txt requirements.txt
cp main-production.py main.py

echo "✅ Backend preparation completed!"

echo "🎉 Deployment preparation completed!"
echo "📋 Next steps:"
echo "1. Deploy backend using render-backend.yaml"
echo "2. Deploy frontend using render-frontend.yaml"
echo "3. Update CORS settings with actual URLs"
