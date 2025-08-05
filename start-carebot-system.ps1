# CareBot System Startup Script
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "         CareBot Complete System Startup" -ForegroundColor Cyan  
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set location to project directory
Set-Location -Path $PSScriptRoot

Write-Host "Step 1: Starting Backend Server..." -ForegroundColor Yellow
Write-Host "Backend will run on: http://localhost:8080/api" -ForegroundColor Green
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\java-carebot-backend'; Write-Host 'Starting CareBot Backend...' -ForegroundColor Green; java -Dspring.profiles.active=simple -jar target\java-carebot-backend-1.0.0.jar"

Write-Host "Waiting 15 seconds for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "Step 2: Starting Frontend Server..." -ForegroundColor Yellow
Write-Host "Frontend will run on: http://localhost:3000 (or 3001)" -ForegroundColor Green
Write-Host ""

# Start frontend in new window  
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; Write-Host 'Starting CareBot Frontend...' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "         CareBot System Started!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Services starting in separate windows:" -ForegroundColor Green
Write-Host "  Backend:  http://localhost:8080/api" -ForegroundColor White
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White  
Write-Host "  H2 Console: http://localhost:8080/api/h2-console" -ForegroundColor White
Write-Host ""
Write-Host "Both services are now running in background windows." -ForegroundColor Yellow
Write-Host "You can close this window safely." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"
