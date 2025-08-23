# Script de configuration de l'accès distant sécurisé pour Cursor
# À exécuter sur le PC principal où Cursor est installé

param(
    [string]$Action = "setup",
    [string]$VpnServer = "",
    [string]$VpnUsername = "",
    [string]$VpnPassword = ""
)

# Configuration
$ScriptName = "Setup Remote Access for Cursor"
$LogFile = "C:\temp\remote-access-setup.log"

# Fonction de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

# Fonction pour vérifier les privilèges administrateur
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Fonction pour installer les fonctionnalités Windows
function Install-WindowsFeatures {
    Write-Log "Installation des fonctionnalités Windows nécessaires..."
    
    try {
        # Activer le Bureau à distance
        Enable-PSRemoting -Force
        Set-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server" -Name "fDenyTSConnections" -Value 0
        Enable-NetFirewallRule -DisplayGroup "Remote Desktop"
        
        Write-Log "Bureau à distance activé avec succès"
        
        # Installer OpenSSH si pas déjà installé
        $sshInstalled = Get-WindowsCapability -Online | Where-Object Name -like "OpenSSH*"
        if (-not $sshInstalled) {
            Write-Log "Installation d'OpenSSH..."
            Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
            Start-Service sshd
            Set-Service -Name sshd -StartupType 'Automatic'
            Write-Log "OpenSSH installé et démarré"
        } else {
            Write-Log "OpenSSH déjà installé"
        }
        
        # Installer VNC Server (TightVNC)
        $vncPath = "C:\Program Files\TightVNC\tvnserver.exe"
        if (-not (Test-Path $vncPath)) {
            Write-Log "Téléchargement et installation de TightVNC..."
            $vncUrl = "https://www.tightvnc.com/download/2.8.27/tightvnc-2.8.27-gpl-setup-64bit.msi"
            $vncInstaller = "$env:TEMP\tightvnc-setup.msi"
            
            Invoke-WebRequest -Uri $vncUrl -OutFile $vncInstaller
            Start-Process msiexec.exe -Wait -ArgumentList "/i $vncInstaller /quiet /norestart"
            Remove-Item $vncInstaller
            
            Write-Log "TightVNC installé"
        } else {
            Write-Log "TightVNC déjà installé"
        }
        
    } catch {
        Write-Log "Erreur lors de l'installation des fonctionnalités: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
    
    return $true
}

# Fonction pour configurer le pare-feu
function Configure-Firewall {
    Write-Log "Configuration du pare-feu Windows..."
    
    try {
        # Règles pour RDP
        New-NetFirewallRule -DisplayName "RDP Custom" -Direction Inbound -Protocol TCP -LocalPort 3389 -Action Allow -Profile Any
        
        # Règles pour VNC
        New-NetFirewallRule -DisplayName "VNC Server" -Direction Inbound -Protocol TCP -LocalPort 5900 -Action Allow -Profile Any
        
        # Règles pour SSH
        New-NetFirewallRule -DisplayName "SSH Server" -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow -Profile Any
        
        # Règles pour Cursor (si nécessaire)
        New-NetFirewallRule -DisplayName "Cursor Development" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Any
        
        Write-Log "Règles de pare-feu configurées"
        return $true
        
    } catch {
        Write-Log "Erreur lors de la configuration du pare-feu: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

# Fonction pour configurer le VPN client
function Configure-VpnClient {
    param([string]$Server, [string]$Username, [string]$Password)
    
    if (-not $Server -or -not $Username -or -not $Password) {
        Write-Log "Paramètres VPN manquants, configuration VPN ignorée" -Level "WARN"
        return $true
    }
    
    Write-Log "Configuration du client VPN..."
    
    try {
        # Créer la connexion VPN
        $vpnName = "IAHome-VPN"
        
        # Supprimer la connexion existante si elle existe
        $existingVpn = Get-VpnConnection -Name $vpnName -ErrorAction SilentlyContinue
        if ($existingVpn) {
            Remove-VpnConnection -Name $vpnName -Force
        }
        
        # Créer la nouvelle connexion
        Add-VpnConnection -Name $vpnName -ServerAddress $Server -TunnelType "L2tp" -EncryptionLevel "Required" -AuthenticationMethod MSChapv2 -Force
        
        # Configurer les identifiants
        $vpnCredential = New-Object System.Management.Automation.PSCredential($Username, (ConvertTo-SecureString $Password -AsPlainText -Force))
        Set-VpnConnectionIPsecConfiguration -ConnectionName $vpnName -AuthenticationTransformConstants SHA256128 -CipherTransformConstants AES128 -EncryptionMethod AES128 -IntegrityCheckMethod SHA256 -PfsGroup None -DHGroup Group14 -PassThru -Force
        
        Write-Log "Connexion VPN configurée: $vpnName"
        return $true
        
    } catch {
        Write-Log "Erreur lors de la configuration VPN: $($_.Exception.Message)" -Level "ERROR"
        return $false
    }
}

# Fonction pour créer un script de démarrage automatique
function Create-StartupScript {
    Write-Log "Création du script de démarrage automatique..."
    
    $startupScript = @"
# Script de démarrage automatique pour l'accès distant
# Exécuté au démarrage de Windows

# Démarrer les services nécessaires
Start-Service sshd -ErrorAction SilentlyContinue
Start-Service TermService -ErrorAction SilentlyContinue

# Démarrer TightVNC Server
`$vncPath = "C:\Program Files\TightVNC\tvnserver.exe"
if (Test-Path `$vncPath) {
    Start-Process `$vncPath -ArgumentList "-start" -WindowStyle Hidden
}

# Se connecter au VPN si configuré
`$vpnName = "IAHome-VPN"
`$vpnConnection = Get-VpnConnection -Name `$vpnName -ErrorAction SilentlyContinue
if (`$vpnConnection) {
    Connect-VpnConnection -Name `$vpnName -ErrorAction SilentlyContinue
}

# Démarrer Cursor si demandé
# Start-Process "C:\Users\`$env:USERNAME\AppData\Local\Programs\Cursor\Cursor.exe" -WindowStyle Normal
"@

    $startupPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup\remote-access-startup.ps1"
    $startupScript | Out-File -FilePath $startupPath -Encoding UTF8
    
    # Créer une tâche planifiée pour exécuter le script au démarrage
    $action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$startupPath`""
    $trigger = New-ScheduledTaskTrigger -AtStartup
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
    
    Register-ScheduledTask -TaskName "RemoteAccessStartup" -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force
    
    Write-Log "Script de démarrage automatique créé"
}

# Fonction pour afficher les informations de connexion
function Show-ConnectionInfo {
    Write-Log "=== INFORMATIONS DE CONNEXION ==="
    
    $ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*"}).IPAddress | Select-Object -First 1
    
    Write-Host ""
    Write-Host "🔗 INFORMATIONS DE CONNEXION DISTANTE" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "IP du PC: $ipAddress" -ForegroundColor Yellow
    Write-Host "RDP (Bureau à distance): $ipAddress`:3389" -ForegroundColor Cyan
    Write-Host "VNC (TightVNC): $ipAddress`:5900" -ForegroundColor Cyan
    Write-Host "SSH: $ipAddress`:22" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 INSTRUCTIONS:" -ForegroundColor Green
    Write-Host "1. Activez votre VPN pour accéder au réseau local" -ForegroundColor White
    Write-Host "2. Utilisez un client RDP ou VNC pour vous connecter" -ForegroundColor White
    Write-Host "3. Lancez Cursor une fois connecté" -ForegroundColor White
    Write-Host ""
    Write-Host "🔒 SÉCURITÉ:" -ForegroundColor Green
    Write-Host "- Changez les mots de passe par défaut" -ForegroundColor White
    Write-Host "- Utilisez uniquement des connexions VPN sécurisées" -ForegroundColor White
    Write-Host "- Surveillez les connexions dans les logs" -ForegroundColor White
    Write-Host ""
}

# Fonction principale
function Main {
    Write-Log "Démarrage du script: $ScriptName"
    
    # Vérifier les privilèges administrateur
    if (-not (Test-Administrator)) {
        Write-Log "Ce script nécessite des privilèges administrateur" -Level "ERROR"
        Write-Host "Veuillez exécuter ce script en tant qu'administrateur" -ForegroundColor Red
        exit 1
    }
    
    # Créer le dossier de logs
    if (-not (Test-Path "C:\temp")) {
        New-Item -ItemType Directory -Path "C:\temp" -Force
    }
    
    switch ($Action.ToLower()) {
        "setup" {
            Write-Log "Mode: Configuration complète"
            
            # Installation des fonctionnalités
            if (-not (Install-WindowsFeatures)) {
                Write-Log "Échec de l'installation des fonctionnalités" -Level "ERROR"
                exit 1
            }
            
            # Configuration du pare-feu
            if (-not (Configure-Firewall)) {
                Write-Log "Échec de la configuration du pare-feu" -Level "ERROR"
                exit 1
            }
            
            # Configuration VPN
            Configure-VpnClient -Server $VpnServer -Username $VpnUsername -Password $VpnPassword
            
            # Script de démarrage
            Create-StartupScript
            
            Write-Log "Configuration terminée avec succès"
            Show-ConnectionInfo
        }
        
        "status" {
            Write-Log "Mode: Vérification du statut"
            
            $services = @("sshd", "TermService")
            foreach ($service in $services) {
                $status = Get-Service -Name $service -ErrorAction SilentlyContinue
                if ($status) {
                    Write-Host "$service`: $($status.Status)" -ForegroundColor $(if ($status.Status -eq "Running") {"Green"} else {"Red"})
                } else {
                    Write-Host "$service`: Non installé" -ForegroundColor Red
                }
            }
            
            Show-ConnectionInfo
        }
        
        "cleanup" {
            Write-Log "Mode: Nettoyage"
            
            # Désactiver les services
            Stop-Service sshd -ErrorAction SilentlyContinue
            Set-Service sshd -StartupType Disabled
            
            # Supprimer les règles de pare-feu
            Remove-NetFirewallRule -DisplayName "RDP Custom" -ErrorAction SilentlyContinue
            Remove-NetFirewallRule -DisplayName "VNC Server" -ErrorAction SilentlyContinue
            Remove-NetFirewallRule -DisplayName "SSH Server" -ErrorAction SilentlyContinue
            Remove-NetFirewallRule -DisplayName "Cursor Development" -ErrorAction SilentlyContinue
            
            # Supprimer la tâche planifiée
            Unregister-ScheduledTask -TaskName "RemoteAccessStartup" -Confirm:$false -ErrorAction SilentlyContinue
            
            Write-Log "Nettoyage terminé"
        }
        
        default {
            Write-Host "Usage: .\setup-remote-access.ps1 [-Action setup|status|cleanup] [-VpnServer <server>] [-VpnUsername <username>] [-VpnPassword <password>]" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Actions disponibles:" -ForegroundColor Cyan
            Write-Host "  setup   - Configuration complète de l'accès distant" -ForegroundColor White
            Write-Host "  status  - Vérifier le statut des services" -ForegroundColor White
            Write-Host "  cleanup - Supprimer la configuration" -ForegroundColor White
        }
    }
    
    Write-Log "Script terminé"
}

# Exécution du script principal
Main


