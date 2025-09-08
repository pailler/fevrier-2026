# Script de configuration du tunnel Cloudflared pour IAHome
# Compatible Windows PowerShell

Write-Host "🚀 Configuration du tunnel Cloudflared pour IAHome..." -ForegroundColor Green

# Vérifier que cloudflared est installé
Write-Host "📦 Vérification de cloudflared..." -ForegroundColor Yellow
try {
    $cloudflaredVersion = cloudflared --version
    Write-Host "✅ Cloudflared installé: $cloudflaredVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Cloudflared n'est pas installé. Veuillez l'installer depuis: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" -ForegroundColor Red
    exit 1
}

# Vérifier la connexion à Cloudflare
Write-Host "🔐 Vérification de la connexion Cloudflare..." -ForegroundColor Yellow
try {
    cloudflared tunnel login
    Write-Host "✅ Connexion Cloudflare établie" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la connexion Cloudflare" -ForegroundColor Red
    exit 1
}

# Créer le tunnel
Write-Host "🔨 Création du tunnel iahome-tunnel..." -ForegroundColor Yellow
try {
    cloudflared tunnel create iahome-tunnel
    Write-Host "✅ Tunnel créé avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la création du tunnel" -ForegroundColor Red
    exit 1
}

# Configurer les routes DNS
Write-Host "🌐 Configuration des routes DNS..." -ForegroundColor Yellow

$domains = @("librespeed.iahome.fr", "iahome.fr", "www.iahome.fr")

foreach ($domain in $domains) {
    Write-Host "📡 Configuration de $domain..." -ForegroundColor Cyan
    try {
        cloudflared tunnel route dns iahome-tunnel $domain
        Write-Host "✅ $domain configuré" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de la configuration de $domain" -ForegroundColor Red
    }
}

# Afficher la configuration du tunnel
Write-Host "📋 Configuration du tunnel:" -ForegroundColor Yellow
cloudflared tunnel list

Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host "🌐 Votre tunnel est maintenant configuré pour:" -ForegroundColor Cyan
Write-Host "   - https://librespeed.iahome.fr" -ForegroundColor Cyan
Write-Host "   - https://iahome.fr" -ForegroundColor Cyan
Write-Host "   - https://www.iahome.fr" -ForegroundColor Cyan

Write-Host "🚀 Pour démarrer le tunnel en production:" -ForegroundColor Yellow
Write-Host "   cloudflared tunnel run iahome-tunnel" -ForegroundColor White








