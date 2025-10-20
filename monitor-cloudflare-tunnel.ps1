# Script de surveillance du tunnel Cloudflare
# Ce script surveille et maintient le tunnel Cloudflare actif

Write-Host "🔍 Surveillance du tunnel Cloudflare..." -ForegroundColor Cyan

# Fonction pour vérifier le statut du tunnel
function Test-TunnelStatus {
    try {
        $tunnelInfo = cloudflared tunnel info iahome-new 2>&1
        if ($tunnelInfo -match "CONNECTOR ID") {
            return $true
        } else {
            return $false
        }
    } catch {
        return $false
    }
}

# Fonction pour tester l'accessibilité du site
function Test-SiteAccessibility {
    try {
        $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method Head -TimeoutSec 5
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Fonction pour redémarrer le tunnel
function Restart-Tunnel {
    Write-Host "🔄 Redémarrage du tunnel..." -ForegroundColor Yellow
    
    # Arrêter les processus cloudflared existants
    Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
    
    # Attendre un peu
    Start-Sleep -Seconds 2
    
    # Redémarrer le tunnel
    Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "iahome-new" -WindowStyle Hidden
    
    # Attendre la connexion
    Start-Sleep -Seconds 10
    
    return Test-TunnelStatus
}

# Boucle de surveillance
$checkInterval = 60 # Vérifier toutes les 60 secondes
$maxRetries = 3
$retryCount = 0

Write-Host "⏰ Surveillance démarrée (vérification toutes les $checkInterval secondes)" -ForegroundColor Green
Write-Host "🛑 Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Yellow

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] Vérification du statut..." -ForegroundColor Cyan
    
    $tunnelActive = Test-TunnelStatus
    $siteAccessible = Test-SiteAccessibility
    
    if ($tunnelActive -and $siteAccessible) {
        Write-Host "[$timestamp] ✅ Tunnel actif et site accessible" -ForegroundColor Green
        $retryCount = 0
    } elseif ($tunnelActive -and -not $siteAccessible) {
        Write-Host "[$timestamp] ⚠️ Tunnel actif mais site non accessible" -ForegroundColor Yellow
        $retryCount++
    } elseif (-not $tunnelActive) {
        Write-Host "[$timestamp] ❌ Tunnel non actif" -ForegroundColor Red
        $retryCount++
    }
    
    # Si plusieurs échecs consécutifs, redémarrer le tunnel
    if ($retryCount -ge $maxRetries) {
        Write-Host "[$timestamp] 🔄 Trop d'échecs, redémarrage du tunnel..." -ForegroundColor Red
        
        if (Restart-Tunnel) {
            Write-Host "[$timestamp] ✅ Tunnel redémarré avec succès" -ForegroundColor Green
            $retryCount = 0
        } else {
            Write-Host "[$timestamp] ❌ Échec du redémarrage du tunnel" -ForegroundColor Red
        }
    }
    
    # Attendre avant la prochaine vérification
    Start-Sleep -Seconds $checkInterval
}
