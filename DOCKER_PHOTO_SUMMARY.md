# 🐳 Configuration Docker - Photo Portfolio IA iAhome

## ✅ Configuration Docker Complète Créée

### **📁 Fichiers Docker Créés :**

1. **Dockerfile.photo-portfolio**
   - Image Next.js optimisée
   - Build multi-étapes
   - Sécurité renforcée
   - Configuration de production

2. **docker-compose.photo-portfolio.yml**
   - Orchestration des services
   - Application Next.js (port 3001)
   - Redis pour le cache (port 6379)
   - Nginx reverse proxy (ports 80/443)
   - Volumes persistants
   - Health checks

3. **nginx/photo-portfolio.conf**
   - Configuration reverse proxy
   - SSL/TLS support
   - Headers de sécurité
   - Cache des assets
   - Upload jusqu'à 50MB

4. **Scripts de déploiement :**
   - `deploy-photo-portfolio-docker.sh` (Linux/macOS)
   - `deploy-photo-portfolio-docker.ps1` (Windows)

5. **Configuration :**
   - `.dockerignore.photo-portfolio`
   - `DOCKER_PHOTO_PORTFOLIO_GUIDE.md`

## 🏗️ Architecture Docker

### **Services :**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │────│  Photo Portfolio│────│      Redis      │
│   (Port 80/443) │    │   (Port 3001)   │    │   (Port 6379)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Fonctionnalités :**
- **Reverse Proxy** : Nginx pour le routage
- **Application** : Next.js containerisé
- **Cache** : Redis pour les sessions
- **SSL/TLS** : Sécurité HTTPS
- **Health Checks** : Monitoring automatique

## 🚀 Déploiement

### **Commandes de déploiement :**

#### **Windows (PowerShell) :**
```powershell
.\deploy-photo-portfolio-docker.ps1
```

#### **Linux/macOS :**
```bash
./deploy-photo-portfolio-docker.sh
```

#### **Manuel :**
```bash
# Construire
docker-compose -f docker-compose.photo-portfolio.yml build

# Démarrer
docker-compose -f docker-compose.photo-portfolio.yml up -d

# Vérifier
docker-compose -f docker-compose.photo-portfolio.yml ps
```

## 🔧 Configuration Requise

### **Variables d'environnement (.env.local) :**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536
SUPABASE_STORAGE_BUCKET=photo-portfolio
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
```

### **Ports utilisés :**
- **3001** : Application Photo Portfolio
- **80** : Nginx HTTP (redirection vers HTTPS)
- **443** : Nginx HTTPS
- **6379** : Redis

## 📊 Fonctionnalités Docker

### **Sécurité :**
- Utilisateur non-root dans les conteneurs
- Réseau isolé
- Headers de sécurité Nginx
- SSL/TLS obligatoire
- Validation des uploads

### **Performance :**
- Build multi-étapes optimisé
- Cache des assets statiques
- Compression gzip
- Images Alpine Linux légères

### **Monitoring :**
- Health checks automatiques
- Logs centralisés
- Métriques de performance
- Alertes de santé

## 🛠️ Commandes de Gestion

### **Gestion des services :**
```bash
# Voir les logs
docker-compose -f docker-compose.photo-portfolio.yml logs -f

# Redémarrer
docker-compose -f docker-compose.photo-portfolio.yml restart

# Arrêter
docker-compose -f docker-compose.photo-portfolio.yml down

# Mise à jour
docker-compose -f docker-compose.photo-portfolio.yml pull
docker-compose -f docker-compose.photo-portfolio.yml up -d
```

### **Debugging :**
```bash
# Accéder au conteneur
docker exec -it photo-portfolio-app sh

# Voir les ressources
docker stats

# Logs d'erreur
docker logs photo-portfolio-app
```

## 🎯 Avantages de la Configuration Docker

### **Pour le Déploiement :**
- **Isolation** : Environnement isolé et reproductible
- **Scalabilité** : Facile de monter en charge
- **Portabilité** : Fonctionne sur tous les systèmes
- **Maintenance** : Gestion simplifiée des services

### **Pour le Développement :**
- **Cohérence** : Même environnement partout
- **Rapidité** : Déploiement en une commande
- **Debugging** : Outils de diagnostic intégrés
- **Collaboration** : Configuration partagée

### **Pour la Production :**
- **Sécurité** : Isolation et permissions
- **Performance** : Optimisations intégrées
- **Monitoring** : Health checks et logs
- **Fiabilité** : Redémarrage automatique

## 📋 Checklist de Déploiement

### **Prérequis :**
- [ ] Docker Desktop installé
- [ ] Docker Compose installé
- [ ] Fichier .env.local configuré
- [ ] Ports 3001, 80, 443, 6379 disponibles

### **Déploiement :**
- [ ] Exécuter le script de déploiement
- [ ] Vérifier le build des images
- [ ] Confirmer le démarrage des services
- [ ] Tester l'accès à l'application

### **Validation :**
- [ ] Application accessible sur http://localhost:3001
- [ ] Nginx accessible sur http://localhost
- [ ] Upload de photos fonctionnel
- [ ] Recherche sémantique opérationnelle

## 🎉 Résultat Final

### **Configuration Docker Complète :**
- ✅ **Dockerfile** optimisé pour Next.js
- ✅ **Docker Compose** avec 3 services
- ✅ **Nginx** configuré avec SSL
- ✅ **Scripts** de déploiement automatique
- ✅ **Documentation** complète
- ✅ **Sécurité** et performance intégrées

### **Prêt pour le Déploiement :**
- 🚀 **Déploiement en une commande**
- 🔒 **Sécurité renforcée**
- 📊 **Monitoring intégré**
- 🛠️ **Maintenance simplifiée**

**L'application Photo Portfolio IA est maintenant prête pour le déploiement Docker !** 🐳

