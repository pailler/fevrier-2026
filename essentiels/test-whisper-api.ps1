# Script de test pour l'API Whisper
Write-Host "🧪 Test de l'API Whisper..." -ForegroundColor Cyan

# Test de l'API principale
Write-Host "📡 Test API principale (port 8092)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8092/" -Method GET -TimeoutSec 10
    Write-Host "✅ API principale accessible - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API principale inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'API vidéo
Write-Host "📡 Test API vidéo (port 8095)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8095/" -Method GET -TimeoutSec 10
    Write-Host "✅ API vidéo accessible - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API vidéo inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'API OCR
Write-Host "📡 Test API OCR (port 8094)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8094/health" -Method GET -TimeoutSec 10
    Write-Host "✅ API OCR accessible - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Réponse: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API OCR inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'interface web
Write-Host "📡 Test interface web (port 8093)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8093/" -Method GET -TimeoutSec 10
    Write-Host "✅ Interface web accessible - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Interface web inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🏁 Test terminé !" -ForegroundColor Cyan

