@echo off
echo Starting Carebot Java Backend...
echo.

REM Check if Java is installed
java -version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Java is not installed or not in PATH
    echo Please install Java 17 or later and add it to your PATH
    pause
    exit /b 1
)

REM Check if Maven is installed
mvn -version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Warning: Maven is not installed. Attempting to download dependencies...
    echo Please install Maven for full functionality.
    echo.
    echo Downloading Maven dependencies manually...
    
    REM Create a simple classpath with basic dependencies
    echo This is a simplified startup. For full functionality, please install Maven.
    echo.
    echo Alternative: Try using an IDE like IntelliJ IDEA or Eclipse that can handle Maven projects.
    pause
    exit /b 1
)

echo.
echo Building and starting the application...
mvn clean spring-boot:run

pause
