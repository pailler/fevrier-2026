# Script de vérification de sécurité pour l'accès distant
# À exécuter pour identifier les problèmes de sécurité

param(
    [string]$Action = "check"
)

# Configuration
$ScriptName = "Security Check for Remote Access"
$LogFile = "C:\temp\security-check.log"

# Fonction de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

# Fonction pour vérifier les utilisateurs admin
function Test-AdminUsers {
    Write-Log "Vérification des utilisateurs administrateur..."
    
    $checks = @()
    
    # Vérifier les utilisateurs admin
    $adminUsers = Get-LocalUser | Where-Object { $_.Enabled -eq $true -and $_.PrincipalSource -eq "Local" }
    
    foreach ($user in $adminUsers) {
        $isAdmin = (Get-LocalGroupMember -Group "Administrators" -Member $user.Name -ErrorAction SilentlyContinue) -ne $null
        
        if ($isAdmin) {
            $checks += @{
                Name = "Utilisateur Admin: $($user.Name)"
                Status = if ($user.PasswordRequired -eq $false) { "❌ CRITIQUE" } else { "⚠️ ATTENTION" }
                Details = if ($user.PasswordRequired -eq $false) { "Pas de mot de passe requis" } else { "Mot de passe requis: $($user.PasswordRequired)" }
                Risk = if ($user.PasswordRequired -eq $false) { "ÉLEVÉ" } else { "MODÉRÉ" }
            }
        }
    }
    
    return $checks
}

# Fonction pour vérifier la configuration RDP
function Test-RdpSecurity {
    Write-Log "Vérification de la sécurité RDP..."
    
    $checks = @()
    
    # Vérifier l'authentification réseau
    $securityLayer = Get-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" -Name "SecurityLayer" -ErrorAction SilentlyContinue
    $userAuth = Get-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" -Name "UserAuthentication" -ErrorAction SilentlyContinue
    
    $checks += @{
        Name = "Authentification réseau RDP"
        Status = if ($securityLayer.SecurityLayer -eq 1 -and $userAuth.UserAuthentication -eq 1) { "✅ OK" } else { "❌ CRITIQUE" }
        Details = "SecurityLayer: $($securityLayer.SecurityLayer), UserAuth: $($userAuth.UserAuthentication)"
        Risk = if ($securityLayer.SecurityLayer -eq 1 -and $userAuth.UserAuthentication -eq 1) { "FAIBLE" } else { "ÉLEVÉ" }
    }
    
    # Vérifier le niveau de chiffrement
    $minEncryption = Get-ItemProperty -Path "HKLM:\System\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp" -Name "MinEncryptionLevel" -ErrorAction SilentlyContinue
    
    $checks += @{
        Name = "Chiffrement RDP"
        Status = if ($minEncryption.MinEncryptionLevel -eq 3) { "✅ OK" } else { "⚠️ ATTENTION" }
        Details = "Niveau de chiffrement: $($minEncryption.MinEncryptionLevel) (3 = High)"
        Risk = if ($minEncryption.MinEncryptionLevel -eq 3) { "FAIBLE" } else { "MODÉRÉ" }
    }
    
    return $checks
}

# Fonction pour vérifier les utilisateurs RDP
function Test-RdpUsers {
    Write-Log "Vérification des utilisateurs RDP..."
    
    $checks = @()
    
    # Vérifier les utilisateurs du Bureau à distance
    $rdpUsers = Get-LocalGroupMember -Group "Remote Desktop Users" -ErrorAction SilentlyContinue
    
    if ($rdpUsers) {
        foreach ($user in $rdpUsers) {
            $userInfo = Get-LocalUser -Name $user.Name -ErrorAction SilentlyContinue
            if ($userInfo) {
                $checks += @{
                    Name = "Utilisateur RDP: $($user.Name)"
                    Status = if ($userInfo.PasswordRequired -eq $false) { "❌ CRITIQUE" } else { "✅ OK" }
                    Details = "Mot de passe requis: $($userInfo.PasswordRequired), Compte activé: $($userInfo.Enabled)"
                    Risk = if ($userInfo.PasswordRequired -eq $false) { "ÉLEVÉ" } else { "FAIBLE" }
                }
            }
        }
    } else {
        $checks += @{
            Name = "Utilisateurs RDP"
            Status = "⚠️ ATTENTION"
            Details = "Aucun utilisateur dans le groupe Remote Desktop Users"
            Risk = "MODÉRÉ"
        }
    }
    
    return $checks
}

# Fonction pour vérifier les services
function Test-Services {
    Write-Log "Vérification des services..."
    
    $checks = @()
    
    $services = @(
        @{ Name = "TermService"; DisplayName = "Bureau à distance" },
        @{ Name = "sshd"; DisplayName = "OpenSSH SSH Server" }
    )
    
    foreach ($service in $services) {
        $serviceStatus = Get-Service -Name $service.Name -ErrorAction SilentlyContinue
        if ($serviceStatus) {
            $checks += @{
                Name = "Service: $($service.DisplayName)"
                Status = if ($serviceStatus.Status -eq "Running") { "✅ OK" } else { "⚠️ ARRÊTÉ" }
                Details = "Status: $($serviceStatus.Status), Startup: $($serviceStatus.StartType)"
                Risk = if ($serviceStatus.Status -eq "Running") { "FAIBLE" } else { "MODÉRÉ" }
            }
        } else {
            $checks += @{
                Name = "Service: $($service.DisplayName)"
                Status = "❌ NON INSTALLÉ"
                Details = "Service non trouvé"
                Risk = "MODÉRÉ"
            }
        }
    }
    
    return $checks
}

