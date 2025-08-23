# Script PowerShell pour vérifier et créer l'article "assistant-ia"
# Exécuté le: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Write-Host "🔄 Vérification et création de l'article 'assistant-ia'..." -ForegroundColor Yellow

# Lire le contenu du script SQL
$sqlScript = Get-Content "scripts/check-formation-assistant-ia.sql" -Raw

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
Write-Host "   • Vérifier si l'article 'assistant-ia' existe" -ForegroundColor White
Write-Host "   • Le créer avec du contenu complet s'il n'existe pas" -ForegroundColor White
Write-Host "   • Ajouter une image par défaut" -ForegroundColor White
Write-Host "   • Afficher un rapport final" -ForegroundColor White
Write-Host ""

Write-Host "🔄 Redémarrez l'application après l'exécution pour voir les changements" -ForegroundColor Yellow

# Option pour redémarrer l'application
$restart = Read-Host "Voulez-vous redémarrer l'application maintenant ? (o/n)"
if ($restart -eq "o" -or $restart -eq "O") {
    Write-Host "🔄 Redémarrage de l'application..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml restart
    Write-Host "✅ Application redémarrée!" -ForegroundColor Green
}
