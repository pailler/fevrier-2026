#!/usr/bin/env pwsh

Write-Host "🔄 Migration des routes DNS vers le nouveau tunnel" -ForegroundColor Cyan

$domains = @(
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

Write-Host "`n📋 Configuration des routes DNS pour 17 domaines..." -ForegroundColor Yellow

foreach ($domain in $domains) {
    Write-Host "`n🔧 Configuration de $domain..." -ForegroundColor Cyan
    $result = .\cloudflared.exe tunnel route dns iahome-prod $domain 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $domain configuré avec succès" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $domain : $result" -ForegroundColor Yellow
    }
    
    Start-Sleep 1
}

Write-Host "`n🎯 Test des domaines principaux..." -ForegroundColor Yellow
Write-Host "Test de https://iahome.fr..." -ForegroundColor Cyan
$test1 = curl -I https://iahome.fr 2>&1
if ($test1 -match "HTTP/1.1 200") {
    Write-Host "✅ iahome.fr fonctionne" -ForegroundColor Green
} else {
    Write-Host "❌ iahome.fr : $test1" -ForegroundColor Red
}

Write-Host "`n✨ Migration terminée !" -ForegroundColor Green
Write-Host "Tous les domaines sont maintenant configurés sur le tunnel iahome-prod" -ForegroundColor Green
