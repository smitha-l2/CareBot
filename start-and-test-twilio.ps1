Write-Host "🚀 Starting Carebot Backend with Twilio WhatsApp Integration..." -ForegroundColor Green
Set-Location "C:\Users\2313829\Downloads\Carebot"
Start-Process -FilePath "java" -ArgumentList "-jar", "java-carebot-backend\target\java-carebot-backend-1.0.0.jar", "--spring.profiles.active=simple" -NoNewWindow -PassThru
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15
Write-Host "🔍 Checking if backend is running..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -UseBasicParsing
    Write-Host "✅ Backend is running successfully!" -ForegroundColor Green
    Write-Host "🌐 Health check response: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend might still be starting or failed to start" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host "📱 Ready to test Twilio WhatsApp integration!" -ForegroundColor Magenta
