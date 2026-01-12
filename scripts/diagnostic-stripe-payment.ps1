# Script de diagnostic pour les paiements Stripe
# Usage: .\scripts\diagnostic-stripe-payment.ps1

Write-Host "`n🔍 Diagnostic complet du workflow de paiement Stripe" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray

# 1. Vérifier les variables d'environnement
Write-Host "`n1️⃣ Vérification des variables d'environnement..." -ForegroundColor Yellow

$envFile = "env.production.local"
if (Test-Path $envFile) {
    Write-Host "   ✅ Fichier $envFile trouvé" -ForegroundColor Green
    
    $stripeSecretKey = Select-String -Path $envFile -Pattern "STRIPE_SECRET_KEY" | ForEach-Object { $_.Line -replace ".*=", "" }
    $stripePublishableKey = Select-String -Path $envFile -Pattern "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" | ForEach-Object { $_.Line -replace ".*=", "" }
    $webhookSecret = Select-String -Path $envFile -Pattern "STRIPE_WEBHOOK_SECRET" | ForEach-Object { $_.Line -replace ".*=", "" }
    
    if ($stripeSecretKey -and $stripeSecretKey -notmatch "^#") {
        $keyPrefix = if ($stripeSecretKey -match "sk_live") { "sk_live" } elseif ($stripeSecretKey -match "sk_test") { "sk_test" } else { "inconnu" }
        Write-Host "   ✅ STRIPE_SECRET_KEY configuré (préfixe: $keyPrefix)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ STRIPE_SECRET_KEY manquant ou commenté" -ForegroundColor Red
    }
    
    if ($stripePublishableKey -and $stripePublishableKey -notmatch "^#") {
        $keyPrefix = if ($stripePublishableKey -match "pk_live") { "pk_live" } elseif ($stripePublishableKey -match "pk_test") { "pk_test" } else { "inconnu" }
        Write-Host "   ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY configuré (préfixe: $keyPrefix)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquant ou commenté" -ForegroundColor Red
    }
    
    if ($webhookSecret -and $webhookSecret -notmatch "^#") {
        Write-Host "   ✅ STRIPE_WEBHOOK_SECRET configuré" -ForegroundColor Green
    } else {
        Write-Host "   ❌ STRIPE_WEBHOOK_SECRET manquant ou commenté" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Fichier $envFile non trouvé" -ForegroundColor Red
}

# 2. Vérifier l'endpoint de test
Write-Host "`n2️⃣ Test de l'endpoint webhook..." -ForegroundColor Yellow

try {
    $testResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/webhooks/stripe/test" -Method GET -ErrorAction Stop
    Write-Host "   ✅ Endpoint accessible: $($testResponse.status)" -ForegroundColor Green
    Write-Host "   📋 Message: $($testResponse.message)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Endpoint non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Instructions pour vérifier dans Stripe Dashboard
Write-Host "`n3️⃣ Vérifications à faire dans Stripe Dashboard:" -ForegroundColor Yellow
Write-Host "   a) Developers → Webhooks" -ForegroundColor White
Write-Host "      • URL: https://iahome.fr/api/webhooks/stripe" -ForegroundColor Gray
Write-Host "      • Événements sélectionnés:" -ForegroundColor Gray
Write-Host "        - checkout.session.completed" -ForegroundColor Gray
Write-Host "        - invoice.payment_succeeded" -ForegroundColor Gray
Write-Host "        - invoice.payment_failed" -ForegroundColor Gray
Write-Host "        - customer.subscription.deleted" -ForegroundColor Gray
Write-Host "   b) Checkout → Sessions" -ForegroundColor White
Write-Host "      • Y a-t-il des sessions récentes ?" -ForegroundColor Gray
Write-Host "   c) Paiements" -ForegroundColor White
Write-Host "      • Y a-t-il des paiements récents ?" -ForegroundColor Gray
Write-Host "   d) Événements" -ForegroundColor White
Write-Host "      • Y a-t-il des événements checkout.session.completed ?" -ForegroundColor Gray
Write-Host "   e) Webhooks → Logs" -ForegroundColor White
Write-Host "      • Y a-t-il des tentatives d'envoi ?" -ForegroundColor Gray
Write-Host "      • Y a-t-il des erreurs (codes 4xx ou 5xx) ?" -ForegroundColor Gray

# 4. Instructions pour vérifier les logs
Write-Host "`n4️⃣ Vérifications dans les logs du serveur:" -ForegroundColor Yellow
Write-Host "   Cherchez ces logs dans l'ordre:" -ForegroundColor White
Write-Host "   a) '🔄 Création session Stripe V2' → La session est créée" -ForegroundColor Cyan
Write-Host "   b) '✅ Session abonnement créée' → Session ID retourné" -ForegroundColor Cyan
Write-Host "   c) '🔔 Webhook Stripe reçu' → Le webhook arrive" -ForegroundColor Cyan
Write-Host "   d) '✅ Session de paiement complétée' → Le webhook traite la session" -ForegroundColor Cyan
Write-Host "   e) '✅ 3000 tokens crédités' → Les tokens sont ajoutés" -ForegroundColor Cyan

# 5. Questions importantes
Write-Host "`n5️⃣ Questions importantes:" -ForegroundColor Yellow
Write-Host "   a) Avez-vous complété le paiement sur Stripe Checkout ?" -ForegroundColor White
Write-Host "   b) Avez-vous été redirigé vers /payment-success ?" -ForegroundColor White
Write-Host "   c) Quel est le statut du paiement dans Stripe Dashboard ?" -ForegroundColor White
Write-Host "   d) Y a-t-il des erreurs dans les logs du serveur ?" -ForegroundColor White

Write-Host "`n" -ForegroundColor Gray
