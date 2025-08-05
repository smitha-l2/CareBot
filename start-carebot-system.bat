@echo off
title CareBot System Startup
echo ================================================
echo          CareBot Complete System Startup
echo ================================================
echo.

echo Step 1: Starting Backend Server...
echo Backend will run on: http://localhost:8080/api
echo.

REM Start backend in a new window
start "CareBot Backend" cmd /k "cd /d "%~dp0java-carebot-backend" && echo Starting CareBot Backend... && java -Dspring.profiles.active=simple -jar target\java-carebot-backend-1.0.0.jar"

echo Waiting 15 seconds for backend to initialize...
timeout /t 15 /nobreak

echo.
echo Step 2: Starting Frontend Server...
echo Frontend will run on: http://localhost:3000 (or 3001)
echo.

REM Start frontend in a new window
start "CareBot Frontend" cmd /k "cd /d "%~dp0" && echo Starting CareBot Frontend... && npm start"

echo.
echo ================================================
echo          CareBot System Started!
echo ================================================
echo.
echo Services starting in separate windows:
echo   Backend:  http://localhost:8080/api
echo   Frontend: http://localhost:3000
echo   H2 Console: http://localhost:8080/api/h2-console
echo.
echo Both services are now running in background windows.
echo You can close this window safely.
echo.
pause
