# Script pour insérer les données de formation

Write-Host "🚀 Copie du script JavaScript dans le conteneur..."

# Copier le fichier JavaScript dans le conteneur
docker cp scripts/insert-formation-data.js iahome-app:/app/insert-formation-data.js

Write-Host "✅ Fichier copié, exécution du script..."

# Exécuter le script dans le conteneur
docker-compose -f docker-compose.prod.yml exec iahome-app node insert-formation-data.js

Write-Host "✅ Script terminé !"
