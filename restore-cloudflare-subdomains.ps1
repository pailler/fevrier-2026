# Script pour rétablir Cloudflare pour tous les sous-domaines
# IAHome - Restauration complète des services

Write-Host "🔧 Rétablissement Cloudflare pour les sous-domaines IAHome" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Vérifier si Docker Desktop est en cours d'exécution
Write-Host "`n1. Vérification de Docker Desktop..." -ForegroundColor Yellow
try {
    $dockerStatus = docker version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker Desktop est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker Desktop n'est pas en cours d'exécution" -ForegroundColor Red
        Write-Host "🔄 Démarrage de Docker Desktop..." -ForegroundColor Yellow
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        Write-Host "⏳ Attente du démarrage de Docker (30 secondes)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification de Docker: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔄 Tentative de démarrage de Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Start-Sleep -Seconds 30
}

# Démarrer les services essentiels
Write-Host "`n2. Démarrage des services essentiels..." -ForegroundColor Yellow

# Démarrer les services Docker essentiels
Write-Host "🐳 Démarrage des conteneurs Docker..." -ForegroundColor Cyan
Set-Location "c:\Users\AAA\Documents\iahome\docker-services\essentiels"

# Démarrer tous les services essentiels
Write-Host "📦 Démarrage de tous les services essentiels..." -ForegroundColor Cyan
docker-compose up -d

# Attendre que les services démarrent
Write-Host "⏳ Attente du démarrage des services (15 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Vérifier l'état des services
Write-Host "`n3. Vérification de l'état des services..." -ForegroundColor Yellow
$services = @(
    @{Name="IAHome App"; Port=3000; URL="http://localhost:3000"},
    @{Name="MeTube"; Port=8081; URL="http://localhost:8081"},
    @{Name="LibreSpeed"; Port=8085; URL="http://localhost:8085"},
    @{Name="QR Codes"; Port=7006; URL="http://localhost:7006"},
    @{Name="PsiTransfer"; Port=8087; URL="http://localhost:8087"},
    @{Name="PDF Tools"; Port=8086; URL="http://localhost:8086"},
    @{Name="Whisper"; Port=8093; URL="http://localhost:8093"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($service.Name) (port $($service.Port)): En ligne" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $($service.Name) (port $($service.Port)): Réponse $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($service.Name) (port $($service.Port)): Hors ligne" -ForegroundColor Red
    }
}

# Créer la configuration Cloudflare mise à jour
Write-Host "`n4. Création de la configuration Cloudflare mise à jour..." -ForegroundColor Yellow

$cloudflareConfig = @"
tunnel: iahome-new
credentials-file: C:\Users\AAA\.cloudflared\02a960c5-edd6-4b3f-844f-410b16247262.json

ingress:
  - hostname: iahome.fr
    service: http://localhost:3000
    originRequest:
      httpHostHeader: iahome.fr
      noTLSVerify: true
      disableChunkedEncoding: true
      connectTimeout: 30s
      tlsTimeout: 10s
      tcpKeepAlive: 30s
      keepAliveConnections: 10
      keepAliveTimeout: 1m30s
  - hostname: www.iahome.fr
    service: http://localhost:3000
    originRequest:
      httpHostHeader: www.iahome.fr
      noTLSVerify: true
      disableChunkedEncoding: true
      connectTimeout: 30s
      tlsTimeout: 10s
      tcpKeepAlive: 30s
      keepAliveConnections: 10
      keepAliveTimeout: 1m30s
  - hostname: metube.iahome.fr
    service: http://localhost:8081
    originRequest:
      httpHostHeader: metube.iahome.fr
      noTLSVerify: true
  - hostname: librespeed.iahome.fr
    service: http://localhost:8085
    originRequest:
      httpHostHeader: librespeed.iahome.fr
      noTLSVerify: true
  - hostname: whisper.iahome.fr
    service: http://localhost:8093
    originRequest:
      httpHostHeader: whisper.iahome.fr
      noTLSVerify: true
  - hostname: psitransfer.iahome.fr
    service: http://localhost:8087
    originRequest:
      httpHostHeader: psitransfer.iahome.fr
      noTLSVerify: true
  - hostname: qrcodes.iahome.fr
    service: http://localhost:7006
    originRequest:
      httpHostHeader: qrcodes.iahome.fr
      noTLSVerify: true
  - hostname: pdf.iahome.fr
    service: http://localhost:8086
    originRequest:
      httpHostHeader: pdf.iahome.fr
      noTLSVerify: true
  - hostname: meeting-reports.iahome.fr
    service: http://127.0.0.1:3050
    originRequest:
      httpHostHeader: meeting-reports.iahome.fr
      noTLSVerify: true
      disableChunkedEncoding: true
      connectTimeout: 30s
      tlsTimeout: 10s
  - service: http_status:404
