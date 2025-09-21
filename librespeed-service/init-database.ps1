# Script pour initialiser la base de données LibreSpeed
Write-Host "🗄️ Initialisation de la base de données LibreSpeed..." -ForegroundColor Cyan

# Configuration de la base de données
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "qrcode_db"
$DB_USER = "qrcode_user"
$DB_PASSWORD = "qrcode_password"

# Chemin vers le fichier SQL
$SQL_FILE = "init_session_tokens.sql"

Write-Host "📋 Exécution du script SQL: $SQL_FILE" -ForegroundColor Yellow

# Exécuter le script SQL
try {
    $env:PGPASSWORD = $DB_PASSWORD
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $SQL_FILE
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Base de données initialisée avec succès!" -ForegroundColor Green
        Write-Host "📊 Table librespeed_session_tokens créée" -ForegroundColor Green
        Write-Host "🔧 Index et fonctions créés" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'initialisation de la base de données" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de l'exécution du script SQL: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    # Nettoyer la variable d'environnement
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`n🎉 Initialisation terminée!" -ForegroundColor Green
Write-Host "💡 Vous pouvez maintenant utiliser les tokens de session LibreSpeed" -ForegroundColor Cyan
