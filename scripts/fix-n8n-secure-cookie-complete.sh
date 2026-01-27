#!/bin/bash
# Script complet pour corriger définitivement l'erreur de cookie sécurisé n8n

echo "========================================"
echo "Correction de l'erreur cookie sécurisé"
echo "========================================"
echo ""

COMPOSE_FILE="/volume1/docker/n8n/docker-compose.yml"

# Vérifier que le fichier existe
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "ERREUR: Fichier $COMPOSE_FILE introuvable"
    exit 1
fi

# Étape 1 : Vérifier que N8N_SECURE_COOKIE est dans le fichier
echo "Étape 1 : Vérification du docker-compose.yml..."
if grep -q "N8N_SECURE_COOKIE.*true" "$COMPOSE_FILE"; then
    echo "✅ N8N_SECURE_COOKIE: \"true\" présent dans docker-compose.yml"
else
    echo "❌ N8N_SECURE_COOKIE manquant, ajout..."
    # Créer une sauvegarde
    cp "$COMPOSE_FILE" "${COMPOSE_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    
    # Ajouter après N8N_EDITOR_BASE_URL
    sed -i '/N8N_EDITOR_BASE_URL/a\      N8N_SECURE_COOKIE: "true"' "$COMPOSE_FILE"
    echo "✅ N8N_SECURE_COOKIE ajouté"
fi

# Étape 2 : Arrêter complètement n8n
echo ""
echo "Étape 2 : Arrêt complet de n8n..."
cd /volume1/docker/n8n
sudo docker-compose down

# Étape 3 : Attendre un peu
echo "Attente de 5 secondes..."
sleep 5

# Étape 4 : Redémarrer n8n
echo ""
echo "Étape 3 : Redémarrage complet de n8n..."
sudo docker-compose up -d

# Étape 5 : Attendre le démarrage
echo ""
echo "Étape 4 : Attente du démarrage complet (30 secondes)..."
sleep 30

# Étape 6 : Vérifier que la variable est bien chargée
echo ""
echo "Étape 5 : Vérification de la variable dans le conteneur..."
if sudo docker exec n8n env | grep -q "N8N_SECURE_COOKIE=true"; then
    echo "✅ N8N_SECURE_COOKIE=true est bien chargé dans le conteneur"
else
    echo "❌ N8N_SECURE_COOKIE n'est pas chargé dans le conteneur"
    echo "   Vérifiez le docker-compose.yml et redémarrez manuellement"
fi

# Étape 7 : Vérifier les logs
echo ""
echo "Étape 6 : Vérification des logs..."
sudo docker logs n8n --tail 20 | grep -v "license SDK"

# Étape 8 : Test de santé
echo ""
echo "Étape 7 : Test de santé..."
if curl -s http://localhost:5678/healthz > /dev/null; then
    echo "✅ n8n répond correctement"
else
    echo "⚠️  n8n ne répond pas encore, attendez quelques secondes"
fi

echo ""
echo "========================================"
echo "Correction terminée !"
echo "========================================"
echo ""
echo "Actions à effectuer dans votre navigateur:"
echo "  1. Videz complètement le cache (Ctrl+Shift+Delete)"
echo "  2. Ou testez en navigation privée"
echo "  3. Accédez à: https://n8n.regispailler.fr"
echo ""
echo "Si l'erreur persiste:"
echo "  - Vérifiez que vous accédez bien via https:// (pas http://)"
echo "  - Vérifiez les headers Traefik (X-Forwarded-Proto: https)"
echo "  - Essayez temporairement N8N_SECURE_COOKIE: \"false\" pour tester"
echo ""
