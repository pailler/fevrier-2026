# Reconstruit et redémarre le container Photobooth
# Necessaire pour appliquer les modifications de app.js / studio.js
Set-Location $PSScriptRoot
Write-Host "Reconstruction du container Photobooth..." -ForegroundColor Cyan
docker compose build --no-cache photobooth
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Redemarrage du container..." -ForegroundColor Cyan
docker compose up -d photobooth
Write-Host "OK - Photobooth disponible sur port 7885" -ForegroundColor Green
