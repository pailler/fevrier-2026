# Script de déploiement complet du module Whisper IA
Write-Host "🚀 Déploiement du module Whisper IA" -ForegroundColor Blue

# Étape 1: Vérifier que le serveur Next.js est démarré
Write-Host "`n1️⃣ Vérification du serveur Next.js..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✅ Serveur Next.js démarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Serveur Next.js non démarré" -ForegroundColor Red
    Write-Host "   💡 Démarrez le serveur avec: npm run dev" -ForegroundColor Yellow
    Write-Host "   💡 Puis relancez ce script" -ForegroundColor Yellow
    exit 1
}

# Étape 2: Insérer le module dans la base de données
Write-Host "`n2️⃣ Insertion du module dans la base de données..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/insert-whisper" -Method POST -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Module inséré avec succès" -ForegroundColor Green
        Write-Host "   - Titre: $($response.data.title)" -ForegroundColor White
        Write-Host "   - Catégorie: $($response.data.category)" -ForegroundColor White
        Write-Host "   - Prix: $($response.data.price)€" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur lors de l'insertion: $($response.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur API: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Étape 3: Vérifier que le service Docker Whisper est démarré
Write-Host "`n3️⃣ Vérification du service Docker Whisper..." -ForegroundColor Yellow
try {
    $dockerResponse = Invoke-WebRequest -Uri "https://whisper.iahome.fr" -Method GET -TimeoutSec 10
    if ($dockerResponse.StatusCode -eq 200) {
        Write-Host "✅ Service Whisper accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Service Whisper non accessible (Code: $($dockerResponse.StatusCode))" -ForegroundColor Yellow
        Write-Host "   💡 Démarrez le service avec: .\start-whisper-production.ps1" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Service Whisper non accessible: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   💡 Démarrez le service avec: .\start-whisper-production.ps1" -ForegroundColor Yellow
}

# Étape 4: Test de la page Whisper
Write-Host "`n4️⃣ Test de la page Whisper..." -ForegroundColor Yellow
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

# Étape 5: Test de la page applications
Write-Host "`n5️⃣ Test de la page applications..." -ForegroundColor Yellow
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

Write-Host "`n🎉 Déploiement terminé !" -ForegroundColor Green
Write-Host "`n📋 Résumé du module Whisper IA:" -ForegroundColor Cyan
Write-Host "   ✅ Page détaillée: http://localhost:3000/card/whisper" -ForegroundColor White
Write-Host "   ✅ Carte sur applications: http://localhost:3000/applications" -ForegroundColor White
Write-Host "   ✅ Service Docker: https://whisper.iahome.fr" -ForegroundColor White
Write-Host "   ✅ Image SVG: /images/module-visuals/whisper-module.svg" -ForegroundColor White
Write-Host "`n🔧 Fonctionnalités:" -ForegroundColor Cyan
Write-Host "   • Transcription audio (OpenAI Whisper)" -ForegroundColor White
Write-Host "   • Transcription vidéo avec horodatage" -ForegroundColor White
Write-Host "   • Reconnaissance de texte (OCR) sur images et PDF" -ForegroundColor White
Write-Host "   • Interface moderne et responsive" -ForegroundColor White
Write-Host "   • Support multilingue (optimisé français)" -ForegroundColor White
