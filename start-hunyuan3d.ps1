# Script pour démarrer Hunyuan 3D sur le port 8888
# Version: Hunyuan3D-2-stable-projectorz SPZ (4 mars 2025)
Write-Host "🚀 Démarrage de Hunyuan 3D sur le port 8888..." -ForegroundColor Cyan

# Chemin vers le dossier de Hunyuan 3D (version SPZ)
$hunyuanPath = Join-Path $PSScriptRoot "hunyuan2-spz"
$hunyuanPath = Resolve-Path $hunyuanPath -ErrorAction SilentlyContinue

# Fallback vers l'ancienne version si la nouvelle n'existe pas
if (-not $hunyuanPath) {
    $hunyuanPath = Join-Path $PSScriptRoot "v16_hunyuan2-stableprojectorz"
    $hunyuanPath = Resolve-Path $hunyuanPath -ErrorAction SilentlyContinue
}

if (-not $hunyuanPath) {
    Write-Host "❌ Erreur: Impossible de trouver Hunyuan 3D" -ForegroundColor Red
    Write-Host "   Chemins recherchés:" -ForegroundColor Yellow
    Write-Host "   - $PSScriptRoot\hunyuan2-spz" -ForegroundColor Gray
    Write-Host "   - $PSScriptRoot\v16_hunyuan2-stableprojectorz" -ForegroundColor Gray
    exit 1
}

# Chercher le script de lancement (priorité au script recommandé)
$toolsPath = $null
$launchScript = $null

# Priorité 1: Script recommandé Gradio (interface web pour navigateur)
$recommendedGradio = Join-Path $hunyuanPath "run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
if (Test-Path $recommendedGradio) {
    $launchScript = $recommendedGradio
    $toolsPath = Split-Path $recommendedGradio
}

# Priorité 2: Script recommandé StableProjectorz (API pour StableProjectorz)
if (-not $launchScript) {
    $recommendedSPZ = Join-Path $hunyuanPath "run-projectorz_(faster)\run-stableprojectorz-turbo-multiview-RECOMMENDED.bat"
    if (Test-Path $recommendedSPZ) {
        $launchScript = $recommendedSPZ
        $toolsPath = Split-Path $recommendedSPZ
    }
}

# Priorité 3: Autres scripts disponibles
if (-not $launchScript) {
    $possibleScripts = @(
        (Get-ChildItem -Path $hunyuanPath -Filter "*RECOMMENDED*.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName,
        (Get-ChildItem -Path $hunyuanPath -Filter "*run*.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName,
        (Get-ChildItem -Path $hunyuanPath -Filter "*gradio*.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1).FullName,
        (Join-Path $hunyuanPath "tools\gradio-internal.bat")
    )
    
    foreach ($script in $possibleScripts) {
        if ($script -and (Test-Path $script)) {
            $launchScript = $script
            $toolsPath = Split-Path $script
            break
        }
    }
}

if (-not $toolsPath) {
    Write-Host "❌ Erreur: Script de lancement non trouvé" -ForegroundColor Red
    Write-Host "   Dossier: $hunyuanPath" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Chemin trouvé: $toolsPath" -ForegroundColor Green

# Vérifier si le port 8888 est déjà utilisé
$portInUse = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "⚠️  Le port 8888 est déjà utilisé" -ForegroundColor Yellow
    Write-Host "   Processus: $($portInUse.OwningProcess)" -ForegroundColor Gray
    Write-Host "   Hunyuan 3D est peut-être déjà en cours d'exécution" -ForegroundColor Gray
    exit 0
}

# Changer vers le dossier tools
Set-Location $toolsPath

Write-Host "🔄 Démarrage du service Hunyuan 3D..." -ForegroundColor Yellow
Write-Host "   Port: 8888" -ForegroundColor Gray
Write-Host "   Host: 0.0.0.0" -ForegroundColor Gray
if ($launchScript) {
    Write-Host "   Script: $(Split-Path $launchScript -Leaf)" -ForegroundColor Gray
}
Write-Host ""

# Démarrer Hunyuan 3D sur le port 8888
try {
    if ($launchScript) {
        # Les scripts .bat de cette version gèrent déjà le port, on les lance directement
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$launchScript`"" -WorkingDirectory $toolsPath -WindowStyle Minimized
    } else {
        # Fallback: commande directe avec gradio-internal
        Write-Host "   Utilisation de gradio-internal.bat" -ForegroundColor Gray
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "gradio-internal.bat --port 8888 --host 0.0.0.0 --model_path tencent/Hunyuan3D-2mv --subfolder hunyuan3d-dit-v2-mv-turbo --texgen_model_path tencent/Hunyuan3D-2 --low_vram_mode --enable_flashvdm --enable_t23d" -WorkingDirectory $toolsPath -WindowStyle Minimized
    }
    
    Write-Host "✅ Commande de démarrage exécutée" -ForegroundColor Green
    Write-Host "⏳ Attente du démarrage du service (30 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    # Vérifier si le service est accessible
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Service Hunyuan 3D accessible sur http://localhost:8888" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Service non encore accessible. Le chargement des modèles peut prendre plusieurs minutes." -ForegroundColor Yellow
        Write-Host "   Vérifiez la fenêtre de commande pour voir les logs." -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage de Hunyuan 3D: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌐 URLs d'accès:" -ForegroundColor Cyan
Write-Host "   • Local: http://localhost:8888" -ForegroundColor White
Write-Host "   • Production: https://hunyuan3d.iahome.fr" -ForegroundColor White
Write-Host ""
