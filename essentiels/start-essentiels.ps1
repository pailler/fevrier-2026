# Script pour démarrer tous les services essentiels
Write-Host "🚀 Démarrage des services essentiels" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "   ✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

# Vérifier le réseau iahome-network
Write-Host "`n2. Vérification du réseau iahome-network..." -ForegroundColor Yellow
$network = docker network ls --filter "name=iahome-network" --format "{{.Name}}"
if ($network -eq "iahome-network") {
    Write-Host "   ✅ Réseau iahome-network trouvé" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Création du réseau iahome-network..." -ForegroundColor Yellow
    docker network create iahome-network
    Write-Host "   ✅ Réseau iahome-network créé" -ForegroundColor Green
}

# Arrêter les anciens containers
Write-Host "`n3. Arrêt des anciens containers..." -ForegroundColor Yellow
$containers = @("librespeed", "metube", "pdf", "psitransfer", "qrcodes")
foreach ($container in $containers) {
    Write-Host "   🛑 Arrêt de $container..." -ForegroundColor Yellow
    docker stop $container 2>$null
    docker rm $container 2>$null
    Write-Host "   ✅ $container arrêté et supprimé" -ForegroundColor Green
}

# Démarrer LibreSpeed
Write-Host "`n4. Démarrage de LibreSpeed..." -ForegroundColor Yellow
docker-compose -f docker-compose.librespeed.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ LibreSpeed démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du démarrage de LibreSpeed" -ForegroundColor Red
}

# Démarrer MeTube
Write-Host "`n5. Démarrage de MeTube..." -ForegroundColor Yellow
docker-compose -f docker-compose.metube.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ MeTube démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du démarrage de MeTube" -ForegroundColor Red
}

# Démarrer PDF
Write-Host "`n6. Démarrage de PDF..." -ForegroundColor Yellow
docker-compose -f docker-compose.pdf.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ PDF démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du démarrage de PDF" -ForegroundColor Red
}

# Démarrer PsiTransfer
Write-Host "`n7. Démarrage de PsiTransfer..." -ForegroundColor Yellow
docker-compose -f docker-compose.psitransfer.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ PsiTransfer démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du démarrage de PsiTransfer" -ForegroundColor Red
}

# Démarrer QR Codes
Write-Host "`n8. Démarrage de QR Codes..." -ForegroundColor Yellow
docker-compose -f docker-compose.qrcodes.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ QR Codes démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du démarrage de QR Codes" -ForegroundColor Red
}

# Vérification du statut final
Write-Host "`n9. Vérification du statut final..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
Write-Host "   📊 Statut des services essentiels:" -ForegroundColor Cyan
docker ps --filter "name=librespeed\|metube\|pdf\|psitransfer\|qrcodes" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host "`n🎯 Tous les services essentiels démarrés !" -ForegroundColor Green
Write-Host "   🌐 LibreSpeed: http://localhost:8085" -ForegroundColor Cyan
Write-Host "   📺 MeTube: http://localhost:8081" -ForegroundColor Cyan
Write-Host "   📄 PDF: http://localhost:8086" -ForegroundColor Cyan
Write-Host "   📁 PsiTransfer: http://localhost:8087" -ForegroundColor Cyan
Write-Host "   📱 QR Codes: http://localhost:7006" -ForegroundColor Cyan