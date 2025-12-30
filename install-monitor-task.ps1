# Script pour installer le monitoring comme tâche planifiée Windows

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION TACHE PLANIFIEE" -ForegroundColor Cyan
Write-Host "  Monitoring localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$scriptPath = Join-Path $PSScriptRoot "monitor-localhost.ps1"

if (-not (Test-Path $scriptPath)) {
    Write-Host "ERREUR: Script monitor-localhost.ps1 introuvable" -ForegroundColor Red
    Write-Host "Chemin attendu: $scriptPath" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Script trouvé: $scriptPath" -ForegroundColor Green
Write-Host ""

# Vérifier les privilèges administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ATTENTION: Les privilèges administrateur sont requis pour créer une tâche planifiée" -ForegroundColor Yellow
    Write-Host "Relancez ce script en tant qu'administrateur" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Vous pouvez exécuter le monitoring manuellement avec:" -ForegroundColor Cyan
    Write-Host "  .\monitor-localhost.ps1" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

# Nom de la tâche
$taskName = "IAHome-Monitor-Localhost"

# Vérifier si la tâche existe déjà
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($existingTask) {
    Write-Host "La tâche '$taskName' existe déjà" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous la supprimer et la recréer? (O/N)"
    if ($response -eq "O" -or $response -eq "o") {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
        Write-Host "Tâche supprimée" -ForegroundColor Green
    } else {
        Write-Host "Installation annulée" -ForegroundColor Yellow
        pause
        exit 0
    }
}

Write-Host "Création de la tâche planifiée..." -ForegroundColor Yellow

# Créer l'action (exécuter le script PowerShell)
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-ExecutionPolicy Bypass -File `"$scriptPath`""

# Créer le déclencheur (au démarrage + toutes les 5 minutes)
$trigger1 = New-ScheduledTaskTrigger -AtStartup
$trigger2 = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Minutes 5) -RepetitionDuration (New-TimeSpan -Days 365)

# Paramètres de la tâche
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Principal (exécuter en tant qu'utilisateur actuel)
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Highest

# Créer la tâche
try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger @($trigger1, $trigger2) -Settings $settings -Principal $principal -Description "Monitoring de localhost:3000 - Envoie une alerte par email si le serveur ne répond plus" | Out-Null
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  TACHE PLANIFIEE INSTALLEE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Nom de la tâche: $taskName" -ForegroundColor Cyan
    Write-Host "Démarrage: Au démarrage de Windows" -ForegroundColor White
    Write-Host "Vérification: Toutes les 5 minutes" -ForegroundColor White
    Write-Host "Email d'alerte: formateur_tic@hotmail.com" -ForegroundColor White
    Write-Host ""
    Write-Host "Pour démarrer la tâche maintenant:" -ForegroundColor Yellow
    Write-Host "  Start-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
    Write-Host ""
    Write-Host "Pour arrêter la tâche:" -ForegroundColor Yellow
    Write-Host "  Stop-ScheduledTask -TaskName '$taskName'" -ForegroundColor White
    Write-Host ""
    Write-Host "Pour supprimer la tâche:" -ForegroundColor Yellow
    Write-Host "  Unregister-ScheduledTask -TaskName '$taskName' -Confirm:`$false" -ForegroundColor White
    Write-Host ""
    
    # Démarrer la tâche maintenant
    $startNow = Read-Host "Voulez-vous démarrer la tâche maintenant? (O/N)"
    if ($startNow -eq "O" -or $startNow -eq "o") {
        Start-ScheduledTask -TaskName $taskName
        Write-Host "Tâche démarrée" -ForegroundColor Green
    }
    
} catch {
    Write-Host ""
    Write-Host "ERREUR lors de la création de la tâche:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Exécutez manuellement le monitoring avec:" -ForegroundColor Yellow
    Write-Host "  .\monitor-localhost.ps1" -ForegroundColor White
    Write-Host ""
}

pause


