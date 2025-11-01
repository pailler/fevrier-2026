# Script d'aide pour configurer Redirect Rules Cloudflare
# Affiche les instructions et vérifie la configuration

Write-Host "🔧 Configuration Redirect Rules Cloudflare" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Instructions pour Cloudflare Dashboard:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Connectez-vous à: https://dash.cloudflare.com/" -ForegroundColor White
Write-Host "2. Sélectionnez votre domaine: iahome.fr" -ForegroundColor White
Write-Host "3. Allez dans: Rules → Redirect Rules" -ForegroundColor White
Write-Host "4. Cliquez sur: Create rule" -ForegroundColor White
Write-Host ""

Write-Host "📝 Configuration de la Règle:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Rule name:" -ForegroundColor Cyan
Write-Host "  Protect librespeed without token" -ForegroundColor White
Write-Host ""

Write-Host "When incoming requests match:" -ForegroundColor Cyan
Write-Host "  Condition 1:" -ForegroundColor Gray
Write-Host "    Field: Hostname" -ForegroundColor White
Write-Host "    Operator: equals" -ForegroundColor White
Write-Host "    Value: librespeed.iahome.fr" -ForegroundColor White
Write-Host ""
Write-Host "  Condition 2 (cliquez sur 'Add condition'):" -ForegroundColor Gray
Write-Host "    Field: Query String" -ForegroundColor White
Write-Host "    Operator: does not contain" -ForegroundColor White
Write-Host "    Value: token" -ForegroundColor White
Write-Host ""

Write-Host "Then the settings are:" -ForegroundColor Cyan
Write-Host "  Action: Dynamic redirect" -ForegroundColor White
Write-Host "  Status code: 302 - Temporary Redirect" -ForegroundColor White
Write-Host "  Redirect to: https://iahome.fr/api/librespeed-redirect" -ForegroundColor White
Write-Host ""

Write-Host "Cliquez sur: Deploy" -ForegroundColor Yellow
Write-Host ""

# Vérification de la configuration Cloudflare Tunnel
Write-Host "🔍 Vérification de la configuration..." -ForegroundColor Cyan
Write-Host ""

$configFile = "cloudflare-active-config.yml"

if (Test-Path $configFile) {
    $config = Get-Content $configFile -Raw
    
    if ($config -match "librespeed\.iahome\.fr") {
        Write-Host "✅ Fichier de configuration trouvé: $configFile" -ForegroundColor Green
        
        # Vérifier si pointe vers Next.js (port 3000)
        if ($config -match "librespeed\.iahome\.fr[\s\S]*?localhost:3000" -or $config -match "librespeed\.iahome\.fr[\s\S]*?127\.0\.0\.1:3000") {
            Write-Host "✅ Configuration correcte: librespeed pointe vers Next.js (port 3000)" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  Configuration à vérifier: librespeed ne semble pas pointer vers Next.js" -ForegroundColor Yellow
            Write-Host "   Le fichier doit contenir: service: http://localhost:3000" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "⚠️  Configuration librespeed non trouvée dans $configFile" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⚠️  Fichier de configuration non trouvé: $configFile" -ForegroundColor Yellow
}

Write-Host ""

# Vérification de la route Next.js
Write-Host "🔍 Vérification de la route Next.js..." -ForegroundColor Cyan
Write-Host ""

$routeFile = "src/app/api/librespeed-redirect/route.ts"

if (Test-Path $routeFile) {
    Write-Host "✅ Route Next.js trouvée: $routeFile" -ForegroundColor Green
    
    $routeContent = Get-Content $routeFile -Raw
    
    if ($routeContent -match "librespeed\.iahome\.fr") {
        Write-Host "✅ Route configure correctement pour rediriger vers librespeed.iahome.fr" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Route à vérifier: ne semble pas rediriger vers librespeed.iahome.fr" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⚠️  Route Next.js non trouvée: $routeFile" -ForegroundColor Yellow
    Write-Host "   La route doit être créée pour que la protection fonctionne." -ForegroundColor Gray
}

Write-Host ""

# Instructions pour redémarrer le tunnel
Write-Host "🔄 Pour redémarrer le tunnel Cloudflare:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Arrêter le tunnel" -ForegroundColor Gray
Write-Host "Get-Process -Name `"cloudflared`" -ErrorAction SilentlyContinue | Stop-Process -Force" -ForegroundColor White
Write-Host ""
Write-Host "# Redémarrer avec la nouvelle configuration" -ForegroundColor Gray
Write-Host '$configPath = Resolve-Path "cloudflare-active-config.yml"' -ForegroundColor White
Write-Host 'Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden' -ForegroundColor White
Write-Host ""

Write-Host "📚 Pour plus de détails, consultez: GUIDE_CLOUDFLARE_REDIRECT_RULES.md" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host "   Testez avec: .\test-redirect-rules.ps1" -ForegroundColor Gray
Write-Host ""

