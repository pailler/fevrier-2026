# Script pour vérifier les tables de la base de données
Write-Host "Verification des tables de la base de donnees..." -ForegroundColor Blue

Write-Host ""
Write-Host "Tables requises pour le systeme de notifications:" -ForegroundColor Yellow
Write-Host "  - notification_settings" -ForegroundColor White
Write-Host "  - notification_logs" -ForegroundColor White

Write-Host ""
Write-Host "Tables requises pour l'admin:" -ForegroundColor Yellow
Write-Host "  - user_applications" -ForegroundColor White
Write-Host "  - access_tokens" -ForegroundColor White
Write-Host "  - profiles" -ForegroundColor White
Write-Host "  - modules" -ForegroundColor White
Write-Host "  - blog_articles" -ForegroundColor White
Write-Host "  - linkedin_posts" -ForegroundColor White

Write-Host ""
Write-Host "Probleme detecte: Erreurs 400 sur user_applications" -ForegroundColor Red
Write-Host "Cela peut empecher le chargement de la page admin" -ForegroundColor Red

Write-Host ""
Write-Host "Solutions possibles:" -ForegroundColor Cyan
Write-Host "1. Verifier que la table user_applications existe dans Supabase" -ForegroundColor White
Write-Host "2. Verifier les permissions RLS (Row Level Security)" -ForegroundColor White
Write-Host "3. Verifier la structure de la table" -ForegroundColor White
Write-Host "4. Temporairement commenter la requete user_applications dans admin/page.tsx" -ForegroundColor White

Write-Host ""
Write-Host "Pour corriger rapidement, vous pouvez:" -ForegroundColor Yellow
Write-Host "- Commenter temporairement la ligne qui charge user_applications" -ForegroundColor White
Write-Host "- Ou creer la table user_applications si elle n'existe pas" -ForegroundColor White
