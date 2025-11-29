# Employee Attendance System - Start Script
# This script starts both backend and frontend servers

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  🚀 Starting Attendance System" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if MongoDB is running (optional check)
Write-Host "Checking MongoDB..." -ForegroundColor Green
try {
    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    if ($mongoService -and $mongoService.Status -eq "Running") {
        Write-Host "✓ MongoDB is running`n" -ForegroundColor Green
    } else {
        Write-Host "⚠ MongoDB service not found or not running" -ForegroundColor Yellow
        Write-Host "  Please ensure MongoDB is running before starting servers`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠ Could not check MongoDB status`n" -ForegroundColor Yellow
}

# Get the script directory (project root)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptPath "backend"
$frontendPath = Join-Path $scriptPath "frontend"

# Check if directories exist
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend folder not found!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend folder not found!" -ForegroundColor Red
    exit 1
}

# Function to check if port is in use
function Test-Port {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

# Check if ports are available
if (Test-Port -Port 5000) {
    Write-Host "⚠ Port 5000 is already in use!" -ForegroundColor Yellow
    Write-Host "  Backend may already be running`n" -ForegroundColor Yellow
}

if (Test-Port -Port 3000) {
    Write-Host "⚠ Port 3000 is already in use!" -ForegroundColor Yellow
    Write-Host "  Frontend may already be running`n" -ForegroundColor Yellow
}

Write-Host "Starting Backend Server..." -ForegroundColor Green
Write-Host "  Location: $backendPath" -ForegroundColor Gray
Write-Host "  Port: 5000`n" -ForegroundColor Gray

# Start Backend in new window
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; Write-Host '🔧 Backend Server Starting...' -ForegroundColor Cyan; Write-Host 'Port: 5000' -ForegroundColor Gray; Write-Host '─' * 50 -ForegroundColor Gray; npm run dev"
) -WindowStyle Normal

# Wait a bit for backend to start
Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server..." -ForegroundColor Green
Write-Host "  Location: $frontendPath" -ForegroundColor Gray
Write-Host "  Port: 3000`n" -ForegroundColor Gray

# Start Frontend in new window
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; Write-Host '⚛️  Frontend Server Starting...' -ForegroundColor Cyan; Write-Host 'Port: 3000' -ForegroundColor Gray; Write-Host '─' * 50 -ForegroundColor Gray; npm start"
) -WindowStyle Normal

Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Servers Starting in Separate Windows" -ForegroundColor Green
Write-Host "════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "Backend will be available at:" -ForegroundColor White
Write-Host "  http://localhost:5000`n" -ForegroundColor Cyan

Write-Host "Frontend will open automatically at:" -ForegroundColor White
Write-Host "  http://localhost:3000`n" -ForegroundColor Cyan

Write-Host "Please wait 30-60 seconds for compilation...`n" -ForegroundColor Yellow

Write-Host "Login Credentials:" -ForegroundColor Yellow
Write-Host "  Manager: manager@company.com / manager123" -ForegroundColor Gray
Write-Host "  Employee: alice@company.com / employee123`n" -ForegroundColor Gray

Write-Host "Press any key to close this window (servers will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

