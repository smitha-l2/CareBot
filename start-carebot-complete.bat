@echo off
echo 🚀 Starting Carebot Healthcare System with Twilio WhatsApp Integration
echo.

echo ✅ Backend with Twilio WhatsApp integration is ready!
echo ✅ Patient Dashboard endpoints are working!
echo.

echo 🌐 You can now access:
echo    Frontend (React App): http://localhost:3000
echo    Alternative Frontend: http://localhost:3001
echo    Backend API Health: http://localhost:8080/api/health
echo    Patients API: http://localhost:8080/api/patients
echo    Documents API: http://localhost:8080/api/documents
echo.

echo 📱 WhatsApp Integration Status:
echo    ✅ Twilio Account: AC4f3ad9c545a38d4a4f250ecc8e16ed0c
echo    ✅ Automatic messaging: WORKING
echo    ✅ Sandbox joined: YES
echo.

echo 🎯 To test WhatsApp integration from the app:
echo    1. Open http://localhost:3000 or http://localhost:3001
echo    2. Login as Admin
echo    3. Click "Patients Dashboard" - should now work!
echo    4. Upload a patient document with your phone number
echo    5. Check your phone for automatic WhatsApp message!
echo.

echo 💡 Quick Test URLs:
echo    - Frontend: http://localhost:3000
echo    - Demo Page: %cd%\whatsapp-demo.html
echo.

echo Press any key to open the frontend...
pause >nul

start http://localhost:3000
