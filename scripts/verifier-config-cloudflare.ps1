# Script pour vérifier la configuration Cloudflare Tunnel réellement utilisée

. (Join-Path $PSScriptRoot "port-utils.ps1")

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  VÉRIFICATION CONFIGURATION CLOUDFLARE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Vérifier le fichier de configuration local
Write-Host "[1/3] Vérification du fichier local..." -ForegroundColor Yellow
$configPath = Join-Path $PSScriptRoot "..\cloudflare-active-config.yml"
if (Test-Path $configPath) {
    Write-Host "   ✅ Fichier trouvé : $configPath" -ForegroundColor Green
    $config = Get-Content $configPath -Raw
    
    # Vérifier iahome.fr
    if ($config -match "iahome\.fr" -and $config -match "127\.0\.0\.1:3000") {
        Write-Host "   ✅ iahome.fr → http://127.0.0.1:3000" -ForegroundColor Green
    } else {
        Write-Host "   ❌ iahome.fr non configuré correctement" -ForegroundColor Red
    }
    
# Vérifier reveil-intelligent
    if ($config -match "reveil-intelligent\.iahome\.fr" -and $config -match "localhost:7891") {
        Write-Host "   ✅ reveil-intelligent.iahome.fr → http://localhost:7891" -ForegroundColor Green
    } else {
        Write-Host "   ❌ reveil-intelligent.iahome.fr non configuré correctement" -ForegroundColor Red
    }
    
    # Vérifier vote (référence essentiels)
    if ($config -match "vote\.iahome\.fr" -and $config -match "localhost:7890") {
        Write-Host "   ✅ vote.iahome.fr → http://localhost:7890" -ForegroundColor Green
    } else {
        Write-Host "   ❌ vote.iahome.fr non configuré correctement" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Fichier non trouvé" -ForegroundColor Red
}

Write-Host ""

# Vérifier Cloudflare Tunnel
Write-Host "[2/3] Vérification de Cloudflare Tunnel..." -ForegroundColor Yellow
$cloudflared = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflared) {
    Write-Host "   ✅ Cloudflare Tunnel actif (PID: $($cloudflared.Id))" -ForegroundColor Green
    
    # Essayer de voir quelle config est utilisée
    Write-Host "   ⚠️  Cloudflare Tunnel peut utiliser :" -ForegroundColor Yellow
    Write-Host "      • Configuration du dashboard Cloudflare Zero Trust (prioritaire)" -ForegroundColor Gray
    Write-Host "      • Fichier local cloudflare-active-config.yml" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Cloudflare Tunnel non actif" -ForegroundColor Red
}

Write-Host ""

# Vérifier les services locaux
Write-Host "[3/3] Vérification des services locaux..." -ForegroundColor Yellow
$port3000 = Test-PortInUse -Port 3000
$port5000 = Test-PortInUse -Port 5000

if ($port3000) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ Port 3000 (iahome.fr) : Actif (HTTP $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Port 3000 : Ne répond pas" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Port 3000 : Non actif" -ForegroundColor Red
}

if ($port5000) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ Port 5000 (resas.regispailler.fr) : Actif (HTTP $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Port 5000 : Ne répond pas" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Port 5000 : Non actif" -ForegroundColor Red
}

$port7891 = Test-PortInUse -Port 7891
if ($port7891) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:7891" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ Port 7891 (reveil-intelligent) : Actif (HTTP $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Port 7891 : Ne répond pas" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Port 7891 : Non actif" -ForegroundColor Red
}

try {
    $reveilPublic = Invoke-WebRequest -Uri "https://reveil-intelligent.iahome.fr/" -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ https://reveil-intelligent.iahome.fr → HTTP $($reveilPublic.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ https://reveil-intelligent.iahome.fr → 502 (route tunnel manquante ou incorrecte)" -ForegroundColor Red
    Write-Host "      Lancez en admin : .\scripts\sync-reveil-cloudflare-tunnel.ps1" -ForegroundColor Yellow
}

Write-Host ""

# Résumé et instructions
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  RÉSUMÉ" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  PROBLÈME IDENTIFIÉ :" -ForegroundColor Red
Write-Host "   Si les domaines pointent toujours vers les mauvais services," -ForegroundColor Yellow
Write-Host "   c'est que Cloudflare Tunnel utilise la configuration du dashboard." -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 SOLUTION :" -ForegroundColor Cyan
Write-Host "   1. Ouvrez https://one.dash.cloudflare.com/" -ForegroundColor White
Write-Host "   2. Networks > Tunnels > Sélectionnez votre tunnel" -ForegroundColor White
Write-Host "   3. Configure > Public Hostnames" -ForegroundColor White
Write-Host "   4. Vérifiez et corrigez :" -ForegroundColor White
Write-Host "      • iahome.fr → http://127.0.0.1:3000" -ForegroundColor Gray
Write-Host "      • resas.regispailler.fr → http://127.0.0.1:5000" -ForegroundColor Gray
Write-Host "   5. Supprimez toute route incorrecte" -ForegroundColor White
Write-Host "   6. Sauvegardez" -ForegroundColor White
Write-Host ""
Write-Host "💡 Le fichier local est correct, mais Cloudflare Tunnel" -ForegroundColor Yellow
Write-Host "   priorise toujours la configuration du dashboard." -ForegroundColor Yellow
Write-Host ""







