#!/bin/bash

# Render Build Script for React App
echo "Starting Render build process..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the React app
echo "Building React application..."
npm run build

# Install serve globally for production serving
echo "Installing serve for production..."
npm install -g serve

echo "Build completed successfully!"