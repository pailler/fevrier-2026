# Script pour mettre à jour la configuration du tunnel Cloudflare
# Tous les sous-domaines pointent vers l'application Next.js

param(
    [string]$CloudflareApiToken = $env:CLOUDFLARE_API_TOKEN,
    [string]$AccountId = "9ba4294aa787e67c335c71876c10af21",
    [string]$TunnelId = "02a960c5-edd6-4b3f-844f-410b16247262"
)

if (-not $CloudflareApiToken) {
    Write-Host "❌ Erreur: CLOUDFLARE_API_TOKEN non défini" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Mise à jour de la configuration du tunnel Cloudflare..." -ForegroundColor Cyan

# Configuration du tunnel - tous les sous-domaines pointent vers Next.js
$tunnelConfig = @{
    config = @{
        ingress = @(
            @{
                hostname = "iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "iahome.fr"
                    disableChunkedEncoding = $true
                    keepAliveConnections = 10
                    noTLSVerify = $true
                }
            },
            @{
                hostname = "www.iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "www.iahome.fr"
                    disableChunkedEncoding = $true
                    keepAliveConnections = 10
                    noTLSVerify = $true
                }
            },
            @{
                hostname = "librespeed.iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "librespeed.iahome.fr"
                    noTLSVerify = $true
                }
            },
            @{
                hostname = "meeting-reports.iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "meeting-reports.iahome.fr"
                    disableChunkedEncoding = $true
                    noTLSVerify = $true
                }
            },
            @{
                hostname = "whisper.iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "whisper.iahome.fr"
                    noTLSVerify = $true
                }
            },
            @{
                hostname = "comfyui.iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "comfyui.iahome.fr"
                    noTLSVerify = $true
                }
            },
            @{
                hostname = "stablediffusion.iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "stablediffusion.iahome.fr"
                    noTLSVerify = $true
                }
            },
            @{
                hostname = "qrcodes.iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "qrcodes.iahome.fr"
                    noTLSVerify = $true
                }
            },
            @{
                hostname = "psitransfer.iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "psitransfer.iahome.fr"
                    noTLSVerify = $true
                }
            },
            @{
                hostname = "metube.iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "metube.iahome.fr"
                    noTLSVerify = $true
                }
            },
            @{
                hostname = "pdf.iahome.fr"
                service = "http://localhost:3000"
                originRequest = @{
                    httpHostHeader = "pdf.iahome.fr"
                    noTLSVerify = $true
                }
            },
            @{
                service = "http_status:404"
            }
        )
        warp-routing = @{
            enabled = $false
        }
    }
} | ConvertTo-Json -Depth 10

Write-Host "📝 Configuration du tunnel:" -ForegroundColor Yellow
Write-Host $tunnelConfig -ForegroundColor Gray

try {
    $headers = @{
        "Authorization" = "Bearer $CloudflareApiToken"
        "Content-Type" = "application/json"
    }

    $uri = "https://api.cloudflare.com/client/v4/accounts/$AccountId/cfd_tunnel/$TunnelId/configurations"
    
    Write-Host "`n🔄 Mise à jour de la configuration..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri $uri -Method PUT -Headers $headers -Body $tunnelConfig
    
    if ($response.success) {
        Write-Host "✅ Configuration du tunnel mise à jour avec succès !" -ForegroundColor Green
        Write-Host "   Tous les sous-domaines pointent maintenant vers Next.js" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la mise à jour:" -ForegroundColor Red
        Write-Host $response.errors -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur lors de la mise à jour de la configuration:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "`n🎯 Configuration terminée !" -ForegroundColor Cyan
Write-Host "   Redémarrez le tunnel pour appliquer les changements" -ForegroundColor Yellow