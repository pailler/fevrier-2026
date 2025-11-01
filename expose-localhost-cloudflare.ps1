# Script pour exposer un localhost à distance avec Cloudflare Tunnel (sans sous-domaine)
# Utilise cloudflared en mode "quick tunnel" qui génère une URL temporaire

param(
    [Parameter(Mandatory=$true)]
    [int]$Port,
    
    [Parameter(Mandatory=$false)]
    [string]$Protocol = "http",
    
    [Parameter(Mandatory=$false)]
    [switch]$Background
)

Write-Host "🌐 Exposition d'un localhost:$Port à distance via Cloudflare Tunnel..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si cloudflared est installé
try {
    $cloudflaredVersion = cloudflared --version 2>&1
    Write-Host "✅ Cloudflared détecté: $cloudflaredVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Cloudflared n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "💡 Installez cloudflared depuis: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le service local est accessible
Write-Host "🔍 Vérification que le service local est accessible sur $Protocol://localhost:$Port..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$Protocol://localhost:$Port" -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Service local accessible" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Service local non accessible: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Assurez-vous que le service écoute sur $Protocol://localhost:$Port" -ForegroundColor Yellow
}

# Méthode 1: Mode Quick Tunnel (URL temporaire générée automatiquement)
Write-Host ""
Write-Host "🚀 Méthode 1: Quick Tunnel (URL temporaire)" -ForegroundColor Cyan
Write-Host "   Cette méthode génère automatiquement une URL Cloudflare aléatoire" -ForegroundColor Gray
Write-Host "   Format: https://<random>.trycloudflare.com" -ForegroundColor Gray
Write-Host ""

if ($Background) {
    Write-Host "📡 Démarrage en arrière-plan..." -ForegroundColor Yellow
    $cloudflaredPath = "cloudflared"
    if (Test-Path ".\cloudflared.exe") {
        $cloudflaredPath = ".\cloudflared.exe"
    }
    
    Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "--url", "$Protocol://localhost:$Port" -WindowStyle Hidden
    Write-Host "✅ Tunnel démarré en arrière-plan" -ForegroundColor Green
    Write-Host "💡 Pour voir l'URL, vérifiez les logs ou utilisez la méthode interactive" -ForegroundColor Yellow
} else {
    Write-Host "🌐 Démarrage du tunnel (l'URL sera affichée ci-dessous)..." -ForegroundColor Yellow
    Write-Host "   Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Gray
    Write-Host ""
    
    # Démarrer cloudflared tunnel en mode interactif
    & cloudflared tunnel --url "$Protocol://localhost:$Port"
}

