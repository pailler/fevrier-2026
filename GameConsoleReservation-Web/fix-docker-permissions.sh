#!/bin/bash
# Script pour corriger les permissions Docker sur Synology
# Usage: ./fix-docker-permissions.sh

echo "Correction des permissions Docker sur Synology..."
echo ""

# Ajouter le groupe docker s'il n'existe pas
echo "Ajout du groupe docker..."
sudo synogroup --add docker 2>/dev/null || echo "Groupe docker existe deja"

# Ajouter l'utilisateur actuel au groupe docker
CURRENT_USER=$(whoami)
echo "Ajout de l'utilisateur $CURRENT_USER au groupe docker..."
sudo synogroup --member docker $CURRENT_USER

echo ""
echo "Permissions configurees !"
echo ""
echo "IMPORTANT: Vous devez vous deconnecter et reconnecter pour que les changements prennent effet."
echo ""
echo "Pour tester, executez:"
echo "  docker ps"
echo ""
echo "Si cela ne fonctionne toujours pas, utilisez sudo:"
echo "  sudo docker-compose up -d --build"


