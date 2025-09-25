# Script PowerShell pour mettre à jour la configuration Cloudflare QR codes
# Redirige vers la nouvelle page de redirection avec sessions utilisateur

Write-Host "🔧 Mise à jour de la configuration Cloudflare QR codes..." -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Yellow

# Vérifier si cloudflared est disponible
if (!(Test-Path ".\cloudflared.exe")) {
    Write-Host "❌ cloudflared.exe non trouvé !" -ForegroundColor Red
    Write-Host "💡 Assurez-vous d'être dans le bon répertoire." -ForegroundColor Gray
    exit 1
}

Write-Host "✅ cloudflared.exe trouvé" -ForegroundColor Green

# Instructions pour la mise à jour manuelle
Write-Host ""
Write-Host "📋 Instructions de mise à jour Cloudflare :" -ForegroundColor Green
Write-Host "1. Connectez-vous à Cloudflare Dashboard" -ForegroundColor White
Write-Host "2. Allez dans Zero Trust > Access > Tunnels" -ForegroundColor White
Write-Host "3. Sélectionnez le tunnel 'iahome-new'" -ForegroundColor White
Write-Host "4. Cliquez sur 'Configure' pour modifier la configuration" -ForegroundColor White
Write-Host "5. Modifiez la règle d'ingress pour qrcodes.iahome.fr :" -ForegroundColor White
Write-Host ""
Write-Host "   AVANT (actuel):" -ForegroundColor Red
Write-Host "   Hostname: qrcodes.iahome.fr" -ForegroundColor Red
Write-Host "   Service: http://192.168.1.150:7005" -ForegroundColor Red
Write-Host ""
Write-Host "   APRÈS (nouveau):" -ForegroundColor Green
Write-Host "   Hostname: qrcodes.iahome.fr" -ForegroundColor Green
Write-Host "   Service: http://192.168.1.150:3000/qrcodes-redirect" -ForegroundColor Green
Write-Host ""
Write-Host "6. Sauvegardez la configuration" -ForegroundColor White
Write-Host "7. Attendez 1-2 minutes pour la propagation" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Résultat attendu :" -ForegroundColor Green
Write-Host "- Chaque utilisateur aura sa propre session QR codes" -ForegroundColor White
Write-Host "- Redirection automatique vers l'interface avec session" -ForegroundColor White
Write-Host "- Gestion des QR codes dynamiques individuelle" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Vérification après mise à jour :" -ForegroundColor Cyan
Write-Host "Testez: https://qrcodes.iahome.fr" -ForegroundColor White
Write-Host "Vous devriez voir la page de redirection avec création de session" -ForegroundColor White

Write-Host ""
Write-Host "✅ Instructions terminées !" -ForegroundColor Green
Write-Host "💡 La configuration sera mise à jour dans Cloudflare Dashboard" -ForegroundColor Gray
