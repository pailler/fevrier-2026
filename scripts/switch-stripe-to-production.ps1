# Script pour basculer vers le mode PRODUCTION Stripe
# Usage: .\scripts\switch-stripe-to-production.ps1

Write-Host "`n🔄 Basculement vers le mode PRODUCTION Stripe" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Vérifier que env.production.local existe
if (-not (Test-Path 'env.production.local')) {
    Write-Host "`n❌ Fichier env.production.local non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Lecture des clés de production depuis env.production.local..." -ForegroundColor Yellow

# Lire les clés de production
$prodContent = Get-Content 'env.production.local' -Raw

$stripeSecretKey = ''
$stripePublishableKey = ''
$stripeWebhookSecret = ''

if ($prodContent -match 'STRIPE_SECRET_KEY=(.+)') {
    $stripeSecretKey = $matches[1].Trim()
    Write-Host "   ✅ Clé secrète trouvée : $($stripeSecretKey.Substring(0, 15))..." -ForegroundColor Green
}

if ($prodContent -match 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=(.+)') {
    $stripePublishableKey = $matches[1].Trim()
    Write-Host "   ✅ Clé publique trouvée : $($stripePublishableKey.Substring(0, 15))..." -ForegroundColor Green
}

if ($prodContent -match 'STRIPE_WEBHOOK_SECRET=(.+)') {
    $stripeWebhookSecret = $matches[1].Trim()
    Write-Host "   ✅ Secret webhook trouvé : $($stripeWebhookSecret.Substring(0, 10))..." -ForegroundColor Green
}

if (-not $stripeSecretKey -or -not $stripePublishableKey -or -not $stripeWebhookSecret) {
    Write-Host "`n❌ Toutes les clés Stripe n'ont pas été trouvées dans env.production.local" -ForegroundColor Red
    exit 1
}

# Vérifier que ce sont bien des clés de production
if ($stripeSecretKey -notlike 'sk_live_*') {
    Write-Host "`n⚠️  Attention : La clé secrète ne semble pas être en production (ne commence pas par 'sk_live_')" -ForegroundColor Yellow
}

if ($stripePublishableKey -notlike 'pk_live_*') {
    Write-Host "`n⚠️  Attention : La clé publique ne semble pas être en production (ne commence pas par 'pk_live_')" -ForegroundColor Yellow
}

# Mettre à jour .env.local
Write-Host "`n📝 Mise à jour de .env.local..." -ForegroundColor Yellow

if (-not (Test-Path '.env.local')) {
    Write-Host "   ⚠️  Fichier .env.local n'existe pas, création..." -ForegroundColor Yellow
    New-Item -Path '.env.local' -ItemType File | Out-Null
}

$envLocalContent = Get-Content '.env.local' -Raw

# Mettre à jour ou ajouter STRIPE_SECRET_KEY
if ($envLocalContent -match 'STRIPE_SECRET_KEY=(.+)') {
    $envLocalContent = $envLocalContent -replace 'STRIPE_SECRET_KEY=.+', "STRIPE_SECRET_KEY=$stripeSecretKey"
    Write-Host "   ✅ STRIPE_SECRET_KEY mis à jour" -ForegroundColor Green
} else {
    $envLocalContent += "`nSTRIPE_SECRET_KEY=$stripeSecretKey"
    Write-Host "   ✅ STRIPE_SECRET_KEY ajouté" -ForegroundColor Green
}

# Mettre à jour ou ajouter NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
if ($envLocalContent -match 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=(.+)') {
    $envLocalContent = $envLocalContent -replace 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=.+', "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripePublishableKey"
    Write-Host "   ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY mis à jour" -ForegroundColor Green
} else {
    $envLocalContent += "`nNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$stripePublishableKey"
    Write-Host "   ✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ajouté" -ForegroundColor Green
}

# Mettre à jour ou ajouter STRIPE_WEBHOOK_SECRET
if ($envLocalContent -match 'STRIPE_WEBHOOK_SECRET=(.+)') {
    $envLocalContent = $envLocalContent -replace 'STRIPE_WEBHOOK_SECRET=.+', "STRIPE_WEBHOOK_SECRET=$stripeWebhookSecret"
    Write-Host "   ✅ STRIPE_WEBHOOK_SECRET mis à jour" -ForegroundColor Green
} else {
    $envLocalContent += "`nSTRIPE_WEBHOOK_SECRET=$stripeWebhookSecret"
    Write-Host "   ✅ STRIPE_WEBHOOK_SECRET ajouté" -ForegroundColor Green
}

# Désactiver STRIPE_FORCE_TEST_PRICE (ou le supprimer)
if ($envLocalContent -match 'STRIPE_FORCE_TEST_PRICE=(.+)') {
    $envLocalContent = $envLocalContent -replace 'STRIPE_FORCE_TEST_PRICE=.+', 'STRIPE_FORCE_TEST_PRICE=false'
    Write-Host "   ✅ STRIPE_FORCE_TEST_PRICE désactivé" -ForegroundColor Green
}

# Sauvegarder
Set-Content -Path '.env.local' -Value $envLocalContent -NoNewline

Write-Host "`n✅ .env.local mis à jour avec les clés de PRODUCTION" -ForegroundColor Green

Write-Host "`n📋 Résumé des changements :" -ForegroundColor Cyan
Write-Host "   • STRIPE_SECRET_KEY : $($stripeSecretKey.Substring(0, 15))... (PRODUCTION)" -ForegroundColor White
Write-Host "   • NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY : $($stripePublishableKey.Substring(0, 15))... (PRODUCTION)" -ForegroundColor White
Write-Host "   • STRIPE_WEBHOOK_SECRET : $($stripeWebhookSecret.Substring(0, 10))... (PRODUCTION)" -ForegroundColor White
Write-Host "   • STRIPE_FORCE_TEST_PRICE : false" -ForegroundColor White

Write-Host "`n💡 Prochaine étape : Redémarrez le serveur pour charger les nouvelles variables" -ForegroundColor Yellow
Write-Host "   Le serveur va être redémarré automatiquement..." -ForegroundColor White
