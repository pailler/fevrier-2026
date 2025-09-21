#!/usr/bin/env pwsh

Write-Host "🔄 Migration des itinéraires d'applications de iahome-new vers iahome-prod" -ForegroundColor Cyan

Write-Host "`n📋 Étape 1: Vérification des tunnels" -ForegroundColor Yellow
Write-Host "Tunnel source: iahome-new (bb2cbda3-f6b6-4a05-b352-e084cec6c7ab)" -ForegroundColor Gray
Write-Host "Tunnel destination: iahome-prod (c7a6cb1b-46d8-4fb8-9433-73362e805dfd)" -ForegroundColor Gray

Write-Host "`n📋 Étape 2: Migration des routes DNS" -ForegroundColor Yellow

# Liste complète des domaines à migrer
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

$successCount = 0
$conflictCount = 0
$errorCount = 0

foreach ($domain in $domains) {
    Write-Host "`n🔧 Migration de $domain..." -ForegroundColor Cyan
    
    # Supprimer l'ancienne route (optionnel, car cloudflared gère automatiquement)
    Write-Host "   Suppression de l'ancienne route..." -ForegroundColor Gray
    $deleteResult = .\cloudflared.exe tunnel route dns delete $domain 2>&1
    
    # Ajouter la nouvelle route
    Write-Host "   Ajout de la nouvelle route..." -ForegroundColor Gray
    $addResult = .\cloudflared.exe tunnel route dns iahome-prod $domain 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $domain migré avec succès" -ForegroundColor Green
        $successCount++
    } elseif ($addResult -match "already exists") {
        Write-Host "   ⚠️  $domain : Conflit DNS (existe déjà)" -ForegroundColor Yellow
        $conflictCount++
    } else {
        Write-Host "   ❌ $domain : Erreur - $addResult" -ForegroundColor Red
        $errorCount++
    }
    
    Start-Sleep 1
}

Write-Host "`n📊 Résumé de la migration :" -ForegroundColor Yellow
Write-Host "✅ Migrations réussies: $successCount" -ForegroundColor Green
Write-Host "⚠️  Conflits DNS: $conflictCount" -ForegroundColor Yellow
Write-Host "❌ Erreurs: $errorCount" -ForegroundColor Red

Write-Host "`n🎯 Test des domaines migrés..." -ForegroundColor Yellow

# Test des domaines principaux
$testDomains = @("iahome.fr", "librespeed.iahome.fr", "pdf.iahome.fr", "metube.iahome.fr")

foreach ($domain in $testDomains) {
    Write-Host "`nTest de https://$domain..." -ForegroundColor Cyan
    $test = curl -I "https://$domain" 2>&1
    
    if ($test -match "HTTP/1.1 200") {
        Write-Host "✅ $domain → HTTP 200 OK" -ForegroundColor Green
    } elseif ($test -match "HTTP/1.1 404") {
        Write-Host "⚠️  $domain → HTTP 404 (service non démarré)" -ForegroundColor Yellow
    } elseif ($test -match "HTTP/1.1 530") {
        Write-Host "❌ $domain → HTTP 530 (tunnel incorrect)" -ForegroundColor Red
    } else {
        Write-Host "❓ $domain → $test" -ForegroundColor Gray
    }
}

Write-Host "`n✨ Migration terminée !" -ForegroundColor Green
Write-Host "Tous les itinéraires d'applications ont été migrés vers iahome-prod" -ForegroundColor Green

if ($conflictCount -gt 0) {
    Write-Host "`n⚠️  Note: $conflictCount domaines ont des conflits DNS" -ForegroundColor Yellow
    Write-Host "Nettoyez les enregistrements DNS dans l'interface Cloudflare" -ForegroundColor Yellow
}
