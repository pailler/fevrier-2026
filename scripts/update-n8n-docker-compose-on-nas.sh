#!/bin/bash
# Script pour mettre à jour le docker-compose.yml de n8n sur le NAS
# Ajoute N8N_SECURE_COOKIE: "true" si manquant

echo "Mise à jour du docker-compose.yml de n8n sur le NAS..."
echo ""

COMPOSE_FILE="/volume1/docker/n8n/docker-compose.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "ERREUR: Fichier $COMPOSE_FILE introuvable"
    exit 1
fi

# Vérifier si N8N_SECURE_COOKIE existe déjà
if grep -q "N8N_SECURE_COOKIE" "$COMPOSE_FILE"; then
    echo "N8N_SECURE_COOKIE existe déjà dans le fichier"
    echo ""
    echo "Vérification de la valeur..."
    grep "N8N_SECURE_COOKIE" "$COMPOSE_FILE"
else
    echo "Ajout de N8N_SECURE_COOKIE: \"true\"..."
    
    # Créer une sauvegarde
    cp "$COMPOSE_FILE" "${COMPOSE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Ajouter N8N_SECURE_COOKIE après N8N_EDITOR_BASE_URL
    sed -i '/N8N_EDITOR_BASE_URL/a\      N8N_SECURE_COOKIE: "true"' "$COMPOSE_FILE"
    
    echo "OK: N8N_SECURE_COOKIE ajouté"
fi

echo ""
echo "Vérification de la configuration complète..."
echo "Variables importantes:"
grep -E "N8N_PROTOCOL|N8N_HOST|N8N_EDITOR_BASE_URL|N8N_SECURE_COOKIE|WEBHOOK_URL" "$COMPOSE_FILE" | grep -v "^#"

echo ""
echo "Redémarrage de n8n pour appliquer les changements..."
cd /volume1/docker/n8n
sudo docker-compose restart n8n

echo ""
echo "Attente du démarrage (20 secondes)..."
sleep 20

echo ""
echo "Vérification des logs..."
sudo docker logs n8n --tail 20

echo ""
echo "Terminé !"
