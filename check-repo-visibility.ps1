# Script pour vérifier la visibilité du repository GitHub
# Compatible Windows PowerShell

Write-Host "🔍 Vérification de la visibilité du repository GitHub..." -ForegroundColor Cyan

# Récupérer l'URL du repository
$repoUrl = git remote get-url origin
Write-Host "Repository URL: $repoUrl" -ForegroundColor Yellow

# Extraire le nom du repository
if ($repoUrl -match "github\.com/([^/]+)/([^/]+)\.git") {
    $owner = $matches[1]
    $repo = $matches[2]
    Write-Host "Owner: $owner" -ForegroundColor Yellow
    Write-Host "Repository: $repo" -ForegroundColor Yellow
} else {
    Write-Host "❌ Impossible d'extraire les informations du repository" -ForegroundColor Red
    exit 1
}

# Vérifier si GitHub CLI est installé
try {
    gh --version | Out-Null
    Write-Host "✅ GitHub CLI détecté" -ForegroundColor Green
    
    # Utiliser GitHub CLI pour vérifier la visibilité
    Write-Host "🔍 Vérification via GitHub CLI..." -ForegroundColor Yellow
    $repoInfo = gh repo view "$owner/$repo" --json visibility,private,url 2>$null
    
    if ($repoInfo) {
        $repoData = $repoInfo | ConvertFrom-Json
        Write-Host "`n📊 Informations du repository:" -ForegroundColor Cyan
        Write-Host "   URL: $($repoData.url)" -ForegroundColor White
        Write-Host "   Visibilité: $($repoData.visibility)" -ForegroundColor White
        Write-Host "   Privé: $($repoData.private)" -ForegroundColor White
        
        if ($repoData.private -eq $true) {
            Write-Host "`n✅ Le repository est PRIVÉ" -ForegroundColor Green
        } else {
            Write-Host "`n⚠️  Le repository est PUBLIC" -ForegroundColor Red
            Write-Host "   Recommandation: Rendez-le privé pour la sécurité" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Impossible de récupérer les informations du repository" -ForegroundColor Red
    }
    
} catch {
    Write-Host "⚠️  GitHub CLI non installé, tentative via API..." -ForegroundColor Yellow
    
    # Demander le token GitHub si nécessaire
    Write-Host "`n🔑 Pour vérifier la visibilité, vous devez fournir un token GitHub:" -ForegroundColor Cyan
    Write-Host "   1. Allez sur https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "   2. Créez un nouveau token avec les permissions 'repo'" -ForegroundColor White
    Write-Host "   3. Entrez le token ci-dessous" -ForegroundColor White
    
    $token = Read-Host "Token GitHub (ou appuyez sur Entrée pour ignorer)"
    
    if ($token) {
        try {
            $headers = @{
                "Authorization" = "token $token"
                "Accept" = "application/vnd.github.v3+json"
            }
            
            $apiUrl = "https://api.github.com/repos/$owner/$repo"
            $response = Invoke-RestMethod -Uri $apiUrl -Headers $headers -Method Get
            
            Write-Host "`n📊 Informations du repository:" -ForegroundColor Cyan
            Write-Host "   URL: $($response.html_url)" -ForegroundColor White
            Write-Host "   Privé: $($response.private)" -ForegroundColor White
            
            if ($response.private -eq $true) {
                Write-Host "`n✅ Le repository est PRIVÉ" -ForegroundColor Green
            } else {
                Write-Host "`n⚠️  Le repository est PUBLIC" -ForegroundColor Red
                Write-Host "   Recommandation: Rendez-le privé pour la sécurité" -ForegroundColor Yellow
            }
            
        } catch {
            Write-Host "❌ Erreur lors de la vérification via API: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "`n⚠️  Vérification manuelle requise:" -ForegroundColor Yellow
        Write-Host "   1. Allez sur https://github.com/$owner/$repo" -ForegroundColor White
        Write-Host "   2. Vérifiez si le repository est marqué comme 'Private'" -ForegroundColor White
        Write-Host "   3. Si public, allez dans Settings > General > Danger Zone > Change repository visibility" -ForegroundColor White
    }
}

Write-Host "`n🔒 Recommandations de sécurité:" -ForegroundColor Cyan
Write-Host "   • Gardez le repository privé pour protéger les données sensibles" -ForegroundColor White
Write-Host "   • Vérifiez les permissions des collaborateurs" -ForegroundColor White
Write-Host "   • Utilisez des secrets GitHub pour les variables d'environnement" -ForegroundColor White
Write-Host "   • Activez la protection des branches si nécessaire" -ForegroundColor White

