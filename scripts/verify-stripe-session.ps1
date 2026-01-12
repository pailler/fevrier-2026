# Script pour vérifier manuellement une session Stripe
# Usage: .\scripts\verify-stripe-session.ps1 -SessionId "cs_live_..."

param(
    [Parameter(Mandatory=$true)]
    [string]$SessionId
)

$apiUrl = "https://iahome.fr/api/stripe/verify-session"
$body = @{
    sessionId = $SessionId
} | ConvertTo-Json

Write-Host "`n🔍 Vérification de la session Stripe: $SessionId" -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -Body $body
    Write-Host "`n✅ Résultat de la vérification:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    if ($response.verified) {
        Write-Host "`n✅ Session vérifiée avec succès !" -ForegroundColor Green
        if ($response.action -eq 'tokens_credited') {
            Write-Host "   Tokens crédités: $($response.tokens_credited)" -ForegroundColor Green
            Write-Host "   Nouveaux tokens: $($response.new_tokens)" -ForegroundColor Green
        }
    } else {
        Write-Host "`n⚠️ Session non vérifiée: $($response.reason)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "`n❌ Erreur lors de la vérification:" -ForegroundColor Red
    $_.Exception.Message | Write-Host -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails de l'erreur API : $($responseBody)" -ForegroundColor Red
    }
}
