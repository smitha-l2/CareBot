@echo off
echo 🚀 Starting Carebot Backend Server...
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo ⚠️  Dependencies not found. Installing...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies!
        pause
        exit /b 1
    )
)

echo 🔥 Starting server...
call npm start
