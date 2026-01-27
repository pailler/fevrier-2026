#!/bin/bash
# Script simple pour corriger les permissions n8n
# À utiliser quand il n'y a pas de ligne 'user' dans docker-compose

echo "Correction des permissions n8n..."
echo ""

# Arrêter n8n
echo "1. Arrêt du conteneur n8n..."
sudo docker stop n8n

# Supprimer les fichiers problématiques
echo ""
echo "2. Nettoyage des fichiers problématiques..."
sudo rm -f /volume1/docker/n8n/n8n/config
sudo rm -f /volume1/docker/n8n/n8n/crash.journal
sudo rm -f /volume1/docker/n8n/n8n/*.journal

# Corriger les permissions - donner tous les droits
echo ""
echo "3. Correction des permissions..."
sudo chown -R 0:0 /volume1/docker/n8n/n8n
sudo chmod -R 777 /volume1/docker/n8n/n8n

# Vérifier les permissions
echo ""
echo "4. Vérification des permissions..."
ls -ld /volume1/docker/n8n/n8n
echo ""

# Redémarrer n8n
echo "5. Redémarrage du conteneur n8n..."
cd /volume1/docker/n8n
sudo docker-compose up -d n8n

echo ""
echo "6. Attente du démarrage (30 secondes)..."
sleep 30

# Vérifier les logs
echo ""
echo "7. Vérification des logs..."
sudo docker logs n8n --tail 30

echo ""
echo "Terminé !"
