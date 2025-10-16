# Start Perplexity Resume Analyzer Backend
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Starting BharatIntern Perplexity Resume Analyzer" -ForegroundColor Green
Write-Host "=" -ForegroundColor Cyan -NoNewline
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
Set-Location -Path backend

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "❌ .env file not found. Creating from template..." -ForegroundColor Yellow
    if (Test-Path "../.env") {
        Copy-Item "../.env" ".env"
        Write-Host "✅ .env file copied from root directory" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: No .env file found. Please create one with PERPLEXITY_API_KEY" -ForegroundColor Yellow
    }
}

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8 or higher" -ForegroundColor Red
    exit 1
}

# Check if required packages are installed
Write-Host ""
Write-Host "📦 Checking Python dependencies..." -ForegroundColor Cyan

$requiredPackages = @("fastapi", "uvicorn", "PyPDF2", "openai", "python-dotenv")
$missingPackages = @()

foreach ($package in $requiredPackages) {
    $installed = python -c "import $($package.Replace('-', '_'))" 2>&1
    if ($LASTEXITCODE -ne 0) {
        $missingPackages += $package
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host "⚠️  Missing packages: $($missingPackages -join ', ')" -ForegroundColor Yellow
    Write-Host "📥 Installing missing packages..." -ForegroundColor Cyan
    pip install $($missingPackages -join ' ')
} else {
    Write-Host "✅ All dependencies installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting Perplexity Resume Analyzer Backend..." -ForegroundColor Green
Write-Host ""

# Start the backend server
python perplexity_backend.py
