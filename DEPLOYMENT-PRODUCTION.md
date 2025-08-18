# 🚀 Guide de Déploiement en Production - IAHOME.FR

## 📋 Prérequis

### 1. **Configuration DNS**
- Domaine `iahome.fr` pointant vers votre serveur
- Certificat SSL configuré (géré automatiquement par Traefik)

### 2. **Variables d'Environnement**
Créer le fichier `.env.production` avec la configuration suivante :

```bash
# Configuration Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://xemtoyzcihmncbrlsmhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuration Stripe (Production)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Configuration de l'application (Production) - IAHOME.FR
NEXT_PUBLIC_APP_URL=https://iahome.fr
NEXT_PUBLIC_BASE_URL=https://iahome.fr
NODE_ENV=production

# Configuration de sécurité
NEXTAUTH_URL=https://iahome.fr
NEXTAUTH_SECRET=votre-secret-tres-securise
ALLOWED_ORIGINS=https://iahome.fr,https://www.iahome.fr

# Autres configurations...
```

## 🔧 Déploiement

### **Option 1 : Script Automatique (Recommandé)**

```powershell
# Exécuter le script de déploiement
.\scripts\deploy-production.ps1
```

### **Option 2 : Commandes Manuelles**

```bash
# 1. Arrêter les conteneurs existants
docker-compose -f docker-compose.prod.yml down

# 2. Nettoyer les images obsolètes
docker system prune -f

# 3. Reconstruire l'image
docker build -t iahome:latest .

# 4. Démarrer en mode production
docker-compose -f docker-compose.prod.yml up -d

# 5. Vérifier le statut
docker-compose -f docker-compose.prod.yml ps
```

## 🌐 Configuration Traefik

### **Fichier : `traefik/traefik-nas.yml`**

```yaml
services:
  iahome-app:
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=https://iahome.fr
      - NEXTAUTH_URL=https://iahome.fr
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.iahome.rule=Host(`iahome.fr`) || Host(`www.iahome.fr`)"
      - "traefik.http.routers.iahome.entrypoints=websecure"
      - "traefik.http.routers.iahome.tls.certresolver=letsencrypt"
```

## 🔍 Vérification du Déploiement

### **1. Vérifier les Conteneurs**
```bash
docker-compose -f docker-compose.prod.yml ps
```

### **2. Vérifier les Logs**
```bash
docker-compose -f docker-compose.prod.yml logs -f iahome-app
```

### **3. Tester l'Application**
- **URL principale** : https://iahome.fr
- **API Health** : https://iahome.fr/api/health
- **Page d'accueil** : https://iahome.fr

## 🛠️ Outils de Diagnostic

### **Page de Debug**
- **URL** : https://iahome.fr/debug-payment
- **Fonction** : Diagnostiquer les problèmes de paiement et d'activation de modules

### **API de Debug**
- **Endpoint** : `/api/debug-payment`
- **Fonction** : Vérifier l'état des paiements et des modules

### **Force Activation**
- **Endpoint** : `/api/force-activate-module`
- **Fonction** : Activer manuellement un module en cas de problème

## 🔧 Configuration des Webhooks Stripe

### **URL du Webhook**
```
https://iahome.fr/api/webhooks/stripe
```

### **Événements à Configurer**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `invoice.payment_succeeded`

## 📊 Monitoring

### **Logs en Temps Réel**
```bash
# Suivre les logs de l'application
docker-compose -f docker-compose.prod.yml logs -f iahome-app

# Suivre les logs Traefik
docker-compose -f docker-compose.prod.yml logs -f traefik
```

### **Statut des Services**
```bash
# Vérifier le statut de tous les services
docker-compose -f docker-compose.prod.yml ps

# Vérifier l'utilisation des ressources
docker stats
```

## 🚨 Dépannage

### **Problème : Application non accessible**
```bash
# 1. Vérifier les conteneurs
docker-compose -f docker-compose.prod.yml ps

# 2. Vérifier les logs
docker-compose -f docker-compose.prod.yml logs iahome-app

# 3. Redémarrer l'application
docker-compose -f docker-compose.prod.yml restart iahome-app
```

### **Problème : Certificat SSL**
```bash
# Vérifier les certificats Traefik
docker-compose -f docker-compose.prod.yml logs traefik | grep -i cert
```

### **Problème : Paiements non traités**
1. Aller sur https://iahome.fr/debug-payment
2. Entrer l'email de l'utilisateur
3. Vérifier les paiements et modules
4. Utiliser la force activation si nécessaire

## 🔄 Mise à Jour

### **Mise à Jour de l'Application**
```bash
# 1. Arrêter l'application
docker-compose -f docker-compose.prod.yml down

# 2. Reconstruire l'image
docker build -t iahome:latest .

# 3. Redémarrer
docker-compose -f docker-compose.prod.yml up -d
```

### **Mise à Jour de la Configuration**
```bash
# 1. Modifier .env.production
# 2. Redémarrer l'application
docker-compose -f docker-compose.prod.yml restart iahome-app
```

## 📞 Support

En cas de problème :
1. **Vérifier les logs** : `docker-compose -f docker-compose.prod.yml logs iahome-app`
2. **Utiliser la page de debug** : https://iahome.fr/debug-payment
3. **Vérifier la santé** : https://iahome.fr/api/health

---

**🌐 Application accessible sur : https://iahome.fr**






