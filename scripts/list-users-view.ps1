# Script pour lister les utilisateurs de la table users_view
Write-Host "Liste des utilisateurs de la table users_view..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/list-users" -Method GET
    Write-Host "API accessible" -ForegroundColor Green
    
    if ($response.success) {
        Write-Host "Utilisateurs trouves: $($response.summary.totalUsers)" -ForegroundColor Cyan
        foreach ($user in $response.users) {
            Write-Host "ID: $($user.id) - Email: $($user.email) - Role: $($user.role)" -ForegroundColor White
        }
        
        Write-Host "Modules disponibles: $($response.summary.totalModules)" -ForegroundColor Cyan
        foreach ($module in $response.modules) {
            Write-Host "ID: $($module.id) - Titre: $($module.title)" -ForegroundColor White
        }
        
        if ($response.users.Count -gt 0) {
            $firstUser = $response.users[0]
            Write-Host "Utilisateur pour test: $($firstUser.email)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Liste terminee!" -ForegroundColor Green






