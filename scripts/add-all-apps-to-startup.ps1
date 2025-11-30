# Script pour ajouter toutes les applications au démarrage automatique de Windows
# Applications: Stability Matrix, Hunyuan3D-2, ComfyUI, StableDiffusion, RuinedFooocus
# Exécutez ce script en tant qu'administrateur si nécessaire

Write-Host "[DEMARRAGE] Ajout de toutes les applications au démarrage automatique" -ForegroundColor Cyan
Write-Host "=============================================================" -ForegroundColor Cyan
Write-Host ""

# Chemin du dossier de démarrage Windows
$startupFolder = [Environment]::GetFolderPath("Startup")
Write-Host "[DOSSIER] Dossier de démarrage: $startupFolder" -ForegroundColor Gray
Write-Host ""

$successCount = 0
$errorCount = 0

# ============================================================
# Ajouter Stability Matrix
# ============================================================
Write-Host "[1/5] Ajout de Stability Matrix..." -ForegroundColor Yellow

$stabilityMatrixPath = Join-Path $env:USERPROFILE "Documents\StabilityMatrix-win-x64\StabilityMatrix.exe"
$stabilityMatrixPath = Resolve-Path $stabilityMatrixPath -ErrorAction SilentlyContinue

if (-not $stabilityMatrixPath) {
    Write-Host "   [ERREUR] Erreur: Impossible de trouver StabilityMatrix.exe" -ForegroundColor Red
    Write-Host "      Chemin recherché: $env:USERPROFILE\Documents\StabilityMatrix-win-x64\StabilityMatrix.exe" -ForegroundColor Yellow
    $errorCount++
} else {
    $shortcutName = "Stability Matrix - Auto Start.lnk"
    $shortcutPath = Join-Path $startupFolder $shortcutName
    
    try {
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($shortcutPath)
        $Shortcut.TargetPath = $stabilityMatrixPath
        $Shortcut.WorkingDirectory = Split-Path $stabilityMatrixPath
        $Shortcut.Description = "Démarrage automatique de Stability Matrix"
        $Shortcut.Save()
        
        Write-Host "   [OK] OK - Stability Matrix ajouté avec succès" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "   [ERREUR] Erreur lors de la création du raccourci: $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""

# ============================================================
# Ajouter Hunyuan3D-2 (port 8888)
# ============================================================
Write-Host "[2/5] Ajout de Hunyuan3D-2 (port 8888)..." -ForegroundColor Yellow

# Vérifier si le script de démarrage Hunyuan3D existe
$hunyuanScriptPath = Join-Path $PSScriptRoot "start-hunyuan3d.ps1"
$hunyuanScriptPath = Resolve-Path $hunyuanScriptPath -ErrorAction SilentlyContinue

if (-not $hunyuanScriptPath) {
    Write-Host "   [ERREUR] Erreur: Impossible de trouver start-hunyuan3d.ps1" -ForegroundColor Red
    Write-Host "      Chemin recherché: $PSScriptRoot\start-hunyuan3d.ps1" -ForegroundColor Yellow
    $errorCount++
} else {
    $batchFileName = "Hunyuan3D-2 - Auto Start.bat"
    $batchFilePath = Join-Path $startupFolder $batchFileName
    
    try {
        # Créer le fichier batch qui lance le script PowerShell
        $batchContent = "@echo off`r`ncd /d `"$PSScriptRoot`"`r`npowershell.exe -ExecutionPolicy Bypass -File `"start-hunyuan3d.ps1`"`r`n"
        
        Set-Content -Path $batchFilePath -Value $batchContent -Encoding ASCII
        
        Write-Host "   [OK] OK - Hunyuan3D-2 (port 8888) ajouté avec succès" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "   [ERREUR] Erreur lors de la création du fichier batch: $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""

# ============================================================
# Ajouter ComfyUI
# ============================================================
Write-Host "[3/5] Ajout de ComfyUI..." -ForegroundColor Yellow

# Vérifier si le script de démarrage ComfyUI existe
$comfyuiScriptPath = Join-Path $PSScriptRoot "start-comfyui.ps1"
$comfyuiScriptPath = Resolve-Path $comfyuiScriptPath -ErrorAction SilentlyContinue

if (-not $comfyuiScriptPath) {
    Write-Host "   [AVERTISSEMENT] Script start-comfyui.ps1 non trouve, creation d'un script de demarrage Docker..." -ForegroundColor Yellow
    
    # Créer un script de démarrage ComfyUI basique
    $comfyuiDockerScript = @'
# Script pour démarrer ComfyUI via Docker
Write-Host "[DEMARRAGE] Démarrage de ComfyUI..." -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
try {
    $dockerStatus = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Docker n'est pas en cours d'exécution" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERREUR] Erreur lors de la vérification de Docker" -ForegroundColor Red
    exit 1
}

# Chemin vers le docker-compose.yml de ComfyUI
$comfyuiPath = Join-Path $PSScriptRoot "docker-services\essentiels\comfyui\docker-compose.yml"
$comfyuiPath = Resolve-Path $comfyuiPath -ErrorAction SilentlyContinue

if (-not $comfyuiPath) {
    Write-Host "[ERREUR] Impossible de trouver docker-compose.yml pour ComfyUI" -ForegroundColor Red
    exit 1
}

# Démarrer ComfyUI
$comfyuiDir = Split-Path $comfyuiPath
Push-Location $comfyuiDir
docker-compose up -d
Pop-Location

Write-Host "[OK] ComfyUI démarré" -ForegroundColor Green
'@
    
    $comfyuiScriptPath = Join-Path $PSScriptRoot "start-comfyui.ps1"
    Set-Content -Path $comfyuiScriptPath -Value $comfyuiDockerScript -Encoding UTF8
    Write-Host "   [OK] Script start-comfyui.ps1 créé" -ForegroundColor Green
}

$batchFileName = "ComfyUI - Auto Start.bat"
$batchFilePath = Join-Path $startupFolder $batchFileName

try {
    # Créer le fichier batch qui lance le script PowerShell
    $batchContent = "@echo off`r`ncd /d `"$PSScriptRoot`"`r`npowershell.exe -ExecutionPolicy Bypass -File `"start-comfyui.ps1`"`r`n"
    
    Set-Content -Path $batchFilePath -Value $batchContent -Encoding ASCII
    
    Write-Host "   [OK] OK - ComfyUI ajouté avec succès" -ForegroundColor Green
    $successCount++
} catch {
    Write-Host "   [ERREUR] Erreur lors de la création du fichier batch: $_" -ForegroundColor Red
    $errorCount++
}

Write-Host ""

# ============================================================
# Ajouter StableDiffusion
# ============================================================
Write-Host "[4/5] Ajout de StableDiffusion..." -ForegroundColor Yellow

# Vérifier si le script de démarrage StableDiffusion existe
$stablediffusionScriptPath = Join-Path $PSScriptRoot "start-stablediffusion.ps1"
$stablediffusionScriptPath = Resolve-Path $stablediffusionScriptPath -ErrorAction SilentlyContinue

if (-not $stablediffusionScriptPath) {
    Write-Host "   [AVERTISSEMENT] Script start-stablediffusion.ps1 non trouve, creation d'un script de demarrage..." -ForegroundColor Yellow
    
    # Créer un script de démarrage StableDiffusion basique
    $stablediffusionScript = @'
# Script pour démarrer StableDiffusion via Stability Matrix
Write-Host "[DEMARRAGE] Démarrage de StableDiffusion..." -ForegroundColor Cyan

# Vérifier si Stability Matrix est installé
$stabilityMatrixPath = Join-Path $env:USERPROFILE "Documents\StabilityMatrix-win-x64\StabilityMatrix.exe"
$stabilityMatrixPath = Resolve-Path $stabilityMatrixPath -ErrorAction SilentlyContinue

if (-not $stabilityMatrixPath) {
    Write-Host "[ERREUR] Impossible de trouver StabilityMatrix.exe" -ForegroundColor Red
    exit 1
}

# Vérifier si Stability Matrix est déjà en cours d'exécution
$stabilityMatrixProcess = Get-Process -Name "StabilityMatrix" -ErrorAction SilentlyContinue

if (-not $stabilityMatrixProcess) {
    # Démarrer Stability Matrix
    $stabilityMatrixDir = Split-Path $stabilityMatrixPath
    Start-Process -FilePath $stabilityMatrixPath -WorkingDirectory $stabilityMatrixDir -WindowStyle Normal
    Write-Host "[OK] Stability Matrix démarré" -ForegroundColor Green
} else {
    Write-Host "[OK] Stability Matrix est déjà en cours d'exécution" -ForegroundColor Green
}

Write-Host "[INFO] StableDiffusion sera accessible via Stability Matrix" -ForegroundColor Yellow
'@
    
    $stablediffusionScriptPath = Join-Path $PSScriptRoot "start-stablediffusion.ps1"
    Set-Content -Path $stablediffusionScriptPath -Value $stablediffusionScript -Encoding UTF8
    Write-Host "   [OK] Script start-stablediffusion.ps1 créé" -ForegroundColor Green
}

$batchFileName = "StableDiffusion - Auto Start.bat"
$batchFilePath = Join-Path $startupFolder $batchFileName

try {
    # Créer le fichier batch qui lance le script PowerShell
    $batchContent = "@echo off`r`ncd /d `"$PSScriptRoot`"`r`npowershell.exe -ExecutionPolicy Bypass -File `"start-stablediffusion.ps1`"`r`n"
    
    Set-Content -Path $batchFilePath -Value $batchContent -Encoding ASCII
    
    Write-Host "   [OK] OK - StableDiffusion ajouté avec succès" -ForegroundColor Green
    $successCount++
} catch {
    Write-Host "   [ERREUR] Erreur lors de la création du fichier batch: $_" -ForegroundColor Red
    $errorCount++
}

Write-Host ""

# ============================================================
# Ajouter RuinedFooocus
# ============================================================
Write-Host "[5/5] Ajout de RuinedFooocus..." -ForegroundColor Yellow

# Vérifier si le script de démarrage RuinedFooocus existe
$ruinedfooocusScriptPath = Join-Path $PSScriptRoot "start-ruinedfooocus.ps1"
$ruinedfooocusScriptPath = Resolve-Path $ruinedfooocusScriptPath -ErrorAction SilentlyContinue

if (-not $ruinedfooocusScriptPath) {
    Write-Host "   [AVERTISSEMENT] Script start-ruinedfooocus.ps1 non trouve, creation d'un script de demarrage..." -ForegroundColor Yellow
    
    # Créer un script de démarrage RuinedFooocus basique
    $ruinedfooocusScript = @'
# Script pour démarrer RuinedFooocus via Stability Matrix
Write-Host "[DEMARRAGE] Démarrage de RuinedFooocus..." -ForegroundColor Cyan

# Vérifier si Stability Matrix est installé
$stabilityMatrixPath = Join-Path $env:USERPROFILE "Documents\StabilityMatrix-win-x64\StabilityMatrix.exe"
$stabilityMatrixPath = Resolve-Path $stabilityMatrixPath -ErrorAction SilentlyContinue

if (-not $stabilityMatrixPath) {
    Write-Host "[ERREUR] Impossible de trouver StabilityMatrix.exe" -ForegroundColor Red
    exit 1
}

# Vérifier si Stability Matrix est déjà en cours d'exécution
$stabilityMatrixProcess = Get-Process -Name "StabilityMatrix" -ErrorAction SilentlyContinue

if (-not $stabilityMatrixProcess) {
    # Démarrer Stability Matrix
    $stabilityMatrixDir = Split-Path $stabilityMatrixPath
    Start-Process -FilePath $stabilityMatrixPath -WorkingDirectory $stabilityMatrixDir -WindowStyle Normal
    Write-Host "[OK] Stability Matrix démarré" -ForegroundColor Green
} else {
    Write-Host "[OK] Stability Matrix est déjà en cours d'exécution" -ForegroundColor Green
}

Write-Host "[INFO] RuinedFooocus sera accessible via Stability Matrix" -ForegroundColor Yellow
'@
    
    $ruinedfooocusScriptPath = Join-Path $PSScriptRoot "start-ruinedfooocus.ps1"
    Set-Content -Path $ruinedfooocusScriptPath -Value $ruinedfooocusScript -Encoding UTF8
    Write-Host "   [OK] Script start-ruinedfooocus.ps1 créé" -ForegroundColor Green
}

$batchFileName = "RuinedFooocus - Auto Start.bat"
$batchFilePath = Join-Path $startupFolder $batchFileName

try {
    # Créer le fichier batch qui lance le script PowerShell
    $batchContent = "@echo off`r`ncd /d `"$PSScriptRoot`"`r`npowershell.exe -ExecutionPolicy Bypass -File `"start-ruinedfooocus.ps1`"`r`n"
    
    Set-Content -Path $batchFilePath -Value $batchContent -Encoding ASCII
    
    Write-Host "   [OK] OK - RuinedFooocus ajouté avec succès" -ForegroundColor Green
    $successCount++
} catch {
    Write-Host "   [ERREUR] Erreur lors de la création du fichier batch: $_" -ForegroundColor Red
    $errorCount++
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Configuration terminée!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[OK] Applications ajoutées avec succès: $successCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "[ERREUR] Erreurs rencontrées: $errorCount" -ForegroundColor Red
}
Write-Host ""
Write-Host "[NOTE] Les applications se lanceront automatiquement au prochain démarrage de Windows" -ForegroundColor Yellow
Write-Host ""
Write-Host "[INFO] Pour desactiver le demarrage automatique:" -ForegroundColor Cyan
Write-Host "   1. Appuyez sur Win+R" -ForegroundColor Gray
Write-Host "   2. Tapez: shell:startup" -ForegroundColor Gray
Write-Host "   3. Supprimez les raccourcis correspondants" -ForegroundColor Gray
Write-Host ""
Write-Host "[NOTE] Notes importantes:" -ForegroundColor Yellow
Write-Host "   - Docker Desktop doit être configuré pour démarrer automatiquement" -ForegroundColor Yellow
Write-Host "     pour que ComfyUI puisse démarrer correctement." -ForegroundColor Yellow
Write-Host "   - Stability Matrix doit être configuré pour démarrer automatiquement" -ForegroundColor Yellow
Write-Host "     pour que StableDiffusion et RuinedFooocus puissent démarrer correctement." -ForegroundColor Yellow
Write-Host "   - Hunyuan3D-2 démarre automatiquement sur le port 8888" -ForegroundColor Yellow
Write-Host "     et sera accessible via https://hunyuan3d.iahome.fr" -ForegroundColor Yellow
Write-Host ""

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

