# Script pour configurer Hunyuan3D Gradio au démarrage automatique via tâche planifiée Windows
# Version: 1.0

Write-Host "🚀 Configuration du démarrage automatique de Hunyuan3D Gradio..." -ForegroundColor Cyan
Write-Host ""

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Ce script nécessite les droits administrateur." -ForegroundColor Yellow
    Write-Host "💡 Relancez PowerShell en tant qu'administrateur et réexécutez ce script." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Appuyez sur une touche pour quitter..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Chemins
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$gradioScript = Join-Path $scriptDir "hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"

# Fallback vers l'ancienne version si la nouvelle n'existe pas
if (-not (Test-Path $gradioScript)) {
    $gradioScript = Join-Path $scriptDir "v16_hunyuan2-stableprojectorz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
}

if (-not (Test-Path $gradioScript)) {
    Write-Host "❌ Script Gradio introuvable" -ForegroundColor Red
    Write-Host "   Chemins recherchés:" -ForegroundColor Yellow
    Write-Host "   - $scriptDir\hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat" -ForegroundColor Gray
    Write-Host "   - $scriptDir\v16_hunyuan2-stableprojectorz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Script Gradio trouvé: $gradioScript" -ForegroundColor Green
Write-Host ""

# Créer un script PowerShell de démarrage
$startupScript = Join-Path $scriptDir "start-hunyuan3d-gradio-auto.ps1"
$workingDir = Split-Path $gradioScript

$startupScriptContent = @"
# Script de démarrage automatique de Hunyuan3D Gradio
# Généré automatiquement par setup-hunyuan3d-autostart-task.ps1

`$scriptPath = "$gradioScript"
`$workingDir = "$workingDir"

# Fonction de log
function Write-Log {
    param([string]`$message)
    `$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    `$logFile = Join-Path `$PSScriptRoot "logs\hunyuan3d-startup.log"
    `$logDir = Split-Path `$logFile
    if (-not (Test-Path `$logDir)) {
        New-Item -ItemType Directory -Path `$logDir -Force | Out-Null
    }
    `$logMessage = "[`$timestamp] `$message"
    Add-Content -Path `$logFile -Value `$logMessage
    Write-Host `$logMessage
}

Write-Log "🚀 Démarrage automatique de Hunyuan3D Gradio..."

# Attendre que Windows soit complètement démarré
Write-Log "⏳ Attente de 60 secondes pour le démarrage complet de Windows..."
Start-Sleep -Seconds 60

# Vérifier si le port 8888 est déjà utilisé
`$portInUse = netstat -ano | findstr ":8888"
if (`$portInUse) {
    # Vérifier si c'est l'API ou Gradio
    try {
        `$response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 3 -ErrorAction Stop
        if (`$response.Content -match '{"message"|"API"|"StableProjectorz"|"status"') {
            Write-Log "⚠️  API détectée sur le port 8888, arrêt..."
            `$portProcess = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
            if (`$portProcess) {
                Stop-Process -Id `$portProcess -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 5
                Write-Log "✅ API arrêtée"
            }
        } else {
            Write-Log "✅ Interface Gradio déjà en cours d'exécution"
            exit 0
        }
    } catch {
        Write-Log "⚠️  Port 8888 utilisé mais vérification impossible"
        exit 0
    }
}

# Démarrer le script Gradio
Write-Log "🚀 Démarrage de l'interface Gradio..."
try {
    Set-Location `$workingDir
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"`$scriptPath`"" -WindowStyle Minimized -ErrorAction Stop
    
    Start-Sleep -Seconds 10
    
    # Vérifier que le processus a démarré
    `$portCheck = netstat -ano | findstr ":8888"
    if (`$portCheck) {
        Write-Log "✅ Commande de démarrage exécutée (le chargement peut prendre plusieurs minutes)"
    } else {
        Write-Log "⚠️  Commande exécutée mais port pas encore en écoute (normal, chargement en cours)"
    }
} catch {
    Write-Log "❌ Erreur lors du démarrage: `$(`$_.Exception.Message)"
    exit 1
}

Write-Log "✅ Hunyuan3D Gradio démarrage initié"
"@

# Créer le répertoire de logs si nécessaire
$logDir = Join-Path $scriptDir "logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Écrire le script de démarrage
Set-Content -Path $startupScript -Value $startupScriptContent -Encoding UTF8
Write-Host "✅ Script de démarrage créé : $startupScript" -ForegroundColor Green

# Nom de la tâche
$taskName = "IAHome-Hunyuan3D-Gradio"

# Supprimer la tâche existante si elle existe
Write-Host "`n1️⃣ Vérification de la tâche planifiée existante..." -ForegroundColor Yellow
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "   🗑️  Suppression de la tâche existante..." -ForegroundColor Gray
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Tâche existante supprimée" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Aucune tâche existante trouvée" -ForegroundColor Gray
}

# Créer la tâche planifiée
Write-Host "`n2️⃣ Création de la tâche planifiée..." -ForegroundColor Yellow

# Action : exécuter le script PowerShell
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$startupScript`"" `
    -WorkingDirectory $scriptDir

# Déclencheur : au démarrage de Windows
$trigger = New-ScheduledTaskTrigger -AtStartup

# Paramètres de la tâche
$settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

# Principal : exécuter avec les privilèges de l'utilisateur actuel
$principal = New-ScheduledTaskPrincipal `
    -UserId "$env:USERDOMAIN\$env:USERNAME" `
    -LogonType Interactive `
    -RunLevel Highest

# Créer la tâche
try {
    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Settings $settings `
        -Principal $principal `
        -Description "Démarre automatiquement Hunyuan3D (interface Gradio) au démarrage de Windows" `
        -ErrorAction Stop | Out-Null
    
    Write-Host "   ✅ Tâche planifiée créée avec succès!" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors de la création de la tâche : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Vérifier que la tâche a été créée
Write-Host "`n3️⃣ Vérification de la tâche..." -ForegroundColor Yellow
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($task) {
    Write-Host "   ✅ Tâche trouvée : $($task.TaskName)" -ForegroundColor Green
    Write-Host "   📋 État : $($task.State)" -ForegroundColor Gray
    Write-Host "   👤 Utilisateur : $($task.Principal.UserId)" -ForegroundColor Gray
} else {
    Write-Host "   ❌ La tâche n'a pas été créée correctement" -ForegroundColor Red
    exit 1
}

# Afficher les informations
Write-Host "`n📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Tâche planifiée créée : $taskName" -ForegroundColor White
Write-Host "   ✅ Script de démarrage : $startupScript" -ForegroundColor White
Write-Host "   ✅ Script Gradio : $gradioScript" -ForegroundColor White
Write-Host "   ✅ Logs : $logDir\hunyuan3d-startup.log" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Configuration terminée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Le service démarrera automatiquement au prochain démarrage de Windows" -ForegroundColor Yellow
Write-Host "   Vous pouvez tester en exécutant : .\start-hunyuan3d-gradio-auto.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Pour désactiver le démarrage automatique:" -ForegroundColor Yellow
Write-Host "   .\remove-hunyuan3d-autostart-task.ps1" -ForegroundColor Gray
Write-Host ""


