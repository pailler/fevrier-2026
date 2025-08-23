# Script de migration pour ajouter le champ status aux articles de blog
# Ce script exécute la migration SQL dans Supabase

Write-Host "=== Migration du champ status pour les articles de blog ===" -ForegroundColor Green

# Vérifier si le fichier SQL existe
$sqlFile = "migrate-blog-status.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "Erreur: Le fichier $sqlFile n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "Fichier SQL trouvé: $sqlFile" -ForegroundColor Yellow

# Lire le contenu du fichier SQL
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "Contenu du script SQL:" -ForegroundColor Cyan
Write-Host $sqlContent -ForegroundColor Gray

Write-Host "`n=== Instructions pour exécuter la migration ===" -ForegroundColor Green
Write-Host "1. Connectez-vous à votre dashboard Supabase" -ForegroundColor Yellow
Write-Host "2. Allez dans la section 'SQL Editor'" -ForegroundColor Yellow
Write-Host "3. Copiez-collez le contenu du script SQL ci-dessus" -ForegroundColor Yellow
Write-Host "4. Exécutez le script" -ForegroundColor Yellow
Write-Host "5. Vérifiez que la migration s'est bien passée" -ForegroundColor Yellow

Write-Host "`n=== Vérification après migration ===" -ForegroundColor Green
Write-Host "Après avoir exécuté le script SQL, vous devriez voir:" -ForegroundColor Yellow
Write-Host "- Une nouvelle colonne 'status' dans la table blog_articles" -ForegroundColor Gray
Write-Host "- Les articles existants avec is_published=true auront status='published'" -ForegroundColor Gray
Write-Host "- Les articles existants avec is_published=false auront status='draft'" -ForegroundColor Gray
Write-Host "- Un index sur la colonne status pour de meilleures performances" -ForegroundColor Gray

Write-Host "`n=== Prochaines étapes ===" -ForegroundColor Green
Write-Host "1. Testez l'interface admin du blog" -ForegroundColor Yellow
Write-Host "2. Vérifiez que les articles en brouillon ne s'affichent pas sur le blog public" -ForegroundColor Yellow
Write-Host "3. Testez la création et modification d'articles avec le nouveau champ status" -ForegroundColor Yellow

Write-Host "`nMigration prête à être exécutée!" -ForegroundColor Green
