# Script pour installer et configurer Python 3.10.6 pour Automatic1111
Write-Host "🐍 Installation et configuration de Python 3.10.6 pour Automatic1111" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$automatic1111Dir = Join-Path $scriptDir "automatic1111"
$venvDir = Join-Path $automatic1111Dir "venv"

# Vérifier si Python 3.10 est déjà installé
Write-Host "`n1. Vérification de Python 3.10..." -ForegroundColor Yellow
$python310Available = $false
$python310Path = $null

# Vérifier via py launcher
try {
    $py310Output = py -3.10 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $python310Available = $true
        $python310FullPath = py -3.10 -c "import sys; print(sys.executable)" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $python310Path = $python310FullPath.Trim()
            Write-Host "   ✅ Python 3.10 trouvé: $python310Path" -ForegroundColor Green
        }
    }
} catch {
    # py launcher non disponible
}

# Vérifier dans le PATH
if (-not $python310Available) {
    try {
        $python310Cmd = Get-Command python3.10 -ErrorAction SilentlyContinue
        if ($python310Cmd) {
            $python310Version = python3.10 --version 2>&1
            if ($python310Version -match "3\.10") {
                $python310Available = $true
                $python310Path = $python310Cmd.Source
                Write-Host "   ✅ Python 3.10 trouvé dans PATH: $python310Path" -ForegroundColor Green
            }
        }
    } catch {
        # Python 3.10 non dans PATH
    }
}

if ($python310Available) {
    Write-Host "`n✅ Python 3.10 est déjà installé!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Python 3.10 n'est pas installé" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Téléchargement de Python 3.10.6..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Instructions:" -ForegroundColor Cyan
    Write-Host "1. Le téléchargement va s'ouvrir dans votre navigateur" -ForegroundColor White
    Write-Host "2. Téléchargez 'Windows installer (64-bit)'" -ForegroundColor White
    Write-Host "3. ⚠️  IMPORTANT: Cochez 'Add Python to PATH' lors de l'installation" -ForegroundColor Yellow
    Write-Host "4. Installez Python 3.10.6" -ForegroundColor White
    Write-Host "5. Relancez ce script après l'installation" -ForegroundColor White
    Write-Host ""
    
    $downloadUrl = "https://www.python.org/downloads/release/python-3106/"
    Write-Host "URL de téléchargement: $downloadUrl" -ForegroundColor Cyan
    
    # Ouvrir le navigateur
    Start-Process $downloadUrl
    
    Write-Host ""
    $continue = Read-Host "Appuyez sur Entrée après avoir installé Python 3.10.6, ou 'q' pour quitter"
    if ($continue -eq 'q') {
        exit 0
    }
    
    # Vérifier à nouveau après l'installation
    Write-Host "`nVérification de l'installation..." -ForegroundColor Yellow
    try {
        $py310Output = py -3.10 --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            $python310Available = $true
            $python310FullPath = py -3.10 -c "import sys; print(sys.executable)" 2>&1
            if ($LASTEXITCODE -eq 0) {
                $python310Path = $python310FullPath.Trim()
                Write-Host "   ✅ Python 3.10 détecté: $python310Path" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "   ❌ Python 3.10 toujours introuvable" -ForegroundColor Red
        Write-Host "   Vérifiez que Python 3.10.6 est installé et dans le PATH" -ForegroundColor Yellow
        exit 1
    }
}

# Supprimer l'ancien venv créé avec Python 3.13
Write-Host "`n2. Nettoyage de l'environnement virtuel existant..." -ForegroundColor Yellow
if (Test-Path $venvDir) {
    Write-Host "   Suppression de l'ancien venv (créé avec Python 3.13)..." -ForegroundColor Yellow
    Remove-Item -Path $venvDir -Recurse -Force -ErrorAction SilentlyContinue
    if (-not (Test-Path $venvDir)) {
        Write-Host "   ✅ Ancien venv supprimé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Impossible de supprimer complètement le venv" -ForegroundColor Yellow
        Write-Host "   Vous pouvez le supprimer manuellement: $venvDir" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ℹ️  Aucun venv existant à supprimer" -ForegroundColor Cyan
}

# Configurer webui-user.bat pour utiliser Python 3.10
Write-Host "`n3. Configuration de webui-user.bat..." -ForegroundColor Yellow
$webuiUserBat = Join-Path $automatic1111Dir "webui-user.bat"
if (Test-Path $webuiUserBat) {
    $content = Get-Content $webuiUserBat -Raw
    if ($content -notmatch "^\s*set PYTHON=py -3\.10") {
        # Ajouter ou modifier la ligne PYTHON
        $newContent = $content -replace "(?m)^(\s*REM.*py launcher.*\r?\n)", "`$1set PYTHON=py -3.10`r`n"
        if ($newContent -eq $content) {
            # Si le remplacement n'a pas fonctionné, ajouter après @echo off
            $newContent = $content -replace "(@echo off)", "`$1`r`nset PYTHON=py -3.10"
        }
        $newContent | Set-Content $webuiUserBat
        Write-Host "   ✅ webui-user.bat configuré pour utiliser Python 3.10" -ForegroundColor Green
    } else {
        Write-Host "   ✅ webui-user.bat est déjà configuré" -ForegroundColor Green
    }
} else {
    Write-Host "   ⚠️  webui-user.bat introuvable" -ForegroundColor Yellow
}

Write-Host "`n✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Lancez: .\start-automatic1111.ps1" -ForegroundColor White
Write-Host "2. Le venv sera recréé avec Python 3.10.6" -ForegroundColor White
Write-Host "3. PyTorch et les dépendances seront installés automatiquement" -ForegroundColor White
Write-Host ""

$launch = Read-Host "Voulez-vous lancer Automatic1111 maintenant? (O/N)"
if ($launch -eq 'O' -or $launch -eq 'o' -or $launch -eq 'Y' -or $launch -eq 'y') {
    Write-Host "`nDémarrage d'Automatic1111..." -ForegroundColor Green
    & "$scriptDir\start-automatic1111.ps1"
}
