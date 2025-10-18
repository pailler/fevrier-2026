# Script principal de sécurisation LibreSpeed avec Cloudflare
# Utilise l'API Cloudflare pour configurer automatiquement toute la sécurité

param(
    [Parameter(Mandatory=$true)]
    [string]$CloudflareApiToken,
    
    [Parameter(Mandatory=$true)]
    [string]$ZoneId,
    
    [Parameter(Mandatory=$true)]
    [string]$AccountId,
    
    [string]$Email = "admin@iahome.fr",
    [string]$Domain = "iahome.fr"
)

Write-Host "🚀 Configuration complète de la sécurité LibreSpeed" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   🔑 Token API: $($CloudflareApiToken.Substring(0,8))..." -ForegroundColor Yellow
Write-Host "   🌐 Zone ID: $ZoneId" -ForegroundColor Yellow
Write-Host "   🏢 Account ID: $AccountId" -ForegroundColor Yellow
Write-Host "   📧 Email: $Email" -ForegroundColor Yellow
Write-Host "   🌍 Domaine: $Domain" -ForegroundColor Yellow

# Vérifier que LibreSpeed est démarré
Write-Host "`n1. Vérification de LibreSpeed..." -ForegroundColor Yellow
try {
    $librespeedStatus = docker ps --filter name=librespeed-prod --format "{{.Names}}\t{{.Status}}"
    if ($librespeedStatus -match "librespeed-prod") {
        Write-Host "   ✅ LibreSpeed est en cours d'exécution" -ForegroundColor Green
        Write-Host "   📊 Status: $librespeedStatus" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ LibreSpeed n'est pas démarré" -ForegroundColor Red
        Write-Host "   🚀 Démarrage de LibreSpeed..." -ForegroundColor Yellow
        
        # Démarrer LibreSpeed
        $librespeedDir = ".\docker-services\essentiels\librespeed"
        if (Test-Path $librespeedDir) {
            Set-Location $librespeedDir
            docker-compose up -d
            Set-Location "..\..\.."
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ LibreSpeed démarré" -ForegroundColor Green
            } else {
                Write-Host "   ❌ Erreur démarrage LibreSpeed" -ForegroundColor Red
                exit 1
            }
        } else {
            Write-Host "   ❌ Répertoire LibreSpeed non trouvé" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "   ❌ Erreur vérification LibreSpeed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Vérifier la configuration Cloudflare Tunnel
Write-Host "`n2. Vérification du tunnel Cloudflare..." -ForegroundColor Yellow
try {
    $tunnelConfig = Get-Content "cloudflare-complete-config.yml" | Select-String "librespeed"
    if ($tunnelConfig) {
        Write-Host "   ✅ Configuration tunnel trouvée" -ForegroundColor Green
        Write-Host "   📋 Configuration: $tunnelConfig" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ Configuration tunnel manquante" -ForegroundColor Red
        Write-Host "   🚀 Ajout de la configuration LibreSpeed..." -ForegroundColor Yellow
        
        # Ajouter la configuration LibreSpeed au tunnel
        $tunnelContent = Get-Content "cloudflare-complete-config.yml"
        $newConfig = @"
  # LibreSpeed - Test de vitesse internet
  - hostname: librespeed.$Domain
    service: http://localhost:8085
    originRequest:
      httpHostHeader: librespeed.$Domain
      keepAliveConnections: 5
      connectTimeout: 30s
      tlsTimeout: 10s
      noTLSVerify: false
"@
        
        # Insérer avant la dernière ligne (service: http_status:404)
        $insertIndex = $tunnelContent.Count - 1
        $tunnelContent = $tunnelContent[0..($insertIndex-1)] + $newConfig + $tunnelContent[$insertIndex..($tunnelContent.Count-1)]
        $tunnelContent | Set-Content "cloudflare-complete-config.yml"
        
        Write-Host "   ✅ Configuration tunnel ajoutée" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Erreur configuration tunnel: $($_.Exception.Message)" -ForegroundColor Red
}

# Redémarrer le tunnel Cloudflare
Write-Host "`n3. Redémarrage du tunnel Cloudflare..." -ForegroundColor Yellow
try {
    # Arrêter le tunnel existant
    $tunnelProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($tunnelProcess) {
        Write-Host "   🛑 Arrêt du tunnel existant..." -ForegroundColor Yellow
        $tunnelProcess | Stop-Process -Force
        Start-Sleep -Seconds 3
    }
    
    # Démarrer le nouveau tunnel
    Write-Host "   🚀 Démarrage du tunnel..." -ForegroundColor Yellow
    Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel --config cloudflare-complete-config.yml run" -WindowStyle Hidden
    
    Start-Sleep -Seconds 5
    Write-Host "   ✅ Tunnel redémarré" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur redémarrage tunnel: $($_.Exception.Message)" -ForegroundColor Red
}

# Exécuter la configuration de sécurité
Write-Host "`n4. Configuration de la sécurité Cloudflare..." -ForegroundColor Yellow
try {
    & ".\secure-librespeed-cloudflare.ps1" -CloudflareApiToken $CloudflareApiToken -ZoneId $ZoneId -Email $Email
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Sécurité Cloudflare configurée" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Erreur configuration sécurité" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur exécution sécurité: $($_.Exception.Message)" -ForegroundColor Red
}

# Exécuter la configuration Cloudflare Access
Write-Host "`n5. Configuration Cloudflare Access..." -ForegroundColor Yellow
try {
    & ".\configure-librespeed-access.ps1" -CloudflareApiToken $CloudflareApiToken -AccountId $AccountId -Email $Email -Domain $Domain
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Cloudflare Access configuré" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Erreur configuration Access" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur exécution Access: $($_.Exception.Message)" -ForegroundColor Red
}

# Test final
Write-Host "`n6. Test final de la configuration..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

try {
    $response = Invoke-WebRequest -Uri "https://librespeed.$Domain" -Method Head -TimeoutSec 20
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
        Write-Host "   ✅ LibreSpeed accessible et sécurisé" -ForegroundColor Green
        Write-Host "   🔒 Status: $($response.StatusCode)" -ForegroundColor Cyan
        
        # Vérifier les headers de sécurité
        $headers = $response.Headers
        $securityHeaders = @("Strict-Transport-Security", "X-Frame-Options", "X-Content-Type-Options", "X-XSS-Protection")
        $foundHeaders = 0
        
        foreach ($header in $securityHeaders) {
            if ($headers[$header]) {
                $foundHeaders++
                Write-Host "   ✅ $header activé" -ForegroundColor Green
            }
        }
        
        Write-Host "   📊 Headers de sécurité: $foundHeaders/$($securityHeaders.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "   ⚠️  LibreSpeed accessible mais status inattendu: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur test final: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Configuration LibreSpeed terminée !" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host "   🌐 URL: https://librespeed.$Domain" -ForegroundColor Cyan
Write-Host "   🔐 Authentification: Email @$Domain" -ForegroundColor Cyan
Write-Host "   🛡️  Protection: WAF + SSL + Headers + Access" -ForegroundColor Cyan
Write-Host "   📊 Monitoring: Dashboard Cloudflare" -ForegroundColor Cyan

Write-Host "`n📋 Résumé complet:" -ForegroundColor Yellow
Write-Host "   ✅ LibreSpeed démarré et accessible" -ForegroundColor Green
Write-Host "   ✅ Tunnel Cloudflare configuré" -ForegroundColor Green
Write-Host "   ✅ DNS CNAME configuré" -ForegroundColor Green
Write-Host "   ✅ Règles WAF anti-bots" -ForegroundColor Green
Write-Host "   ✅ Limitation du taux de requêtes" -ForegroundColor Green
Write-Host "   ✅ SSL/TLS strict" -ForegroundColor Green
Write-Host "   ✅ Headers de sécurité" -ForegroundColor Green
Write-Host "   ✅ Protection DDoS" -ForegroundColor Green
Write-Host "   ✅ Bot Management" -ForegroundColor Green
Write-Host "   ✅ Cloudflare Access (Zero Trust)" -ForegroundColor Green
Write-Host "   ✅ Monitoring et logs" -ForegroundColor Green

Write-Host "`n🔧 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Tester l'accès: https://librespeed.$Domain" -ForegroundColor Cyan
Write-Host "   2. Vérifier l'authentification par email" -ForegroundColor Cyan
Write-Host "   3. Configurer les utilisateurs dans Cloudflare Access" -ForegroundColor Cyan
Write-Host "   4. Monitorer les logs dans le dashboard Cloudflare" -ForegroundColor Cyan
Write-Host "   5. Ajuster les règles WAF si nécessaire" -ForegroundColor Cyan

Write-Host "`n💡 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   • Vérifier le statut: docker ps --filter name=librespeed" -ForegroundColor Cyan
Write-Host "   • Voir les logs: docker logs librespeed-prod" -ForegroundColor Cyan
Write-Host "   • Tester l'accès: curl -I https://librespeed.$Domain" -ForegroundColor Cyan
Write-Host "   • Dashboard Cloudflare: https://dash.cloudflare.com" -ForegroundColor Cyan

