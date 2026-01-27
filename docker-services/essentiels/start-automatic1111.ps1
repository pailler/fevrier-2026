# Script pour démarrer Automatic1111 (Stable Diffusion WebUI)
Write-Host "Démarrage de Automatic1111..." -ForegroundColor Green

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$automatic1111Dir = Join-Path $scriptDir "automatic1111"

if (-not (Test-Path $automatic1111Dir)) {
    Write-Host "Erreur: Le dossier automatic1111 est introuvable dans $scriptDir" -ForegroundColor Red
    Write-Host "Veuillez d'abord cloner le dépôt avec:" -ForegroundColor Yellow
    Write-Host "  git clone https://github.com/AUTOMATIC1111/stable-diffusion-webui.git automatic1111" -ForegroundColor Yellow
    exit 1
}

# Vérifier si Python est installé
$pythonCmd = Get-Command python -ErrorAction SilentlyContinue
if (-not $pythonCmd) {
    Write-Host "Erreur: Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    Write-Host "Veuillez installer Python 3.10.6 depuis https://www.python.org/downloads/" -ForegroundColor Yellow
    Write-Host "Assurez-vous de cocher 'Add Python to PATH' lors de l'installation" -ForegroundColor Yellow
    exit 1
}

# Vérifier la version de Python (recommandé: 3.10.6)
$pythonVersion = python --version 2>&1
Write-Host "Version Python détectée: $pythonVersion" -ForegroundColor Cyan

# Vérifier si Python 3.10 est disponible via py launcher
$python310 = $null
$python310Path = $null

# Essayer d'abord py -3.10 (version standard)
$py310Output = py -3.10 --version 2>&1
if ($LASTEXITCODE -eq 0) {
    $python310 = "py -3.10"
    # Obtenir le chemin complet de Python 3.10
    $python310FullPath = py -3.10 -c "import sys; print(sys.executable)" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $python310Path = $python310FullPath.Trim()
        Write-Host "Python 3.10 détecté via py launcher: $python310Path" -ForegroundColor Green
    }
} else {
    # py -3.10 non disponible, essayer avec le tag complet (Astral/CPython)
    $py310Output = py -V:Astral/CPython3.10.18 --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $python310 = "py -V:Astral/CPython3.10.18"
        $python310FullPath = py -V:Astral/CPython3.10.18 -c "import sys; print(sys.executable)" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $python310Path = $python310FullPath.Trim()
            Write-Host "Python 3.10.18 (Astral/CPython) détecté: $python310Path" -ForegroundColor Green
        }
    }
}

# Si Python 3.13+ est détecté et Python 3.10 n'est pas disponible, avertir
if ($pythonVersion -match "Python 3\.(1[3-9]|[2-9]\d)") {
    if (-not $python310) {
        Write-Host ""
        Write-Host "⚠️  ATTENTION: Version Python incompatible détectée!" -ForegroundColor Yellow
        Write-Host "Automatic1111 est testé avec Python 3.10.6" -ForegroundColor Yellow
        Write-Host "La version actuelle ($pythonVersion) peut causer des problèmes d'installation de PyTorch" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Solutions recommandées:" -ForegroundColor Cyan
        Write-Host "1. Installer Python 3.10.6 depuis: https://www.python.org/downloads/release/python-3106/" -ForegroundColor White
        Write-Host "2. Utiliser le py launcher Windows: py -3.10 pour spécifier Python 3.10" -ForegroundColor White
        Write-Host ""
        Write-Host "Tentative de démarrage avec --skip-python-version-check..." -ForegroundColor Yellow
        Write-Host "(Cela peut échouer si PyTorch ne peut pas être installé)" -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds 3
    }
}

# Vérifier si Git est installé
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Host "Avertissement: Git n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Yellow
    Write-Host "Git est nécessaire pour télécharger les modèles et extensions" -ForegroundColor Yellow
}

# Changer vers le répertoire Automatic1111
Set-Location $automatic1111Dir

# Vérifier si le venv existe, sinon le créer
$venvDir = Join-Path $automatic1111Dir "venv"
$venvNeedsRecreation = $false

# Si Python 3.13+ est utilisé et Python 3.10 est disponible, supprimer l'ancien venv
if ($pythonVersion -match "Python 3\.(1[3-9]|[2-9]\d)" -and $python310 -and (Test-Path $venvDir)) {
    Write-Host "Python 3.10 disponible mais venv créé avec Python 3.13+" -ForegroundColor Yellow
    Write-Host "Suppression de l'ancien venv pour le recréer avec Python 3.10..." -ForegroundColor Yellow
    Remove-Item -Path $venvDir -Recurse -Force -ErrorAction SilentlyContinue
    $venvNeedsRecreation = $true
}

