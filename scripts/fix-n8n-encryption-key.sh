#!/bin/bash
# Script pour corriger l'erreur de clé de chiffrement n8n
# Résout l'erreur "Mismatching encryption keys"

echo "========================================"
echo "Correction de la clé de chiffrement n8n"
echo "========================================"
echo ""

# Option 1 : Supprimer le fichier config pour le recréer avec la nouvelle clé
echo "Option 1 : Supprimer le fichier config existant"
echo "Cette option supprime le fichier config pour que n8n le recrée avec la nouvelle clé."
echo ""
read -p "Voulez-vous supprimer le fichier config ? (o/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[OoYy]$ ]]; then
    echo "Arrêt du conteneur n8n..."
    docker stop n8n 2>/dev/null || true
    
    echo "Suppression du fichier config..."
    # Supprimer uniquement le fichier config, pas tout le répertoire
    docker exec n8n rm -f /home/node/.n8n/config 2>/dev/null || true
    
    # Si le conteneur n'est pas accessible, supprimer depuis le volume monté
    if [ -d "/volume1/docker/n8n/n8n" ]; then
        echo "Suppression depuis le volume monté..."
        rm -f /volume1/docker/n8n/n8n/config
    fi
    
    echo "Fichier config supprimé."
    echo ""
    echo "Redémarrage du conteneur n8n..."
    docker start n8n
    
    echo ""
    echo "Attente du démarrage (15 secondes)..."
    sleep 15
    
    echo "Vérification des logs..."
    docker logs n8n --tail 20
else
    echo "Option annulée."
fi

echo ""
echo "========================================"
echo "Si le problème persiste :"
echo "========================================"
echo ""
echo "Option 2 : Supprimer complètement le répertoire .n8n (ATTENTION : perte de données)"
echo "  docker stop n8n"
echo "  rm -rf /volume1/docker/n8n/n8n/*"
echo "  docker start n8n"
echo ""
echo "Option 3 : Utiliser la clé existante"
echo "  1. Trouvez la clé dans /volume1/docker/n8n/n8n/config"
echo "  2. Utilisez cette clé dans N8N_ENCRYPTION_KEY du docker-compose.yml"
echo ""