# Fonction pour afficher le rapport de sécurité
function Show-SecurityReport {
    param($AdminChecks, $RdpSecurityChecks, $RdpUserChecks, $ServiceChecks)
    
    Write-Host ""
    Write-Host "🔒 RAPPORT DE SÉCURITÉ - ACCÈS DISTANT" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
    
    # Utilisateurs admin
    Write-Host "👤 UTILISATEURS ADMINISTRATEUR" -ForegroundColor Yellow
    Write-Host "-----------------------------" -ForegroundColor Yellow
    foreach ($check in $AdminChecks) {
        $color = if ($check.Status -like "*CRITIQUE*") {"Red"} elseif ($check.Status -like "*ATTENTION*") {"Yellow"} else {"Green"}
        Write-Host "$($check.Status) $($check.Name): $($check.Details)" -ForegroundColor $color
    }
    Write-Host ""
    
    # Sécurité RDP
    Write-Host "🖥️ SÉCURITÉ RDP" -ForegroundColor Yellow
    Write-Host "--------------" -ForegroundColor Yellow
    foreach ($check in $RdpSecurityChecks) {
        $color = if ($check.Status -like "*CRITIQUE*") {"Red"} elseif ($check.Status -like "*ATTENTION*") {"Yellow"} else {"Green"}
        Write-Host "$($check.Status) $($check.Name): $($check.Details)" -ForegroundColor $color
    }
    Write-Host ""
    
    # Utilisateurs RDP
    Write-Host "👥 UTILISATEURS RDP" -ForegroundColor Yellow
    Write-Host "------------------" -ForegroundColor Yellow
    foreach ($check in $RdpUserChecks) {
        $color = if ($check.Status -like "*CRITIQUE*") {"Red"} elseif ($check.Status -like "*ATTENTION*") {"Yellow"} else {"Green"}
        Write-Host "$($check.Status) $($check.Name): $($check.Details)" -ForegroundColor $color
    }
    Write-Host ""
    
    # Services
    Write-Host "⚙️ SERVICES" -ForegroundColor Yellow
    Write-Host "----------" -ForegroundColor Yellow
    foreach ($check in $ServiceChecks) {
        $color = if ($check.Status -like "*CRITIQUE*") {"Red"} elseif ($check.Status -like "*ATTENTION*") {"Yellow"} else {"Green"}
        Write-Host "$($check.Status) $($check.Name): $($check.Details)" -ForegroundColor $color
    }
    Write-Host ""
    
    # Recommandations
    Write-Host "📋 RECOMMANDATIONS DE SÉCURITÉ" -ForegroundColor Green
    Write-Host "-----------------------------" -ForegroundColor Green
    
    $criticalIssues = @()
    $moderateIssues = @()
    
    foreach ($check in ($AdminChecks + $RdpSecurityChecks + $RdpUserChecks + $ServiceChecks)) {
        if ($check.Risk -eq "ÉLEVÉ") {
            $criticalIssues += $check.Name
        } elseif ($check.Risk -eq "MODÉRÉ") {
            $moderateIssues += $check.Name
        }
    }
    
    if ($criticalIssues.Count -gt 0) {
        Write-Host "🚨 PROBLÈMES CRITIQUES À RÉSOUDRE IMMÉDIATEMENT:" -ForegroundColor Red
        foreach ($issue in $criticalIssues) {
            Write-Host "   • $issue" -ForegroundColor Red
        }
        Write-Host ""
    }
    
    if ($moderateIssues.Count -gt 0) {
        Write-Host "⚠️ PROBLÈMES MODÉRÉS À CORRIGER:" -ForegroundColor Yellow
        foreach ($issue in $moderateIssues) {
            Write-Host "   • $issue" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    if ($criticalIssues.Count -eq 0 -and $moderateIssues.Count -eq 0) {
        Write-Host "✅ Configuration sécurisée. Vous pouvez procéder à l'accès distant." -ForegroundColor Green
    } else {
        Write-Host "🔧 Utilisez le script de correction: .\fix-security.ps1" -ForegroundColor Cyan
    }
    
    Write-Host ""
}

# Fonction principale
function Main {
    Write-Log "Démarrage du script: $ScriptName"
    
    # Vérifier les privilèges administrateur
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
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
            Write-Log "Mode: Vérification de sécurité complète"
            
            # Effectuer toutes les vérifications
            $adminChecks = Test-AdminUsers
            $rdpSecurityChecks = Test-RdpSecurity
            $rdpUserChecks = Test-RdpUsers
            $serviceChecks = Test-Services
            
            # Afficher le rapport
            Show-SecurityReport -AdminChecks $adminChecks -RdpSecurityChecks $rdpSecurityChecks -RdpUserChecks $rdpUserChecks -ServiceChecks $serviceChecks
            
            # Sauvegarder le rapport
            $report = @{
                timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                adminUsers = $adminChecks
                rdpSecurity = $rdpSecurityChecks
                rdpUsers = $rdpUserChecks
                services = $serviceChecks
            }
            
            $reportPath = "C:\temp\security-report.json"
            $report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
            Write-Log "Rapport de sécurité sauvegardé: $reportPath"
        }
        
        default {
            Write-Host "Usage: .\check-security.ps1 [-Action check]" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Actions disponibles:" -ForegroundColor Cyan
            Write-Host "  check   - Vérification complète de la sécurité" -ForegroundColor White
        }
    }
    
    Write-Log "Script terminé"
}

# Exécution du script principal
Main


