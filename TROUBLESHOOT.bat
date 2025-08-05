@echo off
title CareBot Troubleshooting
echo CareBot System Diagnostics
echo =========================
echo.

echo Checking Java installation...
java -version
echo.

echo Checking Node.js installation...
node --version
npm --version
echo.

echo Checking ports...
netstat -ano | findstr ":8080"
netstat -ano | findstr ":3000"
echo.

echo Checking project structure...
cd /d "c:\Users\2313829\Downloads\Carebot"
dir /b
echo.

echo Checking backend jar file...
cd java-carebot-backend
dir target\*.jar
echo.

echo Backend application.properties profile:
findstr "spring.profiles.active" src\main\resources\application.properties
echo.

echo Testing backend compilation...
call mvn compile -q
echo Compilation status: %errorlevel%
echo.

echo Testing frontend dependencies...
cd ..
npm list --depth=0 2>nul | find "react"
echo.

pause
