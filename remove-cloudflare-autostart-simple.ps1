# Script pour supprimer le démarrage automatique de Cloudflare Tunnel (méthode simple)

Write-Host "🗑️  Suppression du démarrage automatique de Cloudflare" -ForegroundColor Cyan
Write-Host "====================================================`n" -ForegroundColor Cyan

# Chemins
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutName = "IAHome-Cloudflare-Tunnel.lnk"
$shortcutPath = Join-Path $startupFolder $shortcutName
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$batchScript = Join-Path $scriptDir "start-cloudflare-tunnel-batch.bat"

# Vérifier si le raccourci existe
Write-Host "1️⃣ Vérification du raccourci..." -ForegroundColor Yellow
if (Test-Path $shortcutPath) {
    Write-Host "   ✅ Raccourci trouvé : $shortcutPath" -ForegroundColor Green
    Write-Host "   🗑️  Suppression du raccourci..." -ForegroundColor Gray
    
    try {
        Remove-Item -Path $shortcutPath -Force -ErrorAction Stop
        Write-Host "   ✅ Raccourci supprimé avec succès!" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erreur lors de la suppression : $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ℹ️  Aucun raccourci trouvé : $shortcutPath" -ForegroundColor Gray
}

# Supprimer le script batch (optionnel)
if (Test-Path $batchScript) {
    Write-Host "`n2️⃣ Suppression du script batch..." -ForegroundColor Yellow
    $removeScript = Read-Host "   Voulez-vous supprimer le script batch ? (O/N)"
    if ($removeScript -eq "O" -or $removeScript -eq "o") {
        Remove-Item -Path $batchScript -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Script batch supprimé" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Script batch conservé : $batchScript" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Suppression terminée!" -ForegroundColor Green
Write-Host "💡 Cloudflare ne démarrera plus automatiquement au démarrage de Windows." -ForegroundColor Yellow
Write-Host ""


