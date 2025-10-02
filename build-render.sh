#!/bin/bash

# Build script for Render deployment
echo "Starting build process..."

# Set Node environment
export NODE_ENV=production

# Install all dependencies (including dev dependencies for build)
echo "Installing dependencies..."
npm ci

# Build the application
echo "Building application..."
npm run build

echo "Build completed successfully!"