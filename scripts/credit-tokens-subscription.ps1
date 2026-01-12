# Script pour créditer manuellement les tokens d'abonnement
# Usage: .\scripts\credit-tokens-subscription.ps1 -Email "regispailler@gmail.com" -Tokens 3000

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$false)]
    [int]$Tokens = 3000,
    
    [Parameter(Mandatory=$false)]
    [string]$PackageType = "subscription_monthly"
)

$baseUrl = "https://iahome.fr"
$apiUrl = "$baseUrl/api/credit-subscription-tokens"

Write-Host "`n🔄 Crédit manuel des tokens d'abonnement" -ForegroundColor Cyan
Write-Host "   Email: $Email" -ForegroundColor Gray
Write-Host "   Tokens: $Tokens" -ForegroundColor Gray
Write-Host "   Package: $PackageType" -ForegroundColor Gray
Write-Host "`n📡 Appel de l'API..." -ForegroundColor Yellow

$body = @{
    userEmail = $Email
    tokens = $Tokens
    packageType = $PackageType
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -Body $body
    
    Write-Host "`n✅ Succès !" -ForegroundColor Green
    Write-Host "   Message: $($response.message)" -ForegroundColor Gray
    Write-Host "   Tokens précédents: $($response.previousTokens)" -ForegroundColor Gray
    Write-Host "   Nouveaux tokens: $($response.newTokens)" -ForegroundColor Green
} catch {
    Write-Host "`n❌ Erreur lors du crédit des tokens" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "   Détails: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`n✅ Tokens crédités avec succès !" -ForegroundColor Green
