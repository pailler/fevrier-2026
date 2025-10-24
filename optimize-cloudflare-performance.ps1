# Script pour optimiser les performances Cloudflare
# Configure les Page Rules et optimise la configuration du tunnel

param(
    [string]$CloudflareApiToken = $env:CLOUDFLARE_API_TOKEN,
    [string]$AccountId = "9ba4294aa787e67c335c71876c10af21",
    [string]$ZoneId = $env:CLOUDFLARE_ZONE_ID
)

# Mode simplifié si pas de token API
$useApiMode = $true
if (-not $CloudflareApiToken) {
    Write-Host "⚠️  Mode simplifié: Pas de token API Cloudflare détecté" -ForegroundColor Yellow
    Write-Host "📋 Les optimisations seront appliquées localement uniquement" -ForegroundColor Yellow
    $useApiMode = $false
}

Write-Host "🚀 Optimisation des performances Cloudflare..." -ForegroundColor Cyan

# Headers pour l'API Cloudflare (si disponible)
if ($useApiMode) {
    $headers = @{
        "Authorization" = "Bearer $CloudflareApiToken"
        "Content-Type" = "application/json"
    }
}

# Fonction pour créer une Page Rule
function New-PageRule {
    param(
        [string]$Target,
        [array]$Actions
    )
    
    $body = @{
        targets = @(
            @{
                target = "url"
                constraint = @{
                    operator = "matches"
                    value = $Target
                }
            }
        )
        actions = $Actions
        priority = 1
        status = "active"
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules" -Method POST -Headers $headers -Body $body
        Write-Host "✅ Page Rule créée pour: $Target" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ Erreur création Page Rule pour $Target : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Fonction pour mettre à jour les paramètres de zone
function Update-ZoneSettings {
    param(
        [string]$SettingName,
        [object]$Value
    )
    
    $body = @{
        value = $Value
    } | ConvertTo-Json -Depth 10
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/settings/$SettingName" -Method PATCH -Headers $headers -Body $body
        Write-Host "✅ Paramètre $SettingName mis à jour" -ForegroundColor Green
        return $response
    }
    catch {
        Write-Host "❌ Erreur mise à jour $SettingName : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

if ($useApiMode) {
    Write-Host "📋 Configuration des Page Rules via API..." -ForegroundColor Yellow

    # 1. Cache des assets statiques Next.js
    $staticAssetsActions = @(
        @{
            id = "cache_level"
            value = "cache_everything"
        },
        @{
            id = "edge_cache_ttl"
            value = 2592000  # 30 jours
        },
        @{
            id = "browser_cache_ttl"
            value = 2592000  # 30 jours
        }
    )
    New-PageRule -Target "iahome.fr/_next/static/*" -Actions $staticAssetsActions

    # 2. Cache des images
    $imagesActions = @(
        @{
            id = "cache_level"
            value = "cache_everything"
        },
        @{
            id = "edge_cache_ttl"
            value = 604800  # 7 jours
        },
        @{
            id = "browser_cache_ttl"
            value = 604800  # 7 jours
        }
    )
    New-PageRule -Target "iahome.fr/images/*" -Actions $imagesActions

    # 3. Cache des fonts
    $fontsActions = @(
        @{
            id = "cache_level"
            value = "cache_everything"
        },
        @{
            id = "edge_cache_ttl"
            value = 2592000  # 30 jours
        },
        @{
            id = "browser_cache_ttl"
            value = 2592000  # 30 jours
        }
    )
    New-PageRule -Target "iahome.fr/fonts/*" -Actions $fontsActions

    # 4. Bypass cache pour les API
    $apiActions = @(
        @{
            id = "cache_level"
            value = "bypass"
        },
        @{
            id = "browser_cache_ttl"
            value = "respect_existing_headers"
        }
    )
    New-PageRule -Target "iahome.fr/api/*" -Actions $apiActions

    # 5. Optimisations générales
    $generalActions = @(
        @{
            id = "minify"
            value = @{
                html = "on"
                css = "on"
                js = "on"
            }
        },
        @{
            id = "brotli"
            value = "on"
        },
        @{
            id = "rocket_loader"
            value = "on"
        },
        @{
            id = "mirage"
            value = "on"
        }
    )
    New-PageRule -Target "iahome.fr/*" -Actions $generalActions

    Write-Host "⚙️ Configuration des paramètres de zone..." -ForegroundColor Yellow

    # Configuration des paramètres de performance
    Update-ZoneSettings -SettingName "brotli" -Value "on"
    Update-ZoneSettings -SettingName "minify" -Value @{
        html = "on"
        css = "on"
        js = "on"
    }
    Update-ZoneSettings -SettingName "rocket_loader" -Value "on"
    Update-ZoneSettings -SettingName "mirage" -Value "on"
    Update-ZoneSettings -SettingName "polish" -Value "lossless"
    Update-ZoneSettings -SettingName "webp" -Value "on"
    Update-ZoneSettings -SettingName "always_online" -Value "on"
} else {
    Write-Host "📋 Mode simplifié: Configuration locale uniquement" -ForegroundColor Yellow
    Write-Host "💡 Pour une optimisation complète, configurez manuellement dans Cloudflare Dashboard:" -ForegroundColor Cyan
    Write-Host "   1. Allez sur https://dash.cloudflare.com" -ForegroundColor White
    Write-Host "   2. Sélectionnez votre domaine iahome.fr" -ForegroundColor White
    Write-Host "   3. Configurez les Page Rules selon le guide cloudflare-page-rules-performance.md" -ForegroundColor White
    Write-Host "   4. Activez Speed > Auto Minify, Brotli, Rocket Loader, Mirage" -ForegroundColor White
}

Write-Host "🔄 Redémarrage du tunnel Cloudflare..." -ForegroundColor Yellow

# Redémarrage du tunnel avec la nouvelle configuration
try {
    $tunnelProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($tunnelProcess) {
        Write-Host "Arrêt du tunnel existant..." -ForegroundColor Yellow
        Stop-Process -Name "cloudflared" -Force
        Start-Sleep -Seconds 3
    }
    
    Write-Host "Démarrage du tunnel optimisé..." -ForegroundColor Green
    Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--config", "cloudflare-optimized-performance.yml", "run" -WindowStyle Hidden
    
    Write-Host "✅ Tunnel redémarré avec la configuration optimisée" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur redémarrage tunnel : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎯 Optimisation terminée !" -ForegroundColor Green
Write-Host "📊 Vérifiez les performances sur : https://pagespeed.web.dev/" -ForegroundColor Cyan
Write-Host "📈 Surveillez les métriques dans Cloudflare Analytics" -ForegroundColor Cyan
