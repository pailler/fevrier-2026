# Script PowerShell pour configurer QR codes sur le port 7012

Write-Host "🎯 Configuration QR codes sur le port 7012" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ Service QR codes dédié créé:" -ForegroundColor Green
Write-Host "• Port: 7012" -ForegroundColor Gray
Write-Host "• URL locale: http://localhost:7012" -ForegroundColor Gray
Write-Host "• Interface dédiée avec affichage utilisateur" -ForegroundColor Gray
Write-Host "• Pas de redirection vers la page d'accueil" -ForegroundColor Gray

Write-Host ""
Write-Host "📋 Configuration Cloudflare requise:" -ForegroundColor Cyan
Write-Host "1. Connectez-vous à Cloudflare Dashboard" -ForegroundColor White
Write-Host "2. Allez dans Zero Trust > Access > Tunnels" -ForegroundColor White
Write-Host "3. Sélectionnez le tunnel 'iahome-new'" -ForegroundColor White
Write-Host "4. Cliquez sur 'Configure' dans la section 'Public Hostname'" -ForegroundColor White
Write-Host "5. Modifiez l'entrée pour 'qrcodes.iahome.fr'" -ForegroundColor White
Write-Host "6. Changez le service de 'http://192.168.1.150:7005' vers 'http://192.168.1.150:7012'" -ForegroundColor White
Write-Host "7. Laissez le champ 'Chemin d'accès' VIDE" -ForegroundColor White
Write-Host "8. Sauvegardez les modifications" -ForegroundColor White
Write-Host "9. Attendez 1-2 minutes pour la propagation" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Avantages de cette configuration:" -ForegroundColor Green
Write-Host "• Service QR codes dédié (port 7012)" -ForegroundColor Gray
Write-Host "• Interface directe sans redirection" -ForegroundColor Gray
Write-Host "• Affichage utilisateur connecté intégré" -ForegroundColor Gray
Write-Host "• Pas de conflit avec l'application principale (port 3000)" -ForegroundColor Gray
Write-Host "• Service léger et optimisé" -ForegroundColor Gray

Write-Host ""
Write-Host "🔍 Test local:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:7012" -Method GET -TimeoutSec 5
    Write-Host "✅ Service local: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content-Length: $($response.Content.Length) caractères" -ForegroundColor Gray
} catch {
    Write-Host "❌ Service local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📊 Configuration actuelle Cloudflare:" -ForegroundColor Yellow
Write-Host "• qrcodes.iahome.fr → http://192.168.1.150:7005 (ancien service Python)" -ForegroundColor Gray
Write-Host "• Interface statique sans sessions" -ForegroundColor Gray

Write-Host ""
Write-Host "🎯 Configuration cible:" -ForegroundColor Green
Write-Host "• qrcodes.iahome.fr → http://192.168.1.150:7012 (nouveau service dédié)" -ForegroundColor Gray
Write-Host "• Interface moderne avec affichage utilisateur" -ForegroundColor Gray
Write-Host "• Service QR codes dédié et optimisé" -ForegroundColor Gray

Write-Host ""
Write-Host "✅ Après la configuration Cloudflare:" -ForegroundColor Green
Write-Host "• https://qrcodes.iahome.fr affichera directement l'interface QR codes" -ForegroundColor Gray
Write-Host "• Header avec 'Connecté en tant que: email@domain.com'" -ForegroundColor Gray
Write-Host "• Indicateur de session active" -ForegroundColor Gray
Write-Host "• Pas de redirection vers la page d'accueil" -ForegroundColor Gray

Write-Host ""
Write-Host "🚀 Configuration prête ! Mettez à jour Cloudflare maintenant." -ForegroundColor Green
