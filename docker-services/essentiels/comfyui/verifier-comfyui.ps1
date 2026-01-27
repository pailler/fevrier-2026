# Script de diagnostic pour ComfyUI dans Stability Matrix
# Vérifie si ComfyUI démarre correctement après les messages de chemins

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Diagnostic ComfyUI - Stability Matrix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier si le port 8200 est en écoute (ou 8188)
Write-Host "[1/5] Vérification des ports ComfyUI..." -ForegroundColor Yellow
$port8200 = netstat -ano | findstr :8200
$port8188 = netstat -ano | findstr :8188
if ($port8200) {
    Write-Host "   [OK] Le port 8200 est en écoute (port actuel)" -ForegroundColor Green
    Write-Host "   $port8200" -ForegroundColor Gray
    $comfyuiPort = 8200
} elseif ($port8188) {
    Write-Host "   [OK] Le port 8188 est en écoute (ancien port)" -ForegroundColor Yellow
    Write-Host "   $port8188" -ForegroundColor Gray
    $comfyuiPort = 8188
} else {
    Write-Host "   [ERREUR] Aucun port ComfyUI (8200 ou 8188) n'est en écoute" -ForegroundColor Red
    Write-Host "   ComfyUI n'a probablement pas démarré complètement" -ForegroundColor Yellow
    $comfyuiPort = 0
}
Write-Host ""

# 2. Tester la connexion HTTP
Write-Host "[2/5] Test de connexion HTTP..." -ForegroundColor Yellow
if ($comfyuiPort -gt 0) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$comfyuiPort" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        Write-Host "   [OK] ComfyUI répond sur http://localhost:$comfyuiPort" -ForegroundColor Green
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    } catch {
        Write-Host "   [ERREUR] Impossible de se connecter à ComfyUI sur le port $comfyuiPort" -ForegroundColor Red
        Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   ComfyUI n'est probablement pas démarré ou bloque" -ForegroundColor Yellow
    }
} else {
    Write-Host "   [SKIP] Aucun port détecté, test de connexion ignoré" -ForegroundColor Yellow
}
Write-Host ""

# 3. Vérifier les processus Python
Write-Host "[3/5] Vérification des processus Python..." -ForegroundColor Yellow
$pythonProcesses = Get-Process | Where-Object {$_.ProcessName -like "*python*"} -ErrorAction SilentlyContinue
if ($pythonProcesses) {
    Write-Host "   [OK] Processus Python trouvés:" -ForegroundColor Green
    $pythonProcesses | ForEach-Object {
        Write-Host "   - $($_.ProcessName) (PID: $($_.Id), Démarrage: $($_.StartTime))" -ForegroundColor Gray
    }
} else {
    Write-Host "   [ATTENTION] Aucun processus Python trouvé" -ForegroundColor Yellow
    Write-Host "   ComfyUI utilise Python, il devrait y avoir un processus" -ForegroundColor Yellow
}
Write-Host ""

# 4. Vérifier les fichiers ComfyUI
Write-Host "[4/5] Vérification des fichiers ComfyUI..." -ForegroundColor Yellow
$comfyuiPath = "C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Packages\ComfyUI"
if (Test-Path $comfyuiPath) {
    Write-Host "   [OK] Dossier ComfyUI trouvé: $comfyuiPath" -ForegroundColor Green
    
    # Vérifier le fichier main.py
    $mainPy = Join-Path $comfyuiPath "main.py"
    if (Test-Path $mainPy) {
        Write-Host "   [OK] Fichier main.py trouvé" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] Fichier main.py manquant" -ForegroundColor Red
    }
} else {
    Write-Host "   [ERREUR] Dossier ComfyUI non trouvé" -ForegroundColor Red
    Write-Host "   Chemin recherché: $comfyuiPath" -ForegroundColor Yellow
}
Write-Host ""

# 5. Vérifier les logs Stability Matrix
Write-Host "[5/5] Vérification des logs Stability Matrix..." -ForegroundColor Yellow
$logsPath = "C:\Users\AAA\Documents\StabilityMatrix-win-x64\Logs"
if (Test-Path $logsPath) {
    $latestLog = Get-ChildItem -Path $logsPath -Filter "*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($latestLog) {
        Write-Host "   [OK] Dernier log trouvé: $($latestLog.Name)" -ForegroundColor Green
        Write-Host "   Vérifiez ce fichier pour les erreurs: $($latestLog.FullName)" -ForegroundColor Gray
    }
} else {
    Write-Host "   [ATTENTION] Dossier de logs non trouvé" -ForegroundColor Yellow
}
Write-Host ""

# Résumé
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RÉSUMÉ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($comfyuiPort -gt 0 -and $response) {
    Write-Host "[SUCCÈS] ComfyUI semble fonctionner correctement !" -ForegroundColor Green
    Write-Host "   - Port $comfyuiPort en écoute: OK" -ForegroundColor Green
    Write-Host "   - Interface web accessible: OK" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Accédez à ComfyUI: http://localhost:$comfyuiPort" -ForegroundColor Cyan
} else {
    Write-Host "[PROBLÈME] ComfyUI ne démarre pas complètement" -ForegroundColor Red
    Write-Host ""
    Write-Host "Actions recommandées:" -ForegroundColor Yellow
    Write-Host "   1. Ouvrez Stability Matrix" -ForegroundColor White
    Write-Host "   2. Sélectionnez ComfyUI" -ForegroundColor White
    Write-Host "   3. Cliquez sur 'Logs' pour voir les erreurs complètes" -ForegroundColor White
    Write-Host "   4. Recherchez les lignes avec 'Error', 'Exception', 'Traceback'" -ForegroundColor White
    Write-Host "   5. Copiez les dernières lignes des logs pour diagnostic" -ForegroundColor White
    Write-Host ""
    Write-Host "   Les messages 'Adding extra search path' sont NORMALS" -ForegroundColor Cyan
    Write-Host "   Le problème se situe probablement APRÈS ces messages" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
