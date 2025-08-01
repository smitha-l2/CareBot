@echo off
echo 🚀 Starting Carebot Java Backend...
echo.

REM Navigate to the Java backend directory
cd /d "c:\Users\2313829\Downloads\Carebot\java-carebot-backend"

REM Check if Maven is installed
where mvn >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: Maven is not installed or not in PATH
    echo Please install Maven and add it to your PATH environment variable
    echo Download from: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)

echo ✅ Maven found, checking Java version...
java -version
echo.

echo 📦 Installing dependencies and building project...
mvn clean install -DskipTests
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: Failed to build project
    pause
    exit /b 1
)

echo.
echo 🏃 Starting Spring Boot application...
echo.
echo 📊 Server will be available at: http://localhost:8080/api
echo 🗄️  H2 Database Console: http://localhost:8080/api/h2-console
echo 📋 API Documentation: http://localhost:8080/api/swagger-ui.html
echo 🩺 Health Check: http://localhost:8080/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

mvn spring-boot:run

echo.
echo 👋 Carebot Java Backend stopped
pause
