#!/bin/bash
# Start Backend Server Script (Linux/Mac)
# Make executable with: chmod +x start-backend.sh

echo "🚀 Starting BharatIntern Backend Server..."
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed"
    echo "Please install Python from https://www.python.org/downloads/"
    exit 1
fi

PYTHON_VERSION=$(python3 --version)
echo "✅ Found: $PYTHON_VERSION"

# Change to backend directory
cd backend || exit

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo "📦 Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  No virtual environment found. Using global Python."
fi

# Install requirements if needed
if [ -f "requirements.txt" ]; then
    echo "📥 Checking dependencies..."
    pip install -q -r requirements.txt
fi

echo ""
echo "============================================================"
echo "🎉 Starting Lightweight Backend Server..."
echo "============================================================"
echo ""

# Start the server
python3 simple_backend.py
