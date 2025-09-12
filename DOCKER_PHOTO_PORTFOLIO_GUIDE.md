# 🐳 Guide Docker - Photo Portfolio IA iAhome

## 📋 Vue d'ensemble

Ce guide explique comment déployer l'application Photo Portfolio IA en utilisant Docker et Docker Compose.

## 🏗️ Architecture Docker

### **Services inclus :**

1. **photo-portfolio-app** : Application Next.js
2. **redis** : Cache et sessions
3. **nginx** : Reverse proxy et serveur web

### **Ports utilisés :**
- **3001** : Application Next.js (externe)
- **80** : Nginx HTTP
- **443** : Nginx HTTPS
- **6379** : Redis

## 📁 Fichiers de Configuration

### **Dockerfile.photo-portfolio**
- Image de base : Node.js 18 Alpine
- Build multi-étapes pour optimisation
- Utilisateur non-root pour la sécurité
- Configuration de production

### **docker-compose.photo-portfolio.yml**
- Orchestration des services
- Volumes persistants
- Réseau isolé
- Health checks

### **nginx/photo-portfolio.conf**
- Configuration reverse proxy
- SSL/TLS
- Headers de sécurité
- Cache des assets statiques

## 🚀 Déploiement

### **Prérequis :**
- Docker Desktop installé
- Docker Compose installé
- Fichier `.env.local` configuré

### **Déploiement automatique :**

#### **Linux/macOS :**
```bash
chmod +x deploy-photo-portfolio-docker.sh
./deploy-photo-portfolio-docker.sh
```

#### **Windows :**
```powershell
.\deploy-photo-portfolio-docker.ps1
```

### **Déploiement manuel :**

1. **Construire les images :**
```bash
docker-compose -f docker-compose.photo-portfolio.yml build
```

2. **Démarrer les services :**
```bash
docker-compose -f docker-compose.photo-portfolio.yml up -d
```

3. **Vérifier le statut :**
```bash
docker-compose -f docker-compose.photo-portfolio.yml ps
```

## 🔧 Configuration

### **Variables d'environnement (.env.local) :**
```env
# Configuration Photo Portfolio IA
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

### **Configuration Nginx :**
- SSL/TLS activé
- Headers de sécurité
- Cache des assets
- Upload jusqu'à 50MB

## 📊 Monitoring et Maintenance

### **Commandes utiles :**

#### **Voir les logs :**
```bash
# Tous les services
docker-compose -f docker-compose.photo-portfolio.yml logs -f

# Service spécifique
docker-compose -f docker-compose.photo-portfolio.yml logs -f photo-portfolio-app
```

#### **Redémarrer un service :**
```bash
docker-compose -f docker-compose.photo-portfolio.yml restart photo-portfolio-app
```

#### **Arrêter les services :**
```bash
docker-compose -f docker-compose.photo-portfolio.yml down
```

#### **Mise à jour :**
```bash
docker-compose -f docker-compose.photo-portfolio.yml pull
docker-compose -f docker-compose.photo-portfolio.yml up -d
```

### **Health Checks :**
- **Application** : `http://localhost:3001/health`
- **Redis** : `docker exec photo-portfolio-redis redis-cli ping`
- **Nginx** : `http://localhost/health`

## 🔒 Sécurité

### **Mesures implémentées :**
- Utilisateur non-root dans les conteneurs
- Réseau isolé
- Headers de sécurité Nginx
- SSL/TLS obligatoire
- Validation des uploads

### **Recommandations :**
- Utiliser des certificats SSL valides
- Configurer un firewall
- Surveiller les logs
- Mettre à jour régulièrement

## 📈 Performance

### **Optimisations :**
- Build multi-étapes pour réduire la taille
- Cache des assets statiques
- Compression gzip
- Images Alpine Linux

### **Monitoring :**
- Logs centralisés
- Health checks automatiques
- Métriques de performance
- Alertes de santé

## 🛠️ Développement

### **Mode développement :**
```bash
# Démarrer en mode dev
docker-compose -f docker-compose.photo-portfolio.yml up --build

# Accéder au conteneur
docker exec -it photo-portfolio-app sh
```

### **Debugging :**
```bash
# Logs détaillés
docker-compose -f docker-compose.photo-portfolio.yml logs --tail=100 -f

# Statut des conteneurs
docker-compose -f docker-compose.photo-portfolio.yml ps

# Ressources utilisées
docker stats
```

## 🚨 Dépannage

### **Problèmes courants :**

#### **Port déjà utilisé :**
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3001
netstat -tulpn | grep :80

# Arrêter les services conflictuels
sudo systemctl stop nginx
```

#### **Erreur de build :**
```bash
# Nettoyer et rebuilder
docker-compose -f docker-compose.photo-portfolio.yml down
docker system prune -f
docker-compose -f docker-compose.photo-portfolio.yml build --no-cache
```

#### **Problème de permissions :**
```bash
# Vérifier les permissions
ls -la nginx/photo-portfolio.conf
chmod 644 nginx/photo-portfolio.conf
```

### **Logs d'erreur :**
```bash
# Logs d'erreur Nginx
docker logs photo-portfolio-nginx

# Logs d'erreur Application
docker logs photo-portfolio-app

# Logs d'erreur Redis
docker logs photo-portfolio-redis
```

## 📋 Checklist de Déploiement

### **Avant le déploiement :**
- [ ] Docker Desktop installé
- [ ] Docker Compose installé
- [ ] Fichier .env.local configuré
- [ ] Certificats SSL préparés
- [ ] Ports disponibles

### **Pendant le déploiement :**
- [ ] Build des images réussi
- [ ] Services démarrés
- [ ] Health checks passés
- [ ] Logs sans erreur

### **Après le déploiement :**
- [ ] Application accessible
- [ ] Upload de photos fonctionnel
- [ ] Recherche sémantique opérationnelle
- [ ] Tests de reconnaissance réussis

## 🎉 Conclusion

L'application Photo Portfolio IA est maintenant prête pour le déploiement Docker avec une architecture robuste, sécurisée et scalable.

**Déployez et profitez de votre application Photo Portfolio IA !** 🚀

