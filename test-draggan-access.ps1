# Script de test d'accès pour le service DragGAN
# Compatible Windows PowerShell

Write-Host "🧪 Test d'accès au service DragGAN..." -ForegroundColor Cyan

# Vérifier que le conteneur est en cours d'exécution
Write-Host "`n📦 Vérification du conteneur DragGAN..." -ForegroundColor Yellow
$container = docker ps --format "table {{.Names}}\t{{.Status}}" | findstr draggan
if ($container) {
    Write-Host "✅ Conteneur DragGAN en cours d'exécution" -ForegroundColor Green
    Write-Host "   $container" -ForegroundColor Gray
} else {
    Write-Host "❌ Conteneur DragGAN non trouvé" -ForegroundColor Red
    exit 1
}

# Test de connectivité HTTP
Write-Host "`n🌐 Test de connectivité HTTP..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8087" -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Service DragGAN accessible sur http://localhost:8087" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  Service accessible mais status inattendu: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Impossible d'accéder au service DragGAN" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test de l'API Gradio
Write-Host "`n🔧 Test de l'API Gradio..." -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:8087/gradio_api/startup-events" -TimeoutSec 10 -UseBasicParsing
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✅ API Gradio fonctionnelle" -ForegroundColor Green
    } else {
        Write-Host "⚠️  API Gradio accessible mais status inattendu: $($apiResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ API Gradio non accessible" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Gray
}

# Vérifier les logs récents
Write-Host "`n📋 Logs récents du service..." -ForegroundColor Yellow
docker logs draggan-service --tail 10

# Informations d'accès
Write-Host "`n🎯 Informations d'accès:" -ForegroundColor Green
Write-Host "   URL locale: http://localhost:8087" -ForegroundColor Cyan
Write-Host "   URL Traefik: http://draggan.iahome.local" -ForegroundColor Cyan
Write-Host "   Port: 8087" -ForegroundColor Cyan
Write-Host "   Interface: Gradio" -ForegroundColor Cyan

Write-Host "`n✅ Test d'accès DragGAN terminé!" -ForegroundColor Green
