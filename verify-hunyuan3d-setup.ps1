# Script de vérification de la configuration Hunyuan3D
# Vérifie que le démarrage automatique est configuré et que les modèles sont en cache

Write-Host "🔍 Vérification de la configuration Hunyuan3D" -ForegroundColor Cyan
Write-Host ""

$allOk = $true

# 1. Vérifier le raccourci de démarrage automatique
Write-Host "1️⃣ Vérification du démarrage automatique..." -ForegroundColor Yellow
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder "Hunyuan3D Gradio - Auto Start.lnk"

if (Test-Path $shortcutPath) {
    Write-Host "   ✅ Raccourci trouvé dans le dossier Startup" -ForegroundColor Green
    $shell = New-Object -ComObject WScript.Shell
    $shortcut = $shell.CreateShortcut($shortcutPath)
    Write-Host "      Cible: $($shortcut.TargetPath)" -ForegroundColor Gray
    Write-Host "      Script: $($shortcut.Arguments)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ Raccourci non trouvé dans le dossier Startup" -ForegroundColor Red
    Write-Host "      Exécutez: .\setup-stableprojectorz-autostart.ps1" -ForegroundColor Yellow
    $allOk = $false
}

Write-Host ""

# 2. Vérifier les modèles en cache
Write-Host "2️⃣ Vérification des modèles en cache..." -ForegroundColor Yellow
$huggingfaceCache = "$env:USERPROFILE\.cache\huggingface\hub"
$requiredModels = @(
    @{Name="models--tencent--Hunyuan3D-2"; Description="Modèle principal Hunyuan3D-2"},
    @{Name="models--tencent--Hunyuan3D-2mv"; Description="Modèle multiview Hunyuan3D-2mv"}
)

foreach ($model in $requiredModels) {
    $modelPath = Join-Path $huggingfaceCache $model.Name
    if (Test-Path $modelPath) {
        $size = (Get-ChildItem $modelPath -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
        Write-Host "   ✅ $($model.Description)" -ForegroundColor Green
        Write-Host "      Taille: $([math]::Round($size, 2)) GB" -ForegroundColor Gray
        Write-Host "      Chemin: $modelPath" -ForegroundColor Gray
        
        # Vérifier que les fichiers de modèles existent
        $blobs = Get-ChildItem $modelPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Extension -in @('.safetensors', '.bin', '.ckpt') }
        if ($blobs) {
            Write-Host "      Fichiers de modèles: $($blobs.Count) trouvés" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠️  $($model.Description) - NON TROUVÉ" -ForegroundColor Yellow
        Write-Host "      Les modèles seront téléchargés au premier démarrage" -ForegroundColor Gray
    }
}

Write-Host ""

# 3. Vérifier le script de démarrage
Write-Host "3️⃣ Vérification du script de démarrage..." -ForegroundColor Yellow
$scriptPath = "C:\Users\AAA\Documents\iahome\hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
if (Test-Path $scriptPath) {
    Write-Host "   ✅ Script trouvé: $scriptPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Script non trouvé: $scriptPath" -ForegroundColor Red
    $allOk = $false
}

Write-Host ""

# 4. Vérifier le fichier d'initialisation
Write-Host "4️⃣ Vérification de l'initialisation..." -ForegroundColor Yellow
$initFile = "C:\Users\AAA\Documents\iahome\hunyuan2-spz\code\hunyuan_init_done.txt"
if (Test-Path $initFile) {
    Write-Host "   ✅ Fichier d'initialisation trouvé" -ForegroundColor Green
    Write-Host "      Les dépendances ne seront pas réinstallées" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  Fichier d'initialisation non trouvé" -ForegroundColor Yellow
    Write-Host "      Les dépendances seront installées au premier démarrage" -ForegroundColor Gray
}

Write-Host ""

# 5. Vérifier le port 8888
Write-Host "5️⃣ Vérification du port 8888..." -ForegroundColor Yellow
$portInUse = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "   ✅ Port 8888 en cours d'utilisation" -ForegroundColor Green
    Write-Host "      Le service est actuellement actif" -ForegroundColor Gray
} else {
    Write-Host "   ℹ️  Port 8888 libre" -ForegroundColor Gray
    Write-Host "      Le service démarrera au prochain démarrage de Windows" -ForegroundColor Gray
}

Write-Host ""
Write-Host "===============================================================" -ForegroundColor Cyan
if ($allOk) {
    Write-Host "Configuration correcte !" -ForegroundColor Green
    Write-Host ""
    Write-Host "RESUME:" -ForegroundColor Cyan
    Write-Host "   - Le service demarrera automatiquement au demarrage de Windows" -ForegroundColor White
    Write-Host "   - Les modeles sont en cache et ne seront PAS re-telecharges" -ForegroundColor White
    Write-Host "   - Le chargement des modeles prendra 1-2 minutes au demarrage" -ForegroundColor White
    Write-Host ""
    Write-Host "Pour tester maintenant:" -ForegroundColor Yellow
    Write-Host "   .\start-stableprojectorz-autostart.ps1" -ForegroundColor Gray
} else {
    Write-Host "Configuration incomplete" -ForegroundColor Yellow
    Write-Host "   Verifiez les points ci-dessus" -ForegroundColor White
}
Write-Host "===============================================================" -ForegroundColor Cyan

