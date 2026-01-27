#!/bin/bash
# Script pour vérifier la configuration n8n sur le NAS

echo "Vérification de la configuration n8n..."
echo ""

# Vérifier que n8n est en cours d'exécution
echo "1. Statut des conteneurs:"
sudo docker ps | grep n8n
echo ""

# Vérifier les variables d'environnement
echo "2. Variables d'environnement importantes:"
sudo docker exec n8n env | grep -E "N8N_PROTOCOL|N8N_HOST|N8N_EDITOR_BASE_URL|N8N_SECURE_COOKIE|WEBHOOK_URL" | sort
echo ""

# Vérifier que n8n répond
echo "3. Test de santé:"
curl -s http://localhost:5678/healthz && echo " - OK" || echo " - ERREUR"
echo ""

# Vérifier les logs récents
echo "4. Derniers logs (20 lignes):"
sudo docker logs n8n --tail 20
echo ""

# Vérifier les permissions
echo "5. Permissions du répertoire:"
ls -ld /volume1/docker/n8n/n8n
echo ""

echo "Vérification terminée !"
