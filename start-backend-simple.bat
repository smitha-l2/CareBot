@echo off
cd /d "c:\Users\2313829\Downloads\Carebot\java-carebot-backend"
echo Starting CareBot Backend with Simple Profile...
echo Backend will be available at: http://localhost:8080
echo Press Ctrl+C to stop the server
echo.
java "-Dspring.profiles.active=simple" -jar target\java-carebot-backend-1.0.0.jar
pause
