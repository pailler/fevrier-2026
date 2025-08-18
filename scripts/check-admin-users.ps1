Write-Host "Verification des utilisateurs admin..." -ForegroundColor Green

try {
    # Tester l'API pour lister les utilisateurs
    Write-Host "`nTest de l'API list-users..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/list-users" -UseBasicParsing -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        $users = $response.Content | ConvertFrom-Json
        
        if ($users.success) {
            Write-Host "Utilisateurs recuperes avec succes!" -ForegroundColor Green
            
            Write-Host "`nListe des utilisateurs:" -ForegroundColor Cyan
            foreach ($user in $users.users) {
                $role = if ($user.role) { $user.role } else { "user" }
                $status = if ($role -eq "admin") { "ADMIN" } else { "USER" }
                $color = if ($role -eq "admin") { "Green" } else { "White" }
                
                Write-Host "  [$status] $($user.email) (Role: $role)" -ForegroundColor $color
            }
            
            $adminCount = ($users.users | Where-Object { $_.role -eq "admin" }).Count
            Write-Host "`nNombre d'administrateurs: $adminCount" -ForegroundColor Yellow
            
            if ($adminCount -eq 0) {
                Write-Host "`nATTENTION: Aucun administrateur trouve!" -ForegroundColor Red
                Write-Host "Vous devez creer un compte admin pour acceder a la page tokens" -ForegroundColor Yellow
            }
            
        } else {
            Write-Host "Erreur API: $($users.error)" -ForegroundColor Red
        }
    } else {
        Write-Host "Erreur HTTP: $($response.StatusCode)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine!" -ForegroundColor Green




