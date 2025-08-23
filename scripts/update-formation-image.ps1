# Script PowerShell pour mettre à jour l'image de l'article "assistant-ia"
# Exécuté le: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Write-Host "🔄 Mise à jour de l'image de l'article 'assistant-ia'..." -ForegroundColor Yellow

# Lire le contenu du script SQL
$sqlScript = Get-Content "scripts/update-formation-image.sql" -Raw

Write-Host "📋 Script SQL à exécuter:" -ForegroundColor Cyan
Write-Host $sqlScript -ForegroundColor Gray

Write-Host ""
Write-Host "⚠️  INSTRUCTIONS:" -ForegroundColor Red
Write-Host "1. Connectez-vous à votre dashboard Supabase" -ForegroundColor White
Write-Host "2. Allez dans 'SQL Editor'" -ForegroundColor White
Write-Host "3. Copiez et collez le script SQL ci-dessus" -ForegroundColor White
Write-Host "4. Cliquez sur 'Run' pour exécuter" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Dashboard Supabase: https://supabase.com/dashboard" -ForegroundColor Blue
Write-Host ""

Write-Host "✅ Ce script va :" -ForegroundColor Green
Write-Host "   • Vérifier l'image actuelle de l'article" -ForegroundColor White
Write-Host "   • Mettre à jour l'image avec '/images/iaphoto.jpg'" -ForegroundColor White
Write-Host "   • Résoudre les problèmes CORS/ORB" -ForegroundColor White
Write-Host "   • Afficher un rapport final" -ForegroundColor White
Write-Host ""

Write-Host "🔄 Après l'exécution, l'image devrait s'afficher correctement !" -ForegroundColor Yellow
