# Script pour démarrer tous les services essentiels
Write-Host "🚀 Démarrage de tous les services essentiels" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerStatus = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification de Docker" -ForegroundColor Red
    exit 1
}

# Vérifier si le réseau iahome-network existe
Write-Host "`n2. Vérification du réseau iahome-network..." -ForegroundColor Yellow
try {
    $networkExists = docker network ls --filter name=iahome-network --format "{{.Name}}" 2>$null
    if ($networkExists -eq "iahome-network") {
        Write-Host "   ✅ Réseau iahome-network trouvé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Création du réseau iahome-network..." -ForegroundColor Yellow
        docker network create iahome-network
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Réseau iahome-network créé" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Erreur lors de la création du réseau" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification du réseau" -ForegroundColor Red
    exit 1
}

# Arrêter les anciens containers
Write-Host "`n3. Arrêt des anciens containers..." -ForegroundColor Yellow
$oldContainers = @("librespeed-iahome", "metube-iahome", "stirling-pdf-iahome", "psitransfer-iahome", "qrcodes-iahome")
foreach ($container in $oldContainers) {
    $containerExists = docker ps -a --filter name=$container --format "{{.Names}}" 2>$null
    if ($containerExists -eq $container) {
        Write-Host "   🛑 Arrêt de $container..." -ForegroundColor Yellow
        docker stop $container 2>$null
        docker rm $container 2>$null
        Write-Host "   ✅ $container arrêté et supprimé" -ForegroundColor Green
    }
}

# Démarrer LibreSpeed
Write-Host "`n4. Démarrage de LibreSpeed..." -ForegroundColor Yellow
docker-compose -f docker-compose.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ LibreSpeed démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur LibreSpeed" -ForegroundColor Red
}

# Démarrer MeTube
Write-Host "`n5. Démarrage de MeTube..." -ForegroundColor Yellow
docker-compose -f metube/docker-compose.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ MeTube démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur MeTube" -ForegroundColor Red
}

# Démarrer PDF
Write-Host "`n6. Démarrage de PDF..." -ForegroundColor Yellow
docker-compose -f pdf/docker-compose.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ PDF démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur PDF" -ForegroundColor Red
}

# Démarrer PsiTransfer
Write-Host "`n7. Démarrage de PsiTransfer..." -ForegroundColor Yellow
docker-compose -f psitransfer/docker-compose.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ PsiTransfer démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur PsiTransfer" -ForegroundColor Red
}

# Démarrer QR Codes
Write-Host "`n8. Démarrage de QR Codes..." -ForegroundColor Yellow
docker-compose -f qrcodes/docker-compose.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ QR Codes démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur QR Codes" -ForegroundColor Red
}

# Vérifier le statut final
Write-Host "`n9. Vérification du statut final..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $containers = docker ps --filter name=iahome --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "   📊 Statut des services essentiels:" -ForegroundColor Cyan
    Write-Host $containers -ForegroundColor White
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification du statut" -ForegroundColor Yellow
}

Write-Host "`n🎯 Tous les services essentiels démarrés !" -ForegroundColor Green
Write-Host "   🌐 LibreSpeed: https://librespeed.iahome.fr" -ForegroundColor Cyan
Write-Host "   📺 MeTube: https://metube.iahome.fr" -ForegroundColor Cyan
Write-Host "   📄 PDF: https://pdf.iahome.fr" -ForegroundColor Cyan
Write-Host "   📁 PsiTransfer: https://psitransfer.iahome.fr" -ForegroundColor Cyan
Write-Host "   📱 QR Codes: https://qrcodes.iahome.fr" -ForegroundColor Cyan
