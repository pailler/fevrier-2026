# Script pour ajouter l'événement app_accessed aux notifications
Write-Host "🔔 Ajout de l'événement app_accessed aux notifications..." -ForegroundColor Blue

# Charger les variables d'environnement
$envPath = ".env.local"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
    Write-Host "✅ Variables d'environnement chargées depuis .env.local" -ForegroundColor Green
} else {
    Write-Host "⚠️ Fichier .env.local non trouvé" -ForegroundColor Yellow
}

# Vérifier les variables requises
$requiredVars = @('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY')
$missingVars = @()

foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        $missingVars += $var
    }
}

if ($missingVars.Count -gt 0) {
    Write-Host "❌ Variables d'environnement manquantes: $($missingVars -join ', ')" -ForegroundColor Red
    Write-Host "Veuillez les ajouter dans .env.local" -ForegroundColor Yellow
    exit 1
}

# Créer le script SQL temporaire
$sqlScript = @"
-- Ajouter l'événement app_accessed s'il n'existe pas déjà
INSERT INTO notification_settings (event_type, event_name, event_description, email_template_subject, email_template_body) 
VALUES (
    'app_accessed', 
    'Accès à une application', 
    'Un utilisateur a accédé à une application', 
    'Accès à une application - IAHome', 
    'Un utilisateur a accédé à l''application {appName} sur IAHome.'
) 
ON CONFLICT (event_type) DO UPDATE SET
    event_name = EXCLUDED.event_name,
    event_description = EXCLUDED.event_description,
    email_template_subject = EXCLUDED.email_template_subject,
    email_template_body = EXCLUDED.email_template_body,
    updated_at = NOW();
"@

$tempSqlFile = "temp_add_app_accessed.sql"
$sqlScript | Out-File -FilePath $tempSqlFile -Encoding UTF8

Write-Host "📝 Script SQL créé: $tempSqlFile" -ForegroundColor Blue

# Exécuter le script SQL
try {
    Write-Host "🚀 Exécution du script SQL..." -ForegroundColor Blue
    
    # Utiliser psql si disponible, sinon afficher les instructions
    $psqlPath = Get-Command psql -ErrorAction SilentlyContinue
    if ($psqlPath) {
        $supabaseUrl = [Environment]::GetEnvironmentVariable('NEXT_PUBLIC_SUPABASE_URL')
        $serviceRoleKey = [Environment]::GetEnvironmentVariable('SUPABASE_SERVICE_ROLE_KEY')
        
        # Extraire l'host et la base de données de l'URL Supabase
        if ($supabaseUrl -match 'https://([^.]+)\.supabase\.co') {
            $projectRef = $matches[1]
            $dbUrl = "postgresql://postgres:$serviceRoleKey@db.$projectRef.supabase.co:5432/postgres"
            
            Write-Host "🔗 Connexion à la base de données Supabase..." -ForegroundColor Blue
            psql $dbUrl -f $tempSqlFile
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Événement app_accessed ajouté avec succès !" -ForegroundColor Green
            } else {
                Write-Host "❌ Erreur lors de l'exécution du script SQL" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Impossible de parser l'URL Supabase" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ psql non trouvé. Voici les instructions manuelles:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Connectez-vous à votre base de données Supabase" -ForegroundColor White
        Write-Host "2. Exécutez le script SQL suivant:" -ForegroundColor White
        Write-Host ""
        Write-Host $sqlScript -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Ou utilisez l'interface web Supabase SQL Editor" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Nettoyer le fichier temporaire
    if (Test-Path $tempSqlFile) {
        Remove-Item $tempSqlFile
        Write-Host "🧹 Fichier temporaire supprimé" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🎉 Script terminé !" -ForegroundColor Green
Write-Host "L'événement 'app_accessed' est maintenant disponible dans les notifications." -ForegroundColor White
