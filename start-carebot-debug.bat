@echo off
echo ========================================
echo Starting CareBot with Debug Information
echo ========================================
echo.

echo Step 1: Checking prerequisites...
java -version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Java is not installed or not in PATH
    pause
    exit /b 1
)
echo ✓ Java is available

echo.
echo Step 2: Starting Backend (Java JAR)...
cd java-carebot-backend
start "CareBot Backend" cmd /k "echo Starting backend... && java -jar target\java-carebot-backend-1.0.0.jar"

echo Waiting for backend to start...
timeout /t 10 > nul

echo.
echo Step 3: Starting Frontend (React)...
cd ..
start "CareBot Frontend" cmd /k "echo Starting frontend... && npm start"

echo.
echo ========================================
echo CareBot is starting up!
echo ========================================
echo Backend: http://localhost:8080/api
echo Frontend: http://localhost:3000
echo H2 Console: http://localhost:8080/api/h2-console
echo.
echo Press any key to continue...
pause
