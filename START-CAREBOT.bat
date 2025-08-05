@echo off
cls
echo =====================================================
echo    CareBot Healthcare Application Startup
echo    Complete System Reset and Start
echo =====================================================
echo.

REM Change to the main project directory
cd /d "c:\Users\2313829\Downloads\Carebot"

echo [1/6] Cleaning up existing processes...
taskkill /f /im java.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 >nul

echo [2/6] Building backend...
cd java-carebot-backend
call mvn clean package -DskipTests -q
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed!
    pause
    exit /b 1
)

echo [3/6] Starting backend server...
start "CareBot Backend" cmd /k "echo Backend starting... && java -Dspring.profiles.active=simple -jar target\java-carebot-backend-1.0.0.jar"

echo [4/6] Waiting for backend to start...
timeout /t 10 >nul

echo [5/6] Installing frontend dependencies...
cd ..
call npm install --silent

echo [6/6] Starting frontend...
start "CareBot Frontend" cmd /k "echo Frontend starting... && npm start"

echo.
echo =====================================================
echo    CareBot Application Started Successfully!
echo.
echo    Backend:  http://localhost:8080
echo    Frontend: http://localhost:3000
echo.
echo    Features Available:
echo    - Auto Medication Reminders
echo    - WhatsApp Notifications
echo    - Patient Document Upload
echo    - Reminder Management
echo =====================================================
echo.
echo Press any key to open the application in browser...
pause >nul

start http://localhost:3000

echo Application is ready! Check the console windows for logs.
pause
