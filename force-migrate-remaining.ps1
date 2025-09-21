#!/usr/bin/env pwsh

Write-Host "🔄 Migration forcée des domaines restants" -ForegroundColor Cyan

# Domaines qui ont encore des conflits
$remainingDomains = @(
    "www.iahome.fr",
    "librespeed.iahome.fr",
    "whisper.iahome.fr",
    "pdf.iahome.fr",
    "metube.iahome.fr",
    "psitransfer.iahome.fr",
    "stablediffusion.iahome.fr",
    "ruinedfooocus.iahome.fr",
    "sdnext.iahome.fr",
    "invoke.iahome.fr",
    "qrcodes.iahome.fr"
)

Write-Host "`n📋 Domaines à migrer de force : $($remainingDomains.Count)" -ForegroundColor Yellow

foreach ($domain in $remainingDomains) {
    Write-Host "`n🔧 Migration forcée de $domain..." -ForegroundColor Cyan
    
    # Essayer de supprimer l'ancienne route
    Write-Host "   Suppression de l'ancienne route..." -ForegroundColor Gray
    $deleteResult = .\cloudflared.exe tunnel route dns delete $domain 2>&1
    Write-Host "   Résultat suppression: $deleteResult" -ForegroundColor Gray
    
    # Attendre un peu
    Start-Sleep 2
    
    # Ajouter la nouvelle route
    Write-Host "   Ajout de la nouvelle route..." -ForegroundColor Gray
    $addResult = .\cloudflared.exe tunnel route dns iahome-prod $domain 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $domain migré avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $domain : $addResult" -ForegroundColor Red
    }
    
    Start-Sleep 3
}

Write-Host "`n🎯 Test des domaines migrés..." -ForegroundColor Yellow

# Test des domaines principaux
$testDomains = @("librespeed.iahome.fr", "pdf.iahome.fr", "metube.iahome.fr", "qrcodes.iahome.fr")

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

Write-Host "`n✨ Migration forcée terminée !" -ForegroundColor Green
