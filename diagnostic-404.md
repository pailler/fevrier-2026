# Diagnostic des erreurs 404 - IAHome

## 🔍 Problème identifié

Les erreurs 404 suivantes apparaissent :
- `layout.css?v=1756065658949` - 404
- `main-app.js?v=1756065658949` - 404
- `layout.js` - 404
- `app-pages-internals.js` - 404
- `page.js` - 404

## 🛠️ Solutions

### 1. **Reconstruire l'application**

```bash
# Arrêter les conteneurs
docker-compose -f docker-compose.prod.yml down

# Nettoyer le cache
docker system prune -f

# Reconstruire sans cache
docker-compose -f docker-compose.prod.yml build --no-cache

# Redémarrer
docker-compose -f docker-compose.prod.yml up -d
```

### 2. **Vérifier les fichiers statiques**

```bash
# Vérifier que les fichiers statiques sont présents
docker exec iahome-app ls -la ./.next/static

# Vérifier le contenu du dossier standalone
docker exec iahome-app ls -la ./
```

### 3. **Vérifier la configuration Next.js**

Les modifications apportées à `next.config.ts` :
- Ajout de `assetPrefix` pour la production
- Ajout de `generateBuildId` pour éviter le cache
- Headers de cache pour les assets statiques

### 4. **Vérifier Traefik**

```bash
# Vérifier les logs Traefik
docker logs iahome-traefik

# Vérifier le dashboard Traefik
# Accéder à http://localhost:8080
```

### 5. **Test de l'application**

```bash
# Test de l'API de santé
curl http://localhost:3000/api/health

# Test de la page d'accueil
curl -I http://localhost:3000

# Test avec le domaine
curl -I https://iahome.fr
```

## 🔧 Configuration corrigée

### Next.js Config
- ✅ `assetPrefix` configuré pour la production
- ✅ Headers de cache pour les assets statiques
- ✅ `generateBuildId` pour éviter les conflits de cache

### Dockerfile
- ✅ Copie correcte des fichiers statiques
- ✅ Vérification de la présence des fichiers
- ✅ Permissions correctes

### Traefik
- ✅ Configuration des middlewares de compression
- ✅ Headers de sécurité appropriés
- ✅ Redirection HTTP vers HTTPS

## 📋 Checklist de vérification

- [ ] Docker Desktop est démarré
- [ ] Les conteneurs sont reconstruits sans cache
- [ ] Les fichiers statiques sont présents dans le conteneur
- [ ] Traefik fonctionne correctement
- [ ] Les certificats SSL sont valides
- [ ] L'application répond sur le port 3000
- [ ] Le domaine iahome.fr pointe vers le bon serveur

## 🚀 Script de déploiement

Utiliser le script `deploy-production.sh` pour automatiser le déploiement :

```bash
chmod +x deploy-production.sh
./deploy-production.sh
```

## 📞 Support

Si les problèmes persistent :
1. Vérifier les logs : `docker-compose -f docker-compose.prod.yml logs`
2. Vérifier l'espace disque : `df -h`
3. Vérifier la mémoire : `free -h`
4. Redémarrer Docker Desktop si nécessaire
