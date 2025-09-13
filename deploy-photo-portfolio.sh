#!/bin/bash

# Script de déploiement pour le portfolio photo intelligent
# LangChain + Supabase pour iAhome

echo "🚀 Déploiement du Portfolio Photo IA - iAhome"
echo "=============================================="

# 1. Installation des dépendances
echo "📦 Installation des dépendances..."
npm install langchain@^0.3.7
npm install langchain-openai@^0.2.7
npm install openai@^4.67.3
npm install react-dropzone@^14.3.5
npm install uuid@^11.0.3
npm install @types/uuid@^10.0.0

# 2. Configuration de l'environnement
echo "⚙️ Configuration de l'environnement..."
if [ ! -f .env.local ]; then
    echo "⚠️ Fichier .env.local non trouvé. Création..."
    cp env.production.local .env.local
    echo "✅ Fichier .env.local créé. Veuillez vérifier les variables d'environnement."
fi

# 3. Configuration Supabase Storage
echo "🗄️ Configuration Supabase Storage..."
echo "Création du bucket 'photo-portfolio' dans Supabase..."

# Instructions pour l'utilisateur
echo ""
echo "📋 Actions manuelles requises :"
echo ""
echo "🔧 ÉTAPE CRITIQUE - Extension pgvector :"
echo "1. Vérifier que pgvector est disponible dans votre instance Supabase"
echo "2. Si pgvector n'est pas disponible, contacter le support Supabase"
echo "3. Exécuter le script SQL 'create-photo-portfolio-complete.sql' dans Supabase SQL Editor"
echo "4. Vérifier l'installation avec 'verify-installation.sql'"
echo "5. Configurer les variables d'environnement dans .env.local"
echo ""
echo "⚠️  IMPORTANT : L'extension pgvector est OBLIGATOIRE pour le fonctionnement !"
echo "💡 Le script complet installe TOUT automatiquement si pgvector est disponible !"

# 4. Build et déploiement
echo "🔨 Build de l'application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussi !"
    echo ""
    echo "🎉 Portfolio Photo IA prêt !"
    echo ""
    echo "📖 Documentation :"
    echo "- Page principale: /photo-portfolio"
    echo "- API upload: /api/photo-portfolio/upload"
    echo "- API recherche: /api/photo-portfolio/search"
    echo "- API collections: /api/photo-portfolio/collections"
    echo "- API stats: /api/photo-portfolio/stats"
    echo ""
    echo "🔧 Configuration Supabase requise :"
    echo "1. Exécuter le script SQL fourni"
    echo "2. Créer le bucket de stockage"
    echo "3. Configurer les politiques de sécurité"
    echo ""
    echo "🚀 Déploiement terminé !"
else
    echo "❌ Erreur lors du build"
    exit 1
fi
