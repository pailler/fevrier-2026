# Script pour passer formateur_tic@hotmail.com en admin
Write-Host "🔧 Passage de formateur_tic@hotmail.com en administrateur" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# Configuration Supabase
$supabaseUrl = "https://your-project.supabase.co"
$supabaseKey = "your-anon-key"

# Email de l'utilisateur à promouvoir
$userEmail = "formateur_tic@hotmail.com"

Write-Host "`n1. Recherche de l'utilisateur $userEmail..." -ForegroundColor Yellow

try {
    # Rechercher l'utilisateur par email
    $headers = @{
        "apikey" = $supabaseKey
        "Authorization" = "Bearer $supabaseKey"
        "Content-Type" = "application/json"
    }
    
    # Récupérer l'utilisateur depuis auth.users
    $authResponse = Invoke-RestMethod -Uri "$supabaseUrl/auth/v1/admin/users" -Method GET -Headers $headers
    
    $targetUser = $authResponse.users | Where-Object { $_.email -eq $userEmail }
    
    if ($targetUser) {
        Write-Host "✅ Utilisateur trouvé: $($targetUser.email)" -ForegroundColor Green
        Write-Host "   ID: $($targetUser.id)" -ForegroundColor Gray
        Write-Host "   Créé le: $($targetUser.created_at)" -ForegroundColor Gray
        
        $userId = $targetUser.id
        
        Write-Host "`n2. Mise à jour du rôle en admin..." -ForegroundColor Yellow
        
        # Mettre à jour le profil avec le rôle admin
        $profileData = @{
            id = $userId
            role = "admin"
        } | ConvertTo-Json
        
        $profileResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/profiles" -Method POST -Headers $headers -Body $profileData
        
        Write-Host "✅ Rôle admin attribué avec succès!" -ForegroundColor Green
        
        Write-Host "`n3. Vérification du profil..." -ForegroundColor Yellow
        
        # Vérifier que le profil a été mis à jour
        $checkResponse = Invoke-RestMethod -Uri "$supabaseUrl/rest/v1/profiles?id=eq.$userId" -Method GET -Headers $headers
        
        if ($checkResponse -and $checkResponse.role -eq "admin") {
            Write-Host "✅ Vérification réussie - L'utilisateur est maintenant admin!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Vérification échouée - Vérifiez manuellement dans Supabase" -ForegroundColor Yellow
        }
        
        Write-Host "`n4. Fonctionnalités admin disponibles:" -ForegroundColor Yellow
        Write-Host "   • Accès au dashboard admin: /admin/dashboard" -ForegroundColor White
        Write-Host "   • Gestion des utilisateurs: /admin/users" -ForegroundColor White
        Write-Host "   • Gestion des modules: /admin/modules" -ForegroundColor White
        Write-Host "   • Gestion des tokens: /admin/tokens" -ForegroundColor White
        Write-Host "   • Statistiques: /admin/statistics" -ForegroundColor White
        Write-Host "   • Gestion des paiements: /admin/payments" -ForegroundColor White
        
        Write-Host "`n🎉 SUCCÈS!" -ForegroundColor Green
        Write-Host "L'utilisateur $userEmail a été promu administrateur avec succès!" -ForegroundColor Green
        Write-Host "Il peut maintenant accéder à toutes les fonctionnalités d'administration." -ForegroundColor Green
        
    } else {
        Write-Host "❌ Utilisateur $userEmail non trouvé!" -ForegroundColor Red
        Write-Host "Vérifiez que l'utilisateur existe dans Supabase Auth." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Erreur lors de la promotion en admin: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Vérifiez la configuration Supabase et les permissions." -ForegroundColor Yellow
}

Write-Host "`n📋 Instructions pour l'utilisateur:" -ForegroundColor Cyan
Write-Host "1. Se connecter à l'application avec $userEmail" -ForegroundColor White
Write-Host "2. Aller sur https://iahome.fr/admin pour accéder au dashboard" -ForegroundColor White
Write-Host "3. Toutes les fonctionnalités admin sont maintenant disponibles" -ForegroundColor White

