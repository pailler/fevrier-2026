# Script pour ouvrir Cloudflare Dashboard et configurer Redirect Rules
# Affiche les instructions claires pour créer la règle

Write-Host "🔧 Configuration Redirect Rules Cloudflare" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Ouvrir Cloudflare Dashboard
Write-Host "🌐 Ouverture du Cloudflare Dashboard..." -ForegroundColor Yellow
Start-Process "https://dash.cloudflare.com/"

Write-Host ""
Write-Host "⏳ Attendre 5 secondes pour que le navigateur s'ouvre..." -ForegroundColor Gray
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "📋 Instructions pas à pas:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

Write-Host "1️⃣  Sélectionnez votre domaine: iahome.fr" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "2️⃣  Dans le menu de gauche, cliquez sur: Rules" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "3️⃣  Cliquez sur: Redirect Rules" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "4️⃣  Cliquez sur: Create rule" -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "5️⃣  Configurez la règle comme suit:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ┌─────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "   │ Rule name (Nom de la règle):            │" -ForegroundColor Cyan
Write-Host "   │ Protect librespeed without token         │" -ForegroundColor White
Write-Host "   └─────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

Write-Host "   ┌─────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "   │ When incoming requests match:            │" -ForegroundColor Cyan
Write-Host "   │                                          │" -ForegroundColor Cyan
Write-Host "   │ Condition 1:                            │" -ForegroundColor Yellow
Write-Host "   │   Field: Hostname                        │" -ForegroundColor White
Write-Host "   │   Operator: equals                       │" -ForegroundColor White
Write-Host "   │   Value: librespeed.iahome.fr            │" -ForegroundColor White
Write-Host "   │                                          │" -ForegroundColor Cyan
Write-Host "   │ Cliquez sur 'Add condition'              │" -ForegroundColor Gray
Write-Host "   │                                          │" -ForegroundColor Cyan
Write-Host "   │ Condition 2:                            │" -ForegroundColor Yellow
Write-Host "   │   Field: Query String                    │" -ForegroundColor White
Write-Host "   │   Operator: does not contain             │" -ForegroundColor White
Write-Host "   │   Value: token                           │" -ForegroundColor White
Write-Host "   └─────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

Write-Host "   ┌─────────────────────────────────────────┐" -ForegroundColor Cyan
Write-Host "   │ Then the settings are:                  │" -ForegroundColor Cyan
Write-Host "   │                                          │" -ForegroundColor Cyan
Write-Host "   │ Action: Dynamic redirect                │" -ForegroundColor White
Write-Host "   │ Status code: 302 - Temporary Redirect    │" -ForegroundColor White
Write-Host "   │ Redirect to: https://iahome.fr/api/librespeed-redirect" -ForegroundColor White
Write-Host "   └─────────────────────────────────────────┘" -ForegroundColor Cyan
Write-Host ""

Write-Host "6️⃣  Cliquez sur: Deploy" -ForegroundColor Yellow
Write-Host ""

Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""

# Vérification après quelques secondes
Write-Host "🧪 Pour tester la configuration:" -ForegroundColor Cyan
Write-Host "   .\test-redirect-rules.ps1" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Pour plus de détails:" -ForegroundColor Cyan
Write-Host "   GUIDE_CLOUDFLARE_REDIRECT_RULES.md" -ForegroundColor Gray
Write-Host ""


