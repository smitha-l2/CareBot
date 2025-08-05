@echo off
echo Stopping all Java processes...
taskkill /f /im java.exe 2>nul
timeout /t 2 >nul

echo Starting CareBot Backend with Simple Profile on Port 8080...
cd /d "c:\Users\2313829\Downloads\Carebot\java-carebot-backend"
echo Backend will be available at: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
java "-Dspring.profiles.active=simple" -jar target\java-carebot-backend-1.0.0.jar
pause
