#!/bin/bash
# Script rapide pour corriger l'erreur de clé de chiffrement n8n
# Supprime le fichier config pour qu'il soit recréé avec la nouvelle clé
# Utilise sudo pour les permissions Docker

echo "Correction de l'erreur de clé de chiffrement n8n..."
echo ""

# Arrêter n8n
echo "Arrêt du conteneur n8n..."
sudo docker stop n8n

# Supprimer le fichier config
echo "Suppression du fichier config..."
sudo rm -f /volume1/docker/n8n/n8n/config

# Redémarrer n8n
echo "Redémarrage du conteneur n8n..."
sudo docker start n8n

echo ""
echo "Attente du démarrage (20 secondes)..."
sleep 20

echo ""
echo "Vérification des logs:"
sudo docker logs n8n --tail 30

echo ""
echo "Vérification du statut:"
sudo docker ps | grep n8n

echo ""
echo "Si vous voyez encore l'erreur, supprimez complètement le répertoire:"
echo "  docker stop n8n"
echo "  rm -rf /volume1/docker/n8n/n8n/*"
echo "  docker start n8n"
