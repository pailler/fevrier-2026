# Script pour désactiver l'activation de home-assistant pour l'utilisateur "regis pailler"
# Ce script appelle l'API de désactivation

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Désactivation Home Assistant - Regis Pailler        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# URL de l'API (ajustez selon votre environnement)
$apiUrl = "http://localhost:3000/api/admin/deactivate-home-assistant"

# Si vous êtes en production, utilisez :
# $apiUrl = "https://iahome.fr/api/admin/deactivate-home-assistant"

Write-Host "`n🔍 Recherche de l'utilisateur 'regis pailler'..." -ForegroundColor Yellow

try {
    # Appeler l'API pour désactiver l'activation
    $body = @{
        userName = "regis pailler"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop

    if ($response.success) {
        Write-Host "`n✅ Succès !" -ForegroundColor Green
        Write-Host "   Utilisateur: $($response.user.email)" -ForegroundColor White
        Write-Host "   Nom: $($response.user.full_name)" -ForegroundColor White
        Write-Host "   Activations désactivées: $($response.deactivatedCount)" -ForegroundColor White
        
        if ($response.deactivatedActivations -and $response.deactivatedActivations.Count -gt 0) {
            Write-Host "`n📋 Détails des activations désactivées:" -ForegroundColor Cyan
            foreach ($activation in $response.deactivatedActivations) {
                Write-Host "   - ID: $($activation.id)" -ForegroundColor Gray
                Write-Host "     Module: $($activation.module_id)" -ForegroundColor Gray
                Write-Host "     Titre: $($activation.module_title)" -ForegroundColor Gray
                Write-Host "     Créé le: $($activation.created_at)" -ForegroundColor Gray
            }
        }
        
        Write-Host "`n✅ L'application home-assistant a été désactivée pour cet utilisateur." -ForegroundColor Green
        Write-Host "   Elle n'apparaîtra plus dans la page /encours." -ForegroundColor Gray
        Write-Host "   L'application et le workflow d'activation restent intacts." -ForegroundColor Gray
        
    } else {
        Write-Host "`n❌ Erreur: $($response.error)" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "`n❌ Erreur lors de l'appel à l'API:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Réponse: $responseBody" -ForegroundColor Yellow
    }
    
    exit 1
}

Write-Host "`nAppuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
