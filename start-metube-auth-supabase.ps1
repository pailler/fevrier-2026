Write-Host "🚀 Démarrage du serveur d'authentification MeTube avec Supabase..." -ForegroundColor Green

# Vérifier les variables d'environnement
if (-not $env:NEXT_PUBLIC_SUPABASE_URL -or -not $env:NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    Write-Host "⚠️ Variables d'environnement Supabase manquantes" -ForegroundColor Yellow
    Write-Host "Définition des variables d'environnement..." -ForegroundColor Cyan
    
    # Charger les variables depuis .env.local si disponible
    if (Test-Path ".env.local") {
        Write-Host "📄 Chargement des variables depuis .env.local..." -ForegroundColor Cyan
        Get-Content ".env.local" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                [Environment]::SetEnvironmentVariable($name, $value, "Process")
                Write-Host "• $name = $($value.Substring(0, [Math]::Min(20, $value.Length)))..." -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "❌ Fichier .env.local non trouvé" -ForegroundColor Red
        Write-Host "Veuillez définir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Yellow
        exit 1
    }
}

# Vérifier que les variables sont définies
if (-not $env:NEXT_PUBLIC_SUPABASE_URL -or -not $env:NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    Write-Host "❌ Variables Supabase toujours manquantes après chargement" -ForegroundColor Red
    Write-Host "NEXT_PUBLIC_SUPABASE_URL: $($env:NEXT_PUBLIC_SUPABASE_URL)" -ForegroundColor Yellow
    Write-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY: $($env:NEXT_PUBLIC_SUPABASE_ANON_KEY)" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Variables Supabase configurées" -ForegroundColor Green
Write-Host "• URL: $($env:NEXT_PUBLIC_SUPABASE_URL)" -ForegroundColor White
Write-Host "• Clé: $($env:NEXT_PUBLIC_SUPABASE_ANON_KEY.Substring(0, 20))..." -ForegroundColor White

# Démarrer le serveur
Write-Host ""
Write-Host "🔐 Démarrage du serveur d'authentification..." -ForegroundColor Cyan
Write-Host "• Page d'identification: http://localhost:8085" -ForegroundColor White
Write-Host "• MeTube direct: http://192.168.1.150:8081" -ForegroundColor White
Write-Host "• Synchronisé avec Supabase" -ForegroundColor White

node metube-auth-server.js
