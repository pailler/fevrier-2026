# Script corrigé pour insérer le module Whisper IA
Write-Host "🔧 Insertion corrigée du module Whisper IA..." -ForegroundColor Blue

Write-Host "`n❌ Problème identifié:" -ForegroundColor Red
Write-Host "   La colonne 'subtitle' n'existe pas dans la table 'modules'" -ForegroundColor White

Write-Host "`n✅ Solution corrigée:" -ForegroundColor Green
Write-Host "   Utilisation de la requête SQL sans la colonne 'subtitle'" -ForegroundColor White

Write-Host "`n📝 Requête SQL corrigée:" -ForegroundColor Cyan
Write-Host "┌─────────────────────────────────────────────────────────┐" -ForegroundColor White
Write-Host "│ INSERT INTO modules (id, title, description, category,  │" -ForegroundColor White
Write-Host "│ price, youtube_url, url, image_url, created_at,         │" -ForegroundColor White
Write-Host "│ updated_at) VALUES (                                   │" -ForegroundColor White
Write-Host "│   'whisper',                                           │" -ForegroundColor White
Write-Host "│   'Whisper IA',                                        │" -ForegroundColor White
Write-Host "│   'Intelligence artificielle multimédia...',           │" -ForegroundColor White
Write-Host "│   'Productivité',                                      │" -ForegroundColor White
Write-Host "│   0,                                                   │" -ForegroundColor White
Write-Host "│   '',                                                  │" -ForegroundColor White
Write-Host "│   'https://whisper.iahome.fr',                         │" -ForegroundColor White
Write-Host "│   '/images/module-visuals/whisper-module.svg',          │" -ForegroundColor White
Write-Host "│   NOW(),                                               │" -ForegroundColor White
Write-Host "│   NOW()                                                │" -ForegroundColor White
Write-Host "│ );                                                     │" -ForegroundColor White
Write-Host "└─────────────────────────────────────────────────────────┘" -ForegroundColor White

Write-Host "`n🌐 Instructions:" -ForegroundColor Yellow
Write-Host "1. Connectez-vous à votre console Supabase" -ForegroundColor White
Write-Host "2. Allez dans l'éditeur SQL" -ForegroundColor White
Write-Host "3. Copiez et exécutez la requête ci-dessus" -ForegroundColor White
Write-Host "4. Ou utilisez le fichier: insert-whisper-fixed.sql" -ForegroundColor White

Write-Host "`n🎯 Après l'exécution:" -ForegroundColor Cyan
Write-Host "   - Allez sur http://localhost:3000/applications" -ForegroundColor White
Write-Host "   - Rafraîchissez la page (F5)" -ForegroundColor White
Write-Host "   - La carte Whisper IA devrait apparaître !" -ForegroundColor White

Write-Host "`n✅ Module Whisper prêt pour l'insertion corrigée !" -ForegroundColor Green
