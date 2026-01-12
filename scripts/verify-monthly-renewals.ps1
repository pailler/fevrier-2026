# Script pour vérifier les renouvellements mensuels
# Usage: .\scripts\verify-monthly-renewals.ps1 -Email "regispailler@gmail.com"

param(
    [Parameter(Mandatory=$false)]
    [string]$Email = "regispailler@gmail.com"
)

Write-Host "`n🔍 Vérification des Renouvellements Mensuels" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "`n📧 Email : $Email" -ForegroundColor Yellow

# Vérifier via l'API
$apiUrl = "https://iahome.fr/api/verify-subscription-tokens"
$body = @{
    email = $Email
} | ConvertTo-Json

Write-Host "`n1️⃣ Vérification via l'API..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
    
    Write-Host "   ✅ Réponse reçue" -ForegroundColor Green
    Write-Host "`n📊 Résultats :" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    if ($response.tokens -eq 3000) {
        Write-Host "`n✅ Tokens corrects : 3000 (quota mensuel)" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️  Tokens : $($response.tokens) (attendu : 3000)" -ForegroundColor Yellow
    }
    
    if ($response.hasActiveSubscription) {
        Write-Host "✅ Abonnement actif" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Aucun abonnement actif" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Erreur lors de l'appel API" -ForegroundColor Red
    Write-Host "      Erreur : $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n2️⃣ Instructions pour vérification manuelle :" -ForegroundColor Yellow
Write-Host "   • Stripe Dashboard : https://dashboard.stripe.com/subscriptions" -ForegroundColor White
Write-Host "   • Webhooks : https://dashboard.stripe.com/webhooks" -ForegroundColor White
Write-Host "   • Vérifiez les événements 'invoice.payment_succeeded' avec billing_reason='subscription_cycle'" -ForegroundColor White
Write-Host "`n✅ Vérification terminée" -ForegroundColor Green
