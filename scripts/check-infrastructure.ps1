# Script de vérification de l'infrastructure pour l'accès distant
# À exécuter AVANT de commencer la configuration

param(
    [string]$Action = "check"
)

# Configuration
$ScriptName = "Infrastructure Check for Remote Access"
$LogFile = "C:\temp\infrastructure-check.log"

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

# Fonction pour vérifier la connectivité réseau
function Test-NetworkConnectivity {
    Write-Log "Vérification de la connectivité réseau..."
    
    $checks = @()
    
    # Vérifier la connexion Internet
    try {
        $internetTest = Test-NetConnection -ComputerName "8.8.8.8" -Port 53 -InformationLevel Quiet
        $checks += @{
            Name = "Connexion Internet"
            Status = if ($internetTest) { "✅ OK" } else { "❌ ÉCHEC" }
            Details = if ($internetTest) { "Connecté" } else { "Pas de connexion Internet" }
        }
    } catch {
        $checks += @{
            Name = "Connexion Internet"
            Status = "❌ ÉCHEC"
            Details = "Erreur lors du test"
        }
    }
    
    # Vérifier la résolution DNS
    try {
        $dnsTest = Resolve-DnsName -Name "google.com" -ErrorAction Stop
        $checks += @{
            Name = "Résolution DNS"
            Status = "✅ OK"
            Details = "DNS fonctionnel"
        }
    } catch {
        $checks += @{
            Name = "Résolution DNS"
            Status = "❌ ÉCHEC"
            Details = "Problème de résolution DNS"
        }
    }
    
    # Vérifier l'IP locale
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -notlike "169.254.*" -and $_.IPAddress -notlike "127.*"}).IPAddress | Select-Object -First 1
    $checks += @{
        Name = "IP Locale"
        Status = "✅ OK"
        Details = "IP: $localIP"
    }
    
    return $checks
}

# Fonction pour vérifier les services Windows
function Test-WindowsServices {
    Write-Log "Vérification des services Windows..."
    
    $services = @(
        @{ Name = "TermService"; DisplayName = "Bureau à distance" },
        @{ Name = "sshd"; DisplayName = "OpenSSH SSH Server" },
        @{ Name = "Spooler"; DisplayName = "Spouleur d'impression" },
        @{ Name = "Themes"; DisplayName = "Thèmes" }
    )
    
    $checks = @()
    
    foreach ($service in $services) {
        $serviceStatus = Get-Service -Name $service.Name -ErrorAction SilentlyContinue
        if ($serviceStatus) {
            $checks += @{
                Name = $service.DisplayName
                Status = if ($serviceStatus.Status -eq "Running") { "✅ OK" } else { "⚠️ ARRÊTÉ" }
                Details = "Status: $($serviceStatus.Status), Startup: $($serviceStatus.StartType)"
            }
        } else {
            $checks += @{
                Name = $service.DisplayName
                Status = "❌ NON INSTALLÉ"
                Details = "Service non trouvé"
            }
        }
    }
    
    return $checks
}

# Fonction pour vérifier les ports
function Test-Ports {
    Write-Log "Vérification des ports..."
    
    $ports = @(
        @{ Port = 3389; Service = "RDP" },
        @{ Port = 22; Service = "SSH" },
        @{ Port = 5900; Service = "VNC" },
        @{ Port = 80; Service = "HTTP" },
        @{ Port = 443; Service = "HTTPS" }
    )
    
    $checks = @()
    
    foreach ($port in $ports) {
        try {
            $test = Test-NetConnection -ComputerName "localhost" -Port $port.Port -InformationLevel Quiet -WarningAction SilentlyContinue
            $checks += @{
                Name = "Port $($port.Port) ($($port.Service))"
                Status = if ($test) { "✅ OUVERT" } else { "❌ FERMÉ" }
                Details = if ($test) { "Port accessible" } else { "Port non accessible" }
            }
        } catch {
            $checks += @{
                Name = "Port $($port.Port) ($($port.Service))"
                Status = "❌ ERREUR"
                Details = "Erreur lors du test"
            }
        }
    }
    
    return $checks
}

# Fonction pour vérifier les applications installées
function Test-InstalledApplications {
    Write-Log "Vérification des applications installées..."
    
    $apps = @(
        @{ Name = "Cursor"; Path = "C:\Users\$env:USERNAME\AppData\Local\Programs\Cursor\Cursor.exe" },
        @{ Name = "TightVNC"; Path = "C:\Program Files\TightVNC\tvnserver.exe" },
        @{ Name = "OpenVPN"; Path = "C:\Program Files\OpenVPN\bin\openvpn.exe" }
    )
    
    $checks = @()
    
    foreach ($app in $apps) {
        if (Test-Path $app.Path) {
            $checks += @{
                Name = $app.Name
                Status = "✅ INSTALLÉ"
                Details = "Trouvé: $($app.Path)"
            }
        } else {
            $checks += @{
                Name = $app.Name
                Status = "❌ NON INSTALLÉ"
                Details = "Non trouvé: $($app.Path)"
            }
        }
    }
    
    return $checks
}

# Fonction pour vérifier l'espace disque
function Test-DiskSpace {
    Write-Log "Vérification de l'espace disque..."
    
    $checks = @()
    
    Get-WmiObject -Class Win32_LogicalDisk | ForEach-Object {
        $freeSpaceGB = [math]::Round($_.FreeSpace / 1GB, 2)
        $totalSpaceGB = [math]::Round($_.Size / 1GB, 2)
        $usedPercent = [math]::Round((($_.Size - $_.FreeSpace) / $_.Size) * 100, 1)
        
        $status = if ($freeSpaceGB -gt 10) { "✅ OK" } elseif ($freeSpaceGB -gt 5) { "⚠️ LIMITE" } else { "❌ CRITIQUE" }
        
        $checks += @{
            Name = "Disque $($_.DeviceID)"
            Status = $status
            Details = "$freeSpaceGB GB libre sur $totalSpaceGB GB ($usedPercent% utilisé)"
        }
    }
    
    return $checks
}

