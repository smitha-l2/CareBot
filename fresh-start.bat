@echo off
cls
echo ========================================
echo    CareBot Complete Fresh Start Script
echo ========================================
echo.

echo [1/6] Stopping all running processes...
taskkill /f /im java.exe 2>nul
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
timeout /t 2 >nul

echo [2/6] Cleaning backend build artifacts...
cd /d "c:\Users\2313829\Downloads\Carebot\java-carebot-backend"
if exist target rmdir /s /q target
if exist .data rmdir /s /q .data
if exist data rmdir /s /q data

echo [3/6] Building backend from scratch...
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)

echo [4/6] Starting backend with simple profile...
start "CareBot Backend" cmd /k "echo Backend starting... && java "-Dspring.profiles.active=simple" -jar target\java-carebot-backend-1.0.0.jar"

echo [5/6] Waiting for backend to start...
timeout /t 10 >nul

echo [6/6] Starting frontend...
cd /d "c:\Users\2313829\Downloads\Carebot"
start "CareBot Frontend" cmd /k "echo Frontend starting... && npm start"

echo.
echo ========================================
echo    CareBot Application Starting
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:3000
echo.
echo Both applications are starting in separate windows.
echo Wait for "Started JavaCarebotBackendApplication" in backend window.
echo Wait for "webpack compiled" in frontend window.
echo.
echo Press any key to open the application in browser...
pause >nul

start http://localhost:3000

echo.
echo Application started successfully!
echo Check the separate windows for any errors.
pause
