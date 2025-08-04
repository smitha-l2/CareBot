@echo off
echo 🚀 Installing Carebot Backend with H2-like Database...
echo.

cd /d "%~dp0"

echo 📦 Installing Node.js dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ✅ Backend installation complete!
echo.
echo 📋 Available commands:
echo   npm start     - Start the production server
echo   npm run dev   - Start development server with auto-reload
echo.
echo 🗄️  Database: SQLite will be created automatically on first run
echo 📁 Uploads: Files will be stored in the 'uploads' directory
echo.
echo To start the server, run: npm start
echo.
pause
