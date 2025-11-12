# Script d'installation complète de Hunyuan3D-2-WinPortable
# Version: v4-cu129 (Hunyuan3D-2.1)

Write-Host "🚀 Installation de Hunyuan3D-2-WinPortable v4-cu129" -ForegroundColor Cyan
Write-Host ""

# Vérifier les fichiers téléchargés (dans Documents ou répertoire courant)
$documentsPath = [Environment]::GetFolderPath("MyDocuments")
$part1 = Join-Path $documentsPath "Hunyuan3D2_WinPortable_cu129.7z.001"
$part2 = Join-Path $documentsPath "Hunyuan3D2_WinPortable_cu129.7z.002"

# Fallback vers le répertoire courant si pas trouvé dans Documents
if (-not (Test-Path $part1)) {
    $part1 = "Hunyuan3D2_WinPortable_cu129.7z.001"
}
if (-not (Test-Path $part2)) {
    $part2 = "Hunyuan3D2_WinPortable_cu129.7z.002"
}

# Vérifier que les fichiers existent
$part1Exists = Test-Path $part1
$part2Exists = Test-Path $part2

if (-not $part1Exists) {
    Write-Host "❌ Fichier Hunyuan3D2_WinPortable_cu129.7z.001 non trouvé!" -ForegroundColor Red
    Write-Host "   Emplacements recherchés:" -ForegroundColor Yellow
    Write-Host "   - $documentsPath" -ForegroundColor Gray
    Write-Host "   - $PWD" -ForegroundColor Gray
    Write-Host "   Veuillez télécharger les fichiers depuis:" -ForegroundColor Yellow
    Write-Host "   https://github.com/YanWenKun/Hunyuan3D-2-WinPortable/releases" -ForegroundColor White
    exit 1
}

if (-not $part2Exists) {
    Write-Host "❌ Fichier Hunyuan3D2_WinPortable_cu129.7z.002 non trouvé!" -ForegroundColor Red
    Write-Host "   Emplacements recherchés:" -ForegroundColor Yellow
    Write-Host "   - $documentsPath" -ForegroundColor Gray
    Write-Host "   - $PWD" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Fichiers téléchargés trouvés" -ForegroundColor Green
Write-Host ""

# Vérifier 7-Zip
$7zipPaths = @(
    "C:\Program Files\7-Zip\7z.exe",
    "C:\Program Files (x86)\7-Zip\7z.exe"
)

$7zipPath = $null
foreach ($path in $7zipPaths) {
    if (Test-Path $path) {
        $7zipPath = $path
        break
    }
}

if (-not $7zipPath) {
    Write-Host "⚠️  7-Zip n'est pas installé!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📥 Pour continuer, installez 7-Zip:" -ForegroundColor Cyan
    Write-Host "   1. Téléchargez depuis: https://www.7-zip.org/" -ForegroundColor White
    Write-Host "   2. Installez 7-Zip" -ForegroundColor White
    Write-Host "   3. Relancez ce script" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Alternative: Extraction manuelle" -ForegroundColor Cyan
    Write-Host "   - Clic droit sur $part1" -ForegroundColor White
    Write-Host "   - Sélectionnez '7-Zip' > 'Extraire ici'" -ForegroundColor White
    Write-Host ""
    
    # Ouvrir le guide
    if (Test-Path "GUIDE_INSTALLATION_HUNYUAN3D.md") {
        Write-Host "📖 Guide détaillé disponible: GUIDE_INSTALLATION_HUNYUAN3D.md" -ForegroundColor Cyan
    }
    
    exit 1
}

Write-Host "✅ 7-Zip trouvé: $7zipPath" -ForegroundColor Green
Write-Host ""

# Dossier de destination (dans le répertoire courant, pas dans Documents)
$extractTo = "Hunyuan3D2_WinPortable_cu129"
$extractToFull = Join-Path $PWD $extractTo
$finalPath = Join-Path $extractToFull "Hunyuan3D2_WinPortable"

# Vérifier si déjà extrait
if (Test-Path $finalPath) {
    Write-Host "✅ Fichiers déjà extraits dans: $finalPath" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "📦 Extraction des fichiers (cela peut prendre plusieurs minutes)..." -ForegroundColor Cyan
    Write-Host "   Source: $part1" -ForegroundColor Gray
    Write-Host "   Destination: $extractToFull" -ForegroundColor Gray
    Write-Host ""
    
    try {
        # Créer le dossier de destination dans le répertoire courant
        New-Item -ItemType Directory -Path $extractToFull -Force | Out-Null
        
        # Extraire (7z gère automatiquement les volumes multiples)
        # Utiliser le chemin complet pour les fichiers
        $part1Full = if ([System.IO.Path]::IsPathRooted($part1)) { $part1 } else { Join-Path $PWD $part1 }
        $process = Start-Process -FilePath $7zipPath -ArgumentList "x", "`"$part1Full`"", "-o`"$extractToFull`"", "-y" -Wait -NoNewWindow -PassThru
        
        if ($process.ExitCode -eq 0) {
            Write-Host "✅ Extraction réussie!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur lors de l'extraction (code: $($process.ExitCode))" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Erreur: $_" -ForegroundColor Red
        exit 1
    }
}

# Vérifier la structure
if (-not (Test-Path $finalPath)) {
    Write-Host "❌ Structure de dossiers incorrecte après extraction" -ForegroundColor Red
    Write-Host "   Attendu: $finalPath" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔍 Recherche des scripts de lancement..." -ForegroundColor Cyan

# Chercher les scripts de lancement (structure peut varier)
$possiblePaths = @(
    (Join-Path $finalPath "run-browser"),
    (Join-Path $finalPath "run-projectorz"),
    (Join-Path $finalPath "tools"),
    $finalPath
)

$toolsPath = $null
foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        # Chercher gradio ou un script de lancement
        $gradioScript = Get-ChildItem -Path $path -Filter "*gradio*.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($gradioScript) {
            $toolsPath = $gradioScript.DirectoryName
            break
        }
    }
}

