# Script PowerShell pour mettre à jour le prix de StableDiffusion à 10 centimes
# Exécuté le: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Write-Host "🔄 Mise à jour du prix de StableDiffusion à 10 centimes..." -ForegroundColor Yellow

# Lire le contenu du script SQL
$sqlScript = Get-Content "scripts/update-stablediffusion-price.sql" -Raw

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

Write-Host "✅ Une fois le script exécuté, le prix de StableDiffusion sera de 0.10€ (10 centimes)" -ForegroundColor Green
Write-Host "🔄 Redémarrez l'application si nécessaire pour voir les changements" -ForegroundColor Yellow

# Option pour redémarrer l'application
$restart = Read-Host "Voulez-vous redémarrer l'application maintenant ? (o/n)"
if ($restart -eq "o" -or $restart -eq "O") {
    Write-Host "🔄 Redémarrage de l'application..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml restart
    Write-Host "✅ Application redémarrée!" -ForegroundColor Green
}