# Fonction pour afficher le rapport
function Show-Report {
    param($NetworkChecks, $ServiceChecks, $PortChecks, $AppChecks, $DiskChecks)
    
    Write-Host ""
    Write-Host "🔍 RAPPORT DE VÉRIFICATION DE L'INFRASTRUCTURE" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Réseau
    Write-Host "🌐 CONNECTIVITÉ RÉSEAU" -ForegroundColor Yellow
    Write-Host "----------------------" -ForegroundColor Yellow
    foreach ($check in $NetworkChecks) {
        Write-Host "$($check.Status) $($check.Name): $($check.Details)" -ForegroundColor $(if ($check.Status -like "*OK*") {"Green"} elseif ($check.Status -like "*ÉCHEC*") {"Red"} else {"Yellow"})
    }
    Write-Host ""
    
    # Services
    Write-Host "⚙️ SERVICES WINDOWS" -ForegroundColor Yellow
    Write-Host "-------------------" -ForegroundColor Yellow
    foreach ($check in $ServiceChecks) {
        Write-Host "$($check.Status) $($check.Name): $($check.Details)" -ForegroundColor $(if ($check.Status -like "*OK*") {"Green"} elseif ($check.Status -like "*NON INSTALLÉ*") {"Red"} else {"Yellow"})
    }
    Write-Host ""
    
    # Ports
    Write-Host "🔌 PORTS" -ForegroundColor Yellow
    Write-Host "--------" -ForegroundColor Yellow
    foreach ($check in $PortChecks) {
        Write-Host "$($check.Status) $($check.Name): $($check.Details)" -ForegroundColor $(if ($check.Status -like "*OUVERT*") {"Green"} elseif ($check.Status -like "*FERMÉ*") {"Red"} else {"Yellow"})
    }
    Write-Host ""
    
    # Applications
    Write-Host "📱 APPLICATIONS" -ForegroundColor Yellow
    Write-Host "---------------" -ForegroundColor Yellow
    foreach ($check in $AppChecks) {
        Write-Host "$($check.Status) $($check.Name): $($check.Details)" -ForegroundColor $(if ($check.Status -like "*INSTALLÉ*") {"Green"} else {"Red"})
    }
    Write-Host ""
    
    # Disque
    Write-Host "💾 ESPACE DISQUE" -ForegroundColor Yellow
    Write-Host "----------------" -ForegroundColor Yellow
    foreach ($check in $DiskChecks) {
        Write-Host "$($check.Status) $($check.Name): $($check.Details)" -ForegroundColor $(if ($check.Status -like "*OK*") {"Green"} elseif ($check.Status -like "*CRITIQUE*") {"Red"} else {"Yellow"})
    }
    Write-Host ""
    
    # Recommandations
    Write-Host "📋 RECOMMANDATIONS" -ForegroundColor Green
    Write-Host "------------------" -ForegroundColor Green
    
    $issues = @()
    if ($NetworkChecks | Where-Object { $_.Status -like "*ÉCHEC*" }) { $issues += "Résoudre les problèmes de connectivité réseau" }
    if ($ServiceChecks | Where-Object { $_.Status -like "*NON INSTALLÉ*" }) { $issues += "Installer les services manquants" }
    if ($PortChecks | Where-Object { $_.Status -like "*FERMÉ*" -and $_.Name -like "*RDP*" }) { $issues += "Ouvrir le port RDP (3389)" }
    if ($AppChecks | Where-Object { $_.Status -like "*NON INSTALLÉ*" -and $_.Name -like "*Cursor*" }) { $issues += "Installer Cursor" }
    if ($DiskChecks | Where-Object { $_.Status -like "*CRITIQUE*" }) { $issues += "Libérer de l'espace disque" }
    
    if ($issues.Count -eq 0) {
        Write-Host "✅ Tous les prérequis sont satisfaits. Vous pouvez procéder à la configuration." -ForegroundColor Green
    } else {
        Write-Host "⚠️ Problèmes détectés à résoudre avant la configuration:" -ForegroundColor Yellow
        foreach ($issue in $issues) {
            Write-Host "   • $issue" -ForegroundColor Yellow
        }
    }
    
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
        "check" {
            Write-Log "Mode: Vérification complète de l'infrastructure"
            
            # Effectuer toutes les vérifications
            $networkChecks = Test-NetworkConnectivity
            $serviceChecks = Test-WindowsServices
            $portChecks = Test-Ports
            $appChecks = Test-InstalledApplications
            $diskChecks = Test-DiskSpace
            
            # Afficher le rapport
            Show-Report -NetworkChecks $networkChecks -ServiceChecks $serviceChecks -PortChecks $portChecks -AppChecks $appChecks -DiskChecks $diskChecks
            
            # Sauvegarder le rapport
            $report = @{
                timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                network = $networkChecks
                services = $serviceChecks
                ports = $portChecks
                applications = $appChecks
                disk = $diskChecks
            }
            
            $reportPath = "C:\temp\infrastructure-report.json"
            $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
            Write-Log "Rapport sauvegardé: $reportPath"
        }
        
        default {
            Write-Host "Usage: .\check-infrastructure.ps1 [-Action check]" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Actions disponibles:" -ForegroundColor Cyan
            Write-Host "  check   - Vérification complète de l'infrastructure" -ForegroundColor White
        }
    }
    
    Write-Log "Script terminé"
}

# Exécution du script principal
Main


