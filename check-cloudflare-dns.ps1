#!/usr/bin/env pwsh

Write-Host "🔍 Vérification des enregistrements DNS dans Cloudflare" -ForegroundColor Cyan

Write-Host "`n📋 Test des domaines principaux..." -ForegroundColor Yellow

$testDomains = @(
    "iahome.fr",
    "www.iahome.fr", 
    "librespeed.iahome.fr",
    "pdf.iahome.fr",
    "metube.iahome.fr",
    "qrcodes.iahome.fr",
    "whisper.iahome.fr",
    "whisper-audio.iahome.fr",
    "whisper-video.iahome.fr",
    "whisper-ocr.iahome.fr",
    "psitransfer.iahome.fr",
    "stablediffusion.iahome.fr",
    "ruinedfooocus.iahome.fr",
    "comfyui.iahome.fr",
    "sdnext.iahome.fr",
    "invoke.iahome.fr",
    "traefik.iahome.fr"
)

$workingDomains = @()
$errorDomains = @()

foreach ($domain in $testDomains) {
    Write-Host "`nTest de https://$domain..." -ForegroundColor Cyan
    $test = curl -I "https://$domain" 2>&1
    
    if ($test -match "HTTP/1.1 200") {
        Write-Host "✅ $domain → HTTP 200 OK" -ForegroundColor Green
        $workingDomains += $domain
    } elseif ($test -match "HTTP/1.1 404") {
        Write-Host "✅ $domain → HTTP 404 (service non démarré - DNS OK)" -ForegroundColor Green
        $workingDomains += $domain
    } elseif ($test -match "HTTP/1.1 530") {
        Write-Host "❌ $domain → HTTP 530 (tunnel incorrect)" -ForegroundColor Red
        $errorDomains += $domain
    } elseif ($test -match "Could not resolve host") {
        Write-Host "❓ $domain → DNS non résolu (propagation en cours)" -ForegroundColor Yellow
        $errorDomains += $domain
    } else {
        Write-Host "❓ $domain → $test" -ForegroundColor Gray
        $errorDomains += $domain
    }
}

Write-Host "`n📊 Résumé des tests :" -ForegroundColor Yellow
Write-Host "✅ Domaines fonctionnels: $($workingDomains.Count)" -ForegroundColor Green
Write-Host "❌ Domaines avec erreurs: $($errorDomains.Count)" -ForegroundColor Red

if ($workingDomains.Count -gt 0) {
    Write-Host "`n✅ Domaines fonctionnels :" -ForegroundColor Green
    foreach ($domain in $workingDomains) {
        Write-Host "   - $domain" -ForegroundColor Green
    }
}

if ($errorDomains.Count -gt 0) {
    Write-Host "`n❌ Domaines avec erreurs :" -ForegroundColor Red
    foreach ($domain in $errorDomains) {
        Write-Host "   - $domain" -ForegroundColor Red
    }
}

Write-Host "`n🌐 Pour vérifier dans l'interface Cloudflare :" -ForegroundColor Cyan
Write-Host "1. Allez sur https://dash.cloudflare.com" -ForegroundColor White
Write-Host "2. Sélectionnez votre domaine iahome.fr" -ForegroundColor White
Write-Host "3. Allez dans l'onglet 'DNS'" -ForegroundColor White
Write-Host "4. Vérifiez que tous les domaines pointent vers le tunnel iahome-prod" -ForegroundColor White

Write-Host "`n🔧 Tunnel actuel : iahome-prod (c7a6cb1b-46d8-4fb8-9433-73362e805dfd)" -ForegroundColor Cyan
Write-Host "Configuration : ssl/cloudflare/service-config.yml" -ForegroundColor Cyan
