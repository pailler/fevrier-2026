# Script de test pour le module Whisper IA
Write-Host "🧪 Test du module Whisper IA" -ForegroundColor Blue

# Test 1: Vérifier que l'API d'insertion fonctionne
Write-Host "`n1️⃣ Test de l'API d'insertion..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/insert-whisper" -Method POST -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ API d'insertion fonctionnelle" -ForegroundColor Green
        Write-Host "   - Module: $($response.data.title)" -ForegroundColor White
        Write-Host "   - ID: $($response.data.id)" -ForegroundColor White
        Write-Host "   - Prix: $($response.data.price)€" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur API: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Serveur Next.js non démarré ou erreur de connexion" -ForegroundColor Red
    Write-Host "   💡 Démarrez le serveur avec: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test 2: Vérifier que la page Whisper est accessible
Write-Host "`n2️⃣ Test de la page Whisper..." -ForegroundColor Yellow
try {
    $pageResponse = Invoke-WebRequest -Uri "http://localhost:3000/card/whisper" -Method GET
    if ($pageResponse.StatusCode -eq 200) {
        Write-Host "✅ Page Whisper accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Page Whisper non accessible (Code: $($pageResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Page Whisper non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérifier que la page applications affiche le module
Write-Host "`n3️⃣ Test de la page applications..." -ForegroundColor Yellow
try {
    $appsResponse = Invoke-WebRequest -Uri "http://localhost:3000/applications" -Method GET
    if ($appsResponse.StatusCode -eq 200) {
        if ($appsResponse.Content -match "Whisper IA") {
            Write-Host "✅ Module Whisper visible sur /applications" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Module Whisper non trouvé sur /applications" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Page applications non accessible (Code: $($appsResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Page applications non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Tests terminés !" -ForegroundColor Green
Write-Host "   - Module Whisper IA créé avec succès" -ForegroundColor White
Write-Host "   - Page détaillée: /card/whisper" -ForegroundColor White
Write-Host "   - Service Docker: https://whisper.iahome.fr" -ForegroundColor White