if (-not (Test-Path $venvDir) -or $venvNeedsRecreation) {
    Write-Host "Création de l'environnement virtuel Python..." -ForegroundColor Yellow
    # Utiliser Python 3.10 si disponible, sinon utiliser python par défaut
    if ($python310) {
        Write-Host "Utilisation de Python 3.10 pour créer le venv..." -ForegroundColor Green
        # Obtenir le chemin complet de Python 3.10 pour créer le venv
        $python310Exe = & cmd /c "$python310 -c `"import sys; print(sys.executable)`"" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $python310Exe = $python310Exe.Trim()
            & $python310Exe -m venv venv
        } else {
            # Fallback: utiliser la commande py directement
            & cmd /c "$python310 -m venv venv"
        }
    } else {
        python -m venv venv
    }
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Erreur lors de la création de l'environnement virtuel" -ForegroundColor Red
        exit 1
    }
}

# Activer le venv et installer les dépendances si nécessaire
Write-Host "Activation de l'environnement virtuel..." -ForegroundColor Yellow
& "$venvDir\Scripts\Activate.ps1"

# Vérifier si les dépendances sont installées
$requirementsFile = Join-Path $automatic1111Dir "requirements.txt"
if (Test-Path $requirementsFile) {
    Write-Host "Vérification des dépendances..." -ForegroundColor Yellow
    # Note: Automatic1111 installe automatiquement les dépendances au premier lancement
    # via launch.py, donc on n'a pas besoin de les installer manuellement ici
}

# Démarrer Automatic1111
Write-Host "Démarrage d'Automatic1111..." -ForegroundColor Yellow
Write-Host "Cela peut prendre plusieurs minutes au premier lancement (téléchargement des dépendances)" -ForegroundColor Cyan
Write-Host ""

# Configurer webui-user.bat si Python 3.10 est disponible
if ($python310) {
    $webuiUserBat = Join-Path $automatic1111Dir "webui-user.bat"
    $webuiUserContent = Get-Content $webuiUserBat -ErrorAction SilentlyContinue
    if ($webuiUserContent) {
        # Vérifier si PYTHON est déjà configuré correctement
        $pythonLine = $webuiUserContent | Where-Object { $_ -match "^\s*set PYTHON=" }
        if (-not $pythonLine -or ($pythonLine -notmatch $python310)) {
            Write-Host "Configuration de webui-user.bat pour utiliser Python 3.10..." -ForegroundColor Green
            # Remplacer ou ajouter la ligne PYTHON
            $newContent = @()
            $pythonLineAdded = $false
            foreach ($line in $webuiUserContent) {
                if ($line -match "^\s*set PYTHON=") {
                    # Remplacer la ligne existante
                    $newContent += "set PYTHON=$python310"
                    $pythonLineAdded = $true
                } elseif ($line -match "^@echo off" -and -not $pythonLineAdded) {
                    # Ajouter après @echo off si pas encore ajouté
                    $newContent += $line
                    $newContent += "set PYTHON=$python310"
                    $pythonLineAdded = $true
                } else {
                    $newContent += $line
                }
            }
            $newContent | Set-Content $webuiUserBat
        } else {
            Write-Host "webui-user.bat est déjà configuré pour utiliser Python 3.10" -ForegroundColor Green
        }
    }
}

# Définir la variable d'environnement pour corriger le dépôt Stable Diffusion
# Le dépôt Stability-AI n'existe plus, utiliser CompVis à la place
$env:STABLE_DIFFUSION_REPO = "https://github.com/CompVis/stable-diffusion.git"
# Ne pas spécifier de commit hash pour utiliser le HEAD du dépôt CompVis
$env:STABLE_DIFFUSION_COMMIT_HASH = ""
Write-Host "Configuration du dépôt Stable Diffusion: $env:STABLE_DIFFUSION_REPO" -ForegroundColor Green
Write-Host "Utilisation du commit HEAD (pas de commit spécifique)" -ForegroundColor Green

# webui.bat lit les arguments depuis COMMANDLINE_ARGS dans webui-user.bat
# Pas besoin de passer les arguments en ligne de commande
# Les arguments sont déjà configurés dans webui-user.bat

# Si Python 3.13+ est utilisé et Python 3.10 n'est pas disponible, ajouter --skip-python-version-check
if ($pythonVersion -match "Python 3\.(1[3-9]|[2-9]\d)" -and -not $python310) {
    Write-Host ""
    Write-Host "⚠️  ATTENTION: PyTorch 2.1.2 n'est pas disponible pour Python 3.13+" -ForegroundColor Red
    Write-Host "Le démarrage va probablement échouer lors de l'installation de PyTorch" -ForegroundColor Red
    Write-Host "Solution: Installez Python 3.10.6 depuis https://www.python.org/downloads/release/python-3106/" -ForegroundColor Yellow
    Write-Host ""
    Start-Sleep -Seconds 3
}

# Lancer webui.bat (les arguments sont dans webui-user.bat via COMMANDLINE_ARGS)
& "$automatic1111Dir\webui.bat"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Automatic1111 démarré avec succès!" -ForegroundColor Green
    Write-Host "Accès: http://localhost:7860/" -ForegroundColor Cyan
} else {
    Write-Host "Erreur lors du démarrage d'Automatic1111" -ForegroundColor Red
    Write-Host "Consultez les logs ci-dessus pour plus d'informations" -ForegroundColor Yellow
    exit 1
}
