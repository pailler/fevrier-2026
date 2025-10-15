# Script de réparation complète Cloudflare - IAHOME
# Version: 2.0
# Date: $(Get-Date -Format "yyyy-MM-dd")

Write-Host "🔧 Réparation complète de Cloudflare - IAHOME" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Fonction pour vérifier si un port est en écoute
function Test-Port {
    param([int]$Port)
    try {
        $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        return $connection -ne $null
    } catch {
        return $false
    }
}

# Fonction pour tester l'accès à un service
function Test-Service {
    param([string]$Url, [string]$ServiceName)
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ $ServiceName : Accessible (Status: $($response.StatusCode))" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ $ServiceName : Non accessible - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 1. Arrêter tous les services problématiques
Write-Host "`n1️⃣ Arrêt des services problématiques..." -ForegroundColor Yellow
$servicesToStop = @(
    "whisper-cloudflared-prod",
    "whisper-webui-prod", 
    "whisper-api-prod",
    "whisper-ocr-prod",
    "whisper-video-prod",
    "qrcodes",
    "psitransfer",
    "metube",
    "librespeed",
    "stirling-pdf",
    "iahome-app"
)

foreach ($service in $servicesToStop) {
    Write-Host "   Arrêt de $service..." -ForegroundColor Gray
    docker stop $service 2>$null
}

# 2. Nettoyer les conteneurs arrêtés
Write-Host "`n2️⃣ Nettoyage des conteneurs..." -ForegroundColor Yellow
docker container prune -f

# 3. Redémarrer l'application principale
Write-Host "`n3️⃣ Redémarrage de l'application IAHOME..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d iahome-app

# 4. Attendre que l'application démarre
Write-Host "`n4️⃣ Attente du démarrage de l'application..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 5. Vérifier l'état de l'application principale
Write-Host "`n5️⃣ Vérification de l'application principale..." -ForegroundColor Yellow
$appStatus = Test-Service "http://localhost:3000" "IAHOME App"
if (-not $appStatus) {
    Write-Host "⚠️  L'application principale n'est pas accessible. Vérification des logs..." -ForegroundColor Yellow
    docker logs iahome-app --tail 10
}

# 6. Redémarrer les services essentiels
Write-Host "`n6️⃣ Redémarrage des services essentiels..." -ForegroundColor Yellow
Set-Location "essentiels"

# Démarrer les services dans l'ordre
$servicesToStart = @(
    "docker-compose -f docker-compose.services.yml up -d",
    "docker-compose -f docker-compose.whisper.yml up -d whisper-api whisper-webui"
)

foreach ($cmd in $servicesToStart) {
    Write-Host "   Exécution: $cmd" -ForegroundColor Gray
    Invoke-Expression $cmd
    Start-Sleep -Seconds 5
}

Set-Location ".."

# 7. Vérifier les ports et services
Write-Host "`n7️⃣ Vérification des ports et services..." -ForegroundColor Yellow

$portMappings = @{
    3000 = "IAHOME App"
    8081 = "PDF Service (Stirling)"
    8082 = "MeTube"
    8083 = "LibreSpeed"
    8084 = "PSITransfer"
    8085 = "StableDiffusion"
    8087 = "RuinedFooocus"
    8088 = "ComfyUI"
    8089 = "SDNext"
    8090 = "Invoke"
    8091 = "QR Codes"
    8093 = "Whisper WebUI"
}

$allServicesUp = $true
foreach ($port in $portMappings.Keys) {
    $isListening = Test-Port $port
    $serviceName = $portMappings[$port]
    
    if ($isListening) {
        Write-Host "✅ Port $port ($serviceName) : En écoute" -ForegroundColor Green
    } else {
        Write-Host "❌ Port $port ($serviceName) : Non utilisé" -ForegroundColor Red
        $allServicesUp = $false
    }
}

# 8. Tester l'accès aux services principaux
Write-Host "`n8️⃣ Test d'accès aux services principaux..." -ForegroundColor Yellow

$serviceTests = @(
    @{Url="http://localhost:3000"; Name="IAHOME App"},
    @{Url="http://localhost:8081"; Name="PDF Service"},
    @{Url="http://localhost:8082"; Name="MeTube"},
    @{Url="http://localhost:8083"; Name="LibreSpeed"},
    @{Url="http://localhost:8084"; Name="PSITransfer"},
    @{Url="http://localhost:8091"; Name="QR Codes"},
    @{Url="http://localhost:8093"; Name="Whisper WebUI"}
)

$servicesAccessible = 0
foreach ($test in $serviceTests) {
    if (Test-Service $test.Url $test.Name) {
        $servicesAccessible++
    }
}

# 9. Démarrer le tunnel Cloudflare
Write-Host "`n9️⃣ Démarrage du tunnel Cloudflare..." -ForegroundColor Yellow

# Vérifier si cloudflared est en cours d'exécution
$cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcess) {
    Write-Host "⚠️  Cloudflared est déjà en cours d'exécution. Arrêt..." -ForegroundColor Yellow
    Stop-Process -Name "cloudflared" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
}

# Démarrer cloudflared avec la configuration corrigée
Write-Host "🚀 Démarrage de Cloudflared avec la configuration corrigée..." -ForegroundColor Green
Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--config", "cloudflare-complete-config.yml", "run" -WindowStyle Minimized

# Attendre que le tunnel se connecte
Write-Host "⏳ Attente de la connexion du tunnel (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 10. Vérification finale
Write-Host "`n🔍 Vérification finale..." -ForegroundColor Cyan

# Vérifier le statut du tunnel
try {
    $tunnelInfo = & ".\cloudflared.exe" tunnel info 2>$null
    if ($tunnelInfo) {
        Write-Host "✅ Tunnel Cloudflare : Connecté" -ForegroundColor Green
        Write-Host $tunnelInfo -ForegroundColor Gray
    } else {
        Write-Host "❌ Tunnel Cloudflare : Non connecté" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Impossible de vérifier le statut du tunnel" -ForegroundColor Red
}

# Résumé final
Write-Host "`n📊 RÉSUMÉ DE LA RÉPARATION" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "Services accessibles : $servicesAccessible/$($serviceTests.Count)" -ForegroundColor $(if($servicesAccessible -eq $serviceTests.Count) {"Green"} else {"Yellow"})
Write-Host "Configuration Cloudflare : Corrigée" -ForegroundColor Green
Write-Host "Tunnel Cloudflare : $(if($tunnelInfo) {"Connecté"} else {"Non connecté"})" -ForegroundColor $(if($tunnelInfo) {"Green"} else {"Red"})

Write-Host "`n🎯 PROCHAINES ÉTAPES" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "1. Tester l'accès via https://iahome.fr" -ForegroundColor White
Write-Host "2. Vérifier les sous-domaines (metube.iahome.fr, etc.)" -ForegroundColor White
Write-Host "3. Consulter les logs si problème persiste :" -ForegroundColor White
Write-Host "   - docker logs iahome-app" -ForegroundColor Gray
Write-Host "   - docker logs whisper-webui-prod" -ForegroundColor Gray
Write-Host "4. Redémarrer le tunnel si nécessaire :" -ForegroundColor White
Write-Host "   .\cloudflared.exe tunnel --config cloudflare-complete-config.yml run" -ForegroundColor Gray

if (-not $allServicesUp) {
    Write-Host "`n⚠️  ATTENTION : Certains services ne sont pas démarrés" -ForegroundColor Yellow
    Write-Host "Vérifiez les logs Docker pour plus d'informations" -ForegroundColor Yellow
}

Write-Host "`n✅ Réparation terminée !" -ForegroundColor Green
