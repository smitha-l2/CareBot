@echo off
echo ============================================
echo   CareBot Backend Startup (Fixed Version)
echo ============================================
echo.

echo Current directory:
cd
echo.

echo Checking Java...
java -version
echo.

echo Starting CareBot Backend...
echo Backend will be available at: http://localhost:8080/api
echo H2 Console at: http://localhost:8080/api/h2-console
echo.

echo Starting in 3 seconds...
timeout /t 3 > nul

java -Dspring.profiles.active=simple -jar java-carebot-backend\target\java-carebot-backend-1.0.0.jar

echo.
echo Backend stopped. Press any key to exit...
pause
