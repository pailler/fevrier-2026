#!/bin/bash
# Script Bash pour arrêter HRConvert2
echo "Arrêt de HRConvert2..."

# Arrêter le service HRConvert2 depuis le docker-compose principal
echo "Arrêt du conteneur HRConvert2..."
docker-compose -f docker-compose.services.yml stop hrconvert2

# Vérifier le statut
echo "Vérification du statut du conteneur..."
docker-compose -f docker-compose.services.yml ps hrconvert2

echo "HRConvert2 arrêté"
