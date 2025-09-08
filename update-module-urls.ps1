# Script PowerShell pour mettre à jour les URLs des modules dans Supabase
# Remplace les URLs externes par les routes sécurisées internes

Write-Host "🔒 Mise à jour des URLs des modules vers les routes sécurisées..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si le fichier SQL existe
if (-not (Test-Path "update-module-urls.sql")) {
    Write-Host "❌ Erreur: Le fichier update-module-urls.sql n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Contenu du script SQL à exécuter :" -ForegroundColor Yellow
Write-Host ""

# Afficher le contenu du script SQL
Get-Content "update-module-urls.sql" | ForEach-Object {
    if ($_ -match "UPDATE modules") {
        Write-Host "🔄 $_" -ForegroundColor Green
    } elseif ($_ -match "SELECT") {
        Write-Host "📊 $_" -ForegroundColor Blue
    } elseif ($_ -match "--") {
        Write-Host "💬 $_" -ForegroundColor Gray
    } else {
        Write-Host "   $_" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "⚠️  ATTENTION : Ce script va modifier les URLs dans la table 'modules'" -ForegroundColor Yellow
Write-Host "   Les URLs externes seront remplacées par des routes sécurisées internes" -ForegroundColor Yellow
Write-Host ""

$confirmation = Read-Host "Voulez-vous continuer ? (oui/non)"

if ($confirmation -ne "oui") {
    Write-Host "❌ Opération annulée" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "📝 Instructions pour exécuter le script :" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Allez sur https://supabase.com" -ForegroundColor White
Write-Host "2. Connectez-vous à votre projet IAHome" -ForegroundColor White
Write-Host "3. Allez dans 'SQL Editor'" -ForegroundColor White
Write-Host "4. Copiez le contenu du fichier 'update-module-urls.sql'" -ForegroundColor White
Write-Host "5. Collez-le dans l'éditeur SQL" -ForegroundColor White
Write-Host "6. Cliquez sur 'Run' pour exécuter le script" -ForegroundColor White
Write-Host ""

Write-Host "✅ Le script est prêt à être exécuté dans Supabase" -ForegroundColor Green
Write-Host ""

# Ouvrir le fichier SQL dans l'éditeur par défaut
Write-Host "🔧 Ouverture du fichier SQL dans l'éditeur..." -ForegroundColor Cyan
Start-Process "update-module-urls.sql"

Write-Host ""
Write-Host "🎯 Après l'exécution, vérifiez que toutes les URLs sont maintenant sécurisées !" -ForegroundColor Green