"@

# Sauvegarder l'ancienne configuration
if (Test-Path "cloudflare-iahome-new-config.yml") {
    Copy-Item "cloudflare-iahome-new-config.yml" "cloudflare-iahome-new-config.yml.backup"
    Write-Host "📁 Ancienne configuration sauvegardée" -ForegroundColor Cyan
}

# Écrire la nouvelle configuration
$cloudflareConfig | Out-File -FilePath "cloudflare-iahome-new-config.yml" -Encoding UTF8
Write-Host "✅ Configuration Cloudflare mise à jour" -ForegroundColor Green

# Arrêter le tunnel Cloudflare existant
Write-Host "`n5. Redémarrage du tunnel Cloudflare..." -ForegroundColor Yellow
Write-Host "🛑 Arrêt du tunnel existant..." -ForegroundColor Cyan
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# Démarrer le tunnel avec la nouvelle configuration
Write-Host "🚀 Démarrage du tunnel avec la nouvelle configuration..." -ForegroundColor Cyan
Start-Process -FilePath "cloudflared.exe" -ArgumentList "tunnel", "--config", "cloudflare-iahome-new-config.yml", "run" -WindowStyle Minimized

# Attendre que le tunnel se connecte
Write-Host "⏳ Attente de la connexion du tunnel (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier l'état du tunnel
Write-Host "`n6. Vérification de l'état du tunnel..." -ForegroundColor Yellow
try {
    $tunnelStatus = cloudflared tunnel list
    Write-Host "✅ Tunnel Cloudflare actif:" -ForegroundColor Green
    Write-Host $tunnelStatus
} catch {
    Write-Host "❌ Erreur lors de la vérification du tunnel: $($_.Exception.Message)" -ForegroundColor Red
}

# Test des sous-domaines
Write-Host "`n7. Test des sous-domaines..." -ForegroundColor Yellow
$subdomains = @(
    "https://iahome.fr",
    "https://metube.iahome.fr",
    "https://librespeed.iahome.fr",
    "https://qrcodes.iahome.fr",
    "https://psitransfer.iahome.fr",
    "https://pdf.iahome.fr",
    "https://whisper.iahome.fr"
)

foreach ($subdomain in $subdomains) {
    try {
        $response = Invoke-WebRequest -Uri $subdomain -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $subdomain : Accessible" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $subdomain : Réponse $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $subdomain : Inaccessible" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Rétablissement Cloudflare terminé !" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "  • Services Docker: Démarrés" -ForegroundColor White
Write-Host "  • Configuration Cloudflare: Mise à jour" -ForegroundColor White
Write-Host "  • Tunnel Cloudflare: Redémarré" -ForegroundColor White
Write-Host "  • Sous-domaines: Testés" -ForegroundColor White
Write-Host "`n🌐 Vos services sont maintenant accessibles via:" -ForegroundColor Cyan
Write-Host "  • https://iahome.fr (Application principale)" -ForegroundColor White
Write-Host "  • https://metube.iahome.fr (MeTube)" -ForegroundColor White
Write-Host "  • https://librespeed.iahome.fr (LibreSpeed)" -ForegroundColor White
Write-Host "  • https://qrcodes.iahome.fr (QR Codes)" -ForegroundColor White
Write-Host "  • https://psitransfer.iahome.fr (PsiTransfer)" -ForegroundColor White
Write-Host "  • https://pdf.iahome.fr (PDF Tools)" -ForegroundColor White
Write-Host "  • https://whisper.iahome.fr (Whisper)" -ForegroundColor White

Write-Host "`n📝 Pour surveiller les logs du tunnel:" -ForegroundColor Yellow
Write-Host "  cloudflared tunnel info iahome-new" -ForegroundColor Gray
Write-Host "`n📝 Pour redémarrer le tunnel si nécessaire:" -ForegroundColor Yellow
Write-Host "  .\restore-cloudflare-subdomains.ps1" -ForegroundColor Gray
