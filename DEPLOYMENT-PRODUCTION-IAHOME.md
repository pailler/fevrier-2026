# 🚀 Déploiement Production iahome.fr

## 📋 Prérequis

- Docker et Docker Compose installés
- Domaine `iahome.fr` configuré et pointant vers le serveur
- Ports 80, 443, 3000, 8080-8086 ouverts
- PowerShell (pour les scripts Windows)

## 🔧 Configuration

### 1. Variables d'environnement

Éditez le fichier `env.production.local` avec vos vraies clés API :

```bash
# Stripe (obligatoire pour les paiements)
STRIPE_SECRET_KEY=sk_live_votre_cle_secrete
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_votre_cle_publique

# Email (obligatoire pour les notifications)
RESEND_API_KEY=re_votre_cle_resend

# OpenAI (optionnel pour le chat IA)
OPENAI_API_KEY=sk-votre_cle_openai
```

### 2. Configuration DNS

Assurez-vous que votre domaine pointe vers le serveur :
- `iahome.fr` → IP du serveur
- `www.iahome.fr` → IP du serveur

## 🚀 Déploiement

### Option 1: Script automatique (recommandé)

```powershell
# Déployer l'application principale
.\deploy-production.ps1

# Déployer les services externes (optionnel)
.\deploy-services.ps1
```

### Option 2: Commandes manuelles

```bash
# 1. Arrêter les services existants
docker-compose -f docker-compose.prod.yml down

# 2. Nettoyer
docker system prune -f

# 3. Créer les dossiers
mkdir -p logs letsencrypt

# 4. Construire et démarrer
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Vérifier le statut
docker-compose -f docker-compose.prod.yml ps
```

## 🌐 Services déployés

### Application principale
- **URL**: https://iahome.fr
- **Port local**: 3000
- **Dashboard Traefik**: http://localhost:8080

### Services externes (optionnels)
- **Stirling-PDF**: http://localhost:8081
- **MeTube**: http://localhost:8082
- **LibreSpeed**: http://localhost:8083
- **PSITransfer**: http://localhost:8084
- **Polr (QRCode)**: http://localhost:8086

## 🔍 Monitoring

### Vérifier les logs
```bash
# Logs de l'application
docker-compose -f docker-compose.prod.yml logs iahome-app -f

# Logs de Traefik
docker-compose -f docker-compose.prod.yml logs traefik -f

# Logs des services externes
cd docker-services
docker-compose -f docker-compose.services.yml logs -f
```

### Vérifier la santé des services
```bash
# Statut des conteneurs
docker-compose -f docker-compose.prod.yml ps

# Healthcheck
docker-compose -f docker-compose.prod.yml exec iahome-app wget -qO- http://localhost:3000/api/health
```

## 🔧 Maintenance

### Mise à jour de l'application
```bash
# Pull des dernières modifications
git pull origin main

# Redéployer
.\deploy-production.ps1
```

### Sauvegarde
```bash
# Sauvegarder les données
docker-compose -f docker-compose.prod.yml exec iahome-app tar -czf /app/backup-$(date +%Y%m%d).tar.gz /app/data
```

### Restauration
```bash
# Restaurer les données
docker-compose -f docker-compose.prod.yml exec iahome-app tar -xzf /app/backup-YYYYMMDD.tar.gz -C /
```

## 🛠️ Dépannage

### Problèmes courants

1. **Certificat SSL non généré**
   ```bash
   # Vérifier les logs Traefik
   docker-compose -f docker-compose.prod.yml logs traefik | grep -i acme
   ```

2. **Application non accessible**
   ```bash
   # Vérifier les logs de l'application
   docker-compose -f docker-compose.prod.yml logs iahome-app
   
   # Vérifier la connectivité
   curl -I http://localhost:3000
   ```

3. **Ports déjà utilisés**
   ```bash
   # Vérifier les ports utilisés
   netstat -ano | findstr :3000
   netstat -ano | findstr :80
   netstat -ano | findstr :443
   ```

### Commandes utiles

```bash
# Redémarrer un service
docker-compose -f docker-compose.prod.yml restart iahome-app

# Reconstruire un service
docker-compose -f docker-compose.prod.yml up -d --build iahome-app

# Accéder au conteneur
docker-compose -f docker-compose.prod.yml exec iahome-app sh

# Nettoyer complètement
docker-compose -f docker-compose.prod.yml down -v
docker system prune -a -f
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs avec les commandes ci-dessus
2. Consultez la documentation Docker et Traefik
3. Vérifiez la configuration DNS et les ports
4. Contactez l'équipe de développement

## 🔒 Sécurité

- Les certificats SSL sont automatiquement générés par Let's Encrypt
- Les en-têtes de sécurité sont configurés via Traefik
- L'application utilise un utilisateur non-root dans Docker
- Les secrets sont stockés dans des variables d'environnement

---

**Dernière mise à jour**: $(Get-Date -Format "yyyy-MM-dd")
