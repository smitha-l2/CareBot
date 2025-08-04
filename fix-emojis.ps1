# PowerShell script to fix corrupted emojis in CSS file
$cssFile = "src\index.css"

# Read the file content with proper encoding
$content = Get-Content $cssFile -Raw -Encoding UTF8

# Replace corrupted emojis with correct ones
$content = $content -replace 'ðŸ''¤', '👤'  # User emoji
$content = $content -replace 'ðŸ"', '📄'     # Document emoji  
$content = $content -replace 'ðŸ"'', '🔒'   # Lock emoji
$content = $content -replace 'ðŸ"', '📁'     # Folder emoji
$content = $content -replace 'ðŸ©º', '🩺'   # Stethoscope emoji
$content = $content -replace 'ðŸ'¥', '👥'   # People emoji

# Write back to file with UTF8 encoding
$content | Out-File $cssFile -Encoding UTF8 -NoNewline

Write-Host "✅ Emojis fixed successfully!"
Write-Host "📋 Replacements made:"
Write-Host "   ðŸ'¤ → 👤 (User)"
Write-Host "   ðŸ" → 📄 (Document)"
Write-Host "   ðŸ"' → 🔒 (Lock)"
Write-Host "   ðŸ" → 📁 (Folder)"
Write-Host "   ðŸ©º → 🩺 (Stethoscope)"
Write-Host "   ðŸ'¥ → 👥 (People)"
