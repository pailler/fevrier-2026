# Script pour corriger les conflits DNS Cloudflared
# Ce script supprime les enregistrements A conflictuels et configure les routes tunnel

Write-Host "🔧 Correction des conflits DNS Cloudflared..." -ForegroundColor Green

# Vérifier la connexion cloudflared
Write-Host "🔐 Vérification de la connexion cloudflared..." -ForegroundColor Yellow
try {
    $tunnelList = cloudflared tunnel list
    Write-Host "✅ Connexion cloudflared OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur de connexion cloudflared" -ForegroundColor Red
    exit 1
}

# Afficher les instructions pour supprimer les enregistrements A conflictuels
Write-Host "`n📋 INSTRUCTIONS POUR CORRIGER LES CONFLITS DNS:" -ForegroundColor Cyan
Write-Host "`n1. Aller sur Cloudflare DNS: https://dash.cloudflare.com" -ForegroundColor White
Write-Host "2. Sélectionner le domaine iahome.fr" -ForegroundColor White
Write-Host "3. SUPPRIMER les enregistrements A suivants (ils seront remplacés par des CNAME):" -ForegroundColor Red
Write-Host "   - api.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Yellow
Write-Host "   - metube.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Yellow
Write-Host "   - pdf.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Yellow
Write-Host "   - psitransfer.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Yellow
Write-Host "   - qrcodes.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Yellow
Write-Host "   - stablediffusion.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Yellow
Write-Host "   - test.iahome.fr (A -> 90.90.226.59)" -ForegroundColor Yellow

Write-Host "`n4. GARDER les enregistrements suivants (ils sont corrects):" -ForegroundColor Green
Write-Host "   - iahome.fr (CNAME -> b19084f4-e2d6-47f5-81c3-0...)" -ForegroundColor Green
Write-Host "   - librespeed.iahome.fr (CNAME -> b19084f4-e2d6-47f5-81c3-0...)" -ForegroundColor Green
Write-Host "   - Tous les enregistrements MX, NS, TXT" -ForegroundColor Green

Write-Host "`n5. Une fois les enregistrements A supprimés, appuyez sur Entrée pour continuer..." -ForegroundColor Cyan
Read-Host

# Configurer les routes DNS pour le tunnel
Write-Host "`n🌐 Configuration des routes DNS pour le tunnel..." -ForegroundColor Yellow

$domains = @(
    "pdf.iahome.fr",
    "metube.iahome.fr", 
    "psitransfer.iahome.fr",
    "qrcodes.iahome.fr",
    "api.iahome.fr",
    "stablediffusion.iahome.fr",
    "test.iahome.fr"
)

foreach ($domain in $domains) {
    Write-Host "📡 Configuration de $domain..." -ForegroundColor Cyan
    try {
        cloudflared tunnel route dns iahome-tunnel $domain
        Write-Host "✅ $domain configuré" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de la configuration de $domain" -ForegroundColor Red
        Write-Host "   Vérifiez que l'enregistrement A a été supprimé dans Cloudflare" -ForegroundColor Yellow
    }
}

Write-Host "`n🚀 Démarrage du tunnel cloudflared..." -ForegroundColor Yellow
Write-Host "Configuration utilisée: cloudflared-config-fixed.yml" -ForegroundColor Gray

# Démarrer le tunnel en arrière-plan
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "cloudflared-config-fixed.yml", "run" -WindowStyle Hidden

Write-Host "`n✅ Configuration terminée !" -ForegroundColor Green
Write-Host "Le tunnel cloudflared est maintenant en cours d'exécution" -ForegroundColor Cyan
Write-Host "`nVérifiez l'accès aux services:" -ForegroundColor Yellow
Write-Host "- https://iahome.fr" -ForegroundColor White
Write-Host "- https://librespeed.iahome.fr" -ForegroundColor White
Write-Host "- https://pdf.iahome.fr" -ForegroundColor White
Write-Host "- https://metube.iahome.fr" -ForegroundColor White
Write-Host "- https://psitransfer.iahome.fr" -ForegroundColor White
Write-Host "- https://qrcodes.iahome.fr" -ForegroundColor White

Write-Host "`nPour arrêter le tunnel: Ctrl+C dans la fenêtre cloudflared" -ForegroundColor Gray
