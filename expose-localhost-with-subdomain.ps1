# Script SÉCURISÉ : Expose un localhost via un sous-domaine existant avec protections
# Cette méthode utilise vos protections existantes (Page Rules, authentification, etc.)

param(
    [Parameter(Mandatory=$true)]
    [int]$Port,
    
    [Parameter(Mandatory=$true)]
    [string]$Subdomain,
    
    [Parameter(Mandatory=$false)]
    [string]$Protocol = "http",
    
    [Parameter(Mandatory=$false)]
    [string]$ConfigFile = "cloudflare-active-config.yml"
)

Write-Host "🔒 Exposition SÉCURISÉE d'un localhost:$Port via sous-domaine $Subdomain.iahome.fr..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si cloudflared est installé
try {
    $cloudflaredVersion = cloudflared --version 2>&1
    Write-Host "✅ Cloudflared détecté: $cloudflaredVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Cloudflared n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "💡 Installez cloudflared depuis: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le service local est accessible
Write-Host "🔍 Vérification que le service local est accessible sur $Protocol://localhost:$Port..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$Protocol://localhost:$Port" -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Service local accessible" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Service local non accessible: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Assurez-vous que le service écoute sur $Protocol://localhost:$Port" -ForegroundColor Yellow
}

# Vérifier que le fichier de configuration existe
if (-not (Test-Path $ConfigFile)) {
    Write-Host "❌ Fichier de configuration non trouvé: $ConfigFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Configuration du sous-domaine $Subdomain.iahome.fr..." -ForegroundColor Yellow

# Lire la configuration actuelle
$configContent = Get-Content $ConfigFile -Raw

# Vérifier si le sous-domaine existe déjà
if ($configContent -match "hostname: $Subdomain\.iahome\.fr") {
    Write-Host "⚠️ Le sous-domaine $Subdomain.iahome.fr existe déjà dans la configuration" -ForegroundColor Yellow
    
    $update = Read-Host "Voulez-vous mettre à jour la configuration? (O/N)"
    if ($update -ne 'O' -and $update -ne 'o' -and $update -ne 'Y' -and $update -ne 'y') {
        Write-Host "❌ Annulé" -ForegroundColor Red
        exit 0
    }
    
    # Mettre à jour l'entrée existante
    $configContent = $configContent -replace "(?s)(- hostname: $Subdomain\.iahome\.fr.*?service: http://)[^\n]+", "`$1$Protocol://localhost:$Port"
} else {
    # Ajouter une nouvelle entrée avant le catch-all
    $newEntry = @"

  # Service temporaire exposé via sous-domaine
  - hostname: $Subdomain.iahome.fr
    service: $Protocol://localhost:$Port
    originRequest:
      httpHostHeader: $Subdomain.iahome.fr
      noTLSVerify: true

"@
    
    # Insérer avant le catch-all (service: http_status:404)
    if ($configContent -match "(  # Catch-all.*?`r?`n  - service: http_status:404)") {
        $configContent = $configContent -replace "(  # Catch-all.*?`r?`n  - service: http_status:404)", "$newEntry`$1"
    } else {
        # Ajouter à la fin du fichier ingress
        $configContent = $configContent -replace "(ingress:.*?)(  # Catch-all)", "`$1$newEntry`$2"
    }
}

# Sauvegarder la configuration
$configBackup = "$ConfigFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item $ConfigFile $configBackup -Force
Write-Host "💾 Sauvegarde créée: $configBackup" -ForegroundColor Gray

Set-Content -Path $ConfigFile -Value $configContent -NoNewline
Write-Host "✅ Configuration mise à jour" -ForegroundColor Green

Write-Host ""
Write-Host "🔒 AVANTAGES DE CETTE MÉTHODE:" -ForegroundColor Green
Write-Host "   ✅ Utilise vos protections existantes (Page Rules, authentification)" -ForegroundColor Green
Write-Host "   ✅ Nécessite un token d'accès depuis iahome.fr" -ForegroundColor Green
Write-Host "   ✅ Redirection automatique vers iahome.fr si accès direct" -ForegroundColor Green
Write-Host "   ✅ Contrôle d'accès centralisé" -ForegroundColor Green
Write-Host ""

Write-Host "📋 PROCHAINES ÉTAPES:" -ForegroundColor Yellow
Write-Host "   1. Configurez le DNS dans Cloudflare Dashboard:" -ForegroundColor White
Write-Host "      - Ajoutez un enregistrement CNAME: $Subdomain -> <votre-tunnel-id>.cfargotunnel.com" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Redémarrez le tunnel Cloudflare:" -ForegroundColor White
Write-Host "      .\start-cloudflare-tunnel.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Testez l'accès:" -ForegroundColor White
Write-Host "      https://$Subdomain.iahome.fr" -ForegroundColor Gray
Write-Host "      (Doit rediriger vers iahome.fr si pas de token)" -ForegroundColor Gray
Write-Host ""

$restart = Read-Host "Voulez-vous redémarrer le tunnel maintenant? (O/N)"
if ($restart -eq 'O' -or $restart -eq 'o' -or $restart -eq 'Y' -or $restart -eq 'y') {
    Write-Host ""
    Write-Host "🔄 Redémarrage du tunnel..." -ForegroundColor Yellow
    
    # Arrêter les processus existants
    Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
    
    Start-Sleep -Seconds 2
    
    # Redémarrer avec la nouvelle configuration
    $cloudflaredPath = "cloudflared"
    if (Test-Path ".\cloudflared.exe") {
        $cloudflaredPath = ".\cloudflared.exe"
    }
    
    $configPath = Resolve-Path $ConfigFile
    Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden
    
    Write-Host "✅ Tunnel redémarré" -ForegroundColor Green
    Write-Host "⏳ Attente de 10 secondes pour la connexion..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Vérifier le statut
    $tunnelInfo = & cloudflared tunnel info iahome-new 2>&1
    if ($tunnelInfo -match "CONNECTOR ID") {
        Write-Host "✅ Tunnel connecté avec succès!" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Vérifiez manuellement le statut du tunnel" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎉 Configuration terminée!" -ForegroundColor Green
Write-Host "🌐 Accès sécurisé: https://$Subdomain.iahome.fr" -ForegroundColor Cyan


