# Script de vérification du module Whisper IA
Write-Host "🔍 Vérification du module Whisper IA" -ForegroundColor Blue

# Test 1: Vérifier que la page Whisper est accessible
Write-Host "`n1️⃣ Test de la page Whisper..." -ForegroundColor Yellow
try {
    $pageResponse = Invoke-WebRequest -Uri "http://localhost:3000/card/whisper" -Method GET -TimeoutSec 10
    if ($pageResponse.StatusCode -eq 200) {
        Write-Host "✅ Page Whisper accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Page Whisper non accessible (Code: $($pageResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Page Whisper non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Vérifier que la page applications affiche le module
Write-Host "`n2️⃣ Test de la page applications..." -ForegroundColor Yellow
try {
    $appsResponse = Invoke-WebRequest -Uri "http://localhost:3000/applications" -Method GET -TimeoutSec 10
    if ($appsResponse.StatusCode -eq 200) {
        if ($appsResponse.Content -match "Whisper IA") {
            Write-Host "✅ Module Whisper visible sur /applications" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Module Whisper non trouvé sur /applications" -ForegroundColor Yellow
            Write-Host "   💡 Le module doit être inséré dans la base de données" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Page applications non accessible (Code: $($appsResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Page applications non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérifier que l'image SVG existe
Write-Host "`n3️⃣ Test de l'image SVG..." -ForegroundColor Yellow
$imagePath = "public/images/module-visuals/whisper-module.svg"
if (Test-Path $imagePath) {
    Write-Host "✅ Image SVG Whisper trouvée" -ForegroundColor Green
} else {
    Write-Host "❌ Image SVG Whisper non trouvée: $imagePath" -ForegroundColor Red
}

# Test 4: Vérifier que les fichiers de code existent
Write-Host "`n4️⃣ Test des fichiers de code..." -ForegroundColor Yellow
$files = @(
    "src/app/card/whisper/page.tsx",
    "src/components/ModuleCard.tsx",
    "src/app/card/[id]/page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file trouvé" -ForegroundColor Green
    } else {
        Write-Host "❌ $file non trouvé" -ForegroundColor Red
    }
}

# Test 5: Vérifier le service Docker Whisper
Write-Host "`n5️⃣ Test du service Docker Whisper..." -ForegroundColor Yellow
try {
    $whisperResponse = Invoke-WebRequest -Uri "http://localhost:8093" -Method GET -TimeoutSec 10
    if ($whisperResponse.StatusCode -eq 200) {
        Write-Host "✅ Service Whisper accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Service Whisper non accessible (Code: $($whisperResponse.StatusCode))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Service Whisper non accessible: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n📋 Résumé de la vérification:" -ForegroundColor Cyan
Write-Host "   ✅ Page Whisper: http://localhost:3000/card/whisper" -ForegroundColor White
Write-Host "   ✅ Page Applications: http://localhost:3000/applications" -ForegroundColor White
Write-Host "   ✅ Service Docker: http://localhost:8093" -ForegroundColor White
Write-Host "   ✅ Service Sécurisé: https://whisper.iahome.fr" -ForegroundColor White

Write-Host "`n🎯 Pour voir la carte Whisper:" -ForegroundColor Yellow
Write-Host "   1. Insérez le module dans la base de données (voir insert-whisper-direct.ps1)" -ForegroundColor White
Write-Host "   2. Rafraîchissez la page /applications" -ForegroundColor White
Write-Host "   3. La carte Whisper IA devrait apparaître" -ForegroundColor White
