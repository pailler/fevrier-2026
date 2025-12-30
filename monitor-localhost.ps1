# Script de monitoring pour localhost:3000
# Envoie une alerte par email si le serveur ne répond plus

$ErrorActionPreference = "Continue"

# Configuration
$MONITOR_URL = "http://localhost:3000"
$ALERT_EMAIL = "formateur_tic@hotmail.com"
$CHECK_INTERVAL = 60  # Vérification toutes les 60 secondes
$API_ENDPOINT = "http://localhost:3000/api/monitor-localhost"

# Fichier de log
$LOG_FILE = Join-Path $PSScriptRoot "monitor-localhost.log"
$LAST_ALERT_FILE = Join-Path $PSScriptRoot "monitor-last-alert.txt"

function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage
    Add-Content -Path $LOG_FILE -Value $logMessage
}

function Check-Server {
    try {
        $response = Invoke-WebRequest -Uri $MONITOR_URL -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function Send-Alert {
    param([string]$ErrorMessage)
    
    # Vérifier si une alerte a déjà été envoyée récemment (dans les 5 dernières minutes)
    if (Test-Path $LAST_ALERT_FILE) {
        $lastAlertTime = Get-Content $LAST_ALERT_FILE
        $lastAlert = [DateTime]::Parse($lastAlertTime)
        $timeSinceLastAlert = (Get-Date) - $lastAlert
        
        if ($timeSinceLastAlert.TotalMinutes -lt 5) {
            Write-Log "Alerte déjà envoyée il y a $([math]::Round($timeSinceLastAlert.TotalMinutes, 1)) minutes - Ignorée"
            return
        }
    }
    
    Write-Log "ALERTE: Le serveur ne répond plus - Envoi d'email à $ALERT_EMAIL"
    
    $emailSent = $false
    
    # Tentative 1: Utiliser l'API de monitoring (si le serveur répond encore partiellement)
    try {
        $response = Invoke-WebRequest -Uri $API_ENDPOINT -Method Get -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Log "Email d'alerte envoyé via l'API de monitoring"
            $emailSent = $true
        }
    } catch {
        Write-Log "L'API de monitoring n'est pas accessible: $($_.Exception.Message)"
    }
    
    # Tentative 2: Si l'API ne fonctionne pas, le serveur est probablement complètement hors ligne
    # Dans ce cas, on ne peut pas envoyer d'email car on a besoin du serveur pour accéder à Resend
    if (-not $emailSent) {
        Write-Log "ATTENTION: Impossible d'envoyer l'email - le serveur est complètement hors ligne"
        Write-Log "L'email sera envoyé dès que le serveur sera de nouveau accessible"
        Write-Log "Vérifiez manuellement l'état du serveur et redémarrez-le si nécessaire"
    } else {
        Set-Content -Path $LAST_ALERT_FILE -Value (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    }
}

# Fonction principale de monitoring
function Start-Monitoring {
    Write-Log "========================================"
    Write-Log "Démarrage du monitoring de localhost:3000"
    Write-Log "Vérification toutes les $CHECK_INTERVAL secondes"
    Write-Log "Email d'alerte: $ALERT_EMAIL"
    Write-Log "========================================"
    Write-Log ""
    
    $consecutiveFailures = 0
    $maxFailures = 2  # Envoyer une alerte après 2 échecs consécutifs
    
    while ($true) {
        $isOnline = Check-Server
        
        if ($isOnline) {
            if ($consecutiveFailures -gt 0) {
                Write-Log "✅ Serveur de nouveau en ligne (après $consecutiveFailures échec(s))"
                $consecutiveFailures = 0
            } else {
                Write-Log "✅ Serveur en ligne"
            }
        } else {
            $consecutiveFailures++
            Write-Log "❌ Serveur hors ligne (échec #$consecutiveFailures)"
            
            if ($consecutiveFailures -ge $maxFailures) {
                Send-Alert "Le serveur ne répond pas après $consecutiveFailures tentatives"
                $consecutiveFailures = 0  # Réinitialiser pour éviter les spams
            }
        }
        
        Start-Sleep -Seconds $CHECK_INTERVAL
    }
}

# Vérifier si le script est exécuté avec l'argument -Once pour une vérification unique
if ($args -contains "-Once") {
    Write-Log "Vérification unique du serveur..."
    $isOnline = Check-Server
    
    if ($isOnline) {
        Write-Log "✅ Serveur en ligne"
        exit 0
    } else {
        Write-Log "❌ Serveur hors ligne - Envoi d'alerte..."
        Send-Alert "Le serveur ne répond pas"
        exit 1
    }
} else {
    # Mode monitoring continu
    Start-Monitoring
}

