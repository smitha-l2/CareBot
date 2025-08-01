@echo off
echo Installing backend dependencies...
cd backend
call npm install

echo.
echo Starting backend server...
call npm start
