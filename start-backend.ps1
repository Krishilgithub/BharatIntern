# Start Backend Server Script (Windows)
# Save this as start-backend.ps1

Write-Host "🚀 Starting BharatIntern Backend Server..." -ForegroundColor Green
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Change to backend directory
Set-Location -Path "backend"

# Check if virtual environment exists
if (Test-Path "venv") {
    Write-Host "📦 Activating virtual environment..." -ForegroundColor Cyan
    .\venv\Scripts\Activate.ps1
} else {
    Write-Host "⚠️  No virtual environment found. Using global Python." -ForegroundColor Yellow
}

# Install requirements if needed
if (Test-Path "requirements.txt") {
    Write-Host "📥 Checking dependencies..." -ForegroundColor Cyan
    pip install -q -r requirements.txt
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "🎉 Starting Lightweight Backend Server..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Start the server
python simple_backend.py
