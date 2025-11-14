# Script simple pour configurer Cloudflare Tunnel au démarrage automatique
# Utilise le dossier de démarrage Windows (ne nécessite pas les droits administrateur)

Write-Host "🚀 Configuration du démarrage automatique de Cloudflare (Méthode simple)" -ForegroundColor Cyan
Write-Host "======================================================================`n" -ForegroundColor Cyan

# Chemins
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$cloudflaredExe = Join-Path $scriptDir "cloudflared.exe"
$configFile = Join-Path $scriptDir "cloudflare-active-config.yml"
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutName = "IAHome-Cloudflare-Tunnel.lnk"
$shortcutPath = Join-Path $startupFolder $shortcutName

# Vérifier que cloudflared.exe existe
if (-not (Test-Path $cloudflaredExe)) {
    Write-Host "❌ cloudflared.exe introuvable : $cloudflaredExe" -ForegroundColor Red
    Write-Host "💡 Assurez-vous que cloudflared.exe est dans le répertoire du projet." -ForegroundColor Gray
    exit 1
}

# Vérifier que le fichier de configuration existe
if (-not (Test-Path $configFile)) {
    Write-Host "❌ Fichier de configuration introuvable : $configFile" -ForegroundColor Red
    Write-Host "💡 Assurez-vous que cloudflare-active-config.yml existe." -ForegroundColor Gray
    exit 1
}

# Créer un script batch de démarrage
$batchScript = Join-Path $scriptDir "start-cloudflare-tunnel-batch.bat"
$batchContent = @"
@echo off
REM Script de démarrage automatique de Cloudflare Tunnel
REM Généré automatiquement par setup-cloudflare-autostart-simple.ps1

cd /d "$scriptDir"

REM Attendre que Windows soit complètement démarré
timeout /t 30 /nobreak >nul

REM Vérifier si cloudflared est déjà en cours d'exécution
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>NUL | find /I /N "cloudflared.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Cloudflared est déjà en cours d'exécution
    exit /b 0
)

REM Attendre que les services locaux soient prêts
timeout /t 10 /nobreak >nul

REM Démarrer cloudflared en arrière-plan
start "" /MIN "cloudflared.exe" tunnel --config "cloudflare-active-config.yml" run

REM Attendre un peu pour vérifier le démarrage
timeout /t 5 /nobreak >nul

REM Vérifier que le processus a démarré
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>NUL | find /I /N "cloudflared.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Cloudflared démarré avec succès
) else (
    echo Erreur: Cloudflared n'a pas démarré
)
"@

# Écrire le script batch
Set-Content -Path $batchScript -Value $batchContent -Encoding ASCII
Write-Host "✅ Script batch créé : $batchScript" -ForegroundColor Green

# Supprimer le raccourci existant s'il existe
if (Test-Path $shortcutPath) {
    Write-Host "`n1️⃣ Suppression du raccourci existant..." -ForegroundColor Yellow
    Remove-Item -Path $shortcutPath -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Raccourci existant supprimé" -ForegroundColor Green
}

# Créer le raccourci dans le dossier de démarrage
Write-Host "`n2️⃣ Création du raccourci dans le dossier de démarrage..." -ForegroundColor Yellow

try {
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $batchScript
    $shortcut.WorkingDirectory = $scriptDir
    $shortcut.Description = "Démarre automatiquement Cloudflare Tunnel au démarrage de Windows pour IAHome"
    $shortcut.WindowStyle = 7  # Minimized
    $shortcut.Save()
    
    Write-Host "   ✅ Raccourci créé avec succès!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors de la création du raccourci : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Vérifier que le raccourci existe
if (Test-Path $shortcutPath) {
    Write-Host "   ✅ Raccourci vérifié : $shortcutPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Le raccourci n'a pas été créé correctement" -ForegroundColor Red
    exit 1
}

# Afficher les informations
Write-Host "`n📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Raccourci créé : $shortcutPath" -ForegroundColor Green
Write-Host "   ✅ Script batch : $batchScript" -ForegroundColor Green
Write-Host "   ✅ Fichier de configuration : $configFile" -ForegroundColor Green
Write-Host "   ✅ Dossier de démarrage : $startupFolder" -ForegroundColor Green
Write-Host "`n💡 Cloudflare démarrera automatiquement au prochain démarrage de Windows." -ForegroundColor Yellow
Write-Host "💡 Le script attendra 30 secondes après le démarrage pour s'assurer que Windows est prêt." -ForegroundColor Gray
Write-Host "`n💡 Pour désactiver le démarrage automatique :" -ForegroundColor Gray
Write-Host "   Remove-Item `"$shortcutPath`" -Force" -ForegroundColor Gray
Write-Host "   Ou exécutez : .\remove-cloudflare-autostart-simple.ps1" -ForegroundColor Gray
Write-Host ""

# Proposer de tester maintenant
$testNow = Read-Host "Voulez-vous tester le démarrage maintenant ? (O/N)"
if ($testNow -eq "O" -or $testNow -eq "o") {
    Write-Host "`n🧪 Test du démarrage..." -ForegroundColor Cyan
    Write-Host "   🚀 Exécution du script batch..." -ForegroundColor Gray
    Start-Process -FilePath $batchScript -WindowStyle Minimized
    
    Start-Sleep -Seconds 10
    
    $process = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "   ✅ Cloudflared est en cours d'exécution (PID: $($process.Id))" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Cloudflared ne semble pas avoir démarré. Vérifiez les processus manuellement." -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""


