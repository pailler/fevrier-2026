# Script pour configurer Cloudflare Tunnel au démarrage automatique de Windows
# Utilise une tâche planifiée Windows pour démarrer cloudflared au démarrage

Write-Host "🚀 Configuration du démarrage automatique de Cloudflare" -ForegroundColor Cyan
Write-Host "======================================================`n" -ForegroundColor Cyan

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Ce script nécessite les droits administrateur." -ForegroundColor Yellow
    Write-Host "💡 Relancez PowerShell en tant qu'administrateur et réexécutez ce script." -ForegroundColor Gray
    Write-Host "`nAppuyez sur une touche pour quitter..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Chemins
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$cloudflaredExe = Join-Path $scriptDir "cloudflared.exe"
$configFile = Join-Path $scriptDir "cloudflare-active-config.yml"
$taskName = "IAHome-Cloudflare-Tunnel"
$logDir = Join-Path $scriptDir "logs"
$logFile = Join-Path $logDir "cloudflared-startup.log"

# Vérifier que cloudflared.exe existe
if (-not (Test-Path $cloudflaredExe)) {
    Write-Host "❌ cloudflared.exe introuvable : $cloudflaredExe" -ForegroundColor Red
    Write-Host "💡 Assurez-vous que cloudflared.exe est dans le répertoire du projet." -ForegroundColor Gray
    exit 1
}

# Vérifier que le fichier de configuration existe
if (-not (Test-Path $configFile)) {
    Write-Host "❌ Fichier de configuration introuvable : $configFile" -ForegroundColor Red
    Write-Host "💡 Assurez-vous que cloudflare-active-config.yml existe." -ForegroundColor Gray
    exit 1
}

# Créer le répertoire de logs si nécessaire
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    Write-Host "✅ Répertoire de logs créé : $logDir" -ForegroundColor Green
}

# Créer un script de démarrage
$startupScript = Join-Path $scriptDir "start-cloudflare-tunnel-auto.ps1"
$startupScriptContent = @"
# Script de démarrage automatique de Cloudflare Tunnel
# Généré automatiquement par setup-cloudflare-autostart.ps1

`$ErrorActionPreference = "Continue"
`$scriptDir = "$scriptDir"
`$logFile = "$logFile"

# Fonction de logging
function Write-Log {
    param([string]`$Message)
    `$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    `$logMessage = "[`$timestamp] `$Message"
    Add-Content -Path `$logFile -Value `$logMessage
    Write-Host `$logMessage
}

Write-Log "🚀 Démarrage automatique de Cloudflare Tunnel"

# Attendre que Windows soit complètement démarré
Start-Sleep -Seconds 30

# Vérifier si cloudflared est déjà en cours d'exécution
`$existingProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if (`$existingProcess) {
    Write-Log "⚠️  Cloudflared est déjà en cours d'exécution (PID: `$(`$existingProcess.Id))"
    exit 0
}

# Vérifier que les services locaux sont prêts
Write-Log "⏳ Attente des services locaux..."
Start-Sleep -Seconds 10

# Démarrer cloudflared
Write-Log "🚀 Démarrage de cloudflared..."
try {
    `$cloudflaredPath = Join-Path `$scriptDir "cloudflared.exe"
    `$configPath = Join-Path `$scriptDir "cloudflare-active-config.yml"
    
    Start-Process -FilePath `$cloudflaredPath -ArgumentList "tunnel", "--config", `$configPath, "run" -WindowStyle Hidden -ErrorAction Stop
    
    Start-Sleep -Seconds 5
    
    # Vérifier que le processus a démarré
    `$process = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if (`$process) {
        Write-Log "✅ Cloudflared démarré avec succès (PID: `$(`$process.Id))"
    } else {
        Write-Log "❌ Échec du démarrage de cloudflared"
        exit 1
    }
} catch {
    Write-Log "❌ Erreur lors du démarrage de cloudflared: `$(`$_.Exception.Message)"
    exit 1
}

Write-Log "✅ Cloudflare Tunnel opérationnel"
"@

# Écrire le script de démarrage
Set-Content -Path $startupScript -Value $startupScriptContent -Encoding UTF8
Write-Host "✅ Script de démarrage créé : $startupScript" -ForegroundColor Green

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
        -Description "Démarre automatiquement Cloudflare Tunnel au démarrage de Windows pour IAHome" `
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
Write-Host "   ✅ Tâche planifiée créée : $taskName" -ForegroundColor Green
Write-Host "   ✅ Script de démarrage : $startupScript" -ForegroundColor Green
Write-Host "   ✅ Fichier de configuration : $configFile" -ForegroundColor Green
Write-Host "   ✅ Fichier de logs : $logFile" -ForegroundColor Green
Write-Host "`n💡 La tâche démarrera automatiquement au prochain démarrage de Windows." -ForegroundColor Yellow
Write-Host "💡 Pour tester immédiatement, exécutez :" -ForegroundColor Gray
Write-Host "   Start-ScheduledTask -TaskName `"$taskName`"" -ForegroundColor Gray
Write-Host "`n💡 Pour désactiver le démarrage automatique :" -ForegroundColor Gray
Write-Host "   Unregister-ScheduledTask -TaskName `"$taskName`" -Confirm:`$false" -ForegroundColor Gray
Write-Host ""

# Proposer de tester maintenant
$testNow = Read-Host "Voulez-vous tester le démarrage maintenant ? (O/N)"
if ($testNow -eq "O" -or $testNow -eq "o") {
    Write-Host "`n🧪 Test du démarrage..." -ForegroundColor Cyan
    try {
        Start-ScheduledTask -TaskName $taskName -ErrorAction Stop
        Write-Host "✅ Tâche démarrée avec succès!" -ForegroundColor Green
        Write-Host "⏳ Attente de 10 secondes pour vérifier..." -ForegroundColor Gray
        Start-Sleep -Seconds 10
        
        $process = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "✅ Cloudflared est en cours d'exécution (PID: $($process.Id))" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Cloudflared ne semble pas avoir démarré. Vérifiez les logs : $logFile" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Erreur lors du démarrage de la tâche : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""


