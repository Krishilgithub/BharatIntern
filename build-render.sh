#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo "Build completed successfully!"