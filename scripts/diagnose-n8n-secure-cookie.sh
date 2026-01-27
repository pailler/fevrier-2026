#!/bin/bash
# Script de diagnostic pour l'erreur de cookie sécurisé n8n

echo "========================================"
echo "Diagnostic : Erreur cookie sécurisé n8n"
echo "========================================"
echo ""

# Vérifier que n8n est en cours d'exécution
echo "1. Statut de n8n:"
sudo docker ps | grep n8n
echo ""

# Vérifier les variables d'environnement
echo "2. Variables d'environnement importantes:"
sudo docker exec n8n env | grep -E "N8N_PROTOCOL|N8N_SECURE_COOKIE|N8N_EDITOR_BASE_URL|N8N_HOST|WEBHOOK_URL" | sort
echo ""

# Vérifier que N8N_SECURE_COOKIE est bien défini
echo "3. Vérification de N8N_SECURE_COOKIE:"
if sudo docker exec n8n env | grep -q "N8N_SECURE_COOKIE=true"; then
    echo "   ✅ N8N_SECURE_COOKIE=true est défini"
else
    echo "   ❌ N8N_SECURE_COOKIE n'est pas défini ou n'est pas 'true'"
    echo "   → Redémarrez n8n après avoir ajouté la variable dans docker-compose.yml"
fi
echo ""

# Vérifier que n8n répond
echo "4. Test de santé local:"
if curl -s http://localhost:5678/healthz > /dev/null; then
    echo "   ✅ n8n répond localement"
else
    echo "   ❌ n8n ne répond pas localement"
fi
echo ""

# Vérifier les logs récents
echo "5. Derniers logs (sans les erreurs de licence):"
sudo docker logs n8n --tail 20 | grep -v "license SDK" | tail -10
echo ""

# Vérifier le docker-compose.yml
echo "6. Vérification du docker-compose.yml:"
if grep -q "N8N_SECURE_COOKIE.*true" /volume1/docker/n8n/docker-compose.yml; then
    echo "   ✅ N8N_SECURE_COOKIE: \"true\" présent dans docker-compose.yml"
else
    echo "   ❌ N8N_SECURE_COOKIE: \"true\" manquant dans docker-compose.yml"
    echo "   → Ajoutez cette ligne dans la section environment:"
    echo "     N8N_SECURE_COOKIE: \"true\""
fi
echo ""

echo "========================================"
echo "Recommandations:"
echo "========================================"
echo ""
echo "Si N8N_SECURE_COOKIE n'est pas défini dans le conteneur:"
echo "  1. Vérifiez qu'il est bien dans docker-compose.yml"
echo "  2. Redémarrez n8n: sudo docker-compose restart n8n"
echo "  3. Ou redémarrez complètement: sudo docker-compose down && sudo docker-compose up -d"
echo ""
echo "Si l'erreur persiste dans le navigateur:"
echo "  1. Videz complètement le cache (Ctrl+Shift+Delete)"
echo "  2. Testez en navigation privée"
echo "  3. Vérifiez que vous accédez via https:// (pas http://)"
echo ""
