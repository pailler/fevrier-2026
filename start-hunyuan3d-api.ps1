# Script pour démarrer Hunyuan 3D avec l'interface Gradio (application web) sur le port 8888
# Version: Hunyuan3D-2-stable-projectorz SPZ - Interface Gradio
# Utilise l'interface Gradio (application web) au lieu de l'API
Write-Host "🚀 Démarrage de Hunyuan 3D (Interface Gradio) sur le port 8888..." -ForegroundColor Cyan

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

# Chercher le script de lancement Gradio (interface web) - PRIORITÉ au script Gradio
$toolsPath = $null
$launchScript = $null

# Priorité 1: Script recommandé Gradio (interface web dans le navigateur)
$recommendedGradio = Join-Path $hunyuanPath "run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
if (Test-Path $recommendedGradio) {
    $launchScript = $recommendedGradio
    $toolsPath = Split-Path $recommendedGradio
    Write-Host "✅ Script Gradio trouvé (interface web)" -ForegroundColor Green
}

# Priorité 2: Autres scripts Gradio disponibles
if (-not $launchScript) {
    $gradioScripts = Get-ChildItem -Path $hunyuanPath -Filter "*gradio*.bat" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*RECOMMENDED*" } | Select-Object -First 1
    if ($gradioScripts) {
        $launchScript = $gradioScripts.FullName
        $toolsPath = Split-Path $launchScript
        Write-Host "✅ Script Gradio alternatif trouvé" -ForegroundColor Green
    }
}

# Priorité 3: Fallback vers n'importe quel script Gradio
if (-not $launchScript) {
    $gradioScripts = Get-ChildItem -Path $hunyuanPath -Filter "*gradio*.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($gradioScripts) {
        $launchScript = $gradioScripts.FullName
        $toolsPath = Split-Path $launchScript
        Write-Host "✅ Script Gradio trouvé (fallback)" -ForegroundColor Green
    }
}

# Priorité 4: Script gradio-internal.bat direct
if (-not $launchScript) {
    $gradioInternal = Join-Path $hunyuanPath "tools\gradio-internal.bat"
    if (Test-Path $gradioInternal) {
        $launchScript = $gradioInternal
        $toolsPath = Split-Path $gradioInternal
        Write-Host "✅ Script gradio-internal.bat trouvé" -ForegroundColor Green
    }
}

if (-not $toolsPath) {
    Write-Host "❌ Erreur: Script de lancement StableProjectorz non trouvé" -ForegroundColor Red
    Write-Host "   Dossier: $hunyuanPath" -ForegroundColor Yellow
    Write-Host "   Recherche des scripts disponibles..." -ForegroundColor Yellow
    Get-ChildItem -Path $hunyuanPath -Filter "*.bat" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 5 FullName | ForEach-Object {
        Write-Host "     - $($_.FullName)" -ForegroundColor Gray
    }
    exit 1
}

Write-Host "✅ Chemin trouvé: $toolsPath" -ForegroundColor Green
Write-Host "   Script: $(Split-Path $launchScript -Leaf)" -ForegroundColor Gray

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

Write-Host "🔄 Démarrage du service Hunyuan 3D (interface Gradio)..." -ForegroundColor Yellow
Write-Host "   Port: 8888" -ForegroundColor Gray
Write-Host "   Host: 0.0.0.0" -ForegroundColor Gray
Write-Host "   Interface: Gradio (navigateur web)" -ForegroundColor Gray
Write-Host ""

# Démarrer Hunyuan 3D sur le port 8888 avec Gradio
try {
    if ($launchScript) {
        # Les scripts .bat de cette version gèrent déjà le port, on les lance directement
        Write-Host "   Lancement du script: $(Split-Path $launchScript -Leaf)" -ForegroundColor Gray
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
        Write-Host "   Interface Gradio chargée" -ForegroundColor Gray
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
Write-Host "💡 Note: L'interface Gradio sera accessible dans votre navigateur" -ForegroundColor Yellow
Write-Host ""

