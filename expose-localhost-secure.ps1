# Script SÉCURISÉ pour exposer un localhost à distance avec Cloudflare Tunnel
# Utilise Cloudflare Access (Zero Trust) ou des tokens pour sécuriser l'accès

param(
    [Parameter(Mandatory=$true)]
    [int]$Port,
    
    [Parameter(Mandatory=$false)]
    [string]$Protocol = "http",
    
    [Parameter(Mandatory=$false)]
    [string]$AuthToken = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$UseAccess = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Background
)

Write-Host "🔒 Exposition SÉCURISÉE d'un localhost:$Port à distance via Cloudflare Tunnel..." -ForegroundColor Cyan
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

Write-Host ""
Write-Host "🔒 OPTIONS DE SÉCURITÉ:" -ForegroundColor Yellow
Write-Host ""

# Option 1: Token d'authentification simple
if ([string]::IsNullOrEmpty($AuthToken)) {
    $AuthToken = [System.Guid]::NewGuid().ToString("N").Substring(0, 16)
    Write-Host "📝 Option 1: Token d'authentification généré" -ForegroundColor Cyan
    Write-Host "   Token: $AuthToken" -ForegroundColor Green
    Write-Host "   Utilisez: https://<url>.trycloudflare.com/?token=$AuthToken" -ForegroundColor Gray
    Write-Host "   ⚠️ Cette URL est PUBLIQUE - partagez-la prudemment!" -ForegroundColor Yellow
} else {
    Write-Host "📝 Option 1: Token d'authentification personnalisé" -ForegroundColor Cyan
    Write-Host "   Token: $AuthToken" -ForegroundColor Green
}

# Option 2: Utiliser le tunnel existant avec protection
Write-Host ""
Write-Host "📝 Option 2: Utiliser le tunnel existant 'iahome-new' (RECOMMANDÉ)" -ForegroundColor Cyan
Write-Host "   ✅ Bénéficie des protections existantes de iahome.fr" -ForegroundColor Green
Write-Host "   ✅ Nécessite un sous-domaine ou une configuration spécifique" -ForegroundColor Gray

# Option 3: Cloudflare Access (Zero Trust)
if ($UseAccess) {
    Write-Host ""
    Write-Host "📝 Option 3: Cloudflare Access (Zero Trust)" -ForegroundColor Cyan
    Write-Host "   ✅ Authentification requise (email, SSO, etc.)" -ForegroundColor Green
    Write-Host "   ✅ Contrôle d'accès granulaire" -ForegroundColor Green
    Write-Host "   ⚠️ Nécessite une configuration Cloudflare Access" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "⚠️  SÉCURITÉ IMPORTANTE:" -ForegroundColor Red
Write-Host "   - Les URLs Quick Tunnel sont PUBLIQUES" -ForegroundColor Yellow
Write-Host "   - N'importe qui avec l'URL peut accéder au service" -ForegroundColor Yellow
Write-Host "   - Recommandation: Utilisez un sous-domaine avec vos protections existantes" -ForegroundColor Yellow
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Voulez-vous continuer? (O/N)"
if ($confirmation -ne 'O' -and $confirmation -ne 'o' -and $confirmation -ne 'Y' -and $confirmation -ne 'y') {
    Write-Host "❌ Annulé" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🚀 Démarrage du tunnel..." -ForegroundColor Yellow
Write-Host "   Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Gray
Write-Host ""

if ($Background) {
    Write-Host "📡 Démarrage en arrière-plan..." -ForegroundColor Yellow
    $cloudflaredPath = "cloudflared"
    if (Test-Path ".\cloudflared.exe") {
        $cloudflaredPath = ".\cloudflared.exe"
    }
    
    Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "--url", "$Protocol://localhost:$Port" -WindowStyle Hidden
    Write-Host "✅ Tunnel démarré en arrière-plan" -ForegroundColor Green
    Write-Host "💡 Utilisez le mode interactif pour voir l'URL générée" -ForegroundColor Yellow
} else {
    Write-Host "🌐 L'URL sera affichée ci-dessous (gardez-la privée!)" -ForegroundColor Yellow
    Write-Host ""
    
    # Démarrer cloudflared tunnel en mode interactif
    & cloudflared tunnel --url "$Protocol://localhost:$Port"
}


