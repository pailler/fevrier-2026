# Script pour démarrer Cloudflare Tunnel directement (sans service Windows)
# Utilise cloudflared tunnel run avec le token directement

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Démarrage Cloudflare Tunnel (Mode Direct)           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
$token = "eyJhIjoiOWJhNDI5NGFhNzg3ZTY3YzMzNWM3MTg3NmMxMGFmMjEiLCJ0IjoiMDJhOTYwYzUtZWRkNi00YjNmLTg0NGYtNDEwYjE2MjQ3MjYyIiwicyI6InNuNXBuSm5qUnVTaXF5TVdRNXJWdGlZQXFqbkh2Z05sY1U4dWloV2tWMFE9In0="

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "`n❌ cloudflared.exe non trouvé à : $cloudflaredPath" -ForegroundColor Red
    pause
    exit 1
}

# Arrêter les processus existants
Write-Host "`n1️⃣ Arrêt des processus cloudflared existants..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Aucun processus à arrêter" -ForegroundColor Cyan
}

# Démarrer cloudflared directement avec le token
Write-Host "`n2️⃣ Démarrage de Cloudflare Tunnel avec le token..." -ForegroundColor Yellow
Write-Host "   Token : $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray
Write-Host "   Mode : Direct (sans service Windows)" -ForegroundColor Gray
Write-Host ""

try {
    # Démarrer cloudflared en arrière-plan
    $process = Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "run", "--token", $token -WindowStyle Hidden -PassThru -ErrorAction Stop
    
    Start-Sleep -Seconds 5
    
    # Vérifier que le processus fonctionne
    $checkProcess = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
    if ($checkProcess) {
        Write-Host "   ✅ Cloudflare Tunnel démarré (PID: $($process.Id))" -ForegroundColor Green
        Write-Host "   ✅ Processus en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Le processus a démarré mais s'est arrêté" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur lors du démarrage : $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "`n3️⃣ Vérification..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$processes = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "   ✅ Processus actif(s) : $($processes.Count)" -ForegroundColor Green
    $processes | Format-Table Id, ProcessName, StartTime -AutoSize
} else {
    Write-Host "   ⚠️  Aucun processus trouvé" -ForegroundColor Yellow
}

Write-Host "`n✅ Cloudflare Tunnel démarré en mode direct !" -ForegroundColor Green
Write-Host "`n📋 Notes importantes :" -ForegroundColor Cyan
Write-Host "   ⚠️  Ce mode nécessite que PowerShell reste ouvert" -ForegroundColor Yellow
Write-Host "   ⚠️  Pour un démarrage automatique, utilisez le service Windows" -ForegroundColor Yellow
Write-Host "   ✅ Avantage : Pas besoin de nettoyer le registre" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Pour arrêter : Fermez cette fenêtre ou arrêtez le processus" -ForegroundColor Gray
Write-Host "💡 Pour démarrer automatiquement : Utilisez le service Windows" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer cette fenêtre (le tunnel continuera de fonctionner)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")






















