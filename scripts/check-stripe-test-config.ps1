# Script pour vérifier la configuration Stripe en mode test
# Usage: .\scripts\check-stripe-test-config.ps1

Write-Host "`n🔍 Vérification de la Configuration Stripe (Mode Test)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

# Vérifier les variables d'environnement
Write-Host "`n📋 Variables d'environnement :" -ForegroundColor Yellow

$envVars = @(
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_FORCE_TEST_PRICE'
)

$allConfigured = $true

foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var, 'Process')
    
    if (-not $value) {
        # Essayer de charger depuis .env.local
        if (Test-Path '.env.local') {
            $content = Get-Content '.env.local' -Raw
            if ($content -match "$var=(.+)") {
                $value = $matches[1].Trim()
            }
        }
    }
    
    if ($value) {
        # Masquer la valeur pour la sécurité
        if ($var -like '*SECRET*' -or $var -like '*KEY*') {
            $displayValue = if ($value.Length -gt 10) {
                $value.Substring(0, 10) + '...' + $value.Substring($value.Length - 4)
            } else {
                '***'
            }
            Write-Host "   ✅ $var : $displayValue" -ForegroundColor Green
        } else {
            Write-Host "   ✅ $var : $value" -ForegroundColor Green
        }
        
        # Vérifier si c'est une clé de test
        if ($var -like '*STRIPE*KEY*' -and $value -notlike '*test*') {
            Write-Host "      ⚠️  Attention : Ce n'est pas une clé de test (ne commence pas par 'sk_test_' ou 'pk_test_')" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ $var : Non configuré" -ForegroundColor Red
        $allConfigured = $false
    }
}

# Vérifier Stripe CLI
Write-Host "`n🔧 Outils Stripe :" -ForegroundColor Yellow

$stripeCli = Get-Command stripe -ErrorAction SilentlyContinue
if ($stripeCli) {
    Write-Host "   ✅ Stripe CLI installé : $($stripeCli.Source)" -ForegroundColor Green
    
    try {
        $version = stripe --version 2>&1
        Write-Host "      Version : $version" -ForegroundColor Gray
    } catch {
        Write-Host "      ⚠️  Impossible de récupérer la version" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Stripe CLI non installé" -ForegroundColor Yellow
    Write-Host "      Installez-le depuis : https://stripe.com/docs/stripe-cli" -ForegroundColor Gray
}

# Vérifier l'accessibilité du webhook
Write-Host "`n🌐 Test d'accessibilité du webhook :" -ForegroundColor Yellow

$webhookUrl = 'https://iahome.fr/api/stripe-webhook'
Write-Host "   URL : $webhookUrl" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "$webhookUrl/test" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Webhook accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Webhook non accessible ou endpoint de test non disponible" -ForegroundColor Yellow
    Write-Host "      Erreur : $($_.Exception.Message)" -ForegroundColor Gray
}

# Résumé
Write-Host "`n📊 Résumé :" -ForegroundColor Cyan

if ($allConfigured) {
    Write-Host "   ✅ Configuration complète" -ForegroundColor Green
    Write-Host "`n💡 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "   1. Vérifiez que les clés sont bien des clés de TEST (sk_test_...)" -ForegroundColor White
    Write-Host "   2. Configurez le webhook de test dans Stripe Dashboard" -ForegroundColor White
    Write-Host "   3. Testez un paiement avec une carte de test : 4242 4242 4242 4242" -ForegroundColor White
    Write-Host "   4. Vérifiez les logs du serveur pour voir si le webhook est reçu" -ForegroundColor White
} else {
    Write-Host "   ❌ Configuration incomplète" -ForegroundColor Red
    Write-Host "`n💡 Actions requises :" -ForegroundColor Yellow
    Write-Host "   1. Configurez les variables d'environnement manquantes dans .env.local" -ForegroundColor White
    Write-Host "   2. Redémarrez le serveur Next.js" -ForegroundColor White
}

Write-Host "`n✅ Vérification terminée" -ForegroundColor Green
