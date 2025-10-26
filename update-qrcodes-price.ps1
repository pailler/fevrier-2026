# Script PowerShell pour mettre à jour le prix des QR codes à 100 tokens

Write-Host "🔄 Mise à jour du prix des QR codes à 100 tokens..." -ForegroundColor Cyan

# Vérifier si Node.js est disponible
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé. Veuillez installer Node.js." -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire du projet
Set-Location "C:\Users\AAA\Documents\iahome"

# Construire le projet Next.js
Write-Host "🔨 Construction du projet Next.js..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la construction du projet" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Projet construit avec succès" -ForegroundColor Green

# Démarrer le serveur Next.js en arrière-plan
Write-Host "🚀 Démarrage du serveur Next.js..." -ForegroundColor Yellow
$nextjsProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -WindowStyle Hidden

# Attendre que le serveur démarre
Write-Host "⏳ Attente du démarrage du serveur..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Appeler l'API pour mettre à jour les prix
Write-Host "📡 Mise à jour des prix via l'API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/update-prices-to-tokens" -Method POST -ContentType "application/json"
    Write-Host "✅ Prix mis à jour avec succès" -ForegroundColor Green
    Write-Host "📊 Réponse: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors de la mise à jour des prix: $($_.Exception.Message)" -ForegroundColor Red
}

# Arrêter le serveur Next.js
Write-Host "🛑 Arrêt du serveur Next.js..." -ForegroundColor Yellow
Stop-Process -Id $nextjsProcess.Id -Force

Write-Host "✅ Mise à jour terminée ! Le prix des QR codes est maintenant de 100 tokens." -ForegroundColor Green













