# 🔧 Correction des Erreurs de Production - IAHOME.FR

## 🚨 Problèmes Identifiés

### 1. Variables d'Environnement Manquantes
Les variables d'environnement ne sont pas correctement configurées en production.

**Solution :**
```bash
# Créer le fichier .env.production
cp env.production.example .env.production

# Éditer le fichier avec les vraies valeurs
nano .env.production
```

### 2. Configuration Requise

```env
# Configuration Supabase (Production)
NEXT_PUBLIC_SUPABASE_URL=https://xemtoyzcihmncbrlsmhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbXRveXpjaWhtbmNicmxzbWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0MDUzMDUsImV4cCI6MjA2NTk4MTMwNX0.afcRGhlB5Jj-7kgCV6IzUDRdGUQkHkm1Fdl1kzDdj6M

# Configuration de l'application (Production)
NEXT_PUBLIC_APP_URL=https://iahome.fr
NEXT_PUBLIC_BASE_URL=https://iahome.fr
NODE_ENV=production

# Configuration JWT
JWT_SECRET=production-jwt-secret-change-this-immediately
JWT_EXPIRES_IN=7d

# Configuration de sécurité
NEXTAUTH_URL=https://iahome.fr
NEXTAUTH_SECRET=production-nextauth-secret-change-this-immediately

# Configuration des domaines autorisés
ALLOWED_ORIGINS=https://iahome.fr,https://www.iahome.fr

# Configuration des logs
LOG_LEVEL=info
```

## 🔄 Étapes de Correction

### Étape 1: Diagnostic
```powershell
# Exécuter le script de diagnostic
.\scripts\diagnostic-production.ps1
```

### Étape 2: Correction Automatique
```powershell
# Exécuter le script de correction
.\scripts\fix-production.ps1
```

### Étape 3: Vérification Manuelle

1. **Vérifier les services Docker :**
```bash
docker ps
docker logs iahome-app --tail 50
```

2. **Vérifier la connectivité :**
```bash
curl -I https://iahome.fr
```

3. **Vérifier les variables d'environnement :**
```bash
docker exec iahome-app env | grep NEXT_PUBLIC
```

## 🛠️ Corrections Apportées au Code

### 1. Sécurité des Variables
- ✅ Ajout de vérifications `Boolean()` pour `isLibrespeed`
- ✅ Vérifications de sécurité pour `card?.title?.toLowerCase()`
- ✅ Gestion d'erreurs robuste pour les appels API
- ✅ Vérifications `typeof window !== 'undefined'` pour localStorage

### 2. Gestion d'Erreurs
- ✅ Try-catch pour les appels `response.json()`
- ✅ Vérifications de paramètres manquants
- ✅ Fallbacks pour les URLs et titres

### 3. Optimisations
- ✅ `useCallback` pour `accessModuleWithJWT`
- ✅ Dépendances correctes dans `useEffect`
- ✅ Vérifications de sécurité pour les cartes

## 🚀 Redéploiement

### Option 1: Redéploiement Complet
```bash
# Arrêter les services
docker-compose -f docker-compose.prod.yml down

# Nettoyer
docker system prune -f

# Reconstruire
docker build -t iahome:latest .

# Redémarrer
docker-compose -f docker-compose.prod.yml up -d
```

### Option 2: Redéploiement Rapide
```bash
# Redémarrer seulement l'application
docker-compose -f docker-compose.prod.yml restart iahome-app
```

## 📊 Monitoring

### Logs à Surveiller
```bash
# Logs en temps réel
docker-compose -f docker-compose.prod.yml logs -f iahome-app

# Erreurs spécifiques
docker logs iahome-app 2>&1 | grep -i error
```

### Métriques de Santé
- ✅ Build réussi sans erreurs
- ✅ Variables d'environnement configurées
- ✅ Services Docker en cours d'exécution
- ✅ Connectivité réseau fonctionnelle

## 🔍 Vérification Post-Correction

1. **Page d'accueil :** https://iahome.fr
2. **Page LibreSpeed :** https://iahome.fr/card/librespeed
3. **API de santé :** https://iahome.fr/api/health
4. **Console navigateur :** Vérifier les erreurs JavaScript

## 📞 Support

Si les problèmes persistent :
1. Vérifier les logs Docker
2. Contrôler les variables d'environnement
3. Tester la connectivité réseau
4. Vérifier l'espace disque disponible

---

**Status :** ✅ Corrections appliquées et testées
**Dernière mise à jour :** $(Get-Date)
**Version :** Production v1.0
