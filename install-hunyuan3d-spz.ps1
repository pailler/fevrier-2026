# Script d'installation de Hunyuan3D-2-stable-projectorz (version SPZ)
# Version: spz (4 mars 2025) - Non portable, installable

Write-Host "🚀 Installation de Hunyuan3D-2-stable-projectorz (SPZ)" -ForegroundColor Cyan
Write-Host ""

# Vérifier le fichier téléchargé
$documentsPath = [Environment]::GetFolderPath("MyDocuments")
$zipFile = Join-Path $documentsPath "hunyuan2-spz.zip"

# Fallback vers le répertoire courant
if (-not (Test-Path $zipFile)) {
    $zipFile = "hunyuan2-spz.zip"
}

if (-not (Test-Path $zipFile)) {
    Write-Host "❌ Fichier hunyuan2-spz.zip non trouvé!" -ForegroundColor Red
    Write-Host "   Emplacements recherchés:" -ForegroundColor Yellow
    Write-Host "   - $documentsPath" -ForegroundColor Gray
    Write-Host "   - $PWD" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📥 Téléchargez depuis:" -ForegroundColor Cyan
    Write-Host "   https://github.com/IgorAherne/Hunyuan3D-2-stable-projectorz/releases/download/spz/hunyuan2-spz.zip" -ForegroundColor White
    exit 1
}

Write-Host "✅ Fichier trouvé: $zipFile" -ForegroundColor Green
$fileSize = [math]::Round((Get-Item $zipFile).Length / 1MB, 2)
Write-Host "   Taille: $fileSize MB" -ForegroundColor Gray
Write-Host ""

# Dossier de destination
$extractTo = "hunyuan2-spz"
$extractToFull = Join-Path $PWD $extractTo

# Vérifier si déjà extrait
if (Test-Path $extractToFull) {
    Write-Host "✅ Fichiers déjà extraits dans: $extractToFull" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "📦 Extraction des fichiers..." -ForegroundColor Cyan
    Write-Host "   Source: $zipFile" -ForegroundColor Gray
    Write-Host "   Destination: $extractToFull" -ForegroundColor Gray
    Write-Host ""
    
    try {
        # Créer le dossier de destination
        New-Item -ItemType Directory -Path $extractToFull -Force | Out-Null
        
        # Extraire avec Expand-Archive (PowerShell natif)
        $zipPath = if ([System.IO.Path]::IsPathRooted($zipFile)) { $zipFile } else { Join-Path $PWD $zipFile }
        Expand-Archive -Path $zipPath -DestinationPath $extractToFull -Force
        
        Write-Host "✅ Extraction réussie!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de l'extraction: $_" -ForegroundColor Red
        exit 1
    }
}

# Chercher la structure après extraction
Write-Host ""
Write-Host "🔍 Recherche de la structure d'installation..." -ForegroundColor Cyan

# Chercher les dossiers possibles
$possibleDirs = @(
    (Join-Path $extractToFull "hunyuan2-spz"),
    (Join-Path $extractToFull "hunyuan2-stableprojectorz"),
    (Join-Path $extractToFull "stable-projectorz"),
    $extractToFull
)

$installDir = $null
foreach ($dir in $possibleDirs) {
    if (Test-Path $dir) {
        # Vérifier s'il contient des fichiers d'installation
        $hasTools = Test-Path (Join-Path $dir "tools")
        $hasRun = (Test-Path (Join-Path $dir "run-projectorz")) -or (Test-Path (Join-Path $dir "run-browser"))
        $hasBat = (Get-ChildItem -Path $dir -Filter "*.bat" -Recurse -ErrorAction SilentlyContinue).Count -gt 0
        
        if ($hasTools -or $hasRun -or $hasBat) {
            $installDir = $dir
            break
        }
    }
}

if (-not $installDir) {
    Write-Host "⚠️  Structure non identifiée automatiquement" -ForegroundColor Yellow
    Write-Host "   Dossier extrait: $extractToFull" -ForegroundColor Gray
    Write-Host "   Veuillez vérifier manuellement le contenu" -ForegroundColor Yellow
    $installDir = $extractToFull
} else {
    Write-Host "✅ Dossier d'installation trouvé: $installDir" -ForegroundColor Green
}

Write-Host ""

# Chercher les scripts de lancement
Write-Host "🔍 Recherche des scripts de lancement..." -ForegroundColor Cyan

$launchScripts = @(
    (Get-ChildItem -Path $installDir -Filter "*run*.bat" -Recurse -ErrorAction SilentlyContinue),
    (Get-ChildItem -Path $installDir -Filter "*gradio*.bat" -Recurse -ErrorAction SilentlyContinue),
    (Get-ChildItem -Path $installDir -Filter "*.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 5)
)

if ($launchScripts.Count -gt 0) {
    Write-Host "✅ Scripts de lancement trouvés:" -ForegroundColor Green
    $launchScripts | Select-Object -First 5 | ForEach-Object {
        Write-Host "   - $($_.Name)" -ForegroundColor White
        Write-Host "     Chemin: $($_.FullName)" -ForegroundColor Gray
    }
} else {
    Write-Host "⚠️  Aucun script de lancement trouvé" -ForegroundColor Yellow
}

Write-Host ""

# Mettre à jour le script de démarrage
Write-Host "📝 Mise à jour du script de démarrage..." -ForegroundColor Cyan

$startScript = @"
# Script pour démarrer Hunyuan 3D sur le port 8888
# Version: Hunyuan3D-2-stable-projectorz SPZ (4 mars 2025)
Write-Host "🚀 Démarrage de Hunyuan 3D sur le port 8888..." -ForegroundColor Cyan

# Chemin vers le dossier de Hunyuan 3D (version SPZ)
`$hunyuanPath = Join-Path `$PSScriptRoot "hunyuan2-spz"
`$hunyuanPath = Resolve-Path `$hunyuanPath -ErrorAction SilentlyContinue

# Chercher le sous-dossier si nécessaire
if (`$hunyuanPath) {
    `$subDirs = @("hunyuan2-spz", "hunyuan2-stableprojectorz", "stable-projectorz")
    foreach (`$subDir in `$subDirs) {
        `$testPath = Join-Path `$hunyuanPath `$subDir
        if (Test-Path `$testPath) {
            `$hunyuanPath = `$testPath
            break
        }
    }
}

