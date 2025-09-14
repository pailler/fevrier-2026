# Script pour insérer le module Whisper via l'interface d'administration
Write-Host "🔄 Insertion du module Whisper via l'interface d'administration..." -ForegroundColor Blue

# Test de l'interface d'administration
Write-Host "`n1️⃣ Test de l'interface d'administration..." -ForegroundColor Yellow
try {
    $adminResponse = Invoke-WebRequest -Uri "http://localhost:3000/admin/modules" -Method GET -TimeoutSec 10
    if ($adminResponse.StatusCode -eq 200) {
        Write-Host "✅ Interface d'administration accessible" -ForegroundColor Green
        Write-Host "   URL: http://localhost:3000/admin/modules" -ForegroundColor White
    } else {
        Write-Host "❌ Interface d'administration non accessible (Code: $($adminResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Interface d'administration non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'API d'insertion alternative
Write-Host "`n2️⃣ Test de l'API d'insertion alternative..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/insert-whisper" -Method POST -ContentType "application/json" -TimeoutSec 10
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✅ API d'insertion fonctionnelle" -ForegroundColor Green
    } else {
        Write-Host "❌ API d'insertion non accessible (Code: $($apiResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API d'insertion non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n💡 Solutions pour insérer le module Whisper:" -ForegroundColor Cyan

Write-Host "`n🔧 Solution 1: Interface d'administration" -ForegroundColor Yellow
Write-Host "   1. Allez sur http://localhost:3000/admin/modules" -ForegroundColor White
Write-Host "   2. Cliquez sur 'Ajouter un module'" -ForegroundColor White
Write-Host "   3. Remplissez les champs:" -ForegroundColor White
Write-Host "      - ID: whisper" -ForegroundColor White
Write-Host "      - Titre: Whisper IA" -ForegroundColor White
Write-Host "      - Description: Intelligence artificielle multimédia..." -ForegroundColor White
Write-Host "      - Catégorie: Productivité" -ForegroundColor White
Write-Host "      - Prix: 0" -ForegroundColor White
Write-Host "      - URL: https://whisper.iahome.fr" -ForegroundColor White
Write-Host "      - Image: /images/module-visuals/whisper-module.svg" -ForegroundColor White

Write-Host "`n🔧 Solution 2: Base de données directe" -ForegroundColor Yellow
Write-Host "   1. Connectez-vous à votre console Supabase" -ForegroundColor White
Write-Host "   2. Allez dans l'éditeur SQL" -ForegroundColor White
Write-Host "   3. Exécutez la requête SQL (voir insert-whisper-direct.ps1)" -ForegroundColor White

Write-Host "`n🔧 Solution 3: Vérification des modules existants" -ForegroundColor Yellow
Write-Host "   1. Allez sur http://localhost:3000/applications" -ForegroundColor White
Write-Host "   2. Vérifiez si Whisper apparaît dans la liste" -ForegroundColor White
Write-Host "   3. Si non, utilisez une des solutions ci-dessus" -ForegroundColor White

Write-Host "`n📊 Données du module Whisper:" -ForegroundColor Cyan
Write-Host "   - ID: whisper" -ForegroundColor White
Write-Host "   - Titre: Whisper IA" -ForegroundColor White
Write-Host "   - Catégorie: Productivité" -ForegroundColor White
Write-Host "   - Prix: 0 (gratuit)" -ForegroundColor White
Write-Host "   - URL: https://whisper.iahome.fr" -ForegroundColor White
Write-Host "   - Image: /images/module-visuals/whisper-module.svg" -ForegroundColor White

Write-Host "`n✅ Module Whisper prêt pour l'insertion !" -ForegroundColor Green
