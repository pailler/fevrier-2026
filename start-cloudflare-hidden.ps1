# Script pour démarrer Cloudflare Tunnel en arrière-plan (sans fenêtre)
# Sans installer comme service Windows

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Chemins possibles pour cloudflared.exe
$cloudflaredPaths = @(
    "cloudflared.exe",
    "C:\Program Files (x86)\cloudflared\cloudflared.exe",
    "C:\Program Files\cloudflared\cloudflared.exe"
)

$cloudflaredPath = $null
foreach ($path in $cloudflaredPaths) {
    if (Test-Path $path) {
        $cloudflaredPath = (Resolve-Path $path).Path
        break
    }
}

if (-not $cloudflaredPath) {
    Write-Host "❌ cloudflared.exe introuvable" -ForegroundColor Red
    exit 1
}

# Fichier de configuration
$configFile = Join-Path $scriptDir "cloudflare-active-config.yml"
if (-not (Test-Path $configFile)) {
    Write-Host "❌ Fichier de configuration introuvable: $configFile" -ForegroundColor Red
    exit 1
}

$configFullPath = (Resolve-Path $configFile).Path

Write-Host "🔧 Démarrage de Cloudflare Tunnel en arrière-plan..." -ForegroundColor Cyan

# Arrêter les processus existants
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# Démarrer cloudflared en arrière-plan (sans fenêtre)
Write-Host "🚀 Démarrage du tunnel..." -ForegroundColor Yellow

$process = Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "--config", "`"$configFullPath`"", "run" -WindowStyle Hidden -PassThru -ErrorAction Stop

if ($process) {
    Write-Host "✅ Cloudflare Tunnel démarré (PID: $($process.Id))" -ForegroundColor Green
    Write-Host "   Configuration : $configFullPath" -ForegroundColor Gray
    Write-Host "   Processus en arrière-plan (pas de fenêtre visible)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Pour arrêter : Stop-Process -Id $($process.Id) -Force" -ForegroundColor Cyan
    Write-Host "💡 Pour vérifier : Get-Process -Name cloudflared" -ForegroundColor Cyan
} else {
    Write-Host "❌ Échec du démarrage" -ForegroundColor Red
    exit 1
}





