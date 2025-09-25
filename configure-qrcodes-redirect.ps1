# Script PowerShell pour configurer la redirection QR codes
# Chaque utilisateur aura sa propre session QR codes

Write-Host "🔧 Configuration de la redirection QR codes..." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

# Vérifier si cloudflared est disponible
if (!(Test-Path ".\cloudflared.exe")) {
    Write-Host "❌ cloudflared.exe non trouvé !" -ForegroundColor Red
    Write-Host "💡 Assurez-vous d'être dans le bon répertoire." -ForegroundColor Gray
    exit 1
}

Write-Host "✅ cloudflared.exe trouvé" -ForegroundColor Green

# Vérifier les tunnels existants
Write-Host "🔍 Vérification des tunnels existants..." -ForegroundColor Cyan
$tunnels = .\cloudflared.exe tunnel list
Write-Host $tunnels

# Instructions pour la configuration manuelle
Write-Host ""
Write-Host "📋 Instructions de configuration :" -ForegroundColor Green
Write-Host "1. Connectez-vous à Cloudflare Dashboard" -ForegroundColor White
Write-Host "2. Allez dans Zero Trust > Access > Tunnels" -ForegroundColor White
Write-Host "3. Sélectionnez le tunnel 'iahome-new'" -ForegroundColor White
Write-Host "4. Modifiez la configuration d'ingress :" -ForegroundColor White
Write-Host ""
Write-Host "   Hostname: qrcodes.iahome.fr" -ForegroundColor Yellow
Write-Host "   Service: http://192.168.1.150:3000/qrcodes-redirect" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Sauvegardez la configuration" -ForegroundColor White
Write-Host "6. Redémarrez le tunnel si nécessaire" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Résultat attendu :" -ForegroundColor Green
Write-Host "- Chaque utilisateur aura sa propre session QR codes" -ForegroundColor White
Write-Host "- Les sessions sont gérées automatiquement" -ForegroundColor White
Write-Host "- Accès sécurisé via https://qrcodes.iahome.fr" -ForegroundColor White

Write-Host ""
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
