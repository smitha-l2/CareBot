@echo off
title CareBot Quick Start
cd /d "c:\Users\2313829\Downloads\Carebot"

echo Stopping existing processes...
taskkill /f /im java.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo Starting backend...
cd java-carebot-backend
start /min cmd /c "java -Dspring.profiles.active=simple -jar target\java-carebot-backend-1.0.0.jar"

echo Waiting for backend...
timeout /t 8 >nul

echo Starting frontend...
cd ..
npm start
