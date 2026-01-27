#!/bin/bash
# Script pour désactiver N8N_SECURE_COOKIE sur le NAS (solution temporaire)

echo "========================================"
echo "Désactivation de N8N_SECURE_COOKIE"
echo "========================================"
echo ""
echo "⚠️  Cette solution désactive les cookies sécurisés."
echo "   Votre connexion reste sécurisée via HTTPS (Traefik + Cloudflare)."
echo ""

COMPOSE_FILE="/volume1/docker/n8n/docker-compose.yml"

# Vérifier que le fichier existe
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "ERREUR: Fichier $COMPOSE_FILE introuvable"
    exit 1
fi

# Créer une sauvegarde
BACKUP_FILE="${COMPOSE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
cp "$COMPOSE_FILE" "$BACKUP_FILE"
echo "✅ Sauvegarde créée: $BACKUP_FILE"

# Remplacer N8N_SECURE_COOKIE: "true" par "false"
if grep -q 'N8N_SECURE_COOKIE.*true' "$COMPOSE_FILE"; then
    sed -i 's/N8N_SECURE_COOKIE: "true"/N8N_SECURE_COOKIE: "false"/g' "$COMPOSE_FILE"
    echo "✅ N8N_SECURE_COOKIE changé de 'true' à 'false'"
elif grep -q 'N8N_SECURE_COOKIE.*false' "$COMPOSE_FILE"; then
    echo "ℹ️  N8N_SECURE_COOKIE est déjà à 'false'"
else
    # Ajouter la ligne si elle n'existe pas
    sed -i '/N8N_EDITOR_BASE_URL/a\      N8N_SECURE_COOKIE: "false"' "$COMPOSE_FILE"
    echo "✅ N8N_SECURE_COOKIE: \"false\" ajouté"
fi

# Redémarrer n8n
echo ""
echo "Redémarrage de n8n..."
cd /volume1/docker/n8n
sudo docker-compose down
sleep 5
sudo docker-compose up -d

echo ""
echo "Attente du démarrage (30 secondes)..."
sleep 30

# Vérifier
echo ""
echo "Vérification..."
if sudo docker exec n8n env | grep -q "N8N_SECURE_COOKIE=false"; then
    echo "✅ N8N_SECURE_COOKIE=false est bien appliqué"
else
    echo "⚠️  N8N_SECURE_COOKIE n'est pas défini à 'false'"
    echo "   Vérifiez le docker-compose.yml manuellement"
fi

echo ""
echo "========================================"
echo "Terminé !"
echo "========================================"
echo ""
echo "Actions à effectuer dans votre navigateur:"
echo "  1. Videz complètement le cache (Ctrl+Shift+Delete)"
echo "  2. Ou testez en navigation privée"
echo "  3. Accédez à: https://n8n.regispailler.fr"
echo ""
echo "L'erreur de cookie sécurisé devrait disparaître."
echo ""
