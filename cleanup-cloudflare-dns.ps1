#!/usr/bin/env pwsh

Write-Host "🧹 Nettoyage des enregistrements DNS Cloudflare" -ForegroundColor Cyan

# Configuration
$zoneId = "YOUR_ZONE_ID"  # À remplacer par l'ID de zone Cloudflare
$apiToken = "YOUR_API_TOKEN"  # À remplacer par le token API Cloudflare

Write-Host "`n⚠️  ATTENTION: Ce script nécessite un token API Cloudflare" -ForegroundColor Yellow
Write-Host "1. Allez sur https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Cyan
Write-Host "2. Créez un token avec les permissions 'Zone:Edit' et 'DNS:Edit'" -ForegroundColor Cyan
Write-Host "3. Récupérez l'ID de zone depuis l'onglet 'Overview' de votre domaine" -ForegroundColor Cyan

Write-Host "`n📋 Étapes manuelles recommandées:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://dash.cloudflare.com" -ForegroundColor Cyan
Write-Host "2. Sélectionnez votre domaine 'iahome.fr'" -ForegroundColor Cyan
Write-Host "3. Allez dans l'onglet 'DNS'" -ForegroundColor Cyan
Write-Host "4. Supprimez tous les enregistrements CNAME pour:" -ForegroundColor Cyan
Write-Host "   - iahome.fr" -ForegroundColor Gray
Write-Host "   - www.iahome.fr" -ForegroundColor Gray
Write-Host "   - librespeed.iahome.fr" -ForegroundColor Gray
Write-Host "   - qrcodes.iahome.fr" -ForegroundColor Gray
Write-Host "5. Attendez 1-2 minutes pour la propagation DNS" -ForegroundColor Cyan

Write-Host "`n🔧 Commandes cloudflared pour reconfigurer:" -ForegroundColor Yellow
Write-Host ".\cloudflared.exe tunnel route dns iahome-prod iahome.fr" -ForegroundColor Gray
Write-Host ".\cloudflared.exe tunnel route dns iahome-prod www.iahome.fr" -ForegroundColor Gray

Write-Host "`n✨ Une fois les DNS nettoyés, relancez cloudflared" -ForegroundColor Green
