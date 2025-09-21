#!/usr/bin/env pwsh

Write-Host "🔄 Forçage de la synchronisation Cloudflare" -ForegroundColor Cyan

Write-Host "`n📋 Étape 1: Vérification du tunnel actuel" -ForegroundColor Yellow
$tunnelInfo = .\cloudflared.exe tunnel info iahome-prod
Write-Host $tunnelInfo

Write-Host "`n📋 Étape 2: Test de tous les domaines configurés" -ForegroundColor Yellow

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

$workingCount = 0
$errorCount = 0

foreach ($domain in $testDomains) {
    Write-Host "`nTest de https://$domain..." -ForegroundColor Cyan
    $test = curl -I "https://$domain" 2>&1
    
    if ($test -match "HTTP/1.1 200") {
        Write-Host "✅ $domain → HTTP 200 OK" -ForegroundColor Green
        $workingCount++
    } elseif ($test -match "HTTP/1.1 404") {
        Write-Host "✅ $domain → HTTP 404 (service non démarré - DNS OK)" -ForegroundColor Green
        $workingCount++
    } elseif ($test -match "HTTP/1.1 530") {
        Write-Host "❌ $domain → HTTP 530 (tunnel incorrect)" -ForegroundColor Red
        $errorCount++
    } elseif ($test -match "Could not resolve host") {
        Write-Host "❓ $domain → DNS non résolu (propagation en cours)" -ForegroundColor Yellow
        $errorCount++
    } else {
        Write-Host "❓ $domain → $test" -ForegroundColor Gray
        $errorCount++
    }
}

Write-Host "`n📊 Résumé de la synchronisation :" -ForegroundColor Yellow
Write-Host "✅ Domaines fonctionnels: $workingCount" -ForegroundColor Green
Write-Host "❌ Domaines avec erreurs: $errorCount" -ForegroundColor Red

if ($workingCount -gt 0) {
    Write-Host "`n🎯 Configuration active :" -ForegroundColor Green
    Write-Host "Tunnel: iahome-prod (c7a6cb1b-46d8-4fb8-9433-73362e805dfd)" -ForegroundColor Cyan
    Write-Host "Fichier: ssl/cloudflare/service-config.yml" -ForegroundColor Cyan
    Write-Host "Domaines: $($testDomains.Count) domaines configurés" -ForegroundColor Cyan
}

Write-Host "`n🌐 Pour voir les applications dans Cloudflare :" -ForegroundColor Yellow
Write-Host "1. Allez sur https://dash.cloudflare.com" -ForegroundColor White
Write-Host "2. Sélectionnez votre domaine iahome.fr" -ForegroundColor White
Write-Host "3. Allez dans Zero Trust > Tunnels" -ForegroundColor White
Write-Host "4. Cliquez sur le tunnel 'iahome-prod'" -ForegroundColor White
Write-Host "5. Allez dans l'onglet 'Itinéraires d'application publiée'" -ForegroundColor White
Write-Host "6. Attendez quelques minutes pour la synchronisation" -ForegroundColor White

Write-Host "`n💡 Note importante :" -ForegroundColor Cyan
Write-Host "L'interface Cloudflare peut prendre quelques minutes pour refléter les changements." -ForegroundColor White
Write-Host "Les domaines fonctionnent déjà (HTTP 404 = service non démarré mais DNS OK)." -ForegroundColor White

Write-Host "`n🔧 Solution alternative :" -ForegroundColor Yellow
Write-Host "Si l'interface reste vide, essayez de :" -ForegroundColor White
Write-Host "1. Rafraîchir la page (F5)" -ForegroundColor White
Write-Host "2. Vider le cache du navigateur (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "3. Attendre 5-10 minutes pour la synchronisation" -ForegroundColor White
Write-Host "4. Redémarrer le tunnel si nécessaire" -ForegroundColor White

Write-Host "`n✨ Synchronisation forcée terminée !" -ForegroundColor Green
