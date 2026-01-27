#!/bin/bash
# Script final pour corriger définitivement les permissions n8n
# Résout l'erreur EACCES: permission denied

set -e  # Arrêter en cas d'erreur

echo "========================================"
echo "Correction définitive des permissions n8n"
echo "========================================"
echo ""

# Arrêter n8n
echo "1. Arrêt du conteneur n8n..."
sudo docker stop n8n || true

# Supprimer tous les fichiers problématiques
echo ""
echo "2. Nettoyage des fichiers problématiques..."
sudo rm -f /volume1/docker/n8n/n8n/config
sudo rm -f /volume1/docker/n8n/n8n/crash.journal
sudo rm -f /volume1/docker/n8n/n8n/*.journal
sudo rm -rf /volume1/docker/n8n/n8n/.n8n 2>/dev/null || true

# Corriger les permissions avec root (solution la plus simple)
echo ""
echo "3. Configuration des permissions avec root..."
sudo chown -R 0:0 /volume1/docker/n8n/n8n
sudo chmod -R 777 /volume1/docker/n8n/n8n

# Vérifier les permissions
echo ""
echo "4. Vérification des permissions..."
ls -ld /volume1/docker/n8n/n8n

# Vérifier que le docker-compose.yml n'a pas de ligne 'user'
echo ""
echo "5. Vérification du docker-compose.yml..."
if grep -q "^[[:space:]]*user:" /volume1/docker/n8n/docker-compose.yml 2>/dev/null; then
    echo "⚠️  ATTENTION : Le docker-compose.yml contient une ligne 'user:'"
    echo "   Vous devez la commenter ou la supprimer"
    echo ""
    echo "   Exécutez : sudo nano /volume1/docker/n8n/docker-compose.yml"
    echo "   Et commentez la ligne : # user: \"1000:1000\""
    echo ""
    read -p "Appuyez sur Entrée après avoir modifié le fichier..."
fi

# Redémarrer n8n
echo ""
echo "6. Redémarrage du conteneur n8n..."
cd /volume1/docker/n8n
sudo docker-compose up -d n8n

echo ""
echo "7. Attente du démarrage (30 secondes)..."
sleep 30

# Vérifier les logs
echo ""
echo "8. Vérification des logs..."
sudo docker logs n8n --tail 30

# Vérifier le statut
echo ""
echo "9. Vérification du statut..."
sudo docker ps | grep n8n || echo "⚠️  Le conteneur n'est pas en cours d'exécution"

echo ""
echo "========================================"
echo "Correction terminée !"
echo "========================================"
echo ""
echo "Si vous voyez encore des erreurs de permissions :"
echo "  1. Vérifiez que la ligne 'user:' est bien commentée dans docker-compose.yml"
echo "  2. Vérifiez les permissions : ls -ld /volume1/docker/n8n/n8n"
echo "  3. Recréez complètement le répertoire :"
echo "     sudo rm -rf /volume1/docker/n8n/n8n/*"
echo "     sudo docker-compose restart n8n"
echo ""
