# Script de connexion rapide pour l'accès distant à Cursor
# À utiliser dans le workflow quotidien

param(
    [string]$Action = "connect",
    [string]$TargetIP = "",
    [string]$Username = ""
)

# Configuration
$ScriptName = "Quick Connect to Cursor"
$LogFile = "C:\temp\quick-connect.log"

# Fonction de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

# Fonction pour vérifier la connectivité VPN
function Test-VpnConnectivity {
    Write-Log "Vérification de la connectivité VPN..."
    
    try {
        # Vérifier si on est sur le réseau local
        $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*"}).IPAddress | Select-Object -First 1
        
        # Vérifier si l'IP est dans la plage locale (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
        $isLocalNetwork = $localIP -match "^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)"
        
        if ($isLocalNetwork) {
            Write-Host "✅ Connecté au réseau local (IP: $localIP)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Non connecté au réseau local (IP: $localIP)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Erreur lors de la vérification VPN" -ForegroundColor Red
        return $false
    }
}

# Fonction pour tester la connectivité vers le PC distant
function Test-RemoteConnectivity {
    param([string]$TargetIP)
    
    Write-Log "Test de connectivité vers $TargetIP..."
    
    try {
        $pingResult = Test-Connection -ComputerName $TargetIP -Count 3 -Quiet
        if ($pingResult) {
            Write-Host "✅ PC distant accessible (ping OK)" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ PC distant inaccessible (ping échoué)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Erreur lors du test de connectivité" -ForegroundColor Red
        return $false
    }
}

# Fonction pour tester les ports
function Test-RemotePorts {
    param([string]$TargetIP)
    
    Write-Log "Test des ports sur $TargetIP..."
    
    $ports = @(
        @{ Port = 3389; Service = "RDP" },
        @{ Port = 5900; Service = "VNC" },
        @{ Port = 22; Service = "SSH" }
    )
    
    $results = @()
    
    foreach ($port in $ports) {
        try {
            $test = Test-NetConnection -ComputerName $TargetIP -Port $port.Port -InformationLevel Quiet -WarningAction SilentlyContinue
            $status = if ($test) { "✅ OUVERT" } else { "❌ FERMÉ" }
            $color = if ($test) { "Green" } else { "Red" }
            
            Write-Host "$status Port $($port.Port) ($($port.Service))" -ForegroundColor $color
            $results += @{ Port = $port.Port; Service = $port.Service; Open = $test }
        } catch {
            Write-Host "❌ ERREUR Port $($port.Port) ($($port.Service))" -ForegroundColor Red
            $results += @{ Port = $port.Port; Service = $port.Service; Open = $false }
        }
    }
    
    return $results
}

# Fonction pour lancer RDP
function Start-RdpConnection {
    param([string]$TargetIP, [string]$Username)
    
    Write-Log "Lancement de la connexion RDP vers $TargetIP..."
    
    try {
        if ($Username) {
            # Lancer RDP avec nom d'utilisateur
            Start-Process "mstsc" -ArgumentList "/v:$TargetIP /u:$Username"
        } else {
            # Lancer RDP sans nom d'utilisateur
            Start-Process "mstsc" -ArgumentList "/v:$TargetIP"
        }
        
        Write-Host "✅ Connexion RDP lancée" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Erreur lors du lancement RDP" -ForegroundColor Red
        return $false
    }
}

# Fonction pour lancer VNC
function Start-VncConnection {
    param([string]$TargetIP)
    
    Write-Log "Lancement de la connexion VNC vers $TargetIP..."
    
    try {
        # Vérifier si TightVNC Viewer est installé
        $vncViewerPath = "C:\Program Files\TightVNC\tvnviewer.exe"
        if (Test-Path $vncViewerPath) {
            Start-Process $vncViewerPath -ArgumentList "$TargetIP`:5900"
            Write-Host "✅ Connexion VNC lancée" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️ TightVNC Viewer non trouvé" -ForegroundColor Yellow
            Write-Host "   Téléchargez-le depuis https://www.tightvnc.com/" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ Erreur lors du lancement VNC" -ForegroundColor Red
        return $false
    }
}

# Fonction pour afficher les informations de connexion
function Show-ConnectionInfo {
    param([string]$TargetIP, [string]$Username)
    
    Write-Host ""
    Write-Host "🔗 INFORMATIONS DE CONNEXION" -ForegroundColor Cyan
    Write-Host "============================" -ForegroundColor Cyan
    Write-Host "IP du PC distant: $TargetIP" -ForegroundColor Yellow
    Write-Host "Utilisateur: $Username" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 MÉTHODES DE CONNEXION:" -ForegroundColor Green
    Write-Host "RDP: mstsc /v:$TargetIP /u:$Username" -ForegroundColor White
    Write-Host "VNC: $TargetIP`:5900" -ForegroundColor White
    Write-Host "SSH: ssh $Username@$TargetIP" -ForegroundColor White
    Write-Host ""
}

# Fonction pour afficher l'aide
function Show-Help {
    Write-Host ""
    Write-Host "🚀 SCRIPT DE CONNEXION RAPIDE À CURSOR" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\quick-connect.ps1 [-Action connect|test|help] [-TargetIP <ip>] [-Username <username>]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions disponibles:" -ForegroundColor Green
    Write-Host "  connect - Teste la connectivité et lance RDP" -ForegroundColor White
    Write-Host "  test    - Teste uniquement la connectivité" -ForegroundColor White
    Write-Host "  vnc     - Lance une connexion VNC" -ForegroundColor White
    Write-Host "  help    - Affiche cette aide" -ForegroundColor White
    Write-Host ""
    Write-Host "Exemples:" -ForegroundColor Green
    Write-Host "  .\quick-connect.ps1 -Action connect -TargetIP 192.168.1.100 -Username john" -ForegroundColor White
    Write-Host "  .\quick-connect.ps1 -Action test -TargetIP 192.168.1.100" -ForegroundColor White
    Write-Host "  .\quick-connect.ps1 -Action vnc -TargetIP 192.168.1.100" -ForegroundColor White
    Write-Host ""
}

# Fonction principale
function Main {
    Write-Log "Démarrage du script: $ScriptName"
    
    # Créer le dossier de logs
    if (-not (Test-Path "C:\temp")) {
        New-Item -ItemType Directory -Path "C:\temp" -Force
    }
    
    switch ($Action.ToLower()) {
        "connect" {
            if (-not $TargetIP) {
                Write-Host "❌ IP cible requise pour la connexion" -ForegroundColor Red
                Write-Host "   Usage: .\quick-connect.ps1 -Action connect -TargetIP <ip> [-Username <username>]" -ForegroundColor Yellow
                exit 1
            }
            
            Write-Host ""
            Write-Host "🔍 VÉRIFICATION DE LA CONNEXION" -ForegroundColor Cyan
            Write-Host "===============================" -ForegroundColor Cyan
            Write-Host ""
            
            # Test VPN
            $vpnOk = Test-VpnConnectivity
            if (-not $vpnOk) {
                Write-Host ""
                Write-Host "⚠️ CONNEXION VPN REQUISE" -ForegroundColor Yellow
                Write-Host "Connectez-vous au VPN avant de continuer" -ForegroundColor Yellow
                Write-Host ""
                return
            }
            
            # Test connectivité
            $connectivityOk = Test-RemoteConnectivity -TargetIP $TargetIP
            if (-not $connectivityOk) {
                Write-Host ""
                Write-Host "❌ PC DISTANT INACCESSIBLE" -ForegroundColor Red
                Write-Host "Vérifiez que le PC distant est allumé et connecté au réseau" -ForegroundColor Red
                Write-Host ""
                return
            }
            
            # Test ports
            Write-Host ""
            $portResults = Test-RemotePorts -TargetIP $TargetIP
            
            # Afficher les informations
            Show-ConnectionInfo -TargetIP $TargetIP -Username $Username
            
            # Lancer RDP
            Write-Host "🚀 LANCEMENT DE LA CONNEXION RDP" -ForegroundColor Green
            $rdpSuccess = Start-RdpConnection -TargetIP $TargetIP -Username $Username
            
            if ($rdpSuccess) {
                Write-Host ""
                Write-Host "✅ CONNEXION LANCÉE AVEC SUCCÈS" -ForegroundColor Green
                Write-Host "Une fois connecté, lancez Cursor depuis le menu Démarrer" -ForegroundColor White
                Write-Host ""
            }
        }
        
        "test" {
            if (-not $TargetIP) {
                Write-Host "❌ IP cible requise pour le test" -ForegroundColor Red
                Write-Host "   Usage: .\quick-connect.ps1 -Action test -TargetIP <ip>" -ForegroundColor Yellow
                exit 1
            }
            
            Write-Host ""
            Write-Host "🔍 TEST DE CONNECTIVITÉ" -ForegroundColor Cyan
            Write-Host "=====================" -ForegroundColor Cyan
            Write-Host ""
            
            # Test VPN
            Test-VpnConnectivity
            
            # Test connectivité
            Test-RemoteConnectivity -TargetIP $TargetIP
            
            # Test ports
            Write-Host ""
            Test-RemotePorts -TargetIP $TargetIP
            
            Write-Host ""
        }
        
        "vnc" {
            if (-not $TargetIP) {
                Write-Host "❌ IP cible requise pour VNC" -ForegroundColor Red
                Write-Host "   Usage: .\quick-connect.ps1 -Action vnc -TargetIP <ip>" -ForegroundColor Yellow
                exit 1
            }
            
            Write-Host ""
            Write-Host "🔍 LANCEMENT VNC" -ForegroundColor Cyan
            Write-Host "================" -ForegroundColor Cyan
            Write-Host ""
            
            # Test VPN
            $vpnOk = Test-VpnConnectivity
            if (-not $vpnOk) {
                Write-Host ""
                Write-Host "⚠️ CONNEXION VPN REQUISE" -ForegroundColor Yellow
                Write-Host "Connectez-vous au VPN avant de continuer" -ForegroundColor Yellow
                Write-Host ""
                return
            }
            
            # Lancer VNC
            Start-VncConnection -TargetIP $TargetIP
            
            Write-Host ""
        }
        
        "help" {
            Show-Help
        }
        
        default {
            Write-Host "❌ Action non reconnue: $Action" -ForegroundColor Red
            Show-Help
        }
    }
    
    Write-Log "Script terminé"
}

# Exécution du script principal
Main


