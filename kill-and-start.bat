@echo off
echo Killing process using port 8080...

REM Method 1: Kill by port
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do (
    echo Found process %%a using port 8080
    taskkill /f /pid %%a
)

REM Method 2: Kill all Java processes
echo Killing all Java processes...
taskkill /f /im java.exe 2>nul

REM Method 3: Kill specific Spring Boot processes
taskkill /f /im "java.exe" /fi "WINDOWTITLE eq *spring*" 2>nul

echo Process cleanup complete!
timeout /t 3 >nul

echo Starting backend on port 8080...
cd /d "c:\Users\2313829\Downloads\Carebot\java-carebot-backend"
java "-Dspring.profiles.active=simple" -jar target\java-carebot-backend-1.0.0.jar
pause
