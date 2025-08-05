@echo off
echo ========================================
echo Fixed CareBot Backend Startup
echo ========================================
echo.

echo Checking current directory...
cd
echo.

echo Starting backend JAR...
cd java-carebot-backend
java -jar target\java-carebot-backend-1.0.0.jar

pause
