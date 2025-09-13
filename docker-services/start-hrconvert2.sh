#!/bin/bash
# Script Bash pour démarrer HRConvert2
echo "Démarrage de HRConvert2..."

# Démarrer le service HRConvert2 depuis le docker-compose principal
echo "Démarrage du conteneur HRConvert2..."
docker-compose -f docker-compose.services.yml up -d hrconvert2

# Vérifier le statut
echo "Vérification du statut du conteneur..."
docker-compose -f docker-compose.services.yml ps hrconvert2

echo "HRConvert2 démarré sur le port 9082"
echo "URL: http://localhost:9082"
echo "URL de production: https://convert.iahome.fr"
echo "Formats supportés: 200+ formats (documents, images, vidéos, audio, archives, eBooks, etc.)"
