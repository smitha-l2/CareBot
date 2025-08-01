@echo off
echo Starting Carebot Backend with Twilio WhatsApp Integration...
cd /d "C:\Users\2313829\Downloads\Carebot"
java -jar "java-carebot-backend\target\java-carebot-backend-1.0.0.jar" --spring.profiles.active=simple
pause
