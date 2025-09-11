# 🐳 Guide de Migration Docker - Portfolio Photo IA

## 📋 Vue d'ensemble

Ce guide détaille la migration du Portfolio Photo IA vers Docker pour faciliter le déploiement, la gestion et la scalabilité.

## 🏗️ Architecture Docker

### **Services inclus :**
- **photo-portfolio** : Application Next.js principale
- **nginx** : Reverse proxy et serveur web
- **redis** : Cache et session store (optionnel)

### **Ports exposés :**
- `3001` : Application Next.js
- `80` : Nginx HTTP
- `443` : Nginx HTTPS (optionnel)
- `6379` : Redis (optionnel)

## 📁 Fichiers de configuration

### **Fichiers principaux :**
- `Dockerfile.photo-portfolio` : Image Docker Next.js
- `docker-compose.photo-portfolio.yml` : Orchestration des services
- `nginx/photo-portfolio.conf` : Configuration Nginx
- `env.docker.example` : Variables d'environnement

### **Scripts de déploiement :**
- `deploy-docker-photo-portfolio.sh` : Script Linux/macOS
- `deploy-docker-photo-portfolio.ps1` : Script Windows PowerShell

## 🚀 Déploiement

### **Prérequis :**
- Docker 20.10+
- Docker Compose 2.0+
- Variables d'environnement configurées

### **Étape 1 : Configuration**
```bash
# Copier le fichier d'environnement
cp env.docker.example .env.local

# Éditer les variables d'environnement
nano .env.local
```

### **Étape 2 : Variables d'environnement requises**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Base de données
DATABASE_URL=your_database_url
```

### **Étape 3 : Déploiement**

#### **Linux/macOS :**
```bash
# Rendre le script exécutable
chmod +x deploy-docker-photo-portfolio.sh

# Démarrer les services
./deploy-docker-photo-portfolio.sh start

# Voir les logs
./deploy-docker-photo-portfolio.sh logs

# Arrêter les services
./deploy-docker-photo-portfolio.sh stop
```

#### **Windows :**
```powershell
# Démarrer les services
.\deploy-docker-photo-portfolio.ps1 start

# Voir les logs
.\deploy-docker-photo-portfolio.ps1 logs

# Arrêter les services
.\deploy-docker-photo-portfolio.ps1 stop
```

#### **Docker Compose direct :**
```bash
# Démarrer
docker-compose -f docker-compose.photo-portfolio.yml up -d

# Voir les logs
docker-compose -f docker-compose.photo-portfolio.yml logs -f

# Arrêter
docker-compose -f docker-compose.photo-portfolio.yml down
```

## 🔧 Configuration avancée

### **Nginx (optionnel)**
Le service Nginx est configuré pour :
- Reverse proxy vers l'application Next.js
- Gestion des uploads (10MB max)
- Headers de sécurité
- Cache des assets statiques
- Support HTTPS (optionnel)

### **Redis (optionnel)**
Redis peut être utilisé pour :
- Cache des requêtes API
- Stockage des sessions
- Queue de traitement des images

### **Volumes persistants**
- `photo-uploads` : Fichiers uploadés temporaires
- `photo-logs` : Logs de l'application
- `redis-data` : Données Redis

## 📊 Monitoring et maintenance

### **Commandes utiles :**

#### **Statut des services :**
```bash
# Linux/macOS
./deploy-docker-photo-portfolio.sh status

# Windows
.\deploy-docker-photo-portfolio.ps1 status

# Docker Compose
docker-compose -f docker-compose.photo-portfolio.yml ps
```

#### **Logs en temps réel :**
```bash
# Linux/macOS
./deploy-docker-photo-portfolio.sh logs

# Windows
.\deploy-docker-photo-portfolio.ps1 logs

# Docker Compose
docker-compose -f docker-compose.photo-portfolio.yml logs -f
```

#### **Redémarrage des services :**
```bash
# Linux/macOS
./deploy-docker-photo-portfolio.sh restart

# Windows
.\deploy-docker-photo-portfolio.ps1 restart
```

### **Health checks :**
- Application : `http://localhost:3001/api/health`
- Nginx : `http://localhost/health`

## 🔒 Sécurité

### **Recommandations :**
1. **Variables d'environnement** : Ne jamais commiter les fichiers `.env`
2. **Réseau Docker** : Utiliser un réseau isolé
3. **HTTPS** : Configurer SSL/TLS en production
4. **Firewall** : Limiter l'accès aux ports exposés
5. **Updates** : Maintenir les images Docker à jour

### **Configuration HTTPS :**
1. Obtenir des certificats SSL
2. Placer les certificats dans `./ssl/`
3. Décommenter la section HTTPS dans `nginx/photo-portfolio.conf`
4. Redémarrer les services

## 🚨 Dépannage

### **Problèmes courants :**

#### **Port déjà utilisé :**
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3001
netstat -tulpn | grep :80

# Arrêter les processus
sudo kill -9 $(lsof -t -i:3001)
sudo kill -9 $(lsof -t -i:80)
```

#### **Erreur de permissions :**
```bash
# Linux/macOS
sudo chmod +x deploy-docker-photo-portfolio.sh

# Windows
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### **Problème de réseau Docker :**
```bash
# Créer le réseau manuellement
docker network create iahome-network

# Vérifier les réseaux
docker network ls
```

#### **Logs d'erreur :**
```bash
# Logs détaillés
docker-compose -f docker-compose.photo-portfolio.yml logs --tail=100

# Logs d'un service spécifique
docker logs iahome-photo-portfolio
```

## 📈 Performance

### **Optimisations :**
1. **Multi-stage build** : Image finale optimisée
2. **Cache des layers** : Build plus rapide
3. **Assets statiques** : Servis par Nginx
4. **Compression** : Gzip activé
5. **Redis** : Cache des requêtes

### **Monitoring des ressources :**
```bash
# Utilisation des ressources
docker stats

# Espace disque
docker system df

# Nettoyage
docker system prune -a
```

## 🔄 Mise à jour

### **Mise à jour de l'application :**
```bash
# 1. Arrêter les services
./deploy-docker-photo-portfolio.sh stop

# 2. Mettre à jour le code
git pull origin main

# 3. Reconstruire et redémarrer
./deploy-docker-photo-portfolio.sh start
```

### **Mise à jour des images :**
```bash
# Reconstruire les images
docker-compose -f docker-compose.photo-portfolio.yml build --no-cache

# Redémarrer avec les nouvelles images
docker-compose -f docker-compose.photo-portfolio.yml up -d
```

## 📝 Notes importantes

### **Avantages de Docker :**
- ✅ **Isolation** : Environnement cohérent
- ✅ **Portabilité** : Fonctionne partout
- ✅ **Scalabilité** : Facile à étendre
- ✅ **Maintenance** : Gestion simplifiée
- ✅ **Déploiement** : Processus automatisé

### **Considérations :**
- 🔄 **Apprentissage** : Courbe d'apprentissage Docker
- 💾 **Ressources** : Consommation mémoire/CPU
- 🔧 **Debugging** : Plus complexe qu'en local
- 📦 **Taille** : Images Docker volumineuses

---

## 🎯 Prochaines étapes

1. **Tester le déploiement** : `./deploy-docker-photo-portfolio.sh start`
2. **Configurer les variables** : Éditer `.env.local`
3. **Tester l'application** : `http://localhost:3001`
4. **Configurer HTTPS** : Si nécessaire
5. **Monitoring** : Configurer les alertes

**🚀 Votre Portfolio Photo IA est maintenant containerisé et prêt pour la production !**
