# Script pour démarrer StableDiffusion via Stability Matrix
Write-Host "🚀 Démarrage de StableDiffusion" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Stability Matrix est installé
$stabilityMatrixPath = Join-Path $env:USERPROFILE "Documents\StabilityMatrix-win-x64\StabilityMatrix.exe"
$stabilityMatrixPath = Resolve-Path $stabilityMatrixPath -ErrorAction SilentlyContinue

if (-not $stabilityMatrixPath) {
    Write-Host "❌ Erreur: Impossible de trouver StabilityMatrix.exe" -ForegroundColor Red
    Write-Host "   Chemin recherché: $env:USERPROFILE\Documents\StabilityMatrix-win-x64\StabilityMatrix.exe" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Veuillez installer Stability Matrix d'abord" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Stability Matrix trouvé: $stabilityMatrixPath" -ForegroundColor Green
Write-Host ""

# Vérifier si Stability Matrix est déjà en cours d'exécution
$stabilityMatrixProcess = Get-Process -Name "StabilityMatrix" -ErrorAction SilentlyContinue

if ($stabilityMatrixProcess) {
    Write-Host "⚠️  Stability Matrix est déjà en cours d'exécution" -ForegroundColor Yellow
    Write-Host "   StableDiffusion devrait être accessible via Stability Matrix" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🌐 Accès à StableDiffusion:" -ForegroundColor Green
    Write-Host "   URL locale: http://localhost:7860" -ForegroundColor Cyan
    Write-Host "   URL production: https://stablediffusion.iahome.fr" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

# Démarrer Stability Matrix
Write-Host "🔄 Démarrage de Stability Matrix..." -ForegroundColor Yellow
try {
    $stabilityMatrixDir = Split-Path $stabilityMatrixPath
    Start-Process -FilePath $stabilityMatrixPath -WorkingDirectory $stabilityMatrixDir -WindowStyle Normal
    
    Write-Host "✅ Stability Matrix démarré" -ForegroundColor Green
    Write-Host ""
    Write-Host "⏳ Attente du démarrage de StableDiffusion..." -ForegroundColor Yellow
    Write-Host "   (StableDiffusion sera lancé automatiquement via Stability Matrix)" -ForegroundColor Gray
    
    # Attendre que le service soit prêt
    Start-Sleep -Seconds 15
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "   StableDiffusion démarré !" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Accès à StableDiffusion:" -ForegroundColor Green
    Write-Host "   URL locale: http://localhost:7860" -ForegroundColor Cyan
    Write-Host "   URL production: https://stablediffusion.iahome.fr" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Note: StableDiffusion est géré via Stability Matrix" -ForegroundColor Yellow
    Write-Host "   Vous pouvez le lancer/démarrer depuis l'interface Stability Matrix" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Erreur lors du démarrage de Stability Matrix: $_" -ForegroundColor Red
    exit 1
}

