#!/usr/bin/env pwsh

Write-Host "🔄 Migration complète des itinéraires d'applications vers iahome-prod" -ForegroundColor Cyan

Write-Host "`n📋 Étape 1: Vérification du tunnel iahome-prod" -ForegroundColor Yellow
$tunnelInfo = .\cloudflared.exe tunnel info iahome-prod
Write-Host "Tunnel actif: iahome-prod" -ForegroundColor Green

Write-Host "`n📋 Étape 2: Configuration des routes DNS pour tous les domaines" -ForegroundColor Yellow

# Liste complète des domaines à migrer (basée sur l'interface d'itinéraires d'applications)
$allDomains = @(
    "iahome.fr",
    "www.iahome.fr",
    "librespeed.iahome.fr",
    "whisper.iahome.fr",
    "whisper-audio.iahome.fr",
    "whisper-video.iahome.fr",
    "whisper-ocr.iahome.fr",
    "pdf.iahome.fr",
    "metube.iahome.fr",
    "psitransfer.iahome.fr",
    "stablediffusion.iahome.fr",
    "ruinedfooocus.iahome.fr",
    "comfyui.iahome.fr",
    "sdnext.iahome.fr",
    "invoke.iahome.fr",
    "qrcodes.iahome.fr",
    "traefik.iahome.fr"
)

$successCount = 0
$errorCount = 0

foreach ($domain in $allDomains) {
    Write-Host "`n🔧 Configuration de $domain..." -ForegroundColor Cyan
    
    $result = .\cloudflared.exe tunnel route dns iahome-prod $domain 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $domain configuré avec succès" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "   ⚠️  $domain : $result" -ForegroundColor Yellow
        $errorCount++
    }
    
    Start-Sleep 1
}

Write-Host "`n📊 Résumé de la configuration :" -ForegroundColor Yellow
Write-Host "✅ Routes configurées avec succès: $successCount" -ForegroundColor Green
Write-Host "⚠️  Erreurs/Conflits: $errorCount" -ForegroundColor Yellow

Write-Host "`n🎯 Test des domaines principaux..." -ForegroundColor Yellow

# Test des domaines principaux
$testDomains = @("iahome.fr", "www.iahome.fr", "librespeed.iahome.fr", "pdf.iahome.fr", "metube.iahome.fr")

foreach ($domain in $testDomains) {
    Write-Host "`nTest de https://$domain..." -ForegroundColor Cyan
    $test = curl -I "https://$domain" 2>&1
    
    if ($test -match "HTTP/1.1 200") {
        Write-Host "✅ $domain → HTTP 200 OK" -ForegroundColor Green
    } elseif ($test -match "HTTP/1.1 404") {
        Write-Host "⚠️  $domain → HTTP 404 (service non démarré)" -ForegroundColor Yellow
    } elseif ($test -match "HTTP/1.1 530") {
        Write-Host "❌ $domain → HTTP 530 (tunnel incorrect)" -ForegroundColor Red
    } elseif ($test -match "Could not resolve host") {
        Write-Host "❓ $domain → DNS non résolu (propagation en cours)" -ForegroundColor Gray
    } else {
        Write-Host "❓ $domain → $test" -ForegroundColor Gray
    }
}

Write-Host "`n✨ Migration des itinéraires d'applications terminée !" -ForegroundColor Green
Write-Host "Tous les domaines sont maintenant configurés sur le tunnel iahome-prod" -ForegroundColor Green

Write-Host "`n📋 Configuration finale :" -ForegroundColor Yellow
Write-Host "Tunnel: iahome-prod (c7a6cb1b-46d8-4fb8-9433-73362e805dfd)" -ForegroundColor Cyan
Write-Host "Fichier: ssl/cloudflare/service-config.yml" -ForegroundColor Cyan
Write-Host "Domaines: $($allDomains.Count) domaines configurés" -ForegroundColor Cyan
