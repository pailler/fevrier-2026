# Script de réparation Cloudflare et vidage du cache
# Ce script redémarre le tunnel Cloudflare et vide le cache via l'API

Write-Host "🔧 Réparation Cloudflare et vidage du cache..." -ForegroundColor Cyan
Write-Host ""

# Variables Cloudflare
$AccountId = "9ba4294aa787e67c335c71876c10af21"
$ZoneId = ""  # Sera récupéré via l'API si nécessaire
$CloudflareApiToken = $env:CLOUDFLARE_API_TOKEN

# Domaines à purger
$domains = @(
    "iahome.fr",
    "www.iahome.fr",
    "qrcodes.iahome.fr",
    "librespeed.iahome.fr",
    "whisper.iahome.fr",
    "meeting-reports.iahome.fr"
)

# 1. Arrêter le tunnel Cloudflare
Write-Host "1️⃣ Arrêt du tunnel Cloudflare..." -ForegroundColor Yellow
try {
    $processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | ForEach-Object {
            Write-Host "   Arrêt du processus PID: $($_.Id)" -ForegroundColor Gray
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 3
        Write-Host "   ✅ Processus cloudflared arrêtés" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Aucun processus cloudflared en cours" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️ Erreur lors de l'arrêt: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2. Vider le cache Cloudflare (via API)
Write-Host "`n2️⃣ Vidage du cache Cloudflare..." -ForegroundColor Yellow

if ($CloudflareApiToken) {
    Write-Host "   🔑 Token API Cloudflare détecté" -ForegroundColor Gray
    
    # Récupérer la Zone ID si nécessaire
    if (-not $ZoneId) {
        Write-Host "   🔍 Récupération de la Zone ID pour iahome.fr..." -ForegroundColor Gray
        try {
            $headers = @{
                "Authorization" = "Bearer $CloudflareApiToken"
                "Content-Type" = "application/json"
            }
            
            $zonesResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=iahome.fr" -Method GET -Headers $headers -ErrorAction Stop
            
            if ($zonesResponse.success -and $zonesResponse.result.Count -gt 0) {
                $ZoneId = $zonesResponse.result[0].id
                Write-Host "   ✅ Zone ID récupéré: $ZoneId" -ForegroundColor Green
            }
        } catch {
            Write-Host "   ⚠️ Impossible de récupérer la Zone ID: $($_.Exception.Message)" -ForegroundColor Yellow
            Write-Host "   💡 Le vidage de cache sera fait par URL" -ForegroundColor Gray
        }
    }
    
    # Purger le cache de toute la zone
    if ($ZoneId) {
        Write-Host "   🗑️ Purge complète du cache de la zone..." -ForegroundColor Gray
        try {
            $headers = @{
                "Authorization" = "Bearer $CloudflareApiToken"
                "Content-Type" = "application/json"
            }
            
            $purgeBody = @{
                purge_everything = $true
            } | ConvertTo-Json
            
            $purgeResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/purge_cache" -Method POST -Headers $headers -Body $purgeBody -ErrorAction Stop
            
            if ($purgeResponse.success) {
                Write-Host "   ✅ Cache Cloudflare vidé avec succès!" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️ Erreur lors du vidage: $($purgeResponse.errors)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   ⚠️ Erreur API: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    
    # Purger le cache par URL (pour chaque domaine)
    Write-Host "   🗑️ Purge du cache par URL..." -ForegroundColor Gray
    foreach ($domain in $domains) {
        if ($ZoneId) {
            try {
                $headers = @{
                    "Authorization" = "Bearer $CloudflareApiToken"
                    "Content-Type" = "application/json"
                }
                
                $purgeBody = @{
                    files = @("https://$domain", "http://$domain")
                } | ConvertTo-Json
                
                $purgeResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/purge_cache" -Method POST -Headers $headers -Body $purgeBody -ErrorAction Stop
                
                if ($purgeResponse.success) {
                    Write-Host "      ✅ Cache vidé pour: $domain" -ForegroundColor Green
                } else {
                    Write-Host "      ⚠️ $domain : $($purgeResponse.errors)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "      ⚠️ $domain : $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "      ⚠️ Zone ID non disponible, impossible de purger $domain" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ⚠️ CLOUDFLARE_API_TOKEN non défini" -ForegroundColor Yellow
    Write-Host "   💡 Le cache sera vidé côté navigateur uniquement" -ForegroundColor Gray
    Write-Host "   💡 Pour purger le cache Cloudflare, définissez CLOUDFLARE_API_TOKEN dans env.production.local" -ForegroundColor Gray
}

# 3. Vider le cache du navigateur local (optionnel - via fichier HTML)
Write-Host "`n3️⃣ Instructions pour vider le cache navigateur..." -ForegroundColor Yellow
Write-Host "   💡 Visitez: https://iahome.fr/clear-cache.html" -ForegroundColor Cyan
Write-Host "   💡 Ou appuyez sur Ctrl+Shift+Delete dans votre navigateur" -ForegroundColor Gray

# 4. Redémarrer le tunnel Cloudflare
Write-Host "`n4️⃣ Redémarrage du tunnel Cloudflare..." -ForegroundColor Yellow

# Vérifier que cloudflared.exe existe
if (-not (Test-Path ".\cloudflared.exe")) {
    Write-Host "   ❌ cloudflared.exe non trouvé!" -ForegroundColor Red
    exit 1
}

# Vérifier que la configuration existe
if (-not (Test-Path "cloudflare-active-config.yml")) {
    Write-Host "   ❌ cloudflare-active-config.yml non trouvé!" -ForegroundColor Red
    exit 1
}

try {
    $configPath = Resolve-Path "cloudflare-active-config.yml"
    $cloudflaredPath = Resolve-Path "cloudflared.exe"
    
    Write-Host "   🚀 Démarrage du tunnel..." -ForegroundColor Gray
    Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden
    
    Write-Host "   ✅ Commande de démarrage envoyée" -ForegroundColor Green
    Write-Host "   ⏳ Attente de la connexion (15 secondes)..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
    
    # Vérifier le statut
    $tunnelInfo = & .\cloudflared.exe tunnel info iahome-new 2>&1
    if ($tunnelInfo -match "CONNECTOR ID" -or $tunnelInfo -match "connection") {
        Write-Host "   ✅ Tunnel actif!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Tunnel démarré mais pas encore connecté" -ForegroundColor Yellow
        Write-Host "   💡 Attendez quelques secondes supplémentaires" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test de connectivité
Write-Host "`n5️⃣ Test de connectivité après réparation..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$testUrl = "https://iahome.fr"
try {
    $response = Invoke-WebRequest -Uri $testUrl -Method Head -TimeoutSec 15 -UseBasicParsing -ErrorAction Stop
    Write-Host "   ✅ $testUrl : $($response.StatusCode)" -ForegroundColor Green
    
    # Vérifier les headers de cache
    $cacheControl = $response.Headers['CF-Cache-Status']
    if ($cacheControl) {
        Write-Host "   📊 Statut cache: $cacheControl" -ForegroundColor Cyan
    }
} catch {
    $statusCode = "N/A"
    if ($_.Exception.Response) {
        $statusCode = [int]$_.Exception.Response.StatusCode.value__
    }
    Write-Host "   ⚠️ $testUrl : Erreur $statusCode" -ForegroundColor Yellow
    Write-Host "   💡 Le tunnel peut prendre quelques minutes pour se stabiliser" -ForegroundColor Gray
}

# 6. Résumé
Write-Host "`n📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Tunnel Cloudflare redémarré" -ForegroundColor Green
if ($CloudflareApiToken -and $ZoneId) {
    Write-Host "   ✅ Cache Cloudflare vidé via API" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Cache Cloudflare non vidé (token API manquant)" -ForegroundColor Yellow
}
Write-Host "   💡 Pour vider le cache navigateur: https://iahome.fr/clear-cache.html" -ForegroundColor Cyan

Write-Host "`n✅ Réparation terminée!" -ForegroundColor Green

