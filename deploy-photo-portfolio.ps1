# Script de déploiement PowerShell pour le portfolio photo intelligent
# LangChain + Supabase pour iAhome

Write-Host "🚀 Déploiement du Portfolio Photo IA - iAhome" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# 1. Installation des dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install langchain@^0.3.7
npm install @langchain/openai@^0.2.7
npm install openai@^4.67.3
npm install react-dropzone@^14.3.5
npm install uuid@^11.0.3
npm install @types/uuid@^10.0.0

# 2. Configuration de l'environnement
Write-Host "⚙️ Configuration de l'environnement..." -ForegroundColor Yellow
if (!(Test-Path ".env.local")) {
    Write-Host "⚠️ Fichier .env.local non trouvé. Création..." -ForegroundColor Red
    Copy-Item "env.production.local" ".env.local"
    Write-Host "✅ Fichier .env.local créé. Veuillez vérifier les variables d'environnement." -ForegroundColor Green
}

# 3. Configuration Supabase Storage
Write-Host "🗄️ Configuration Supabase Storage..." -ForegroundColor Yellow
Write-Host "Création du bucket 'photo-portfolio' dans Supabase..." -ForegroundColor Cyan

# Instructions pour l'utilisateur
Write-Host ""
Write-Host "📋 Actions manuelles requises :" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 ÉTAPE CRITIQUE - Extension pgvector :" -ForegroundColor Red
Write-Host "1. Vérifier que pgvector est disponible dans votre instance Supabase" -ForegroundColor White
Write-Host "2. Si pgvector n'est pas disponible, contacter le support Supabase" -ForegroundColor White
Write-Host "3. Exécuter le script SQL 'create-photo-portfolio-complete.sql' dans Supabase SQL Editor" -ForegroundColor White
Write-Host "4. Vérifier l'installation avec 'verify-installation.sql'" -ForegroundColor White
Write-Host "5. Configurer les variables d'environnement dans .env.local" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT : L'extension pgvector est OBLIGATOIRE pour le fonctionnement !" -ForegroundColor Red
Write-Host "💡 Le script complet installe TOUT automatiquement si pgvector est disponible !" -ForegroundColor Green

# 4. Build et déploiement
Write-Host "🔨 Build de l'application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build réussi !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Portfolio Photo IA prêt !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📖 Documentation :" -ForegroundColor Cyan
    Write-Host "- Page principale: /photo-portfolio" -ForegroundColor White
    Write-Host "- API upload: /api/photo-portfolio/upload" -ForegroundColor White
    Write-Host "- API recherche: /api/photo-portfolio/search" -ForegroundColor White
    Write-Host "- API collections: /api/photo-portfolio/collections" -ForegroundColor White
    Write-Host "- API stats: /api/photo-portfolio/stats" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Configuration Supabase requise :" -ForegroundColor Cyan
    Write-Host "1. Exécuter le script SQL fourni" -ForegroundColor White
    Write-Host "2. Créer le bucket de stockage" -ForegroundColor White
    Write-Host "3. Configurer les politiques de sécurité" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Déploiement terminé !" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}