if (-not $toolsPath) {
    Write-Host "⚠️  Script de lancement non trouvé automatiquement" -ForegroundColor Yellow
    Write-Host "   Le dossier extrait est: $finalPath" -ForegroundColor Gray
    Write-Host "   Vous devrez peut-être ajuster le script de démarrage manuellement" -ForegroundColor Yellow
    $toolsPath = $finalPath
}

Write-Host "✅ Chemin trouvé: $toolsPath" -ForegroundColor Green
Write-Host ""

# Mettre à jour le script de démarrage
Write-Host "📝 Mise à jour du script de démarrage..." -ForegroundColor Cyan

$startScript = @"
# Script pour démarrer Hunyuan 3D sur le port 8888
# Version: Hunyuan3D-2-WinPortable v4-cu129 (Hunyuan3D-2.1)
Write-Host "🚀 Démarrage de Hunyuan 3D sur le port 8888..." -ForegroundColor Cyan

# Chemin vers le dossier de Hunyuan 3D (nouvelle version)
`$hunyuanPath = Join-Path `$PSScriptRoot "Hunyuan3D2_WinPortable_cu129\Hunyuan3D2_WinPortable"
`$hunyuanPath = Resolve-Path `$hunyuanPath -ErrorAction SilentlyContinue

# Fallback vers l'ancienne version si la nouvelle n'existe pas
if (-not `$hunyuanPath) {
    `$hunyuanPath = Join-Path `$PSScriptRoot "v16_hunyuan2-stableprojectorz"
    `$hunyuanPath = Resolve-Path `$hunyuanPath -ErrorAction SilentlyContinue
}

if (-not `$hunyuanPath) {
    Write-Host "❌ Erreur: Impossible de trouver Hunyuan 3D" -ForegroundColor Red
    Write-Host "   Chemins recherchés:" -ForegroundColor Yellow
    Write-Host "   - `$PSScriptRoot\Hunyuan3D2_WinPortable_cu129\Hunyuan3D2_WinPortable" -ForegroundColor Gray
    Write-Host "   - `$PSScriptRoot\v16_hunyuan2-stableprojectorz" -ForegroundColor Gray
    exit 1
}

# Chercher le script de lancement
`$toolsPath = `$null
`$possibleScripts = @(
    (Join-Path `$hunyuanPath "run-browser\run-gradio-turbo-multiview.bat"),
    (Join-Path `$hunyuanPath "run-projectorz\run-stableprojectorz-turbo-multiview.bat"),
    (Join-Path `$hunyuanPath "tools\gradio-internal.bat"),
    (Get-ChildItem -Path `$hunyuanPath -Filter "*gradio*.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName
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
    # Essayer d'abord avec le script de la nouvelle version
    `$launchScript = Get-ChildItem -Path `$toolsPath -Filter "*gradio*.bat" -ErrorAction SilentlyContinue | Select-Object -First 1
    
    if (`$launchScript) {
        `$scriptPath = `$launchScript.FullName
        Write-Host "   Script: `$(`$launchScript.Name)" -ForegroundColor Gray
        
        # Commande pour la nouvelle version (peut nécessiter ajustement)
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

# Nettoyer les fichiers temporaires
Write-Host "🧹 Nettoyage des fichiers temporaires..." -ForegroundColor Cyan
if (Test-Path "extract_temp.py") { Remove-Item "extract_temp.py" -Force -ErrorAction SilentlyContinue }
if (Test-Path "extract_temp2.py") { Remove-Item "extract_temp2.py" -Force -ErrorAction SilentlyContinue }
if (Test-Path "extract_temp3.py") { Remove-Item "extract_temp3.py" -Force -ErrorAction SilentlyContinue }
if (Test-Path "extract_temp4.py") { Remove-Item "extract_temp4.py" -Force -ErrorAction SilentlyContinue }

Write-Host ""
Write-Host "🎉 Installation terminée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Dossier d'installation: $finalPath" -ForegroundColor Cyan
Write-Host "🚀 Pour démarrer: .\start-hunyuan3d.ps1" -ForegroundColor White
Write-Host ""

