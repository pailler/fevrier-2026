# Vérification rapide de l'état du tunnel Cloudflare
# Usage: .\quick-cloudflare-check.ps1

Write-Host "⚡ Vérification rapide du tunnel Cloudflare..." -ForegroundColor Cyan

# Vérifier les processus
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "✅ Tunnel actif (PID: $($processes[0].Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Tunnel inactif" -ForegroundColor Red
}

# Vérifier la configuration
if (Test-Path "cloudflare-complete-config.yml") {
    Write-Host "✅ Configuration trouvée" -ForegroundColor Green
} else {
    Write-Host "❌ Configuration manquante" -ForegroundColor Red
}

# Vérifier cloudflared.exe
if (Test-Path "cloudflared.exe") {
    Write-Host "✅ cloudflared.exe trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ cloudflared.exe manquant" -ForegroundColor Red
}

# Test de connectivité rapide
try {
    $response = Invoke-WebRequest -Uri "https://www.cloudflare.com" -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Connectivité Cloudflare OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Problème de connectivité" -ForegroundColor Red
}

# Test de l'application locale
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 3 -UseBasicParsing
    Write-Host "✅ Application locale (port 3000) OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Application locale inaccessible" -ForegroundColor Red
    Write-Host "💡 Démarrez l'app avec: npm run dev" -ForegroundColor Yellow
}

Write-Host "`n🔧 Pour corriger l'erreur 1033, exécutez:" -ForegroundColor Cyan
Write-Host "   .\fix-cloudflare-error-1033.ps1" -ForegroundColor White
