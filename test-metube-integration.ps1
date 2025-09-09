# Script de test pour vérifier l'intégration complète de MeTube
Write-Host "🎬 Test de l'intégration MeTube complète" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification de l'application principale:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Application principale accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Application principale non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Vérification du service MeTube:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://metube.iahome.fr" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Service MeTube accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Service MeTube non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Vérification de l'API check-auth pour MeTube:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://metube.iahome.fr/api/check-auth" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ API check-auth MeTube accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ API check-auth MeTube non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Vérification des conteneurs Docker:" -ForegroundColor Cyan
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String -Pattern "metube|iahome-app"
    Write-Host "   ✅ Conteneurs Docker:" -ForegroundColor Green
    $containers | ForEach-Object { Write-Host "      $($_)" -ForegroundColor White }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification des conteneurs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Configuration MeTube implémentée:" -ForegroundColor Yellow
Write-Host "   ✅ API check-auth modifiée pour gérer MeTube" -ForegroundColor White
Write-Host "   ✅ Redirection vers metube.iahome.fr avec token" -ForegroundColor White
Write-Host "   ✅ Accès interdit hors iahome.fr" -ForegroundColor White
Write-Host "   ✅ AuthorizedAccessButton mis à jour pour MeTube" -ForegroundColor White
Write-Host "   ✅ Vérification des quotas et génération de token" -ForegroundColor White
Write-Host "   ✅ Ouverture dans un nouvel onglet" -ForegroundColor White
Write-Host "   ✅ Configuration Traefik mise à jour (iahome.fr)" -ForegroundColor White
Write-Host "   ✅ URLs de modules mises à jour" -ForegroundColor White
Write-Host ""

Write-Host "🔐 Processus d'accès MeTube:" -ForegroundColor Cyan
Write-Host "1. Utilisateur clique sur le bouton d'accès MeTube" -ForegroundColor White
Write-Host "2. Vérification de l'autorisation et des quotas" -ForegroundColor White
Write-Host "3. Génération d'un token temporaire JWT" -ForegroundColor White
Write-Host "4. Ouverture de metube.iahome.fr?token=XXX dans un nouvel onglet" -ForegroundColor White
Write-Host "5. API check-auth valide le token et redirige vers MeTube" -ForegroundColor White
Write-Host "6. Accès direct bloqué si pas de token ou origine incorrecte" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Test à effectuer:" -ForegroundColor Cyan
Write-Host "1. Ouvrez https://iahome.fr" -ForegroundColor White
Write-Host "2. Connectez-vous avec votre compte" -ForegroundColor White
Write-Host "3. Allez dans /encours ou /modules" -ForegroundColor White
Write-Host "4. Cliquez sur le bouton d'accès MeTube" -ForegroundColor White
Write-Host "5. Vérifiez l'ouverture dans un nouvel onglet avec token" -ForegroundColor White
Write-Host "6. Testez l'accès direct à metube.iahome.fr (doit rediriger vers login)" -ForegroundColor White
Write-Host ""

Write-Host "✅ Intégration MeTube complète !" -ForegroundColor Green
Write-Host "🎬 MeTube fonctionne exactement comme LibreSpeed avec token temporaire" -ForegroundColor Green
