#!/bin/bash
# Script complet pour corriger toutes les permissions n8n sur NAS Synology

echo "========================================"
echo "Correction des permissions n8n"
echo "========================================"
echo ""

# Arrêter n8n
echo "Étape 1 : Arrêt du conteneur n8n..."
sudo docker stop n8n

# Trouver l'UID/GID de l'utilisateur admin
echo ""
echo "Étape 2 : Recherche de l'UID/GID..."
ADMIN_UID=$(id -u admin 2>/dev/null || echo "1026")
ADMIN_GID=$(id -g admin 2>/dev/null || echo "100")

echo "  UID trouvé: $ADMIN_UID"
echo "  GID trouvé: $ADMIN_GID"
echo ""

# Option 1 : Utiliser les permissions de l'utilisateur NAS
echo "Étape 3 : Configuration des permissions avec UID/GID NAS..."
echo "  Option A : Utiliser les permissions de l'utilisateur NAS ($ADMIN_UID:$ADMIN_GID)"
echo "  Option B : Utiliser les permissions root (0:0)"
echo ""
read -p "Choisissez l'option (A/B) [A] : " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Bb]$ ]]; then
    # Option B : Root
    echo "Configuration avec root (0:0)..."
    sudo chown -R 0:0 /volume1/docker/n8n/n8n
    sudo chmod -R 755 /volume1/docker/n8n/n8n
    
    # Retirer user du docker-compose
    echo ""
    echo "⚠️  IMPORTANT : Retirez la ligne 'user: \"1000:1000\"' du docker-compose.yml"
    echo "   ou changez-la en 'user: \"0:0\"' pour utiliser root"
else
    # Option A : Utilisateur NAS
    echo "Configuration avec utilisateur NAS ($ADMIN_UID:$ADMIN_GID)..."
    sudo chown -R $ADMIN_UID:$ADMIN_GID /volume1/docker/n8n/n8n
    sudo chmod -R 755 /volume1/docker/n8n/n8n
    
    echo ""
    echo "⚠️  IMPORTANT : Dans docker-compose.yml, changez 'user: \"1000:1000\"'"
    echo "   en 'user: \"$ADMIN_UID:$ADMIN_GID\"'"
fi

# Vérifier les permissions
echo ""
echo "Étape 4 : Vérification des permissions..."
ls -ld /volume1/docker/n8n/n8n

# Supprimer les fichiers problématiques
echo ""
echo "Étape 5 : Nettoyage des fichiers problématiques..."
sudo rm -f /volume1/docker/n8n/n8n/config
sudo rm -f /volume1/docker/n8n/n8n/crash.journal
sudo rm -f /volume1/docker/n8n/n8n/*.journal

# Redémarrer n8n
echo ""
echo "Étape 6 : Redémarrage du conteneur n8n..."
sudo docker start n8n

echo ""
echo "Attente du démarrage (20 secondes)..."
sleep 20

echo ""
echo "Étape 7 : Vérification des logs..."
sudo docker logs n8n --tail 30

echo ""
echo "Étape 8 : Vérification du statut..."
sudo docker ps | grep n8n

echo ""
echo "========================================"
echo "Si le problème persiste :"
echo "========================================"
echo ""
echo "1. Vérifiez que le docker-compose.yml n'a pas 'user: \"1000:1000\"'"
echo "   ou utilisez 'user: \"$ADMIN_UID:$ADMIN_GID\"'"
echo ""
echo "2. Vérifiez les permissions :"
echo "   ls -ld /volume1/docker/n8n/n8n"
echo ""
echo "3. Si nécessaire, utilisez root :"
echo "   sudo chown -R 0:0 /volume1/docker/n8n/n8n"
echo "   Et dans docker-compose.yml : user: \"0:0\""
echo ""
