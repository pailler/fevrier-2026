#!/bin/sh
# Script de nettoyage automatique des sessions MeTube
# À exécuter après chaque téléchargement ou périodiquement

echo "🧹 Nettoyage automatique des sessions MeTube"

# Nettoyer les fichiers de session MeTube
rm -f /downloads/.metube/completed
rm -f /downloads/.metube/pending
rm -f /downloads/.metube/queue

# Nettoyer les fichiers téléchargés (optionnel - décommenter si nécessaire)
# find /downloads -type f ! -path '/downloads/.metube/*' -mtime +1 -delete

# Nettoyer les fichiers temporaires
rm -rf /downloads/.metube/tmp/* 2>/dev/null
rm -rf /tmp/metube-* 2>/dev/null

echo "✅ Nettoyage terminé"


