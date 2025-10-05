# Script PowerShell pour initialiser le système de notifications
Write-Host "🔧 Initialisation du système de notifications IAHome..." -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Configuration des tables de notifications dans Supabase..." -ForegroundColor Yellow

# Appeler l'API de configuration des notifications
try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/admin/setup-notifications" -Method POST -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Système de notifications configuré avec succès !" -ForegroundColor Green
        Write-Host "📊 Nombre de paramètres créés: $($response.settingsCount)" -ForegroundColor Green
        
        if ($response.settings) {
            Write-Host "📝 Types de notifications configurés:" -ForegroundColor Cyan
            foreach ($setting in $response.settings) {
                $status = if ($setting.is_enabled) { "✅ Activé" } else { "❌ Désactivé" }
                Write-Host "  - $($setting.name) ($($setting.event_type)): $status" -ForegroundColor White
            }
        }
    } else {
        Write-Host "❌ Erreur lors de la configuration: $($response.error)" -ForegroundColor Red
        if ($response.details) {
            Write-Host "Détails: $($response.details)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Erreur lors de l'appel de l'API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 Vérification du statut Resend..." -ForegroundColor Yellow

# Vérifier le statut de Resend
try {
    $resendResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/test-resend-domain" -Method GET
    
    if ($resendResponse.success) {
        Write-Host "✅ Resend configuré correctement" -ForegroundColor Green
        Write-Host "📧 Email d'expédition: $($resendResponse.config.fromEmail)" -ForegroundColor Green
        Write-Host "🌐 Domaines disponibles: $($resendResponse.domains.count)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Problème avec la configuration Resend" -ForegroundColor Yellow
        Write-Host "Erreur: $($resendResponse.error)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification de Resend: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Test d'envoi d'email..." -ForegroundColor Yellow

# Demander un email de test
$testEmail = Read-Host "Entrez votre email pour tester l'envoi (ou appuyez sur Entrée pour ignorer)"
if ($testEmail -and $testEmail -match "^[^\s@]+@[^\s@]+\.[^\s@]+$") {
    try {
        $testResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/test-resend-domain" -Method POST -ContentType "application/json" -Body (@{email = $testEmail} | ConvertTo-Json)
        
        if ($testResponse.success) {
            Write-Host "✅ Email de test envoyé avec succès à $testEmail !" -ForegroundColor Green
            Write-Host "📧 ID de l'email: $($testResponse.emailId)" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur lors de l'envoi du test: $($testResponse.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur lors de l'envoi du test: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️ Test d'email ignoré" -ForegroundColor Yellow
}

Write-Host "`n🎉 Initialisation terminée !" -ForegroundColor Green
Write-Host "📱 Vous pouvez maintenant accéder à la page d'administration des notifications:" -ForegroundColor Cyan
Write-Host "   https://iahome.fr/admin/notifications" -ForegroundColor White
Write-Host "`n💡 Fonctionnalités disponibles:" -ForegroundColor Cyan
Write-Host "   - Activation/désactivation des types de notifications" -ForegroundColor White
Write-Host "   - Modification des templates d'emails" -ForegroundColor White
Write-Host "   - Visualisation des logs d'envoi" -ForegroundColor White
Write-Host "   - Test d'envoi d'emails" -ForegroundColor White
Write-Host "   - Intégration complète avec Resend" -ForegroundColor White
