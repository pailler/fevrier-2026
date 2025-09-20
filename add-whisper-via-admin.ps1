# Script pour ajouter le module Whisper via l'interface d'administration
Write-Host "🎯 Ajout du module Whisper via l'interface d'administration" -ForegroundColor Blue

# Données du module Whisper
$moduleData = @{
    id = "whisper"
    title = "Whisper IA"
    description = "Intelligence artificielle multimédia - Transformez vos fichiers audio, vidéo et images en texte avec une précision exceptionnelle grâce aux technologies OpenAI Whisper et Tesseract OCR."
    subtitle = "Transcription audio, vidéo et reconnaissance de texte (OCR)"
    category = "Productivité"
    price = 0
    youtube_url = ""
    url = "https://whisper.iahome.fr"
    image_url = "/images/module-visuals/whisper-module.svg"
} | ConvertTo-Json

Write-Host "`n📋 Données du module Whisper:" -ForegroundColor Cyan
Write-Host $moduleData -ForegroundColor White

Write-Host "`n🌐 Instructions pour ajouter le module:" -ForegroundColor Yellow
Write-Host "1. Ouvrez votre navigateur" -ForegroundColor White
Write-Host "2. Allez sur: http://localhost:3000/admin/modules" -ForegroundColor White
Write-Host "3. Cliquez sur le bouton 'Ajouter un module' ou '+'" -ForegroundColor White
Write-Host "4. Remplissez le formulaire avec les données suivantes:" -ForegroundColor White

Write-Host "`n📝 Formulaire à remplir:" -ForegroundColor Green
Write-Host "┌─────────────────────────────────────────────────────────┐" -ForegroundColor White
Write-Host "│ ID: whisper                                              │" -ForegroundColor White
Write-Host "│ Titre: Whisper IA                                        │" -ForegroundColor White
Write-Host "│ Description: Intelligence artificielle multimédia...    │" -ForegroundColor White
Write-Host "│ Sous-titre: Transcription audio, vidéo et OCR           │" -ForegroundColor White
Write-Host "│ Catégorie: Productivité                                  │" -ForegroundColor White
Write-Host "│ Prix: 0                                                  │" -ForegroundColor White
Write-Host "│ URL: https://whisper.iahome.fr                          │" -ForegroundColor White
Write-Host "│ Image: /images/module-visuals/whisper-module.svg         │" -ForegroundColor White
Write-Host "└─────────────────────────────────────────────────────────┘" -ForegroundColor White

Write-Host "`n5. Cliquez sur 'Sauvegarder' ou 'Ajouter'" -ForegroundColor White
Write-Host "6. Retournez sur http://localhost:3000/applications" -ForegroundColor White
Write-Host "7. Rafraîchissez la page (F5)" -ForegroundColor White
Write-Host "8. La carte Whisper IA devrait maintenant apparaître !" -ForegroundColor White

Write-Host "`n🔍 Vérification après ajout:" -ForegroundColor Cyan
Write-Host "   - La carte Whisper devrait apparaître sur /applications" -ForegroundColor White
Write-Host "   - La page détaillée sera accessible sur /card/whisper" -ForegroundColor White
Write-Host "   - Le service sera accessible sur https://whisper.iahome.fr" -ForegroundColor White

Write-Host "`n✅ Module Whisper prêt à être ajouté !" -ForegroundColor Green
Write-Host "   Interface d'administration: http://localhost:3000/admin/modules" -ForegroundColor White





