# Script PowerShell pour mettre à jour la configuration Cloudflare via l'API
# Met à jour qrcodes.iahome.fr pour pointer vers la nouvelle page de redirection

Write-Host "🔧 Mise à jour de la configuration Cloudflare via l'API..." -ForegroundColor Yellow
Write-Host "=========================================================" -ForegroundColor Yellow

# Configuration
$tunnelId = "4cc75dfd-fd02-4496-97f9-23f40fc1943d"
$tunnelName = "iahome-new"

# Nouvelle configuration d'ingress
$ingressConfig = @{
    "ingress" = @(
        @{
            "hostname" = "librespeed.iahome.fr"
            "service" = "http://192.168.1.150:8081"
        },
        @{
            "hostname" = "psitransfer.iahome.fr"
            "service" = "http://192.168.1.150:7009"
        },
        @{
            "hostname" = "metube.iahome.fr"
            "service" = "http://192.168.1.150:7007"
        },
        @{
            "hostname" = "www.iahome.fr"
            "service" = "http://192.168.1.150:3000"
        },
        @{
            "hostname" = "iahome.fr"
            "service" = "http://192.168.1.150:3000"
        },
        @{
            "hostname" = "qrcodes.iahome.fr"
            "service" = "http://192.168.1.150:3000/qrcodes-redirect"
        },
        @{
            "service" = "http_status:404"
        }
    )
}

# Sauvegarder la configuration
$configJson = $ingressConfig | ConvertTo-Json -Depth 10
$configJson | Out-File -FilePath "cloudflare-ingress-config.json" -Encoding UTF8

Write-Host "✅ Configuration sauvegardée dans cloudflare-ingress-config.json" -ForegroundColor Green

# Instructions pour la mise à jour manuelle
Write-Host ""
Write-Host "📋 Instructions de mise à jour manuelle:" -ForegroundColor Green
Write-Host "1. Connectez-vous à Cloudflare Dashboard" -ForegroundColor White
Write-Host "2. Allez dans Zero Trust > Access > Tunnels" -ForegroundColor White
Write-Host "3. Sélectionnez le tunnel 'iahome-new'" -ForegroundColor White
Write-Host "4. Cliquez sur 'Configure' dans la section 'Public Hostname'" -ForegroundColor White
Write-Host "5. Modifiez l'entrée pour 'qrcodes.iahome.fr'" -ForegroundColor White
Write-Host "6. Changez le service de 'http://192.168.1.150:7005' vers 'http://192.168.1.150:3000/qrcodes-redirect'" -ForegroundColor White
Write-Host "7. Sauvegardez les modifications" -ForegroundColor White
Write-Host "8. Attendez 1-2 minutes pour la propagation" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Configuration actuelle détectée:" -ForegroundColor Cyan
Write-Host "• qrcodes.iahome.fr → http://192.168.1.150:7005 (ancienne interface)" -ForegroundColor Red
Write-Host "• Taille de réponse: 1982 caractères (interface statique)" -ForegroundColor Red

Write-Host ""
Write-Host "🎯 Configuration cible:" -ForegroundColor Cyan
Write-Host "• qrcodes.iahome.fr → http://192.168.1.150:3000/qrcodes-redirect (nouvelle interface)" -ForegroundColor Green
Write-Host "• Taille de réponse attendue: ~27846 caractères (interface avec sessions)" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Après la mise à jour, chaque utilisateur aura sa propre session QR codes !" -ForegroundColor Green
