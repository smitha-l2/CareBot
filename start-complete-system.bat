@echo off
echo ============================================
echo   Complete CareBot System Startup
echo ============================================
echo.

echo Step 1: Starting Backend...
start "CareBot Backend" cmd /k "cd /d %~dp0 && start-backend-manual.bat"

echo Waiting 15 seconds for backend to start...
timeout /t 15 > nul

echo Step 2: Starting Frontend...
start "CareBot Frontend" cmd /k "cd /d %~dp0 && npm start"

echo.
echo ============================================
echo   CareBot is starting up!
echo ============================================
echo Backend: http://localhost:8080/api
echo Frontend: http://localhost:3000 (or 3001)
echo.
echo Both services are starting in separate windows.
echo Press any key to continue...
pause
