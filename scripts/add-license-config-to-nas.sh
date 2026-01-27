#!/bin/bash
# Script pour ajouter la configuration de licence dans le docker-compose.yml sur le NAS
# Réduit les messages d'erreur de certificat de licence

echo "Ajout de la configuration de licence n8n..."
echo ""

COMPOSE_FILE="/volume1/docker/n8n/docker-compose.yml"

if [ ! -f "$COMPOSE_FILE" ]; then
    echo "ERREUR: Fichier $COMPOSE_FILE introuvable"
    exit 1
fi

# Vérifier si N8N_LICENSE_AUTO_RENEW_ENABLED existe déjà
if grep -q "N8N_LICENSE_AUTO_RENEW_ENABLED" "$COMPOSE_FILE"; then
    echo "N8N_LICENSE_AUTO_RENEW_ENABLED existe déjà dans le fichier"
    grep "N8N_LICENSE_AUTO_RENEW_ENABLED" "$COMPOSE_FILE"
else
    echo "Ajout de N8N_LICENSE_AUTO_RENEW_ENABLED: \"false\"..."
    
    # Créer une sauvegarde
    cp "$COMPOSE_FILE" "${COMPOSE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Ajouter après N8N_SECURE_COOKIE ou N8N_EDITOR_BASE_URL
    if grep -q "N8N_SECURE_COOKIE" "$COMPOSE_FILE"; then
        sed -i '/N8N_SECURE_COOKIE/a\      N8N_LICENSE_AUTO_RENEW_ENABLED: "false"' "$COMPOSE_FILE"
    elif grep -q "N8N_EDITOR_BASE_URL" "$COMPOSE_FILE"; then
        sed -i '/N8N_EDITOR_BASE_URL/a\      N8N_LICENSE_AUTO_RENEW_ENABLED: "false"' "$COMPOSE_FILE"
    else
        # Ajouter après la dernière variable d'environnement
        sed -i '/TZ: Europe\/Paris/a\      N8N_LICENSE_AUTO_RENEW_ENABLED: "false"' "$COMPOSE_FILE"
    fi
    
    echo "OK: N8N_LICENSE_AUTO_RENEW_ENABLED ajouté"
fi

echo ""
echo "Redémarrage de n8n pour appliquer les changements..."
cd /volume1/docker/n8n
sudo docker-compose restart n8n

echo ""
echo "Attente du démarrage (20 secondes)..."
sleep 20

echo ""
echo "Vérification des logs (sans les erreurs de licence)..."
sudo docker logs n8n --tail 30 | grep -v "license SDK" || sudo docker logs n8n --tail 30

echo ""
echo "Terminé !"
echo ""
echo "Note: Les erreurs de certificat de licence sont non critiques"
echo "      et n'affectent pas le fonctionnement de n8n."