# Fallback vers l'ancienne version si la nouvelle n'existe pas
if (-not `$hunyuanPath) {
    `$hunyuanPath = Join-Path `$PSScriptRoot "v16_hunyuan2-stableprojectorz"
    `$hunyuanPath = Resolve-Path `$hunyuanPath -ErrorAction SilentlyContinue
}

if (-not `$hunyuanPath) {
    Write-Host "❌ Erreur: Impossible de trouver Hunyuan 3D" -ForegroundColor Red
    Write-Host "   Chemins recherchés:" -ForegroundColor Yellow
    Write-Host "   - `$PSScriptRoot\hunyuan2-spz" -ForegroundColor Gray
    Write-Host "   - `$PSScriptRoot\v16_hunyuan2-stableprojectorz" -ForegroundColor Gray
    exit 1
}

# Chercher le script de lancement
`$toolsPath = `$null
`$possibleScripts = @(
    (Get-ChildItem -Path `$hunyuanPath -Filter "*run*.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName,
    (Get-ChildItem -Path `$hunyuanPath -Filter "*gradio*.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName,
    (Join-Path `$hunyuanPath "tools\gradio-internal.bat")
)

foreach (`$script in `$possibleScripts) {
    if (`$script -and (Test-Path `$script)) {
        `$toolsPath = Split-Path `$script
        break
    }
}

if (-not `$toolsPath) {
    Write-Host "❌ Erreur: Script de lancement non trouvé" -ForegroundColor Red
    Write-Host "   Dossier: `$hunyuanPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Chemin trouvé: `$toolsPath" -ForegroundColor Green

# Vérifier si le port 8888 est déjà utilisé
`$portInUse = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue

if (`$portInUse) {
    Write-Host "⚠️  Le port 8888 est déjà utilisé" -ForegroundColor Yellow
    Write-Host "   Processus: `$(`$portInUse.OwningProcess)" -ForegroundColor Gray
    Write-Host "   Hunyuan 3D est peut-être déjà en cours d'exécution" -ForegroundColor Gray
    exit 0
}

# Changer vers le dossier tools
Set-Location `$toolsPath

Write-Host "🔄 Démarrage du service Hunyuan 3D..." -ForegroundColor Yellow
Write-Host "   Port: 8888" -ForegroundColor Gray
Write-Host "   Host: 0.0.0.0" -ForegroundColor Gray
Write-Host ""

# Démarrer Hunyuan 3D sur le port 8888
try {
    `$launchScript = Get-ChildItem -Path `$toolsPath -Filter "*gradio*.bat" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if (`$launchScript) {
        `$scriptPath = `$launchScript.FullName
        Write-Host "   Script: `$(`$launchScript.Name)" -ForegroundColor Gray
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"`$scriptPath`" --port 8888 --host 0.0.0.0" -WorkingDirectory `$toolsPath -WindowStyle Minimized
    } else {
        # Fallback: commande directe
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "gradio-internal.bat --port 8888 --host 0.0.0.0 --model_path tencent/Hunyuan3D-2mv --subfolder hunyuan3d-dit-v2-mv-turbo --texgen_model_path tencent/Hunyuan3D-2 --low_vram_mode --enable_flashvdm --enable_t23d" -WorkingDirectory `$toolsPath -WindowStyle Minimized
    }
    
    Write-Host "✅ Commande de démarrage exécutée" -ForegroundColor Green
    Write-Host "⏳ Attente du démarrage du service (30 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Vérifier si le service est accessible
    try {
        `$response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Service Hunyuan 3D accessible sur http://localhost:8888" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Service non encore accessible. Le chargement des modèles peut prendre plusieurs minutes." -ForegroundColor Yellow
        Write-Host "   Vérifiez la fenêtre de commande pour voir les logs." -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage de Hunyuan 3D: `$_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌐 URLs d'accès:" -ForegroundColor Cyan
Write-Host "   • Local: http://localhost:8888" -ForegroundColor White
Write-Host "   • Production: https://hunyuan3d.iahome.fr" -ForegroundColor White
Write-Host ""
"@

$startScript | Out-File -FilePath "start-hunyuan3d.ps1" -Encoding UTF8

Write-Host "✅ Script de démarrage mis à jour" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 Installation terminée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Dossier d'installation: $installDir" -ForegroundColor Cyan
Write-Host "🚀 Pour démarrer: .\start-hunyuan3d.ps1" -ForegroundColor White
Write-Host ""
Write-Host "💡 Note: Cette version nécessite une première exécution pour télécharger les modèles" -ForegroundColor Yellow
Write-Host ""

