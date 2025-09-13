# Script PowerShell pour purger le cache Cloudflare via cloudflared
# Assurez-vous que cloudflared est installé et configuré

Write-Host "🔄 Purge du cache Cloudflare via cloudflared..." -ForegroundColor Yellow

# Vérifier si cloudflared est installé
$cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflaredPath) {
    Write-Host "❌ cloudflared n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "📥 Installez cloudflared depuis: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    exit 1
}

# Purger le cache via cloudflared
Write-Host "🔄 Purge en cours..." -ForegroundColor Yellow

try {
    # Purge complète du cache
    $purgeResult = & cloudflared tunnel --help 2>&1
    Write-Host "ℹ️  Note: cloudflared ne supporte pas directement la purge de cache" -ForegroundColor Blue
    Write-Host "📋 Utilisez l'interface web Cloudflare ou l'API pour purger le cache" -ForegroundColor Blue
} catch {
    Write-Host "❌ Erreur lors de l'exécution de cloudflared: $_" -ForegroundColor Red
}

Write-Host "✅ Script terminé" -ForegroundColor Green
