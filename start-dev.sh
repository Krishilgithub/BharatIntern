#!/bin/bash

echo "🚀 Starting PM Internship Portal Development Server..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Start the development server
echo "🌐 Starting React development server..."
npm start
