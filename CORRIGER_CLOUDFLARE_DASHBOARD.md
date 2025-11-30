# 🔧 Corriger Cloudflare Dashboard - consoles.regispailler.fr

## 🎯 Objectif

Corriger la configuration de `consoles.regispailler.fr` dans Cloudflare Dashboard pour résoudre l'erreur 1033.

## 📋 Accès au Dashboard

**Lien direct** : https://one.dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/networks/connectors

## 🔧 Étapes de Correction

### Étape 1 : Accéder aux Tunnels

1. Dans le dashboard Cloudflare, allez dans **"Networks"** → **"Connectors"** (ou "Tunnels")
2. Trouvez votre tunnel : **`iahome-new`**
3. **Cliquez** sur le nom du tunnel pour l'ouvrir

### Étape 2 : Configurer Public Hostnames

1. Cliquez sur l'onglet **"Public Hostnames"** (ou "Noms d'hôtes publics")
2. **Trouvez** la ligne pour `consoles.regispailler.fr`
3. **Cliquez** sur cette ligne pour l'éditer (ou cliquez sur le bouton "Edit")

### Étape 3 : Modifier la Configuration

**Configuration à appliquer :**

- **Subdomain** : `consoles`
- **Domain** : `regispailler.fr`
- **Service** : `http://192.168.1.150:80` ⚠️ **IMPORTANT : Port 80 (Traefik)**
- **Path** : (laissez **VIDE** - ne mettez rien)
- **HTTP Host Header** : `consoles.regispailler.fr` (optionnel)

### Étape 4 : Sauvegarder

1. **Cliquez sur** : **"Save"** (Sauvegarder)
2. **Attendez** 1-2 minutes pour que les changements prennent effet
3. Le service Cloudflare Tunnel se reconnectera automatiquement

## ✅ Vérification

Après avoir modifié la configuration :

1. **Attendez 1-2 minutes**
2. **Testez** : https://consoles.regispailler.fr/api/health
3. **Devrait retourner** : `{"success":true,"message":"Backend opérationnel",...}`

## 🔍 Pourquoi le port 80 ?

- Le port 80 est **Traefik** (reverse proxy)
- Traefik route automatiquement :
  - `/api/*` → Backend (port 5001)
  - `/*` → Frontend (port 5000)
- C'est la configuration recommandée pour un routage propre

## 🆘 Si ça ne fonctionne pas

### Vérifier que Traefik fonctionne

1. Vérifiez que Traefik est démarré :
   ```powershell
   docker ps | findstr traefik
   ```

2. Testez Traefik localement :
   ```powershell
   curl http://192.168.1.150:80
   ```

### Redémarrer Cloudflare Tunnel

1. **Double-cliquez sur** : `restart-cloudflare.bat`
2. Attendez 30 secondes
3. Testez à nouveau

### Vérifier les services locaux

1. Vérifiez que les services consoles sont démarrés :
   ```powershell
   .\start-all-services.ps1 -Status
   ```

2. Si nécessaire, démarrez-les :
   ```powershell
   .\start-all-services.ps1
   ```

## 📝 Configuration Correcte (Résumé)

```
Subdomain: consoles
Domain: regispailler.fr
Service: http://192.168.1.150:80
Path: (vide)
```

## ✅ Après Correction

Une fois la configuration corrigée dans Cloudflare Dashboard :
- ✅ Cloudflare Tunnel se reconnectera automatiquement
- ✅ Pas besoin de redémarrer quoi que ce soit
- ✅ L'erreur 1033 disparaîtra
- ✅ Tout fonctionnera correctement

## 🎯 Checklist

- [ ] Accéder au dashboard Cloudflare
- [ ] Trouver le tunnel `iahome-new`
- [ ] Ouvrir "Public Hostnames"
- [ ] Modifier `consoles.regispailler.fr`
- [ ] Changer le Service en : `http://192.168.1.150:80`
- [ ] Laisser le Path vide
- [ ] Sauvegarder
- [ ] Attendre 1-2 minutes
- [ ] Tester : https://consoles.regispailler.fr/api/health
