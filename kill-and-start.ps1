# PowerShell script to kill process on port 8080 and start backend
Write-Host "Finding and killing process using port 8080..." -ForegroundColor Yellow

# Get process using port 8080
$processes = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object OwningProcess -Unique

if ($processes) {
    foreach ($proc in $processes) {
        $processId = $proc.OwningProcess
        Write-Host "Killing process with PID: $processId" -ForegroundColor Red
        try {
            Stop-Process -Id $processId -Force
            Write-Host "Successfully killed process $processId" -ForegroundColor Green
        } catch {
            Write-Host "Failed to kill process $processId" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No process found using port 8080" -ForegroundColor Green
}

# Also kill any Java processes that might be hanging
Write-Host "Killing any remaining Java processes..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Start-Sleep -Seconds 2

Write-Host "Starting CareBot Backend..." -ForegroundColor Green
Set-Location "c:\Users\2313829\Downloads\Carebot\java-carebot-backend"
& java "-Dspring.profiles.active=simple" -jar target\java-carebot-backend-1.0.0.jar
